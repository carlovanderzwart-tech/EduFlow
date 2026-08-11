/**
 * De opslaglaag (§8.1, §8.2.1, §10.3).
 *
 * Elke schrijfactie loopt hierlangs, en hier alleen. Dat is geen stijlkeuze maar
 * de plek waar zes regels tegelijk waar blijven: sleutels zijn UUIDv7 (INV-01),
 * `rev` telt met precies één op (INV-03), `createdAt` verandert nooit meer,
 * verwijderen is markeren (§8.1.6, INV-02), elk record gaat door zijn Zod-schema
 * (DR-23), en elke wijziging laat één regel na in het journaal (§9.6).
 *
 * **Fouten die de gebruiker aangaan zijn waarden** (§10.3, T-27): een volle
 * opslag levert een `Result` met `STORAGE_FULL`, want daar kan hij iets mee. Een
 * record dat bij het **schrijven** niet door zijn schema komt is iets anders —
 * dat is een fout in de aanroepende code, en die hoort luid te zijn en niet als
 * nette foutwaarde te worden doorgegeven.
 *
 * Bij het **lezen** ligt dat weer anders. Een database van een half jaar oud kan
 * records bevatten die de typen niet meer beschrijven, en dan mag één stuk record
 * niet de hele lijst breken (§6.1.1). Zo'n record wordt overgeslagen en gemeld via
 * `onLeesfout`; de service erboven toont de rij als onleesbaar.
 */

import type { AppError, Result } from "@/lib/result";
import { toIsoDateTime } from "@/lib/dates";
import { newId, type Uuid } from "@/lib/uuid";
import type { BaseRecord, ChangeLogEntry, ChangeOperation } from "@/domain/types";
import { CURRENT_SCHEMA_VERSION } from "@/domain/schemas";

import { CHANGELOG_MAX, type EduFlowDatabase } from "./db";
import { BROWSERSCHATTING, meetOpslag, type Opslaggebruik, type Schatter } from "./gebruik";
import { TABELLEN, type RecordVan, type TabelNaam } from "./tabellen";

export { OPSLAGDREMPEL, type Opslaggebruik } from "./gebruik";

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
  action: { label: "Ruim opslag op", kind: "navigate", target: "/instellingen" },
};

/** Een volle opslag meldt zich bij elke browser anders; alleen de naam is gelijk. */
function isVol(fout: unknown): boolean {
  const naam = fout instanceof Error ? fout.name : "";
  return naam === "QuotaExceededError" || naam === "NotEnoughSpaceError";
}

function mislukt(fout: unknown): Result<never> {
  if (isVol(fout)) return { ok: false, error: VOL };
  throw fout;
}

