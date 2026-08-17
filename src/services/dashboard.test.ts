/**
 * Toetsen bij werkopdracht D11 — het dashboard.
 *
 * Elke toets draagt het `FR-`nummer dat hij bewijst in zijn naam (DR-40). Het
 * dashboard heeft geen eigen service (§6.4.1), dus wat hier getoetst wordt is de
 * berekening achter het blok Aandacht plus de regel die eronder hoort.
 *
 * De belangrijkste toets is die van `FR-DAS-06`. Het blok mag geen signaal over een
 * kind worden, en de regel eronder is de enige plek waar dat staat. Verdwijnt die
 * regel, dan verandert de betekenis van het hele blok zonder dat er één berekening
 * anders wordt — en dat is precies het soort verschuiving dat §1.4.2 verbiedt.
 */

import { describe, expect, it } from "vitest";

import { newId, type Uuid } from "@/lib/uuid";
import type { Documentation, Student } from "@/domain/types";

import type { Vakantie } from "./agenda/HolidayService";
import { createDocumentationService } from "./documentation/DocumentationService";
import { maakDatabase } from "./storage/db";
import { createStorageService } from "./storage/StorageService";
import {
  AANDACHT_REGEL,
  aandacht,
  DREMPEL_MAX,
  DREMPEL_MIN,
  DREMPEL_STANDAARD,
  MAX_AANDACHT,
  schooldagenTussen,
} from "./documentation/aandacht";

const VANDAAG = "2026-11-30";

/** Een verzonnen leerling; de namen komen uit bijlage A (§15.6). */
function leerling(voornaam: string): Student {
  return {
    id: newId(),
    createdAt: "2026-08-24T10:00:00.000Z",
    updatedAt: "2026-08-24T10:00:00.000Z",
    deletedAt: null,
    rev: 1,
    origin: newId(),
    schemaVersion: 1,
    firstName: voornaam,
    firstNameLower: voornaam.toLowerCase(),
    lastNameInitial: "",
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    note: "",
    pseudonymSeed: 1,
  };
}

function documentatie(date: string, studentIds: Uuid[]): Documentation {
  return {
    id: newId(),
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
    deletedAt: null,
    rev: 1,
    origin: newId(),
    schemaVersion: 1,
    title: "Iets",
    date,
    seriesId: null,
    studentIds,
    groupIds: [],
    pageIds: [],
    privateNote: "",
    status: "concept",
    firstExportedAt: null,
    archivedAt: null,
    imageConsentAt: null,
  };
}

const HERFST: Vakantie = {
  schoolYearName: "2026-2027",
  region: "midden",
  holidayKey: "herfst",
  name: "Herfstvakantie",
  from: "2026-10-17",
  to: "2026-10-25",
  fixed: false,
  aangepast: false,
  landelijk: null,
};

describe("schooldagen tellen — §6.4.4", () => {
  it("laat het weekend buiten de telling", () => {
    // Maandag 23 t/m maandag 30 november: vijf schooldagen plus de maandag.
    expect(schooldagenTussen("2026-11-23", "2026-11-30", [])).toBe(5);
  });

  it("laat vakantiedagen buiten de telling", () => {
    // 12 t/m 26 oktober met de herfstvakantie van 17 t/m 25 ertussen.
    const zonder = schooldagenTussen("2026-10-12", "2026-10-26", []);
    const met = schooldagenTussen("2026-10-12", "2026-10-26", [HERFST]);

    expect(zonder).toBeGreaterThan(met);
    // 12 oktober is een maandag en telt zelf niet mee: dinsdag t/m vrijdag zijn vier
    // schooldagen, de herfstvakantie valt eruit, en de maandag erna is de vijfde.
    expect(met).toBe(5);
  });

  it("telt nul op de dag zelf", () => {
    expect(schooldagenTussen("2026-11-30", "2026-11-30", [])).toBe(0);
  });

  it("telt nul als de laatste koppeling in de toekomst ligt", () => {
    expect(schooldagenTussen("2026-12-15", "2026-11-30", [])).toBe(0);
  });
});

