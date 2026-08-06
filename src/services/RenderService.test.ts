import { describe, expect, it } from "vitest";

import type { Documentation } from "@/types/documentation";

import { A4_LANDSCAPE_300DPI, layout, type RenderBlock, type TextMeasurer } from "./RenderService";
import { getTemplate } from "./render/templates/registry";

/**
 * Een voorspelbare meter: elk teken is een halve fontgrootte breed. Zo is de
 * opmaak te testen zonder browser — jsdom heeft geen tekstmetriek.
 */
const measure: TextMeasurer = {
  width: (text, style) => text.length * style.fontSize * 0.5,
};

function makeDocument(overrides: Partial<Documentation> = {}): Documentation {
  return {
    id: "d1",
    title: "Bouwen met blokken",
    groupId: "g1",
    studentIds: [],
    date: "2026-08-06",
    text: "",
    quotes: [],
    photoIds: [],
    createdAt: "2026-08-06T09:00:00.000Z",
    updatedAt: "2026-08-06T09:00:00.000Z",
    ...overrides,
  };
}

function photos(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `p${index + 1}`);
}

function photoBlocks(blocks: RenderBlock[]) {
  return blocks.filter((block) => block.kind === "photo");
}

function textBlocks(blocks: RenderBlock[]) {
  return blocks.filter((block) => block.kind !== "photo");
}

