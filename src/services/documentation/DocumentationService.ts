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
import type { Block, Documentation, Page, PhotoBlock, TextBlock } from "@/domain/types";

import { MAX_FOTOS } from "../photo/PhotoService";
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
  /** Hoogstens één reeks, als verwijzing — nooit in de titel (INV-19, FR-DOC-05). */
  seriesId?: Uuid | null;
  /** Nul of meer groepen, náást de leerlingen (FR-DOC-06). */
  groupIds?: Uuid[];
  /** De lopende tekst. Belandt als tekstblok(ken) op de eerste pagina. */
  text: string;
  /** Nooit in een export, nooit naar AI (FR-DOC-08, §8.3.5). */
  privateNote?: string;
  /** De foto's, in de volgorde waarin ze staan (FR-DOC-46). */
  photoIds?: Uuid[];
}

/**
 * De grens van één tekstblok (§8.3.6).
 *
 * FR-DOC-40 laat de gebruiker tot 50.000 tekens typen, maar `zBlock` staat er per
 * blok 20.000 toe. Die twee spreken elkaar niet tegen zolang een lange tekst over
 * meerdere blokken wordt verdeeld — dat gebeurt hieronder, en `tekstVan` plakt hem
 * weer aan elkaar. Het knippen is verliesloos: er wordt niets tussen gezet.
 */
const MAX_TEKST_PER_BLOK = 20_000;

/** FR-DOC-40: het tekstvlak stopt bij 50.000 tekens. */
export const MAX_TEKST = 50_000;

/** FR-DOC-40: vanaf hier waarschuwt het scherm, zonder iets tegen te houden. */
export const WAARSCHUW_VANAF = 20_000;

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

/** De twee harde grenzen van het schrijfscherm (FR-DOC-40, FR-DOC-45). */
function tekstbezwaar(text: string, photoIds: readonly Uuid[]): string | null {
  if (text.length > MAX_TEKST) {
    return `Deze tekst is te lang. Hij telt ${text.length} tekens en er passen er ${MAX_TEKST}. Splits hem in twee documentaties.`;
  }
  if (photoIds.length > MAX_FOTOS) {
    return `Er passen hoogstens ${MAX_FOTOS} foto's in één documentatie. Haal er een paar weg.`;
  }
  return null;
}

function dagenLater(dag: IsoDate, dagen: number): IsoDate {
  const moment = new Date(`${dag}T00:00:00.000Z`);
  moment.setUTCDate(moment.getUTCDate() + dagen);
  return kalenderdag(moment);
}

function isTekstblok(blok: Block): blok is TextBlock {
  return blok.kind === "text";
}

function isFotoblok(blok: Block): blok is PhotoBlock {
  return blok.kind === "photo";
}

/**
 * De tekst als blokken. De slotnummering hoort bij `LayoutService` en bestaat nog niet.
 *
 * Eén blok zolang de tekst binnen §8.3.6 past, en anders net zoveel als nodig. Het
 * knippen gebeurt op tekens en niet op woorden: `tekstVan` plakt de stukken zonder
 * scheidingsteken weer aaneen, dus wat je terugkrijgt is teken voor teken wat je
 * intypte. Op een woordgrens knippen zou dat kapotmaken.
 */
function tekstblokken(text: string): TextBlock[] {
  if (!text) return [];

  const blokken: TextBlock[] = [];
  for (let plaats = 0; plaats < text.length; plaats += MAX_TEKST_PER_BLOK) {
    blokken.push({
      id: newId(),
      slot: 0,
      order: blokken.length + 1,
      kind: "text",
      text: text.slice(plaats, plaats + MAX_TEKST_PER_BLOK),
    });
  }
  return blokken;
}

/** De foto's als blokken, in de volgorde die het scherm aanhoudt (FR-DOC-46). */
function fotoblokken(photoIds: readonly Uuid[], vanafOrder: number): PhotoBlock[] {
  return photoIds.map((photoId, plaats) => ({
    id: newId(),
    slot: 1,
    order: vanafOrder + plaats,
    kind: "photo",
    photoId,
    // Bijsnijden is FR-DOC-50 en komt later; zonder uitsnede is de hele foto in beeld.
    crop: null,
    altText: "",
  }));
}

