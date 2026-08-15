/**
 * De agenda (§10.4, §6.2, §9.5.4).
 *
 * Twee vormen van hetzelfde begrip (INV-31): een hele-dag-item draagt kalenderdagen,
 * een item met tijden draagt tijdstippen in UTC. Ze sluiten elkaar uit, en dat is
 * wat INV-31 met "twee varianten in één unie" bedoelt.
 *
 * **Twee van de acht soorten maakt niemand zelf.** Een `verjaardag` wordt afgeleid
 * uit de leerlingenlijst en nooit opgeslagen (FR-AGE-05), en een `vakantie` komt uit
 * het vakantiebestand (§6.2.2, kolom Bron). Wie ze toch aanlevert, krijgt een
 * melding in plaats van een record.
 *
 * Wat er in deze eerste versie **niet** in zit: de vier weergaven van FR-AGE-01, het
 * snelveld van FR-AGE-13, slepen, de ICS-export, en de basisweek van §6.2.11 met
 * `dagVan()`. Die staan in het handboek en komen later; hier staat alleen wat een
 * item laat bestaan en terugvinden.
 */

import {
  dagenVan,
  isIsoDate,
  isIsoDateTime,
  overlapt,
  type IsoDate,
  type IsoDateTime,
} from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import { vandaag } from "@/lib/weergave";
import type {
  CalendarEvent,
  CalendarEventKind,
  Recurrence,
  Region,
  SchoolYear,
} from "@/domain/types";

import { raaktPeriode } from "./itemdagen";
import { afgekaptVoor, metGat, verschijningen, type Reikwijdte } from "./RecurrenceService";
import type { StorageService } from "../storage/StorageService";

export interface AgendaDeps {
  storage: StorageService;
}

interface Gemeenschappelijk {
  title: string;
  kind: CalendarEventKind;
  note?: string;
  location?: string;
  studentIds?: Uuid[];
  /** De herhaling, of niets voor een item dat één keer valt (§6.2.5, B-123). */
  recurrence?: Recurrence | null;
}

/**
 * Wat het scherm aanlevert.
 *
 * De unie loopt over `allDay`, net als het record. Zonder die tweedeling zou een
 * scherm een hele-dag-item met tijdstippen kunnen aanleveren, en dan zou INV-31
 * pas bij het schema stuklopen in plaats van bij de aanroep.
 */
export type Agendainvoer =
  | (Gemeenschappelijk & { allDay: true; start: IsoDate; end: IsoDate })
  | (Gemeenschappelijk & { allDay: false; start: IsoDateTime; end: IsoDateTime });

/**
 * Welke soorten je zelf aanmaakt (§6.2.2, kolom Bron).
 *
 * `verjaardag` en `vakantie` staan er niet bij, en dat is geen beperking van deze
 * versie maar van het model: de eerste is afgeleid, de tweede komt uit een bestand.
 */
export const EIGEN_SOORTEN = [
  "afspraak",
  "oudergesprek",
  "studiedag",
  "margedag",
  "herinnering",
  "documentatiemoment",
] as const satisfies readonly CalendarEventKind[];

export type EigenSoort = (typeof EIGEN_SOORTEN)[number];

/**
 * Of een soort standaard de hele dag beslaat (§6.2.2, kolom "Hele dag").
 *
 * Een standaard en geen vaste waarde: de veldtabel van §6.2.2 zet `allDay` in de
 * kolom **Standaard** met "volgt uit soort". Een excursie van een hele dag is een
 * `afspraak`, en die moet je dus kunnen omzetten.
 */
export const HELE_DAG_STANDAARD: Record<EigenSoort, boolean> = {
  afspraak: false,
  oudergesprek: false,
  studiedag: true,
  margedag: true,
  herinnering: false,
  documentatiemoment: false,
};

/** Nederlandse namen voor de schermen; de code houdt de sleutels aan (§9.9). */
export const SOORTNAMEN: Record<EigenSoort, string> = {
  afspraak: "Afspraak",
  oudergesprek: "Oudergesprek",
  studiedag: "Studiedag",
  margedag: "Margedag",
  herinnering: "Herinnering",
  documentatiemoment: "Documentatiemoment",
};

