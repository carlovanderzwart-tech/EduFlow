/**
 * De kern van de opslaglaag: de zes regels die altijd waar blijven (§8.1, INV-01 t/m INV-03).
 *
 * Hier staan de typen en de vijf helpers waar elke schrijfweg langs gaat. Ze zijn uit
 * `StorageService` gehaald omdat die fabriek op 264 regels stond — ruim vier keer de
 * grens van DR-53 — en omdat het een eigen onderwerp is: dit bestand bewaakt de
 * invarianten, `StorageService` biedt de handelingen aan.
 *
 * **De splitsing is langs de naad van de verantwoordelijkheid gelegd en niet op de
 * regel waar het te lang werd.** Alles hier raakt `BaseRecord`: sleutels, `rev`,
 * `createdAt`, `updatedAt`, de schemacontrole en het journaal. Niets hier weet van
 * `Result` of van transacties; dat begint één laag hoger.
 */

import type { AppError, Result } from "@/lib/result";
import { toIsoDateTime } from "@/lib/dates";
import { newId, type Uuid } from "@/lib/uuid";
import type { BaseRecord, ChangeLogEntry, ChangeOperation } from "@/domain/types";
import { CURRENT_SCHEMA_VERSION } from "@/domain/schemas";

import { CHANGELOG_MAX, type EduFlowDatabase } from "./db";
import type { Schatter } from "./gebruik";
import { TABELLEN, type RecordVan, type TabelNaam } from "./tabellen";

/** Een injecteerbare klok, zodat tijdsregels te toetsen zijn (§10.3). */
export interface Clock {
  now(): Date;
}

type ZonderBasis<T> = T extends unknown ? Omit<T, keyof BaseRecord> : never;

/** Wat een aanroeper aanlevert: de eigen velden, zonder de zes van `BaseRecord`. */
export type Nieuw<Naam extends TabelNaam> = ZonderBasis<RecordVan<Naam>>;

/**
 * Schrijven binnen één aggregaat (§9.4 regel A).
 *
 * Dezelfde twee handelingen als buiten een aggregaat, met één verschil: ze laten
 * geen journaalregel na. Die schrijft `schrijfAggregaat` één keer, op de wortel.
 */
export interface Aggregaatschrijver {
  /**
   * Een sleutel vooruit, vóór het record bestaat.
   *
   * Nodig omdat de wortel en zijn kinderen naar elkaar verwijzen: §8.4 legt uit dat
   * `Documentation.pageIds` de **volgorde** draagt en `Page.documentationId` de
   * **eigendom**, en dat allebei nodig is. Eén van de twee kent de sleutel van de
   * ander dus voordat die geschreven is.
   *
   * Hij komt hiervandaan en niet uit de service erboven, want §8.1.3 laat sleutels
   * op precies één plek ontstaan.
   */
  sleutel(): Uuid;
  maak<Naam extends TabelNaam>(
    tabel: Naam,
    invoer: Nieuw<Naam>,
    /** Een sleutel uit `sleutel()`. Zonder deze maakt de opslag er zelf een. */
    id?: Uuid,
  ): Promise<RecordVan<Naam>>;
  wijzig<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
    wijziging: Partial<Nieuw<Naam>>,
  ): Promise<RecordVan<Naam>>;
  /**
   * Markeren als verwijderd binnen het aggregaat (`FR-DOC-121`, B-135).
   *
   * Nodig omdat een documentatie en haar pagina's samen weggaan of samen blijven.
   * Buiten een transactie kan het halverwege stoppen, en dan staat er een
   * documentatie in de prullenbak waarvan de pagina's nog leven — of erger,
   * andersom.
   *
   * `deletedAt` staat niet in `Nieuw<>` en is dus niet met `wijzig` te zetten. Dat
   * is geen omissie maar §8.1.6: verwijderen is geen veld dat je invult.
   */
  verwijder<Naam extends TabelNaam>(tabel: Naam, id: Uuid): Promise<RecordVan<Naam>>;
  /** De tegenhanger: terug uit de prullenbak, binnen dezelfde transactie. */
  herstel<Naam extends TabelNaam>(tabel: Naam, id: Uuid): Promise<RecordVan<Naam>>;
}

export interface StorageDeps {
  db: EduFlowDatabase;
  clock: Clock;
  /** Het apparaat-id uit `settings`; elk record draagt het als `origin` (§8.1.4). */
  origin: Uuid;
  /** Een record dat niet meer door zijn schema komt (§6.1.1). */
  onLeesfout?: (tabel: TabelNaam, id: string, reden: string) => void;
  schatting?: Schatter;
}

const VOL: AppError = {
  code: "STORAGE_FULL",
  message: "De opslag op dit apparaat is vol. Je werk staat nog in het scherm.",
  recoverable: true,
  action: { label: "Ruim opslag op", kind: "navigate", target: "/settings" },
};

/** Een volle opslag meldt zich bij elke browser anders; alleen de naam is gelijk. */
function isVol(fout: unknown): boolean {
  const naam = fout instanceof Error ? fout.name : "";
  return naam === "QuotaExceededError" || naam === "NotEnoughSpaceError";
}

/**
 * Een volle opslag wordt een waarde; al het andere wordt geworpen (§10.3, T-27).
 *
 * Geëxporteerd omdat elke handeling in `StorageService` hem gebruikt sinds die naar
 * modulehoogte is verhuisd.
 */
