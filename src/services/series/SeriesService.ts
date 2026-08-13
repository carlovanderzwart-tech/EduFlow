/**
 * Reeksen (§10.4, §8.3.4, §6.5.3).
 *
 * Een reeks is een **ordening en geen eigenaar** (§9.4, B-35). Documentaties
 * verwijzen naar de reeks, nooit omgekeerd, en daarom is het verwijderen van een
 * reeks het leegmaken van een verwijzing en niet het opruimen van werk (INV-20).
 * Wie dat omdraait, laat vier documentaties verdwijnen door het opruimen van een
 * label — precies wat B-35 verbiedt.
 *
 * `description` bestaat omdat hij als context meegaat bij de vervolgzin (B-04).
 * Dat is ook de reden dat het schema er 500 tekens op zet: het veld gaat de deur
 * uit.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Colour, Series } from "@/domain/types";

import type { StorageService } from "../storage/StorageService";

export interface SeriesDeps {
  storage: StorageService;
}

export interface Nieuwereeks {
  name: string;
  colour: Colour;
  description?: string;
}

/**
 * De acht uit §5.5, in de volgorde waarin ze worden toegekend.
 *
 * Eén palet voor reeksen én groepen: §8.3.2 en §8.3.4 noemen allebei "een van
 * acht", en §5.5 somt precies één verzameling op. Een tweede lijst zou een
 * negende kleur mogelijk maken.
 */
export const PALET: readonly Colour[] = [
  "series-1",
  "series-2",
  "series-3",
  "series-4",
  "series-5",
  "series-6",
  "series-7",
  "series-8",
];

/** Naamgrens uit FR-INS-11. Staat hier benoemd omdat het scherm hem ook aanhoudt (DR-54). */
export const REEKSNAAM_MAX = 60;

/**
 * De kleur van de volgende reeks of groep (§5.5).
 *
 * Vanaf de negende begint de toekenning opnieuw bij `series-1`: twee reeksen met
 * dezelfde kleur is minder erg dan een negende kleur die niemand herkent.
 */
export function volgendeKleur(aantalBestaand: number): Colour {
  return PALET[aantalBestaand % PALET.length]!;
}

export function createSeriesService(deps: SeriesDeps) {
  const { storage } = deps;

  async function lijst(): Promise<Result<Series[]>> {
    const uitkomst = await storage.list("series");
    if (!uitkomst.ok) return uitkomst;
    return {
      ok: true,
      value: [...uitkomst.value].sort((a, b) => a.name.localeCompare(b.name, "nl")),
    };
  }

  /** Naam 1-60 tekens, kleur uit de acht, beschrijving optioneel (FR-INS-11). */
  async function maak(invoer: Nieuwereeks): Promise<Result<Series>> {
    const name = invoer.name.trim();
    if (!name) return ongeldig("Een reeks heeft een naam nodig. Vul er een in.");
    if (name.length > REEKSNAAM_MAX) {
      return ongeldig(
        `Deze naam is te lang. Een reeksnaam telt hoogstens ${REEKSNAAM_MAX} tekens. Kort hem in.`,
      );
    }

    return storage.create("series", {
      name,
      colour: invoer.colour,
      description: (invoer.description ?? "").trim(),
    });
  }

  /**
   * Hoeveel documentaties hun verwijzing kwijtraken (FR-INS-12).
   *
   * Het scherm vraagt dit vóór het verwijderen, want FR-INS-12 eist dat de app
   * vooraf zegt hoeveel documentaties het betreft. De telling staat hier en niet
   * in het scherm: een tweede plek met dezelfde vraag loopt uiteen (U-03).
   */
  async function aantalDocumentaties(id: Uuid): Promise<Result<number>> {
    const uitkomst = await storage.list("documentations");
    if (!uitkomst.ok) return uitkomst;
    return { ok: true, value: uitkomst.value.filter((doc) => doc.seriesId === id).length };
  }

  /**
   * Verwijdert de reeks en laat de documentaties bestaan (INV-20, FR-INS-12).
   *
   * De verwijzing wordt leeggemaakt vóór de grafsteen wordt gezet. Andersom zou er
   * een moment bestaan waarop een documentatie naar een verwijderde reeks wijst, en
   * dat is precies de toestand die het overzicht niet kan tekenen.
   */
  async function verwijder(id: Uuid): Promise<Result<number>> {
    const documentaties = await storage.list("documentations");
    if (!documentaties.ok) return documentaties;

    const gekoppeld = documentaties.value.filter((doc) => doc.seriesId === id);
    for (const doc of gekoppeld) {
      const losgemaakt = await storage.update("documentations", doc.id, { seriesId: null });
      if (!losgemaakt.ok) return losgemaakt;
    }

    const weg = await storage.softDelete("series", id);
    if (!weg.ok) return weg;

    return { ok: true, value: gekoppeld.length };
  }

  // Geen `wijzig`: §6.5.3 kent alleen aanmaken en verwijderen. Een methode die
  // geen enkel scherm aanroept is een functie die er "even bij" kwam (DR-03).
  return { lijst, maak, aantalDocumentaties, verwijder };
}

export type SeriesService = ReturnType<typeof createSeriesService>;
