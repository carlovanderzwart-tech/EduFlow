import { describe, expect, it } from "vitest";

import { A4_LANDSCAPE_300DPI } from "../../RenderService";
import { balancedRows, type PageSize, type Rect } from ".";
import { DEFAULT_TEMPLATE_ID, getTemplate, TEMPLATES } from "./registry";

const page = A4_LANDSCAPE_300DPI;

/**
 * Templates worden op twee heel verschillende formaten gebruikt: het
 * exportformaat en de miniaturen in het paneel. Met een vaste tussenruimte in
 * pixels werden de vakken op miniatuurformaat negatief — de browser klaagde,
 * de tests niet. Daarom hier een reeks formaten.
 */
const FORMATEN: ReadonlyArray<readonly [string, PageSize]> = [
  ["miniatuur", { width: 100, height: 70.7, margin: 3.4, headerHeight: 8.5 }],
  ["klein", { width: 400, height: 283, margin: 13, headerHeight: 34 }],
  ["middel", { width: 1200, height: 848, margin: 40, headerHeight: 103 }],
  ["export", A4_LANDSCAPE_300DPI],
];

const AANTALLEN = [1, 2, 3, 4, 5, 6];

function alleVakken(id: string, formaat: PageSize, aantal: number): Rect[] {
  const frame = getTemplate(id).frame(formaat, aantal);
  return [...frame.photoSlots, ...(frame.text ? [frame.text] : [])];
}

function overlapt(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width - 0.01 &&
    b.x < a.x + a.width - 0.01 &&
    a.y < b.y + b.height - 0.01 &&
    b.y < a.y + a.height - 0.01
  );
}

describe("templates", () => {
  it("kent de vier gedocumenteerde templates, in volgorde", () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("gebruikt template A als standaard", () => {
    expect(DEFAULT_TEMPLATE_ID).toBe("a");
    expect(getTemplate(undefined).id).toBe("a");
    expect(getTemplate("bestaat-niet").id).toBe("a");
  });

  it.each([
    ["a", 6],
    ["b", 4],
    ["c", 2],
    ["d", 6],
  ])("template %s neemt hoogstens %i foto's per pagina", (id, max) => {
    expect(getTemplate(id).photosPerPage).toBe(max);
  });

  it.each([["a"], ["b"], ["c"]])("template %s heeft een tekstvak", (id) => {
    expect(getTemplate(id).frame(page, 4).text).toBeDefined();
  });

  it("template D heeft géén tekstvak", () => {
    expect(getTemplate("d").frame(page, 4).text).toBeUndefined();
  });

  /** De kern van de adaptieve templates: geen vak zonder foto. */
  describe("adaptief", () => {
    it.each(
      TEMPLATES.flatMap((template) =>
        AANTALLEN.filter((aantal) => aantal <= template.photosPerPage).map(
          (aantal) => [template.id, aantal] as const,
        ),
      ),
    )("template %s levert bij %i foto's precies %i vakken", (id, aantal) => {
      expect(getTemplate(id).frame(page, aantal).photoSlots).toHaveLength(aantal);
    });

    it.each(TEMPLATES.map((template) => [template.id] as const))(
      "template %s levert geen vakken bij nul foto's",
      (id) => {
        expect(getTemplate(id).frame(page, 0).photoSlots).toEqual([]);
      },
    );

    it.each([
      [1, [1]],
      [2, [2]],
      [3, [1, 2]],
      [4, [2, 2]],
      [5, [2, 3]],
      [6, [3, 3]],
    ])("verdeelt %i foto's over de rijen %j", (aantal, rijen) => {
      expect(balancedRows(aantal)).toEqual(rijen);
    });

    it("laat één foto meer ruimte krijgen dan één van zes", () => {
      const [alleen] = getTemplate("a").frame(page, 1).photoSlots;
      const [eenVanZes] = getTemplate("a").frame(page, 6).photoSlots;

      expect(alleen.width * alleen.height).toBeGreaterThan(eenVanZes.width * eenVanZes.height);
    });

    it("houdt template B op één rij, hoe weinig foto's ook", () => {
      // Een tweede rij zou de strook halveren en de foto's onleesbaar maken.
      for (const aantal of [1, 2, 3, 4]) {
        const slots = getTemplate("b").frame(page, aantal).photoSlots;
        const eersteY = slots[0].y;
        expect(slots.every((slot) => Math.abs(slot.y - eersteY) < 0.01)).toBe(true);
      }
    });
  });

  describe.each(FORMATEN)("op formaat %s", (_naam, formaat) => {
    it.each(AANTALLEN)("levert template A met %i foto's bruikbare vakken", (aantal) => {
      for (const box of alleVakken("a", formaat, aantal)) {
        expect(Number.isFinite(box.x) && Number.isFinite(box.y)).toBe(true);
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(formaat.margin - 0.01);
        expect(box.y).toBeGreaterThanOrEqual(formaat.margin + formaat.headerHeight - 0.01);
        expect(box.x + box.width).toBeLessThanOrEqual(formaat.width - formaat.margin + 0.01);
        expect(box.y + box.height).toBeLessThanOrEqual(formaat.height - formaat.margin + 0.01);
      }
    });

    it.each(TEMPLATES.map((template) => [template.id] as const))(
      "laat template %s niets overlappen",
      (id) => {
        for (const aantal of AANTALLEN) {
          if (aantal > getTemplate(id).photosPerPage) continue;
          const boxes = alleVakken(id, formaat, aantal);

          for (let i = 0; i < boxes.length; i += 1) {
            for (let j = i + 1; j < boxes.length; j += 1) {
              expect(overlapt(boxes[i], boxes[j])).toBe(false);
            }
          }
        }
      },
    );

    it.each(TEMPLATES.map((template) => [template.id] as const))(
      "houdt template %s binnen de marges",
      (id) => {
        for (const aantal of AANTALLEN) {
          if (aantal > getTemplate(id).photosPerPage) continue;

          for (const box of alleVakken(id, formaat, aantal)) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
            expect(box.x + box.width).toBeLessThanOrEqual(formaat.width - formaat.margin + 0.01);
            expect(box.y + box.height).toBeLessThanOrEqual(formaat.height - formaat.margin + 0.01);
          }
        }
      },
    );
  });

  it("geeft template C een grotere eerste foto dan tweede", () => {
    const [groot, klein] = getTemplate("c").frame(page, 2).photoSlots;
    expect(groot.height).toBeGreaterThan(klein.height);
  });

  it("geeft template B de tekst meer ruimte dan template A", () => {
    expect(getTemplate("b").frame(page, 4).text!.width).toBeGreaterThan(
      getTemplate("a").frame(page, 4).text!.width,
    );
  });

  it("houdt het tekstvak gelijk, ongeacht het aantal foto's", () => {
    // De tekstpaginering meet tegen dit vak; zou het meebewegen met het aantal
    // foto's, dan zou het aantal pagina's van zichzelf afhangen.
    const met1 = getTemplate("a").frame(page, 1).text!;
    const met6 = getTemplate("a").frame(page, 6).text!;

    expect(met1).toEqual(met6);
  });
});
