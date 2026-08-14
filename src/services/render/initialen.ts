/**
 * Namen vervangen door initialen (FR-DOC-114, B-40, §5.12).
 *
 * De schakelaar in het exportpaneel vervangt elke naam uit de leerlingenlijst door
 * zijn eerste letter met een punt. Botsen er twee — Kjeld en Kaya beginnen allebei
 * met een K — dan krijgt de tweede een oplopend cijfer, en komt er onderaan de
 * laatste pagina een legenda. **Zonder die legenda is een documentatie met twee K's
 * niet te volgen**, en dat is precies de reden dat B-40 haar voorschrijft; de
 * botsingsregel zonder uitleg is verwarrender dan de namen zelf.
 *
 * De legenda staat er alleen als er werkelijk een botsing is. Bij vier kinderen met
 * vier verschillende beginletters voegt een regel "K. = Kjeld · P. = Pippa · …"
 * niets toe aan wat de lezer al ziet.
 *
 * **Dit is geen pseudonimisering.** `PrivacyService` doet dat, voor de AI, en werkt
 * met codes die terugvertaald worden (DR-31). Dit is een presentatiekeuze van de
 * maker voor de lezer van de export, en er gaat niets terug.
 */

/** De legenda scheidt zijn onderdelen met een punt, zoals §5.12 hem opschrijft. */
const SCHEIDING = " · ";

export interface Initialenkaart {
  /** Naam → initiaal, in de volgorde waarin de namen binnenkwamen. */
  vervanging: Map<string, string>;
  /** De legendaregel, of leeg als er geen botsing is (B-40). */
  legenda: string;
}

/** De eerste letter van een naam, in hoofdletters. Leeg als de naam leeg is. */
function beginletter(naam: string): string {
  return naam.trim().slice(0, 1).toUpperCase();
}

/**
 * Bouwt de vervangingstabel en de legenda.
 *
 * De volgorde van `namen` bepaalt wie de kale letter krijgt en wie het cijfer. Dat
 * is de volgorde van de leerlingenlijst van de documentatie, en die is stabiel —
 * dezelfde export levert twee keer dezelfde initialen op.
 */
export function initialenkaart(namen: readonly string[]): Initialenkaart {
  const perLetter = new Map<string, string[]>();
  for (const naam of namen) {
    const letter = beginletter(naam);
    if (!letter) continue;
    const rij = perLetter.get(letter) ?? [];
    if (!rij.includes(naam)) rij.push(naam);
    perLetter.set(letter, rij);
  }

  const vervanging = new Map<string, string>();
  const legendadelen: string[] = [];

  for (const naam of namen) {
    const letter = beginletter(naam);
    if (!letter || vervanging.has(naam)) continue;

    const rij = perLetter.get(letter)!;
    const plaats = rij.indexOf(naam);
    const initiaal = plaats === 0 ? `${letter}.` : `${letter}${plaats + 1}.`;
    vervanging.set(naam, initiaal);

    // Alleen bij een botsing komt de naam in de legenda (B-40).
    if (rij.length > 1) legendadelen.push(`${initiaal} = ${naam}`);
  }

  return { vervanging, legenda: legendadelen.join(SCHEIDING) };
}

/** Een naam als patroon dat alleen op hele woorden past. */
function alsWoord(naam: string): RegExp {
  const ontsnapt = naam.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${ontsnapt}(?![\\p{L}\\p{N}])`, "giu");
}

/**
 * Vervangt de namen in een tekst.
 *
 * Op woordgrenzen, niet op deelreeksen: "Sam" mag "Samen" niet halveren. De langste
 * namen gaan eerst, zodat "Noa B." niet eerst op "Noa" stukloopt.
 */
export function vervangNamen(tekst: string, kaart: Initialenkaart): string {
  const namen = [...kaart.vervanging.keys()].sort((a, b) => b.length - a.length);
  return namen.reduce(
    (lopend, naam) => lopend.replace(alsWoord(naam), kaart.vervanging.get(naam)!),
    tekst,
  );
}
