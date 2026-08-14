#!/usr/bin/env node
/**
 * De elf poorten van de bouwstraat (§16.9 van de Product Bible).
 *
 * Elke poort heeft precies één van twee standen:
 *
 *   ACTIEF  — de controle draait nu en kan de bouw laten falen.
 *   WACHT   — de controle kan nog niet draaien omdat het onderdeel dat hij
 *             bewaakt pas bij een latere implementatiestap ontstaat.
 *
 * Een wachtende poort is geen belofte maar een grendel. Elke wachtende poort
 * heeft een `voorwaarde()`: zodra het onderdeel dat hij bewaakt bestaat, faalt
 * de poort met de melding dat hij nu geïmplementeerd moet worden. Zo kan een
 * poort niet stilzwijgend blijven wachten nadat zijn onderwerp is gebouwd — dat
 * is precies hoe een bouwstraat langzaam betekenisloos wordt.
 *
 * Gebruik:
 *   node scripts/gates/run.mjs              alle poorten
 *   node scripts/gates/run.mjs <id>         één poort
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { bestaat, bronbestanden, lees, mislukt, ok, WORTEL, zoek } from "./hulp.mjs";

const isCI = Boolean(process.env.CI);

/* ---------------------------------------------------------------- poorten -- */

const POORTEN = [
  {
    nummer: 1,
    id: "log-persoonsgegevens",
    naam: "Lintregel: geen persoonsgegevens naar een logfunctie",
    bron: "DR-44",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm lint en pnpm test",
    run: () => {
      const regelbestand = "eslint-rules/dr-44-geen-record-in-logregel.mjs";
      if (!bestaat(regelbestand)) {
        return mislukt(`De lintregel ontbreekt: ${regelbestand}.`);
      }

      const config = lees("eslint.config.mjs");
      if (!config.includes('"eduflow/dr-44-geen-record-in-logregel": "error"')) {
        return mislukt("De lintregel staat niet op `error` in eslint.config.mjs.");
      }
      // Zonder typeinformatie kijkt de regel naar niets en meldt hij niets.
      if (!config.includes("projectService")) {
        return mislukt("Typegericht linten staat uit; DR-44 kijkt dan naar geen enkel type.");
      }

      // Zes typen uit DR-44 plus de vier blokvarianten waaruit `Block` bestaat.
      const regel = lees(regelbestand);
      const ontbreekt = ["Documentation", "Student", "Page", "Block", "MailMessage", "MailDraft"] //
        .filter((typenaam) => !regel.includes(`"${typenaam}"`));
      if (ontbreekt.length) {
        return mislukt(`De regel kent deze typen uit DR-44 niet: ${ontbreekt.join(", ")}.`);
      }

      if (!bestaat("src/domain/dr-44.test.ts")) {
        return mislukt("De toets die bewijst dat de regel bijt ontbreekt: src/domain/dr-44.test.ts.");
      }

      return ok("Zes typen verboden in een logregel, typegericht afgedwongen en met een toets erop.");
    },
  },

  {
    nummer: 2,
    id: "dexie-buiten-opslag",
    naam: "Lintregel: geen rechtstreekse toegang tot Dexie buiten StorageService",
    bron: "DR-13",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm lint",
    run: () => {
      const config = lees("eslint.config.mjs");
      if (!config.includes("eduflow/dr-13-opslaglaag")) {
        return mislukt("Het lintblok eduflow/dr-13-opslaglaag ontbreekt in eslint.config.mjs.");
      }
      // Tweede helft van DR-13: het verbod op @/services/db kan pas als die map weg is.
      const restant = zoek(bronbestanden("src"), /@\/services\/db/);
      const staart = restant.length
        ? ` Nog ${restant.length} verwijzing(en) naar @/services/db; die verdwijnen bij stap 4.`
        : "";
      return ok(`Dexie verboden buiten services/storage/, afgedwongen in pnpm lint.${staart}`);
    },
  },

  {
    nummer: 3,
    id: "importregels",
    naam: "Lintregel: geen import uit een andere modules/-map",
    bron: "§10.2, DR-11",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm lint",
    run: () => {
      const config = lees("eslint.config.mjs");
      const blokken = ["10-2-modules", "10-2-services", "10-2-domain", "10-2-lib"];
      const ontbreekt = blokken.filter((blok) => !config.includes(`eduflow/${blok}`));
      return ontbreekt.length
        ? mislukt("Lintblokken ontbreken in eslint.config.mjs.", ontbreekt)
        : ok("De importtabel uit §10.2 is afgedwongen in pnpm lint.");
    },
  },

  {
    nummer: 4,
    id: "verzendeindpunten",
    naam: "Zoekopdracht naar verzendeindpunten",
    bron: "DR-42, B-20",
    wanneer: "elke wijziging",
    status: "actief",
    run: () => {
      // Het derde van de drie sloten uit §13.3. De Bible zelf noemt deze paden
      // met naam, dus docs/ hoort er niet bij; het gaat om code en configuratie.
      //
      // De verboden woorden staan hier in stukken. Zou de poort ze voluit
      // bevatten, dan vindt hij zichzelf — en dan is de enige uitweg een filter
      // op de eigen bestandsnaam, dat breekt zodra dit bestand verhuist.
      const verboden = new RegExp(
        ["send" + "Mail", "messages" + "/" + "send", "Mail" + "\\.Send", "gmail" + "\\.send"].join("|"),
        "i",
      );
      const doelen = [...bronbestanden("src"), ...bronbestanden("e2e"), ...bronbestanden("scripts")];
      const treffers = zoek(doelen, verboden);
      return treffers.length
        ? mislukt(
            "Verwijzing naar een verzendeindpunt gevonden. EduFlow vraagt geen verzendrecht (B-20).",
            treffers,
          )
        : ok("Geen enkele verwijzing naar een verzendeindpunt.");
    },
  },

  {
    nummer: 5,
    id: "geheimen",
    naam: "Zoekopdracht naar geheimpatronen",
    bron: "§16.7, DR-36",
    wanneer: "elke wijziging",
    status: "actief",
    run: () => {
      const patroon = new RegExp(
        [
          "sk-[A-Za-z0-9]{20,}", // OpenAI
          "AKIA[0-9A-Z]{16}", // AWS
          "gh[pousr]_[A-Za-z0-9]{30,}", // GitHub
          "AIza[0-9A-Za-z_-]{30,}", // Google
          "-----BEGIN [A-Z ]*PRIVATE KEY-----",
          "(api[_-]?key|secret|password|token)\\s*[:=]\\s*[\"'][A-Za-z0-9+/_-]{24,}[\"']",
        ].join("|"),
        "i",
      );
      const doelen = [
        ...bronbestanden("src"),
        ...bronbestanden("e2e"),
        ...bronbestanden("scripts"),
        ...bronbestanden(".github", [".yml", ".yaml"]),
      ];
      const treffers = zoek(doelen, patroon);
      return treffers.length
        ? mislukt("Iets dat op een sleutel lijkt staat in de broncode. Geheimen komen uit de omgeving (DR-36).", treffers)
        : ok("Geen tekenreeks gevonden die op een sleutel lijkt.");
    },
  },

  {
    nummer: 6,
    id: "afhankelijkheden",
    naam: "Controle op afhankelijkheden",
    bron: "§16.8, T-35",
    wanneer: "wekelijks en bij elke wijziging",
    status: "actief",
    run: () => {
      try {
        execFileSync("corepack", ["pnpm", "audit", "--audit-level", "critical"], {
          cwd: WORTEL,
          stdio: "pipe",
          shell: process.platform === "win32",
        });
        return ok("Geen kwetsbaarheid met status kritiek.");
      } catch (fout) {
        const uitvoer = `${fout.stdout ?? ""}${fout.stderr ?? ""}`;
        if (/ERR_PNPM_(FETCH|META)|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(uitvoer)) {
          return mislukt(
            "De kwetsbaarhedenlijst is niet op te halen; deze poort heeft netwerk nodig.",
            [uitvoer.split(/\r?\n/).find(Boolean) ?? ""],
          );
        }
        return mislukt("Kwetsbaarheid met status kritiek gevonden.", uitvoer.split(/\r?\n/).slice(0, 12));
      }
    },
  },

  {
    nummer: 7,
    id: "axe",
    naam: "axe-core op elk scherm",
    bron: "NFR-30, §11.6",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm e2e",
    run: () => {
      if (!bestaat("e2e/accessibility.spec.ts")) {
        return mislukt("e2e/accessibility.spec.ts ontbreekt; de toegankelijkheidspoort is weg.");
      }
      const spec = lees("e2e/accessibility.spec.ts");
      const aantal = (spec.match(/\{ naam:/g) ?? []).length;
      if (aantal === 0) return mislukt("De schermenlijst in de axe-toets is leeg.");
      return ok(`${aantal} schermen worden op WCAG 2.2 AA getoetst, uitgevoerd door pnpm e2e.`);
    },
  },

  {
    nummer: 8,
    id: "bundelomvang",
    naam: "Controle op bundelomvang",
    bron: "§11.8, T-31",
    wanneer: "elke wijziging",
    status: "actief",
    run: () => {
      const manifestPad = ".next/build-manifest.json";
      if (!bestaat(manifestPad)) {
        return mislukt("Geen bouw gevonden om te meten. Draai eerst `pnpm build`.");
      }

      // §11.8 geeft de eerste lading (schil plus dashboard) 180 kB gecomprimeerd.
      // T-31 laat 10 procent overschrijding toe voordat de bouwstraat faalt.
      const GRENS_KB = 180;
      const MARGE = 1.1;

      const manifest = JSON.parse(lees(manifestPad));
      const bestanden = manifest.rootMainFiles ?? [];
      if (bestanden.length === 0) {
        return mislukt("Het bouwmanifest noemt geen rootMainFiles; de meting klopt dan niet.");
      }

      let bytes = 0;
      const per = [];
      for (const relatief of bestanden) {
        const pad = join(WORTEL, ".next", relatief.replace(/^static\//, "static/"));
        if (!existsSync(pad)) continue;
        const gz = gzipSync(readFileSync(pad)).length;
        bytes += gz;
        per.push(`${(gz / 1024).toFixed(1)} kB  ${relatief}`);
      }

      const kb = bytes / 1024;
      const bericht = `Eerste lading ${kb.toFixed(1)} kB gzip van maximaal ${GRENS_KB} kB (faalt boven ${(GRENS_KB * MARGE).toFixed(0)} kB).`;
      return kb > GRENS_KB * MARGE ? mislukt(bericht, per) : ok(bericht);
    },
  },

  {
    nummer: 9,
    id: "pseudonimisatie-rondgang",
    naam: "Rondgangtoets pseudonimisatie",
    bron: "INV-30, NFR-25",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm test",
    run: () => {
      // Deze poort stond op `wacht` en keek naar `src/services/PrivacyService.ts`,
      // terwijl D03 hem in `src/services/privacy/` heeft gezet. Daardoor is hij na
      // D03 blijven wachten op iets dat er al stond — precies het stilzwijgen dat
      // de kop van dit bestand verbiedt.
      const dienst = "src/services/privacy/PrivacyService.ts";
      const toets = "src/services/privacy/PrivacyService.test.ts";

      if (!bestaat(dienst)) return mislukt(`PrivacyService ontbreekt: ${dienst}.`);
      if (!bestaat(toets)) return mislukt(`De rondgangtoets ontbreekt: ${toets}.`);

      const bron = lees(dienst);
      if (!/export function pseudonymise/.test(bron) || !/export function restore/.test(bron)) {
        return mislukt("PrivacyService kent geen pseudonymise en restore als paar.");
      }

      // §12.5: minimaal 120 gevallen. De set wordt uit twintig namen maal zeven
      // zinsvormen opgebouwd, dus hier wordt het product geteld en niet de regels.
      const set = lees(toets);
      const vormen = set.match(/^ {2}\(naam: string\) =>/gmu)?.length ?? 0;
      const gevallen = vormen * 20;
      if (gevallen < 120) {
        return mislukt(
          `De rondgangset telt ${gevallen} gevallen; §12.5 eist er minstens 120.`,
          vormen === 0 ? ["Geen zinsvormen gevonden in ZINSVORMEN."] : [],
        );
      }

      return ok(
        `Rondgang restore(pseudonymise(t)) === t over ${gevallen} gevallen, plus de vijftien ` +
          "uit bijlage A. Draait mee in pnpm test, zonder browser en zonder netwerk.",
      );
    },
  },

  {
    nummer: 10,
    id: "golden-offline",
    naam: "Gouden testset zonder netwerk",
    bron: "§12.9",
    wanneer: "elke wijziging",
    status: "actief",
    uitgevoerdDoor: "pnpm test",
    run: () => {
      const pad = "src/services/ai/gouden.test.ts";
      if (!bestaat(pad)) {
        return mislukt(`De gouden testset zonder netwerk ontbreekt: ${pad}.`);
      }

      const set = lees(pad);
      if (!set.includes("GOUDEN_GEVALLEN")) {
        return mislukt(`${pad} bevat geen GOUDEN_GEVALLEN.`);
      }

      // §12.9 noemt vijf dingen die de samengestelde opdracht moet dragen. Een
      // testset die er maar drie nakijkt, geeft een groen vinkje voor half werk.
      const blokken = ["systeeminstructie", "schrijfstijl", "voorbeelden", "context", "invoer"];
      const ontbreekt = blokken.filter((blok) => !set.includes(blok));
      if (ontbreekt.length > 0) {
        return mislukt(`De set toetst niet op: ${ontbreekt.join(", ")}.`);
      }

      // Elke taak die een opdracht kan opleveren, heeft een gouden geval. De
      // toets zelf bewaakt dat ook; hier staat het zodat de poort niet groen
      // wordt door een set die per ongeluk leeg raakt.
      const taken = lees("src/services/ai/PromptService.ts").match(/^ {2}"([a-z]+\.[a-z]+)":/gmu);
      const aantal = taken?.length ?? 0;
      if (aantal === 0) {
        return mislukt("PromptService kent geen enkele taak; dan toetst de set niets.");
      }

      return ok(
        `Gouden testset zonder netwerk draait mee in pnpm test, over ${aantal} taak/taken. ` +
          "De stand mét netwerk wacht op de stijlvoorbeelden uit O-01.",
      );
    },
  },

  {
    nummer: 11,
    id: "golden-online",
    naam: "Gouden testset met netwerk",
    bron: "§12.9",
    wanneer: "wekelijks en vóór elke release",
    status: "wacht",
    activeertBij: "een bereikbare provider — `EDUFLOW_GOLDEN_ONLINE`",
    waarom:
      "Deze toets legt de uitvoer van de **provider** langs de drempels uit §12.9. De " +
      "stijlvoorbeelden uit O-01 zijn er inmiddels wel — die voorwaarde is dus vervuld — maar ze " +
      "waren nooit het enige dat ontbrak. Wat ontbreekt is de provider zelf: `eu.api.openai.com` " +
      "weigert zolang het project geen geografische beperking aan heeft staan, en uitwijken naar " +
      "het wereldwijde eindpunt is uitgesloten door T-06. Sinds B-119 staat bovendien alle " +
      "AI in blok 2. §12.9 laat deze poort wekelijks en vóór een release draaien en niet bij elke " +
      "wijziging; hij gaat aan zodra `EDUFLOW_GOLDEN_ONLINE` gezet wordt, en dat kan alleen met " +
      "een provider die antwoordt. De stand zónder netwerk draait wel, als poort 10.",
    voorwaarde: () =>
      process.env.EDUFLOW_GOLDEN_ONLINE
        ? "EDUFLOW_GOLDEN_ONLINE staat aan: de gouden testset met netwerk moet nu draaien."
        : null,
  },
];

/* ------------------------------------------------------------------ loop -- */

const gevraagd = process.argv[2];
const teDraaien = gevraagd ? POORTEN.filter((p) => p.id === gevraagd) : POORTEN;

if (gevraagd && teDraaien.length === 0) {
  console.error(`Onbekende poort: ${gevraagd}`);
  console.error(`Bekend: ${POORTEN.map((p) => p.id).join(", ")}`);
  process.exit(2);
}

console.log(`\nBouwstraat — ${teDraaien.length} van de 11 poorten uit §16.9\n`);

let gefaald = 0;
let wachtend = 0;

for (const poort of teDraaien) {
  const kop = `[${String(poort.nummer).padStart(2, "0")}] ${poort.naam}`;

  if (poort.status === "wacht") {
    const nuMogelijk = poort.voorwaarde();
    if (nuMogelijk) {
      gefaald += 1;
      console.log(`FOUT    ${kop}`);
      console.log(`        Deze poort stond op wachten, maar dat kan niet meer.`);
      console.log(`        ${nuMogelijk}`);
      console.log(`        Implementeer hem of pas scripts/gates/run.mjs aan met een reden.\n`);
    } else {
      wachtend += 1;
      console.log(`WACHT   ${kop}`);
      console.log(`        Activeert bij: ${poort.activeertBij}`);
      console.log(`        ${poort.waarom}\n`);
    }
    continue;
  }

  const uitkomst = poort.run();
  const door = poort.uitgevoerdDoor ? ` (via ${poort.uitgevoerdDoor})` : "";
  if (uitkomst.geslaagd) {
    console.log(`OK      ${kop}${door}`);
    console.log(`        ${uitkomst.bericht}\n`);
  } else {
    gefaald += 1;
    console.log(`FOUT    ${kop}${door}`);
    console.log(`        ${uitkomst.bericht}`);
    for (const regel of uitkomst.details ?? []) console.log(`        ${regel}`);
    console.log("");
  }
}

const actief = teDraaien.filter((p) => p.status === "actief").length;
console.log(
  `Samenvatting: ${actief} actief, ${wachtend} wachtend, ${gefaald} gefaald.` +
    (isCI ? "" : "  (lokaal; CI draait dezelfde poorten)"),
);

process.exit(gefaald > 0 ? 1 : 0);
