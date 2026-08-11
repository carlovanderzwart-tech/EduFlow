/**
 * Documentaties (§10.4, §6.1.1, §9.4.1).
 *
 * De wortel van het grootste aggregaat: een documentatie met haar pagina's en de
 * blokken daarin. Wie een pagina wil wijzigen, gaat langs deze service — er is
 * geen andere schrijver van `pages` (§9.4 regel A, DR-14).
 *
 * **Deze eerste versie schrijft één tekstblok op één pagina.** Dat is met opzet
 * het kleinste dat werkt: pagina's toevoegen, herordenen en de overloop naar een
 * vervolgpagina horen bij `PageService` en `LayoutService` (§10.4), en die bestaan
 * nog niet. Wat hier staat is niets wat straks weer moet weg — het is de eerste
 * pagina, met de layout die INV-22 voorschrijft.
 *
 * Van de drie grenzen van INV-16 handhaaft deze service er twee: de zevendagengrens
 * uit B-70 met de geïnjecteerde klok, en de grens van het oudste schooljaar in de
 * opslag. De ondergrens 2015-08-01 is absoluut en staat in het schema.
 */

import { toIsoDateTime, type IsoDate } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import { newId, type Uuid } from "@/lib/uuid";
import type { Block, Documentation, Page, TextBlock } from "@/domain/types";

import type { Clock, StorageService } from "../storage/StorageService";

export interface DocumentationDeps {
  storage: StorageService;
  clock: Clock;
}

/** Wat het schrijfscherm invult. De rest leidt de service af. */
export interface Documentatieinvoer {
  title: string;
  date: IsoDate;
  studentIds: Uuid[];
  /** De lopende tekst. Belandt als één tekstblok op de eerste pagina. */
  text: string;
}

/** Een documentatie met haar pagina's: het hele aggregaat in één keer (§9.4.1). */
export interface GeopendeDocumentatie {
  documentatie: Documentation;
  paginas: Page[];
}

/** Zeven dagen vooruit, uit B-70. */
const MAX_DAGEN_VOORUIT = 7;

/**
 * De kalenderdag van een tijdstip, in UTC.
 *
 * Nadrukkelijk niet omgerekend naar Europe/Amsterdam: §8.1.4 legt die omrekening
 * bij de weergavelaag, en een service die een tijdzone kent is niet meer te
 * toetsen zonder aannames over de omgeving (DR-12).
 */
function kalenderdag(moment: Date): IsoDate {
  return toIsoDateTime(moment).slice(0, 10);
}

function dagenLater(dag: IsoDate, dagen: number): IsoDate {
  const moment = new Date(`${dag}T00:00:00.000Z`);
  moment.setUTCDate(moment.getUTCDate() + dagen);
  return kalenderdag(moment);
}

function isTekstblok(blok: Block): blok is TextBlock {
  return blok.kind === "text";
}

/** Eén tekstblok. De slotnummering hoort bij `LayoutService` en bestaat nog niet. */
function tekstblok(text: string): TextBlock {
  return { id: newId(), slot: 0, order: 1, kind: "text", text };
}