/**
 * Alle regels die een item tegenhouden, in één plek zodat de melding er één is.
 *
 * Buiten de fabriek, want hij raakt de opslag niet: hij leest alleen de invoer.
 */
function bezwaar(invoer: Agendainvoer): string | null {
  if (!invoer.title.trim()) {
    return "Een agenda-item heeft een titel nodig. Vul er een in.";
  }

  if (invoer.kind === "verjaardag") {
    return "Verjaardagen komen uit je leerlingenlijst. Vul daar een geboortedatum in.";
  }
  if (invoer.kind === "vakantie") {
    return "Vakanties komen uit het vakantiebestand. Ze zijn hier niet aan te maken.";
  }

  // FR-AGE-04: het gesprek gaat over één kind, en de koppeling stuurt de mail.
  if (invoer.kind === "oudergesprek" && (invoer.studentIds ?? []).length !== 1) {
    return "Een oudergesprek gaat over precies één leerling. Kies er een.";
  }

  const klopt = invoer.allDay ? isIsoDate : isIsoDateTime;
  if (!klopt(invoer.start) || !klopt(invoer.end)) {
    return "Deze datum klopt niet. Vul een begin en een einde in.";
  }

  // INV-30. Vergelijken op de tekenreeks mag binnen één variant: beide vormen
  // hebben een vaste breedte, dus alfabetische volgorde ís chronologische.
  if (invoer.end < invoer.start) {
    return "Het einde ligt vóór het begin. Zet het einde later.";
  }

  return null;
}

export function createAgendaService(deps: AgendaDeps) {
  async function maak(invoer: Agendainvoer): Promise<Result<CalendarEvent>> {
    const reden = bezwaar(invoer);
    if (reden) return ongeldig(reden);

    const gemeenschappelijk = {
      title: invoer.title.trim(),
      kind: invoer.kind,
      note: invoer.note ?? "",
      location: invoer.location ?? "",
      groupIds: [],
      studentIds: invoer.studentIds ?? [],
      documentationId: null,
      mailDraftId: null,
      // Zelf gemaakt, dus `own`. Een teruggezet vakantiebestand overschrijft het
      // niet, want dat raakt alleen `holidayFile` (§8.7).
      source: "own" as const,
      recurrence: invoer.recurrence ?? null,
    };

    // De twee takken staan uitgeschreven en niet samengevoegd met een spread: de
    // unie van INV-31 valt anders terug op `string` en dan is de winst weg.
    return invoer.allDay
      ? deps.storage.create("calendarEvents", {
          ...gemeenschappelijk,
          allDay: true,
          start: invoer.start,
          end: invoer.end,
        })
      : deps.storage.create("calendarEvents", {
          ...gemeenschappelijk,
          allDay: false,
          start: invoer.start,
          end: invoer.end,
        });
  }

  /**
   * Alle items, het eerstvolgende bovenaan.
   *
   * Een kalenderdag en een tijdstip van dezelfde dag sorteren goed door elkaar: de
   * dag is het voorvoegsel van het tijdstip, dus `2026-08-11` komt vóór
   * `2026-08-11T09:00:00.000Z` (INV-31).
   */
  async function lijst(): Promise<Result<CalendarEvent[]>> {
    const uitkomst = await deps.storage.list("calendarEvents");
    if (!uitkomst.ok) return uitkomst;

    return {
      ok: true,
      value: [...uitkomst.value].sort((a, b) => a.start.localeCompare(b.start)),
    };
  }

  /** Wijzigt een bestaand item; dezelfde regels gelden als bij het maken. */
  async function wijzig(id: Uuid, invoer: Agendainvoer): Promise<Result<CalendarEvent>> {
    const reden = bezwaar(invoer);
    if (reden) return ongeldig(reden);

    const velden = {
      title: invoer.title.trim(),
      kind: invoer.kind,
      note: invoer.note ?? "",
      location: invoer.location ?? "",
      studentIds: invoer.studentIds ?? [],
      recurrence: invoer.recurrence ?? null,
    };

    return invoer.allDay
      ? deps.storage.update("calendarEvents", id, {
          ...velden,
          allDay: true,
          start: invoer.start,
          end: invoer.end,
        })
      : deps.storage.update("calendarEvents", id, {
          ...velden,
          allDay: false,
          start: invoer.start,
          end: invoer.end,
        });
  }

  /**
   * Alles wat een periode raakt, ook een item dat er alleen overheen loopt.
   *
   * Herhalende items worden hier **uitgeklapt** (§6.2.5, B-123): de opslag draagt één
   * record per reeks, en pas op het moment dat je een week of een maand bekijkt is
   * bekend welke verschijningen daarin vallen. Een gymles van elke dinsdag staat dus
   * in oktober in beeld terwijl het record uit september komt.
   */
  async function periode(van: IsoDate, tot: IsoDate): Promise<Result<CalendarEvent[]>> {
    const alle = await lijst();
    if (!alle.ok) return alle;

    const uitgeklapt = alle.value.flatMap((item) => verschijningen(item, van, tot));

    return {
      ok: true,
      value: uitgeklapt
        .filter((item) => raaktPeriode(item, van, tot))
        .sort((a, b) => a.start.localeCompare(b.start)),
    };
  }

  /** Verwijderen is markeren; het item blijft dertig dagen herstelbaar (FR-AGE-16). */
  function verwijder(id: Uuid): Promise<Result<CalendarEvent>> {
    return deps.storage.softDelete("calendarEvents", id);
  }

  return {
    maak,
    wijzig,
    lijst,
    periode,
    verwijder,
    huidigSchooljaar: () => huidigSchooljaar(deps.storage),
    zetSchooljaar: (invoer: Schooljaarinvoer) => zetSchooljaar(deps.storage, invoer),
    wijzigReeks: (id: Uuid, dag: IsoDate, reikwijdte: Reikwijdte, invoer: Agendainvoer) =>
      wijzigReeks(deps.storage, maak, id, dag, reikwijdte, invoer),
  };
}

