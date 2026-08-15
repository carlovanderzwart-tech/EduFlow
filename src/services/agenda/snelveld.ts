/**
 * Het snelveld (§6.2.5, `FR-AGE-13`, `FR-AGE-14`).
 *
 * "dinsdag 14u oudergesprek Noa V." wordt hier een concept-item. **Volledig lokaal**,
 * met een handvol reguliere expressies en `lib/dates.ts`.
 *
 * Dat is `FR-AGE-13`, en de werkopdracht noemt het de kuil van deze opdracht: door de
 * AI halen is verleidelijk en het is de eis in één klap. Een agenda-item aanmaken
 * hoort nooit een netwerkaanroep, een wachttijd en een gegevensstroom te zijn — en de
 * invoer bevat vrijwel altijd een naam.
 *
 * **Wat niet herkend wordt, wordt de titel.** Niet weggegooid, niet geraden: er blijft
 * altijd iets over om het item mee terug te vinden. En het resultaat gaat als
 * zichtbaar concept naar het scherm vóór bevestiging (`FR-AGE-14`), zodat een
 * verkeerde gok jou niet verrast maar jij hem corrigeert.
 */

import { plusDagen, weekdag, type IsoDate, type LocalTime } from "@/lib/dates";
import { foldDiacritics } from "@/lib/text";
import type { Uuid } from "@/lib/uuid";

import { HELE_DAG_STANDAARD, type EigenSoort } from "./AgendaService";

/** §6.2.2: een afspraak duurt standaard een half uur. */
export const STANDAARDDUUR_MINUTEN = 30;

const MINUTEN_PER_UUR = 60;

/** Wat er van een woord herkend is; het scherm markeert ze (`FR-AGE-14`). */
export type Woordsoort = "datum" | "tijd" | "duur" | "soort" | "leerling";

export interface Herkenning {
  woord: string;
  soort: Woordsoort;
}

export interface Snelveldresultaat {
  titel: string;
  kind: EigenSoort;
  dag: IsoDate;
  /** De begintijd, of `null` als het een hele dag beslaat. */
  van: LocalTime | null;
  duurMinuten: number;
  studentIds: Uuid[];
  herkend: Herkenning[];
}

export interface Snelveldlijst {
  /** De leerlingen, met de naam zoals hij in een zin staat: "Noa B." */
  leerlingen: readonly { id: Uuid; naam: string }[];
}

/**
 * De soortwoorden en hun gangbare synoniemen (§6.2.5).
 *
 * De langste eerst binnen elke soort, zodat "oudergesprek" niet op "gesprek"
 * stukloopt. De volgorde van de soorten zelf telt ook: wie "documentatiemoment"
 * typt, bedoelt dat en niet "moment".
 */
const SOORTWOORDEN: [EigenSoort, string[]][] = [
  ["documentatiemoment", ["documentatiemoment", "documenteren", "documentatie"]],
  ["oudergesprek", ["oudergesprek", "ouderavond", "tienminutengesprek", "gesprek"]],
  ["studiedag", ["studiedag", "teamdag"]],
  ["margedag", ["margedag", "margedagen"]],
  ["herinnering", ["herinnering", "niet vergeten", "denk aan"]],
  ["afspraak", ["afspraak", "vergadering", "bijeenkomst", "overleg"]],
];

const WEEKDAGEN = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

/** De vier woorden voor het hele uur en de kwartieren eromheen. */
const HALF = /\bhalf\s+(\d{1,2})\b/iu;
const KWART_VOOR = /\bkwart\s+voor\s+(\d{1,2})\b/iu;
const KWART_OVER = /\bkwart\s+over\s+(\d{1,2})\b/iu;
const KLOKTIJD = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/u;
const UURTIJD = /\b([01]?\d|2[0-3])\s*u(?:ur)?\b/iu;

const DUUR_MINUTEN = /\b(\d{1,3})\s*min(?:uten)?\b/iu;
const DUUR_UUR = /\b(\d{1,2})\s*uur\b/iu;
const ANDERHALF = /\banderhalf\s+uur\b/iu;

