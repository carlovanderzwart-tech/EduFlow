import { describe, expect, it } from "vitest";

import type { Quote } from "@/types/documentation";

import {
  A4_LANDSCAPE_300DPI,
  layout,
  type PageContent,
  type RenderBlock,
  type RenderInput,
  type RenderStudent,
  type TextMeasurer,
} from "./RenderService";
import { getTemplate } from "./render/templates/registry";

/**
 * Een voorspelbare meter: elk teken is een halve fontgrootte breed. Zo is de
 * opmaak te testen zonder browser — jsdom heeft geen tekstmetriek.
 */
const measure: TextMeasurer = {
  width: (text, style) => text.length * style.fontSize * 0.5,
};

function photos(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `p${index + 1}`);
}

interface Shorthand {
  title?: string;
  seriesName?: string;
  groupNames?: string[];
  students?: RenderStudent[];
  templateId?: string;
  text?: string;
  quotes?: Quote[];
  photoIds?: string[];
  pages?: PageContent[];
}

function input(overrides: Shorthand = {}): RenderInput {
  const { title, seriesName, groupNames, students, pages, ...page } = overrides;

  return {
    title: title ?? "Bouwen met blokken",
    seriesName,
    groupNames,
    students,
    pages: pages ?? [
      {
        templateId: page.templateId,
        text: page.text ?? "",
        quotes: page.quotes ?? [],
        photoIds: page.photoIds ?? [],
      },
    ],
  };
}

function photoBlocks(blocks: RenderBlock[]) {
  return blocks.filter((block) => block.kind === "photo");
}

function textBlocks(blocks: RenderBlock[]) {
  return blocks.filter((block) => block.kind !== "photo");
}

