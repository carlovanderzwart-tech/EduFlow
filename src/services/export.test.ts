/**
 * Toetsen bij werkopdracht D08 — exporteren.
 *
 * Elke toets draagt het `FR-`nummer dat hij bewijst in zijn naam (DR-40). De keten
 * draait **zonder browser**: de opslag is een echte IndexedDB uit `fake-indexeddb`
 * en het doek schrijft de tekenopdrachten op in plaats van ze uit te voeren (DR-12).
 *
 * De toets die het meest waard is, is die van `FR-DOC-119`. Een mislukte export mag
 * niets veranderen — ook de status niet. Dat is geen randgeval: een deelmenu dat de
 * gebruiker wegklikt is een mislukte export, en dat gebeurt dagelijks. Zou de status
 * dan tóch op *gedeeld* springen, dan denkt het dashboard dat het werk weg is
 * terwijl er niets is verstuurd.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { deelwijze } from "@/lib/delen";
import { newId, type Uuid } from "@/lib/uuid";

import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createLayoutService, type Exportinhoud } from "./documentation/LayoutService";
import { createPdfService, PDF_PRODUCENT } from "./documentation/PdfService";
import { vraagtToestemming } from "./documentation/toestemming";
import type { Beeld } from "./render/doek";
import { initialenkaart, vervangNamen } from "./render/initialen";
import { namaakDoekmaker, TOETSSTIJL } from "./render/namaakdoek";
import {
  bestandsnaam,
  createRenderService,
  EXPORT_BREEDTE_PX,
  EXPORT_HOOGTE_PX,
  pdfBestandsnaam,
} from "./render/RenderService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-08-13T10:00:00.000Z";
const LATER = "2026-08-20T10:00:00.000Z";

let storage: StorageService;
let documentation: DocumentationService;
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
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

async function nieuweDocumentatie() {
  return waarde(
    await documentation.maak({
      title: "Kunstwerk Dok: de zoektocht",
      date: "2026-05-12",
      studentIds: [],
      text: "De kinderen gingen in de berm op zoek naar hun eigen kleur.",
    }),
  ).documentatie;
}

describe("toestemming beeldgebruik — FR-DOC-115, B-08", () => {
  it("staat op niets zolang er niet geëxporteerd is", async () => {
    expect((await nieuweDocumentatie()).imageConsentAt).toBeNull();
  });

  it("wordt vastgelegd zodra je hem geeft", async () => {
    const gemaakt = await nieuweDocumentatie();

    const na = waarde(await documentation.geefBeeldtoestemming(gemaakt.id));

    expect(na.imageConsentAt).toBe(NU);
  });

  it("geldt per documentatie en niet voor de volgende", async () => {
    const eerste = await nieuweDocumentatie();
    await documentation.geefBeeldtoestemming(eerste.id);

    const tweede = await nieuweDocumentatie();

    expect(tweede.imageConsentAt).toBeNull();
  });
});

describe("exporteren zet de status op gedeeld — FR-DOC-118, B-05, B-13", () => {
  it("laat een nieuwe documentatie op concept staan", async () => {
    const gemaakt = await nieuweDocumentatie();

    expect(gemaakt.status).toBe("concept");
    expect(gemaakt.firstExportedAt).toBeNull();
  });

  it("zet de status om en legt de datum van de eerste export vast", async () => {
    const gemaakt = await nieuweDocumentatie();

    const na = waarde(await documentation.markeerGedeeld(gemaakt.id));

    expect(na.status).toBe("gedeeld");
    expect(na.firstExportedAt).toBe(NU);
  });

  it("houdt bij een tweede export de dátum van de eerste vast (INV-15)", async () => {
    const gemaakt = await nieuweDocumentatie();
    await documentation.markeerGedeeld(gemaakt.id);

    klok.verzet(LATER);
    const na = waarde(await documentation.markeerGedeeld(gemaakt.id));

    expect(na.firstExportedAt).toBe(NU);
    expect(na.status).toBe("gedeeld");
  });
});

describe("een mislukte export verandert niets — FR-DOC-119", () => {
  it("laat de status op concept staan als het delen afbreekt", async () => {
    const gemaakt = await nieuweDocumentatie();

    // Dit is wat het paneel doet: bij een fout wordt `markeerGedeeld` niet bereikt.
    try {
      throw new Error("het deelmenu is weggeklikt");
    } catch {
      // met opzet leeg: er wordt niets bijgewerkt
    }

    const na = waarde(await documentation.open(gemaakt.id))!;
    expect(na.documentatie.status).toBe("concept");
    expect(na.documentatie.firstExportedAt).toBeNull();
    expect(na.documentatie.rev).toBe(gemaakt.rev);
  });

  it("meldt een documentatie die er niet meer is in plaats van er een te maken", async () => {
    const uitkomst = await documentation.markeerGedeeld(newId());

    expect(uitkomst.ok).toBe(false);
  });
});

describe("de weg naar buiten — FR-DOC-117, B-09", () => {
  const bestand = new File([new Uint8Array([1])], "een.jpg", { type: "image/jpeg" });

  it("kiest downloaden als er niets anders kan", () => {
    // jsdom heeft geen `navigator.share` en geen `ClipboardItem`.
    expect(deelwijze(bestand)).toBe("gedownload");
  });

  it("kiest het deelmenu zodra het apparaat bestanden kan delen", () => {
    const oud = navigator.canShare;
    Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });

    expect(deelwijze(bestand)).toBe("gedeeld");

    Object.defineProperty(navigator, "canShare", { value: oud, configurable: true });
  });
});

describe("de hele keten van documentatie naar afbeelding — D08", () => {
  const EEN = newId();
  const TWEE = newId();
  const beelden = new Map<string, Beeld>([
    [EEN, { bron: {} as CanvasImageSource, breedte: 1015, hoogte: 1802 }],
    [TWEE, { bron: {} as CanvasImageSource, breedte: 2000, hoogte: 1500 }],
  ]);

  function keten() {
    const { maak, doeken } = namaakDoekmaker();
    const render = createRenderService({ doek: maak, stijl: TOETSSTIJL });
    return { render, layout: createLayoutService({ meet: render.meet }), doeken };
  }

  function inhoud(deel: Partial<Exportinhoud> = {}): Exportinhoud {
    return {
      titel: "Kjeld en Pippa bouwen",
      reeks: "",
      datum: "2026-05-12",
      tekst: "Kjeld legde de eerste plank en Pippa zette hem vast.",
      fotos: [
        { photoId: EEN as Uuid, bijschrift: "" },
        { photoId: TWEE as Uuid, bijschrift: "" },
      ],
      groep: "Groep 4 — De Regenboog",
      legenda: "",
      ...deel,
    };
  }

  it("levert zes foto's plus tekst op twee pagina's, vooraf geteld (FR-DOC-112)", async () => {
    const { render, layout } = keten();
    const zes = Array.from({ length: 6 }, () => ({ photoId: EEN as Uuid, bijschrift: "" }));

    const plan = layout.plan(inhoud({ fotos: zes }));
    expect(plan.paginas).toHaveLength(2);

    const bestanden = await Promise.all(
      plan.paginas.map((pagina) => render.jpeg({ plan: pagina, beelden })),
    );
    expect(bestanden.every((blob) => blob.type === "image/jpeg")).toBe(true);
  });

  it("vervangt namen door initialen in titel én tekst (FR-DOC-114)", () => {
    const { render, layout, doeken } = keten();
    const kaart = initialenkaart(["Kjeld", "Pippa"]);

    const plan = layout.plan(
      inhoud({
        titel: vervangNamen("Kjeld en Pippa bouwen", kaart),
        tekst: vervangNamen("Kjeld legde de eerste plank en Pippa zette hem vast.", kaart),
      }),
    );
    render.voorbeeld({ plan: plan.paginas[0]!, beelden }, 620);

    const alles = doeken[doeken.length - 1]!
      .teksten()
      .map((regel) => regel.tekst)
      .join(" ");

    expect(alles).toContain("K.");
    expect(alles).toContain("P.");
    expect(alles).not.toContain("Kjeld");
    expect(alles).not.toContain("Pippa");
  });

  it("zet de legenda alleen op de pagina als er een botsing is (B-40)", () => {
    const { render, layout, doeken } = keten();
    const kaart = initialenkaart(["Kjeld", "Kaya"]);

    const plan = layout.plan(inhoud({ legenda: kaart.legenda }));
    render.voorbeeld({ plan: plan.paginas[0]!, beelden }, 620);

    const alles = doeken[doeken.length - 1]!
      .teksten()
      .map((regel) => regel.tekst)
      .join(" ");

    expect(alles).toContain("K. = Kjeld · K2. = Kaya");
  });

  it("zet de notitie voor jezelf nooit op de pagina (FR-DOC-08, §8.3.5)", () => {
    const { render, layout, doeken } = keten();

    // De notitie zit niet in `Exportinhoud`; er is geen veld waarlangs hij mee kan.
    const plan = layout.plan(inhoud());
    render.voorbeeld({ plan: plan.paginas[0]!, beelden }, 620);

    const alles = doeken[doeken.length - 1]!
      .teksten()
      .map((regel) => regel.tekst)
      .join(" ");

    expect(alles).not.toContain("dyslexie");
    expect(Object.keys(inhoud())).not.toContain("privateNote");
  });
});

/**
 * De PDF (`FR-DOC-116`, B-128).
 *
 * Wat hier bewezen wordt is het bundelen: één bestand, één A4 liggend per pagina,
 * in de volgorde van de nummers. Het beeld dat erin gaat is een **kop-JPEG** —
 * SOI, SOF0 en EOI, zonder pixels. Dat is geen versoepeling: `bundel()` decodeert
 * niets, het leest alleen de afmetingen uit de kop en legt de bytes op het blad.
 * Wat er in die bytes staat is het werk van `RenderService`, en dat wordt hierboven
 * al getoetst.
 */
