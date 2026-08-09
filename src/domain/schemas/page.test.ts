import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { pagina, zonderVeld } from "../toetsgegevens";
import { zBlock, zPage } from "./page";

const tekstblok = { id: newId(), slot: 0, order: 0, kind: "text", text: "Kjeld bouwde een brug." };
const fotoblok = {
  id: newId(),
  slot: 1,
  order: 1,
  kind: "photo",
  photoId: newId(),
  crop: null,
  altText: "Een brug van blokken",
};
const citaatblok = {
  id: newId(),
  slot: 2,
  order: 2,
  kind: "quote",
  text: "Hij houdt nu wel!",
  studentId: newId(),
  attributionStyle: "roepnaam",
};
const kopblok = { id: newId(), slot: 3, order: 3, kind: "heading", text: "De brug", level: 1 };

describe("zPage — §8.3.6", () => {
  it("laat een geldige pagina door", () => {
    expect(zPage.safeParse(pagina()).success).toBe(true);
  });

  it("weigert een pagina zonder documentatie (INV-09)", () => {
    expect(zPage.safeParse(zonderVeld(pagina(), "documentationId")).success).toBe(false);
  });

  it("weigert een layout die niet bestaat", () => {
    expect(zPage.safeParse({ ...pagina(), layoutId: "F-collage" }).success).toBe(false);
  });

  it("kent de vijf layouts uit §5.10", () => {
    for (const layout of ["A-fotoraster", "B-verhaal", "C-groot-beeld", "D-alleen-beeld", "E-vervolg"]) {
      expect(zPage.safeParse({ ...pagina(), layoutId: layout }).success).toBe(true);
    }
  });

  it("weigert een negatief volgnummer", () => {
    expect(zPage.safeParse({ ...pagina(), order: -1 }).success).toBe(false);
  });

  it("weigert meer dan veertig blokken", () => {
    const teveel = Array.from({ length: 41 }, (_, index) => ({
      ...tekstblok,
      id: newId(),
      slot: index,
      order: index,
    }));

    expect(zPage.safeParse({ ...pagina(), blocks: teveel }).success).toBe(false);
  });

  it("laat een pagina zonder blokken toe", () => {
    // Een lege eerste pagina is wat de reparatieronde aanmaakt bij INV-08.
    expect(zPage.safeParse({ ...pagina(), blocks: [] }).success).toBe(true);
  });
});

describe("zBlock — de vier soorten (§8.3.6, §9.9)", () => {
  it("kent alle vier de soorten", () => {
    for (const blok of [tekstblok, fotoblok, citaatblok, kopblok]) {
      expect(zBlock.safeParse(blok).success).toBe(true);
    }
  });

  it("weigert een blok zonder soort", () => {
    expect(zBlock.safeParse(zonderVeld(tekstblok, "kind")).success).toBe(false);
  });

  it("weigert een soort die niet bestaat", () => {
    expect(zBlock.safeParse({ ...tekstblok, kind: "video" }).success).toBe(false);
  });

  it("weigert velden van de ene soort op de andere (INV-10)", () => {
    // Een fotoblok met een citaatveld erin bestaat niet. Dat is wat de
    // gediscrimineerde unie afdwingt.
    expect(zBlock.safeParse({ ...fotoblok, attributionStyle: "roepnaam" }).success).toBe(false);
  });

  it("weigert tekst boven twintigduizend tekens", () => {
    expect(zBlock.safeParse({ ...tekstblok, text: "a".repeat(20_001) }).success).toBe(false);
  });

  it("weigert een citaat boven vierhonderd tekens", () => {
    expect(zBlock.safeParse({ ...citaatblok, text: "a".repeat(401) }).success).toBe(false);
  });

  it("weigert een leeg citaat", () => {
    expect(zBlock.safeParse({ ...citaatblok, text: "" }).success).toBe(false);
  });

  it("weigert een kopniveau dat niet bestaat", () => {
    expect(zBlock.safeParse({ ...kopblok, level: 3 }).success).toBe(false);
  });
});

describe("INV-14 — een citaat verwijst naar hoogstens één leerling", () => {
  it("laat één leerling toe", () => {
    expect(zBlock.safeParse(citaatblok).success).toBe(true);
  });

  it("laat een citaat van niemand in het bijzonder toe (B-37)", () => {
    expect(zBlock.safeParse({ ...citaatblok, studentId: null }).success).toBe(true);
  });

  it("weigert een lijst van leerlingen", () => {
    expect(zBlock.safeParse({ ...citaatblok, studentId: [newId(), newId()] }).success).toBe(false);
  });
});

describe("uitsnede — B-65", () => {
  it("werkt in verhoudingen van nul tot één, niet in pixels", () => {
    const relatief = { ...fotoblok, crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 } };
    const pixels = { ...fotoblok, crop: { x: 120, y: 80, w: 1600, h: 900 } };

    expect(zBlock.safeParse(relatief).success).toBe(true);
    expect(zBlock.safeParse(pixels).success).toBe(false);
  });

  it("weigert een halve uitsnede", () => {
    expect(zBlock.safeParse({ ...fotoblok, crop: { x: 0.1, y: 0.1, w: 0.8 } }).success).toBe(false);
  });
});
