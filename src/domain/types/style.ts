/**
 * Stijlprofiel en stijlvoorbeeld (§8.3.11).
 *
 * Dit is wat de app over jouw schrijven geleerd heeft, en het is leesbaar
 * (B-23, FR-INS-13). Er wordt niets getraind (B-22): het profiel is een
 * verzameling gemeten kenmerken, en elk kenmerk is handmatig te overschrijven
 * (FR-INS-14). Vandaar `manual` naast elke waarde — zonder die vlag weet de app
 * niet of hij mag blijven meten.
 *
 * Het profiel bevat geen namen, geen citaten en geen letterlijke zinnen uit
 * documentaties (INV-45). Het gaat bij elke aanroep mee, dus alles wat erin
 * staat gaat vaak de deur uit.
 */

import type { BaseRecord, IsoDateTime, Uuid } from "./base";

/** Een gemeten kenmerk met de vlag of de gebruiker het heeft overschreven. */
export interface StyleTrait<T> {
  value: T;
  manual: boolean;
}

export type Tense = "tegenwoordig" | "verleden";
export type Address = "wij" | "ik" | "onpersoonlijk";

export interface CorrectionRule {
  id: Uuid;
  pattern: string;
  reason: string;
  confirmedAt: IsoDateTime;
}

/** Precies één record (§9.4). */
export interface StyleProfile extends BaseRecord {
  avgSentenceWords: StyleTrait<number>;
  avgParagraphSentences: StyleTrait<number>;
  tense: StyleTrait<Tense>;
  address: StyleTrait<Address>;
  /** Citaten per documentatie. */
  quoteFrequency: StyleTrait<number>;
  /** 0-1, beschrijven tegenover duiden (§3.3.2). */
  descriptionRatio: StyleTrait<number>;
  preferredWords: string[];
  avoidedWords: string[];
  correctionRules: CorrectionRule[];
  sampleCount: number;
  lastComputedAt: IsoDateTime;
}

/**
 * Een stijlvoorbeeld bestaat uit drie delen (FR-INS-16).
 *
 * Het derde deel — de te ver doorgeschoten versie met de reden waarom die fout
 * is — is wat de gouden testset toetsbaar maakt (§12.9). Een voorbeeld gaat door
 * dezelfde privacypoort als alle andere tekst (INV-44, FR-INS-17).
 */
export interface StyleExample extends BaseRecord {
  rawNote: string;
  goodResult: string;
  overshotResult: string;
  overshotReason: string;
  /** Maakt dit voorbeeld deel uit van de gouden testset (§12.9). */
  isGolden: boolean;
}
