import { defineConfig, devices } from "@playwright/test";

/**
 * Schermtoetsen van de bouwstraat.
 *
 * §11.6 en NFR-30 vragen `axe-core` op elk scherm, draaiend in Playwright, en de
 * bouw faalt bij een overtreding van WCAG 2.2 AA. Dat is controle 7 van de elf
 * uit §16.9.
 *
 * De toetsen draaien tegen een productiebouw en niet tegen `next dev`. Een
 * ontwikkelserver voegt overlays en meldingen toe die er in productie niet zijn,
 * en die zou axe meewegen.
 */

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      // De referentielaptop uit §17.1: 1440 × 900, Chrome.
      name: "laptop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    // Via `corepack` en niet via `pnpm`: corepack hoort bij Node en staat dus
    // altijd op het pad, ook op een machine waar pnpm nooit globaal is
    // geïnstalleerd. Dat scheelt een installatiestap in het leesmij-bestand.
    command: `corepack pnpm build && corepack pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
