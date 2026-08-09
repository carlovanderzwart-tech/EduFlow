/**
 * Pagina en blok (§8.3.6).
 *
 * Een pagina is een eigen record (U-06, B-15). Reden: autosave schrijft dan één
 * pagina weg in plaats van een hele documentatie met twintig foto's aan blokken,
 * en een latere synchronisatie botst per pagina in plaats van per documentatie.
 *
 * Blokken staan **ingebed** in de pagina. Een blok heeft geen eigen levensduur,
 * geen eigen verwijzingen van buiten en geen zin buiten zijn pagina; een aparte
 * tabel zou alleen extra samenvoegwerk opleveren (§9.4).
 */

import type { BaseRecord, Uuid } from "./base";

export type LayoutId =
  | "A-fotoraster"
  | "B-verhaal"
  | "C-groot-beeld"
  | "D-alleen-beeld"
  | "E-vervolg";

export interface BlockBase {
  id: Uuid;
  slot: number;
  order: number;
}

export interface TextBlock extends BlockBase {
  kind: "text";
  text: string;
}

/** Uitsnede in verhoudingen van 0 tot 1, niet in pixels (B-65). */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PhotoBlock extends BlockBase {
  kind: "photo";
  photoId: Uuid;
  crop: Crop | null;
  altText: string;
}

export type AttributionStyle = "roepnaam" | "initiaal" | "geen";

export interface QuoteBlock extends BlockBase {
  kind: "quote";
  text: string;
  /** Hoogstens één leerling: meer is niet uit te drukken (INV-14, B-37). */
  studentId: Uuid | null;
  attributionStyle: AttributionStyle;
}

export interface HeadingBlock extends BlockBase {
  kind: "heading";
  text: string;
  level: 1 | 2;
}

export type Block = TextBlock | PhotoBlock | QuoteBlock | HeadingBlock;

export interface Page extends BaseRecord {
  /** Een pagina hoort bij precies één documentatie (INV-09). */
  documentationId: Uuid;
  /** Aaneengesloten vanaf 1 binnen de documentatie, zonder gaten (INV-11). */
  order: number;
  layoutId: LayoutId;
  /** Vervolgpagina's staan op `true` (B-74). */
  autoCreated: boolean;
  blocks: Block[];
}
