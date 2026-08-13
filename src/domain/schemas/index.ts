/**
 * De Zod-schema's van EduFlow (§8.3, DR-23).
 *
 * Elk record dat de opslag in of uit gaat, gaat door zijn schema. Ook bij lezen:
 * een database van een half jaar oud kan gegevens bevatten die de typen niet
 * meer beschrijven.
 *
 * Alle schema's zijn `strict`: een onbekend veld wordt geweigerd, niet
 * genegeerd. Dat is de voorwaarde waaronder INV-23 iets betekent.
 *
 * **Alle zesentwintig tabellen uit §8.3 hebben een schema.** Ook de laatste vijf,
 * die in §8.3 wel staan maar in een eerdere stap nog geen schema hadden.
 */

export {
  CURRENT_SCHEMA_VERSION,
  recordSchema,
  zBaseRecord,
  zIsoDate,
  zIsoDateTime,
  zUuid,
} from "./base";
export { zColour } from "./colour";
export { zStudent } from "./student";
export { zGroup, zGroupKind, zGroupMembership, zMembershipRole } from "./group";
export { zSeries } from "./series";
export { zDocumentation, zDocumentationStatus } from "./documentation";
export { zAttributionStyle, zBlock, zCrop, zLayoutId, zPage } from "./page";
export { zPhoto, zPhotoVariant, zPhotoVariantName } from "./photo";
export { zHolidayOverride, zHolidayPeriod, zRegion, zSchoolYear } from "./schoolYear";
export {
  zMailAccount,
  zMailDraft,
  zMailDraftStatus,
  zMailMessage,
  zMailProvider,
  zMailTemplate,
  zMailTone,
  zRecipientKind,
} from "./mail";
export { zPrivacyTerm, zPrivacyTermKind } from "./privacy";
export { zAddress, zCorrectionRule, zStyleExample, zStyleProfile, zTense } from "./style";
export { zAiInteraction, zAiOutcome, zAiRejectReason, zAiTask, zFeedback, zFeedbackVerdict } from "./ai";
export { zAuditEvent, zChangeLogEntry, zChangeOperation } from "./audit";
export { zCalendarEvent, zCalendarEventKind, zCalendarEventSource } from "./calendar";
export { zDisableableDetector, zPupilNoun, zSettings } from "./settings";
export {
  zWeekPattern,
  zWeekPatternLine,
  zWeekPatternOverride,
  zWeekPatternOverrideKind,
} from "./weekPattern";