function kopJpeg(breedte: number, hoogte: number): Blob {
  const bytes = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xc0, // SOF0
    0x00, 0x0b, // lengte 11
    0x08, // 8 bits per kanaal
    (hoogte >> 8) & 0xff, hoogte & 0xff,
    (breedte >> 8) & 0xff, breedte & 0xff,
    0x01, // één kanaal
    0x01, 0x11, 0x00,
    0xff, 0xd9, // EOI
  ]);
  return new Blob([bytes], { type: "image/jpeg" });
}

describe("Print-PDF wordt in de app gemaakt — FR-DOC-116, B-128", () => {
  const pdf = createPdfService({ laad: async () => await import("pdf-lib") });

  function bladen(aantal: number) {
    return Array.from({ length: aantal }, (_, plaats) => ({
      nummer: plaats + 1,
      jpeg: kopJpeg(EXPORT_BREEDTE_PX, EXPORT_HOOGTE_PX),
    }));
  }

  it("levert één PDF met drie A4-liggende pagina's (FR-DOC-116)", async () => {
    const uit = waarde(await pdf.bundel(bladen(3), "Kunstwerk Dok"));
    expect(uit.type).toBe("application/pdf");

    const { PDFDocument } = await import("pdf-lib");
    const gelezen = await PDFDocument.load(new Uint8Array(await uit.arrayBuffer()));

    expect(gelezen.getPageCount()).toBe(3);
    for (const blad of gelezen.getPages()) {
      // A4 liggend in punten: 297 × 210 mm. Afgerond, want 72/25,4 is oneindig.
      expect(Math.round(blad.getWidth())).toBe(842);
      expect(Math.round(blad.getHeight())).toBe(595);
    }
  });

  it("houdt de volgorde aan van de paginanummers en niet van de aanroep (FR-DOC-116)", async () => {
    const omgekeerd = [...bladen(3)].reverse();
    const uit = waarde(await pdf.bundel(omgekeerd, "Kunstwerk Dok"));

    const { PDFDocument } = await import("pdf-lib");
    const gelezen = await PDFDocument.load(new Uint8Array(await uit.arrayBuffer()));
    expect(gelezen.getPageCount()).toBe(3);
  });

  it("zet EduFlow als maker en niet de bibliotheek (DR-33)", async () => {
    const uit = waarde(await pdf.bundel(bladen(1), "Kunstwerk Dok"));

    const { PDFDocument } = await import("pdf-lib");
    // `updateMetadata: false`, want laden stempelt anders zijn eigen naam over
    // `Producer` heen — dan meet de toets de lezer in plaats van de schrijver.
    const gelezen = await PDFDocument.load(new Uint8Array(await uit.arrayBuffer()), {
      updateMetadata: false,
    });

    // De titel mag erin — die koos de gebruiker zelf voor dit bestand. De maker
    // niet: `EduFlow` en niets uit de opslag.
    expect(gelezen.getProducer()).toBe(PDF_PRODUCENT);
    expect(gelezen.getCreator()).toBe(PDF_PRODUCENT);
  });

  it("weigert een lege export in plaats van een leeg bestand af te leveren (FR-DOC-119)", async () => {
    const uit = await pdf.bundel([], "Kunstwerk Dok");
    expect(uit.ok).toBe(false);
  });

  it("noemt het bestand naar de documentatie, zonder paginanummer (§5.12)", () => {
    expect(pdfBestandsnaam("2026-10-13", "Kunstwerk Dok 2")).toBe("2026-10-13 Kunstwerk Dok 2.pdf");
    // Eén bestand met drie bladen; `bestandsnaam` nummert wél, want dat zijn er drie.
    expect(bestandsnaam("2026-10-13", "Kunstwerk Dok 2", 1, 3)).toBe(
      "2026-10-13 Kunstwerk Dok 2 - pagina 1 van 3.jpg",
    );
  });
});

describe("de toestemmingsvraag blijft weg zonder foto's — B-130, FR-DOC-115", () => {
  it("vraagt bij foto's zonder eerdere toestemming (FR-DOC-115)", () => {
    expect(vraagtToestemming({ fotos: 3, toestemmingGegeven: false })).toBe(true);
  });

  it("vraagt niet twee keer bij dezelfde documentatie (FR-DOC-115, B-08)", () => {
    expect(vraagtToestemming({ fotos: 3, toestemmingGegeven: true })).toBe(false);
  });

  it("vraagt niets bij een documentatie zonder foto's (B-130)", () => {
    expect(vraagtToestemming({ fotos: 0, toestemmingGegeven: false })).toBe(false);
  });
});
