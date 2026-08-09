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
 * **Drie tabellen uit §8.3 ontbreken**: `calendarEvents`, `holidayPeriods` en
 * `settings`. Zie de openstaande punten bij implementatiestap 3.
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
export { zHolidayOverride, zRegion, zSchoolYear } from "./schoolYear";
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
