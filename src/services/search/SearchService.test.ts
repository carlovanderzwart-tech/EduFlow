/**
 * Toetsen bij werkopdracht D07 — zoeken en filteren.
 *
 * Elke toets draagt zijn `FR-`nummer in de naam (DR-40). Zonder browser en zonder
 * netwerk: de index leeft in het geheugen en de opslag is een echte IndexedDB uit
 * `fake-indexeddb` (DR-12).
 *
 * De belangrijkste toets van dit bestand is niet de snelste maar de stilste: dat
 * een woord uit de notitie voor jezelf **nul** treffers geeft. Dat is FR-DOC-22, en
 * het is een belofte en geen optimalisatie.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId, type Uuid } from "@/lib/uuid";

import { createDocumentationService, type DocumentationService } from "../documentation/DocumentationService";
import { createSearchService, type SearchService } from "./SearchService";
import { maakDatabase } from "../storage/db";
import { createStorageService, type StorageService } from "../storage/StorageService";
import { createStudentService, type StudentService } from "../students/StudentService";

const APPARAAT = newId();
const NU = "2026-08-13T10:00:00.000Z";
const VANDAAG = "2026-08-13";

let storage: StorageService;
let documentation: DocumentationService;
let students: StudentService;
let search: SearchService;
let klok: { now: () => Date; verzet: (naar: string) => void };

/** Een klok die stilstaat tenzij een toets hem verzet (§10.3). */
function stilstaandeKlok(start: string) {
  let moment = new Date(start);
  return {
    now: () => moment,
    verzet: (naar: string) => {
      moment = new Date(naar);
    },
  };
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  klok = stilstaandeKlok(NU);

  storage = createStorageService({ db, clock: klok, origin: APPARAAT });
  documentation = createDocumentationService({ storage, clock: klok });
  students = createStudentService({ storage });
  search = createSearchService({ storage });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

interface Opzet {
  title?: string;
  text?: string;
  date?: string;
  privateNote?: string;
  studentIds?: Uuid[];
  groupIds?: Uuid[];
  seriesId?: Uuid | null;
}

async function schrijf(opzet: Opzet) {
  return waarde(
    await documentation.maak({
      title: opzet.title ?? "",
      date: opzet.date ?? VANDAAG,
      studentIds: opzet.studentIds ?? [],
      groupIds: opzet.groupIds ?? [],
      seriesId: opzet.seriesId ?? null,
      text: opzet.text ?? "iets",
      privateNote: opzet.privateNote ?? "",
    }),
  );
}

describe("zoeken — FR-DOC-21, FR-DOC-22", () => {
  it("vindt een naam die in de tekst staat (FR-DOC-21)", async () => {
    await schrijf({ text: "Kjeld bouwde een brug van blokken." });
    await schrijf({ text: "Pippa legde het laatste blok." });
    await search.vul();

    const treffers = search.zoek("Kjeld");

    expect(treffers).toHaveLength(1);
    expect(treffers[0]!.fragment).toContain("brug");
  });

  it("vindt een documentatie waar de leerling alleen aan gekoppeld is (FR-DOC-21)", async () => {
    const kjeld = waarde(await students.voegToe({ firstName: "Kjeld" }));
    await schrijf({ text: "Er werd gebouwd aan een brug.", studentIds: [kjeld.id] });
    await search.vul();

    // Zijn naam staat niet in de tekst, alleen in de koppeling.
    expect(search.zoek("Kjeld")).toHaveLength(1);
  });

  it("doorzoekt de titel (FR-DOC-21)", async () => {
    await schrijf({ title: "De brug bij het dok", text: "iets anders" });
    await search.vul();

    expect(search.zoek("brug")).toHaveLength(1);
  });

  it("doorzoekt de reeksnaam (FR-DOC-21)", async () => {
    const reeks = waarde(
      await storage.create("series", { name: "Kunstwerk Dok", colour: "series-1", description: "" }),
    );
    await schrijf({ text: "wat er gebeurde", seriesId: reeks.id });
    await search.vul();

    expect(search.zoek("Kunstwerk")).toHaveLength(1);
  });

  it("doorzoekt de notitie voor jezelf NIET (FR-DOC-22, FR-DOC-08)", async () => {
    await schrijf({
      text: "Ze bouwden aan de brug.",
      privateNote: "nog even overleggen met de intern begeleider over dyslexie",
    });
    await search.vul();

    // Dit is de belofte: wat in de notitie staat, is met zoeken niet te vinden.
    expect(search.zoek("dyslexie")).toHaveLength(0);
    expect(search.zoek("begeleider")).toHaveLength(0);
    // De gewone tekst is wél te vinden, dus het ligt niet aan een lege index.
    expect(search.zoek("brug")).toHaveLength(1);
  });

  it("vindt een verbogen vorm op de stam", async () => {
    await schrijf({ text: "Kjelds idee werkte niet meteen." });
    await search.vul();

    expect(search.zoek("Kjeld")).toHaveLength(1);
  });

  it("versmalt bij twee woorden in plaats van te verbreden", async () => {
    await schrijf({ text: "Kjeld bouwde een brug." });
    await schrijf({ text: "Pippa bouwde een toren." });
    await search.vul();

    expect(search.zoek("bouwde")).toHaveLength(2);
    expect(search.zoek("Kjeld bouwde")).toHaveLength(1);
  });

  it("geeft één fragment per treffer (FR-DOC-23)", async () => {
    await schrijf({ text: `${"a".repeat(300)} brug ${"b".repeat(300)}` });
    await search.vul();

    const fragment = search.zoek("brug")[0]!.fragment;

    expect(fragment).toContain("brug");
    expect(fragment.length).toBeLessThan(200);
  });
});

describe("filters — FR-DOC-25, FR-DOC-26", () => {
  it("geeft de som bij twee waarden binnen één filter (FR-DOC-25)", async () => {
    const een = waarde(await storage.create("series", { name: "Kunstwerk Dok", colour: "series-1", description: "" }));
    const twee = waarde(await storage.create("series", { name: "ONDERZOEK Natuur", colour: "series-2", description: "" }));
    await schrijf({ text: "eerste", seriesId: een.id });
    await schrijf({ text: "tweede", seriesId: twee.id });
    await schrijf({ text: "derde" });
    await search.vul();

    expect(search.zoek("", { seriesIds: [een.id, twee.id] })).toHaveLength(2);
  });

  it("geeft de doorsnede tussen twee filters (FR-DOC-25)", async () => {
    const reeks = waarde(await storage.create("series", { name: "Kunstwerk Dok", colour: "series-1", description: "" }));
    await schrijf({ text: "binnen de periode", seriesId: reeks.id, date: "2026-08-10" });
    await schrijf({ text: "buiten de periode", seriesId: reeks.id, date: "2026-01-05" });
    await search.vul();

    const doorsnede = search.zoek("", { seriesIds: [reeks.id], van: "2026-08-01", tot: "2026-08-31" });

    expect(doorsnede).toHaveLength(1);
    expect(doorsnede[0]!.fragment).toBe("");
  });

  it("filtert op periode met een vrije datumrange (FR-DOC-26)", async () => {
    await schrijf({ text: "juli", date: "2026-07-15" });
    await schrijf({ text: "augustus", date: "2026-08-12" });
    await search.vul();

    expect(search.zoek("", { van: "2026-08-01" })).toHaveLength(1);
    expect(search.zoek("", { tot: "2026-07-31" })).toHaveLength(1);
  });

  it("filtert op leerling en op groep", async () => {
    const kind = newId();
    const groep = newId();
    await schrijf({ text: "met leerling", studentIds: [kind] });
    await schrijf({ text: "met groep", groupIds: [groep] });
    await search.vul();

    expect(search.zoek("", { studentIds: [kind] })).toHaveLength(1);
    expect(search.zoek("", { groupIds: [groep] })).toHaveLength(1);
  });

  it("laat alles door zonder filter (FR-DOC-28)", async () => {
    await schrijf({ text: "een" });
    await schrijf({ text: "twee" });
    await search.vul();

    expect(search.zoek("", {})).toHaveLength(2);
  });
});

describe("volgorde — FR-DOC-11, FR-DOC-12, FR-DOC-13", () => {
  it("sorteert standaard op de inhoudelijke datum, niet op laatst bewerkt (FR-DOC-11)", async () => {
    const oud = await schrijf({ text: "oud", date: "2026-08-01" });
    await schrijf({ text: "nieuw", date: "2026-08-12" });

    // De oudste als laatste bewerken: op `updatedAt` zou hij bovenaan komen.
    klok.verzet("2026-08-13T14:00:00.000Z");
    await documentation.bewaar(oud.documentatie.id, {
      title: "",
      date: "2026-08-01",
      studentIds: [],
      text: "oud, maar net bewerkt",
    });
    await search.vul();

    expect(search.zoek("")[0]!.documentatie.date).toBe("2026-08-12");
  });

  it("zet op laatst bewerkt de zojuist gewijzigde bovenaan (FR-DOC-12)", async () => {
    const oud = await schrijf({ text: "oud", date: "2026-08-01" });
    await schrijf({ text: "nieuw", date: "2026-08-12" });

    klok.verzet("2026-08-13T14:00:00.000Z");
    await documentation.bewaar(oud.documentatie.id, {
      title: "",
      date: "2026-08-01",
      studentIds: [],
      text: "oud, maar net bewerkt",
    });
    await search.vul();

    expect(search.zoek("", {}, "bewerkt")[0]!.documentatie.id).toBe(oud.documentatie.id);
  });

  it("houdt dezelfde volgorde aan bij gelijke datum (FR-DOC-13)", async () => {
    for (const tekst of ["een", "twee", "drie", "vier"]) await schrijf({ text: tekst });
    await search.vul();

    const eerste = search.zoek("").map((t) => t.documentatie.id);
    const tweede = search.zoek("").map((t) => t.documentatie.id);

    expect(tweede).toEqual(eerste);
  });
});

describe("snelheid — NFR-06, §8.5", () => {
  it("zoekt bij duizend documentaties binnen 150 ms", async () => {
    // Via de gewone weg, zodat de documentatie en haar pagina echt aan elkaar
    // hangen — anders staat de tekst niet in de index en meet de toets niets.
    for (let i = 0; i < 1_000; i += 1) {
      await schrijf({
        title: `Documentatie ${i}`,
        date: "2026-08-12",
        text: `Kjeld en Pippa bouwden op dag ${i} een brug van blokken in de bouwhoek.`,
      });
    }

    expect(waarde(await search.vul())).toBe(1_000);

    const begin = performance.now();
    const treffers = search.zoek("Kjeld brug");
    const duur = performance.now() - begin;

    expect(treffers).toHaveLength(1_000);
    expect(duur).toBeLessThan(150);
  }, 120_000);
});