describe("RenderService.layout", () => {
  describe("kop", () => {
    it("zet de reeks als voorvoegsel voor de titel", () => {
      const [page] = layout(
        { document: makeDocument(), seriesName: "Kunstwerk Dok" },
        measure,
      );

      expect(page.title).toBe("Kunstwerk Dok — Bouwen met blokken");
    });

    it("laat de titel met rust zonder reeks", () => {
      const [page] = layout({ document: makeDocument() }, measure);

      expect(page.title).toBe("Bouwen met blokken");
    });

    it("valt terug op een leesbare titel wanneer er geen is", () => {
      const [page] = layout({ document: makeDocument({ title: "  " }) }, measure);

      expect(page.title).toBe("Zonder titel");
    });

    it("toont alleen de groep wanneer er geen leerlingen gekoppeld zijn", () => {
      const [page] = layout({ document: makeDocument(), groupName: "groep geel" }, measure);

      expect(page.meta).toBe("Leerling(en): groep geel");
    });

    it("zet de voornamen achter de groep", () => {
      const [page] = layout(
        { document: makeDocument(), groupName: "groep geel", studentNames: ["Kjeld", "Roos"] },
        measure,
      );

      expect(page.meta).toBe("Leerling(en): groep geel — Kjeld, Roos");
    });

    it("laat de regel weg wanneer de groep is opgeruimd en er niemand gekoppeld is", () => {
      const [page] = layout({ document: makeDocument() }, measure);

      // Een regel met alleen "Leerling(en):" erop zegt niets.
      expect(page.meta).toBe("");
    });

    it("houdt de regel heel wanneer de groep is opgeruimd maar er wel leerlingen zijn", () => {
      const [page] = layout(
        { document: makeDocument(), studentNames: ["Kjeld"] },
        measure,
      );

      expect(page.meta).toBe("Leerling(en): Kjeld");
    });

    it("herhaalt titel en regel op élke pagina", () => {
      const pages = layout(
        {
          document: makeDocument({ photoIds: photos(6) }),
          templateId: "c",
          groupName: "groep geel",
        },
        measure,
      );

      expect(pages).toHaveLength(3);
      for (const page of pages) {
        expect(page.title).toBe("Bouwen met blokken");
        expect(page.meta).toBe("Leerling(en): groep geel");
      }
    });
  });

  describe("aantal pagina's", () => {
    it("maakt van zes foto's één pagina in template A en drie in template C", () => {
      // Het voorbeeld uit besluit B-07, letterlijk.
      const inA = layout({ document: makeDocument({ photoIds: photos(6) }), templateId: "a" }, measure);
      const inC = layout({ document: makeDocument({ photoIds: photos(6) }), templateId: "c" }, measure);

      expect(inA).toHaveLength(1);
      expect(inC).toHaveLength(3);
    });

    it("levert altijd minstens één pagina op", () => {
      expect(layout({ document: makeDocument() }, measure)).toHaveLength(1);
    });

    it("verdeelt foto's over pagina's zonder er een te verliezen", () => {
      const pages = layout(
        { document: makeDocument({ photoIds: photos(7) }), templateId: "b" },
        measure,
      );

      expect(pages).toHaveLength(2);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(4);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(3);

      const alle = pages.flatMap((page) =>
        photoBlocks(page.blocks).map((block) => block.kind === "photo" && block.photoId),
      );
      expect(alle).toEqual(photos(7));
    });

    it("laat lange tekst doorlopen naar een volgende pagina", () => {
      const lang = Array.from({ length: 400 }, () => "woord").join(" ");
      const pages = layout({ document: makeDocument({ text: lang }), templateId: "a" }, measure);

      expect(pages.length).toBeGreaterThan(1);
    });

    it("neemt het hoogste van tekstpagina's en fotopagina's", () => {
      const lang = Array.from({ length: 400 }, () => "woord").join(" ");
      const pages = layout(
        { document: makeDocument({ text: lang, photoIds: photos(1) }), templateId: "a" },
        measure,
      );

      // Eén foto past op één pagina, de tekst niet. Dan telt de tekst.
      expect(pages.length).toBeGreaterThan(1);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(1);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(0);
    });
  });

  describe("vakken vullen", () => {
    it("laat geen lege vakken staan bij minder foto's dan het template aankan", () => {
      const [page] = layout(
        { document: makeDocument({ photoIds: photos(2) }), templateId: "a" },
        measure,
      );

      expect(photoBlocks(page.blocks)).toHaveLength(2);
    });

    it("vult de vakken op volgorde van de fotolijst", () => {
      const [page] = layout(
        { document: makeDocument({ photoIds: ["z", "a", "m"] }), templateId: "a" },
        measure,
      );

      const ids = photoBlocks(page.blocks).map((block) => block.kind === "photo" && block.photoId);
      expect(ids).toEqual(["z", "a", "m"]);
    });

    it("houdt foto's binnen de pagina", () => {
      const [page] = layout(
        { document: makeDocument({ photoIds: photos(6) }), templateId: "a" },
        measure,
      );

      for (const block of photoBlocks(page.blocks)) {
        expect(block.rect.x).toBeGreaterThanOrEqual(A4_LANDSCAPE_300DPI.margin);
        expect(block.rect.y).toBeGreaterThanOrEqual(A4_LANDSCAPE_300DPI.margin);
        expect(block.rect.x + block.rect.width).toBeLessThanOrEqual(
          A4_LANDSCAPE_300DPI.width - A4_LANDSCAPE_300DPI.margin + 1,
        );
        expect(block.rect.y + block.rect.height).toBeLessThanOrEqual(
          A4_LANDSCAPE_300DPI.height - A4_LANDSCAPE_300DPI.margin + 1,
        );
      }
    });
  });

  describe("tekst", () => {
    it("breekt tekst af binnen de breedte van het vak", () => {
      const frame = getTemplate("a").frame(A4_LANDSCAPE_300DPI);
      const [page] = layout(
        { document: makeDocument({ text: Array.from({ length: 40 }, () => "woord").join(" ") }) },
        measure,
      );

      const [block] = textBlocks(page.blocks);

      expect(block.lines.length).toBeGreaterThan(1);
      for (const line of block.lines) {
        expect(measure.width(line, block.style)).toBeLessThanOrEqual(frame.text!.width);
      }
    });

    it("loopt niet vast op één woord dat breder is dan het vak", () => {
      const [page] = layout({ document: makeDocument({ text: "a".repeat(500) }) }, measure);

      const [block] = textBlocks(page.blocks);
      expect(block.lines.length).toBeGreaterThan(1);
    });

    it("houdt citaten los van de lopende tekst en zet ze tussen aanhalingstekens", () => {
      const [page] = layout(
        {
          document: makeDocument({
            text: "De toren viel om.",
            quotes: [{ id: "q1", text: "Hij is te hoog!" }],
          }),
        },
        measure,
      );

      const blocks = textBlocks(page.blocks);
      expect(blocks.map((block) => block.kind)).toEqual(["text", "quote"]);

      expect(blocks[1].lines[0]).toBe("“Hij is te hoog!”");
    });

    it("slaat lege alinea's en lege citaten over", () => {
      const [page] = layout(
        {
          document: makeDocument({
            text: "Eerste regel.\n\n\nTweede regel.",
            quotes: [{ id: "q1", text: "   " }],
          }),
        },
        measure,
      );

      const blocks = textBlocks(page.blocks);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].lines).toEqual(["Eerste regel.", "Tweede regel."]);
    });
  });

  /** Doc 04: template D is een raster van vier tot zes foto's, zonder tekst. */
  describe("template D", () => {
    it("toont geen tekst, ook niet als de documentatie tekst heeft", () => {
      const [page] = layout(
        {
          document: makeDocument({
            text: "Deze tekst hoort hier niet te staan.",
            quotes: [{ id: "q1", text: "Dit citaat ook niet." }],
            photoIds: photos(4),
          }),
          templateId: "d",
        },
        measure,
      );

      expect(textBlocks(page.blocks)).toHaveLength(0);
      expect(photoBlocks(page.blocks)).toHaveLength(4);
    });

    it("houdt titel en Leerling(en)-regel wél", () => {
      const [page] = layout(
        { document: makeDocument({ photoIds: photos(4) }), templateId: "d", groupName: "groep geel" },
        measure,
      );

      expect(page.title).toBe("Bouwen met blokken");
      expect(page.meta).toBe("Leerling(en): groep geel");
    });

    it("levert bij nul foto's één lege pagina op", () => {
      const pages = layout({ document: makeDocument({ text: "Tekst." }), templateId: "d" }, measure);

      expect(pages).toHaveLength(1);
      expect(pages[0].blocks).toHaveLength(0);
    });

    it("plaatst één foto in het eerste vak", () => {
      const [page] = layout(
        { document: makeDocument({ photoIds: photos(1) }), templateId: "d" },
        measure,
      );

      const blocks = photoBlocks(page.blocks);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].rect).toEqual(getTemplate("d").frame(A4_LANDSCAPE_300DPI).photoSlots[0]);
    });

    it("vult bij zes foto's precies één pagina", () => {
      const pages = layout(
        { document: makeDocument({ photoIds: photos(6) }), templateId: "d" },
        measure,
      );

      expect(pages).toHaveLength(1);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(6);
    });

    it("loopt bij zeven foto's door naar een tweede pagina", () => {
      const pages = layout(
        { document: makeDocument({ photoIds: photos(7) }), templateId: "d" },
        measure,
      );

      expect(pages).toHaveLength(2);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(6);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(1);
      expect(pages[1].totalPages).toBe(2);
    });
  });

  it("valt terug op template A bij een onbekend template", () => {
    const onbekend = layout(
      { document: makeDocument({ photoIds: photos(6) }), templateId: "bestaat-niet" },
      measure,
    );

    expect(onbekend).toHaveLength(1);
  });
});
