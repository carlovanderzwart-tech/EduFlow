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
 * De foutcodes die de Product Bible met naam noemt.
 *
 * §10.3 geeft er drie en sluit af met een beletselteken; de volledige verzameling
 * staat nergens. Daarom staan hier alleen deze drie. Elke volgende code komt erbij
 * op het moment dat de Bible hem noemt of dat er een besluit over is — niet eerder.
 */
export type ErrorCode = "STORAGE_FULL" | "AI_UNREACHABLE" | "PRIVACY_GATE";

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
