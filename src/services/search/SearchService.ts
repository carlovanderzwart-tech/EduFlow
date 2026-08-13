/**
 * Zoeken en filteren (§8.5, §10.4, T-09).
 *
 * **IndexedDB kan geen tekst doorzoeken.** Daarom bouwt deze service bij het
 * opstarten een omgekeerde index in het geheugen: van token naar de verzameling
 * documentaties waarin dat token voorkomt. Rechtstreeks over de opslag zoeken werkt
 * tot ongeveer honderd documentaties en wordt daarna traag op een manier die je pas
 * in maart merkt (T-09, C8 uit de review).
 *
 * **De notitie voor jezelf staat niet in de index, en dat is geen optimalisatie.**
 * FR-DOC-22 en FR-DOC-08 beloven dat hij binnen blijft; een index die hem wél
 * bevat, verraadt zijn inhoud zodra iemand het juiste woord intikt. Er is één plek
 * waar bepaald wordt wat er in de index gaat — `tekstVan` hieronder — en
 * `privateNote` komt daar niet in voor.
 *
 * Wat er wél in gaat (§8.5): de titel, alle tekstblokken, alle citaten, de
 * reeksnaam en de roepnamen van gekoppelde leerlingen.
 *
 * De trigram-terugval voor typefouten uit §8.5 zit er nog niet in; werkopdracht D07
 * zet FR-DOC-24 uitdrukkelijk buiten deze stap.
 */

import { tokenize } from "@/lib/text";
import type { Uuid } from "@/lib/uuid";
import type { Block, Documentation, Group, Page, Series, Student } from "@/domain/types";
import type { Result } from "@/lib/result";

import type { StorageService } from "../storage/StorageService";
import { weergavenaam } from "../students/StudentService";

/**
 * Nederlandse stopwoorden (§8.5).
 *
 * Ze staan hier en niet in `lib/text.ts`, omdat die map geen domeinkennis kent en
 * "welke woorden dragen geen betekenis in een documentatie" een keuze is die bij
 * het zoeken hoort.
 */
const STOPWOORDEN = new Set([
  "de", "het", "een", "en", "van", "in", "op", "met", "voor", "aan", "te", "dat", "die",
  "is", "was", "er", "ze", "hij", "zij", "we", "wij", "je", "jij", "ik", "niet", "ook",
  "maar", "als", "dan", "om", "bij", "naar", "uit", "over", "door", "nog", "al", "wat",
  "hoe", "waar", "want", "of", "toen", "heeft", "had", "worden", "werd", "zijn", "hun",
]);

/** Wat een documentatie doorzoekbaar maakt. Zonder `privateNote` (FR-DOC-22). */
function tekstVan(
  documentatie: Documentation,
  paginas: readonly Page[],
  reeksnaam: string,
  namen: readonly string[],
): string {
  const blokken = paginas.flatMap((pagina) => pagina.blocks);
  const uitBlokken = blokken
    .map((blok: Block) => (blok.kind === "text" || blok.kind === "quote" ? blok.text : ""))
    .filter(Boolean);

  return [documentatie.title, ...uitBlokken, reeksnaam, ...namen].join(" ");
}

function tokensVan(tekst: string): string[] {
  return tokenize(tekst).filter((token) => !STOPWOORDEN.has(token));
}

/** De vijf filters van FR-DOC-25. Leeg betekent: dit filter doet niet mee. */
export interface Filters {
  seriesIds?: readonly Uuid[];
  groupIds?: readonly Uuid[];
  studentIds?: readonly Uuid[];
  van?: string;
  tot?: string;
  status?: readonly Documentation["status"][];
}

export type Sortering = "datum" | "bewerkt";

export interface Treffer {
  documentatie: Documentation;
  /** Eén fragment rond de eerste treffer (FR-DOC-23). Leeg zonder zoekterm. */
  fragment: string;
}

export interface SearchDeps {
  storage: StorageService;
}

/** Eén regel in de index: waarop te zoeken, en waarop te filteren. */
interface Ingang {
  documentatie: Documentation;
  tekst: string;
  tokens: Set<string>;
}

/**
 * Het fragment rond de eerste treffer (FR-DOC-23).
 *
 * Eén fragment en niet drie: een rij in een lijst heeft één regel ruimte, en drie
 * fragmenten maken van elke treffer een alinea die je moet lezen om hem over te
 * kunnen slaan.
 */
function fragmentVan(tekst: string, term: string): string {
  const plaats = tekst.toLowerCase().indexOf(term.toLowerCase());
  if (plaats === -1) return tekst.slice(0, 120);

  const begin = Math.max(0, plaats - 40);
  const eind = Math.min(tekst.length, plaats + term.length + 80);
  return `${begin > 0 ? "…" : ""}${tekst.slice(begin, eind).trim()}${eind < tekst.length ? "…" : ""}`;
}

