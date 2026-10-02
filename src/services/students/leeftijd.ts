/**
 * De leeftijd van een kind, als jaar en maanden (`FR-AGE-24`, B-139).
 *
 * In de pedagogische documentatie staat de leeftijd achter de naam, en niet in
 * hele jaren: het verschil tussen 6,1 en 6,11 is op deze leeftijd het verschil
 * tussen twee kinderen die je anders bekijkt. De opdrachtgever schrijft het als
 * `6,1` — zes jaar en één maand.
 *
 * **Zonder geboortejaar geen leeftijd.** `FR-AGE-24` laat een geboortedatum toe met
 * alleen dag en maand: *"dan wordt dat opgeslagen zonder jaar en verschijnt de
 * verjaardag zonder leeftijd. Dat is dataminimalisatie in de praktijk."* Die regel
 * geldt hier net zo goed — er is geen leeftijd af te leiden, dus er komt er geen.
 *
 * Deze module raakt de opslag niet en is te toetsen zonder database (DR-12).
 */

/** Wat er van een leerling nodig is; meer heeft deze berekening niet. */
export interface Geboortegegevens {
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
}

export interface Leeftijd {
  jaren: number;
  maanden: number;
}

const MAANDEN_PER_JAAR = 12;

/**
 * De leeftijd op een peildatum, of `null`.
 *
 * `null` bij een onvolledige geboortedatum, en ook bij een datum in de toekomst:
 * een kind dat volgende maand geboren wordt heeft geen leeftijd van min één maand.
 * Dat is geen randgeval maar een typefout in het jaartal, en die hoort als "geen
 * leeftijd" te verschijnen en niet als onzin.
 *
 * De maand telt pas mee als de dag voorbij is. Wie op 2 september jarig is, is op
 * 1 oktober nog geen maand ouder maar op 2 oktober wel.
 */
export function leeftijdOp(kind: Geboortegegevens, peildatum: Date): Leeftijd | null {
  const { birthDay, birthMonth, birthYear } = kind;
  if (birthDay === null || birthMonth === null || birthYear === null) return null;

  const jaar = peildatum.getUTCFullYear();
  const maand = peildatum.getUTCMonth() + 1;
  const dag = peildatum.getUTCDate();

  let maanden = (jaar - birthYear) * MAANDEN_PER_JAAR + (maand - birthMonth);
  if (dag < birthDay) maanden -= 1;

  if (maanden < 0) return null;

  return { jaren: Math.floor(maanden / MAANDEN_PER_JAAR), maanden: maanden % MAANDEN_PER_JAAR };
}

/**
 * De leeftijd zoals hij wordt opgeschreven: `6,1`.
 *
 * Een komma en geen punt, want in het Nederlands is de punt een duizendtal en
 * `6.1` leest als een kommagetal — zes komma één jaar, wat iets anders is dan zes
 * jaar en één maand.
 */
export function leeftijdTekst(leeftijd: Leeftijd): string {
  return `${leeftijd.jaren},${leeftijd.maanden}`;
}

/**
 * De naam met de leeftijd erachter, of alleen de naam (`FR-DOC-127`, B-139).
 *
 * Eén plek, want hij wordt op drie schermen gebruikt én in de export; twee plekken
 * zijn twee notaties (U-03).
 */
export function metLeeftijd(naam: string, kind: Geboortegegevens, peildatum: Date): string {
  const leeftijd = leeftijdOp(kind, peildatum);
  return leeftijd ? `${naam} ${leeftijdTekst(leeftijd)}` : naam;
}
