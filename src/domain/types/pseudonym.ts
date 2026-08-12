/**
 * De pseudoniemkaart (§9.2, §12.5, T-23).
 *
 * Een pseudoniem is de code die in de plaats komt van een naam zodra tekst het
 * apparaat verlaat: `[LEERLING-1]`, `[TERM-1]`, `[LEERLING-AMBIGU-1]`. De kaart
 * is de koppeling tussen code en naam.
 *
 * **Deze kaart wordt nooit opgeslagen** (§8.3.10, T-23). Hij bestaat alleen
 * tijdens één AI-aanroep, in het geheugen, en wordt daarna weggegooid. Een
 * opgeslagen afbeelding tussen code en naam is precies de sleutel waarmee
 * gepseudonimiseerde gegevens weer persoonsgegevens worden (§15.4). Daarom staat
 * hij hier als type en niet in `schemas/`: er is geen schema, want er is geen
 * tabel.
 *
 * **Waarom een lijst vormen en niet één naam.** §12.5 stap 4 eist dat "KJELD"
 * als "KJELD" terugkomt en niet als "Kjeld". Staat dezelfde naam twee keer in de
 * tekst met verschillende hoofdletters, dan is één naam per code te weinig om
 * beide terug te zetten. `restore()` loopt de codes in tekstvolgorde af en neemt
 * de vormen in diezelfde volgorde. Herschikt het model de tekst — wat §12.5 stap
 * 8 uitdrukkelijk toelaat — dan klopt de code nog steeds; alleen de hoofdletters
 * kunnen dan van plaats wisselen, en dat is geen persoonsgegeven.
 */

export type PseudonymKind = "leerling" | "term" | "ambigu";

export interface PseudonymEntry {
  kind: PseudonymKind;
  /** Wat er in de oorspronkelijke tekst stond, op volgorde van voorkomen. */
  forms: string[];
}

/** Code (`[LEERLING-3]`) naar wat er stond. Nooit de andere kant op: dat is de sleutel. */
export type PseudonymMap = ReadonlyMap<string, PseudonymEntry>;
