/**
 * Normaliseert tekst voor zoeken en vergelijken: kleine letters en diakrieten
 * weg, zodat "Kjeld" ook op "kjeld" matcht en "Sofíe" op "Sofie".
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
