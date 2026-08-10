/**
 * De zesentwintig tabellen uit §8.3, met hun indexen en hun schema.
 *
 * Eén registratie voor twee dingen die anders uit elkaar lopen: waarmee Dexie de
 * database opent, en waarmee `StorageService` elk record controleert (DR-23). Zou
 * de storelijst ergens anders staan dan de schemalijst, dan is een tabel zonder
 * schema een kwestie van tijd — en die schrijft dan ongecontroleerd weg.
 *
 * De indexen komen uit §8.3 en §8.5. Waar een tabel er geen noemt, staat alleen
 * de primaire sleutel: een index die niemand bevraagt kost schrijftijd en levert
 * niets op.
 */

import type { z } from "zod";

import {
  zAiInteraction,
  zAuditEvent,
  zCalendarEvent,
  zDocumentation,
  zFeedback,
  zGroup,
  zGroupMembership,
  zHolidayOverride,
  zHolidayPeriod,
  zMailAccount,
  zMailDraft,
  zMailMessage,
  zMailTemplate,
  zPage,
  zPhoto,
  zPhotoVariant,
  zPrivacyTerm,
  zSchoolYear,
  zSeries,
  zSettings,
  zStudent,
  zStyleExample,
  zStyleProfile,
  zWeekPattern,
  zWeekPatternOverride,
} from "@/domain/schemas";

/**
 * De vijfentwintig tabellen die van `BaseRecord` erven en dus een `id` hebben.
 *
 * `changeLog` staat er niet bij: die erft niet van `BaseRecord` (§8.3), heeft geen
 * `id` en wordt niet door de gewone schrijfweg aangeraakt. Hij staat in
 * `db.ts` als losse store met een sleutel buiten het record.
 */
export const TABELLEN = {
  students: { schema: zStudent, indexen: "firstNameLower, deletedAt" },
  groups: { schema: zGroup, indexen: "schoolYearId, deletedAt" },
  groupMemberships: {
    schema: zGroupMembership,
    indexen: "studentId, groupId, [studentId+groupId], [groupId+from], deletedAt",
  },
  series: { schema: zSeries, indexen: "deletedAt" },
  documentations: {
    schema: zDocumentation,
    indexen: "date, updatedAt, seriesId, status, *studentIds, *groupIds, deletedAt",
  },
  pages: { schema: zPage, indexen: "documentationId, [documentationId+order], deletedAt" },
  photos: { schema: zPhoto, indexen: "hash, refCount, deletedAt" },
  photoVariants: { schema: zPhotoVariant, indexen: "photoId, [photoId+variant], deletedAt" },
  calendarEvents: {
    schema: zCalendarEvent,
    indexen: "start, [start+end], kind, *groupIds, documentationId, deletedAt",
  },
  schoolYears: { schema: zSchoolYear, indexen: "name, isCurrent, deletedAt" },
  holidayPeriods: {
    schema: zHolidayPeriod,
    indexen: "[schoolYearName+region], holidayKey, deletedAt",
  },
  holidayOverrides: {
    schema: zHolidayOverride,
    indexen: "[schoolYearName+region+holidayKey], deletedAt",
  },
  mailAccounts: { schema: zMailAccount, indexen: "deletedAt" },
  mailMessages: { schema: zMailMessage, indexen: "externalId, expiresAt, deletedAt" },
  mailDrafts: { schema: zMailDraft, indexen: "status, updatedAt, deletedAt" },
  mailTemplates: { schema: zMailTemplate, indexen: "deletedAt" },
  privacyTerms: { schema: zPrivacyTerm, indexen: "termLower, deletedAt" },
  styleProfile: { schema: zStyleProfile, indexen: "deletedAt" },
  styleExamples: { schema: zStyleExample, indexen: "isGolden, deletedAt" },
  aiInteractions: { schema: zAiInteraction, indexen: "task, documentationId, deletedAt" },
  feedback: { schema: zFeedback, indexen: "aiInteractionId, deletedAt" },
  auditEvents: { schema: zAuditEvent, indexen: "kind, at, deletedAt" },
  settings: { schema: zSettings, indexen: "deletedAt" },
  weekPatterns: { schema: zWeekPattern, indexen: "[schoolYearId+validFrom], deletedAt" },
  weekPatternOverrides: {
    schema: zWeekPatternOverride,
    indexen: "date, [date+lineId], deletedAt",
  },
} as const;

export type TabelNaam = keyof typeof TABELLEN;

/** Het recordtype van één tabel, afgeleid uit zijn schema (U-02). */
export type RecordVan<Naam extends TabelNaam> = z.infer<(typeof TABELLEN)[Naam]["schema"]>;

export const TABELNAMEN = Object.keys(TABELLEN) as TabelNaam[];