/**
 * Een verschijning uit een reeks wijzigen (`FR-AGE-15`).
 *
 * **"Alleen deze"** maakt de dag los: de reeks krijgt daar een gat en er komt een
 * gewoon item op die dag. **"Alle volgende"** knipt: de oude reeks stopt de dag
 * ervóór en er begint een nieuwe met de wijziging erin.
 *
 * Beide laten het verleden met rust, en dat is de bedoeling — wat geweest is, is
 * geweest, en een gymles van september hoort niet te verschuiven omdat je in maart
 * het tijdstip aanpast.
 */
async function wijzigReeks(
  storage: StorageService,
  maak: (invoer: Agendainvoer) => Promise<Result<CalendarEvent>>,
  id: Uuid,
  dag: IsoDate,
  reikwijdte: Reikwijdte,
  invoer: Agendainvoer,
): Promise<Result<CalendarEvent>> {
  const wortel = await storage.read("calendarEvents", id);
  if (!wortel.ok) return wortel;
  if (!wortel.value?.recurrence) return ongeldig("Deze reeks bestaat niet meer.");

  const regel = wortel.value.recurrence;
  const bijgewerkt =
    reikwijdte === "deze" ? metGat(regel, dag) : afgekaptVoor(regel, dag);

  const oud = await storage.update("calendarEvents", id, { recurrence: bijgewerkt });
  if (!oud.ok) return oud;

  // Bij "alleen deze" wordt het een los item; bij "alle volgende" een nieuwe reeks
  // die verder loopt met dezelfde regel.
  return maak({
    ...invoer,
    recurrence: reikwijdte === "deze" ? null : { ...regel, excludedDates: [] },
  });
}

/* ------------------------------------------------------------------ */
/* Wat er op een dag staat                                            */
/* ------------------------------------------------------------------ */

