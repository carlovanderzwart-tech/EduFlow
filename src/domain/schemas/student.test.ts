import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { leerling } from "../toetsgegevens";
import { zStudent } from "./student";

describe("zStudent — §8.3.1", () => {
  it("laat een geldige leerling door", () => {
    expect(zStudent.safeParse(leerling()).success).toBe(true);
  });

  it("weigert een voornaam met een cijfer erin", () => {
    expect(zStudent.safeParse({ ...leerling(), firstName: "Kjeld2" }).success).toBe(false);
  });

  it("weigert een lege voornaam", () => {
    expect(zStudent.safeParse({ ...leerling(), firstName: "" }).success).toBe(false);
  });

  it("weigert een voornaam boven veertig tekens", () => {
    expect(zStudent.safeParse({ ...leerling(), firstName: "a".repeat(41) }).success).toBe(false);
  });

  it("weigert hoofdletters in `firstNameLower`", () => {
    expect(zStudent.safeParse({ ...leerling(), firstNameLower: "Kjeld" }).success).toBe(false);
  });

  it("behoudt diakrieten in `firstNameLower`", () => {
    // §8.5 zegt uitdrukkelijk "diakrieten behouden". Het wegvouwen gebeurt pas
    // bij het zoeken in PrivacyService (§12.5), niet in de opslag.
    const hanae = { ...leerling(), firstName: "Hanaë", firstNameLower: "hanaë" };

    expect(zStudent.safeParse(hanae).success).toBe(true);
  });

  it("weigert een geboortedag buiten de maand", () => {
    expect(zStudent.safeParse({ ...leerling(), birthDay: 32 }).success).toBe(false);
    expect(zStudent.safeParse({ ...leerling(), birthMonth: 13 }).success).toBe(false);
  });

  it("laat een geboortedatum zonder jaar toe (T-21)", () => {
    expect(zStudent.safeParse({ ...leerling(), birthYear: null }).success).toBe(true);
  });

  it("weigert een notitie boven vijfhonderd tekens", () => {
    expect(zStudent.safeParse({ ...leerling(), note: "a".repeat(501) }).success).toBe(false);
  });
});

describe("INV-23 — een leerling heeft geen groep", () => {
  it("weigert een `groupId` op een leerling", () => {
    // Dit is de invariant waar U-07 en B-16 op staan. Zonder `strict` zou het
    // veld er stilzwijgend bij kunnen komen en zou het hele meerdere-groepen-
    // ontwerp langzaam terugvallen op één groep per kind.
    const metGroep = { ...leerling(), groupId: newId() };

    expect(zStudent.safeParse(metGroep).success).toBe(false);
  });

  it("weigert ook een `groupIds` op een leerling", () => {
    const metGroepen = { ...leerling(), groupIds: [newId()] };

    expect(zStudent.safeParse(metGroepen).success).toBe(false);
  });

  it("noemt het veld dat geweigerd wordt, zodat de fout te vinden is", () => {
    const uitkomst = zStudent.safeParse({ ...leerling(), groupId: newId() });

    if (uitkomst.success) throw new Error("hoort te falen");
    expect(JSON.stringify(uitkomst.error.issues)).toContain("groupId");
  });
});
