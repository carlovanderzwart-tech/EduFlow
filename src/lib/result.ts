/**
 * Fouten zijn waarden, geen uitzonderingen (§10.3, T-27).
 *
 * Elke service geeft een `Result` terug. Dat `message` in het Nederlands staat en
 * niet in het Engels is bewust: er is precies één plek waar een fouttekst wordt
 * bedacht, en dat is de service die de fout kent. Een scherm dat foutcodes
 * vertaalt is een tweede plek waar dezelfde kennis staat, en dat verbiedt U-03.
 *
 * De teksten volgen §4.7: wat er gebeurde, wat het voor jouw werk betekent, wat
 * de volgende stap is — in die volgorde, hoogstens drie zinnen, hoogstens twintig
 * woorden per zin, en nooit een foutcode in de tekst zelf.
 */

/**
 * De foutcodes.
 *
 * §10.3 noemt er drie met naam en sluit af met een beletselteken; de volledige
 * verzameling staat nergens. Elke volgende code komt erbij op het moment dat de
 * Bible hem noemt of dat er een besluit over is — niet eerder.
 *
 * `INVALID_INPUT` is de vierde, en hij volgt uit het handboek zonder dat het hem
 * benoemt. Vier regels eisen dat opslaan **faalt met een melding**: INV-16
 * (de datum van een documentatie), INV-25 (overlappende lidmaatschappen), INV-29
 * (twee kinderen die Noa heten) en B-115 (overlappende basisweken). Een melding
 * aan de gebruiker is volgens §10.3 een `Result` en geen uitzondering, en dus is
 * er een code nodig om hem te dragen.
 *
 * Het is er met opzet **één** en niet één per regel. §10.3 legt de tekst bij
 * de service die de fout kent en verbiedt een scherm dat codes vertaalt; het
 * onderscheid zit dus al in `message`. Een code per regel zou een indeling zijn
 * die niemand leest.
 */
export type ErrorCode = "STORAGE_FULL" | "AI_UNREACHABLE" | "PRIVACY_GATE" | "INVALID_INPUT";

/** Wat het scherm de gebruiker aanbiedt om verder te komen. */
export interface AppErrorAction {
  label: string;
  kind: "retry" | "navigate" | "dismiss";
  target?: string;
}

export interface AppError {
  code: ErrorCode;
  /** Nederlandse tekst voor de gebruiker (§4.7). */
  message: string;
  /** Technisch, alleen voor het logboek. Nooit een persoonsgegeven (DR-44). */
  detail?: string;
  recoverable: boolean;
  action?: AppErrorAction;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

/**
 * Een afwijzing die de gebruiker zelf kan oplossen.
 *
 * Eén plek waar de vorm van zo'n fout staat, zodat de vier invarianten die
 * "opslaan faalt met een melding" eisen niet elk hun eigen variant krijgen. De
 * tekst komt van de aanroeper, want die kent de regel; hij volgt §4.7.
 */
export function ongeldig(message: string, action?: AppErrorAction): Result<never> {
  return { ok: false, error: { code: "INVALID_INPUT", message, recoverable: true, action } };
}