/**
 * Doorgegeven vanuit `itemdagen.ts`.
 *
 * Ze staan daar en niet hier, omdat `RecurrenceService` ze ook nodig heeft en twee
 * modules die elkaar importeren een kring vormen. Hier blijven ze bereikbaar, want
 * dit is waar de rest van de app ze zoekt.
 */
export { dagenVanItem, perDag, raaktPeriode } from "./itemdagen";

/* ------------------------------------------------------------------ */
/* Welke weergave er open gaat                                        */
/* ------------------------------------------------------------------ */

export type Weergave = "dag" | "week" | "maand" | "jaar";

/** §6.2.3, FR-AGE-08: onder deze breedte bestaat de jaarweergave niet. */
export const JAAR_MINIMUM_PX = 1024;

/** §5.2: onder dit breekpunt is de telefoon aan zet. */
export const TELEFOON_MAXIMUM_PX = 768;

/**
 * De weergave waarmee de agenda opengaat (`FR-AGE-07`, B-31).
 *
 * Tussen 1 juli en 15 september is dat het jaar, want dan zet je je schooljaar
 * klaar en is "wanneer valt de studiedag" de vraag die je stelt. Daarbuiten de
 * week. Op de telefoon altijd de dag: een week van zeven kolommen op 390 px is
 * geen weergave maar een puzzel.
 */
export function standaardWeergave(nu: Date, breedtePx: number): Weergave {
  if (breedtePx < TELEFOON_MAXIMUM_PX) return "dag";

  const maand = nu.getMonth() + 1;
  const dag = nu.getDate();
  const inDeZomer = maand === 7 || maand === 8 || (maand === 9 && dag <= 15);

  return inDeZomer && breedtePx >= JAAR_MINIMUM_PX ? "jaar" : "week";
}

/**
 * Wat het instellingenscherm invult (FR-INS-26, §8.3.8).
 *
 * De regio staat erbij omdat een schooljaar hem draagt: de vakanties horen bij een
 * landsdeel én bij een jaar, en `holidayPeriods` sleutelt op allebei.
 */
export interface Schooljaarinvoer {
  name: string;
  firstSchoolDay: IsoDate;
  lastSchoolDay: IsoDate;
  region: Region;
}

/** Het lopende schooljaar, of `null` zolang er geen is ingesteld (FR-INS-26). */
async function huidigSchooljaar(storage: StorageService): Promise<Result<SchoolYear | null>> {
  const uitkomst = await storage.list("schoolYears");
  if (!uitkomst.ok) return uitkomst;

  const lopend = uitkomst.value.find((jaar) => jaar.isCurrent) ?? uitkomst.value[0] ?? null;
  return { ok: true, value: lopend };
}

/**
 * Stelt het schooljaar in (FR-INS-26, INV-28).
 *
 * Er is er hoogstens één tegelijk lopend, dus een tweede aanroep wijzigt het
 * bestaande in plaats van er een naast te zetten. Dat is ook wat INV-28 afdwingbaar
 * houdt zonder jaarovergang: overlap kan alleen ontstaan als er twee zijn.
 */
async function zetSchooljaar(
  storage: StorageService,
  invoer: Schooljaarinvoer,
): Promise<Result<SchoolYear>> {
  const name = invoer.name.trim();
  if (!name) return ongeldig("Een schooljaar heeft een naam nodig, bijvoorbeeld 2026-2027.");

  if (!isIsoDate(invoer.firstSchoolDay) || !isIsoDate(invoer.lastSchoolDay)) {
    return ongeldig("Deze datum klopt niet. Vul een eerste en een laatste schooldag in.");
  }
  // INV-28, eerste helft.
  if (invoer.lastSchoolDay <= invoer.firstSchoolDay) {
    return ongeldig("De laatste schooldag ligt vóór de eerste. Zet hem later in het jaar.");
  }

  const bestaand = await huidigSchooljaar(storage);
  if (!bestaand.ok) return bestaand;

  const velden = { ...invoer, name, isCurrent: true };
  return bestaand.value
    ? storage.update("schoolYears", bestaand.value.id, velden)
    : storage.create("schoolYears", velden);
}

export type AgendaService = ReturnType<typeof createAgendaService>;
