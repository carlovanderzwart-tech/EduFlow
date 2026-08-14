/**
 * Toetsen op de stijlvoorbeelden (O-01, bijlage A.4, §15.6).
 *
 * Twee dingen worden hier bewaakt, en de eerste is de belangrijkste.
 *
 * **Geen naam van een echt kind.** Het aangeleverde materiaal kwam uit de praktijk
 * en bevatte de namen van echte kinderen en een echte groepsnaam. §15.6 en DR-33
 * laten die nergens toe, ook niet in een voorbeeld. Deze toets houdt vast dat de
 * vervanging blijft staan — een voorbeeld dat later "even" wordt bijgewerkt met de
 * oorspronkelijke tekst valt hier om.
 *
 * **De drie delen zijn er alle drie.** Zonder het derde deel kan de gouden testset
 * wel meten of de AI schrijft zoals de maker, maar niet of hij doorslaat
 * (FR-INS-16, D8 uit de review).
 */

import { describe, expect, it } from "vitest";

import { GROEP_4, GROEPEN } from "./testgegevens";
import { STIJLVOORBEELDEN } from "./stijlvoorbeelden";

/** Alle tekst van alle voorbeelden bij elkaar, om in één keer te doorzoeken. */
const ALLES = STIJLVOORBEELDEN.map(
  (voorbeeld) => `${voorbeeld.ruw}\n${voorbeeld.gewenst}\n${voorbeeld.doorgeschoten}`,
).join("\n");

describe("stijlvoorbeelden — O-01, bijlage A.4", () => {
  it("bestaat uit minstens één voorbeeld", () => {
    expect(STIJLVOORBEELDEN.length).toBeGreaterThanOrEqual(1);
  });

  it.each(STIJLVOORBEELDEN.map((v) => [v.id, v] as const))(
    "%s heeft alle drie de delen plus de reden (FR-INS-16)",
    (_id, voorbeeld) => {
      expect(voorbeeld.ruw.trim().length).toBeGreaterThan(0);
      expect(voorbeeld.gewenst.trim().length).toBeGreaterThan(0);
      expect(voorbeeld.doorgeschoten.trim().length).toBeGreaterThan(0);
      expect(voorbeeld.waarom.trim().length).toBeGreaterThan(0);
    },
  );

  it.each(STIJLVOORBEELDEN.map((v) => [v.id, v] as const))(
    "%s laat de doorgeschoten versie verschillen van de gewenste",
    (_id, voorbeeld) => {
      // Zijn ze gelijk, dan is er geen negatief geval en meet de testset niets.
      expect(voorbeeld.doorgeschoten).not.toBe(voorbeeld.gewenst);
    },
  );
});

describe("geen naam van een echt kind — §15.6, DR-33", () => {
  it("gebruikt alleen voornamen uit bijlage A", () => {
    const bekend = new Set(GROEP_4.map((kind) => kind.voornaam.split(" ")[0]!));

    // De namen die in het materiaal voorkomen, moeten alle drie uit bijlage A komen.
    for (const naam of ["Otis", "Pippa"]) {
      expect(bekend.has(naam), `${naam} staat niet in bijlage A`).toBe(true);
      expect(ALLES).toContain(naam);
    }
  });

  it("draagt de groepsnaam uit bijlage A en niet die van een echte school", () => {
    expect(ALLES).toContain(GROEPEN[0].naam);
  });

  it.each([
    ["Pipi", /\bPipi\b/iu],
    ["groep Geel", /groep\s+geel/iu],
  ])("bevat %s niet, want die kwam uit de praktijk", (_naam, patroon) => {
    expect(patroon.test(ALLES)).toBe(false);
  });
});
