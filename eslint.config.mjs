// EduFlow — bouwstraatregels
//
// Dit bestand maakt de regels uit hoofdstuk 20 afdwingbaar in plaats van
// afgesproken. Een overtreding faalt de bouwstraat (DR-11). Elke regel hieronder
// heeft zijn DR-nummer erbij; verwijder er nooit een zonder een besluit (DR-04).
//
// Vereist: eslint@9, typescript-eslint, eslint-plugin-import,
//          eslint-plugin-boundaries is bewust NIET gebruikt — één afhankelijkheid
//          minder, en import/no-restricted-paths doet precies genoeg (DR-18).

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["node_modules/**", ".next/**", "coverage/**", "docs/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      // ------------------------------------------------------------------
      // DR-11 — de lagen uit §10.2. Van links mag je alleen naar rechts.
      //
      //   modules/  → services, domain, ui, lib
      //   services/ → domain, lib, andere services
      //   domain/   → lib
      //   ui/       → lib
      //   lib/      → niets uit dit project
      // ------------------------------------------------------------------
      "import/no-restricted-paths": ["error", {
        basePath: "./src",
        zones: [
          // modules/ importeert nooit uit een andere modules/-map.
          // Heeft het dashboard iets van documentaties nodig, dan komt dat uit
          // DocumentationService — niet uit modules/documentaties/.
          { target: "./modules/dashboard",     from: "./modules", except: ["./dashboard"] },
          { target: "./modules/documentaties", from: "./modules", except: ["./documentaties"] },
          { target: "./modules/agenda",        from: "./modules", except: ["./agenda"] },
          { target: "./modules/mail",          from: "./modules", except: ["./mail"] },
          { target: "./modules/instellingen",  from: "./modules", except: ["./instellingen"] },

          // DR-17 — geen service kent een scherm.
          { target: "./services", from: "./modules",
            message: "DR-17: een service importeert nooit uit modules/. Draai de afhankelijkheid om." },
          { target: "./services", from: "./ui",
            message: "DR-17: een service kent het ontwerpsysteem niet." },
          { target: "./services", from: "./app",
            message: "DR-17: een service kent Next.js niet." },

          // domain/ en ui/ zijn bladeren: alleen lib/.
          { target: "./domain", from: "./services",
            message: "§10.2: domain/ mag alleen uit lib/ importeren." },
          { target: "./domain", from: "./modules" },
          { target: "./domain", from: "./ui" },
          { target: "./domain", from: "./app" },
          { target: "./ui", from: "./services",
            message: "§10.2: ui/ mag alleen uit lib/ importeren. Een component haalt geen gegevens op." },
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
          { target: "./modules", from: "./services/storage/db.ts",
            message: "DR-13: niemand buiten services/storage/ raakt db aan. Ook niet 'even snel'." },
        ],
      }],

      // DR-13 — Dexie zelf mag alleen in services/storage/ voorkomen.
      "no-restricted-imports": ["error", {
        paths: [
          { name: "dexie", message: "DR-13: Dexie hoort uitsluitend in services/storage/." },
          { name: "dexie-react-hooks", message: "DR-13: useLiveQuery hoort in modules/, via een hook uit services/storage/." },
        ],
      }],

      // ------------------------------------------------------------------
      // DR-21, DR-22 — typen
      // ------------------------------------------------------------------
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-ignore": true,
        "ts-expect-error": "allow-with-description",
        minimumDescriptionLength: 10,
      }],
      "@typescript-eslint/consistent-type-assertions": ["error", {
        assertionStyle: "as", objectLiteralTypeAssertions: "never",
      }],

      // ------------------------------------------------------------------
      // DR-53 — omvang. Een waarschuwing bij 400/60 zoals NFR-44 het stelt;
      // zet op "error" zodra de doorloop staat.
      // ------------------------------------------------------------------
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],

      // ------------------------------------------------------------------
      // DR-37 — nooit ruwe HTML in het scherm. Mail wordt ontdaan van opmaak.
      // DR-42 — nergens een verwijzing naar een verzendeindpunt (B-20).
      // DR-32 — geen beeldgegeven richting /api/ai.
      // ------------------------------------------------------------------
      "no-restricted-syntax": ["error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "DR-37: gebruik nooit dangerouslySetInnerHTML. Ontdoe mail-HTML van opmaak vóór weergave.",
        },
        {
          selector: "Literal[value=/messages\\/send|sendMail|gmail\\.send|Mail\\.Send/]",
          message: "DR-42 / B-20: EduFlow vraagt geen verzendrecht aan en verwijst nergens naar een verzendeindpunt.",
        },
        {
          selector: "Identifier[name=/^(sendMail|sendMessage|sendEmail)$/]",
          message: "DR-42 / B-20: er is geen verzendpad. Versturen doet de gebruiker in zijn eigen mailprogramma.",
        },
      ],
    },
  },

  // ------------------------------------------------------------------
  // Uitzonderingen, elk met de reden erbij.
  // ------------------------------------------------------------------
  {
    // services/storage/ is de enige plek die Dexie kent (DR-13).
    files: ["src/services/storage/**"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // Schermen mogen useLiveQuery gebruiken — dat is de bron van waarheid (U-02),
    // maar uitsluitend via een hook die uit services/storage/ komt.
    files: ["src/modules/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "dexie", message: "DR-13: Dexie hoort uitsluitend in services/storage/." }],
      }],
    },
  },
  {
    // Alleen AIService raakt /api/ai aan, alleen MailService /api/mail (DR-16).
    // Dit vangt het grove geval; de fijne controle is de toets uit D04.
    files: ["src/**"],
    ignores: ["src/services/ai/**", "src/services/mail/**", "src/app/api/**"],
    rules: {
      "no-restricted-syntax": ["error", {
        selector: "Literal[value=/^\\/api\\/(ai|mail)/]",
        message: "DR-16: alleen AIService roept /api/ai aan, alleen MailService /api/mail.",
      }],
    },
  },
  {
    // Toetsen mogen langer zijn dan 400 regels: een gouden testset is een lijst.
    files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**"],
    rules: { "max-lines": "off", "max-lines-per-function": "off" },
  },
);
