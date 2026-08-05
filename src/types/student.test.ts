import { describe, expect, it } from "vitest";

import { getMaskableNames, getStudentFullName, type Student } from "./student";

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: "s1",
    firstName: "Kjeld",
    active: true,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    ...overrides,
  };
}

/**
 * Besluiten T-12, T-13 en B-25: voornaam, roepnaam en achternaam worden alle
 * drie afgeschermd, en achternamen van één of twee letters worden overgeslagen
 * omdat die in gewone tekst meer valse treffers opleveren dan bescherming.
 */
describe("getMaskableNames", () => {
  it("neemt de voornaam mee", () => {
    expect(getMaskableNames(makeStudent())).toEqual(["Kjeld"]);
  });

  it("neemt de roepnaam mee — een leerkracht schrijft 'JP', niet 'Jan-Peter'", () => {
    const names = getMaskableNames(makeStudent({ firstName: "Jan-Peter", callName: "JP" }));

    expect(names).toContain("Jan-Peter");
    expect(names).toContain("JP");
  });

  it("neemt de achternaam mee, inclusief tussenvoegsel als geheel", () => {
    const names = getMaskableNames(makeStudent({ lastName: "de Vries" }));

    expect(names).toContain("de Vries");
  });

  it("slaat een achternaam van twee letters over", () => {
    const names = getMaskableNames(makeStudent({ lastName: "Li" }));

    expect(names).not.toContain("Li");
    expect(names).toContain("Kjeld");
  });

  it("houdt een korte voornaam wel", () => {
    // De uitzondering geldt alleen voor achternamen; een voornaam blijft.
    expect(getMaskableNames(makeStudent({ firstName: "Bo" }))).toContain("Bo");
  });

  it("negeert lege en witruimtevelden", () => {
    const names = getMaskableNames(makeStudent({ callName: "   ", lastName: "" }));

    expect(names).toEqual(["Kjeld"]);
  });
});

describe("getStudentFullName", () => {
  it("plakt voornaam en achternaam aan elkaar", () => {
    expect(getStudentFullName(makeStudent({ lastName: "de Vries" }))).toBe("Kjeld de Vries");
  });

  it("werkt zonder achternaam", () => {
    expect(getStudentFullName(makeStudent())).toBe("Kjeld");
  });
});
