/**
 * Toetsen bij `FR-DOC-120` — archiveren (B-144).
 *
 * De eis staat sinds het handboek in §6.1.13 en was niet gebouwd. Hij bestaat uit
 * vier zinnen, en elke zin heeft hier een toets:
 *
 * 1. in het overzicht staat hij er niet bij,
 * 2. tenzij je het filter "Toon gearchiveerde" aanzet,
 * 3. hij telt niet mee in het dashboard,
 * 4. en hij is wél te vinden met zoeken, met een aanduiding.
 *
 * De belangrijkste toets is de vierde. Dat archiveren iets verbergt is makkelijk;
 * dat het daarna nog te vinden is, is de hele belofte. Wie iets archiveert zegt
 * "dit is af", niet "dit mag ik nooit meer terugzien" — dat laatste is de
 * prullenbak, en die is een andere knop.
 *
 * Zonder browser en zonder netwerk: de opslag is een echte IndexedDB uit
 * `fake-indexeddb` en de klok staat stil (DR-12).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId, type Uuid } from "@/lib/uuid";

import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { isGearchiveerd } from "./documentation/archiveren";
import { createSearchService, type SearchService } from "./search/SearchService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-10-04T10:00:00.000Z";
const VANDAAG = "2026-10-04";

let storage: StorageService;
let documentation: DocumentationService;
let search: SearchService;
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
  search = createSearchService({ storage });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

async function schrijf(title: string, text = "er werd gebouwd aan een brug") {
  return waarde(
    await documentation.maak({
      title,
      date: VANDAAG,
      studentIds: [],
      groupIds: [],
      seriesId: null,
      text,
      privateNote: "",
    }),
  ).documentatie;
}

describe("archiveren is geen status — B-13, B-144", () => {
  it("zet `archivedAt` en laat de status met rust (`FR-DOC-120`)", async () => {
    const doc = await schrijf("De brug bij het dok");
    expect(doc.status).toBe("concept");

    const na = waarde(await documentation.archiveer(doc.id));

    expect(na.archivedAt).toBe(NU);
    // B-13: de statussen heten concept en gedeeld, en meer zijn het er niet.
    expect(na.status).toBe("concept");
  });

  it("laat een gedeelde documentatie gedeeld (`FR-DOC-120`, B-13)", async () => {
    const doc = await schrijf("Al gedeeld");
    await storage.update("documentations", doc.id, { status: "gedeeld" });

    const na = waarde(await documentation.archiveer(doc.id));

    expect(na.status).toBe("gedeeld");
    expect(isGearchiveerd(na)).toBe(true);
  });

  it("houdt bij een tweede keer de eerste datum (`FR-DOC-120`)", async () => {
    const doc = await schrijf("Twee keer");
    await documentation.archiveer(doc.id);

    klok.verzet("2026-11-20T09:00:00.000Z");
    const na = waarde(await documentation.archiveer(doc.id));

    // De datum zegt wanneer je het werk hebt afgesloten. Nog een keer drukken
    // verandert daar niets aan.
    expect(na.archivedAt).toBe(NU);
  });

  it("haalt hem er weer uit (`FR-DOC-120`)", async () => {
    const doc = await schrijf("Terug");
    await documentation.archiveer(doc.id);

    const na = waarde(await documentation.haalUitArchief(doc.id));

    expect(na.archivedAt).toBeNull();
    expect(isGearchiveerd(na)).toBe(false);
  });

  it("meldt netjes dat een verdwenen documentatie niet te archiveren is", async () => {
    const uitkomst = await documentation.archiveer(newId() as Uuid);

    expect(uitkomst.ok).toBe(false);
  });
});

describe("bladeren verbergt, zoeken vindt — `FR-DOC-120`", () => {
  beforeEach(async () => {
    const weg = await schrijf("Kunstwerk Dok", "Pippa metselde aan de kade.");
    await schrijf("Bouwhoek", "Kjeld stapelde blokken.");
    await documentation.archiveer(weg.id);
    await search.vul();
  });

  it("laat het gearchiveerde weg uit het overzicht (`FR-DOC-120`)", () => {
    const treffers = search.zoek("");

    expect(treffers).toHaveLength(1);
    expect(treffers[0]!.documentatie.title).toBe("Bouwhoek");
  });

  it("toont het weer met het filter aan (`FR-DOC-120`)", () => {
    const treffers = search.zoek("", { toonGearchiveerd: true });

    expect(treffers).toHaveLength(2);
  });

  it("vindt het gearchiveerde met een zoekterm, ook zonder filter (`FR-DOC-120`)", () => {
    // Dit is de belofte. Archiveren betekent "dit is af", niet "dit is weg".
    const treffers = search.zoek("metselde");

    expect(treffers).toHaveLength(1);
    expect(treffers[0]!.documentatie.title).toBe("Kunstwerk Dok");
  });

  it("draagt de aanduiding die de eis vraagt (`FR-DOC-120`)", () => {
    const [treffer] = search.zoek("metselde");

    expect(treffer!.gearchiveerd).toBe(true);
    expect(search.zoek("blokken")[0]!.gearchiveerd).toBe(false);
  });

  it("laat de andere filters hun werk doen op wat overblijft (FR-DOC-25)", () => {
    const treffers = search.zoek("", { toonGearchiveerd: true, status: ["concept"] });

    expect(treffers).toHaveLength(2);
  });

  it("komt terug in het overzicht zodra hij uit het archief is (`FR-DOC-120`)", async () => {
    const weg = search.zoek("metselde")[0]!.documentatie;
    await documentation.haalUitArchief(weg.id);
    await search.vul();

    expect(search.zoek("")).toHaveLength(2);
  });
});
