/**
 * De basisweek (`FR-AGE-29` t/m `FR-AGE-31`, B-115, B-146).
 *
 * **De basisweek is een invoerscherm, geen tweede gegevensmodel.** Dat is B-115
 * woordelijk, en het is de hele architectuur van dit bestand. Je vult je vaste week
 * in, en de app maakt daar gewone wekelijks herhalende agenda-items van. Daarna
 * gedragen ze zich als elk ander item: verplaatsbaar, te wijzigen met "alleen deze
 * of alle volgende", en ze gaan mee in de ICS-export.
 *
 * **Er wordt hier niets opgeslagen wat de agenda niet al weet.** Wat je op het
 * scherm terugziet is uitgelezen uit de agenda zelf: de wekelijks herhalende items
 * met herkomst `derived`. Daarmee bestaat er geen tweede waarheid die stilletjes uit
 * de eerste kan lopen — de fout die U-05 en DR-03 verbieden, en de reden dat B-131
 * de twee oude `weekPattern`-tabellen heeft afgeschaft.
 *
 * **Herkomst, geen eigenaar** (`FR-AGE-31`). `source: "derived"` zegt waar het item
 * vandaan komt en verder niets. Verplaats je één gymles, dan maakt dat er een
 * losgemaakt item van dat hier niet meer in de lijst staat en dat door een latere
 * wijziging aan de basisweek ongemoeid blijft. Dat is de bedoeling: de basisweek
 * vult je week één keer, hij bestuurt hem niet.
 */

import { plusDagen, weekdag, type IsoDate, type IsoDateTime, type LocalTime } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import { dagMetTijd } from "@/lib/weergave";
import type { CalendarEvent, SchoolYear } from "@/domain/types";

import { vakantieOp, type Vakantie } from "./HolidayService";

/** Maandag tot en met zondag, met het ISO-nummer dat `weekdag()` teruggeeft. */
export const WEEKDAGEN = [
  { nummer: 1, naam: "Maandag" },
  { nummer: 2, naam: "Dinsdag" },
  { nummer: 3, naam: "Woensdag" },
  { nummer: 4, naam: "Donderdag" },
  { nummer: 5, naam: "Vrijdag" },
  { nummer: 6, naam: "Zaterdag" },
  { nummer: 7, naam: "Zondag" },
] as const;

/** Eén regel van je vaste week, zoals het scherm hem aanlevert. */
export interface Basisonderdeel {
  /** 1 voor maandag tot en met 7 voor zondag (ISO 8601). */
  weekdag: number;
  /** Wandkloktijd, want bij het invullen is nog niet bekend op welke datum dit valt. */
  van: LocalTime;
  tot: LocalTime;
  title: string;
}

/**
 * De eerste dag op of na `vanaf` die op deze weekdag valt.
 *
 * Het eerste exemplaar bepaalt de hele reeks: een wekelijkse herhaling telt vanaf
 * zijn eigen begindag. Begint het schooljaar op een maandag en vul je een dinsdag
 * in, dan is het eerste exemplaar de dag erna — en niet de dinsdag van de week
 * daarvoor, die buiten het schooljaar valt.
 */
export function eersteDagOpOfNa(vanaf: IsoDate, dagnummer: number): IsoDate {
  const verschil = (dagnummer - weekdag(vanaf) + 7) % 7;
  return plusDagen(vanaf, verschil);
}

/** Wat er mis is met dit onderdeel, of `null`. */
export function bezwaarTegen(onderdeel: Basisonderdeel, jaar: SchoolYear | null): string | null {
  if (!jaar) {
    return "Stel eerst je schooljaar in; zonder begin- en einddatum is er geen week om te vullen.";
  }
  if (onderdeel.title.trim() === "") return "Geef dit onderdeel een naam.";
  if (onderdeel.tot <= onderdeel.van) return "De eindtijd ligt vóór de begintijd.";
  return null;
}

/**
 * De dagen van deze wekelijkse reeks die in een vakantie vallen (`FR-AGE-36`, B-148).
 *
 * Een gymles hoort niet in de herfstvakantie te staan. Zo'n les is geen afspraak die
 * je bent vergeten af te zeggen — hij heeft nooit bestaan, want er was geen school.
 *
 * **Het gat staat in `excludedDates` en wordt niet bij het tekenen weggelaten.** Dat
 * veld betekent letterlijk "de dagen waarop deze reeks niet valt"; dat een losgemaakt
 * item er ook een achterlaat is één bron van gaten en niet de definitie. Zo klopt de
 * reeks overal tegelijk: in de week, in de maand, in het jaar, in de ICS-export en in
 * de meldingen — zonder dat elk van die plekken de vakanties hoeft te kennen.
 */
