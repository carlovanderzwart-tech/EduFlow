/**
 * Velden die elke entiteit met meerdere exemplaren draagt (docs/archief/03, *Gedeelde
 * velden op elke entiteit*, besluit T-11).
 *
 * Tijdstempels staan er ook waar niets ze vandaag leest: ze zijn niet met
 * terugwerkende kracht te maken. Instellingen en het logboek vallen hier buiten
 * — die hebben respectievelijk één exemplaar en worden alleen toegevoegd.
 */
export interface Entity {
  id: string;
  /** ISO-tijdstempel. */
  createdAt: string;
  /** ISO-tijdstempel. */
  updatedAt: string;
}