export function mislukt(fout: unknown): Result<never> {
  if (isVol(fout)) return { ok: false, error: VOL };
  throw fout;
}
/**
 * De kern, gebonden aan één database, klok en apparaat.
 *
 * Een object en geen losse functies met een `deps`-argument: deze vijf roepen elkaar
 * aan, en dan is één keer binden leesbaarder dan vijf keer doorgeven.
 */
export interface Kern {
  db: EduFlowDatabase;
  origin: Uuid;
  nu(): string;
  journaal(table: TabelNaam, record: BaseRecord, op: ChangeOperation): Promise<void>;
  gecontroleerd<Naam extends TabelNaam>(tabel: Naam, record: unknown): RecordVan<Naam>;
  gelezen<Naam extends TabelNaam>(tabel: Naam, ruw: unknown): RecordVan<Naam> | null;
  nieuwRecord<Naam extends TabelNaam>(tabel: Naam, invoer: Nieuw<Naam>, id?: Uuid): RecordVan<Naam>;
  werkBijRecord<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
    wijziging: Partial<Nieuw<Naam>> | Pick<BaseRecord, "deletedAt">,
  ): Promise<RecordVan<Naam>>;
}

/**
 * Eén regel in het journaal per gewijzigd aggregaat (§9.6, B-24).
 *
 * De ringbuffer wordt hier ingekort en niet door een opruimtaak: dan kan hij
 * niet ongemerkt doorgroeien tussen twee opruimrondes door.
 */
async function schrijfJournaal(db: EduFlowDatabase, regel: ChangeLogEntry): Promise<void> {
  await db.changeLog.add(regel);

  const aantal = await db.changeLog.count();
  if (aantal > CHANGELOG_MAX) {
    const teveel = aantal - CHANGELOG_MAX;
    const oudste = await db.changeLog.orderBy(":id").limit(teveel).primaryKeys();
    await db.changeLog.bulkDelete(oudste);
  }
}

/**
 * Controleert een record vóór het de opslag in gaat (DR-23).
 *
 * Werpt bij een fout. Dat is met opzet: onjuiste gegevens aanleveren is een fout in
 * de code erboven, geen toestand waar de gebruiker iets mee kan.
 *
 * Zuiver, en daarom op modulehoogte: hij kent de database niet en de klok niet.
 */
function gecontroleerd<Naam extends TabelNaam>(tabel: Naam, record: unknown): RecordVan<Naam> {
  const uitkomst = TABELLEN[tabel].schema.safeParse(record);
  if (!uitkomst.success) {
    throw new Error(
      `Record voor ${tabel} komt niet door zijn schema: ${JSON.stringify(uitkomst.error.issues)}`,
    );
  }
  return uitkomst.data as RecordVan<Naam>;
}

export function maakKern(deps: StorageDeps): Kern {
  const { db, clock, origin } = deps;


  function nu(): string {
    return toIsoDateTime(clock.now());
  }

  /** Eén journaalregel, met de klok en het apparaat van deze kern erin. */
  async function journaal(table: TabelNaam, record: BaseRecord, op: ChangeOperation) {
    await schrijfJournaal(db, { table, recordId: record.id, rev: record.rev, op, at: nu(), origin });
  }

  /** Controleert bij het lezen. Geeft `null` bij een record dat niet meer klopt. */
  function gelezen<Naam extends TabelNaam>(tabel: Naam, ruw: unknown): RecordVan<Naam> | null {
    const uitkomst = TABELLEN[tabel].schema.safeParse(ruw);
    if (uitkomst.success) return uitkomst.data as RecordVan<Naam>;

    const id = typeof ruw === "object" && ruw && "id" in ruw ? String(ruw.id) : "onbekend";
    deps.onLeesfout?.(tabel, id, JSON.stringify(uitkomst.error.issues));
    return null;
  }

  /** Vult de zes basisvelden in en controleert het geheel. Raakt de opslag niet aan. */
  function nieuwRecord<Naam extends TabelNaam>(
    tabel: Naam,
    invoer: Nieuw<Naam>,
    id: Uuid = newId(),
  ): RecordVan<Naam> {
    const moment = nu();
    return gecontroleerd(tabel, {
      ...invoer,
      id,
      createdAt: moment,
      updatedAt: moment,
      deletedAt: null,
      rev: 1,
      origin,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });
  }

  /**
   * Werkt een record bij zonder journaalregel. Alleen binnen een transactie.
   *
   * De grafsteen van `softDelete` staat als tweede tak in het type en niet als
   * doorsnede: `Nieuw<Naam>` laat `deletedAt` juist weg, en over een nog niet
   * opgeloste `Naam` valt een doorsnede van die twee niet te bewijzen.
   */
  async function werkBijRecord<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
    wijziging: Partial<Nieuw<Naam>> | Pick<BaseRecord, "deletedAt">,
  ): Promise<RecordVan<Naam>> {
    const bestaand = (await db[tabel].get(id)) as BaseRecord | undefined;
    if (!bestaand) throw new Error(`Geen record ${id} in ${tabel}`);

    const bijgewerkt = gecontroleerd(tabel, {
      ...bestaand,
      ...wijziging,
      // `createdAt` verandert nooit meer, en `rev` telt met precies één op
      // (§8.1.4, INV-03). Beide staan hier ná de spread, zodat een aanroeper
      // ze niet per ongeluk kan meesturen.
      createdAt: bestaand.createdAt,
      updatedAt: nu(),
      rev: bestaand.rev + 1,
      origin,
    });

    await db[tabel].put(bijgewerkt as never);
    return bijgewerkt;
  }


  return { db, origin, nu, journaal, gecontroleerd, gelezen, nieuwRecord, werkBijRecord };
}
