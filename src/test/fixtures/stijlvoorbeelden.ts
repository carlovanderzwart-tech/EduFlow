/**
 * De stijlvoorbeelden (O-01, bijlage A.4, FR-INS-16, §12.9).
 *
 * Dit is de norm waaraan de AI gemeten wordt, en het is het enige materiaal in dit
 * project dat alleen de opdrachtgever kan aanleveren. Elk voorbeeld bestaat uit
 * drie delen: de ruwe notitie zoals de maker die tikt, de documentatie zoals die
 * zou moeten worden, en een te ver doorgeschoten versie mét de reden waarom die
 * fout is.
 *
 * **Het derde deel is wat de testset toetsbaar maakt** (FR-INS-16, D8 uit de
 * review). Zonder een voorbeeld van doorslaan kan de app wel meten of de AI
 * schrijft zoals jij, maar niet of hij te ver gaat — en dat laatste is precies waar
 * dit product op wordt beoordeeld (B-25).
 *
 * **De namen zijn vervangen door die uit bijlage A.** Het aangeleverde materiaal
 * kwam uit de praktijk en bevatte de namen van echte kinderen en een echte
 * groepsnaam. §15.6 en DR-33 laten die nergens toe, ook niet in een voorbeeld. De
 * gebeurtenis, de opbouw en de toon zijn ongewijzigd overgenomen; alleen de namen
 * zijn verzonnen gemaakt:
 *
 * | Aangeleverd | Hier |
 * |---|---|
 * | de groepsnaam van de school | Groep 4 — De Regenboog |
 * | een leerlingnaam | Pippa |
 *
 * De foto's uit het aangeleverde bestand staan hier **niet** en komen hier nooit:
 * dat zijn foto's van echte kinderen (B-03, §12.13). Wat er staat is de tekst, en
 * die is wat de testset nodig heeft.
 */

export interface Stijlvoorbeeld {
  id: string;
  /** De ruwe notitie zoals de maker hem tikt: losse woorden, halve zinnen. */
  ruw: string;
  /** Dezelfde gebeurtenis, uitgewerkt zoals hij verstuurd zou worden. */
  gewenst: string;
  /** Dezelfde tekst, te ver doorgeschoten. */
  doorgeschoten: string;
  /** Eén zin: waarom de doorgeschoten versie fout is. */
  waarom: string;
}

export const STIJLVOORBEELDEN: readonly Stijlvoorbeeld[] = [
  {
    id: "lichtatelier",
    ruw: [
      "Groep 4, wandelen met kunstenaar in berm naast school.",
      "Otis zag bloemen, Pippa ging liggen in gras.",
      "Blauwe, roze en gele bloemen gevonden.",
      "",
      "Vervolg: tekenen in de klas.",
    ].join("\n"),
    gewenst: [
      "Kunstenaar op bezoek?",
      "",
      "Ja, je leest het goed: in Groep 4 — De Regenboog was een kunstenaar op bezoek!",
      "En niet zonder reden, want het DOK wordt nóg mooier met een kunstwerk dat door",
      "onze kinderen is gemaakt.",
      "",
      "Maar eerst kleuren mengen!",
      "",
      "Bloemen zoeken.",
      "",
      "Vergelijken van de kleuren.",
      "",
      "Tot slot zelf ook nog bloemen proberen te maken met de verf.",
    ].join("\n"),
    doorgeschoten: [
      "Ja, je leest het goed: in Groep 4 — De Regenboog was een GEWELDIGE kunstenaar",
      "op bezoek! En niet zonder reden, want het LELIJKE DOK wordt nóg mooier met een",
      "kunstwerk dat door onze GEWELDIGE kinderen is gemaakt. HET IS PRACHTIGE HET IS",
      "MOOI, HET IS FANTASTISCH NIEMAND KAN HET BETER!!",
    ].join("\n"),
    waarom:
      "Deze tekst zit vol waardeoordelen over het product en het proces, en dat is precies wat B-25 verbiedt.",
  },
];
