/**
 * Geldige voorbeeldrecords voor de toetsen van `domain/`.
 *
 * Dit bestand hoort bij de toetsen en niet bij de app: geen enkele service of
 * scherm importeert eruit. Het staat hier en niet in de toetsbestanden zelf,
 * omdat negentien toetsen anders negentien keer hetzelfde basisrecord zouden
 * opschrijven en een wijziging in `BaseRecord` negentien plekken zou raken.
 *
 * Elke functie levert een record dat **hoort te slagen**. Een toets die een regel
 * wil bewijzen, verandert precies één veld en toont dat het schema dan faalt. Zo
 * bewijst elke toets één regel en niet per ongeluk een andere.
 *
 * De namen komen uit bijlage A van het handboek. Nooit de naam van een echt kind,
 * ook niet in een voorbeeld.
 */

import { newId } from "@/lib/uuid";

import type {
  AiInteraction,
  AllDayCalendarEvent,
  AuditEvent,
  BaseRecord,
  ChangeLogEntry,
  Documentation,
  HolidayPeriod,
  Settings,
  TimedCalendarEvent,
  WeekPattern,
  WeekPatternOverride,
  Feedback,
  Group,
  GroupMembership,
  HolidayOverride,
  MailAccount,
  MailDraft,
  MailMessage,
  MailTemplate,
  Page,
  Photo,
  PhotoVariant,
  PrivacyTerm,
  SchoolYear,
  Series,
  Student,
  StyleExample,
  StyleProfile,
} from "./types";

const EERDER = "2026-08-01T09:15:00.000Z";
const LATER = "2026-08-09T12:04:55.031Z";

/**
 * Hetzelfde record, met één veld eruit.
 *
 * Toetsen die bewijzen dat een veld verplicht is, hebben dit nodig. Het
 * alternatief — `const { veld: _weg, ...rest } = record` — laat in elk
 * toetsbestand een ongebruikte variabele achter.
 */
export function zonderVeld(record: object, veld: string): unknown {
  return Object.fromEntries(Object.entries(record).filter(([naam]) => naam !== veld));
}

export function basisRecord(): BaseRecord {
  return {
    id: newId(),
    createdAt: EERDER,
    updatedAt: LATER,
    deletedAt: null,
    rev: 1,
    origin: newId(),
    schemaVersion: 1,
  };
}

export function leerling(): Student {
  return {
    ...basisRecord(),
    firstName: "Kjeld",
    firstNameLower: "kjeld",
    lastNameInitial: "V.",
    birthDay: 14,
    birthMonth: 3,
    birthYear: 2017,
    note: "",
    pseudonymSeed: 1,
  };
}

export function schooljaar(): SchoolYear {
  return {
    ...basisRecord(),
    name: "2026-2027",
    firstSchoolDay: "2026-08-24",
    lastSchoolDay: "2027-07-09",
    region: "midden",
    isCurrent: true,
  };
}

export function groep(): Group {
  return {
    ...basisRecord(),
    name: "Groep 4 – De Regenboog",
    kind: "stamgroep",
    schoolYearId: newId(),
    colour: "series-1",
  };
}

export function lidmaatschap(): GroupMembership {
  return {
    ...basisRecord(),
    studentId: newId(),
    groupId: newId(),
    from: "2026-08-24",
    to: null,
    role: "lid",
  };
}

export function reeks(): Series {
  return {
    ...basisRecord(),
    name: "Kunstwerk Dok",
    colour: "series-1",
    description: "Vier documentaties over acht weken.",
  };
}

export function documentatie(): Documentation {
  return {
    ...basisRecord(),
    title: "De eerste schets",
    date: "2026-10-13",
    seriesId: null,
    studentIds: [newId()],
    groupIds: [newId()],
    pageIds: [newId()],
    privateNote: "",
    status: "concept",
    firstExportedAt: null,
    archivedAt: null,
    imageConsentAt: null,
  };
}

export function pagina(): Page {
  return {
    ...basisRecord(),
    documentationId: newId(),
    order: 1,
    layoutId: "A-fotoraster",
    autoCreated: false,
    blocks: [{ id: newId(), slot: 0, order: 0, kind: "text", text: "Kjeld bouwde een brug." }],
  };
}

export function foto(): Photo {
  return {
    ...basisRecord(),
    width: 3300,
    height: 2200,
    bytes: 1_240_000,
    hash: "a".repeat(64),
    capturedAt: EERDER,
    orientation: 1,
    refCount: 1,
  };
}

export function fotoformaat(): PhotoVariant {
  return {
    ...basisRecord(),
    photoId: newId(),
    variant: "print",
    blob: new Blob(["beeld"], { type: "image/jpeg" }),
    bytes: 980_000,
  };
}

export function vakantieaanpassing(): HolidayOverride {
  return {
    ...basisRecord(),
    schoolYearName: "2026-2027",
    region: "midden",
    holidayKey: "herfst",
    from: "2026-10-17",
    to: "2026-10-25",
  };
}

export function postbus(): MailAccount {
  return {
    ...basisRecord(),
    provider: "microsoft",
    emailAddress: "ilse@example.invalid",
    displayName: "Ilse",
    connectedAt: EERDER,
    scopesGranted: ["Mail.Read", "Mail.ReadWrite"],
    lastSyncAt: LATER,
  };
}

