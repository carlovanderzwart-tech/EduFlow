/**
 * Tekstgereedschap.
 *
 * De Product Bible vraagt op twee plaatsen om normalisatie, en die twee zijn
 * **tegengesteld**. Ze staan daarom hieronder als twee losse functies, en het is
 * een fout om de een voor de ander te gebruiken.
 *
 * §8.5, de zoekindex: "kleine letters, diakrieten **behouden**". Wie zoekt op
 * "Hanae" hoort "Hanaë" niet als treffer te krijgen alsof het hetzelfde woord is;
 * de index bewaart wat er staat.
 *
 * §12.5 stap 6, de afscherming vóór een AI-aanroep: zoeken gebeurt op "de
 * genormaliseerde vorm (NFD, diakrieten **weggelaten**), zodat 'Hanaë' ook
 * 'Hanae' vindt; de vervanging gebeurt op de oorspronkelijke tekenreeks". Daar is
 * een gemiste naam een privacylek, en dan weegt vinden zwaarder dan precisie.
 */

/**
 * Vouwt diakrieten weg voor het herkennen van namen (§12.5).
 *
 * Uitsluitend om te **zoeken**. De vervanging hoort op de oorspronkelijke
 * tekenreeks te gebeuren, anders verliest de tekst zijn spelling.
 */
export function foldDiacritics(waarde: string): string {
  return waarde.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * Dezelfde vouwing, maar **met behoud van lengte** (§12.5 stap 6).
 *
 * `foldDiacritics` mag korter worden; hier mag dat niet. De afscherming zoekt in
 * de gevouwen vorm en vervangt op de oorspronkelijke tekenreeks, en dan moet een
 * positie in de een dezelfde positie in de ander zijn. Eén teken verschuiving
 * zet een code midden in een woord.
 *
 * Een los combinatieteken — tekst die al in NFD staat — blijft staan, want het
 * weglaten zou de tekst korter maken. Wie deze functie gebruikt normaliseert de
 * invoer eerst naar NFC; dan is "e" plus trema weer één "ë" en klapt hij wel om.
 */
export function foldDiacriticsPerChar(waarde: string): string {
  return [...waarde]
    .map((teken) => {
      const gevouwen = foldDiacritics(teken);
      return gevouwen.length === teken.length ? gevouwen : teken;
    })
    .join("");
}

/**
 * Splitst tekst in tokens voor de zoekindex (§8.5).
 *
 * Kleine letters, diakrieten behouden, splitsen op niet-letters, en woorden van
 * één teken weglaten.
 *
 * De Nederlandse stopwoorden uit §8.5 zitten hier bewust niet in: die lijst hoort
 * bij het zoekalgoritme en dus bij `SearchService`, dat bij een latere
 * implementatiestap ontstaat. `lib/` kent geen domeinkennis.
 */
export function tokenize(waarde: string): string[] {
  return waarde
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((token) => token.length >= 2);
}