describe("het blok Aandacht — §6.4.4, FR-DAS-06", () => {
  function opzet(deel: Partial<Parameters<typeof aandacht>[0]> = {}) {
    return aandacht({
      leerlingen: [],
      documentaties: [],
      vakanties: [],
      drempel: DREMPEL_STANDAARD,
      vandaag: VANDAAG,
      ...deel,
    });
  }

  it("laat een leerling die recent voorkwam eruit", () => {
    const kjeld = leerling("Kjeld");

    expect(
      opzet({ leerlingen: [kjeld], documentaties: [documentatie("2026-11-27", [kjeld.id])] }),
    ).toEqual([]);
  });

  it("neemt een leerling boven de drempel mee", () => {
    const kjeld = leerling("Kjeld");
    const uit = opzet({
      leerlingen: [kjeld],
      documentaties: [documentatie("2026-09-01", [kjeld.id])],
    });

    expect(uit).toHaveLength(1);
    expect(uit[0]!.schooldagen).toBeGreaterThan(DREMPEL_STANDAARD);
  });

  it("zet wie nooit voorkwam bovenaan", () => {
    const kjeld = leerling("Kjeld");
    const pippa = leerling("Pippa");
    const uit = opzet({
      leerlingen: [kjeld, pippa],
      documentaties: [documentatie("2026-09-01", [kjeld.id])],
    });

    expect(uit[0]!.student.firstName).toBe("Pippa");
    expect(uit[0]!.schooldagen).toBeNull();
  });

  it("sorteert aflopend op het aantal schooldagen", () => {
    const kjeld = leerling("Kjeld");
    const pippa = leerling("Pippa");
    const uit = opzet({
      leerlingen: [kjeld, pippa],
      documentaties: [
        documentatie("2026-09-01", [kjeld.id]),
        documentatie("2026-10-01", [pippa.id]),
      ],
    });

    expect(uit.map((rij) => rij.student.firstName)).toEqual(["Kjeld", "Pippa"]);
  });

  it("houdt het bij vijf regels (§6.4.2)", () => {
    const acht = ["Aya", "Bram", "Cato", "Dani", "Elin", "Fenna", "Guus", "Hanaë"].map(leerling);

    expect(opzet({ leerlingen: acht })).toHaveLength(MAX_AANDACHT);
    expect(MAX_AANDACHT).toBe(5);
  });

  it("rekent met de laatste koppeling en niet met de eerste", () => {
    const kjeld = leerling("Kjeld");
    const uit = opzet({
      leerlingen: [kjeld],
      documentaties: [
        documentatie("2026-09-01", [kjeld.id]),
        documentatie("2026-11-27", [kjeld.id]),
      ],
    });

    expect(uit).toEqual([]);
  });

  it("laat een vakantie de telling niet opblazen", () => {
    const kjeld = leerling("Kjeld");
    const laatste = documentatie("2026-10-16", [kjeld.id]);

    const zonder = opzet({ leerlingen: [kjeld], documentaties: [laatste] });
    const met = opzet({ leerlingen: [kjeld], documentaties: [laatste], vakanties: [HERFST] });

    // Zonder de vakantie eruit zou de zomer of de herfst elk kind in het blok zetten.
    expect(met[0]?.schooldagen ?? 0).toBeLessThan(zonder[0]?.schooldagen ?? 0);
  });

  it("draagt de verplichte regel woordelijk (FR-DAS-06)", () => {
    expect(AANDACHT_REGEL).toBe("Dit gaat over jouw documentatie, niet over dit kind.");
  });

  it("houdt de drempel binnen het bereik van §6.4.4", () => {
    expect(DREMPEL_STANDAARD).toBe(21);
    expect(DREMPEL_MIN).toBe(10);
    expect(DREMPEL_MAX).toBe(60);
    expect(DREMPEL_STANDAARD).toBeGreaterThanOrEqual(DREMPEL_MIN);
    expect(DREMPEL_STANDAARD).toBeLessThanOrEqual(DREMPEL_MAX);
  });
});

/* ------------------------------------------------------------------ */
/* D11 — de doorloop mag niet stilstaan (B-126)                       */
/* ------------------------------------------------------------------ */

describe("de ondergrens van INV-16 weigert vandaag nooit — B-126", () => {
  const NU = "2026-08-17T10:00:00.000Z";
  const VANDAAG_ISO = "2026-08-17";

  async function metSchooljaar(eersteSchooldag: string) {
    const db = maakDatabase(`toets-${newId()}`);
    const clock = { now: () => new Date(NU) };
    const storage = createStorageService({ db, clock, origin: newId() });
    const documentation = createDocumentationService({ storage, clock });

    await storage.create("schoolYears", {
      name: "2026-2027",
      firstSchoolDay: eersteSchooldag,
      lastSchoolDay: "2027-07-16",
      region: "midden",
      isCurrent: true,
    });

    return documentation;
  }

  it("laat een documentatie van vandaag door terwijl het schooljaar nog niet begonnen is", async () => {
    // Dit stond de doorloop in de weg: 17 augustus, schooljaar vanaf 24 augustus.
    const documentation = await metSchooljaar("2026-08-24");

    const uitkomst = await documentation.maak({
      title: "Bouwen met karton",
      date: VANDAAG_ISO,
      studentIds: [],
      text: "De kinderen ontdekten een nieuw materiaal.",
    });

    expect(uitkomst.ok).toBe(true);
  });

  it("weigert nog steeds een datum die echt vóór je opslag ligt", async () => {
    const documentation = await metSchooljaar("2026-08-24");

    const uitkomst = await documentation.maak({
      title: "Van lang geleden",
      date: "2019-05-01",
      studentIds: [],
      text: "iets",
    });

    expect(uitkomst.ok).toBe(false);
  });

  it("houdt de bovengrens van B-70 ongemoeid", async () => {
    const documentation = await metSchooljaar("2026-08-24");

    const uitkomst = await documentation.maak({
      title: "Te ver vooruit",
      date: "2026-09-30",
      studentIds: [],
      text: "iets",
    });

    expect(uitkomst.ok).toBe(false);
  });

  it("laat een datum ná de eerste schooldag gewoon door", async () => {
    const documentation = await metSchooljaar("2026-08-10");

    const uitkomst = await documentation.maak({
      title: "Vorige week",
      date: "2026-08-12",
      studentIds: [],
      text: "iets",
    });

    expect(uitkomst.ok).toBe(true);
  });
});
