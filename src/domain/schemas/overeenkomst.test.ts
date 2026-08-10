/**
 * De typen en de schema's beschrijven hetzelfde, of dit bestand compileert niet.
 *
 * §10.2 geeft `types/` en `schemas/` als twee mappen, en §8.3 geeft per tabel
 * zowel een TypeScript-vorm als een Zod-schema. Twee beschrijvingen van hetzelfde
 * ding is precies het soort dubbele waarheid dat U-02 verbiedt — tenzij er iets
 * is dat ze aan elkaar vastzet.
 *
 * Dat is wat hier gebeurt. `Gelijk<A, B>` levert `true` alleen als A en B elkaar
 * wederzijds dekken. Voegt iemand een veld toe aan een type zonder het schema, of
 * andersom, dan wordt de waarde `false` en weigert TypeScript de toewijzing. De
 * toets faalt dan bij `pnpm typecheck`, vóór hij ooit draait.
 */

import { describe, expect, it } from "vitest";
import type { z } from "zod";

import type {
  AiInteraction,
  AuditEvent,
  BaseRecord,
  Block,
  CalendarEvent,
  ChangeLogEntry,
  Documentation,
  Feedback,
  Group,
  GroupMembership,
  HolidayOverride,
  HolidayPeriod,
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
  Settings,
  Student,
  StyleExample,
  StyleProfile,
  WeekPattern,
  WeekPatternOverride,
} from "../types";
import { zAiInteraction, zFeedback } from "./ai";
import { zAuditEvent, zChangeLogEntry } from "./audit";
import { zBaseRecord } from "./base";
import { zCalendarEvent } from "./calendar";
import { zDocumentation } from "./documentation";
import { zGroup, zGroupMembership } from "./group";
import { zMailAccount, zMailDraft, zMailMessage, zMailTemplate } from "./mail";
import { zBlock, zPage } from "./page";
import { zPhoto, zPhotoVariant } from "./photo";
import { zPrivacyTerm } from "./privacy";
import { zHolidayOverride, zHolidayPeriod, zSchoolYear } from "./schoolYear";
import { zSeries } from "./series";
import { zStudent } from "./student";
import { zSettings } from "./settings";
import { zStyleExample, zStyleProfile } from "./style";
import { zWeekPattern, zWeekPatternOverride } from "./weekPattern";

type Dekt<A, B> = [A] extends [B] ? true : false;
type Gelijk<A, B> = Dekt<A, B> extends true ? (Dekt<B, A> extends true ? true : false) : false;

const OVEREENKOMSTEN: boolean[] = [
  true satisfies Gelijk<z.infer<typeof zBaseRecord>, BaseRecord>,
  true satisfies Gelijk<z.infer<typeof zStudent>, Student>,
  true satisfies Gelijk<z.infer<typeof zGroup>, Group>,
  true satisfies Gelijk<z.infer<typeof zGroupMembership>, GroupMembership>,
  true satisfies Gelijk<z.infer<typeof zSeries>, Series>,
  true satisfies Gelijk<z.infer<typeof zDocumentation>, Documentation>,
  true satisfies Gelijk<z.infer<typeof zPage>, Page>,
  true satisfies Gelijk<z.infer<typeof zBlock>, Block>,
  true satisfies Gelijk<z.infer<typeof zPhoto>, Photo>,
  true satisfies Gelijk<z.infer<typeof zPhotoVariant>, PhotoVariant>,
  true satisfies Gelijk<z.infer<typeof zSchoolYear>, SchoolYear>,
  true satisfies Gelijk<z.infer<typeof zHolidayOverride>, HolidayOverride>,
  true satisfies Gelijk<z.infer<typeof zMailAccount>, MailAccount>,
  true satisfies Gelijk<z.infer<typeof zMailMessage>, MailMessage>,
  true satisfies Gelijk<z.infer<typeof zMailDraft>, MailDraft>,
  true satisfies Gelijk<z.infer<typeof zMailTemplate>, MailTemplate>,
  true satisfies Gelijk<z.infer<typeof zPrivacyTerm>, PrivacyTerm>,
  true satisfies Gelijk<z.infer<typeof zStyleProfile>, StyleProfile>,
  true satisfies Gelijk<z.infer<typeof zStyleExample>, StyleExample>,
  true satisfies Gelijk<z.infer<typeof zAiInteraction>, AiInteraction>,
  true satisfies Gelijk<z.infer<typeof zFeedback>, Feedback>,
  true satisfies Gelijk<z.infer<typeof zAuditEvent>, AuditEvent>,
  true satisfies Gelijk<z.infer<typeof zChangeLogEntry>, ChangeLogEntry>,
  true satisfies Gelijk<z.infer<typeof zCalendarEvent>, CalendarEvent>,
  true satisfies Gelijk<z.infer<typeof zHolidayPeriod>, HolidayPeriod>,
  true satisfies Gelijk<z.infer<typeof zSettings>, Settings>,
  true satisfies Gelijk<z.infer<typeof zWeekPattern>, WeekPattern>,
  true satisfies Gelijk<z.infer<typeof zWeekPatternOverride>, WeekPatternOverride>,
];

describe("types en schemas beschrijven hetzelfde", () => {
  it("dekt elke geïmplementeerde tabel", () => {
    // Alle zesentwintig tabellen uit §8.3, plus het basisrecord en de blokunie.
    expect(OVEREENKOMSTEN).toHaveLength(28);
    expect(OVEREENKOMSTEN.every(Boolean)).toBe(true);
  });
});
