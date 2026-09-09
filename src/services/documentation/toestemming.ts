/**
 * Wanneer de vraag over beeldgebruik komt (`FR-DOC-115`, B-08, B-130).
 *
 * Een regel en geen schermdetail, dus hij staat hier en niet in het exportpaneel
 * (DR-15). Zo is hij ook te toetsen zonder doek en zonder browser (DR-12).
 */

export interface Toestemmingsstand {
  /** Hoeveel foto's er in deze documentatie staan. */
  fotos: number;
  /** Of er voor deze documentatie al een keer toestemming is gegeven. */
  toestemmingGegeven: boolean;
}

/**
 * Twee redenen om de vraag over te slaan.
 *
 * De eerste staat in `FR-DOC-115` zelf: hij komt één keer per documentatie. De
 * tweede is B-130 — bij nul foto's is *"Op deze foto's staan kinderen"* een vraag
 * zonder onderwerp, en B-08 noemt zelf de schade die dat aanricht: *elke keer
 * vragen leidt tot wegklikken*. Een vraag die niet klopt leert je hem wegklikken
 * vóórdat je hem leest, en dat is juist fataal bij de documentatie waar wél foto's
 * in staan.
 */
export function vraagtToestemming(stand: Toestemmingsstand): boolean {
  return stand.fotos > 0 && !stand.toestemmingGegeven;
}
