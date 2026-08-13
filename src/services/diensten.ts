/**
 * Waar de diensten worden opgebouwd (§10.3).
 *
 * Elke service krijgt zijn afhankelijkheden bij het maken, en dit is de enige plek
 * die de echte levert: de geopende opslag, de systeemklok en `localStorage`. Een
 * toets bouwt zijn eigen exemplaren met een eigen database en een stilstaande klok,
 * en raakt dit bestand niet aan.
 *
 * Eén exemplaar per tabblad, gedeeld door de schermen. Bewust een belofte en geen
 * waarde: de opslag opent asynchroon, en een scherm dat er te vroeg bij is hoort te
 * wachten in plaats van een half geopende database te krijgen.
 */

import { hertekenViaCanvas } from "@/lib/beeld";

import { createAgendaService, type AgendaService } from "./agenda/AgendaService";
import { createAIService, type AIService } from "./ai/AIService";
import { createPromptService } from "./ai/PromptService";
import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createGroupService, type GroupService } from "./groups/GroupService";
import { createPhotoService, type PhotoService } from "./photo/PhotoService";
import { createSampleDataService, type SampleDataService } from "./sampledata/SampleDataService";
import { createSeriesService, type SeriesService } from "./series/SeriesService";
import { createSettingsService, type SettingsService } from "./settings/SettingsService";
import type { Voorkeurenopslag } from "./settings/voorkeuren";
import { opslag } from "./storage/start";
import type { Clock, StorageService } from "./storage/StorageService";
import { createStudentService, type StudentService } from "./students/StudentService";

const SYSTEEMKLOK: Clock = { now: () => new Date() };

/**
 * `localStorage` als het bestaat, en anders een opslag die niets bewaart.
 *
 * Nodig omdat Next de schermen ook op de server tekent, waar geen `window` is. Een
 * voorkeur die daar wordt gelezen valt terug op zijn standaardwaarde, en dat is
 * precies wat §8.2.2 voorschrijft bij een sleutel die er niet staat.
 */
function browserVoorkeuren(): Voorkeurenopslag {
  if (typeof window !== "undefined") return window.localStorage;
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

export interface Diensten {
  storage: StorageService;
  settings: SettingsService;
  students: StudentService;
  groups: GroupService;
  series: SeriesService;
  documentation: DocumentationService;
  photos: PhotoService;
  agenda: AgendaService;
  /** De enige aanroeper van `/api/ai` (DR-16). */
  ai: AIService;
  /** Doorloopgereedschap; gaat eruit vóór v1.0 (werkopdracht D02). */
  sampleData: SampleDataService;
}

async function bouw(): Promise<Diensten> {
  const storage = await opslag();

  const settings = createSettingsService({ storage, voorkeurenOpslag: browserVoorkeuren() });
  const students = createStudentService({ storage });
  const groups = createGroupService({ storage });
  const series = createSeriesService({ storage });

  return {
    storage,
    settings,
    students,
    groups,
    series,
    documentation: createDocumentationService({ storage, clock: SYSTEEMKLOK }),
    // De hertekenaar komt uit `lib/`, want hij heeft een canvas nodig en DR-12 wil
    // `PhotoService` toetsbaar houden zonder browser.
    photos: createPhotoService({ storage, tekenen: hertekenViaCanvas }),
    agenda: createAgendaService({ storage }),
    ai: createAIService({
      storage,
      prompts: createPromptService(),
      clock: SYSTEEMKLOK,
      fetch: (...argumenten) => globalThis.fetch(...argumenten),
      provider: settings.voorkeur("aiProvider"),
    }),
    sampleData: createSampleDataService({
      storage,
      students,
      groups,
      series,
      region: settings.voorkeur("region"),
    }),
  };
}

let lopend: Promise<Diensten> | null = null;

export function diensten(): Promise<Diensten> {
  lopend ??= bouw();
  return lopend;
}
