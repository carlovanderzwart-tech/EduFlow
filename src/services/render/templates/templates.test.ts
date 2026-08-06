import { describe, expect, it } from "vitest";

import { A4_LANDSCAPE_300DPI } from "../../RenderService";
import { DEFAULT_TEMPLATE_ID, getTemplate, TEMPLATES } from "./registry";

const page = A4_LANDSCAPE_300DPI;

/** Doc 04, *Opmaak*: vier templates, elk met een eigen aantal foto's. */
describe("templates", () => {
  it("kent de vier gedocumenteerde templates, in volgorde", () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("gebruikt template A als standaard", () => {
    // "De meest gebruikte indeling" (doc 04).
    expect(DEFAULT_TEMPLATE_ID).toBe("a");
    expect(getTemplate(undefined).id).toBe("a");
    expect(getTemplate("bestaat-niet").id).toBe("a");
  });

  it.each([
    ["a", 6],
    ["b", 4],
    ["c", 2],
    ["d", 6],
  ])("template %s neemt %i foto's per pagina", (id, expected) => {
    const template = getTemplate(id);
    expect(template.photosPerPage).toBe(expected);
    expect(template.frame(page).photoSlots).toHaveLength(expected);
  });

  it.each([["a"], ["b"], ["c"]])("template %s heeft een tekstvak", (id) => {
    expect(getTemplate(id).frame(page).text).toBeDefined();
  });

  it("template D heeft géén tekstvak", () => {
    expect(getTemplate("d").frame(page).text).toBeUndefined();
  });

  it.each(TEMPLATES.map((template) => [template.id]))(
    "template %s houdt alle vakken binnen de marge",
    (id) => {
      const frame = getTemplate(id).frame(page);
      const boxes = [...frame.photoSlots, ...(frame.text ? [frame.text] : [])];

      for (const box of boxes) {
        expect(box.x).toBeGreaterThanOrEqual(page.margin);
        // De kop staat boven de inhoud; niets mag daar overheen.
        expect(box.y).toBeGreaterThanOrEqual(page.margin + page.headerHeight);
        expect(box.x + box.width).toBeLessThanOrEqual(page.width - page.margin + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(page.height - page.margin + 1);
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    },
  );

  it.each(TEMPLATES.map((template) => [template.id]))(
    "template %s laat vakken elkaar niet overlappen",
    (id) => {
      const frame = getTemplate(id).frame(page);
      const boxes = [...frame.photoSlots, ...(frame.text ? [frame.text] : [])];

      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const overlapt =
            a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
          expect(overlapt).toBe(false);
        }
      }
    },
  );

  /**
   * De miniaturen in het exportpaneel vragen dezelfde templates om hun vakken
   * op een pagina van honderd eenheden breed. Met een vaste tussenruimte in
   * pixels leverde dat negatieve vakken op — de browser klaagde, de tests niet.
   */
  it.each(TEMPLATES.map((template) => [template.id]))(
    "template %s levert ook op miniatuurformaat bruikbare vakken",
    (id) => {
      const klein = { width: 100, height: 70.7, margin: 3.4, headerHeight: 8.5 };
      const frame = getTemplate(id).frame(klein);
      const boxes = [...frame.photoSlots, ...(frame.text ? [frame.text] : [])];

      for (const box of boxes) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x + box.width).toBeLessThanOrEqual(klein.width - klein.margin + 0.01);
        expect(box.y + box.height).toBeLessThanOrEqual(klein.height - klein.margin + 0.01);
      }
    },
  );

  it("geeft template C een grotere eerste foto dan tweede", () => {
    // "één dominante foto rechts, eventueel één kleinere eronder" (doc 04).
    const [groot, klein] = getTemplate("c").frame(page).photoSlots;
    expect(groot.height).toBeGreaterThan(klein.height);
  });

  it("geeft template B de tekst meer ruimte dan template A", () => {
    // "Voor langere teksten" (doc 04).
    const a = getTemplate("a").frame(page).text!;
    const b = getTemplate("b").frame(page).text!;
    expect(b.width).toBeGreaterThan(a.width);
  });
});
