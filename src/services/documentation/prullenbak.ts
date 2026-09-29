/**
 * De prullenbak (`FR-DOC-121` t/m `FR-DOC-123`, §8.8, T-11, B-135).
 *
 * **Verwijderen is markeren.** Er staat met opzet geen `delete()` in de opslaglaag:
 * zodra er twee apparaten zijn, is een record dat verdwenen is niet te
 * onderscheiden van een record dat het andere apparaat nog nooit heeft gezien, en
 * dan herstelt de synchronisatie hem netjes weer (§8.1.6).
 *
 * Wat hier staat is de rekenkant: hoeveel dagen heeft een documentatie nog, en
 * welke zijn over hun termijn heen. Het is bewust apart van
 * `DocumentationService`: dat bestand ging al over de 400 regels heen, en de
 * prullenbak is een eigen onderwerp met een eigen bewaartermijn uit §8.8.
 *
 * Deze module raakt de opslag niet en is te toetsen zonder database (DR-12).
 */

import type { IsoDateTime } from "@/domain/types";

/** §8.8: de prullenbak bewaart dertig dagen. Daarna ruimt de opruimronde op. */
export const BEWAARTERMIJN_DAGEN = 30;

const MS_PER_DAG = 24 * 60 * 60 * 1000;

/** Eén regel in de prullenbak: wat er staat en hoe lang het er nog staat. */
export interface Prullenbakregel<T> {
  record: T;
  /** Hoeveel hele dagen er nog resteren; nooit onder nul. */
  dagenResterend: number;
}

/**
 * Hoeveel dagen een verwijderd record nog heeft (`FR-DOC-121`).
 *
 * Naar boven afgerond, want "nog 1 dag" hoort er te staan zolang er iets van die
 * dag over is. Naar beneden afronden zou op de laatste ochtend "nog 0 dagen" tonen
 * bij iets wat pas 's avonds verdwijnt.
 */
export function dagenResterend(deletedAt: IsoDateTime, nu: Date): number {
  const verstreken = nu.getTime() - new Date(deletedAt).getTime();
  const over = BEWAARTERMIJN_DAGEN - verstreken / MS_PER_DAG;
  return Math.max(0, Math.ceil(over));
}

/** Is de bewaartermijn van dit record voorbij? Dan mag de opruimronde hem echt wissen. */
export function isVerlopen(deletedAt: IsoDateTime, nu: Date): boolean {
  return dagenResterend(deletedAt, nu) === 0;
}

/**
 * De prullenbak, het laatst verwijderde bovenaan.
 *
 * Bovenaan wat je het laatst weggooide, want dat is wat je terugzoekt als je je
 * bedenkt. Records zonder `deletedAt` horen hier niet en worden overgeslagen in
 * plaats van te laten struikelen: `listDeleted` levert ze niet, maar een aanroeper
 * die filtert vergeet dat een keer.
 */
export function prullenbak<T extends { deletedAt: IsoDateTime | null }>(
  records: readonly T[],
  nu: Date,
): Prullenbakregel<T>[] {
  return records
    .filter((record): record is T & { deletedAt: IsoDateTime } => record.deletedAt !== null)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
    .map((record) => ({ record, dagenResterend: dagenResterend(record.deletedAt, nu) }));
}

/** Wat de opruimronde definitief mag wissen (`FR-DOC-122`, §8.8). */
export function verlopen<T extends { deletedAt: IsoDateTime | null }>(
  records: readonly T[],
  nu: Date,
): T[] {
  return records.filter((record) => record.deletedAt !== null && isVerlopen(record.deletedAt, nu));
}