const DATUM_KORT = /\b(\d{1,2})-(\d{1,2})(?:-(\d{4}))?\b/u;

/** Twee cijfers, want een tijd van 9:5 bestaat niet. */
function tijd(uur: number, minuut: number): LocalTime {
  return `${String(uur).padStart(2, "0")}:${String(minuut).padStart(2, "0")}`;
}

/** Haalt een stuk uit de tekst en onthoudt wat het was. */
function pak(tekst: string, patroon: RegExp, herkend: Herkenning[], soort: Woordsoort) {
  const gevonden = patroon.exec(tekst);
  if (!gevonden) return { tekst, gevonden: null };

  herkend.push({ woord: gevonden[0], soort });
  return { tekst: tekst.replace(gevonden[0], " "), gevonden };
}

/** De eerstvolgende dag met deze weekdag; vandaag telt mee (§6.2.5). */
function volgendeWeekdag(vandaag: IsoDate, gewenst: number): IsoDate {
  return plusDagen(vandaag, (gewenst - weekdag(vandaag) + 7) % 7);
}

/** De datum uit de tekst, of vandaag. */
function leesDatum(tekst: string, vandaag: IsoDate, herkend: Herkenning[]) {
  for (const [woord, dagen] of [
    ["overmorgen", 2],
    ["morgen", 1],
    ["vandaag", 0],
  ] as const) {
    if (new RegExp(`\\b${woord}\\b`, "iu").test(tekst)) {
      herkend.push({ woord, soort: "datum" });
      return { tekst: tekst.replace(new RegExp(`\\b${woord}\\b`, "iu"), " "), dag: plusDagen(vandaag, dagen) };
    }
  }

  const kort = pak(tekst, DATUM_KORT, herkend, "datum");
  if (kort.gevonden) {
    const [, dag, maand, jaar] = kort.gevonden;
    const jjjj = jaar ?? vandaag.slice(0, 4);
    return {
      tekst: kort.tekst,
      dag: `${jjjj}-${maand!.padStart(2, "0")}-${dag!.padStart(2, "0")}` as IsoDate,
    };
  }

  for (const [plaats, naam] of WEEKDAGEN.entries()) {
    const patroon = new RegExp(`\\b${naam}\\b`, "iu");
    if (!patroon.test(foldDiacritics(tekst))) continue;

    herkend.push({ woord: naam, soort: "datum" });
    return { tekst: tekst.replace(patroon, " "), dag: volgendeWeekdag(vandaag, plaats + 1) };
  }

  return { tekst, dag: vandaag };
}

/** De begintijd uit de tekst, of `null`. */
function leesTijd(tekst: string, herkend: Herkenning[]) {
  const half = pak(tekst, HALF, herkend, "tijd");
  if (half.gevonden) {
    // "half 3" is half drie: dertig minuten vóór drie uur.
    return { tekst: half.tekst, van: tijd(Number(half.gevonden[1]) - 1, 30) };
  }

  const kwartVoor = pak(tekst, KWART_VOOR, herkend, "tijd");
  if (kwartVoor.gevonden) {
    return { tekst: kwartVoor.tekst, van: tijd(Number(kwartVoor.gevonden[1]) - 1, 45) };
  }

  const kwartOver = pak(tekst, KWART_OVER, herkend, "tijd");
  if (kwartOver.gevonden) {
    return { tekst: kwartOver.tekst, van: tijd(Number(kwartOver.gevonden[1]), 15) };
  }

  const klok = pak(tekst, KLOKTIJD, herkend, "tijd");
  if (klok.gevonden) {
    return { tekst: klok.tekst, van: tijd(Number(klok.gevonden[1]), Number(klok.gevonden[2])) };
  }

  const uur = pak(tekst, UURTIJD, herkend, "tijd");
  if (uur.gevonden) return { tekst: uur.tekst, van: tijd(Number(uur.gevonden[1]), 0) };

  return { tekst, van: null };
}

