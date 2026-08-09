/**
 * De negenendertig domeingebeurtenissen (§9.6).
 *
 * Hier staan alleen de **typen**. De `EventBus` die ze rondstuurt hoort bij een
 * latere implementatiestap; het domein beschrijft wat er gebeurt, niet hoe het
 * wordt bezorgd.
 *
 * `DE_NUMMER` koppelt elke gebeurtenis aan zijn nummer uit het handboek. De
 * tabel is getypeerd als `Record<DomainEventType, DeNummer>`, en dat is de
 * grendel: komt er een gebeurtenis in de unie bij zonder nummer, dan compileert
 * dit bestand niet. Dat een nummer nooit wordt hergebruikt, is regel 1 van het
 * besluitenregister (§19.1).
 */

import type { AiEvent } from "./ai";
import type { DocumentationEvent } from "./documentation";
import type { MailEvent } from "./mail";
import type { PhotoEvent } from "./photo";
import type { SchoolEvent } from "./school";
import type { SystemEvent } from "./system";

export type * from "./ai";
export type * from "./documentation";
export type * from "./mail";
export type * from "./photo";
export type * from "./school";
export type * from "./system";

export type DomainEvent =
  | DocumentationEvent
  | PhotoEvent
  | AiEvent
  | SchoolEvent
  | MailEvent
  | SystemEvent;

export type DomainEventType = DomainEvent["type"];

export type DeNummer =
  | "DE-01"
  | "DE-02"
  | "DE-03"
  | "DE-04"
  | "DE-05"
  | "DE-06"
  | "DE-07"
  | "DE-08"
  | "DE-09"
  | "DE-10"
  | "DE-11"
  | "DE-12"
  | "DE-13"
  | "DE-14"
  | "DE-15"
  | "DE-16"
  | "DE-17"
  | "DE-18"
  | "DE-19"
  | "DE-20"
  | "DE-21"
  | "DE-22"
  | "DE-23"
  | "DE-24"
  | "DE-25"
  | "DE-26"
  | "DE-27"
  | "DE-28"
  | "DE-29"
  | "DE-30"
  | "DE-31"
  | "DE-32"
  | "DE-33"
  | "DE-34"
  | "DE-35"
  | "DE-36"
  | "DE-37"
  | "DE-38"
  | "DE-39";

export const DE_NUMMER: Readonly<Record<DomainEventType, DeNummer>> = {
  DocumentationCreated: "DE-01",
  DocumentationContentChanged: "DE-02",
  DocumentationDateChanged: "DE-03",
  PageAdded: "DE-04",
  PageRemoved: "DE-05",
  PageOverflowed: "DE-06",
  PageLayoutChanged: "DE-07",
  PhotoAdded: "DE-08",
  PhotoRejected: "DE-09",
  PhotoOrphaned: "DE-10",
  PhotoPurged: "DE-11",
  AISuggestionRequested: "DE-12",
  AISuggestionReceived: "DE-13",
  AISuggestionAccepted: "DE-14",
  AISuggestionDiscarded: "DE-15",
  AISuggestionRetried: "DE-16",
  AISuggestionFailed: "DE-17",
  PrivacyGateBlocked: "DE-18",
  StyleProfileUpdated: "DE-19",
  StyleRuleProposed: "DE-20",
  DocumentationExported: "DE-21",
  DocumentationShared: "DE-22",
  ImageConsentConfirmed: "DE-23",
  StudentEnrolled: "DE-24",
  StudentUnenrolled: "DE-25",
  StudentRenamed: "DE-26",
  SchoolYearRolledOver: "DE-27",
  HolidayFileUpdated: "DE-28",
  CalendarImported: "DE-29",
  MailAccountConnected: "DE-30",
  MailAccountRejected: "DE-31",
  MailAccountDisconnected: "DE-32",
  MailMessageSummarised: "DE-33",
  MailDraftHandedOff: "DE-34",
  BackupCreated: "DE-35",
  BackupRestored: "DE-36",
  StorageThresholdReached: "DE-37",
  AccessCodeAccepted: "DE-38",
  AccessCodeRejected: "DE-39",
};
