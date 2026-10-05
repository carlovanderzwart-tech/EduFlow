/**
 * De opslaglaag (§8.1, §8.2.1, §10.3).
 *
 * Elke schrijfactie loopt hierlangs, en hier alleen. Dat is geen stijlkeuze maar
 * de plek waar zes regels tegelijk waar blijven: sleutels zijn UUIDv7 (INV-01),
 * `rev` telt met precies één op (INV-03), `createdAt` verandert nooit meer,
 * verwijderen is markeren (§8.1.6, INV-02), elk record gaat door zijn Zod-schema
 * (DR-23), en elke wijziging laat één regel na in het journaal (§9.6).
 *
 * Die zes regels zelf staan in `kern.ts`; dit bestand biedt de handelingen aan.
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
 *
 * **Elke handeling staat op modulehoogte en krijgt de kern mee.** De fabriek stond
 * op 264 regels — ruim vier keer de grens van DR-53 — doordat alles een afsluiting
 * was over `db`, `clock` en `origin`. Nu is de fabriek de bedrading en verder niets,
 * en is elke handeling op zichzelf te lezen. Dezelfde vorm als `BackupService`.
 */

import type { Result } from "@/lib/result";
import { newId, type Uuid } from "@/lib/uuid";
import type { BaseRecord, ChangeOperation } from "@/domain/types";

import { BROWSERSCHATTING, meetOpslag, type Opslaggebruik } from "./gebruik";
import {
  maakKern,
  mislukt,
  type Aggregaatschrijver,
  type Kern,
  type Nieuw,
  type StorageDeps,
} from "./kern";
import { type RecordVan, type TabelNaam } from "./tabellen";

export { OPSLAGDREMPEL, type Opslaggebruik } from "./gebruik";
export type { Aggregaatschrijver, Clock, Nieuw, StorageDeps } from "./kern";

async function create<Naam extends TabelNaam>(
  kern: Kern,
  tabel: Naam,
  invoer: Nieuw<Naam>,
): Promise<Result<RecordVan<Naam>>> {
  // Buiten de transactie, zodat een schemafout onverpakt bij de aanroeper komt.
  const record = kern.nieuwRecord(tabel, invoer);

  try {
    await kern.db.transaction("rw", kern.db[tabel], kern.db.changeLog, async () => {
      await kern.db[tabel].add(record as never);
      await kern.journaal(tabel, record as BaseRecord, "create");
    });
    return { ok: true, value: record };
  } catch (fout) {
    return mislukt(fout);
  }
}

async function read<Naam extends TabelNaam>(
  kern: Kern,
  tabel: Naam,
  id: Uuid,
): Promise<Result<RecordVan<Naam> | null>> {
  try {
    const ruw = await kern.db[tabel].get(id);
    if (!ruw) return { ok: true, value: null };

    const record = kern.gelezen(tabel, ruw);
    // Verwijderde records komen in geen enkele lijst voor (INV-02); wie ze wil
    // zien vraagt er uitdrukkelijk om met `listDeleted`.
    if (record && (record as BaseRecord).deletedAt !== null) return { ok: true, value: null };
    return { ok: true, value: record };
  } catch (fout) {
    return mislukt(fout);
  }
}

async function alle<Naam extends TabelNaam>(
  kern: Kern,
  tabel: Naam,
  verwijderd: boolean,
): Promise<Result<RecordVan<Naam>[]>> {
  try {
    const ruwe = await kern.db[tabel].toArray();
    const records: RecordVan<Naam>[] = [];
    for (const ruw of ruwe) {
      const record = kern.gelezen(tabel, ruw);
      if (!record) continue;
      const isWeg = (record as BaseRecord).deletedAt !== null;
      if (isWeg === verwijderd) records.push(record);
    }
    return { ok: true, value: records };
  } catch (fout) {
    return mislukt(fout);
  }
}

/**
 * Eén wijziging binnen één transactie, met zijn journaalregel.
 *
 * `update`, `softDelete` en `herstel` deden alle drie precies dit en verschilden
 * alleen in wát ze aan het record veranderen en hoe dat in het journaal heet.
 */