export function createStorageService(deps: StorageDeps) {
  const { db, clock, origin } = deps;

  function nu(): string {
    return toIsoDateTime(clock.now());
  }

  /**
   * Eén regel in het journaal per gewijzigd aggregaat (§9.6, B-24).
   *
   * De ringbuffer wordt hier ingekort en niet door een opruimtaak: dan kan hij
   * niet ongemerkt doorgroeien tussen twee opruimrondes door.
   */
  async function journaal(table: TabelNaam, record: BaseRecord, op: ChangeOperation) {
    const regel: ChangeLogEntry = {
      table,
      recordId: record.id,
      rev: record.rev,
      op,
      at: nu(),
      origin,
    };
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
   * Werpt bij een fout. Dat is met opzet: onjuiste gegevens aanleveren is een
   * fout in de code erboven, geen toestand waar de gebruiker iets mee kan.
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

  async function create<Naam extends TabelNaam>(
    tabel: Naam,
    invoer: Nieuw<Naam>,
  ): Promise<Result<RecordVan<Naam>>> {
    // Buiten de transactie, zodat een schemafout onverpakt bij de aanroeper komt.
    const record = nieuwRecord(tabel, invoer);

    try {
      await db.transaction("rw", db[tabel], db.changeLog, async () => {
        await db[tabel].add(record as never);
        await journaal(tabel, record as BaseRecord, "create");
      });
      return { ok: true, value: record };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  async function read<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
  ): Promise<Result<RecordVan<Naam> | null>> {
    try {
      const ruw = await db[tabel].get(id);
      if (!ruw) return { ok: true, value: null };

      const record = gelezen(tabel, ruw);
      // Verwijderde records komen in geen enkele lijst voor (INV-02); wie ze wil
      // zien vraagt er uitdrukkelijk om met `listDeleted`.
      if (record && (record as BaseRecord).deletedAt !== null) return { ok: true, value: null };
      return { ok: true, value: record };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  async function alle<Naam extends TabelNaam>(
    tabel: Naam,
    verwijderd: boolean,
  ): Promise<Result<RecordVan<Naam>[]>> {
    try {
      const ruwe = await db[tabel].toArray();
      const records: RecordVan<Naam>[] = [];
      for (const ruw of ruwe) {
        const record = gelezen(tabel, ruw);
        if (!record) continue;
        const isWeg = (record as BaseRecord).deletedAt !== null;
        if (isWeg === verwijderd) records.push(record);
      }
      return { ok: true, value: records };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  /** Alles wat bestaat. Het filter op `deletedAt` zit hier en niet bij de aanroeper (§8.1.6). */
  const list = <Naam extends TabelNaam>(tabel: Naam) => alle(tabel, false);

  /** Wat in de prullenbak staat. Alleen wie er uitdrukkelijk om vraagt, krijgt het. */
  const listDeleted = <Naam extends TabelNaam>(tabel: Naam) => alle(tabel, true);

  async function update<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
    wijziging: Partial<Nieuw<Naam>>,
  ): Promise<Result<RecordVan<Naam>>> {
    try {
      const bijgewerkt = await db.transaction("rw", db[tabel], db.changeLog, async () => {
        const record = await werkBijRecord(tabel, id, wijziging);
        await journaal(tabel, record as BaseRecord, "update");
        return record;
      });
      return { ok: true, value: bijgewerkt };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  /**
   * Verwijderen is markeren (§8.1.6, INV-02).
   *
   * Er is met opzet geen `delete()`. Zonder markering is een verwijderd record in
   * fase 2 niet te onderscheiden van een record dat het andere apparaat nog nooit
   * heeft gezien, en dan herstelt de synchronisatie hem netjes weer.
   */
  async function softDelete<Naam extends TabelNaam>(
    tabel: Naam,
    id: Uuid,
  ): Promise<Result<RecordVan<Naam>>> {
    try {
      const gemarkeerd = await db.transaction("rw", db[tabel], db.changeLog, async () => {
        const record = await werkBijRecord(tabel, id, { deletedAt: nu() });
        await journaal(tabel, record as BaseRecord, "delete");
        return record;
      });
      return { ok: true, value: gemarkeerd };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  /**
   * Eén aggregaat, één transactie, één journaalregel (§10.7, §9.4 regel A, §9.6).
   *
   * Een documentatie met haar pagina's opslaan is geen reeks schrijfacties die
   * toevallig na elkaar komen; het is er één. Mislukt hij halverwege, dan is er
   * niets veranderd — anders bestaat er een documentatie zonder pagina en breekt
   * INV-08 bij de eerstvolgende leesactie.
   *
   * De wortel draagt het journaal, want §9.6 schrijft één regel per **aggregaat**
   * voor, met de wortelsleutel. Daarom moet er aan de wortel geschreven zijn: zijn
   * `rev` is de versie van het geheel, en daar leunt §10.8 op bij twee tabbladen.
   */
  async function schrijfAggregaat<Uitkomst>(
    wortel: TabelNaam,
    overige: readonly TabelNaam[],
    werk: (schrijver: Aggregaatschrijver) => Promise<Uitkomst>,
  ): Promise<Result<Uitkomst>> {
    // Een lijst en geen losse variabele: TypeScript versmalt een `let` die alleen
    // binnen een callback wordt gezet niet betrouwbaar.
    const wortelregels: { record: BaseRecord; op: ChangeOperation }[] = [];

    function onthoud(tabel: TabelNaam, record: BaseRecord, op: ChangeOperation) {
      if (tabel !== wortel) return;
      if (wortelregels.length > 0) {
        throw new Error(`De wortel ${wortel} is twee keer geschreven binnen één aggregaat`);
      }
      wortelregels.push({ record, op });
    }

    const schrijver: Aggregaatschrijver = {
      sleutel: newId,
      async maak(tabel, invoer, id) {
        const record = nieuwRecord(tabel, invoer, id);
        await db[tabel].add(record as never);
        onthoud(tabel, record as BaseRecord, "create");
        return record;
      },
      async wijzig(tabel, id, wijziging) {
        const record = await werkBijRecord(tabel, id, wijziging);
        onthoud(tabel, record as BaseRecord, "update");
        return record;
      },
    };

    const stores = [db[wortel], ...overige.map((naam) => db[naam]), db.changeLog];

    try {
      const uitkomst = await db.transaction("rw", stores, async () => {
        const waarde = await werk(schrijver);
        const regel = wortelregels[0];
        if (!regel) throw new Error(`Er is niets aan de wortel ${wortel} geschreven`);
        await journaal(wortel, regel.record, regel.op);
        return waarde;
      });
      return { ok: true, value: uitkomst };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  /**
   * Haalt een record echt weg (§8.1.6).
   *
   * Alleen voor de opruimtaak uit §8.8, voor "definitief wissen" in Instellingen,
   * en voor een verzoek om verwijdering onder de AVG. Nergens anders.
   */
  async function purge<Naam extends TabelNaam>(tabel: Naam, id: Uuid): Promise<Result<void>> {
    try {
      await db[tabel].delete(id);
      return { ok: true, value: undefined };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  async function usage(): Promise<Result<Opslaggebruik>> {
    try {
      return { ok: true, value: await meetOpslag(deps.schatting ?? BROWSERSCHATTING) };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  return {
    create,
    read,
    list,
    listDeleted,
    update,
    softDelete,
    schrijfAggregaat,
    purge,
    usage,
  };
}

export type StorageService = ReturnType<typeof createStorageService>;
