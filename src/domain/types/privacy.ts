/**
 * De eigen woordenlijst naast de leerlingennamen (§8.3.10, FR-INS-19).
 *
 * Wat de leerlingenlijst niet dekt — achternamen, namen van collega's, de naam
 * van de school, een straatnaam — vang je hiermee af. Ze worden op dezelfde
 * manier vervangen als leerlingnamen, met een eigen codesoort.
 *
 * **De pseudoniemkaart staat hier niet en komt hier nooit.** §8.3.10 en T-23:
 * `PseudonymMap` wordt niet opgeslagen. Hij bestaat alleen tijdens één
 * AI-aanroep, in het geheugen, en wordt daarna weggegooid. Een opgeslagen
 * afbeelding tussen code en naam is precies de sleutel waarmee
 * gepseudonimiseerde gegevens weer persoonsgegevens worden. Wat we niet
 * bewaren, kan niet lekken.
 */

import type { BaseRecord } from "./base";

export type PrivacyTermKind = "achternaam" | "collega" | "school" | "plaats" | "overig";

export interface PrivacyTerm extends BaseRecord {
  term: string;
  termLower: string;
  kind: PrivacyTermKind;
  enabled: boolean;
}
