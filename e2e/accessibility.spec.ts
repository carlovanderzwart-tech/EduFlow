import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { expect, test, type Page } from "@playwright/test";

/**
 * Controle 7 van de elf uit §16.9: `axe-core` op elk scherm, faalt bij een
 * overtreding van WCAG 2.2 AA (NFR-30).
 *
 * `axe-core` wordt rechtstreeks in de pagina geïnjecteerd in plaats van via een
 * koppelpakket. Reden: T-45 en §16.8 staan `axe-core` toe en noemen geen
 * `@axe-core/playwright`; een koppelpakket zou een nieuw `T-`besluit vragen
 * (DR-18). De injectie hieronder is het hele verschil.
 */

// Playwright vertaalt deze spec naar CommonJS, dus `import.meta` bestaat hier niet.
// `__filename` wél; die is het ankerpunt voor het opzoeken van axe-core.
const AXE_BRON = createRequire(pathToFileURL(__filename)).resolve("axe-core/axe.min.js");

/** De niveaus die samen WCAG 2.2 AA vormen, zoals axe-core ze benoemt. */
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * De schermen die vandaag bestaan.
 *
 * Het schermenregister in §11.4 kent dertien schermen op Nederlandse routes
 * (S-01 t/m S-13). De routes hieronder zijn de Engelse die er nu staan; het
 * omzetten daarvan hoort bij implementatiestap 15 en niet bij de bouwstraat.
 * Elk nieuw scherm hoort in deze lijst — dat is wat "op elk scherm" betekent.
 */
const SCHERMEN = [
  { naam: "dashboard", pad: "/" },
  { naam: "overzicht documentaties", pad: "/documentaties" },
  { naam: "schrijfscherm", pad: "/documentaties/nieuw" },
  { naam: "agenda", pad: "/agenda" },
  { naam: "mail", pad: "/mail" },
  { naam: "instellingen", pad: "/instellingen" },
  { naam: "leerlingen", pad: "/instellingen/leerlingen" },
];

interface AxeOvertreding {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

async function meetToegankelijkheid(page: Page): Promise<AxeOvertreding[]> {
  await page.addScriptTag({ path: AXE_BRON });

  return page.evaluate(async (tags) => {
    const axe = (window as unknown as { axe: { run: (ctx: Document, opts: unknown) => Promise<{ violations: AxeOvertreding[] }> } }).axe;
    const uitkomst = await axe.run(document, { runOnly: { type: "tag", values: tags } });
    return uitkomst.violations;
  }, WCAG_22_AA);
}

/** Maakt van een overtreding één leesbare regel, zodat de bouwstraat bruikbaar faalt. */
function beschrijf(overtreding: AxeOvertreding): string {
  const plekken = overtreding.nodes
    .slice(0, 3)
    .map((node) => node.target.join(" "))
    .join(" · ");
  return `${overtreding.id} (${overtreding.impact ?? "onbekend"}): ${overtreding.help} — ${plekken}`;
}

for (const scherm of SCHERMEN) {
  test(`${scherm.naam} voldoet aan WCAG 2.2 AA`, async ({ page }) => {
    const antwoord = await page.goto(scherm.pad, { waitUntil: "networkidle" });
    expect(antwoord?.status(), `${scherm.pad} moet laden`).toBeLessThan(400);

    const overtredingen = await meetToegankelijkheid(page);

    expect(overtredingen.map(beschrijf), `${scherm.naam} (${scherm.pad})`).toEqual([]);
  });
}
