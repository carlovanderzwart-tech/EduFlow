import { defineConfig } from "vitest/config";

/**
 * Doc 99 schrijft `npm test` voor als poort vóór iedere Pull Request. Deze
 * opzet is het minimum dat daarvoor nodig is: componenten renderen in jsdom.
 *
 * Geen React-plugin: Vitest zet JSX zelf om via esbuild op basis van
 * `jsx: "react-jsx"` in tsconfig. Dat scheelt een afhankelijkheid die met de
 * Babel-versie van shadcn botst.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