export function createDocumentationService(deps: DocumentationDeps) {
  const { storage } = deps;

  /**
   * De twee grenzen van INV-16 die om iets buiten het record vragen.
   *
   * Geeft de melding uit §9.5.3 terug, niet een boolean: de service die de regel
   * kent, schrijft de tekst (§10.3).
   */
  async function datumbezwaar(date: IsoDate): Promise<string | null> {
    const vandaag = kalenderdag(deps.clock.now());
    if (date > dagenLater(vandaag, MAX_DAGEN_VOORUIT)) {
      return "Deze datum ligt meer dan een week vooruit. Je documenteert wat gebeurd is.";
    }

    const jaren = await storage.list("schoolYears");
    if (jaren.ok && jaren.value.length > 0) {
      const oudste = jaren.value.reduce(
        (vroegste, jaar) => (jaar.firstSchoolDay < vroegste ? jaar.firstSchoolDay : vroegste),
        jaren.value[0]!.firstSchoolDay,
      );
      if (date < oudste) {
        return "Deze datum ligt vóór het oudste schooljaar in je opslag. Kies een latere datum.";
      }
    }

    return null;
  }

  /**
   * Maakt een documentatie met haar eerste pagina (INV-07, INV-08, INV-22).
   *
   * INV-07: leeg openen en weggaan laat niets achter. Zonder titel, zonder tekst en
   * zonder koppeling is er geen inhoud, en dan wordt er niets geschreven.
   */
  async function maak(invoer: Documentatieinvoer): Promise<Result<GeopendeDocumentatie>> {
    const title = invoer.title.trim();
    const text = invoer.text.trim();

    if (!title && !text && invoer.studentIds.length === 0) {
      return ongeldig("Er is nog niets om op te slaan. Typ een titel of een stukje tekst.");
    }

    const bezwaar = await datumbezwaar(invoer.date);
    if (bezwaar) return ongeldig(bezwaar);

    return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
      // De sleutel van de documentatie is vooraf nodig: de pagina draagt de
      // eigendom (INV-09) en de documentatie de volgorde (§8.4). Beide bestaan
      // alleen samen, en daarom staan ze in één transactie.
      const documentationId = schrijver.sleutel();
      const pagina = await schrijver.maak("pages", {
        documentationId,
        // INV-11: de volgnummers lopen aaneengesloten vanaf 1.
        order: 1,
        // INV-22: een eerste pagina is nooit `E-vervolg`.
        layoutId: "B-verhaal",
        autoCreated: false,
        blocks: text ? [tekstblok(text)] : [],
      });

      const documentatie = await schrijver.maak(
        "documentations",
        {
          title,
          date: invoer.date,
          seriesId: null,
          studentIds: invoer.studentIds,
          groupIds: [],
          pageIds: [pagina.id],
          privateNote: "",
          // INV-15: de status is afgeleid en wordt nooit door de gebruiker gezet.
          status: "concept",
          firstExportedAt: null,
          archivedAt: null,
          imageConsentAt: null,
        },
        documentationId,
      );

      return { documentatie, paginas: [pagina] };
    });
  }

  /**
   * Bewaart een wijziging in het hele aggregaat (§10.7).
   *
   * De wortel wordt altijd bijgewerkt, ook als alleen de tekst op de pagina
   * wijzigde: zijn `rev` is de versie van het geheel, en daar leunt §10.8 op als
   * dezelfde documentatie in twee tabbladen open staat.
   */
  async function bewaar(
    id: Uuid,
    invoer: Documentatieinvoer,
  ): Promise<Result<GeopendeDocumentatie>> {
    const geopend = await open(id);
    if (!geopend.ok) return geopend;

    const huidig = geopend.value;
    if (!huidig) return ongeldig("Deze documentatie bestaat niet meer.");

    const bezwaar = await datumbezwaar(invoer.date);
    if (bezwaar) return ongeldig(bezwaar);

    const eerste = huidig.paginas[0];
    if (!eerste) throw new Error(`Documentatie ${id} heeft geen pagina; INV-08 is geschonden`);

    const text = invoer.text.trim();

    return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
      // Eén tekstblok, en dat is de enige die deze versie schrijft. De overige
      // blokken van de pagina blijven staan zodat een latere editor ze terugvindt.
      const bestaand = eerste.blocks.find(isTekstblok);
      const overige = eerste.blocks.filter((blok) => !isTekstblok(blok));
      const tekstblokken = text ? [bestaand ? { ...bestaand, text } : tekstblok(text)] : [];

      const pagina = await schrijver.wijzig("pages", eerste.id, {
        blocks: [...tekstblokken, ...overige],
      });
      const documentatie = await schrijver.wijzig("documentations", id, {
        title: invoer.title.trim(),
        date: invoer.date,
        studentIds: invoer.studentIds,
      });

      return { documentatie, paginas: [pagina, ...huidig.paginas.slice(1)] };
    });
  }

  /** Het hele aggregaat in één keer; het schrijfscherm laadt het volledig (§9.4.1). */
  async function open(id: Uuid): Promise<Result<GeopendeDocumentatie | null>> {
    const documentatie = await storage.read("documentations", id);
    if (!documentatie.ok) return documentatie;
    if (!documentatie.value) return { ok: true, value: null };

    const alle = await storage.list("pages");
    if (!alle.ok) return alle;

    const paginas = alle.value
      .filter((pagina) => pagina.documentationId === id)
      .sort((a, b) => a.order - b.order);

    return { ok: true, value: { documentatie: documentatie.value, paginas } };
  }

  /** Nieuwste eerst, want dat is waar je verder werkt (§6.1.2). */
  async function lijst(): Promise<Result<Documentation[]>> {
    const uitkomst = await storage.list("documentations");
    if (!uitkomst.ok) return uitkomst;

    return {
      ok: true,
      value: [...uitkomst.value].sort(
        (a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt),
      ),
    };
  }

  /** De lopende tekst van een documentatie: het eerste tekstblok op de eerste pagina. */
  function tekstVan(geopend: GeopendeDocumentatie): string {
    return geopend.paginas[0]?.blocks.find(isTekstblok)?.text ?? "";
  }

  return { maak, bewaar, open, lijst, tekstVan };
}

export type DocumentationService = ReturnType<typeof createDocumentationService>;
