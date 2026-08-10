/**
 * Domeingebeurtenissen rond foto's (§9.6, DE-08 t/m DE-11).
 *
 * De vier gebeurtenissen volgen de toestandsmachine uit §9.7.3. `PhotoRejected`
 * hoort daar ook bij en levert geen record op: een geweigerd bestand wordt niet
 * opgeslagen, dus de gebeurtenis draagt de bestandsnaam en niet een sleutel.
 */

import type { IsoDateTime, PhotoVariantName, Uuid } from "../types";

/** DE-08 — zodra een foto verwerkt is en beschikbaar komt (INV-18). */
export interface PhotoAdded {
  type: "PhotoAdded";
  photoId: Uuid;
  width: number;
  height: number;
  bytesByVariant: Record<PhotoVariantName, number>;
}

/** DE-09 — als een gekozen bestand niet verwerkt kan worden (§9.7.3). */
export interface PhotoRejected {
  type: "PhotoRejected";
  fileName: string;
  reason: "formaat" | "omvang" | "leesfout";
  retry: boolean;
}

/** DE-10 — als het laatste `PhotoBlock` dat naar een foto verwees verdwijnt. */
export interface PhotoOrphaned {
  type: "PhotoOrphaned";
  photoId: Uuid;
  at: IsoDateTime;
}

/** DE-11 — als de opruimronde een verweesde foto verwijdert (INV-17, T-38). */
export interface PhotoPurged {
  type: "PhotoPurged";
  photoId: Uuid;
  bytesFreed: number;
}

export type PhotoEvent = PhotoAdded | PhotoRejected | PhotoOrphaned | PhotoPurged;
