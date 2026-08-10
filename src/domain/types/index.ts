/**
 * De domeintypen van EduFlow (§9, §10.2).
 *
 * Eén invoerpunt zodat een service `@/domain/types` importeert en niet twaalf
 * losse paden. De verzameling is precies wat hoofdstuk 8 beschrijft en niets
 * meer (DR-01).
 *
 * **Vijf van de zesentwintig tabellen uit §8.3 ontbreken hier.** Drie omdat het
 * handboek er geen eenduidige veldbeschrijving voor geeft: `calendarEvents`
 * (O-10), `holidayPeriods` (O-08) en `settings` (O-09). Twee omdat ze bij een
 * later besluit zijn toegevoegd en nog getypeerd moeten worden: `weekPatterns`
 * en `weekPatternOverrides` (B-98, §8.3.15 en §8.3.16).
 */

export type { BaseRecord, Colour, IsoDate, IsoDateTime, Uuid } from "./base";
export type { Student } from "./student";
export type { Group, GroupKind, GroupMembership, MembershipRole } from "./group";
export type { Series } from "./series";
export type { Documentation, DocumentationStatus } from "./documentation";
export type {
  AttributionStyle,
  Block,
  BlockBase,
  Crop,
  HeadingBlock,
  LayoutId,
  Page,
  PhotoBlock,
  QuoteBlock,
  TextBlock,
} from "./page";
export type { Photo, PhotoVariant, PhotoVariantName } from "./photo";
export type { HolidayOverride, Region, SchoolYear } from "./schoolYear";
export type {
  MailAccount,
  MailDraft,
  MailDraftStatus,
  MailMessage,
  MailProvider,
  MailTemplate,
  MailTone,
  RecipientKind,
} from "./mail";
export type { PrivacyTerm, PrivacyTermKind } from "./privacy";
export type {
  Address,
  CorrectionRule,
  StyleExample,
  StyleProfile,
  StyleTrait,
  Tense,
} from "./style";
export type {
  AiInteraction,
  AiOutcome,
  AiRejectReason,
  AiTask,
  Feedback,
  FeedbackVerdict,
} from "./ai";
export type { AuditEvent, ChangeLogEntry, ChangeOperation } from "./audit";