describe("RenderService.layout", () => {
  describe("titel", () => {
    it("zet de reeks als voorvoegsel voor de titel", () => {
      const [page] = layout(input({ seriesName: "Kunstwerk Dok" }), measure);
      expect(page.title).toBe("Kunstwerk Dok — Bouwen met blokken");
    });

    it("laat de titel met rust zonder reeks", () => {
      expect(layout(input(), measure)[0].title).toBe("Bouwen met blokken");
    });

    it("valt terug op een leesbare titel wanneer er geen is", () => {
      expect(layout(input({ title: "  " }), measure)[0].title).toBe("Zonder titel");
    });
  });

  /** Doc 04: `Groep: Grijs & Geel | Leerlingen: Geert (2,1), Lisa (2,8)`. */
  describe("kopregel", () => {
    const geboren = (jaren: number, maanden: number) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - jaren);
      d.setMonth(d.getMonth() - maanden);
      // Een dag terug, zodat de maand zeker vol is.
      d.setDate(Math.min(d.getDate(), 28));
      return d.toISOString().slice(0, 10);
    };

    it("toont groep en leerlingen met leeftijd", () => {
      const [page] = layout(
        input({
          groupNames: ["groep geel"],
          students: [{ name: "Geert", dateOfBirth: geboren(2, 1) }],
        }),
        measure,
      );

      expect(page.meta).toBe("Groep: Geel | Leerlingen: Geert (2,1)");
    });

    it("voegt meerdere groepen samen met &", () => {
      const [page] = layout(input({ groupNames: ["groep geel", "groep grijs"] }), measure);

      expect(page.meta).toBe("Groep: Geel & Grijs");
    });

    it("zet groepen alfabetisch", () => {
      const [page] = layout(input({ groupNames: ["groep rood", "groep blauw"] }), measure);

      expect(page.meta).toBe("Groep: Blauw & Rood");
    });

    it("zet leerlingen alfabetisch en scheidt ze met komma's", () => {
      const [page] = layout(
        input({
          students: [{ name: "Lisa" }, { name: "Geert" }, { name: "Anne" }],
        }),
        measure,
      );

      expect(page.meta).toBe("Leerlingen: Anne, Geert, Lisa");
    });

    it("haalt het voorvoegsel van de groepsnaam weg", () => {
      // De kop zegt zelf al "Groep:"; anders staat er "Groep: groep geel".
      expect(layout(input({ groupNames: ["groep geel"] }), measure)[0].meta).toBe("Groep: Geel");
    });

    it("laat een groepsnaam zonder voorvoegsel ongemoeid", () => {
      expect(layout(input({ groupNames: ["3A"] }), measure)[0].meta).toBe("Groep: 3A");
    });

    it("toont geen leeftijd zonder geboortedatum", () => {
      // Doc 02: geen streepje en geen schatting.
      const [page] = layout(input({ students: [{ name: "Geert" }] }), measure);

      expect(page.meta).toBe("Leerlingen: Geert");
    });

    it("laat de groepshelft weg wanneer de groep is opgeruimd", () => {
      const [page] = layout(input({ students: [{ name: "Geert" }] }), measure);

      expect(page.meta).toBe("Leerlingen: Geert");
      expect(page.meta).not.toContain("|");
    });

    it("laat de leerlinghelft weg wanneer er niemand gekoppeld is", () => {
      const [page] = layout(input({ groupNames: ["groep geel"] }), measure);

      expect(page.meta).toBe("Groep: Geel");
    });

    it("laat de hele regel weg wanneer er niets te melden valt", () => {
      expect(layout(input(), measure)[0].meta).toBe("");
    });

    it("herhaalt titel en kopregel op élke pagina", () => {
      const pages = layout(
        input({ photoIds: photos(6), templateId: "c", groupNames: ["groep geel"] }),
        measure,
      );

      expect(pages).toHaveLength(3);
      for (const page of pages) {
        expect(page.title).toBe("Bouwen met blokken");
        expect(page.meta).toBe("Groep: Geel");
      }
    });
  });

  describe("aantal pagina's", () => {
    it("maakt van zes foto's één pagina in template A en drie in template C", () => {
      // Het voorbeeld uit besluit B-07, letterlijk.
      expect(layout(input({ photoIds: photos(6), templateId: "a" }), measure)).toHaveLength(1);
      expect(layout(input({ photoIds: photos(6), templateId: "c" }), measure)).toHaveLength(3);
    });

    it("levert altijd minstens één pagina op", () => {
      expect(layout(input(), measure)).toHaveLength(1);
    });

    it("verdeelt foto's over pagina's zonder er een te verliezen", () => {
      const pages = layout(input({ photoIds: photos(7), templateId: "b" }), measure);

      expect(pages).toHaveLength(2);
      const alle = pages.flatMap((page) =>
        photoBlocks(page.blocks).map((block) => (block.kind === "photo" ? block.photoId : "")),
      );
      expect(alle).toEqual(photos(7));
    });

    it("laat lange tekst doorlopen naar een volgende pagina", () => {
      const lang = Array.from({ length: 400 }, () => "woord").join(" ");
      expect(layout(input({ text: lang, templateId: "a" }), measure).length).toBeGreaterThan(1);
    });

    it("neemt het hoogste van tekstpagina's en fotopagina's", () => {
      const lang = Array.from({ length: 400 }, () => "woord").join(" ");
      const pages = layout(input({ text: lang, photoIds: photos(1), templateId: "a" }), measure);

      expect(pages.length).toBeGreaterThan(1);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(1);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(0);
    });
  });

  /**
   * De kern van deze wijziging: een template levert precies zoveel vakken als
   * er foto's zijn, dus er kan geen leeg vak overblijven.
   */
  describe("geen lege fotovakken", () => {
    it.each(
      ["a", "b", "c", "d"].flatMap((id) =>
        [1, 2, 3, 4, 5, 6].map((aantal) => [id, aantal] as const),
      ),
    )("template %s met %i foto's vult elk vak", (id, aantal) => {
      const template = getTemplate(id);
      const pages = layout(input({ photoIds: photos(aantal), templateId: id }), measure);

      for (const page of pages) {
        const opDezePagina = photoBlocks(page.blocks);
        const perPagina = Math.min(template.photosPerPage, aantal);

        // Elk vak dat het template maakt hoort een foto te hebben.
        expect(opDezePagina.length).toBeGreaterThan(0);
        expect(opDezePagina.length).toBeLessThanOrEqual(perPagina);
      }
    });

    it.each([1, 2, 3, 4, 5, 6])("template A met %i foto's vult de hele fotokolom", (aantal) => {
      const [page] = layout(input({ photoIds: photos(aantal), templateId: "a" }), measure);
      const blocks = photoBlocks(page.blocks);

      expect(blocks).toHaveLength(aantal);

      // De onderste rand van de onderste foto raakt de onderkant van het gebied:
      // er blijft geen strook over waar een foto had moeten staan.
      const onderkant = Math.max(...blocks.map((b) => b.rect.y + b.rect.height));
      const gebied = getTemplate("a").frame(A4_LANDSCAPE_300DPI, aantal).photoSlots;
      const verwacht = Math.max(...gebied.map((r) => r.y + r.height));
      expect(onderkant).toBeCloseTo(verwacht, 5);
    });

    it("geeft één foto de volle hoogte in template C", () => {
      const [met1] = getTemplate("c").frame(A4_LANDSCAPE_300DPI, 1).photoSlots;
      const [met2] = getTemplate("c").frame(A4_LANDSCAPE_300DPI, 2).photoSlots;

      // Eén foto vult de kolom; bij twee krijgt de grote twee derde.
      expect(met1.height).toBeGreaterThan(met2.height);
    });

    it("geeft twee foto's in template A dezelfde afmeting", () => {
      const slots = getTemplate("a").frame(A4_LANDSCAPE_300DPI, 2).photoSlots;

      expect(slots).toHaveLength(2);
      expect(slots[0].width).toBeCloseTo(slots[1].width, 5);
      expect(slots[0].height).toBeCloseTo(slots[1].height, 5);
    });

    it("geeft drie foto's in template A één dominante en twee kleinere", () => {
      const [groot, klein1, klein2] = getTemplate("a").frame(A4_LANDSCAPE_300DPI, 3).photoSlots;

      expect(groot.width).toBeGreaterThan(klein1.width);
      expect(klein1.width).toBeCloseTo(klein2.width, 5);
    });

    it("geeft vier foto's in template A een 2×2", () => {
      const slots = getTemplate("a").frame(A4_LANDSCAPE_300DPI, 4).photoSlots;

      expect(slots).toHaveLength(4);
      expect(slots[0].y).toBeCloseTo(slots[1].y, 5);
      expect(slots[2].y).toBeGreaterThan(slots[0].y);
    });
  });

  describe("vakken vullen", () => {
    it("vult de vakken op volgorde van de fotolijst", () => {
      const [page] = layout(input({ photoIds: ["z", "a", "m"], templateId: "a" }), measure);
      const ids = photoBlocks(page.blocks).map((b) => (b.kind === "photo" ? b.photoId : ""));

      expect(ids).toEqual(["z", "a", "m"]);
    });

    it("houdt foto's binnen de pagina", () => {
      const [page] = layout(input({ photoIds: photos(6), templateId: "a" }), measure);

      for (const block of photoBlocks(page.blocks)) {
        expect(block.rect.x).toBeGreaterThanOrEqual(A4_LANDSCAPE_300DPI.margin);
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
      const frame = getTemplate("a").frame(A4_LANDSCAPE_300DPI, 6);
      const [page] = layout(
        input({ text: Array.from({ length: 40 }, () => "woord").join(" ") }),
        measure,
      );

      const [block] = textBlocks(page.blocks);
      expect(block.lines.length).toBeGreaterThan(1);
      for (const line of block.lines) {
        expect(measure.width(line, block.style)).toBeLessThanOrEqual(frame.text!.width);
      }
    });

    it("loopt niet vast op één woord dat breder is dan het vak", () => {
      const [page] = layout(input({ text: "a".repeat(500) }), measure);
      expect(textBlocks(page.blocks)[0].lines.length).toBeGreaterThan(1);
    });

    it("houdt citaten los van de lopende tekst en zet ze tussen aanhalingstekens", () => {
      const [page] = layout(
        input({ text: "De toren viel om.", quotes: [{ id: "q1", text: "Hij is te hoog!" }] }),
        measure,
      );

      const blocks = textBlocks(page.blocks);
      expect(blocks.map((b) => b.kind)).toEqual(["text", "quote"]);
      expect(blocks[1].lines[0]).toBe("“Hij is te hoog!”");
    });

    it("slaat lege alinea's en lege citaten over", () => {
      const [page] = layout(
        input({ text: "Eerste regel.\n\n\nTweede regel.", quotes: [{ id: "q1", text: "   " }] }),
        measure,
      );

      const blocks = textBlocks(page.blocks);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].lines).toEqual(["Eerste regel.", "Tweede regel."]);
    });
  });

  /** Doc 04: template D is een raster van foto's, zonder tekst. */
  describe("template D", () => {
    it("toont geen tekst, ook niet als de pagina tekst heeft", () => {
      const [page] = layout(
        input({
          text: "Deze tekst hoort hier niet te staan.",
          quotes: [{ id: "q1", text: "Dit citaat ook niet." }],
          photoIds: photos(4),
          templateId: "d",
        }),
        measure,
      );

      expect(textBlocks(page.blocks)).toHaveLength(0);
      expect(photoBlocks(page.blocks)).toHaveLength(4);
    });

    it("houdt titel en kopregel wél", () => {
      const [page] = layout(
        input({ photoIds: photos(4), templateId: "d", groupNames: ["groep geel"] }),
        measure,
      );

      expect(page.title).toBe("Bouwen met blokken");
      expect(page.meta).toBe("Groep: Geel");
    });

    it("levert bij nul foto's één lege pagina op", () => {
      const pages = layout(input({ text: "Tekst.", templateId: "d" }), measure);

      expect(pages).toHaveLength(1);
      expect(pages[0].blocks).toHaveLength(0);
    });

    it("vult bij zes foto's precies één pagina", () => {
      const pages = layout(input({ photoIds: photos(6), templateId: "d" }), measure);

      expect(pages).toHaveLength(1);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(6);
    });

    it("loopt bij zeven foto's door naar een tweede pagina", () => {
      const pages = layout(input({ photoIds: photos(7), templateId: "d" }), measure);

      expect(pages).toHaveLength(2);
      expect(photoBlocks(pages[0].blocks)).toHaveLength(6);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(1);
      expect(pages[1].totalPages).toBe(2);
    });
  });

  /**
   * Voorbereiding op fase 2: `layout()` loopt over een lijst pagina's. Vandaag
   * levert de aanroeper er één; meerdere moeten nu al kloppen, anders is de
   * voorbereiding niets waard.
   */
  describe("meerdere pagina's in de invoer", () => {
    it("legt elke pagina op met haar eigen template", () => {
      const pages = layout(
        input({
          pages: [
            { templateId: "a", text: "Eerste.", quotes: [], photoIds: photos(2) },
            { templateId: "d", text: "", quotes: [], photoIds: photos(3) },
          ],
        }),
        measure,
      );

      expect(pages).toHaveLength(2);
      expect(textBlocks(pages[0].blocks)).toHaveLength(1);
      // Template D heeft geen tekstvak.
      expect(textBlocks(pages[1].blocks)).toHaveLength(0);
      expect(photoBlocks(pages[1].blocks)).toHaveLength(3);
    });

    it("telt de paginanummers door over het geheel", () => {
      const pages = layout(
        input({
          pages: [
            { templateId: "c", text: "", quotes: [], photoIds: photos(4) },
            { templateId: "a", text: "", quotes: [], photoIds: photos(1) },
          ],
        }),
        measure,
      );

      // Vier foto's in C zijn twee vellen, plus één vel voor de tweede pagina.
      expect(pages.map((p) => p.pageNumber)).toEqual([1, 2, 3]);
      expect(pages.every((p) => p.totalPages === 3)).toBe(true);
    });

    it("levert bij een lege lijst nog steeds niets ongeldigs op", () => {
      expect(layout({ title: "Leeg", pages: [] }, measure)).toEqual([]);
    });
  });

  it("valt terug op template A bij een onbekend template", () => {
    expect(layout(input({ photoIds: photos(6), templateId: "bestaat-niet" }), measure)).toHaveLength(1);
  });
});
