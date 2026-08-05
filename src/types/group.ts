import type { Entity } from "./entity";

/**
 * Een groep is een eigen entiteit en geen tekstveld (besluit B-14), zodat er
 * later eigenschappen bij kunnen zonder elke leerling en documentatie aan te
 * raken. Verwachte uitbreidingen die er nu níét in zitten: kleur, locatie en
 * mentor — die hebben nog geen afnemer.
 */
export interface Group extends Entity {
  name: string;
  /** Bijvoorbeeld "2025/2026". Nodig om te kunnen archiveren. */
  schoolYear: string;
  /**
   * Gearchiveerd aan het eind van een schooljaar (besluit B-19). Verdwijnt uit
   * keuzelijsten maar telt onverkort mee bij de afscherming.
   */
  archived: boolean;
  /** Identificatie uit een ander systeem, voor het herkennen bij een import. */
  externalId?: string;
}
