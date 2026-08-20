/**
 * Herhalende items (§6.2.5, B-123, §10.4).
 *
 * **Drie regels en geen `RRULE`**: elke week, elke twee weken, elke maand op dezelfde
 * weekdag. Dat is een bewuste keuze van §6.2.5 en geen bezuiniging — een volledige
 * `RRULE` is een week werk waar niemand om heeft gevraagd (DR-03).
 *
 * **De opslag draagt één record per reeks, niet per instantie** (U-02). Wat af te
 * leiden is wordt niet opgeslagen: honderd wekelijkse gymlessen zijn honderd records
 * die allemaal moeten meebewegen als je de tijd verzet. Hier wordt uitgerekend welke
 * dagen een reeks raakt binnen de periode die je bekijkt.
 *
 * Deze module raakt de opslag niet en is te toetsen zonder database.
 */

import {
  dagenTussen,
  plusDagen,
  plusMaanden,
  weekdag,
  type IsoDate,
} from "@/lib/dates";
import type { CalendarEvent, Recurrence, RecurrenceFrequency } from "@/domain/types";

import { dagenVanItem } from "./itemdagen";

/** Hoeveel dagen een frequentie opschuift; maandelijks rekent anders (§6.2.5). */
const STAP_IN_DAGEN: Record<RecurrenceFrequency, number> = {
  wekelijks: 7,
  tweewekelijks: 14,
  maandelijks: 0,
};

/** Nederlandse namen voor de schermen; de code houdt de sleutels aan (§9.9). */
export const FREQUENTIENAMEN: Record<RecurrenceFrequency, string> = {
  wekelijks: "Elke week",
  tweewekelijks: "Elke twee weken",
  maandelijks: "Elke maand op dezelfde weekdag",
};

/**
 * De bovengrens op het uitrekenen.
 *
 * Een reeks eindigt altijd op een datum of na een aantal keren (B-123), dus deze
 * grens hoort onbereikbaar te zijn. Hij staat er als vangnet: een reeks die door een
 * fout tóch geen einde heeft, hangt de agenda niet op.
 */
const MAX_INSTANTIES = 500;

/** Eén verschijning van een reeks: de begindag, en of hij losgemaakt is. */
export interface Instantie {
  /** De kalenderdag waarop deze verschijning begint. */
  dag: IsoDate;
  /** `true` bij de eerste; die staat als record in de opslag. */
  eerste: boolean;
}

/**
 * De volgende dag van de reeks.
 *
 * Maandelijks betekent **dezelfde weekdag**, niet dezelfde datum: de derde dinsdag
 * blijft de derde dinsdag. Dat is wat §6.2.5 met "elke maand op dezelfde weekdag"
 * bedoelt, en het is de reden dat dit geen simpele optelling is.
 */
function volgende(dag: IsoDate, frequency: RecurrenceFrequency): IsoDate {
  if (frequency !== "maandelijks") return plusDagen(dag, STAP_IN_DAGEN[frequency]);

  const gewensteWeekdag = weekdag(dag);
  // De hoeveelste keer die weekdag in de maand valt: 1 voor de eerste dinsdag.
  const hoeveelste = Math.floor((Number(dag.slice(8, 10)) - 1) / 7) + 1;

  const volgendeMaand = plusMaanden(dag, 1);
  const eersteGewenste = plusDagen(
    volgendeMaand,
    (gewensteWeekdag - weekdag(volgendeMaand) + 7) % 7,
  );

  const kandidaat = plusDagen(eersteGewenste, (hoeveelste - 1) * 7);
  // Bestaat de vijfde dinsdag niet in deze maand, dan wordt het de laatste.
  return kandidaat.slice(0, 7) === volgendeMaand.slice(0, 7)
    ? kandidaat
    : plusDagen(kandidaat, -7);
}

/**
 * Alle dagen waarop deze reeks begint, vanaf de eerste.
 *
 * De gaten uit `excludedDates` vallen eruit; ze tellen wél mee voor `count`, want
 * §6.2.5 noemt het een gat in de reeks en niet een verschuiving ervan.
 */
