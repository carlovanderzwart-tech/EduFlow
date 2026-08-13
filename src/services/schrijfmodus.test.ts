/**
 * Toetsen bij werkopdracht D05 — de schrijfmodus.
 *
 * Elke toets draagt het `FR-`nummer dat hij bewijst in zijn naam (DR-40).
 *
 * De fotokant draait **zonder browser**: `PhotoService` krijgt zijn hertekenaar als
 * afhankelijkheid, dus er is hier geen canvas nodig (DR-12). Dat het hertekenen
 * werkelijk de EXIF verliest, is een eigenschap van het canvas zelf en niet van een
 * filter dat wij schreven — wat hier wordt getoetst is dat er geen weg langs de
 * hertekenaar heen loopt.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { leesOpnamedatum, nieuweMaat } from "@/lib/beeld";
import { newId } from "@/lib/uuid";

import {
  createDocumentationService,
  MAX_TEKST,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createPhotoService, LANGE_ZIJDE_PX, type PhotoService } from "./photo/PhotoService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-08-13T10:00:00.000Z";
const VANDAAG = "2026-08-13";

let storage: StorageService;
let documentation: DocumentationService;
let photos: PhotoService;
/** Telt hoe vaak er hertekend is: elke weg naar binnen hoort hier langs te komen. */
let hertekend: number;

/** Een hertekenaar die geen browser nodig heeft en altijd hetzelfde oplevert. */
function nepTekenaar(capturedAt: string | null = null) {
  return vi.fn(async (_bestand: Blob, langeZijde: number) => {
    hertekend += 1;
    return {
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" }),
      width: langeZijde,
      height: Math.round(langeZijde * 0.75),
      capturedAt,
    };
  });
}

