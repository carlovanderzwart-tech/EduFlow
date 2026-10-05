/**
 * Tekst en foto's als blokken (§8.3.6, FR-DOC-40, FR-DOC-45).
 *
 * De omzetting tussen wat je typt en wat er in een pagina staat, plus de twee harde
 * grenzen van het schrijfscherm. Uit `DocumentationService` gehaald omdat die fabriek
 * op 161 regels stond (DR-53) en omdat dit een eigen onderwerp is: hier staat niets
 * over opslaan, alleen over vorm.
 */

import { toIsoDateTime, type IsoDate } from "@/lib/dates";
import { newId, type Uuid } from "@/lib/uuid";
import type { Block, PhotoBlock, TextBlock } from "@/domain/types";

import { MAX_FOTOS } from "../photo/PhotoService";

/**
 * De grens van één tekstblok (§8.3.6).
 *
 * FR-DOC-40 laat de gebruiker tot 50.000 tekens typen, maar `zBlock` staat er per
 * blok 20.000 toe. Die twee spreken elkaar niet tegen zolang een lange tekst over
 * meerdere blokken wordt verdeeld — dat gebeurt hieronder, en `tekstVan` plakt hem
 * weer aan elkaar. Het knippen is verliesloos: er wordt niets tussen gezet.
 */
export const MAX_TEKST_PER_BLOK = 20_000;

/** FR-DOC-40: het tekstvlak stopt bij 50.000 tekens. */
export const MAX_TEKST = 50_000;

/** FR-DOC-40: vanaf hier waarschuwt het scherm, zonder iets tegen te houden. */
export const WAARSCHUW_VANAF = 20_000;

/** Zeven dagen vooruit, uit B-70. */
export const MAX_DAGEN_VOORUIT = 7;

/**
 * De kalenderdag van een tijdstip, in UTC.
 *
 * Nadrukkelijk niet omgerekend naar Europe/Amsterdam: §8.1.4 legt die omrekening
 * bij de weergavelaag, en een service die een tijdzone kent is niet meer te
 * toetsen zonder aannames over de omgeving (DR-12).
 */
export function kalenderdag(moment: Date): IsoDate {
  return toIsoDateTime(moment).slice(0, 10);
}

/** De twee harde grenzen van het schrijfscherm (FR-DOC-40, FR-DOC-45). */
export function tekstbezwaar(text: string, photoIds: readonly Uuid[]): string | null {
  if (text.length > MAX_TEKST) {
    return `Deze tekst is te lang. Hij telt ${text.length} tekens en er passen er ${MAX_TEKST}. Splits hem in twee documentaties.`;
  }
  if (photoIds.length > MAX_FOTOS) {
    return `Er passen hoogstens ${MAX_FOTOS} foto's in één documentatie. Haal er een paar weg.`;
  }
  return null;
}

export function dagenLater(dag: IsoDate, dagen: number): IsoDate {
  const moment = new Date(`${dag}T00:00:00.000Z`);
  moment.setUTCDate(moment.getUTCDate() + dagen);
  return kalenderdag(moment);
}

export function isTekstblok(blok: Block): blok is TextBlock {
  return blok.kind === "text";
}

export function isFotoblok(blok: Block): blok is PhotoBlock {
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
export function tekstblokken(text: string): TextBlock[] {
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
export function fotoblokken(photoIds: readonly Uuid[], vanafOrder: number): PhotoBlock[] {
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
export function blokkenVan(text: string, photoIds: readonly Uuid[]): Block[] {
  const tekst = tekstblokken(text);
  return [...tekst, ...fotoblokken(photoIds, tekst.length + 1)];
}
