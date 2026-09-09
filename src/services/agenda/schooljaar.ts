/**
 * Het schooljaar als raster (§6.2.3, B-10).
 *
 * De jaarweergave moet in één oogopslag laten zien wanneer de studiedag valt. Wat
 * daarvoor nodig is, is niet "de agenda tekenen" maar één antwoord per dag: is dit
 * een schooldag, een weekend, een vakantie, een studiedag of een margedag? Dat
 * antwoord wordt hier berekend en niet in de weergave, want anders staat "welke dag
 * is wat" straks op vier plekken (DR-15).
 *
 * Deze module raakt de opslag niet en is daarmee te toetsen zonder database.
 */

import { dagenVan, isWeekend, plusMaanden, type IsoDate } from "@/lib/dates";
import type { CalendarEvent } from "@/domain/types";

import type { Vakantie } from "./HolidayService";
import { dagenVanItem } from "./itemdagen";

/** Wat een dag in de jaarweergave is. De volgorde is de voorrangsvolgorde. */
export type Dagsoort = "vakantie" | "studiedag" | "margedag" | "weekend" | "schooldag" | "buiten";

export interface Jaardag {
  dag: IsoDate;
  soort: Dagsoort;
  /** De sleutel van de vakantie, om hem zijn eigen kleur te geven. */
  holidayKey: string | null;
  /** De naam van wat er die dag is, voor het tekstlabel bij de cel. */
  label: string;
  /**
   * Hoeveel afspraken er die dag staan (`FR-AGE-33`, B-129).
   *
   * Studiedagen en margedagen tellen niet mee: die kleuren de cel al, en een stip
   * bovenop hun eigen kleur zegt niets nieuws. Een vakantie is geen agenda-item en
   * komt hier dus vanzelf niet in voor.
   */
  items: number;
}

export interface Jaartellingen {
  schooldagen: number;
  studiedagen: number;
  margedagen: number;
  vakantiedagen: number;
}

export interface Jaarmaand {
  /** De eerste van de maand, als sleutel. */
  maand: IsoDate;
  /** Eén cel per dag van de maand; de weergave vult zelf aan tot 31. */
  dagen: Jaardag[];
}

/**
 * De voorrang tussen soorten, want een dag kan meer dan één ding zijn.
 *
 * Een studiedag in een vakantie bestaat niet, maar een margedag op de vrijdag vóór
 * de meivakantie wél — en die moet je zien staan. Vandaar dat studiedag en margedag
 * vóór vakantie gaan: wat je zelf hebt ingevoerd is het bijzondere, en het
 * bijzondere hoort zichtbaar te zijn.
 */
const VOORRANG: Dagsoort[] = ["studiedag", "margedag", "vakantie", "weekend", "schooldag"];

function sterkste(soorten: Dagsoort[]): Dagsoort {
  return VOORRANG.find((soort) => soorten.includes(soort)) ?? "schooldag";
}

/**
 * Op welke dagen valt dit hele-dag-item? Een item met tijden telt hier niet mee.
 *
 * Alleen voor studiedag en margedag: die zijn per definitie hele dagen, en een
 * "studiedag" van 14:00 tot 15:00 hoort de kolom niet zwart te maken. Voor het
 * tellen van afspraken geldt het omgekeerde — daar tellen tijden juist wél mee, en
 * daarvoor staat `dagenVanItem` uit `itemdagen.ts` klaar.
 */
function heleDagenVan(item: CalendarEvent): IsoDate[] {
  return item.allDay ? dagenVan(item.start, item.end) : [];
}

export interface Jaaropzet {
  firstSchoolDay: IsoDate;
  lastSchoolDay: IsoDate;
  vakanties: readonly Vakantie[];
  items: readonly CalendarEvent[];
}

/**
 * Wat elke dag van het schooljaar is.
 *
 * Dagen buiten het schooljaar krijgen `buiten` en tellen nergens in mee: de
 * jaarweergave loopt van augustus tot juli en de randen horen er wel te staan maar
 * niet mee te tellen.
 */
