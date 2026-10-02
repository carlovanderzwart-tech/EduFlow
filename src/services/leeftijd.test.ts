/**
 * Toetsen bij de leeftijd achter de naam (`FR-DOC-127`, `FR-AGE-24`, B-139).
 *
 * Het voorbeeld van de opdrachtgever staat er als eerste in: geboren op 2-9-2020
 * hoort `6,1` te zijn. De rest gaat over de randen waar een leeftijdsberekening
 * altijd op stukloopt — de dag vóór je verjaardag, de maand vóór je verjaardag, en
 * een geboortedatum zonder jaar.
 */

import { describe, expect, it } from "vitest";

import { leeftijdOp, leeftijdTekst, metLeeftijd } from "./students/leeftijd";

/** Geboren 2 september 2020, zoals in de feedback. */
const KIND = { birthDay: 2, birthMonth: 9, birthYear: 2020 };

function op(datum: string): Date {
  return new Date(`${datum}T12:00:00.000Z`);
}

describe("de leeftijd in jaren en maanden — FR-DOC-127, B-139", () => {
  it("rekent het voorbeeld uit de feedback uit (B-139)", () => {
    // 2 september 2020 tot 2 oktober 2026: zes jaar en één maand.
    expect(leeftijdOp(KIND, op("2026-10-02"))).toEqual({ jaren: 6, maanden: 1 });
    expect(leeftijdTekst({ jaren: 6, maanden: 1 })).toBe("6,1");
  });

  it("telt de maand pas als de dag voorbij is (B-139)", () => {
    expect(leeftijdOp(KIND, op("2026-10-01"))).toEqual({ jaren: 6, maanden: 0 });
    expect(leeftijdOp(KIND, op("2026-10-02"))).toEqual({ jaren: 6, maanden: 1 });
  });

  it("wordt op de verjaardag een jaar ouder en geen dag eerder (B-139)", () => {
    expect(leeftijdOp(KIND, op("2026-09-01"))).toEqual({ jaren: 5, maanden: 11 });
    expect(leeftijdOp(KIND, op("2026-09-02"))).toEqual({ jaren: 6, maanden: 0 });
  });

  it("telt elf maanden en niet een heel jaar bij elf maanden (B-139)", () => {
    expect(leeftijdTekst(leeftijdOp(KIND, op("2026-08-15"))!)).toBe("5,11");
  });

  it("geeft geen leeftijd zonder geboortejaar (FR-AGE-24)", () => {
    // §6.2.8: een geboortedatum mag dag en maand zijn. Dan is er geen leeftijd, en
    // dat is dataminimalisatie en geen gemis.
    expect(leeftijdOp({ birthDay: 2, birthMonth: 9, birthYear: null }, op("2026-10-02"))).toBeNull();
  });

  it("geeft geen leeftijd zonder dag of maand (FR-AGE-24)", () => {
    expect(leeftijdOp({ birthDay: null, birthMonth: 9, birthYear: 2020 }, op("2026-10-02"))).toBeNull();
    expect(leeftijdOp({ birthDay: 2, birthMonth: null, birthYear: 2020 }, op("2026-10-02"))).toBeNull();
  });

  it("geeft geen leeftijd bij een datum in de toekomst (B-139)", () => {
    // Een typefout in het jaartal hoort als "geen leeftijd" te verschijnen en niet
    // als een negatief getal.
    expect(leeftijdOp(KIND, op("2019-01-01"))).toBeNull();
  });

  it("zet de leeftijd achter de naam, of laat hem weg (FR-DOC-127)", () => {
    expect(metLeeftijd("Kjeld", KIND, op("2026-10-02"))).toBe("Kjeld 6,1");
    expect(metLeeftijd("Kjeld", { ...KIND, birthYear: null }, op("2026-10-02"))).toBe("Kjeld");
  });
});
