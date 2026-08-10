/**
 * Domeingebeurtenissen rond back-up, opslag en toegang
 * (§9.6, DE-35 t/m DE-39).
 *
 * `AccessCodeAccepted` en `AccessCodeRejected` zijn de twee gebeurtenissen die
 * ook op de server aankomen (§9.6, kolom "Reageert erop"). De toegangscode is
 * geen entiteit in het domein (B-95); wat het domein ervan kent, is deze twee
 * meldingen.
 */

import type { IsoDateTime } from "../types";

/** Aantallen per tabel, zoals het back-upscherm ze toont (FR-INS-30). */
export type CountsByTable = Record<string, number>;

/** DE-35 — als het back-upbestand is weggeschreven (§8.7). */
export interface BackupCreated {
  type: "BackupCreated";
  bytes: number;
  countsByTable: CountsByTable;
  schemaVersion: number;
  at: IsoDateTime;
}

/** DE-36 — na een geslaagde terugzetting (INV-51). */
export interface BackupRestored {
  type: "BackupRestored";
  choice: "samenvoegen" | "vervangen";
  countsByTable: CountsByTable;
  schemaVersion: number;
}

/** DE-37 — boven 80 procent van de beschikbare opslag (INV-53, T-09). */
export interface StorageThresholdReached {
  type: "StorageThresholdReached";
  usedBytes: number;
  availableBytes: number;
  largestConsumers: Array<{ table: string; bytes: number }>;
}

/** DE-38 — als een apparaat een geldige toegangscode invoert (§14.5). */
export interface AccessCodeAccepted {
  type: "AccessCodeAccepted";
  deviceFingerprint: string;
  at: IsoDateTime;
  dailyBudget: number;
}

/** DE-39 — ongeldige of geblokkeerde code, of overschreden snelheidslimiet. */
export interface AccessCodeRejected {
  type: "AccessCodeRejected";
  reason: string;
  attempts: number;
  retryAfterSeconds: number;
}

export type SystemEvent =
  | BackupCreated
  | BackupRestored
  | StorageThresholdReached
  | AccessCodeAccepted
  | AccessCodeRejected;
