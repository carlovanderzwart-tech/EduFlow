/**
 * Bewijst dat de lintregel achter DR-44 werkt (poort 1 van §16.9).
 *
 * Een lintregel die in de configuratie staat maar niets tegenhoudt, is erger dan
 * geen lintregel: hij wekt de indruk dat er iets bewaakt wordt. Deze toets laat
 * ESLint los op een bestand dat de regel met opzet zeven keer overtreedt, en op
 * twee regels die er juist doorheen horen te komen.
 */

import { readFileSync } from "node:fs";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const OVERTREDING = "src/domain/__fixtures__/dr-44-overtreding.ts";
const REGEL = "eduflow/dr-44-geen-record-in-logregel";

/**
 * Het regelnummer waarop een functie in het toetsbestand begint.
 *
 * Liever dit dan een vast getal: verschuift het toetsbestand, dan verschuift de
 * grens mee in plaats van dat de toets stilletjes iets anders gaat meten.
 */
function eersteRegelVan(functienaam: string): number {
  const regels = readFileSync(OVERTREDING, "utf8").split(/\r?\n/);
  const index = regels.findIndex((regel) => regel.includes(`function ${functienaam}`));
  if (index < 0) throw new Error(`${functienaam} staat niet in ${OVERTREDING}`);
  return index + 1;
}

async function lint(pad: string) {
  // `ignore: false` omdat het toetsbestand in `globalIgnores` staat; anders zou
  // `pnpm lint` er permanent over vallen.
  const eslint = new ESLint({ ignore: false });
  const [uitkomst] = await eslint.lintFiles([pad]);
  return uitkomst?.messages ?? [];
}

describe("DR-44 — geen persoonsgegevens naar een logfunctie", () => {
  it("houdt alle zes de verboden typen tegen", async () => {
    const meldingen = await lint(OVERTREDING);
    const treffers = meldingen.filter((melding) => melding.ruleId === REGEL);

    const genoemd = treffers.map((treffer) => treffer.message).join(" ");
    for (const typenaam of ["Documentation", "Student", "Page", "Block", "MailMessage", "MailDraft"]) {
      expect(genoemd).toContain(typenaam);
    }
  }, 60_000);

  it("telt zeven overtredingen, inclusief de lijst van documentaties", async () => {
    // Een `Documentation[]` draagt evenveel persoonsgegevens als één record.
    const meldingen = await lint(OVERTREDING);

    expect(meldingen.filter((melding) => melding.ruleId === REGEL)).toHaveLength(7);
  }, 60_000);

  it("laat een sleutel en een telling met rust", async () => {
    // Zonder deze toets zou een regel die álles tegenhoudt ook slagen, en dan is
    // er geen manier meer om iets te loggen bij een storing.
    const meldingen = await lint(OVERTREDING);
    const regels = meldingen
      .filter((melding) => melding.ruleId === REGEL)
      .map((melding) => melding.line);

    // Zonder deze eerste eis is de rest van de toets leeg zodra de regel uit
    // staat: een lege lijst overtreedt namelijk niets.
    expect(regels).not.toHaveLength(0);
    expect(Math.max(...regels)).toBeLessThan(eersteRegelVan("magWel"));
  }, 60_000);
});