export function vakantiegaten(
  eerste: IsoDate,
  laatste: IsoDate,
  vakanties: readonly Vakantie[],
): IsoDate[] {
  const gaten: IsoDate[] = [];
  for (let dag = eerste; dag <= laatste; dag = plusDagen(dag, 7)) {
    if (vakantieOp(dag, vakanties)) gaten.push(dag);
  }
  return gaten;
}

/**
 * Het agenda-item dat bij dit onderdeel hoort (`FR-AGE-29`, `FR-AGE-36`).
 *
 * Wekelijks, tot en met de laatste schooldag. `until` en niet `count`, want een
 * schooljaar heeft een einddatum en geen aantal weken — en B-123 staat er precies
 * één van de twee toe.
 *
 * De vakanties worden er meteen uitgeknipt. Zonder vakantiegegevens — het bestand
 * loopt af, of je hebt nog geen regio gekozen — blijft de reeks gewoon doorlopen; dat
 * is hetzelfde als wat §6.2.10 geval 5 voor de rest van de agenda afspreekt.
 */
export function alsAgendainvoer(
  onderdeel: Basisonderdeel,
  jaar: SchoolYear,
  vakanties: readonly Vakantie[] = [],
) {
  const eerste = eersteDagOpOfNa(jaar.firstSchoolDay, onderdeel.weekdag);

  return {
    title: onderdeel.title.trim(),
    kind: "afspraak" as const,
    allDay: false as const,
    start: dagMetTijd(eerste, onderdeel.van) as IsoDateTime,
    end: dagMetTijd(eerste, onderdeel.tot) as IsoDateTime,
    source: "derived" as const,
    recurrence: {
      frequency: "wekelijks" as const,
      until: jaar.lastSchoolDay,
      count: null,
      excludedDates: vakantiegaten(eerste, jaar.lastSchoolDay, vakanties),
    },
  };
}

/**
 * Komt dit item uit de basisweek? (`FR-AGE-31`)
 *
 * **Alleen de herkomst, en met opzet niets meer.** Een verschijning van een reeks
 * draagt geen `recurrence` — `RecurrenceService` haalt die er bewust af, want een
 * verschijning *is* de reeks niet. Zou hier ook op de herhaling gekeken worden, dan
 * zei de agenda alleen bij de allereerste gymles waar hij vandaan kwam en bij de
 * veertig daarna niet.
 *
 * Wijzig je een item met "alle volgende", dan maakt de agenda er een nieuwe reeks
 * van die `own` is. Dat is geen verlies: vanaf dat moment is het van jou, en dat is
 * precies wat "herkomst, geen eigenaar" betekent.
 */
export function uitBasisweek(item: Pick<CalendarEvent, "source">): boolean {
  return item.source === "derived";
}

/** De opgeslagen reeksen die het basisweekscherm beheert — niet hun verschijningen. */
export function isBasisweekreeks(item: CalendarEvent): boolean {
  return uitBasisweek(item) && item.recurrence?.frequency === "wekelijks";
}

/**
 * De basisweek zoals hij in de agenda staat, op dag en tijd gesorteerd.
 *
 * Dit is het hele "gegevensmodel" van de basisweek: een vraag aan de agenda.
 */
export function basisweekVan(items: readonly CalendarEvent[]): CalendarEvent[] {
  return items
    .filter(isBasisweekreeks)
    .toSorted((a, b) => {
      const dagverschil = weekdag(a.start.slice(0, 10)) - weekdag(b.start.slice(0, 10));
      return dagverschil !== 0 ? dagverschil : a.start.slice(11).localeCompare(b.start.slice(11));
    });
}

/** Het bezwaar als `Result`, zodat het scherm één vorm ziet (DR-15). */
export function gecontroleerd(
  onderdeel: Basisonderdeel,
  jaar: SchoolYear | null,
): Result<SchoolYear> {
  const reden = bezwaarTegen(onderdeel, jaar);
  if (reden || !jaar) return ongeldig(reden ?? "Er is geen schooljaar ingesteld.");
  return { ok: true, value: jaar };
}
