/**
 * Domeingebeurtenissen rond AI en stijl (§9.6, DE-12 t/m DE-20).
 *
 * De reeks volgt de toestandsmachine van `AIRequest` uit §9.7.5. Twee dingen
 * vallen op en zijn geen toeval.
 *
 * `AISuggestionAccepted` draagt de tekst vóór en na. Dat is de enige plek in dit
 * bestand waar tekst in een gebeurtenis zit, en het is nodig omdat `StyleService`
 * uit het verschil leert wat jij aanpast (§3.5). De gebeurtenis wordt niet
 * opgeslagen (T-37) en het AI-logboek bewaart alleen de gemeten overeenkomst,
 * niet de tekst (FR-PRV-08).
 *
 * `PrivacyGateBlocked` bestaat omdat een tegengehouden aanroep zichtbaar hoort te
 * zijn: AI die stil faalt is erger dan AI die niet werkt (AIW-5).
 */

import type { AiTask, Uuid } from "../types";

/** DE-12 — zodra je in het controlescherm op verzenden drukt (INV-43). */
export interface AISuggestionRequested {
  type: "AISuggestionRequested";
  aiInteractionId: Uuid;
  task: AiTask;
  exampleCount: number;
  pseudonymCount: number;
  chars: number;
}

/** DE-13 — antwoord binnen en terugvertaald met kloppende telling (INV-40). */
export interface AISuggestionReceived {
  type: "AISuggestionReceived";
  aiInteractionId: Uuid;
  durationMs: number;
  chars: number;
  qualityPassed: boolean;
}

/** DE-14 — na "Overnemen", met de keuze aanvullen of vervangen (B-39). */
export interface AISuggestionAccepted {
  type: "AISuggestionAccepted";
  aiInteractionId: Uuid;
  choice: "aanvullen" | "vervangen";
  textBefore: string;
  textAfter: string;
}

/** DE-15 — na "Weggooien". */
export interface AISuggestionDiscarded {
  type: "AISuggestionDiscarded";
  aiInteractionId: Uuid;
  edited: boolean;
}

/** DE-16 — na "Opnieuw". Eén herkansing, niet meer (§9.7.5). */
export interface AISuggestionRetried {
  type: "AISuggestionRetried";
  previousAiInteractionId: Uuid;
  aiInteractionId: Uuid;
  attempt: number;
}

/** DE-17 — bij een time-out, netwerkfout of foutmelding van de provider. */
export interface AISuggestionFailed {
  type: "AISuggestionFailed";
  aiInteractionId: Uuid;
  failure: "timeout" | "netwerk" | "provider";
  retried: boolean;
}

/** DE-18 — als de privacypoort een aanroep tegenhoudt (INV-38, INV-39, INV-42). */
export interface PrivacyGateBlocked {
  type: "PrivacyGateBlocked";
  reason: "naam-gevonden" | "beeldgegevens" | "lege-leerlingenlijst";
  /** Het betrokken woord of veld. */
  subject: string;
}

/** DE-19 — als een kenmerk, voorbeeld of vermijdregel in het profiel verandert. */
export interface StyleProfileUpdated {
  type: "StyleProfileUpdated";
  trait: string;
  previousValue: string;
  value: string;
  cause: string;
}

/** DE-20 — als je een woord of wending voor de derde keer weghaalt (§3.5.3). */
export interface StyleRuleProposed {
  type: "StyleRuleProposed";
  word: string;
  occurrences: number;
  examples: string[];
}

export type AiEvent =
  | AISuggestionRequested
  | AISuggestionReceived
  | AISuggestionAccepted
  | AISuggestionDiscarded
  | AISuggestionRetried
  | AISuggestionFailed
  | PrivacyGateBlocked
  | StyleProfileUpdated
  | StyleRuleProposed;