export function bericht(): MailMessage {
  return {
    ...basisRecord(),
    externalId: "AAMkAD-0001",
    subject: "Vraag over de schooltuin",
    fromName: "Ouder van Aya",
    fromAddress: "ouder@example.invalid",
    receivedAt: EERDER,
    bodyText: "Goedemiddag,",
    hasAttachments: false,
    attachmentNames: [],
    cachedAt: EERDER,
    expiresAt: LATER,
  };
}

export function mailconcept(): MailDraft {
  return {
    ...basisRecord(),
    subject: "Gesprek over Aya — dinsdag 13 oktober",
    body: "Beste,",
    recipientKind: "ouder",
    tone: "warm",
    studentIds: [],
    groupIds: [],
    sourceMessageId: null,
    templateId: null,
    status: "concept",
  };
}

export function sjabloon(): MailTemplate {
  return {
    ...basisRecord(),
    name: "Uitnodiging oudergesprek",
    recipientKind: "ouder",
    instructions: "Kort en warm.",
    skeleton: "Beste ouder,",
    isBuiltIn: true,
    originalHash: "b".repeat(64),
  };
}

export function privacyterm(): PrivacyTerm {
  return {
    ...basisRecord(),
    term: "De Regenboog",
    termLower: "de regenboog",
    kind: "school",
    enabled: true,
  };
}

export function stijlprofiel(): StyleProfile {
  return {
    ...basisRecord(),
    avgSentenceWords: { value: 14, manual: false },
    avgParagraphSentences: { value: 3, manual: false },
    tense: { value: "tegenwoordig", manual: false },
    address: { value: "wij", manual: true },
    quoteFrequency: { value: 1, manual: false },
    descriptionRatio: { value: 0.8, manual: false },
    preferredWords: [],
    avoidedWords: ["prachtig", "geweldig"],
    correctionRules: [],
    sampleCount: 5,
    lastComputedAt: LATER,
  };
}

export function stijlvoorbeeld(): StyleExample {
  return {
    ...basisRecord(),
    rawNote: "brug van blokken, viel om, opnieuw",
    goodResult: "De brug viel om. Ze bouwden hem opnieuw.",
    overshotResult: "Met tomeloze inzet herrees het prachtige bouwwerk.",
    overshotReason: "Te bloemrijk en het duidt in plaats van beschrijft.",
    isGolden: true,
  };
}

export function aiAanroep(): AiInteraction {
  return {
    ...basisRecord(),
    task: "doc.write",
    provider: "eu-provider",
    model: "model-1",
    region: "eu-west",
    charsIn: 420,
    charsOut: 610,
    pseudonymCount: 2,
    durationMs: 1800,
    outcome: "accepted",
    rejectReason: null,
    similarity: 0.72,
    documentationId: null,
  };
}

export function terugkoppeling(): Feedback {
  return {
    ...basisRecord(),
    aiInteractionId: newId(),
    verdict: "goed",
    comment: "Klopt met wat er gebeurde.",
  };
}

export function logboekregel(): AuditEvent {
  return {
    ...basisRecord(),
    kind: "export",
    at: LATER,
    deviceName: "pc-ilse",
    detail: "Export: deelbare afbeelding, 3 pagina's, initialen aan",
    actorNote: "",
  };
}

export function agendaItem(): TimedCalendarEvent {
  return {
    ...basisRecord(),
    title: "Oudergesprek Kjeld",
    kind: "oudergesprek",
    allDay: false,
    start: "2026-10-13T12:00:00.000Z",
    end: "2026-10-13T12:30:00.000Z",
    note: "",
    location: "",
    groupIds: [],
    studentIds: [newId()],
    documentationId: null,
    mailDraftId: null,
    source: "own",
    recurrence: null,
  };
}

export function heleDagItem(): AllDayCalendarEvent {
  return {
    ...basisRecord(),
    title: "Studiedag",
    kind: "studiedag",
    allDay: true,
    start: "2026-10-12",
    end: "2026-10-12",
    note: "",
    location: "",
    groupIds: [],
    studentIds: [],
    documentationId: null,
    mailDraftId: null,
    source: "own",
    recurrence: null,
  };
}

export function vakantieperiode(): HolidayPeriod {
  return {
    ...basisRecord(),
    schoolYearName: "2026-2027",
    region: "midden",
    holidayKey: "herfst",
    name: "Herfstvakantie",
    from: "2026-10-17",
    to: "2026-10-25",
    fixed: false,
    fileVersion: 2,
  };
}

export function instellingen(): Settings {
  return {
    ...basisRecord(),
    deviceId: newId(),
    defaultGroupId: null,
    defaultStudentIds: [],
    attentionThresholdDays: 42,
    pupilNoun: "leerling",
    disabledDetectors: [],
    showOutgoingRequest: true,
  };
}

export function basisweek(): WeekPattern {
  return {
    ...basisRecord(),
    schoolYearId: newId(),
    validFrom: "2026-08-24",
    validTo: null,
    lines: [
      { id: newId(), weekday: 1, startTime: "08:30", endTime: "09:15", title: "rekenen", groupId: null },
      { id: newId(), weekday: 1, startTime: "09:15", endTime: "10:00", title: "taal", groupId: null },
    ],
  };
}

export function aangepasteDag(): WeekPatternOverride {
  return {
    ...basisRecord(),
    date: "2026-09-14",
    kind: "onderdeel-vervalt",
    lineId: newId(),
  };
}

export function journaalregel(): ChangeLogEntry {
  return {
    table: "documentations",
    recordId: newId(),
    rev: 2,
    op: "update",
    at: LATER,
    origin: newId(),
  };
}
