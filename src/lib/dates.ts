/**
 * Tijd en kalenderdagen (§8.1.4).
 *
 * Twee typen die je niet door elkaar mag halen.
 *
 * Een `IsoDateTime` is een tijdstip en staat **altijd in UTC**, met milliseconden
 * en een afsluitende `Z`. Er staat nooit een lokale tijdzone in de opslag. Dat is
 * de enige manier waarop een back-up die in de zomertijd is gemaakt, in de
 * wintertijd nog dezelfde tijden toont.
 *
 * Een `IsoDate` is een kalenderdag: tien tekens, geen tijd, geen zone. Een
 * vakantiedatum, een geboortedatum of de dag waarop iets gebeurde wordt nooit als
 * tijdstip opgeslagen, want dan verschuift 1 januari op de helft van de apparaten
 * naar 31 december.
 *
 * **Hier staat geen weergave.** Omrekenen naar Europe/Amsterdam gebeurt in de
 * weergavelaag, één keer, met `Intl.DateTimeFormat` (§8.1.4). Dit bestand kent
 * geen tijdzone en geen taal.
 */

/** ISO 8601 in UTC, met milliseconden: 2026-08-07T12:04:55.031Z (§8.1.5). */
export type IsoDateTime = string;

/** ISO 8601 kalenderdag zonder tijd en zonder zone: 2026-08-07 (§8.1.5). */
export type IsoDate = string;

/**
 * Wandkloktijd zonder dag, Europe/Amsterdam: 08:30 (T-46).
 *
 * De enige uitzondering op "alles in UTC", en hij heeft een reden. Een
 * weekonderdeel van de basisweek begint om half negen, en bij het invullen is nog
 * niet bekend op welke dag dat valt. Half negen blijft half negen aan beide
 * kanten van de zomertijdgrens; als `IsoDateTime` zou hij twee keer per jaar
 * verschuiven. Omrekenen naar UTC gebeurt op precies één plek: bij het berekenen
 * van wat er op een dag staat (§9.8).
 */
export type LocalTime = string;

const ISO_DATE_TIME_VORM = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
const ISO_DATE_VORM = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_VORM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Bestaat deze kalenderdag echt?
 *
 * De vorm alleen is niet genoeg: `2026-02-31` past in het patroon maar bestaat
 * niet, en JavaScript rolt zo'n datum stilzwijgend door naar 3 maart. Daarom
 * wordt hij teruggerekend en vergeleken.
 */
function isEchteDag(jaar: number, maand: number, dag: number): boolean {
  const proef = new Date(Date.UTC(jaar, maand - 1, dag));
  return (
    proef.getUTCFullYear() === jaar && proef.getUTCMonth() === maand - 1 && proef.getUTCDate() === dag
  );
}

/** Is dit een geldige kalenderdag in de vorm `JJJJ-MM-DD`? */
export function isIsoDate(waarde: string): waarde is IsoDate {
  const deel = ISO_DATE_VORM.exec(waarde);
  if (!deel) return false;
  return isEchteDag(Number(deel[1]), Number(deel[2]), Number(deel[3]));
}

/** Is dit een geldig tijdstip in UTC, met milliseconden en een afsluitende `Z`? */
export function isIsoDateTime(waarde: string): waarde is IsoDateTime {
  const deel = ISO_DATE_TIME_VORM.exec(waarde);
  if (!deel) return false;

  const [, jaar, maand, dag, uur, minuut, seconde] = deel.map(Number);
  if (!isEchteDag(jaar!, maand!, dag!)) return false;
  return uur! < 24 && minuut! < 60 && seconde! < 60;
}

/** Is dit een wandkloktijd in de vorm `UU:MM`? */
export function isLocalTime(waarde: string): waarde is LocalTime {
  return LOCAL_TIME_VORM.test(waarde);
}

/**
 * Zet een tijdstip om naar de opslagvorm.
 *
 * `toISOString()` levert precies de vorm uit §8.1.5: UTC, milliseconden, `Z`.
 */
export function toIsoDateTime(moment: Date): IsoDateTime {
  return moment.toISOString();
}

/** Leest een opslagtijdstip terug. Geeft `null` bij een waarde die niet klopt. */
export function parseIsoDateTime(waarde: string): Date | null {
  if (!isIsoDateTime(waarde)) return null;
  const moment = new Date(waarde);
  return Number.isNaN(moment.getTime()) ? null : moment;
}