function nepFoto(inhoud = "een"): Blob {
  return new Blob([inhoud], { type: "image/jpeg" });
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  const clock = { now: () => new Date(NU) };
  hertekend = 0;

  storage = createStorageService({ db, clock, origin: APPARAAT });
  documentation = createDocumentationService({ storage, clock });
  photos = createPhotoService({ storage, tekenen: nepTekenaar() });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

function fout(uitkomst: { ok: boolean; error?: { message: string } }): string {
  if (uitkomst.ok) throw new Error("hoort te falen");
  return uitkomst.error!.message;
}

const LEEG = { title: "", date: VANDAAG, studentIds: [], text: "" };

describe("het ontstaan — FR-DOC-01", () => {
  it("schrijft niets weg zonder titel, tekst, foto of koppeling (FR-DOC-01)", async () => {
    expect(fout(await documentation.maak(LEEG))).toContain("nog niets om op te slaan");
    expect(waarde(await storage.list("documentations"))).toHaveLength(0);
  });

  it("ontstaat wél zodra er alleen een foto is (FR-DOC-01)", async () => {
    const foto = waarde(await photos.voegToe(nepFoto()));

    const gemaakt = await documentation.maak({ ...LEEG, photoIds: [foto.foto.id] });

    expect(gemaakt.ok).toBe(true);
  });

  it("ontstaat wél zodra er alleen een groep gekoppeld is (FR-DOC-01, FR-DOC-06)", async () => {
    const gemaakt = await documentation.maak({ ...LEEG, groupIds: [newId()] });

    expect(gemaakt.ok).toBe(true);
  });
});

describe("de velden — FR-DOC-05, FR-DOC-06, FR-DOC-08", () => {
  it("bewaart de reeks als verwijzing en niet in de titel (FR-DOC-05)", async () => {
    const reeksId = newId();
    const gemaakt = waarde(
      await documentation.maak({ ...LEEG, title: "De brug", text: "x", seriesId: reeksId }),
    );

    expect(gemaakt.documentatie.seriesId).toBe(reeksId);
    expect(gemaakt.documentatie.title).toBe("De brug");
  });

  it("koppelt meerdere leerlingen én meerdere groepen tegelijk (FR-DOC-06)", async () => {
    const leerlingen = [newId(), newId(), newId()];
    const groepen = [newId(), newId()];

    const gemaakt = waarde(
      await documentation.maak({ ...LEEG, text: "x", studentIds: leerlingen, groupIds: groepen }),
    );

    expect(gemaakt.documentatie.studentIds).toEqual(leerlingen);
    expect(gemaakt.documentatie.groupIds).toEqual(groepen);
  });

  it("bewaart de notitie voor jezelf apart van de tekst (FR-DOC-08)", async () => {
    const gemaakt = waarde(
      await documentation.maak({
        ...LEEG,
        text: "Wat er gebeurde.",
        privateNote: "nog even navragen bij de intern begeleider",
      }),
    );

    expect(gemaakt.documentatie.privateNote).toContain("navragen");
    // De notitie zit niet in de tekst, en gaat dus ook niet mee als de tekst meegaat.
    expect(documentation.tekstVan(gemaakt)).toBe("Wat er gebeurde.");
  });
});

describe("de tekstlengte — FR-DOC-40", () => {
  it("neemt een tekst van precies vijftigduizend tekens aan (FR-DOC-40)", async () => {
    const lang = "a".repeat(MAX_TEKST);

    const gemaakt = waarde(await documentation.maak({ ...LEEG, text: lang }));

    expect(documentation.tekstVan(gemaakt)).toHaveLength(MAX_TEKST);
  });

  it("weigert een tekst boven vijftigduizend (FR-DOC-40)", async () => {
    const uitkomst = await documentation.maak({ ...LEEG, text: "a".repeat(MAX_TEKST + 1) });

    expect(fout(uitkomst)).toContain("te lang");
  });

  it("knipt een lange tekst over meerdere blokken en plakt hem exact terug", async () => {
    // §8.3.6 staat 20.000 per blok toe; FR-DOC-40 laat er 50.000 typen. Beide
    // kloppen alleen als het knippen verliesloos is.
    const lang = Array.from({ length: 45_000 }, (_, i) => String.fromCharCode(97 + (i % 26))).join("");
    const gemaakt = waarde(await documentation.maak({ ...LEEG, text: lang }));

    expect(gemaakt.paginas[0]!.blocks.filter((blok) => blok.kind === "text")).toHaveLength(3);
    expect(documentation.tekstVan(gemaakt)).toBe(lang);
  });
});

describe("foto's — FR-DOC-41, FR-DOC-45, FR-DOC-46, FR-DOC-52", () => {
  it("herteken*t* elke foto die binnenkomt, langs welke weg dan ook (FR-DOC-41, FR-DOC-52)", async () => {
    await photos.voegToe(nepFoto("a"));
    await photos.voegToe(nepFoto("b"));

    // Er is één functie waar alle vier de wegen op uitkomen; hij is twee keer
    // gebruikt, dus er is twee keer hertekend. Een foto die de hertekenaar
    // overslaat, bestaat niet.
    expect(hertekend).toBe(2);
  });

  it("verkleint naar 3300 px op de lange zijde (T-02)", async () => {
    const toegevoegd = waarde(await photos.voegToe(nepFoto()));

    expect(toegevoegd.foto.width).toBe(LANGE_ZIJDE_PX);
  });

  it("bewaart geen tweede kopie van dezelfde foto (FR-INS-31)", async () => {
    const eerste = waarde(await photos.voegToe(nepFoto("zelfde")));
    const tweede = waarde(await photos.voegToe(nepFoto("zelfde")));

    expect(tweede.bestondAl).toBe(true);
    expect(tweede.foto.id).toBe(eerste.foto.id);
    expect(waarde(await storage.list("photos"))).toHaveLength(1);
  });

  it("geeft de opnamedatum terug als suggestie, niet als opgeslagen datum (§8.3.7)", async () => {
    photos = createPhotoService({ storage, tekenen: nepTekenaar("2026-08-01T09:00:00.000Z") });

    const toegevoegd = waarde(await photos.voegToe(nepFoto()));

    expect(toegevoegd.datumsuggestie).toBe("2026-08-01T09:00:00.000Z");
  });

  it("weigert een bestand dat geen foto is", async () => {
    const uitkomst = await photos.voegToe(new Blob(["x"], { type: "application/pdf" }));

    expect(fout(uitkomst)).toContain("geen foto");
  });

  it("weigert meer dan twintig foto's in één documentatie (FR-DOC-45)", async () => {
    const teveel = Array.from({ length: 21 }, () => newId());

    const uitkomst = await documentation.maak({ ...LEEG, text: "x", photoIds: teveel });

    expect(fout(uitkomst)).toContain("hoogstens 20");
  });

  it("houdt de volgorde van de foto's vast (FR-DOC-46)", async () => {
    const a = waarde(await photos.voegToe(nepFoto("a"))).foto.id;
    const b = waarde(await photos.voegToe(nepFoto("b"))).foto.id;
    const c = waarde(await photos.voegToe(nepFoto("c"))).foto.id;

    const gemaakt = waarde(await documentation.maak({ ...LEEG, text: "x", photoIds: [a, b, c] }));
    expect(documentation.fotosVan(gemaakt)).toEqual([a, b, c]);

    // Zoals de pijlknoppen hem verschuiven: de tweede naar voren.
    const bewaard = waarde(
      await documentation.bewaar(gemaakt.documentatie.id, { ...LEEG, text: "x", photoIds: [b, a, c] }),
    );
    expect(documentation.fotosVan(bewaard)).toEqual([b, a, c]);
  });
});

describe("het beeldgereedschap — FR-DOC-52", () => {
  it("laat een kleine foto ongemoeid en verkleint een grote", () => {
    expect(nieuweMaat(800, 600, LANGE_ZIJDE_PX)).toEqual({ width: 800, height: 600 });
    expect(nieuweMaat(6600, 4950, LANGE_ZIJDE_PX)).toEqual({ width: 3300, height: 2475 });
  });

  it("houdt de verhouding aan bij een staande foto", () => {
    expect(nieuweMaat(2000, 4000, 1000)).toEqual({ width: 500, height: 1000 });
  });

  it("leest geen datum uit iets dat geen JPEG is", () => {
    expect(leesOpnamedatum(new Uint8Array([1, 2, 3, 4]).buffer)).toBeNull();
  });
});

describe("terugvinden — FR-DOC-36", () => {
  it("geeft tekst, foto's en koppelingen terug zoals ze erin gingen", async () => {
    const foto = waarde(await photos.voegToe(nepFoto())).foto.id;
    const leerling = newId();
    const reeks = newId();

    const gemaakt = waarde(
      await documentation.maak({
        title: "De brug",
        date: VANDAAG,
        studentIds: [leerling],
        groupIds: [],
        seriesId: reeks,
        text: "Ze bouwden een brug.",
        privateNote: "navragen",
        photoIds: [foto],
      }),
    );

    const opnieuw = waarde(await documentation.open(gemaakt.documentatie.id))!;

    expect(opnieuw.documentatie.title).toBe("De brug");
    expect(opnieuw.documentatie.seriesId).toBe(reeks);
    expect(opnieuw.documentatie.studentIds).toEqual([leerling]);
    expect(opnieuw.documentatie.privateNote).toBe("navragen");
    expect(documentation.tekstVan(opnieuw)).toBe("Ze bouwden een brug.");
    expect(documentation.fotosVan(opnieuw)).toEqual([foto]);
  });
});
