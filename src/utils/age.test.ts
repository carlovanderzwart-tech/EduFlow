import { describe, expect, it } from "vitest";

import { calculateAge, formatAge } from "./age";

/**
 * docs/archief/02 vraagt de leeftijd in jaren en maanden ("4 jaar en 1 maand"). docs/archief/04:
 * staat er geen geboortedatum, dan toont EduFlow niets — geen streepje, geen
 * schatting.
 */
describe("calculateAge", () => {
  const today = new Date(2026, 7, 5); // 5 augustus 2026

  it("rekent jaren en maanden uit", () => {
    expect(calculateAge("2022-07-04", today)).toEqual({ years: 4, months: 1 });
  });

  it("telt de maand pas als de dag is bereikt", () => {
    // Verjaardag is de 6e, vandaag is de 5e: de maand is nog niet vol.
    expect(calculateAge("2022-07-06", today)).toEqual({ years: 4, months: 0 });
  });

  it("rolt correct over het jaar", () => {
    // Geboren in september, dus nog geen jaar rond in augustus.
    expect(calculateAge("2025-09-10", today)).toEqual({ years: 0, months: 10 });
  });

  it("geeft nul maanden op de verjaardag zelf", () => {
    expect(calculateAge("2021-08-05", today)).toEqual({ years: 5, months: 0 });
  });

  it("weigert een onleesbare datum", () => {
    expect(calculateAge("niet-een-datum", today)).toBeNull();
    expect(calculateAge("2026-02-31", today)).toBeNull();
  });

  it("weigert een datum in de toekomst", () => {
    expect(calculateAge("2027-01-01", today)).toBeNull();
  });
});

describe("formatAge", () => {
  const today = new Date(2026, 7, 5);

  it("schrijft jaren en maanden uit", () => {
    expect(formatAge("2022-07-04", today)).toBe("4 jaar en 1 maand");
  });

  it("laat de maanden weg wanneer die nul zijn", () => {
    expect(formatAge("2021-08-05", today)).toBe("5 jaar");
  });

  it("toont alleen maanden onder het jaar", () => {
    expect(formatAge("2026-05-05", today)).toBe("3 maanden");
  });

  it("gebruikt enkelvoud waar dat hoort", () => {
    expect(formatAge("2025-07-05", today)).toBe("1 jaar en 1 maand");
  });

  it("toont niets zonder geboortedatum", () => {
    expect(formatAge(undefined, today)).toBe("");
    expect(formatAge("", today)).toBe("");
  });
});
