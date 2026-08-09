/**
 * Domeingebeurtenissen rond leerlingen, groepen en de kalender
 * (§9.6, DE-24 t/m DE-29).
 *
 * `StudentEnrolled` en `StudentUnenrolled` gaan over lidmaatschappen en niet over
 * de leerling zelf: een leerling heeft geen groep (INV-23). Dat de gebeurtenis
 * beide sleutels draagt, is de reden dat het dashboard en de zoekindex kunnen
 * bijwerken zonder het `Group`-aggregaat te openen.
 *
 * `StudentRenamed` gaat naar `PrivacyService`, want de namenlijst is de kern van
 * de afscherming (INV-38). Een hernoemde leerling die niet doorkomt, is een naam
 * die niet meer wordt afgeschermd.
 */

import type { IsoDate, Uuid } from "../types";

/** DE-24 — als een lidmaatschap begint. */
export interface StudentEnrolled {
  type: "StudentEnrolled";
  studentId: Uuid;
  groupId: Uuid;
  from: IsoDate;
}

/** DE-25 — als een lidmaatschap een einddatum krijgt. */
export interface StudentUnenrolled {
  type: "StudentUnenrolled";
  studentId: Uuid;
  groupId: Uuid;
  to: IsoDate;
  reason: string;
}

/** DE-26 — als de weergavenaam van een leerling wijzigt (INV-29). */
export interface StudentRenamed {
  type: "StudentRenamed";
  studentId: Uuid;
  previousName: string;
  name: string;
}

/** DE-27 — bij de jaarovergang (FR-INS-09). */
export interface SchoolYearRolledOver {
  type: "SchoolYearRolledOver";
  previousSchoolYearId: Uuid;
  schoolYearId: Uuid;
  closedMemberships: number;
  newGroups: number;
}

/** DE-28 — als het vakantiebestand een nieuwe versie krijgt (B-50, FR-AGE-11). */
export interface HolidayFileUpdated {
  type: "HolidayFileUpdated";
  previousVersion: number;
  version: number;
  validUntil: IsoDate;
  keptOverrides: number;
}

/** DE-29 — na een geslaagde ICS-import (B-30). */
export interface CalendarImported {
  type: "CalendarImported";
  imported: number;
  skipped: number;
  fileName: string;
}

export type SchoolEvent =
  | StudentEnrolled
  | StudentUnenrolled
  | StudentRenamed
  | SchoolYearRolledOver
  | HolidayFileUpdated
  | CalendarImported;
