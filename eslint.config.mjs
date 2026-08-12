import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import eduflowRegels from "./eslint-rules/dr-44-geen-record-in-logregel.mjs";

/**
 * Lintregels van de bouwstraat.
 *
 * Dit bestand maakt de regels uit hoofdstuk 20 afdwingbaar in plaats van
 * afgesproken. Een overtreding faalt de bouwstraat (DR-11). Elke regel hieronder
 * heeft zijn DR-nummer erbij; verwijder er nooit een zonder een besluit (DR-04).
 *
 * Drie van de elf controles uit §16.9 zijn lintregels. Zie `scripts/gates/run.mjs`
 * voor de stand van alle elf.
 *
 * **T-42 — geen getypte lintcontrole.** `recommendedTypeChecked` staat bewust uit
 * en `eslint-config-next` staat er bewust in. Een codebase van 35 pull requests
 * voor het eerst getypt linten is een eigen project; met 48 rode meldingen als
 * vertrekpunt is "lint is groen" geen poort meer. Getypte controle komt in
 * sprint 6, samen met NFR-47. Wat géén typeinformatie nodig heeft, blijft wél op
 * `error`: DR-21, DR-22, de zones van DR-11 en `no-restricted-syntax`.
 *
 * `projectService` staat daarom op precies één plek aan: het DR-44-blok onderaan,
 * dat typen nodig heeft. Zou het globaal staan, dan valt elk `.mjs`-bestand buiten
 * `tsconfig.json` om met een parseerfout.
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
  {
    name: "@/services/db",
    message: "DR-13: de oude opslaglaag is weg. Ga via StorageService.",
  },
  {
    name: "idb",
    message: "T-45: `idb` is verdwenen met de oude opslaglaag. De opslag staat op Dexie.",
  },
];

const eslintConfig = defineConfig([
  js.configs.recommended,
  // T-42: `recommended`, niet `recommendedTypeChecked`.
  ...tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Standaardnegeerlijst van eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Voortbrengselen van de bouwstraat:
    "node_modules/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    // Het handboek is geen code.
    "docs/**",
    // Toetsmateriaal dat met opzet een regel overtreedt. `dr-44.test.ts` lint dit
    // bestand zelf, mét `ignore: false`, en telt de fouten. Zou `pnpm lint` het
    // meenemen, dan was de bouwstraat altijd rood.
    "src/domain/__fixtures__/**",
  ]),

  {
    // DR-11 — de lagen uit §10.2, als zones in plaats van als patronen.
    //
    //   modules/  → services, domain, ui, lib
    //   services/ → domain, lib, andere services
    //   domain/   → lib
    //   ui/       → lib
    //   lib/      → niets uit dit project
    //
    // De zones noemen de doelstructuur van §10.2 en niet de huidige mappen. Zolang
    // `components/` en `hooks/` bestaan, grijpen ze daar niet op aan. Dat is bekend
    // en het blijft op `error`: het getal loopt tijdens elke D00-verplaatsing
    // tijdelijk op en staat aan het eind van die stap weer op nul. Zie de correctie
    // op D00 stap 3 in docs/BESLUITEN.md.
    name: "eduflow/dr-11-zones",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "./src",
          zones: [
            // modules/ importeert nooit uit een andere modules/-map.
            { target: "./modules/dashboard", from: "./modules", except: ["./dashboard"] },
            { target: "./modules/documentaties", from: "./modules", except: ["./documentaties"] },
            { target: "./modules/agenda", from: "./modules", except: ["./agenda"] },
            { target: "./modules/mail", from: "./modules", except: ["./mail"] },
            { target: "./modules/instellingen", from: "./modules", except: ["./instellingen"] },

            // DR-17 — geen service kent een scherm.
            {
              target: "./services",
              from: "./modules",
              message:
                "DR-17: een service importeert nooit uit modules/. Draai de afhankelijkheid om.",
            },
            {
              target: "./services",
              from: "./ui",
              message: "DR-17: een service kent het ontwerpsysteem niet.",
            },
            { target: "./services", from: "./app", message: "DR-17: een service kent Next.js niet." },

            // domain/ en ui/ zijn bladeren: alleen lib/.
            {
              target: "./domain",
              from: "./services",
              message: "§10.2: domain/ mag alleen uit lib/ importeren.",
            },
            { target: "./domain", from: "./modules" },
            { target: "./domain", from: "./ui" },
            { target: "./domain", from: "./app" },
            {
              target: "./ui",
              from: "./services",
              message:
                "§10.2: ui/ mag alleen uit lib/ importeren. Een component haalt geen gegevens op.",
            },
            { target: "./ui", from: "./modules" },
            { target: "./ui", from: "./domain" },
            { target: "./ui", from: "./app" },

            // lib/ importeert niets uit dit project.
            { target: "./lib", from: "./services" },
            { target: "./lib", from: "./domain" },
            { target: "./lib", from: "./modules" },
            { target: "./lib", from: "./ui" },
            { target: "./lib", from: "./app" },

            // DR-13 — alleen services/storage/ raakt de database aan.
            {
              target: "./modules",
              from: "./services/storage/db.ts",
              message: "DR-13: niemand buiten services/storage/ raakt db aan. Ook niet 'even snel'.",
            },
          ],
        },
      ],
    },
  },

  {
    // Grondregel: nergens Dexie, behalve in de opslaglaag zelf.
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
    // §10.2 — `domain/` mag alleen uit `lib/` importeren.
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
    // §10.2 — `lib/` importeert niets uit dit project.
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

  {
    // DR-21, DR-22 — typen. Geen van beide heeft typeinformatie nodig, dus ze
    // blijven op `error` ondanks T-42.
    //
    // DR-37 — nooit ruwe HTML in het scherm. Mail wordt ontdaan van opmaak.
    // DR-42 — nergens een verwijzing naar een verzendeindpunt (B-20).
    // DR-32 — geen beeldgegeven richting /api/ai.
    //
    // DR-53 — omvang. Een waarschuwing bij 400/60 zoals NFR-44 het stelt; op
    // `error` zodra de doorloop staat.
    name: "eduflow/dr-21-22-32-37-42-53",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 10,
        },
      ],
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            "DR-37: gebruik nooit dangerouslySetInnerHTML. Ontdoe mail-HTML van opmaak vóór weergave.",
        },
        {
          selector: "Literal[value=/messages\\/send|sendMail|gmail\\.send|Mail\\.Send/]",
          message:
            "DR-42 / B-20: EduFlow vraagt geen verzendrecht aan en verwijst nergens naar een verzendeindpunt.",
        },
        {
          selector: "Identifier[name=/^(sendMail|sendMessage|sendEmail)$/]",
          message:
            "DR-42 / B-20: er is geen verzendpad. Versturen doet de gebruiker in zijn eigen mailprogramma.",
        },
      ],
    },
  },

  {
    // DR-16 — alleen AIService raakt /api/ai aan, alleen MailService /api/mail.
    // Dit vangt het grove geval; de fijne controle is de toets uit D04.
    //
    // Herhaalt `no-restricted-syntax` uit het blok hierboven, want een later blok
    // vervángt die opties — zie de waarschuwing bovenaan.
    name: "eduflow/dr-16-api",
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/ai/**", "src/services/mail/**", "src/app/api/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            "DR-37: gebruik nooit dangerouslySetInnerHTML. Ontdoe mail-HTML van opmaak vóór weergave.",
        },
        {
          selector: "Literal[value=/messages\\/send|sendMail|gmail\\.send|Mail\\.Send/]",
          message:
            "DR-42 / B-20: EduFlow vraagt geen verzendrecht aan en verwijst nergens naar een verzendeindpunt.",
        },
        {
          selector: "Identifier[name=/^(sendMail|sendMessage|sendEmail)$/]",
          message:
            "DR-42 / B-20: er is geen verzendpad. Versturen doet de gebruiker in zijn eigen mailprogramma.",
        },
        {
          selector: "Literal[value=/^\\/api\\/(ai|mail)/]",
          message: "DR-16: alleen AIService roept /api/ai aan, alleen MailService /api/mail.",
        },
      ],
    },
  },

  {
    // Toetsen mogen langer zijn dan 400 regels: een gouden testset is een lijst.
    name: "eduflow/toetsen",
    files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**"],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },

  {
    // DR-44 — geen persoonsgegevens naar een logfunctie.
    //
    // Deze regel heeft typeinformatie nodig en zet daarom `projectService` aan.
    // Dat is de enige plek waar dat gebeurt: typegericht linten is trager, het is
    // alleen hier nodig, en globaal aanzetten laat elk .mjs-bestand buiten
    // tsconfig.json met een parseerfout omvallen (T-42).
    //
    // Dit blok stelt met opzet géén `no-restricted-imports` in. Zou het dat wel
    // doen, dan verving het de opties van de blokken hierboven voor elk bestand
    // dat het raakt — zie de waarschuwing bovenaan dit bestand.
    name: "eduflow/dr-44-logregel",
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { eduflow: eduflowRegels },
    rules: {
      "eduflow/dr-44-geen-record-in-logregel": "error",
    },
  },
]);

export default eslintConfig;
