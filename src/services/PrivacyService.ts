import { StudentService } from "./StudentService";

/**
 * Namen afschermen (docs/archief/03, *Services*).
 *
 * In deze stap alleen de omzetting naar initialen voor de export. De
 * naam-naar-code vervanging voor AI komt met de AI-laag en hoort in dezelfde
 * service, omdat beide op hetzelfde register werken.
 */

/** Vervangt namen in een stuk tekst. Synchroon, zodat het voorbeeld direct volgt. */
export type TextMasker = (text: string) => string;

/** "Kjeld" → "K." Alleen de eerste letter met een punt (productbesluit WF-039A). */
export function toInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${trimmed[0].toUpperCase()}.`;
}

/** Tekens die in een reguliere expressie een eigen betekenis hebben. */
function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Alle namen die vervangen worden, langste eerst.
 *
 * Die volgorde is geen detail: zonder haar wordt "Jan-Peter" als "Jan" gepakt
 * en blijft "-Peter" staan. Dezelfde regel geldt bij de afscherming richting AI
 * (besluit T-04).
 *
 * **Alleen voornamen en roepnamen.** Achternamen blijven staan: docs/archief/02 spreekt
 * van *"voornamen laten vervangen door initialen"*, en het productbesluit bij
 * WF-039A bevestigt dat de achternaam er niet in meegaat.
 */
async function collectFirstNames(): Promise<string[]> {
  // Inclusief inactieve leerlingen: een vertrokken kind komt nog voor in
  // documentaties van eerder dit jaar.
  const students = await StudentService.list({ includeInactive: true });

  const names = students.flatMap((student) =>
    [student.firstName, student.callName]
      .map((name) => name?.trim())
      .filter((name): name is string => Boolean(name)),
  );

  return [...new Set(names)].sort((a, b) => b.length - a.length);
}

export const PrivacyService = {
  toInitial,

  /**
   * Levert een functie die voornamen in tekst vervangt door hun initiaal.
   *
   * De namen worden één keer opgehaald bij `StudentService` (docs/archief/03) en daarna
   * hergebruikt, zodat het voorbeeld bij elke toetsaanslag kan meelopen zonder
   * telkens de opslag te raken.
   */
  async getInitialsMasker(): Promise<TextMasker> {
    const names = await collectFirstNames();
    if (names.length === 0) return (text) => text;

    // Woordgrenzen, zodat een naam niet middenin een ander woord wordt gepakt.
    // `\b` volstaat niet bij namen met een streepje.
    //
    // De punt achter de naam wordt meegenomen en niet teruggezet: de initiaal
    // brengt er zelf al een mee. Anders levert "speelde met Jan." de tekst
    // "speelde met J.." op, en dat gaat zo naar ouders toe.
    const pattern = new RegExp(
      `(^|[^\\p{L}])(${names.map(escapeForRegExp).join("|")})(?![\\p{L}])\\.?`,
      "giu",
    );

    return (text) =>
      text.replace(pattern, (_match, before: string, name: string) => `${before}${toInitial(name)}`);
  },
};