/** De duur uit de tekst, of de standaard van een half uur. */
function leesDuur(tekst: string, herkend: Herkenning[]) {
  if (ANDERHALF.test(tekst)) {
    herkend.push({ woord: "anderhalf uur", soort: "duur" });
    return { tekst: tekst.replace(ANDERHALF, " "), duur: 90 };
  }

  const minuten = pak(tekst, DUUR_MINUTEN, herkend, "duur");
  if (minuten.gevonden) return { tekst: minuten.tekst, duur: Number(minuten.gevonden[1]) };

  const uren = pak(tekst, DUUR_UUR, herkend, "duur");
  if (uren.gevonden) {
    return { tekst: uren.tekst, duur: Number(uren.gevonden[1]) * MINUTEN_PER_UUR };
  }

  return { tekst, duur: STANDAARDDUUR_MINUTEN };
}

/** De soort uit de tekst, of een afspraak. */
function leesSoort(tekst: string, herkend: Herkenning[]) {
  for (const [soort, woorden] of SOORTWOORDEN) {
    for (const woord of woorden) {
      const patroon = new RegExp(`\\b${woord}\\b`, "iu");
      if (!patroon.test(tekst)) continue;

      herkend.push({ woord, soort: "soort" });
      return { tekst: tekst.replace(patroon, " "), kind: soort };
    }
  }

  return { tekst, kind: "afspraak" as EigenSoort };
}

/** De leerlingen uit de tekst. De langste naam eerst: "Noa B." vóór "Noa". */
function leesLeerlingen(tekst: string, lijst: Snelveldlijst, herkend: Herkenning[]) {
  let over = tekst;
  const studentIds: Uuid[] = [];

  for (const leerling of [...lijst.leerlingen].sort((a, b) => b.naam.length - a.naam.length)) {
    const ontsnapt = leerling.naam.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const patroon = new RegExp(`(?<![\\p{L}\\p{N}])${ontsnapt}(?![\\p{L}\\p{N}])`, "iu");
    if (!patroon.test(over)) continue;

    herkend.push({ woord: leerling.naam, soort: "leerling" });
    studentIds.push(leerling.id);
    over = over.replace(patroon, " ");
  }

  return { tekst: over, studentIds };
}

/**
 * Ontleedt één regel uit het snelveld.
 *
 * De volgorde is niet willekeurig: eerst de leerlingen, want een naam mag niet in
 * stukken vallen door een tijdwoord dat erin zit. Daarna soort, datum, tijd, duur —
 * van specifiek naar algemeen, zodat "half 3" niet als het getal 3 eindigt.
 */
export function ontleed(regel: string, vandaag: IsoDate, lijst: Snelveldlijst): Snelveldresultaat {
  const herkend: Herkenning[] = [];

  const metLeerlingen = leesLeerlingen(regel, lijst, herkend);
  const metSoort = leesSoort(metLeerlingen.tekst, herkend);
  const metDatum = leesDatum(metSoort.tekst, vandaag, herkend);
  const metTijd = leesTijd(metDatum.tekst, herkend);
  const metDuur = leesDuur(metTijd.tekst, herkend);

  const titel = metDuur.tekst.replace(/\s+/gu, " ").trim();
  const heleDag = metTijd.van === null && HELE_DAG_STANDAARD[metSoort.kind];

  return {
    // Wat niet herkend is, wordt de titel. Blijft er niets over, dan draagt de soort
    // hem — een item zonder titel is niet op te slaan (§6.2.2).
    titel: titel || SOORTTITEL[metSoort.kind],
    kind: metSoort.kind,
    dag: metDatum.dag,
    van: heleDag ? null : (metTijd.van ?? "09:00"),
    duurMinuten: metDuur.duur,
    studentIds: metLeerlingen.studentIds,
    herkend,
  };
}

/** De titel die een soort krijgt als de regel verder niets bevat. */
const SOORTTITEL: Record<EigenSoort, string> = {
  afspraak: "Afspraak",
  oudergesprek: "Oudergesprek",
  studiedag: "Studiedag",
  margedag: "Margedag",
  herinnering: "Herinnering",
  documentatiemoment: "Documentatiemoment",
};
