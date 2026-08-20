/**
 * Toetsen op de vier services van de eerste verticale slice.
 *
 * Ze staan bij elkaar omdat ze dezelfde opzet delen: één echte database per toets,
 * een stilstaande klok, en verder niets nagebootst. Dat is §10.10: elke service is
 * te toetsen zonder browser, zonder netwerk en zonder scherm.
 *
 * Elke toets hieronder hoort bij een genummerde regel uit het handboek. Een toets
 * zonder nummer is een toets die niemand kan narekenen.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { createAgendaService, type AgendaService } from "./agenda/AgendaService";
import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createSettingsService, type SettingsService } from "./settings/SettingsService";
import { maakVoorkeuren, type Voorkeurenopslag } from "./settings/voorkeuren";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";
import { createStudentService, type StudentService } from "./students/StudentService";

const APPARAAT = newId();
const NU = "2026-08-11T10:00:00.000Z";
const VANDAAG = "2026-08-11";

/** `localStorage` als gewone Map, want DR-12 verbiedt een browser in een toets. */
function geheugenopslag(): Voorkeurenopslag {
  const kaart = new Map<string, string>();
  return {
    getItem: (sleutel) => kaart.get(sleutel) ?? null,
    setItem: (sleutel, waarde) => void kaart.set(sleutel, waarde),
    removeItem: (sleutel) => void kaart.delete(sleutel),
  };
}

let storage: StorageService;
let settings: SettingsService;
let students: StudentService;
let documentation: DocumentationService;
let agenda: AgendaService;

