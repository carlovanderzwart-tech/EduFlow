/**
 * Toetsen bij FR-DOC-114 en B-40 — initialen in plaats van namen.
 *
 * Twee dingen worden hier bewaakt. Dat een botsing een oplopend cijfer krijgt met
 * een legenda, want zonder die legenda is een documentatie met twee K's niet te
 * volgen. En dat de vervanging op hele woorden gaat: "Sam" mag "Samen" niet
 * halveren, en dat is precies het soort fout dat pas opvalt als de mail al weg is.
 *
 * De namen komen uit bijlage A (§15.6, `testgegevens.ts`). Een echte naam staat
 * hier niet, ook niet als voorbeeld.
 */

import { describe, expect, it } from "vitest";

import { initialenkaart, vervangNamen } from "./initialen";

describe("de kaart — FR-DOC-114", () => {
  it("geeft elke naam zijn beginletter met een punt", () => {
    const kaart = initialenkaart(["Kjeld", "Pippa", "Otis"]);

    expect(kaart.vervanging.get("Kjeld")).toBe("K.");
    expect(kaart.vervanging.get("Pippa")).toBe("P.");
    expect(kaart.vervanging.get("Otis")).toBe("O.");
  });

  it("nummert een botsing oplopend (B-40)", () => {
    const kaart = initialenkaart(["Kjeld", "Kaya", "Noa B.", "Noa V."]);

    expect(kaart.vervanging.get("Kjeld")).toBe("K.");
    expect(kaart.vervanging.get("Kaya")).toBe("K2.");
    expect(kaart.vervanging.get("Noa B.")).toBe("N.");
    expect(kaart.vervanging.get("Noa V.")).toBe("N2.");
  });

  it("levert de legenda in de vorm van §5.12", () => {
    const kaart = initialenkaart(["Kjeld", "Kaya", "Noa B.", "Noa V."]);

    expect(kaart.legenda).toBe("K. = Kjeld · K2. = Kaya · N. = Noa B. · N2. = Noa V.");
  });

  it("laat de legenda weg als er niets botst (B-40)", () => {
    expect(initialenkaart(["Kjeld", "Pippa", "Otis"]).legenda).toBe("");
  });

  it("noemt in de legenda alleen de namen die botsen", () => {
    const kaart = initialenkaart(["Kjeld", "Kaya", "Pippa"]);

    expect(kaart.legenda).toBe("K. = Kjeld · K2. = Kaya");
    expect(kaart.legenda).not.toContain("Pippa");
  });

  it("blijft bij twee keer dezelfde lijst dezelfde kaart geven", () => {
    const namen = ["Kjeld", "Kaya", "Pippa"];

    expect(initialenkaart(namen).legenda).toBe(initialenkaart(namen).legenda);
  });

  it("slaat een lege naam over", () => {
    expect(initialenkaart(["", "   ", "Pippa"]).vervanging.size).toBe(1);
  });
});

describe("de vervanging in de tekst — FR-DOC-114", () => {
  it("vervangt een naam in de lopende tekst", () => {
    const kaart = initialenkaart(["Kjeld", "Pippa"]);

    expect(vervangNamen("Kjeld bouwde een brug en Pippa legde het laatste blok.", kaart)).toBe(
      "K. bouwde een brug en P. legde het laatste blok.",
    );
  });

  it("laat een woord dat een naam bevat met rust", () => {
    const kaart = initialenkaart(["Sam"]);

    expect(vervangNamen("Samen met Sam, in de samenwerking.", kaart)).toBe("Samen met S., in de samenwerking.");
  });

  it("vervangt de langste naam eerst, zodat een tussenvoegsel niet sneuvelt", () => {
    const kaart = initialenkaart(["Noa B.", "Noa V."]);

    expect(vervangNamen("Noa B. en Noa V. werkten samen.", kaart)).toBe("N. en N2. werkten samen.");
  });

  it("trekt zich niets aan van hoofdletters in de tekst", () => {
    const kaart = initialenkaart(["Pippa"]);

    expect(vervangNamen("PIPPA riep iets.", kaart)).toBe("P. riep iets.");
  });

  it("laat een tekst zonder namen ongemoeid", () => {
    const kaart = initialenkaart(["Kjeld"]);

    expect(vervangNamen("De kinderen bouwden een brug.", kaart)).toBe("De kinderen bouwden een brug.");
  });
});