/** Binnen één filter geldt *of*: leeg laat alles door, anders moet er één passen. */
function passtBinnen(gekozen: readonly string[] | undefined, waarden: readonly string[]): boolean {
  if (!gekozen || gekozen.length === 0) return true;
  return gekozen.some((sleutel) => waarden.includes(sleutel));
}

export function createSearchService(deps: SearchDeps) {
  let index: Ingang[] = [];
  let gevuld = false;

  /**
   * Vult de index (§8.5, T-09).
   *
   * Wordt bij het opstarten aangeroepen en opnieuw na een schrijfactie. Alles in
   * één keer: bij duizend documentaties is dat volgens §8.5 ongeveer 18 MB, en dat
   * is aanvaardbaar op een laptop en op een telefoon van na 2020.
   */
  async function vul(): Promise<Result<number>> {
    const documentaties = await deps.storage.list("documentations");
    if (!documentaties.ok) return documentaties;
    const paginas = await deps.storage.list("pages");
    if (!paginas.ok) return paginas;
    const reeksen = await deps.storage.list("series");
    if (!reeksen.ok) return reeksen;
    const leerlingen = await deps.storage.list("students");
    if (!leerlingen.ok) return leerlingen;

    const reeksNaam = new Map(reeksen.value.map((reeks: Series) => [reeks.id, reeks.name]));
    const naam = new Map(leerlingen.value.map((kind: Student) => [kind.id, weergavenaam(kind)]));
    const perDocumentatie = new Map<Uuid, Page[]>();
    for (const pagina of paginas.value) {
      perDocumentatie.set(pagina.documentationId, [
        ...(perDocumentatie.get(pagina.documentationId) ?? []),
        pagina,
      ]);
    }

    index = documentaties.value.map((documentatie) => {
      const tekst = tekstVan(
        documentatie,
        perDocumentatie.get(documentatie.id) ?? [],
        reeksNaam.get(documentatie.seriesId ?? "") ?? "",
        documentatie.studentIds.map((id) => naam.get(id) ?? ""),
      );
      return { documentatie, tekst, tokens: new Set(tokensVan(tekst)) };
    });

    gevuld = true;
    return { ok: true, value: index.length };
  }

  /**
   * Zoekt en filtert (FR-DOC-11 t/m FR-DOC-13, FR-DOC-21, FR-DOC-25).
   *
   * Tussen filters geldt *en*, binnen een filter *of*. Een reeks plus een periode
   * geeft dus de doorsnede; twee reeksen geven de som.
   */
  function zoek(term: string, filters: Filters = {}, sortering: Sortering = "datum"): Treffer[] {
    const gezocht = tokensVan(term);

    const gevonden = index.filter(({ documentatie, tokens }) => {
      // Elk woord uit de zoekterm moet voorkomen: twee woorden versmallen.
      if (gezocht.some((token) => !heeftToken(tokens, token))) return false;

      if (!passtBinnen(filters.seriesIds, documentatie.seriesId ? [documentatie.seriesId] : [])) {
        return false;
      }
      if (!passtBinnen(filters.groupIds, documentatie.groupIds)) return false;
      if (!passtBinnen(filters.studentIds, documentatie.studentIds)) return false;
      if (!passtBinnen(filters.status, [documentatie.status])) return false;
      if (filters.van && documentatie.date < filters.van) return false;
      if (filters.tot && documentatie.date > filters.tot) return false;

      return true;
    });

    return gesorteerd(gevonden, sortering).map(({ documentatie, tekst }) => ({
      documentatie,
      fragment: term.trim() ? fragmentVan(tekst, term.trim()) : "",
    }));
  }

  return { vul, zoek, isGevuld: () => gevuld, omvang: () => index.length };
}

/**
 * Een token telt ook als het het begin van een woord is.
 *
 * "kjeld" moet "kjelds" vinden — wie zoekt, typt de stam en niet de verbuiging.
 * Dit is geen stemmer; het is de kleinste regel die de gevallen uit F-15 haalt.
 */
function heeftToken(tokens: Set<string>, gezocht: string): boolean {
  if (tokens.has(gezocht)) return true;
  for (const token of tokens) if (token.startsWith(gezocht)) return true;
  return false;
}

/**
 * De volgorde (FR-DOC-11, FR-DOC-12, FR-DOC-13).
 *
 * Standaard op de **inhoudelijke** datum en niet op `updatedAt`: die laatste
 * verspringt zodra je een typefout herstelt, en "wanneer was dat" gaat over de dag
 * waarop het gebeurde. Bij gelijke datum beslist de sleutel, zodat de volgorde
 * tussen twee opvragingen niet verspringt (FR-DOC-13).
 */
function gesorteerd(ingangen: Ingang[], sortering: Sortering): Ingang[] {
  return [...ingangen].sort((a, b) => {
    const eerst =
      sortering === "bewerkt"
        ? b.documentatie.updatedAt.localeCompare(a.documentatie.updatedAt)
        : b.documentatie.date.localeCompare(a.documentatie.date);
    return eerst || a.documentatie.id.localeCompare(b.documentatie.id);
  });
}

export type SearchService = ReturnType<typeof createSearchService>;
