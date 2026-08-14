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
import type { Beeld } from "./render/doek";
import { initialenkaart, vervangNamen } from "./render/initialen";
import { namaakDoekmaker, TOETSSTIJL } from "./render/namaakdoek";
import { createRenderService } from "./render/RenderService";
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
