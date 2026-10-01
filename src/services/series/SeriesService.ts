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

import { maakPrullenbak } from "../prullenbak";
import type { Clock, StorageService } from "../storage/StorageService";

export interface SeriesDeps {
  storage: StorageService;
  /** Voor de resterende dagen in de prullenbak (B-138). */
  clock: Clock;
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

  // Een reeks heeft geen kinderen: documentaties horen er niet bij, ze verwijzen
  // ernaar. Dat verschil is precies wat B-35 en INV-20 bewaken.
  const bak = maakPrullenbak(storage, deps.clock, "series");

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
   * Verwijdert de reeks en laat de documentaties bestaan (INV-20, `FR-INS-12`, B-138).
   *
   * **De verwijzing wordt niet leeggemaakt.** Dat gebeurde tot B-138 wel, en toen was
   * er ook geen weg terug. Nu er een prullenbak is, zou wissen betekenen dat je de
   * reeks terugzet en je documentaties er niet meer aan hangen — een halve
   * herstelling, en dat is erger dan geen. §8.1.6 noemt dit als tweede reden om te
   * markeren in plaats van te wissen: *verwijzingen blijven geldig*.
   *
   * Voor de gebruiker verandert er niets aan wat `FR-INS-12` belooft: `list()` laat
   * verwijderde reeksen weg, dus de documentatie toont de reeks niet meer, het
   * reeksfilter kent hem niet meer, en de zoekindex vindt zijn naam niet meer.
   */
  async function verwijder(id: Uuid): Promise<Result<number>> {
    const gekoppeld = await aantalDocumentaties(id);
    if (!gekoppeld.ok) return gekoppeld;

    const weg = await bak.verwijder(id);
    if (!weg.ok) return weg;

    return { ok: true, value: gekoppeld.value };
  }

  // Geen `wijzig`: §6.5.3 kent alleen aanmaken en verwijderen. Een methode die
  // geen enkel scherm aanroept is een functie die er "even bij" kwam (DR-03).
  return {
    lijst,
    maak,
    aantalDocumentaties,
    verwijder,
    herstel: bak.herstel,
    prullenbak: bak.inhoud,
    leegPrullenbak: bak.leeg,
    ruimOp: bak.ruimOp,
  };
}

export type SeriesService = ReturnType<typeof createSeriesService>;
