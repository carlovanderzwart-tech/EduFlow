/**
 * Instellingen. Eén record onder een vaste sleutel, dus zonder `id` en zonder
 * tijdstempels — doc 03 beperkt die tot entiteiten met meerdere exemplaren.
 *
 * Alles hier bevat eigen tekst of een verwijzing en staat daarom in IndexedDB,
 * niet in localStorage (besluit T-01).
 */
export interface Settings {
  /** Staat bij een nieuwe documentatie vast ingevuld (doc 04, scherm 6). */
  defaultGroupId?: string;
  /**
   * Voorbeeldtekst die AI later als stijlrichtlijn gebruikt. Een eenvoudig
   * tekstveld, geen tweede documentatie-editor.
   */
  styleExample: string;
}

export const EMPTY_SETTINGS: Settings = {
  styleExample: "",
};
