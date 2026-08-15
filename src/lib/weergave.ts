/**
 * Tijd op het scherm (§8.1.4).
 *
 * "Omrekenen naar Europe/Amsterdam gebeurt in de weergavelaag, één keer, met
 * `Intl.DateTimeFormat`." Dit is die ene keer. `lib/dates.ts` kent met opzet geen
 * tijdzone en geen taal; dit bestand kent ze beide en niets anders.
 *
 * Het staat in `lib/` en niet bij een component, omdat drie schermen dezelfde
 * omrekening nodig hebben en twee implementaties vroeg of laat uiteenlopen (U-03).
 * Het importeert niets uit dit project, zoals §10.2 van `lib/` eist.
 *
 * **Een kalenderdag wordt nooit als tijdstip gelezen.** `new Date("2026-08-09")`
 * levert middernacht UTC, en in een tijdzone achter UTC formatteert dat naar 8
 * augustus. Daarom worden de drie delen hier apart uitgelezen.
 */

const LANG = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" });

const KORT = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" });

const KLOK = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

/** Leest `JJJJ-MM-DD` als lokale middernacht, zodat formatteren niet verschuift. */
function alsLokaleDag(dag: string): Date | null {
  const deel = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dag);
  if (!deel) return null;
  return new Date(Number(deel[1]), Number(deel[2]) - 1, Number(deel[3]));
}

/** "9 augustus 2026". Geeft de invoer onveranderd terug als die geen dag is. */
export function datumLang(dag: string): string {
  const moment = alsLokaleDag(dag);
  return moment ? LANG.format(moment) : dag;
}

/** "9 aug 2026", voor lijsten waar de ruimte krap is. */
export function datumKort(dag: string): string {
  const moment = alsLokaleDag(dag);
  return moment ? KORT.format(moment) : dag;
}

/** "9 aug 14:00" in Europe/Amsterdam, uit een tijdstip in UTC. */
export function tijdstipKort(tijdstip: string): string {
  const moment = new Date(tijdstip);
  return Number.isNaN(moment.getTime()) ? tijdstip : KLOK.format(moment);
}

function tweeCijfers(waarde: number): string {
  return String(waarde).padStart(2, "0");
}

/** Vandaag als `JJJJ-MM-DD` in de tijdzone van het apparaat. */
export function vandaag(nu: Date = new Date()): string {
  return `${nu.getFullYear()}-${tweeCijfers(nu.getMonth() + 1)}-${tweeCijfers(nu.getDate())}`;
}

/**
 * Wat een `datetime-local`-veld verwacht: `JJJJ-MM-DDTUU:MM` in lokale tijd.
 *
 * Zonder seconden en zonder `Z`. Het veld toont wat de gebruiker herkent; de opslag
 * houdt UTC (§8.1.4).
 */
export function naarLokaleInvoer(tijdstip: string): string {
  const moment = new Date(tijdstip);
  if (Number.isNaN(moment.getTime())) return "";

  return `${vandaag(moment)}T${tweeCijfers(moment.getHours())}:${tweeCijfers(moment.getMinutes())}`;
}

/** Terug van `datetime-local` naar de opslagvorm: UTC, milliseconden, `Z`. */
export function vanLokaleInvoer(waarde: string): string {
  const moment = new Date(waarde);
  return Number.isNaN(moment.getTime()) ? "" : moment.toISOString();
}

/** Het eerstvolgende halve uur, de standaardbegintijd van een agenda-item (§6.2.2). */
export function volgendHalfUur(nu: Date = new Date()): string {
  const moment = new Date(nu);
  moment.setSeconds(0, 0);
  moment.setMinutes(moment.getMinutes() > 30 ? 60 : 30);
  return moment.toISOString();
}

/** Een tijdstip plus zoveel minuten, voor de standaardeindtijd (start + 30 min). */
export function plusMinuten(tijdstip: string, minuten: number): string {
  const moment = new Date(tijdstip);
  if (Number.isNaN(moment.getTime())) return tijdstip;
  moment.setMinutes(moment.getMinutes() + minuten);
  return moment.toISOString();
}

/**
 * Hetzelfde tijdstip van de dag, maar dan op een andere kalenderdag.
 *
 * Nodig omdat "het eerstvolgende halve uur" een tijd van vandaag is, terwijl een
 * nieuw agenda-item hoort te beginnen op de dag die je op dat moment bekijkt. Zonder
 * deze omzetting maak je vanuit de week van 20 september een afspraak die vandaag
 * blijkt te staan — en dat merk je pas als je hem zoekt.
 *
 * Het uur en de minuut worden **lokaal** overgezet: half negen blijft half negen,
 * ook als de twee dagen aan verschillende kanten van de zomertijdgrens liggen.
 */
export function opDag(dag: string, tijdstip: string): string {
  const deel = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dag);
  const moment = new Date(tijdstip);
  if (!deel || Number.isNaN(moment.getTime())) return tijdstip;

  const nieuw = new Date(
    Number(deel[1]),
    Number(deel[2]) - 1,
    Number(deel[3]),
    moment.getHours(),
    moment.getMinutes(),
  );
  return nieuw.toISOString();
}
