/**
 * Toetsen bij werkopdracht D08 — de renderlaag.
 *
 * De toets die ertoe doet is die van `FR-DOC-113`: het voorbeeld in het paneel en
 * het bestand dat je verstuurt moeten uit dezelfde weg komen. Die eis is niet te
 * bewijzen met "beide functies bestaan"; hij is te bewijzen door beide te tekenen
 * en de opdrachten naast elkaar te leggen. Dat is precies wat hier gebeurt, en het
 * is de reden dat het doek in de toets opschrijft in plaats van tekent.
 */

import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { createLayoutService, PAGINA, type Exportinhoud } from "../documentation/LayoutService";
import { MM_PER_PUNT } from "../documentation/tekstzetten";
import type { Beeld } from "./doek";
import { namaakDoekmaker, TOETSSTIJL } from "./namaakdoek";
import {
  bestandsnaam,
  createRenderService,
  EXPORT_BREEDTE_PX,
  EXPORT_HOOGTE_PX,
  JPEG_KWALITEIT,
} from "./RenderService";
import { haalbareDpi, haaltPrintkwaliteit, uitsnede, wordtForsBijgesneden } from "./tekenen";

const EEN = newId();
const TWEE = newId();

/** Een staande telefoonfoto: 9:16, zoals er in de praktijk binnenkomen. */
const STAAND: Beeld = { bron: {} as CanvasImageSource, breedte: 1015, hoogte: 1802 };
/** Een liggende foto van 4:3. */
const LIGGEND: Beeld = { bron: {} as CanvasImageSource, breedte: 2000, hoogte: 1500 };

function opzet() {
  const { maak, doeken } = namaakDoekmaker();
  const render = createRenderService({ doek: maak, stijl: TOETSSTIJL });
  const layout = createLayoutService({ meet: render.meet });
  return { render, layout, doeken };
}

function inhoud(deel: Partial<Exportinhoud> = {}): Exportinhoud {
  return {
    titel: "Kunstwerk Dok: de zoektocht",
    reeks: "Kunstwerk Dok",
    datum: "2026-05-12",
    tekst: "De kinderen gingen in de berm op zoek naar hun eigen kleur.",
    fotos: [
      { photoId: EEN, bijschrift: "" },
      { photoId: TWEE, bijschrift: "" },
    ],
    groep: "Groep 4 — De Regenboog",
    legenda: "",
    ...deel,
  };
}

const BEELDEN = new Map<string, Beeld>([
  [EEN, STAAND],
  [TWEE, LIGGEND],
]);

describe("het voorbeeld is het eindresultaat — FR-DOC-113, B-26", () => {
  it("tekent voorbeeld en export met dezelfde opdrachten op schaal", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    const klein = render.voorbeeld({ plan, beelden: BEELDEN }, 620);
    // Het meetdoek staat vooraan; de laatste twee zijn het voorbeeld en de export.
    const groot = render.voorbeeld({ plan, beelden: BEELDEN }, EXPORT_BREEDTE_PX);
    const factor = EXPORT_BREEDTE_PX / 620;

    expect(doeken).toContain(klein);
    expect(doeken).toContain(groot);
    expect(groot.opdrachten).toHaveLength(klein.opdrachten.length);

    // Elke opdracht is dezelfde opdracht, alleen dan maal de schaal.
    klein.opdrachten.forEach((opdracht, plaats) => {
      const grote = groot.opdrachten[plaats]!;
      expect(grote.soort).toBe(opdracht.soort);
      expect(grote.stand.fillStyle).toBe(opdracht.stand.fillStyle);
    });

    const kleineTekst = klein.teksten();
    const groteTekst = groot.teksten();
    expect(groteTekst.map((regel) => regel.tekst)).toEqual(kleineTekst.map((regel) => regel.tekst));
    groteTekst.forEach((regel, plaats) => {
      expect(regel.x).toBeCloseTo(kleineTekst[plaats]!.x * factor, 6);
      expect(regel.y).toBeCloseTo(kleineTekst[plaats]!.y * factor, 6);
    });
  });

  it("breekt de regels op het voorbeeld precies zo als op de export", () => {
    const { render, layout } = opzet();
    const lang = inhoud({ tekst: "De kinderen gingen op zoek naar hun eigen kleur in de berm. ".repeat(3) });
    const plan = layout.plan(lang).paginas[0]!;

    const klein = render.voorbeeld({ plan, beelden: BEELDEN }, 320);
    const groot = render.voorbeeld({ plan, beelden: BEELDEN }, EXPORT_BREEDTE_PX);

    expect(groot.teksten().map((regel) => regel.tekst)).toEqual(klein.teksten().map((regel) => regel.tekst));
  });
});