export function jaardagen(opzet: Jaaropzet): Map<IsoDate, Jaardag> {
  const uit = new Map<IsoDate, Jaardag>();

  const raak = (dag: IsoDate, soort: Dagsoort, label: string, holidayKey: string | null = null) => {
    const bestaand = uit.get(dag);
    const soorten = bestaand ? [bestaand.soort, soort] : [soort];
    const winnaar = sterkste(soorten);
    const houdtOud = bestaand && winnaar === bestaand.soort && winnaar !== soort;

    uit.set(dag, {
      dag,
      soort: winnaar,
      holidayKey: houdtOud ? bestaand.holidayKey : (holidayKey ?? bestaand?.holidayKey ?? null),
      label: houdtOud ? bestaand.label : label,
      items: bestaand?.items ?? 0,
    });
  };

  for (const dag of dagenVan(opzet.firstSchoolDay, opzet.lastSchoolDay)) {
    raak(dag, isWeekend(dag) ? "weekend" : "schooldag", "");
  }

  for (const vakantie of opzet.vakanties) {
    for (const dag of dagenVan(vakantie.from, vakantie.to)) {
      if (uit.has(dag)) raak(dag, "vakantie", vakantie.name, vakantie.holidayKey);
    }
  }

  for (const item of opzet.items) {
    if (item.kind !== "studiedag" && item.kind !== "margedag") continue;
    for (const dag of heleDagenVan(item)) {
      if (uit.has(dag)) raak(dag, item.kind, item.title);
    }
  }

  // Tellen gaat ná het toekennen van de soorten: een studiedag hoort niet óók nog
  // als afspraak mee te tellen, want hij ís de kleur van de cel.
  for (const item of opzet.items) {
    if (item.kind === "studiedag" || item.kind === "margedag") continue;
    for (const dag of dagenVanItem(item)) {
      const bestaand = uit.get(dag);
      if (bestaand) bestaand.items += 1;
    }
  }

  return uit;
}

/** De tellingen onder de jaarweergave (§6.2.3). Weekenden tellen nergens in mee. */
export function jaartellingen(dagen: Map<IsoDate, Jaardag>): Jaartellingen {
  const telling: Jaartellingen = {
    schooldagen: 0,
    studiedagen: 0,
    margedagen: 0,
    vakantiedagen: 0,
  };

  for (const dag of dagen.values()) {
    if (dag.soort === "schooldag") telling.schooldagen += 1;
    if (dag.soort === "studiedag") telling.studiedagen += 1;
    if (dag.soort === "margedag") telling.margedagen += 1;
    // Een vakantiedag in het weekend is geen vrije dag die je kwijtraakt.
    if (dag.soort === "vakantie" && !isWeekend(dag.dag)) telling.vakantiedagen += 1;
  }

  return telling;
}

/**
 * De twaalf maandkolommen (§6.2.3).
 *
 * Twaalf en niet "zoveel maanden als het schooljaar raakt": een schooljaar van
 * augustus tot juli beslaat er twaalf, en een vaste breedte is wat `FR-AGE-06`
 * mogelijk maakt — één scherm van 1280 px, zonder schuiven.
 */
export const JAAR_MAANDEN = 12;

export function jaarmaanden(
  firstSchoolDay: IsoDate,
  dagen: Map<IsoDate, Jaardag>,
): Jaarmaand[] {
  const eerste = `${firstSchoolDay.slice(0, 7)}-01`;

  return Array.from({ length: JAAR_MAANDEN }, (_, plaats) => {
    const maand = plusMaanden(eerste, plaats);
    const laatste = plusMaanden(maand, 1);

    return {
      maand,
      dagen: dagenVan(maand, laatste)
        .slice(0, -1)
        .map(
          (dag) =>
            dagen.get(dag) ?? {
              dag,
              soort: "buiten" as const,
              holidayKey: null,
              label: "",
              items: 0,
            },
        ),
    };
  });
}
