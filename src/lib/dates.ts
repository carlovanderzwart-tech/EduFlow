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
 * Wandkloktijd zonder dag, Europe/Amsterdam: 08:30 (§8.3.15).
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

/* ------------------------------------------------------------------ */
/* Rekenen met kalenderdagen                                          */
/* ------------------------------------------------------------------ */

/**
 * Alles hieronder rekent in **UTC**, ook al gaat het over kalenderdagen.
 *
 * Niet omdat de gebruiker in UTC leeft, maar omdat een kalenderdag geen tijdzone
 * heeft. Zou je hier in lokale tijd rekenen, dan verspringt "een dag erbij" twee
 * keer per jaar met een uur en valt de laatste zondag van maart of oktober naast
 * het raster. `Date.UTC` kent die grens niet, en dat is precies waarom hij hier
 * staat (§8.1.4).
 */

const MS_PER_DAG = 86_400_000;

/** De kalenderdag als `Date` op middernacht UTC. */
function alsDatum(dag: IsoDate): Date {
  return new Date(`${dag}T00:00:00.000Z`);
}

/** De `Date` terug als kalenderdag. */
function alsDag(moment: Date): IsoDate {
  return moment.toISOString().slice(0, 10);
}

/** Vandaag als kalenderdag; de klok mag meegegeven worden zodat een toets hem vastzet. */
export function vandaagIso(nu: Date = new Date()): IsoDate {
  return alsDag(new Date(Date.UTC(nu.getFullYear(), nu.getMonth(), nu.getDate())));
}

/** De dag `aantal` dagen later. Een negatief getal gaat terug. */
export function plusDagen(dag: IsoDate, aantal: number): IsoDate {
  return alsDag(new Date(alsDatum(dag).getTime() + aantal * MS_PER_DAG));
}

/** Het aantal hele dagen van `van` tot `tot`; negatief als `tot` eerder ligt. */
export function dagenTussen(van: IsoDate, tot: IsoDate): number {
  return Math.round((alsDatum(tot).getTime() - alsDatum(van).getTime()) / MS_PER_DAG);
}

/** De weekdag, 1 voor maandag tot en met 7 voor zondag (ISO 8601). */
export function weekdag(dag: IsoDate): number {
  return alsDatum(dag).getUTCDay() || 7;
}

/** Valt deze dag in het weekend? */
export function isWeekend(dag: IsoDate): boolean {
  return weekdag(dag) >= 6;
}

/** De maandag van de week waarin deze dag valt. */
export function maandagVan(dag: IsoDate): IsoDate {
  return plusDagen(dag, 1 - weekdag(dag));
}

/** De eerste dag van de maand waarin deze dag valt. */
export function eersteVanMaand(dag: IsoDate): IsoDate {
  return `${dag.slice(0, 7)}-01`;
}

/** Het aantal dagen in de maand waarin deze dag valt. */
export function dagenInMaand(dag: IsoDate): number {
  const moment = alsDatum(dag);
  return new Date(Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth() + 1, 0)).getUTCDate();
}

/** De laatste dag van de maand waarin deze dag valt. */
export function laatsteVanMaand(dag: IsoDate): IsoDate {
  return `${dag.slice(0, 7)}-${String(dagenInMaand(dag)).padStart(2, "0")}`;
}

/** De maand `aantal` maanden verder, teruggerekend naar de eerste van die maand. */
export function plusMaanden(dag: IsoDate, aantal: number): IsoDate {
  const moment = alsDatum(eersteVanMaand(dag));
  return alsDag(new Date(Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth() + aantal, 1)));
}

/** Elke dag van `van` tot en met `tot`. Leeg als `tot` vóór `van` ligt. */
export function dagenVan(van: IsoDate, tot: IsoDate): IsoDate[] {
  const aantal = dagenTussen(van, tot);
  if (aantal < 0) return [];
  return Array.from({ length: aantal + 1 }, (_, plaats) => plusDagen(van, plaats));
}

/**
 * Het maandraster: **altijd** zes rijen van zeven dagen (§6.2.3).
 *
 * Zes en niet "zoveel als nodig", zodat de hoogte niet verspringt bij het bladeren
 * — dat is letterlijk wat §6.2.3 vraagt. Februari in een schrikkeljaar dat op een
 * maandag begint vult er precies vier; alle andere maanden vullen er vijf of zes.
 * Eén vaste hoogte is rustiger dan een raster dat ademt.
 */
export const MAANDRASTER_RIJEN = 6;

export function maandraster(dag: IsoDate): IsoDate[] {
  const begin = maandagVan(eersteVanMaand(dag));
  return Array.from({ length: MAANDRASTER_RIJEN * 7 }, (_, plaats) => plusDagen(begin, plaats));
}

/** Overlappen twee gesloten periodes elkaar? Beide einden tellen mee. */
export function overlapt(vanA: IsoDate, totA: IsoDate, vanB: IsoDate, totB: IsoDate): boolean {
  return vanA <= totB && vanB <= totA;
}