beforeEach(async () => {
  const db = maakDatabase(`toets-${newId()}`);
  const clock = { now: () => new Date(NU) };

  storage = createStorageService({ db, clock, origin: APPARAAT });
  settings = createSettingsService({ storage, voorkeurenOpslag: geheugenopslag() });
  students = createStudentService({ storage });
  documentation = createDocumentationService({ storage, clock });
  agenda = createAgendaService({ storage });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

function fout(uitkomst: { ok: boolean; error?: { message: string } }): string {
  if (uitkomst.ok) throw new Error("hoort te falen");
  return uitkomst.error!.message;
}

describe("SettingsService — §8.3.14, §8.2.2", () => {
  /** Het ene record komt van `startOpslag`; een toets zet hem zelf klaar (INV-49). */
  async function metInstellingen() {
    await storage.create("settings", {
      deviceId: APPARAAT,
      defaultGroupId: null,
      defaultStudentIds: [],
      attentionThresholdDays: 42,
      showAttention: true,
      pupilNoun: "leerling",
      disabledDetectors: [],
      showOutgoingRequest: true,
    });
  }

  it("leest en wijzigt het ene record", async () => {
    await metInstellingen();

    const na = waarde(await settings.wijzig({ pupilNoun: "kind", attentionThresholdDays: 30 }));

    expect(na.pupilNoun).toBe("kind");
    expect(na.attentionThresholdDays).toBe(30);
    expect(waarde(await settings.lees()).pupilNoun).toBe("kind");
    // Precies één record, ook na een wijziging (INV-49).
    expect(waarde(await storage.list("settings"))).toHaveLength(1);
  });

  it("houdt de zes voorkeuren buiten het record (§8.2.2, U-02)", async () => {
    await metInstellingen();
    settings.zetVoorkeur("region", "noord");

    const record = waarde(await settings.lees()) as unknown as Record<string, unknown>;

    expect(settings.voorkeur("region")).toBe("noord");
    expect(record.region).toBeUndefined();
  });
});

describe("de zes voorkeuren — §8.2.2", () => {
  it("valt terug op de standaard als er onzin staat", async () => {
    const opslag = geheugenopslag();
    opslag.setItem("eduflow.region", "oost");
    opslag.setItem("eduflow.lastView", "{ dit is geen json");

    const voorkeuren = maakVoorkeuren(opslag);

    expect(voorkeuren.lees("region")).toBe("midden");
    expect(voorkeuren.lees("lastView")).toEqual({ module: "dashboard", view: "vandaag" });
  });

  it("bewaart afwezigheid als afwezigheid, niet als de tekst null", () => {
    const opslag = geheugenopslag();
    const voorkeuren = maakVoorkeuren(opslag);

    voorkeuren.schrijf("lastBackupAt", NU);
    expect(voorkeuren.lees("lastBackupAt")).toBe(NU);

    voorkeuren.schrijf("lastBackupAt", null);
    expect(opslag.getItem("eduflow.lastBackupAt")).toBeNull();
    expect(voorkeuren.lees("lastBackupAt")).toBeNull();
  });
});

describe("StudentService — INV-23, INV-29", () => {
  it("weigert een tweede leerling met dezelfde weergavenaam", async () => {
    waarde(await students.voegToe({ firstName: "Noa" }));

    const melding = fout(await students.voegToe({ firstName: "noa" }));

    expect(melding).toMatch(/beginletter/i);
    expect(waarde(await students.lijst())).toHaveLength(1);
  });

  it("laat twee Noa's bestaan zodra ze een beginletter hebben", async () => {
    waarde(await students.voegToe({ firstName: "Noa" }));
    waarde(await students.voegToe({ firstName: "Noa", lastNameInitial: "V." }));

    expect(waarde(await students.lijst())).toHaveLength(2);
  });

  it("botst ook over een diakriet heen", async () => {
    // "Hanaë" en "Hanae" zijn in een lijst niet uit elkaar te houden (§12.5).
    waarde(await students.voegToe({ firstName: "Hanaë" }));

    expect(fout(await students.voegToe({ firstName: "Hanae" }))).toMatch(/beginletter/i);
  });

  it("geeft elke leerling een eigen pseudoniemnummer (§8.3.1)", async () => {
    const eerste = waarde(await students.voegToe({ firstName: "Kjeld" }));
    const tweede = waarde(await students.voegToe({ firstName: "Aya" }));

    expect(eerste.pseudonymSeed).toBe(1);
    expect(tweede.pseudonymSeed).toBe(2);
  });
});

describe("DocumentationService — INV-07, INV-08, INV-16", () => {
  it("schrijft niets als er geen inhoud is (INV-07)", async () => {
    const melding = fout(
      await documentation.maak({ title: "  ", date: VANDAAG, studentIds: [], text: "  " }),
    );

    expect(melding).toMatch(/nog niets/i);
    expect(waarde(await storage.list("documentations"))).toHaveLength(0);
    expect(waarde(await storage.list("pages"))).toHaveLength(0);
  });

  it("maakt altijd een eerste pagina, en die is nooit een vervolgpagina", async () => {
    const gemaakt = waarde(
      await documentation.maak({
        title: "Kunstwerk Dok",
        date: VANDAAG,
        studentIds: [],
        text: "Vandaag geverfd.",
      }),
    );

    // INV-08 en INV-22.
    expect(gemaakt.paginas).toHaveLength(1);
    expect(gemaakt.paginas[0]!.layoutId).toBe("B-verhaal");
    expect(gemaakt.paginas[0]!.order).toBe(1);
    // INV-09: de pagina hoort bij precies deze documentatie, en zij kent de volgorde.
    expect(gemaakt.paginas[0]!.documentationId).toBe(gemaakt.documentatie.id);
    expect(gemaakt.documentatie.pageIds).toEqual([gemaakt.paginas[0]!.id]);
    // INV-15: de status is afgeleid en staat op concept tot de eerste export.
    expect(gemaakt.documentatie.status).toBe("concept");
    expect(gemaakt.documentatie.firstExportedAt).toBeNull();
  });

  it("weigert een datum meer dan zeven dagen vooruit (B-70)", async () => {
    const invoer = { title: "Later", studentIds: [], text: "" };

    expect(waarde(await documentation.maak({ ...invoer, date: "2026-08-18" })).documentatie.date).toBe(
      "2026-08-18",
    );
    expect(fout(await documentation.maak({ ...invoer, date: "2026-08-19" }))).toMatch(/week vooruit/i);
  });

  /**
   * INV-16's ondergrens, zoals B-126 hem heeft bijgesteld.
   *
   * Deze toets eiste eerst dat een documentatie van **vandaag** werd geweigerd zolang
   * het schooljaar nog niet begonnen was. Dat is precies de fout die het lopen van de
   * doorloop opleverde: vanaf een verse installatie in augustus was er geen
   * documentatie te maken. De eis is bijgesteld met een besluit; de toets volgt dat
   * besluit en niet omgekeerd.
   */
  it("laat een datum van vandaag door vóór de eerste schooldag (INV-16, B-126)", async () => {
    await storage.create("schoolYears", {
      name: "2026/2027",
      firstSchoolDay: "2026-08-24",
      lastSchoolDay: "2027-07-16",
      region: "midden",
      isCurrent: true,
    });

    const uitkomst = await documentation.maak({
      title: "In de week vóór de start",
      date: VANDAAG,
      studentIds: [],
      text: "",
    });

    expect(uitkomst.ok).toBe(true);
  });

  it("weigert een datum die echt vóór je opslag ligt (INV-16)", async () => {
    await storage.create("schoolYears", {
      name: "2026/2027",
      firstSchoolDay: "2026-08-24",
      lastSchoolDay: "2027-07-16",
      region: "midden",
      isCurrent: true,
    });

    const melding = fout(
      await documentation.maak({ title: "Te vroeg", date: "2019-05-01", studentIds: [], text: "" }),
    );

    expect(melding).toMatch(/oudste schooljaar/i);
  });

  it("bewaart de tekst en telt de rev van de wortel op", async () => {
    const gemaakt = waarde(
      await documentation.maak({ title: "Dok", date: VANDAAG, studentIds: [], text: "Eerst" }),
    );

    const na = waarde(
      await documentation.bewaar(gemaakt.documentatie.id, {
        title: "Dok",
        date: VANDAAG,
        studentIds: [],
        text: "Daarna",
      }),
    );

    expect(documentation.tekstVan(na)).toBe("Daarna");
    // §9.4 regel A: één ophoging op de wortel per handeling, ook als alleen de
    // pagina inhoudelijk wijzigde.
    expect(na.documentatie.rev).toBe(2);
    expect(na.paginas[0]!.rev).toBe(2);
  });

  it("geeft het hele aggregaat terug bij openen", async () => {
    const gemaakt = waarde(
      await documentation.maak({ title: "Dok", date: VANDAAG, studentIds: [], text: "Tekst" }),
    );

    const geopend = waarde(await documentation.open(gemaakt.documentatie.id));

    expect(geopend!.documentatie.title).toBe("Dok");
    expect(geopend!.paginas).toHaveLength(1);
    expect(documentation.tekstVan(geopend!)).toBe("Tekst");
  });
});

describe("AgendaService — §6.2.2, INV-30, INV-31", () => {
  const afspraak = { title: "Oudergesprek voorbereiden", kind: "afspraak" } as const;

  it("bewaart een item met tijden als tijdstippen", async () => {
    const item = waarde(
      await agenda.maak({
        ...afspraak,
        allDay: false,
        start: "2026-08-11T13:00:00.000Z",
        end: "2026-08-11T13:30:00.000Z",
      }),
    );

    expect(item.allDay).toBe(false);
    expect(item.start).toBe("2026-08-11T13:00:00.000Z");
    expect(item.source).toBe("own");
  });

  it("bewaart een hele-dag-item als kalenderdagen (INV-31)", async () => {
    const item = waarde(
      await agenda.maak({
        title: "Studiedag",
        kind: "studiedag",
        allDay: true,
        start: "2026-10-12",
        end: "2026-10-12",
      }),
    );

    expect(item.allDay).toBe(true);
    expect(item.start).toBe("2026-10-12");
  });

  it("weigert een einde vóór het begin (INV-30)", async () => {
    const melding = fout(
      await agenda.maak({
        ...afspraak,
        allDay: false,
        start: "2026-08-11T14:00:00.000Z",
        end: "2026-08-11T13:00:00.000Z",
      }),
    );

    expect(melding).toMatch(/vóór het begin/i);
  });

  it("slaat geen verjaardag op (FR-AGE-05)", async () => {
    const melding = fout(
      await agenda.maak({
        title: "Noa",
        kind: "verjaardag",
        allDay: true,
        start: "2026-09-01",
        end: "2026-09-01",
      }),
    );

    expect(melding).toMatch(/leerlingenlijst/i);
    expect(waarde(await storage.list("calendarEvents"))).toHaveLength(0);
  });

  it("slaat geen vakantie op (§6.2.2, kolom Bron)", async () => {
    const melding = fout(
      await agenda.maak({
        title: "Herfstvakantie",
        kind: "vakantie",
        allDay: true,
        start: "2026-10-17",
        end: "2026-10-25",
      }),
    );

    expect(melding).toMatch(/vakantiebestand/i);
  });

  it("eist precies één leerling bij een oudergesprek (FR-AGE-04)", async () => {
    const gesprek = {
      title: "Gesprek",
      kind: "oudergesprek",
      allDay: false,
      start: "2026-08-11T13:00:00.000Z",
      end: "2026-08-11T13:30:00.000Z",
    } as const;

    expect(fout(await agenda.maak(gesprek))).toMatch(/één leerling/i);
    expect(fout(await agenda.maak({ ...gesprek, studentIds: [newId(), newId()] }))).toMatch(
      /één leerling/i,
    );
    expect(waarde(await agenda.maak({ ...gesprek, studentIds: [newId()] })).kind).toBe(
      "oudergesprek",
    );
  });

  it("zet het eerstvolgende item bovenaan", async () => {
    const later = { ...afspraak, allDay: false } as const;
    await agenda.maak({ ...later, start: "2026-09-01T09:00:00.000Z", end: "2026-09-01T09:30:00.000Z" });
    await agenda.maak({ ...later, start: "2026-08-12T09:00:00.000Z", end: "2026-08-12T09:30:00.000Z" });

    const lijst = waarde(await agenda.lijst());

    expect(lijst.map((item) => item.start.slice(0, 10))).toEqual(["2026-08-12", "2026-09-01"]);
  });

  it("houdt een verwijderd item uit de lijst (FR-AGE-16)", async () => {
    const item = waarde(
      await agenda.maak({
        ...afspraak,
        allDay: false,
        start: "2026-08-11T13:00:00.000Z",
        end: "2026-08-11T13:30:00.000Z",
      }),
    );

    await agenda.verwijder(item.id);

    expect(waarde(await agenda.lijst())).toHaveLength(0);
    expect(waarde(await storage.listDeleted("calendarEvents"))).toHaveLength(1);
  });
});