describe("de deelbare afbeelding — §5.12", () => {
  it("meet 2480 × 1754 pixels", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: BEELDEN }, EXPORT_BREEDTE_PX);
    const doek = doeken[doeken.length - 1]!;

    expect(doek.breedte).toBe(EXPORT_BREEDTE_PX);
    expect(doek.hoogte).toBe(EXPORT_HOOGTE_PX);
  });

  it("levert een JPEG op kwaliteit 88", async () => {
    const { render, layout } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    const blob = await render.jpeg({ plan, beelden: BEELDEN });

    expect(blob.type).toBe("image/jpeg");
    expect(await blob.text()).toContain(`q${JPEG_KWALITEIT}`);
  });

  it("begint met een wit blad over het hele doek", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: BEELDEN }, 620);
    const eerste = doeken[doeken.length - 1]!.opdrachten[0]!;

    expect(eerste.soort).toBe("fillRect");
    expect(eerste.stand.fillStyle).toBe(TOETSSTIJL.papier);
  });

  it("draagt een bestandsnaam die in een fotorol terug te vinden is", () => {
    expect(bestandsnaam("2026-10-13", "Kunstwerk Dok 2", 1, 3)).toBe(
      "2026-10-13 Kunstwerk Dok 2 - pagina 1 van 3.jpg",
    );
  });

  it("haalt uit een titel wat geen bestandsnaam mag zijn", () => {
    expect(bestandsnaam("2026-10-13", "Zee: kwal / vis", 1, 1)).toBe(
      "2026-10-13 Zee kwal vis - pagina 1 van 1.jpg",
    );
  });
});

describe("foto's worden bijgesneden, niet vervormd — §5.11", () => {
  it("snijdt een staande foto gecentreerd bij op de slotverhouding", () => {
    const kader = { x: 10, y: 40, breedte: 88, hoogte: 66 };
    const { sx, sy, sBreedte, sHoogte } = uitsnede(STAAND, kader);

    // Het slot is breder dan de foto, dus de hoogte wordt weggesneden.
    expect(sBreedte).toBe(STAAND.breedte);
    expect(sHoogte).toBeCloseTo(STAAND.breedte / (88 / 66), 6);
    expect(sx).toBe(0);
    expect(sy).toBeCloseTo((STAAND.hoogte - sHoogte) / 2, 6);
  });

  it("houdt de verhouding van het slot aan en niet die van de foto", () => {
    const kader = { x: 10, y: 40, breedte: 88, hoogte: 66 };
    for (const beeld of [STAAND, LIGGEND]) {
      const { sBreedte, sHoogte } = uitsnede(beeld, kader);
      expect(sBreedte / sHoogte).toBeCloseTo(88 / 66, 6);
    }
  });

  it("meldt een staande foto in een liggend slot (§5.11)", () => {
    const kader = { x: 10, y: 40, breedte: 88, hoogte: 66 };

    expect(wordtForsBijgesneden(STAAND, kader)).toBe(true);
    expect(wordtForsBijgesneden(LIGGEND, kader)).toBe(false);
  });

  it("rekent de haalbare resolutie uit in dpi", () => {
    const kader = { x: 10, y: 40, breedte: 88, hoogte: 66 };

    // 1015 px over 88 mm is 1015 / (88/25,4) = 293 dpi.
    expect(haalbareDpi(STAAND, kader)).toBe(293);
    expect(haaltPrintkwaliteit(STAAND, kader)).toBe(false);
    expect(haaltPrintkwaliteit(LIGGEND, kader)).toBe(true);
  });

  it("laat een slot leeg als de foto niet is ingelezen", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: new Map() }, 620);

    expect(doeken[doeken.length - 1]!.opdrachten.some((opdracht) => opdracht.soort === "drawImage")).toBe(false);
  });
});

describe("de tekenset van de printlaag — §5.9, §5.10.1", () => {
  it("zet de voettekst in de gedempte kleur en de tekst in inkt", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: BEELDEN }, 620);
    const getekend = doeken[doeken.length - 1]!.opdrachten.filter((opdracht) => opdracht.soort === "fillText");

    const voet = getekend.find((opdracht) => opdracht.argumenten[0] === "1 van 1")!;
    expect(voet.stand.fillStyle).toBe(TOETSSTIJL.gedempt);
    expect(getekend.some((opdracht) => opdracht.stand.fillStyle === TOETSSTIJL.inkt)).toBe(true);
  });

  it("zet de reeksnaam in hoofdletters met de spatiëring van §5.10.1", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: BEELDEN }, 620);
    const reeks = doeken[doeken.length - 1]!.opdrachten.find(
      (opdracht) => opdracht.argumenten[0] === "KUNSTWERK DOK",
    )!;

    expect(reeks).toBeDefined();
    expect(reeks.stand.letterSpacing).toBe("0.08em");
  });

  it("schaalt de lettergrootte mee met het doek", () => {
    const { render, layout, doeken } = opzet();
    const plan = layout.plan(inhoud()).paginas[0]!;

    render.voorbeeld({ plan, beelden: BEELDEN }, EXPORT_BREEDTE_PX);
    const titel = doeken[doeken.length - 1]!.teksten().find((regel) => regel.tekst.includes("Kunstwerk"))!;

    // 24 punt op een doek van 2480 px over 297 mm.
    const verwacht = 24 * MM_PER_PUNT * (EXPORT_BREEDTE_PX / PAGINA.breedte);
    expect(titel.font).toContain(`${verwacht}px`);
  });
});
