/**
 * Het AI-logboek en de terugkoppeling (§8.3.12).
 *
 * Dit is het logboek dat de kwaliteitsmeting voedt en dat bij een privacygesprek
 * op tafel komt. Daarom staat er **geen tekstinhoud met persoonsgegevens** in
 * (FR-PRV-08): geen prompt, geen antwoord, geen zin uit een documentatie. Wat er
 * wel staat, is genoeg om kwaliteit te meten (§12.9) en verantwoording af te
 * leggen (§16.4).
 *
 * Dat verklaart `similarity`: de overeenkomst tussen voorstel en eindtekst wordt
 * berekend en bewaard, de teksten zelf niet.
 */

import type { BaseRecord, Uuid } from "./base";

export type AiTask =
  | "doc.write"
  | "doc.title"
  | "doc.followup"
  | "doc.spelling"
  | "talk.build"
  | "mail.summarise"
  | "mail.write"
  | "mail.tone";

export type AiOutcome = "accepted" | "partial" | "rejected" | "retried" | "failed";

/** De vier redenen uit B-73, of geen reden. */
export type AiRejectReason = "te_lang" | "te_bloemrijk" | "klopt_niet" | "anders";

export interface AiInteraction extends BaseRecord {
  task: AiTask;
  provider: string;
  model: string;
  /** Verwerkingsregio, voor het logboek uit hoofdstuk 16. */
  region: string;
  /** Tellingen, geen inhoud. */
  charsIn: number;
  charsOut: number;
  /** Hoeveel gegevens zijn afgeschermd (§12.5). */
  pseudonymCount: number;
  durationMs: number;
  outcome: AiOutcome;
  rejectReason: AiRejectReason | null;
  /** 0-1; berekend, de teksten zelf worden niet bewaard. */
  similarity: number;
  /** Om terug te vinden, niet om te herlezen. */
  documentationId: Uuid | null;
}

export type FeedbackVerdict = "goed" | "matig" | "fout";

/**
 * Los aggregaat omdat terugkoppeling later kan komen (§9.4).
 *
 * `comment` mag geen namen bevatten; daar wordt op gecontroleerd (§8.3.12).
 */
export interface Feedback extends BaseRecord {
  aiInteractionId: Uuid;
  verdict: FeedbackVerdict;
  comment: string;
}
