/**
 * Foto en fotoformaat (§8.3.7).
 *
 * Gescheiden om één reden: metagegevens worden vaak gelezen (elke lijst, elke
 * zoekopdracht, elke overloopberekening) en blobs zelden. Staan ze in hetzelfde
 * record, dan trekt elke lijstopvraag megabytes aan beeld door het geheugen.
 *
 * `Photo` is een eigen aggregaat en staat bewust buiten `Documentation` (§9.4.2):
 * een foto kan in meer dan één documentatie voorkomen, is groot, en heeft een
 * eigen levensloop (§9.7.3).
 */

import type { BaseRecord, IsoDateTime, Uuid } from "./base";

export interface Photo extends BaseRecord {
  /** Van de `print`-variant. */
  width: number;
  height: number;
  /** Som van de drie varianten. */
  bytes: number;
  /** SHA-256 over de oorspronkelijke bytes; herkent dubbelen bij terugzetten (FR-INS-31). */
  hash: string;
  /** Uit EXIF, vóór het strippen. De locatiegegevens worden verwijderd (§8.3.7). */
  capturedAt: IsoDateTime | null;
  /** Al toegepast bij het verkleinen; hier alleen ter informatie. */
  orientation: number;
  /** Aantal `PhotoBlock`s dat verwijst; 0 betekent verweesd (T-38, INV-17). */
  refCount: number;
}

/** 480, 1280 en 3300 pixels op de lange zijde. Altijd alle drie (INV-18). */
export type PhotoVariantName = "thumb" | "screen" | "print";

export interface PhotoVariant extends BaseRecord {
  photoId: Uuid;
  variant: PhotoVariantName;
  /** JPEG, kwaliteit 88 (§8.3.7). */
  blob: Blob;
  bytes: number;
}
