/**
 * Meldingen (§6.2.9, `FR-AGE-25`, `FR-AGE-28`, B-108).
 *
 * **Alleen terwijl EduFlow open staat.** Ook op een achtergrondtabblad, maar met de
 * app dicht komt er niets. Dat is geen bezuiniging maar een grens: pushmeldingen zijn
 * op het web niet *lastig*, ze zijn onmogelijk zonder server. De Notification Triggers
 * API — de enige manier om een melding lokaal in te plannen die afgaat terwijl de app
 * dicht is — is door Chrome definitief gestaakt, en Web Push loopt altijd via een
 * pushdienst en dus via een server die weet wanneer jouw afspraak is (B-108).
 *
 * **Een halve belofte is hier schadelijker dan geen belofte.** Een gemiste herinnering
 * waarvan je dacht dat hij zou komen, is erger dan een herinnering die je nooit
 * verwachtte. Daarom staat de prijs van dit besluit letterlijk in Instellingen, en
 * daarom wijst de app naar de ICS-export: de agenda-app op je telefoon doet het
 * klokwerk, en die mag dat ook.
 *
 * **Er wordt nooit uit zichzelf om toestemming gevraagd** (`FR-AGE-28`). Dat is de
 * snelste manier om een permanente weigering te krijgen, en die is op iOS lastig terug
 * te draaien.
 */

import { type IsoDateTime } from "@/lib/dates";
import type { CalendarEvent } from "@/domain/types";

import type { Clock } from "../storage/StorageService";

/** De zin die §6.2.9 woordelijk voorschrijft voor Instellingen → Agenda. */
export const EERLIJKE_UITLEG =
  "EduFlow stuurt geen meldingen als de app dicht is. Wil je een herinnering op je telefoon, exporteer de agenda dan naar je eigen agenda-app — die doet het wel.";

/** Hoe lang vóór een item de melding komt. */
export const VOORAF_MINUTEN = 10;

/** Hoe vaak er gekeken wordt of er iets aan de hand is. */
export const TIKINTERVAL_MS = 30_000;

/**
 * De drie standen van de browservraag.
 *
 * `default` betekent: nog niet gevraagd. Dat is de stand waarin de app hoort te
 * blijven tot de gebruiker er zelf om vraagt (`FR-AGE-28`).
 */
export type Toestemming = "default" | "granted" | "denied";

/** Wat een melding laat zien. Geïnjecteerd, want DR-12 wil dit toetsbaar zonder browser. */
export interface Melder {
  toestemming(): Toestemming;
  vraag(): Promise<Toestemming>;
  toon(titel: string, tekst: string): void;
}

export interface NotificationDeps {
  melder: Melder;
  clock: Clock;
}

/**
 * Welke items nu een melding verdienen.
 *
 * Zuiver, en daarom de plek waar de regel echt staat: een item met een tijd waarvan
 * het begin binnen `VOORAF_MINUTEN` valt en dat nog niet gemeld is. Hele-dag-items
 * doen niet mee — een studiedag om middernacht melden helpt niemand.
 */
export function nuTeMelden(
  items: readonly CalendarEvent[],
  nu: Date,
  gemeld: ReadonlySet<string>,
): CalendarEvent[] {
  const vanaf = nu.getTime();
  const tot = vanaf + VOORAF_MINUTEN * 60_000;

  return items.filter((item) => {
    if (item.allDay || gemeld.has(item.id)) return false;
    const begin = new Date(item.start).getTime();
    return begin >= vanaf && begin <= tot;
  });
}

/** De tekst van de melding: wat er is, en hoe lang het nog duurt. */
export function meldtekst(item: CalendarEvent, nu: Date): string {
  const minuten = Math.max(0, Math.round((new Date(item.start).getTime() - nu.getTime()) / 60_000));
  if (minuten === 0) return "begint nu";
  return `begint over ${minuten} ${minuten === 1 ? "minuut" : "minuten"}`;
}

export function createNotificationService(deps: NotificationDeps) {
  /** Wat er al gemeld is, zodat er niet elke tik opnieuw een melding komt. */
  const gemeld = new Set<string>();

  /**
   * Vraagt de browservraag op — **alleen** vanuit een handeling van de gebruiker.
   *
   * De aanroeper is verantwoordelijk voor dat laatste; deze service kan het niet
   * afdwingen, en daarom staat het hier met zoveel woorden. `FR-AGE-28` is een eis
   * over wánneer je vraagt, niet over hoe.
   */
  async function vraagToestemming(): Promise<Toestemming> {
    return deps.melder.vraag();
  }

  function toestemming(): Toestemming {
    return deps.melder.toestemming();
  }

  /**
   * Kijkt of er iets gemeld moet worden, en meldt het.
   *
   * Geeft terug wat er gemeld is, zodat een toets het kan nakijken zonder naar een
   * echte melding te hoeven kijken.
   */
  function tik(items: readonly CalendarEvent[]): CalendarEvent[] {
    if (deps.melder.toestemming() !== "granted") return [];

    const nu = deps.clock.now();
    const teMelden = nuTeMelden(items, nu, gemeld);

    for (const item of teMelden) {
      deps.melder.toon(item.title, meldtekst(item, nu));
      gemeld.add(item.id);
    }

    return teMelden;
  }

  /** Vergeet wat er gemeld is; na een dagovergang of een herstart van de agenda. */
  function vergeet(): void {
    gemeld.clear();
  }

  return { toestemming, vraagToestemming, tik, vergeet, uitleg: EERLIJKE_UITLEG };
}

export type NotificationService = ReturnType<typeof createNotificationService>;

/** Het laatst gemelde moment, voor wie wil weten of de lus loopt. */
export type Meldmoment = IsoDateTime | null;