async function geschreven<Naam extends TabelNaam>(
  kern: Kern,
  tabel: Naam,
  id: Uuid,
  wijziging: Partial<Nieuw<Naam>> | Pick<BaseRecord, "deletedAt">,
  op: ChangeOperation,
): Promise<Result<RecordVan<Naam>>> {
  try {
    const bijgewerkt = await kern.db.transaction("rw", kern.db[tabel], kern.db.changeLog, async () => {
      const record = await kern.werkBijRecord(tabel, id, wijziging);
      await kern.journaal(tabel, record as BaseRecord, op);
      return record;
    });
    return { ok: true, value: bijgewerkt };
  } catch (fout) {
    return mislukt(fout);
  }
}

/**
 * Zet een record terug zoals het was (`FR-INS-30`, B-143).
 *
 * De enige schrijfweg die de zes basisvelden **niet** invult of bijwerkt. Bij het
 * terugzetten van een back-up is dat precies wat moet: `id`, `createdAt`,
 * `updatedAt`, `rev` en `origin` komen uit het bestand, want anders is de
 * botsingsregel van `FR-INS-31` — de hoogste `updatedAt` wint — niet uit te voeren
 * en lijkt elk teruggezet record het nieuwste.
 *
 * Het schema controleert nog steeds (DR-23): een back-up van een oudere versie met
 * een veld dat niet meer bestaat komt er niet doorheen, en dat hoort zo.
 */
async function zetTerug<Naam extends TabelNaam>(
  kern: Kern,
  tabel: Naam,
  record: unknown,
): Promise<Result<RecordVan<Naam>>> {
  try {
    const gecheckt = kern.gecontroleerd(tabel, record);
    const bewaard = await kern.db.transaction("rw", kern.db[tabel], kern.db.changeLog, async () => {
      await kern.db[tabel].put(gecheckt as never);
      await kern.journaal(tabel, gecheckt as BaseRecord, "update");
      return gecheckt;
    });
    return { ok: true, value: bewaard };
  } catch (fout) {
    return mislukt(fout);
  }
}

