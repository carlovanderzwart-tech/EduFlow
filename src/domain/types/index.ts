/**
 * De domeintypen van EduFlow (§9, §10.2).
 *
 * Eén invoerpunt zodat een service `@/domain/types` importeert en niet twaalf
 * losse paden. De verzameling is precies wat hoofdstuk 8 beschrijft en niets
 * meer (DR-01).
 *
 * **Alle zesentwintig tabellen uit §8.3 staan hier.** Ook de laatste vijf, die in
 * §8.3 wel staan maar in een eerdere stap nog geen type hadden.
 */

export type { BaseRecord, Colour, IsoDate, IsoDateTime, Uuid } from "./base";
export type { Student } from "./student";
export type { Group, GroupKind, GroupMembership, MembershipRole } from "./group";
export type { Series } from "./series";
export type { PseudonymEntry, PseudonymKind, PseudonymMap } from "./pseudonym";
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
export type { HolidayOverride, HolidayPeriod, Region, SchoolYear } from "./schoolYear";
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
export type {
  AllDayCalendarEvent,
  CalendarEvent,
  CalendarEventKind,
  CalendarEventSource,
  TimedCalendarEvent,
} from "./calendar";
export type { DisableableDetector, PupilNoun, Settings } from "./settings";
export type {
  DayCancelled,
  LineCancelled,
  LineChanged,
  WeekPattern,
  WeekPatternLine,
  WeekPatternOverride,
  WeekPatternOverrideKind,
} from "./weekPattern";
