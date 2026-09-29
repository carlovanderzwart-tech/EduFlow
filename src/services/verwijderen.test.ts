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
import { BEWAARTERMIJN_DAGEN, dagenResterend, prullenbak, verlopen } from "./documentation/prullenbak";
import { createGroupService, type GroupService } from "./groups/GroupService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";
import { createStudentService, type StudentService } from "./students/StudentService";

const APPARAAT = newId();
const NU = "2026-09-29T10:00:00.000Z";

let storage: StorageService;
let documentation: DocumentationService;
let groups: GroupService;
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
  groups = createGroupService({ storage });
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

    expect(uitkomst.documentaties).toBe(0);
    expect(waarde(await documentation.prullenbak())).toHaveLength(1);
  });

  it("wist definitief wat over de termijn heen is (FR-DOC-122)", async () => {
    const gemaakt = await nieuweDocumentatie();
    waarde(await documentation.verwijder(gemaakt.id));

    klok.verzet("2026-11-01T10:00:00.000Z");
    const uitkomst = waarde(await documentation.ruimOp());

    expect(uitkomst.documentaties).toBe(1);
    expect(uitkomst.paginas).toBeGreaterThan(0);
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

    expect(prullenbak(rijen, nu)).toHaveLength(2);
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

    expect(uitkomst.documentaties).toBe(2);
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

  it("laat een documentatie bestaan en haalt alleen de verwijzing weg (FR-INS-46, INV-20)", async () => {
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
    expect(na!.documentatie.groupIds).toEqual([]);
  });
});