/** De schrijver die `schrijfAggregaat` aan zijn werk meegeeft; laat geen journaal na. */
function aggregaatschrijver(
  kern: Kern,
  onthoud: (tabel: TabelNaam, record: BaseRecord, op: ChangeOperation) => void,
): Aggregaatschrijver {
  return {
    sleutel: newId,
    async maak(tabel, invoer, id) {
      const record = kern.nieuwRecord(tabel, invoer, id);
      await kern.db[tabel].add(record as never);
      onthoud(tabel, record as BaseRecord, "create");
      return record;
    },
    async wijzig(tabel, id, wijziging) {
      const record = await kern.werkBijRecord(tabel, id, wijziging);
      onthoud(tabel, record as BaseRecord, "update");
      return record;
    },
    async verwijder(tabel, id) {
      const record = await kern.werkBijRecord(tabel, id, { deletedAt: kern.nu() });
      onthoud(tabel, record as BaseRecord, "delete");
      return record;
    },
    async herstel(tabel, id) {
      const record = await kern.werkBijRecord(tabel, id, { deletedAt: null });
      onthoud(tabel, record as BaseRecord, "update");
      return record;
    },
  };
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
  kern: Kern,
  wortel: TabelNaam,
  overige: readonly TabelNaam[],
  werk: (schrijver: Aggregaatschrijver) => Promise<Uitkomst>,
): Promise<Result<Uitkomst>> {
  // Een lijst en geen losse variabele: TypeScript versmalt een `let` die alleen
  // binnen een callback wordt gezet niet betrouwbaar.
  const wortelregels: { record: BaseRecord; op: ChangeOperation }[] = [];

  const schrijver = aggregaatschrijver(kern, (tabel, record, op) => {
    if (tabel !== wortel) return;
    if (wortelregels.length > 0) {
      throw new Error(`De wortel ${wortel} is twee keer geschreven binnen één aggregaat`);
    }
    wortelregels.push({ record, op });
  });

  const stores = [kern.db[wortel], ...overige.map((naam) => kern.db[naam]), kern.db.changeLog];

  try {
    const uitkomst = await kern.db.transaction("rw", stores, async () => {
      const waarde = await werk(schrijver);
      const regel = wortelregels[0];
      if (!regel) throw new Error(`Er is niets aan de wortel ${wortel} geschreven`);
      await kern.journaal(wortel, regel.record, regel.op);
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
async function purge(kern: Kern, tabel: TabelNaam, id: Uuid): Promise<Result<void>> {
  try {
    await kern.db[tabel].delete(id);
    return { ok: true, value: undefined };
  } catch (fout) {
    return mislukt(fout);
  }
}

export function createStorageService(deps: StorageDeps) {
  const kern = maakKern(deps);

  return {
    create: <Naam extends TabelNaam>(tabel: Naam, invoer: Nieuw<Naam>) =>
      create(kern, tabel, invoer),
    read: <Naam extends TabelNaam>(tabel: Naam, id: Uuid) => read(kern, tabel, id),

    /** Alles wat bestaat. Het filter op `deletedAt` zit hier en niet bij de aanroeper (§8.1.6). */
    list: <Naam extends TabelNaam>(tabel: Naam) => alle(kern, tabel, false),

    /** Wat in de prullenbak staat. Alleen wie er uitdrukkelijk om vraagt, krijgt het. */
    listDeleted: <Naam extends TabelNaam>(tabel: Naam) => alle(kern, tabel, true),

    update: <Naam extends TabelNaam>(tabel: Naam, id: Uuid, wijziging: Partial<Nieuw<Naam>>) =>
      geschreven(kern, tabel, id, wijziging, "update"),

    /**
     * Verwijderen is markeren (§8.1.6, INV-02).
     *
     * Er is met opzet geen `delete()`. Zonder markering is een verwijderd record in
     * fase 2 niet te onderscheiden van een record dat het andere apparaat nog nooit
     * heeft gezien, en dan herstelt de synchronisatie hem netjes weer.
     */
    softDelete: <Naam extends TabelNaam>(tabel: Naam, id: Uuid) =>
      geschreven(kern, tabel, id, { deletedAt: kern.nu() }, "delete"),

    /**
     * Terug uit de prullenbak (`FR-DOC-121`, B-135).
     *
     * De tegenhanger van `softDelete`, en om dezelfde reden een gewone wijziging met
     * een journaalregel: het andere apparaat moet het herstel kunnen zien, anders
     * markeert de synchronisatie het record bij de eerstvolgende ronde opnieuw als
     * verwijderd (§8.1.6).
     *
     * Een record dat niet in de prullenbak staat blijft ongemoeid. Herstellen wat
     * bestaat is geen fout, het is een handeling zonder gevolg.
     */
    herstel: <Naam extends TabelNaam>(tabel: Naam, id: Uuid) =>
      geschreven(kern, tabel, id, { deletedAt: null }, "update"),

    zetTerug: <Naam extends TabelNaam>(tabel: Naam, record: unknown) =>
      zetTerug<Naam>(kern, tabel, record),

    schrijfAggregaat: <Uitkomst>(
      wortel: TabelNaam,
      overige: readonly TabelNaam[],
      werk: (schrijver: Aggregaatschrijver) => Promise<Uitkomst>,
    ) => schrijfAggregaat(kern, wortel, overige, werk),

    purge: (tabel: TabelNaam, id: Uuid) => purge(kern, tabel, id),

    usage: async (): Promise<Result<Opslaggebruik>> => {
      try {
        return { ok: true, value: await meetOpslag(deps.schatting ?? BROWSERSCHATTING) };
      } catch (fout) {
        return mislukt(fout);
      }
    },
  };
}

export type StorageService = ReturnType<typeof createStorageService>;