/** De blokken van één pagina, in de vaste volgorde tekst-dan-foto's. */
function blokkenVan(text: string, photoIds: readonly Uuid[]): Block[] {
  const tekst = tekstblokken(text);
  return [...tekst, ...fotoblokken(photoIds, tekst.length + 1)];
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

      // B-126: de ondergrens is het vroegste van tweeën. Begint je schooljaar over een
      // week, dan mag je vandaag nog steeds documenteren — dat is precies de week
      // waarin je je jaar klaarzet (F-16). INV-16 is er tegen een datum die vóór je
      // opslag ligt, niet tegen vandaag.
      const grens = oudste < vandaag ? oudste : vandaag;
      if (date < grens) {
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
    const photoIds = invoer.photoIds ?? [];

    // FR-DOC-01: pas een record zodra er titel, tekst, een foto of een koppeling is.
    const leeg =
      !title &&
      !text &&
      photoIds.length === 0 &&
      invoer.studentIds.length === 0 &&
      (invoer.groupIds ?? []).length === 0 &&
      !invoer.seriesId;
    if (leeg) {
      return ongeldig("Er is nog niets om op te slaan. Typ een titel of een stukje tekst.");
    }

    const grens = tekstbezwaar(text, photoIds);
    if (grens) return ongeldig(grens);

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
        blocks: blokkenVan(text, photoIds),
      });

      const documentatie = await schrijver.maak(
        "documentations",
        {
          title,
          date: invoer.date,
          seriesId: invoer.seriesId ?? null,
          studentIds: invoer.studentIds,
          groupIds: invoer.groupIds ?? [],
          pageIds: [pagina.id],
          privateNote: (invoer.privateNote ?? "").trim(),
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
    const photoIds = invoer.photoIds ?? [];

    const grens = tekstbezwaar(text, photoIds);
    if (grens) return ongeldig(grens);

    return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
      // Tekst en foto's worden opnieuw opgebouwd; wat er verder op de pagina staat —
      // citaten, koppen — blijft staan zodat een latere editor het terugvindt.
      const overige = eerste.blocks.filter((blok) => !isTekstblok(blok) && !isFotoblok(blok));

      const pagina = await schrijver.wijzig("pages", eerste.id, {
        blocks: [...blokkenVan(text, photoIds), ...overige],
      });
      const documentatie = await schrijver.wijzig("documentations", id, {
        title: invoer.title.trim(),
        date: invoer.date,
        seriesId: invoer.seriesId ?? null,
        studentIds: invoer.studentIds,
        groupIds: invoer.groupIds ?? [],
        privateNote: (invoer.privateNote ?? "").trim(),
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

  /**
   * Legt de toestemming beeldgebruik vast (FR-DOC-115, B-08).
   *
   * Eén keer per documentatie, niet één keer ooit: de vraag hoort bij deze foto's
   * van deze kinderen. Een tweede keer vragen bij dezelfde documentatie is ruis;
   * niet meer vragen bij de volgende is een belofte die niemand heeft gedaan.
   */
  async function geefBeeldtoestemming(id: Uuid): Promise<Result<Documentation>> {
    return storage.update("documentations", id, {
      imageConsentAt: toIsoDateTime(deps.clock.now()),
    });
  }

  /**
   * Zet de status op *gedeeld* na een geslaagde export (FR-DOC-118, B-05, B-13).
   *
   * `firstExportedAt` draagt de status (INV-15) en wordt daarom maar één keer gezet:
   * de datum van de **eerste** export blijft staan, ook als je hem later nog eens
   * verstuurt. Bij een mislukte export wordt deze functie niet aangeroepen, en dan
   * verandert er niets — dat is `FR-DOC-119`.
   */
  async function markeerGedeeld(id: Uuid): Promise<Result<Documentation>> {
    const huidig = await storage.read("documentations", id);
    if (!huidig.ok) return huidig;
    if (!huidig.value) return ongeldig("Deze documentatie bestaat niet meer.");

    return storage.update("documentations", id, {
      status: "gedeeld",
      firstExportedAt: huidig.value.firstExportedAt ?? toIsoDateTime(deps.clock.now()),
    });
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

  /**
   * De lopende tekst: alle tekstblokken van de eerste pagina, weer aaneen.
   *
   * Zonder scheidingsteken, want zo is hij ook geknipt. Wat je terugkrijgt is
   * teken voor teken wat je intypte.
   */
  function tekstVan(geopend: GeopendeDocumentatie): string {
    return (geopend.paginas[0]?.blocks ?? [])
      .filter(isTekstblok)
      .sort((a, b) => a.order - b.order)
      .map((blok) => blok.text)
      .join("");
  }

  /** De foto's van een documentatie, in de volgorde waarin ze staan (FR-DOC-46). */
  function fotosVan(geopend: GeopendeDocumentatie): Uuid[] {
    return (geopend.paginas[0]?.blocks ?? [])
      .filter(isFotoblok)
      .sort((a, b) => a.order - b.order)
      .map((blok) => blok.photoId);
  }

  return { maak, bewaar, open, lijst, tekstVan, fotosVan, geefBeeldtoestemming, markeerGedeeld };
}

export type DocumentationService = ReturnType<typeof createDocumentationService>;
