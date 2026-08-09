import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Lintregels van de bouwstraat.
 *
 * Drie van de elf controles uit §16.9 van de Product Bible zijn lintregels. Twee
 * daarvan staan hieronder en werken vandaag; de derde (DR-44, geen
 * persoonsgegevens naar een logfunctie) is typegebaseerd en wacht op de
 * domeintypen uit implementatiestap 3. Zie `scripts/gates/run.mjs` voor de stand
 * van alle elf.
 *
 * De regels gelden ook voor mappen die nog niet bestaan (`domain/`, `lib/`,
 * `services/storage/`). Dat is opzet: dan bijten ze zodra die mappen ontstaan.
 *
 * **Let op bij het uitbreiden.** In een flat config vervángt een later blok de
 * opties van dezelfde regel uit een eerder blok; ze worden niet samengevoegd.
 * Daarom herhaalt elk blok hieronder de opslagbeperking. Vergeet je dat, dan valt
 * die stilletjes weg voor de bestanden die het laatste blok raakt — precies het
 * soort gat dat je pas ontdekt als het misgaat.
 */

/** DR-13 — de opslaglaag is van `services/storage/` en van niemand anders. */
const OPSLAG_PADEN = [
  {
    name: "dexie",
    message: "DR-13: alleen services/storage/ raakt Dexie aan. Ga via StorageService.",
  },
  {
    name: "dexie-react-hooks",
    message:
      "DR-13: useLiveQuery hoort in een hook die een service aanroept, niet in een component.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Standaardnegeerlijst van eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Voortbrengselen van de bouwstraat:
    "playwright-report/**",
    "test-results/**",
  ]),

  {
    // Grondregel: nergens Dexie, behalve in de opslaglaag zelf.
    //
    // De tweede helft van DR-13, het verbod op `@/services/db`, kan pas bij
    // implementatiestap 4: die map bestaat nu nog en `StorageWarning.tsx`
    // importeert eruit. Die overtreding verdwijnt met de map.
    name: "eduflow/dr-13-opslaglaag",
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/storage/**"],
    rules: {
      "no-restricted-imports": ["error", { paths: OPSLAG_PADEN }],
    },
  },

  {
    // §10.2 — `modules/` importeert nooit uit een andere `modules/`-map.
    name: "eduflow/10-2-modules",
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: OPSLAG_PADEN,
          patterns: [
            {
              group: [
                "@/modules/*",
                "@/modules/**",
                "../../modules/*",
                "../../modules/**",
                "../../../modules/**",
              ],
              message:
                "§10.2: een module importeert nooit uit een andere module. Heeft het dashboard iets van documentaties nodig, dan komt dat uit de service.",
            },
          ],
        },
      ],
    },
  },

  {
    // §10.2 en DR-17 — een service weet niets van React, Next of schermen.
    // Dat is de voorwaarde om services te toetsen zonder browser (DR-12).
    name: "eduflow/10-2-services",
    files: ["src/services/**/*.ts"],
    ignores: ["src/services/**/*.test.ts", "src/services/storage/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...OPSLAG_PADEN,
            ...["react", "react-dom", "next"].map((name) => ({
              name,
              message:
                "DR-17: een service importeert geen React en geen Next. Anders is hij niet te toetsen zonder browser (DR-12).",
            })),
          ],
          patterns: [
            {
              group: ["next/*", "@/modules/*", "@/modules/**", "@/components/**"],
              message:
                "DR-17: een service importeert niets uit de schermlaag. Regels horen in de service, schermen roepen hem aan.",
            },
          ],
        },
      ],
    },
  },

  {
    // §10.2 — de opslaglaag mag Dexie wél, maar verder gelden dezelfde laagregels.
    name: "eduflow/10-2-storage",
    files: ["src/services/storage/**/*.ts"],
    ignores: ["src/services/storage/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-dom", "next"].map((name) => ({
            name,
            message:
              "DR-17: een service importeert geen React en geen Next. Anders is hij niet te toetsen zonder browser (DR-12).",
          })),
          patterns: [
            {
              group: ["next/*", "@/modules/*", "@/modules/**", "@/components/**"],
              message: "DR-17: een service importeert niets uit de schermlaag.",
            },
          ],
        },
      ],
    },
  },

  {
    // §10.2 — `domain/` mag alleen uit `lib/` importeren. De map bestaat nog niet;
    // de regel staat klaar voor implementatiestap 3.
    name: "eduflow/10-2-domain",
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: OPSLAG_PADEN,
          patterns: [
            {
              group: ["@/services/**", "@/modules/**", "@/components/**", "@/app/**"],
              message: "§10.2: domain/ importeert alleen uit lib/.",
            },
          ],
        },
      ],
    },
  },

  {
    // §10.2 — `lib/` importeert niets uit dit project. Wacht op stap 2.
    name: "eduflow/10-2-lib",
    files: ["src/lib/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: OPSLAG_PADEN,
          patterns: [
            {
              group: ["@/**"],
              message:
                "§10.2: lib/ is gereedschap zonder domeinkennis en importeert niets uit dit project.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
