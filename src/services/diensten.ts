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

import { createAgendaService, type AgendaService } from "./agenda/AgendaService";
import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
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
  documentation: DocumentationService;
  agenda: AgendaService;
}

async function bouw(): Promise<Diensten> {
  const storage = await opslag();

  return {
    storage,
    settings: createSettingsService({ storage, voorkeurenOpslag: browserVoorkeuren() }),
    students: createStudentService({ storage }),
    documentation: createDocumentationService({ storage, clock: SYSTEEMKLOK }),
    agenda: createAgendaService({ storage }),
  };
}

let lopend: Promise<Diensten> | null = null;

export function diensten(): Promise<Diensten> {
  lopend ??= bouw();
  return lopend;
}