export function instanties(begin: IsoDate, regel: Recurrence): Instantie[] {
  const uit: Instantie[] = [];
  const uitgesloten = new Set(regel.excludedDates);
  const maximum = regel.count ?? MAX_INSTANTIES;

  let dag = begin;
  for (let nummer = 0; nummer < maximum && nummer < MAX_INSTANTIES; nummer += 1) {
    if (regel.until && dag > regel.until) break;
    if (!uitgesloten.has(dag)) uit.push({ dag, eerste: nummer === 0 });
    dag = volgende(dag, regel.frequency);
  }

  return uit;
}

/**
 * De verschijningen van een item binnen een periode, als losse items.
 *
 * De eerste houdt zijn eigen `id`; de rest krijgt er een die uit het `id` en de dag
 * is opgebouwd. Zo blijft een verschijning herkenbaar tussen twee renders door,
 * zonder dat er iets wordt opgeslagen.
 */
export function verschijningen(
  item: CalendarEvent,
  van: IsoDate,
  tot: IsoDate,
): CalendarEvent[] {
  if (!item.recurrence) return [item];

  const eigenDagen = dagenVanItem(item);
  const duur = eigenDagen.length - 1;

  return instanties(eigenDagen[0]!, item.recurrence)
    .filter(({ dag }) => dag <= tot && plusDagen(dag, duur) >= van)
    .map(({ dag, eerste }) => (eerste ? item : verschoven(item, dagenTussen(eigenDagen[0]!, dag))));
}

/** Hetzelfde item, zoveel dagen later. Zonder de reeksregel: dit ís een verschijning. */
function verschoven(item: CalendarEvent, dagen: number): CalendarEvent {
  const schuif = (waarde: string) =>
    item.allDay
      ? plusDagen(waarde, dagen)
      : new Date(new Date(waarde).getTime() + dagen * 86_400_000).toISOString();

  return {
    ...item,
    id: `${item.id}:${plusDagen(item.start.slice(0, 10), dagen)}`,
    start: schuif(item.start),
    end: schuif(item.end),
    recurrence: null,
  } as CalendarEvent;
}

/** Is dit een uitgerekende verschijning en niet het opgeslagen record? */
export function isVerschijning(id: string): boolean {
  return id.includes(":");
}

/** De sleutel van het opgeslagen record waar deze verschijning bij hoort. */
export function reeksVan(id: string): string {
  return id.split(":")[0]!;
}

/**
 * De reikwijdte van een wijziging (`FR-AGE-15`).
 *
 * "Alleen deze" maakt de dag los: er komt een gat in de reeks en een gewoon item op
 * die dag. "Alle volgende" knipt de reeks: de oude stopt de dag ervoor, en er begint
 * een nieuwe met de wijziging erin. Beide laten de verleden tijd met rust, en dat is
 * de bedoeling — wat geweest is, is geweest.
 */
export type Reikwijdte = "deze" | "volgende";

/** De reeks met een gat op deze dag (`FR-AGE-15`, reikwijdte "alleen deze"). */
export function metGat(regel: Recurrence, dag: IsoDate): Recurrence {
  return regel.excludedDates.includes(dag)
    ? regel
    : { ...regel, excludedDates: [...regel.excludedDates, dag] };
}

/**
 * De reeks afgekapt vóór deze dag (`FR-AGE-15`, reikwijdte "alle volgende").
 *
 * Een reeks die op een aantal keren eindigde, eindigt hierna op een datum: hoeveel
 * keren er vóór het knippunt vielen is bekend, maar dat getal opnieuw uitrekenen bij
 * elke wijziging is een som die stilletjes uit de pas gaat lopen.
 */
export function afgekaptVoor(regel: Recurrence, dag: IsoDate): Recurrence {
  return {
    ...regel,
    until: plusDagen(dag, -1),
    count: null,
    excludedDates: regel.excludedDates.filter((gat) => gat < dag),
  };
}
