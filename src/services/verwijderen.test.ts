/**
 * Toetsen bij de tweede feedbackronde — verwijderen (B-135, B-136).
 *
 * `FR-DOC-121` t/m `FR-DOC-123` stonden sinds het handboek in §6.1.13 en waren niet
 * gebouwd; `FR-INS-46` is nieuw. De keten draait **zonder browser**: de opslag is
 * een echte IndexedDB uit `fake-indexeddb` en de klok staat stil (DR-12).
 *
 * De toets die het meest waard is, is die van de aggregaatgrens. Een documentatie
 * en haar pagina's horen samen weg te gaan en samen terug te komen; gebeurt dat
 * half, dan staat er een documentatie in de prullenbak waarvan de pagina's nog
 * leven — of erger, een levende documentatie zonder tekst.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId, type Uuid } from "@/lib/uuid";

import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import {
  BEWAARTERMIJN_DAGEN,
  dagenResterend,
  sorteerPrullenbak,
  verlopen,
} from "./prullenbak";
import { createGroupService, type GroupService } from "./groups/GroupService";
import { createSeriesService, type SeriesService } from "./series/SeriesService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";
import { createStudentService, type StudentService } from "./students/StudentService";

const APPARAAT = newId();
const NU = "2026-09-29T10:00:00.000Z";

let storage: StorageService;
let documentation: DocumentationService;
let groups: GroupService;
let series: SeriesService;
let students: StudentService;
let klok: { now: () => Date; verzet: (naar: string) => void };

function stilstaandeKlok(start: string) {
  let moment = new Date(start);
  return { now: () => moment, verzet: (naar: string) => void (moment = new Date(naar)) };
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  klok = stilstaandeKlok(NU);
  storage = createStorageService({ db, clock: klok, origin: APPARAAT });
  documentation = createDocumentationService({ storage, clock: klok });
  groups = createGroupService({ storage, clock: klok });
  series = createSeriesService({ storage, clock: klok });
  students = createStudentService({ storage });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

async function nieuweDocumentatie(titel = "De winkelhoek") {
  return waarde(
    await documentation.maak({
      title: titel,
      date: "2026-09-28",
      studentIds: [],
      text: "Twee kinderen maakten prijskaartjes bij het zoutdeeg.",
    }),
  ).documentatie;
}

describe("verwijderen is markeren — FR-DOC-121, B-135", () => {
  it("haalt de documentatie uit het overzicht (FR-DOC-121)", async () => {
    const gemaakt = await nieuweDocumentatie();

    waarde(await documentation.verwijder(gemaakt.id));

    expect(waarde(await documentation.lijst())).toHaveLength(0);
  });

  it("zet hem in de prullenbak met de resterende dagen (FR-DOC-121)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));

    const bak = waarde(await documentation.prullenbak());

    expect(bak).toHaveLength(1);
    expect(bak[0]!.record.id).toBe(gemaakt.id);
    expect(bak[0]!.dagenResterend).toBe(BEWAARTERMIJN_DAGEN);
  });

  it("neemt de pagina's mee, zodat er geen losse pagina's achterblijven (§9.4)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));

    const levend = waarde(await storage.list("pages"));
    const weg = waarde(await storage.listDeleted("pages"));

    expect(levend.filter((pagina) => pagina.documentationId === gemaakt.id)).toHaveLength(0);
    expect(weg.filter((pagina) => pagina.documentationId === gemaakt.id).length).toBeGreaterThan(0);
  });

  it("zet hem terug met tekst en al (FR-DOC-121)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));
    waarde(await documentation.herstel(gemaakt.id));

    const geopend = waarde(await documentation.open(gemaakt.id));

    expect(geopend).not.toBeNull();
    expect(documentation.tekstVan(geopend!)).toContain("prijskaartjes");
    expect(waarde(await documentation.prullenbak())).toHaveLength(0);
  });

  it("meldt een documentatie die er niet is in plaats van er een te maken", async () => {
    expect((await documentation.verwijder(newId())).ok).toBe(false);
  });
});

describe("de prullenbak loopt na dertig dagen leeg — FR-DOC-122, §8.8", () => {
  it("telt af per dag (FR-DOC-121)", () => {
    const nu = new Date(NU);
    expect(dagenResterend("2026-09-29T10:00:00.000Z", nu)).toBe(30);
    expect(dagenResterend("2026-09-19T10:00:00.000Z", nu)).toBe(20);
    expect(dagenResterend("2026-08-01T10:00:00.000Z", nu)).toBe(0);
  });

  it("laat staan wat nog binnen de termijn valt (FR-DOC-122)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));

    klok.verzet("2026-10-28T10:00:00.000Z");
    const uitkomst = waarde(await documentation.ruimOp());

    expect(uitkomst.records).toBe(0);
    expect(waarde(await documentation.prullenbak())).toHaveLength(1);
  });

  it("wist definitief wat over de termijn heen is (FR-DOC-122)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));

    klok.verzet("2026-11-01T10:00:00.000Z");
    const uitkomst = waarde(await documentation.ruimOp());

    expect(uitkomst.records).toBe(1);
    expect(uitkomst.kinderen).toBeGreaterThan(0);
    // Niet alleen uit de prullenbak: het record bestaat niet meer.
    expect(waarde(await storage.listDeleted("documentations"))).toHaveLength(0);
    expect(waarde(await storage.read("documentations", gemaakt.id))).toBeNull();
  });

  it("laat wat niet verwijderd is met rust (§8.8)", async () => {
    const blijft = await nieuweDocumentatie("Blijft staan");

    klok.verzet("2027-01-01T10:00:00.000Z");
    waarde(await documentation.ruimOp());

    expect(waarde(await documentation.lijst()).map((doc) => doc.id)).toEqual([blijft.id]);
  });

  it("rekent de termijn uit zonder opslag (DR-12)", () => {
    const nu = new Date(NU);
    const rijen = [
      { deletedAt: "2026-09-29T10:00:00.000Z" as const },
      { deletedAt: "2026-08-01T10:00:00.000Z" as const },
      { deletedAt: null },
    ];

    expect(sorteerPrullenbak(rijen, nu)).toHaveLength(2);
    expect(verlopen(rijen, nu)).toHaveLength(1);
  });
});

describe("de prullenbak in één handeling legen — FR-DOC-123", () => {
  it("wist alles en meldt hoeveel (FR-DOC-123)", async () => {
    const een = await nieuweDocumentatie("Een");
    const twee = await nieuweDocumentatie("Twee");
    waarde(await documentation.verwijder(een.id));
    waarde(await documentation.verwijder(twee.id));

    const uitkomst = waarde(await documentation.leegPrullenbak());

    expect(uitkomst.records).toBe(2);
    expect(waarde(await documentation.prullenbak())).toHaveLength(0);
  });

  it("raakt niet wat nog in het overzicht staat (FR-DOC-123)", async () => {
    const weg = await nieuweDocumentatie("Weg");
    const blijft = await nieuweDocumentatie("Blijft");
    waarde(await documentation.verwijder(weg.id));

    waarde(await documentation.leegPrullenbak());

    expect(waarde(await documentation.lijst()).map((doc) => doc.id)).toEqual([blijft.id]);
  });
});

describe("een groep verwijderen — FR-INS-46, B-136", () => {
  async function opzet() {
    const jaar = waarde(
      await storage.create("schoolYears", {
        name: "2026-2027",
        firstSchoolDay: "2026-08-24",
        lastSchoolDay: "2027-07-16",
        region: "midden",
        isCurrent: true,
      }),
    );

    const groep = waarde(
      await groups.maak({
        name: "Techniekclub",
        kind: "projectgroep",
        colour: "series-1",
        schoolYearId: jaar.id,
      }),
    );

    const leerling = waarde(await students.voegToe({ firstName: "Kjeld" }));
    waarde(
      await groups.voegLidToe({ groupId: groep.id, studentId: leerling.id, from: "2026-08-24" }),
    );

    return { groep, leerling };
  }

  it("zegt vooraf hoeveel leerlingen erin zitten (FR-INS-46)", async () => {
    const { groep } = await opzet();

    expect(waarde(await groups.aantalLidmaatschappen(groep.id))).toBe(1);
  });

  it("haalt de groep uit de lijst (FR-INS-46)", async () => {
    const { groep } = await opzet();

    expect(waarde(await groups.verwijder(groep.id))).toBe(1);
    expect(waarde(await groups.lijst())).toHaveLength(0);
  });

  it("laat de leerling bestaan en haalt alleen zijn lidmaatschap weg (FR-INS-46, B-35)", async () => {
    const { groep, leerling } = await opzet();

    waarde(await groups.verwijder(groep.id));

    expect(waarde(await students.lijst()).map((rij) => rij.id)).toEqual([leerling.id]);
    expect(waarde(await groups.zitIn(leerling.id))).toHaveLength(0);
  });

  it("laat een documentatie bestaan en toont de groep niet meer (FR-INS-46, INV-20)", async () => {
    const { groep } = await opzet();

    const doc = waarde(
      await documentation.maak({
        title: "Techniek op dinsdag",
        date: "2026-09-28",
        studentIds: [],
        groupIds: [groep.id as Uuid],
        text: "De klok liep.",
      }),
    ).documentatie;

    waarde(await groups.verwijder(groep.id));

    const na = waarde(await documentation.open(doc.id));
    expect(na).not.toBeNull();
    expect(na!.documentatie.title).toBe("Techniek op dinsdag");
    // De groep bestaat voor de gebruiker niet meer: geen lijst kent hem nog.
    expect(waarde(await groups.lijst())).toHaveLength(0);
  });

  it("brengt de groep én de lidmaatschappen terug (FR-INS-47, B-138)", async () => {
    const { groep, leerling } = await opzet();

    waarde(await groups.verwijder(groep.id));

    const bak = waarde(await groups.prullenbak());
    expect(bak).toHaveLength(1);
    expect(bak[0]!.record.name).toBe("Techniekclub");
    expect(bak[0]!.dagenResterend).toBe(BEWAARTERMIJN_DAGEN);

    waarde(await groups.herstel(groep.id));

    expect(waarde(await groups.lijst()).map((rij) => rij.id)).toEqual([groep.id]);
    // Het lidmaatschap ging mee naar de prullenbak en komt dus mee terug.
    expect(waarde(await groups.zitIn(leerling.id))).toHaveLength(1);
  });

  it("houdt de verwijzing in de documentatie vast, zodat terugzetten heel is (B-138)", async () => {
    const { groep } = await opzet();

    const doc = waarde(
      await documentation.maak({
        title: "Techniek op dinsdag",
        date: "2026-09-28",
        studentIds: [],
        groupIds: [groep.id as Uuid],
        text: "De klok liep.",
      }),
    ).documentatie;

    waarde(await groups.verwijder(groep.id));
    waarde(await groups.herstel(groep.id));

    const na = waarde(await documentation.open(doc.id));
    expect(na!.documentatie.groupIds).toEqual([groep.id]);
  });

  it("wist de groep en zijn lidmaatschappen na dertig dagen (FR-INS-47, §8.8)", async () => {
    const { groep, leerling } = await opzet();
    waarde(await groups.verwijder(groep.id));

    klok.verzet("2026-11-01T10:00:00.000Z");
    const uitkomst = waarde(await groups.ruimOp());

    expect(uitkomst.records).toBe(1);
    expect(uitkomst.kinderen).toBe(1);
    expect(waarde(await storage.read("groups", groep.id))).toBeNull();
    // De leerling zelf blijft, ook na het definitief wissen.
    expect(waarde(await students.lijst()).map((rij) => rij.id)).toEqual([leerling.id]);
  });
});

describe("een reeks in de prullenbak — FR-INS-47, B-138", () => {
  async function nieuweReeks() {
    return waarde(await series.maak({ name: "Kunstwerk Dok", colour: "series-3" }));
  }

  it("staat na het verwijderen in de prullenbak (FR-INS-47)", async () => {
    const reeks = await nieuweReeks();
    waarde(await series.verwijder(reeks.id));

    const bak = waarde(await series.prullenbak());
    expect(bak).toHaveLength(1);
    expect(bak[0]!.dagenResterend).toBe(BEWAARTERMIJN_DAGEN);
    expect(waarde(await series.lijst())).toHaveLength(0);
  });

  it("komt terug zoals hij was (FR-INS-47)", async () => {
    const reeks = await nieuweReeks();
    waarde(await series.verwijder(reeks.id));
    waarde(await series.herstel(reeks.id));

    expect(waarde(await series.lijst()).map((rij) => rij.name)).toEqual(["Kunstwerk Dok"]);
  });

  it("wordt na dertig dagen definitief gewist (FR-INS-47, §8.8)", async () => {
    const reeks = await nieuweReeks();
    waarde(await series.verwijder(reeks.id));

    klok.verzet("2026-11-01T10:00:00.000Z");
    expect(waarde(await series.ruimOp()).records).toBe(1);
    expect(waarde(await storage.read("series", reeks.id))).toBeNull();
  });

  it("laat de documentatie bestaan als de reeks definitief verdwijnt (INV-20)", async () => {
    const reeks = await nieuweReeks();
    const doc = waarde(
      await documentation.maak({
        title: "Deel 1",
        date: "2026-09-28",
        studentIds: [],
        seriesId: reeks.id,
        text: "De eerste laag.",
      }),
    ).documentatie;

    waarde(await series.verwijder(reeks.id));
    klok.verzet("2026-11-01T10:00:00.000Z");
    waarde(await series.ruimOp());

    const na = waarde(await documentation.open(doc.id));
    expect(na).not.toBeNull();
    expect(na!.documentatie.title).toBe("Deel 1");
  });
});
