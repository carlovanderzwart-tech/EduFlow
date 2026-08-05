import { describe, expect, it } from "vitest";

import { getDocumentStatus, isWorthSaving, type Documentation } from "./documentation";

function makeDoc(overrides: Partial<Documentation> = {}): Documentation {
  return {
    id: "d1",
    title: "",
    studentIds: [],
    date: "2026-08-05",
    text: "",
    quotes: [],
    photoIds: [],
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    ...overrides,
  };
}

/**
 * Doc 02: een documentatie zonder tekst én zonder foto's wordt niet bewaard.
 * Besluit B-05: afgerond volgt uit een export en wordt niet met de hand gezet.
 */
describe("isWorthSaving", () => {
  it("bewaart niets zonder tekst en zonder foto's", () => {
    expect(isWorthSaving(makeDoc())).toBe(false);
  });

  it("negeert alleen witruimte als tekst", () => {
    expect(isWorthSaving(makeDoc({ text: "   \n  " }))).toBe(false);
  });

  it("bewaart bij tekst", () => {
    expect(isWorthSaving(makeDoc({ text: "Vanmorgen bouwden we een toren." }))).toBe(true);
  });

  it("bewaart bij alleen foto's", () => {
    expect(isWorthSaving(makeDoc({ photoIds: ["p1"] }))).toBe(true);
  });

  it("bewaart niet op grond van een titel of groep alleen", () => {
    expect(isWorthSaving(makeDoc({ title: "Bouwen met blokken" }))).toBe(false);
  });
});

describe("getDocumentStatus", () => {
  it("is concept zolang er niet is geëxporteerd", () => {
    expect(getDocumentStatus(makeDoc({ text: "x" }))).toBe("concept");
  });

  it("is afgerond na een export", () => {
    expect(getDocumentStatus(makeDoc({ exportedAt: "2026-08-05T12:00:00.000Z" }))).toBe("afgerond");
  });
});
