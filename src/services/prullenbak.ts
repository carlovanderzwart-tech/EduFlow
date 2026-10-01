/**
 * De prullenbak, voor elk record dat je kunt weggooien (§8.8, T-11, B-135, B-138).
 *
 * **Verwijderen is markeren.** Er staat met opzet geen `delete()` in de opslaglaag:
 * zodra er twee apparaten zijn, is een record dat verdwenen is niet te
 * onderscheiden van een record dat het andere apparaat nog nooit heeft gezien, en
 * dan herstelt de synchronisatie hem netjes weer (§8.1.6).
 *
 * B-135 bouwde dit voor documentaties. B-138 maakt er één ding van: een documentatie,
 * een groep en een reeks gaan allemaal naar dezelfde prullenbak, met dezelfde dertig
 * dagen en dezelfde drie handelingen. Wat per soort verschilt is alleen **welke
 * kinderen meegaan** — pagina's bij een documentatie, lidmaatschappen bij een groep,
 * niets bij een reeks.
 *
 * De rekenkant hieronder raakt de opslag niet en is te toetsen zonder database
 * (DR-12).
 */

import type { Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { IsoDateTime } from "@/domain/types";

import type { Clock, StorageService } from "./storage/StorageService";
import type { RecordVan, TabelNaam } from "./storage/tabellen";

/** §8.8: de prullenbak bewaart dertig dagen. Daarna ruimt de opruimronde op. */
export const BEWAARTERMIJN_DAGEN = 30;

const MS_PER_DAG = 24 * 60 * 60 * 1000;

/** Eén regel in de prullenbak: wat er staat en hoe lang het er nog staat. */
export interface Prullenbakregel<T> {
  record: T;
  /** Hoeveel hele dagen er nog resteren; nooit onder nul. */
  dagenResterend: number;
}

/**
 * Hoeveel dagen een verwijderd record nog heeft.
 *
 * Naar boven afgerond, want "nog 1 dag" hoort er te staan zolang er iets van die
 * dag over is. Naar beneden afronden zou op de laatste ochtend "nog 0 dagen" tonen
 * bij iets wat pas 's avonds verdwijnt.
 */
export function dagenResterend(deletedAt: IsoDateTime, nu: Date): number {
  const verstreken = nu.getTime() - new Date(deletedAt).getTime();
  const over = BEWAARTERMIJN_DAGEN - verstreken / MS_PER_DAG;
  return Math.max(0, Math.ceil(over));
}

/** Is de bewaartermijn voorbij? Dan mag de opruimronde hem echt wissen. */
export function isVerlopen(deletedAt: IsoDateTime, nu: Date): boolean {
  return dagenResterend(deletedAt, nu) === 0;
}

/**
 * De prullenbak, het laatst verwijderde bovenaan.
 *
 * Bovenaan wat je het laatst weggooide, want dat is wat je terugzoekt als je je
 * bedenkt. Records zonder `deletedAt` worden overgeslagen in plaats van te laten
 * struikelen: `listDeleted` levert ze niet, maar een aanroeper die zelf filtert
 * vergeet dat een keer.
 */
export function sorteerPrullenbak<T extends { deletedAt: IsoDateTime | null }>(
  records: readonly T[],
  nu: Date,
): Prullenbakregel<T>[] {
  return records
    .filter((record): record is T & { deletedAt: IsoDateTime } => record.deletedAt !== null)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
    .map((record) => ({ record, dagenResterend: dagenResterend(record.deletedAt, nu) }));
}

/** Wat de opruimronde definitief mag wissen (§8.8). */
export function verlopen<T extends { deletedAt: IsoDateTime | null }>(
  records: readonly T[],
  nu: Date,
): T[] {
  return records.filter((record) => record.deletedAt !== null && isVerlopen(record.deletedAt, nu));
}

/**
 * Een tabel die met de wortel meegaat.
 *
 * Een pagina hoort bij één documentatie, een lidmaatschap bij één groep. Beide
 * hebben geen betekenis zonder hun wortel: een los lidmaatschap is een rij die naar
 * niets wijst en die je niet kunt terugzetten.
 */
export interface Kindrelatie {
  tabel: TabelNaam;
  /** Het veld in het kind dat naar de wortel wijst, bijvoorbeeld `documentationId`. */
  veld: string;
}

/** Wat een leegmaken of opruimen heeft opgeleverd. */
export interface Opruimuitkomst {
  /** Hoeveel wortelrecords er definitief zijn gewist. */
  records: number;
  /** En hoeveel kinderen daarmee. */
  kinderen: number;
}

/**
 * De prullenbak van één tabel, met zijn kinderen.
 *
 * `kinderen` bepaalt wat er meegaat. De wortel en zijn kinderen gaan in **één
 * transactie** via `schrijfAggregaat` (§9.4 regel A): zou het halverwege stoppen,
 * dan stond er een documentatie in de prullenbak waarvan de pagina's nog leefden —
 * of erger, een levende groep zonder lidmaatschappen.
 */
/** Wat één prullenbak nodig heeft om zijn werk te doen. */
interface Opzet<Naam extends TabelNaam> {
  storage: StorageService;
  clock: Clock;
  tabel: Naam;
  kinderen: readonly Kindrelatie[];
}

interface Kindsleutel {
  tabel: TabelNaam;
  id: Uuid;
}

/**
 * De sleutels van de kinderen van dit record.
 *
 * De cast is onvermijdelijk en beperkt: `TabelNaam` is een unie van achttien
 * tabellen met elk hun eigen velden, en er is geen type dat "het veld dat naar de
 * wortel wijst" uitdrukt zonder per tabel te worden opgeschreven. Hij staat op
 * precies deze plek en nergens anders.
 */
async function kindsleutels<Naam extends TabelNaam>(
  opzet: Opzet<Naam>,
  id: Uuid,
  ookVerwijderde: boolean,
): Promise<Result<Kindsleutel[]>> {
  const gevonden: Kindsleutel[] = [];

  for (const kind of opzet.kinderen) {
    const alle = ookVerwijderde
      ? await opzet.storage.listDeleted(kind.tabel)
      : await opzet.storage.list(kind.tabel);
    if (!alle.ok) return alle;

    for (const rij of alle.value) {
      if ((rij as unknown as Record<string, unknown>)[kind.veld] === id) {
        gevonden.push({ tabel: kind.tabel, id: rij.id });
      }
    }
  }

  return { ok: true, value: gevonden };
}

/**
 * Naar de prullenbak of eruit: de wortel en zijn kinderen, in één transactie.
 *
 * Beide richtingen staan hier samen omdat ze dezelfde vorm hebben en hetzelfde
 * moeten garanderen. Zou het halverwege stoppen, dan stond er een documentatie in
 * de prullenbak waarvan de pagina's nog leefden — of erger, een levende groep
 * zonder lidmaatschappen (§9.4 regel A).
 */
async function verzet<Naam extends TabelNaam>(
  opzet: Opzet<Naam>,
  id: Uuid,
  richting: "verwijder" | "herstel",
): Promise<Result<RecordVan<Naam>>> {
  const kind = await kindsleutels(opzet, id, richting === "herstel");
  if (!kind.ok) return kind;

  const tabellen = opzet.kinderen.map((rij) => rij.tabel);
  return opzet.storage.schrijfAggregaat(opzet.tabel, tabellen, async (schrijver) => {
    for (const sleutel of kind.value) await schrijver[richting](sleutel.tabel, sleutel.id);
    return schrijver[richting](opzet.tabel, id);
  });
}

/**
 * Definitief wissen.
 *
 * Kinderen eerst. Zou de wortel als eerste verdwijnen en daarna iets misgaan, dan
 * blijven er kinderen over die naar niets meer verwijzen en die niemand nog kan
 * vinden om op te ruimen.
 */
async function wis<Naam extends TabelNaam>(
  opzet: Opzet<Naam>,
  records: readonly { id: Uuid }[],
): Promise<Result<Opruimuitkomst>> {
  let aantalKinderen = 0;

  for (const record of records) {
    const kind = await kindsleutels(opzet, record.id, true);
    if (!kind.ok) return kind;

    for (const sleutel of kind.value) {
      const weg = await opzet.storage.purge(sleutel.tabel, sleutel.id);
      if (!weg.ok) return weg;
      aantalKinderen += 1;
    }

    const weg = await opzet.storage.purge(opzet.tabel, record.id);
    if (!weg.ok) return weg;
  }

  return { ok: true, value: { records: records.length, kinderen: aantalKinderen } };
}

/**
 * De prullenbak van één tabel, met zijn kinderen.
 *
 * `kinderen` bepaalt wat er meegaat: pagina's bij een documentatie,
 * lidmaatschappen bij een groep, niets bij een reeks.
 */
export function maakPrullenbak<Naam extends TabelNaam>(
  storage: StorageService,
  clock: Clock,
  tabel: Naam,
  kinderen: readonly Kindrelatie[] = [],
) {
  const opzet: Opzet<Naam> = { storage, clock, tabel, kinderen };

  return {
    /** Naar de prullenbak: de wortel en zijn kinderen, in één transactie. */
    verwijder: (id: Uuid) => verzet(opzet, id, "verwijder"),

    /** Terug uit de prullenbak, met alles wat meeging. */
    herstel: (id: Uuid) => verzet(opzet, id, "herstel"),

    /** Wat er in de prullenbak staat, met de resterende dagen. */
    async inhoud(): Promise<Result<Prullenbakregel<RecordVan<Naam>>[]>> {
      const alle = await storage.listDeleted(tabel);
      if (!alle.ok) return alle;
      return { ok: true, value: sorteerPrullenbak(alle.value, clock.now()) };
    },

    /** De prullenbak in één handeling legen. */
    async leeg(): Promise<Result<Opruimuitkomst>> {
      const alle = await storage.listDeleted(tabel);
      if (!alle.ok) return alle;
      return wis(opzet, alle.value);
    },

    /**
     * De opruimronde (§8.8).
     *
     * Dertig dagen, en geen dag eerder. Hij draait bij elke start en niet op een
     * tijdklok: een app die je één keer per week opent hoort geen achtergrondtaak
     * te hebben die draait terwijl niemand kijkt.
     */
    async ruimOp(): Promise<Result<Opruimuitkomst>> {
      const alle = await storage.listDeleted(tabel);
      if (!alle.ok) return alle;
      return wis(opzet, verlopen(alle.value, clock.now()));
    },
  };
}
