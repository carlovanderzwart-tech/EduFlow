/**
 * Toetsen op het zetten van tekst (§5.10.1, §5.10.7 regel 3).
 *
 * De belangrijkste is de laatste: wat er niet op past wordt teruggegeven en niet
 * weggegooid. Stil afkappen levert een documentatie op waarvan de maker denkt dat
 * hij hem heeft verstuurd, terwijl de helft van zijn tekst nergens meer staat.
 */

import { describe, expect, it } from "vitest";

import { MM_PER_PUNT, zet, type Tekstmeter } from "./tekstzetten";

/** Elke letter een halve puntgrootte breed. */
const meet: Tekstmeter = (tekst, punt) => tekst.length * punt * MM_PER_PUNT * 0.5;

/** Een vlak dat ruim genoeg is om niets af te kappen. */
const RUIM = { breedte: 88, hoogte: 66, punt: 11, regelhoogte: 16.5, gewicht: 400, meet };

describe("regels breken", () => {
  it("breekt op woordgrenzen en niet midden in een woord", () => {
    const { regels } = zet({ ...RUIM, tekst: "De kinderen gingen in de berm op zoek naar hun eigen kleur." });

    expect(regels.length).toBeGreaterThan(1);
    for (const regel of regels) expect(regel.tekst).not.toMatch(/^\s|\s$/u);
    expect(regels.map((regel) => regel.tekst).join(" ")).toBe(
      "De kinderen gingen in de berm op zoek naar hun eigen kleur.",
    );
  });

  it("houdt een alineagrens vast", () => {
    const { regels } = zet({ ...RUIM, tekst: "Eerst dit.\n\nDaarna dat." });

    expect(regels.map((regel) => regel.tekst)).toEqual(["Eerst dit.", "", "Daarna dat."]);
  });

  it("zet een woord dat op zichzelf te breed is toch neer", () => {
    const { regels } = zet({ ...RUIM, tekst: "a".repeat(200) });

    expect(regels).toHaveLength(1);
    expect(regels[0]!.tekst).toHaveLength(200);
  });

  it("zet de basislijnen op de regelhoogte uit §5.10.1", () => {
    const { regels } = zet({ ...RUIM, tekst: "een twee drie vier vijf zes zeven acht negen tien elf" });
    const regelhoogteMm = 16.5 * MM_PER_PUNT;

    expect(regels[1]!.y - regels[0]!.y).toBeCloseTo(regelhoogteMm, 6);
  });

  it("houdt de eerste basislijn binnen het vlak", () => {
    const { regels } = zet({ ...RUIM, tekst: "een regel" });

    expect(regels[0]!.y).toBeGreaterThan(0);
    expect(regels[0]!.y).toBeLessThan(16.5 * MM_PER_PUNT);
  });
});

describe("wat er niet op past — §5.10.7 regel 3", () => {
  it("geeft de rest terug in plaats van hem af te kappen", () => {
    const { regels, rest } = zet({ ...RUIM, hoogte: 12, tekst: "woord ".repeat(100) });

    expect(regels.length).toBeGreaterThan(0);
    expect(rest).not.toBe("");
    expect(`${regels.map((regel) => regel.tekst).join(" ")} ${rest}`.split(/\s+/u).filter(Boolean)).toHaveLength(100);
  });

  it("geeft niets terug als alles erop staat", () => {
    expect(zet({ ...RUIM, tekst: "kort" }).rest).toBe("");
  });

  it("zet niets neer in een vlak zonder hoogte", () => {
    const { regels, rest } = zet({ ...RUIM, hoogte: 0, tekst: "iets" });

    expect(regels).toEqual([]);
    expect(rest).toBe("iets");
  });
});
