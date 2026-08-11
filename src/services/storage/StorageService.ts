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
import { TABELLEN, type RecordVan, type TabelNaam } from "./tabellen";

/** Een injecteerbare klok, zodat tijdsregels te toetsen zijn (§10.3). */
export interface Clock {
  now(): Date;
}

/** Boven deze verhouding verschijnt de waarschuwing (INV-53, T-09). */
export const OPSLAGDREMPEL = 0.8;

type ZonderBasis<T> = T extends unknown ? Omit<T, keyof BaseRecord> : never;

/** Wat een aanroeper aanlevert: de eigen velden, zonder de zes van `BaseRecord`. */
export type Nieuw<Naam extends TabelNaam> = ZonderBasis<RecordVan<Naam>>;

export interface Opslaggebruik {
  gebruikt: number;
  beschikbaar: number;
  /** Boven `OPSLAGDREMPEL` hoort de waarschuwing te verschijnen. */
  verhouding: number;
  /** `false` als de browser geen schatting geeft; dan is er niets te waarschuwen. */
  bekend: boolean;
}

export interface StorageDeps {
  db: EduFlowDatabase;
  clock: Clock;
  /** Het apparaat-id uit `settings`; elk record draagt het als `origin` (§8.1.4). */
  origin: Uuid;
  /** Een record dat niet meer door zijn schema komt (§6.1.1). */
  onLeesfout?: (tabel: TabelNaam, id: string, reden: string) => void;
  /** Uitgesplitst zodat een toets een volle schijf kan naspelen. */
  schatting?: () => Promise<{ usage?: number; quota?: number } | undefined>;
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

  async function create<Naam extends TabelNaam>(
    tabel: Naam,
    invoer: Nieuw<Naam>,
  ): Promise<Result<RecordVan<Naam>>> {
    const moment = nu();
    const record = gecontroleerd(tabel, {
      ...invoer,
      id: newId(),
      createdAt: moment,
      updatedAt: moment,
      deletedAt: null,
      rev: 1,
      origin,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });

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
      let bijgewerkt: RecordVan<Naam> | undefined;

      await db.transaction("rw", db[tabel], db.changeLog, async () => {
        const bestaand = (await db[tabel].get(id)) as BaseRecord | undefined;
        if (!bestaand) throw new Error(`Geen record ${id} in ${tabel}`);

        bijgewerkt = gecontroleerd(tabel, {
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
        await journaal(tabel, bijgewerkt as BaseRecord, "update");
      });

      return { ok: true, value: bijgewerkt! };
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
      let gemarkeerd: RecordVan<Naam> | undefined;

      await db.transaction("rw", db[tabel], db.changeLog, async () => {
        const bestaand = (await db[tabel].get(id)) as BaseRecord | undefined;
        if (!bestaand) throw new Error(`Geen record ${id} in ${tabel}`);

        const moment = nu();
        gemarkeerd = gecontroleerd(tabel, {
          ...bestaand,
          deletedAt: moment,
          updatedAt: moment,
          rev: bestaand.rev + 1,
          origin,
        });

        await db[tabel].put(gemarkeerd as never);
        await journaal(tabel, gemarkeerd as BaseRecord, "delete");
      });

      return { ok: true, value: gemarkeerd! };
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

  /**
   * Hoeveel opslag er gebruikt is (§9.8, INV-53).
   *
   * Geeft de browser geen schatting, dan is `bekend` onwaar en waarschuwt het
   * scherm niet. Een waarschuwing op een gok is erger dan geen waarschuwing.
   */
  async function usage(): Promise<Result<Opslaggebruik>> {
    const schatten =
      deps.schatting ??
      (() =>
        typeof navigator !== "undefined" && navigator.storage?.estimate
          ? navigator.storage.estimate()
          : Promise.resolve(undefined));

    try {
      const schatting = await schatten();
      const gebruikt = schatting?.usage ?? 0;
      const beschikbaar = schatting?.quota ?? 0;
      return {
        ok: true,
        value: {
          gebruikt,
          beschikbaar,
          verhouding: beschikbaar > 0 ? gebruikt / beschikbaar : 0,
          bekend: beschikbaar > 0,
        },
      };
    } catch (fout) {
      return mislukt(fout);
    }
  }

  return { create, read, list, listDeleted, update, softDelete, purge, usage };
}

export type StorageService = ReturnType<typeof createStorageService>;
