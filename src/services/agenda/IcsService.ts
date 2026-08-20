/**
 * ICS-export (§6.2.7, `FR-AGE-20`, `FR-AGE-27`).
 *
 * **Dit is geen omweg maar het eerlijke antwoord** op "de agenda moet werken zoals op
 * mijn telefoon" (§6.2.9). EduFlow bezit het schooljaar; de agenda-app op je telefoon
 * doet het klokwerk, en die is daar beter in dan een webapp ooit wordt.
 *
 * **De `UID` is stabiel en komt uit het `id`** (`FR-AGE-20`). Daardoor herkent je
 * agenda-app bij een tweede import dat het om dezelfde afspraak gaat en zet hij hem
 * niet nog een keer neer. Een willekeurige `UID` per export zou bij elke import een
 * volledige kopie van je schooljaar opleveren.
 *
 * Wat er **niet** in gaat: de afgeleide verjaardagen en de koppelingen. De eerste zijn
 * geen records (`FR-AGE-05`), de tweede betekenen buiten EduFlow niets.
 */

import { plusDagen, type IsoDate } from "@/lib/dates";
import type { CalendarEvent } from "@/domain/types";

import { verschijningen } from "./RecurrenceService";
import type { Vakantie } from "./HolidayService";

/** De naam waaronder deze agenda in je telefoon verschijnt. */
const KALENDERNAAM = "EduFlow";

/** Het domein achter de `UID`; het hoeft niet te bestaan, wel uniek te zijn. */
const UID_DOMEIN = "eduflow.local";

/** RFC 5545 wil regels van hoogstens 75 octetten, met een spatie als vervolg. */
const MAX_REGELLENGTE = 75;

/**
 * Tekens die in een ICS-waarde een betekenis hebben en dus ontsnapt moeten worden.
 *
 * Zonder dit maakt een titel met een komma — "Gesprek over Kjeld, met beide ouders" —
 * van één veld twee, en dan staat de helft van je titel in het verkeerde vak.
 */
function ontsnap(waarde: string): string {
  return waarde
    .replace(/\\/gu, "\\\\")
    .replace(/;/gu, "\\;")
    .replace(/,/gu, "\\,")
    .replace(/\n/gu, "\\n");
}

/** Een tijdstip in de vorm die ICS wil: `20261013T120000Z`. */
function alsTijdstempel(tijdstip: string): string {
  return tijdstip.replace(/[-:]/gu, "").replace(/\.\d{3}/u, "");
}

/** Een kalenderdag in de vorm die ICS wil: `20261013`. */
function alsDagstempel(dag: IsoDate): string {
  return dag.replace(/-/gu, "");
}

/**
 * Vouwt een te lange regel op de manier die RFC 5545 voorschrijft.
 *
 * Niet vouwen levert bestanden op die sommige agenda-apps stilzwijgend afkappen — en
 * dan mist er een titel waarvan niemand weet waar hij gebleven is.
 */
function vouw(regel: string): string[] {
  if (regel.length <= MAX_REGELLENGTE) return [regel];

  const stukken = [regel.slice(0, MAX_REGELLENGTE)];
  for (let plaats = MAX_REGELLENGTE; plaats < regel.length; plaats += MAX_REGELLENGTE - 1) {
    stukken.push(` ${regel.slice(plaats, plaats + MAX_REGELLENGTE - 1)}`);
  }
  return stukken;
}

interface Gebeurtenis {
  uid: string;
  samenvatting: string;
  begin: string;
  einde: string;
  heleDag: boolean;
  omschrijving: string;
  plaats: string;
}

/** Een agenda-item als ICS-gebeurtenis. */
function vanItem(item: CalendarEvent): Gebeurtenis {
  return {
    uid: item.id,
    samenvatting: item.title,
    // Een hele-dag-gebeurtenis eindigt in ICS de dag ná de laatste dag.
    begin: item.allDay ? alsDagstempel(item.start) : alsTijdstempel(item.start),
    einde: item.allDay ? alsDagstempel(plusDagen(item.end, 1)) : alsTijdstempel(item.end),
    heleDag: item.allDay,
    omschrijving: item.note,
    plaats: item.location,
  };
}

/** Een vakantie als ICS-gebeurtenis; de sleutel maakt hem herkenbaar bij een tweede import. */
function vanVakantie(vakantie: Vakantie): Gebeurtenis {
  return {
    uid: `vakantie-${vakantie.schoolYearName}-${vakantie.region}-${vakantie.holidayKey}`,
    samenvatting: vakantie.name,
    begin: alsDagstempel(vakantie.from),
    einde: alsDagstempel(plusDagen(vakantie.to, 1)),
    heleDag: true,
    omschrijving: "",
    plaats: "",
  };
}

function regelsVan(gebeurtenis: Gebeurtenis, gemaaktOp: string): string[] {
  const waarde = gebeurtenis.heleDag ? "VALUE=DATE:" : ":";

  return [
    "BEGIN:VEVENT",
    `UID:${gebeurtenis.uid}@${UID_DOMEIN}`,
    `DTSTAMP:${alsTijdstempel(gemaaktOp)}`,
    `DTSTART;${waarde}${gebeurtenis.begin}`.replace(";:", ":"),
    `DTEND;${waarde}${gebeurtenis.einde}`.replace(";:", ":"),
    `SUMMARY:${ontsnap(gebeurtenis.samenvatting)}`,
    ...(gebeurtenis.omschrijving ? [`DESCRIPTION:${ontsnap(gebeurtenis.omschrijving)}`] : []),
    ...(gebeurtenis.plaats ? [`LOCATION:${ontsnap(gebeurtenis.plaats)}`] : []),
    "END:VEVENT",
  ];
}

export interface Icsinvoer {
  items: readonly CalendarEvent[];
  vakanties: readonly Vakantie[];
  /** De periode waarover herhalende items worden uitgeschreven. */
  van: IsoDate;
  tot: IsoDate;
  gemaaktOp: string;
}

/**
 * Het hele bestand als tekenreeks (`FR-AGE-20`).
 *
 * Herhalende items worden **uitgeschreven** en niet als `RRULE` meegegeven. Dat is
 * bewust: §6.2.5 kent drie regels en `RRULE` kent er honderd, en een reeks die in de
 * ene app anders uitvalt dan in de andere is erger dan een reeks die overal hetzelfde
 * is. Elke verschijning houdt zijn eigen stabiele `UID`.
 */
export function naarIcs(invoer: Icsinvoer): string {
  const gebeurtenissen = [
    ...invoer.items
      // De afgeleide verjaardagen horen er niet in (§6.2.7).
      .filter((item) => item.kind !== "verjaardag")
      .flatMap((item) => verschijningen(item, invoer.van, invoer.tot))
      .map(vanItem),
    ...invoer.vakanties.map(vanVakantie),
  ];

  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${KALENDERNAAM}//NL`,
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${KALENDERNAAM}`,
    ...gebeurtenissen.flatMap((gebeurtenis) => regelsVan(gebeurtenis, invoer.gemaaktOp)),
    "END:VCALENDAR",
  ];

  // CRLF, want RFC 5545 schrijft het voor en sommige apps lopen er werkelijk op vast.
  return `${regels.flatMap(vouw).join("\r\n")}\r\n`;
}

/** De bestandsnaam: terug te vinden in een map met downloads. */
export function icsBestandsnaam(schooljaar: string): string {
  return `EduFlow ${schooljaar}.ics`;
}
