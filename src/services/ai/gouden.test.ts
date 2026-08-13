/**
 * De gouden testset, stand **zonder netwerk** (§12.9, poort 10 van §16.9).
 *
 * §12.9 geeft die stand een eigen opdracht, en die is niet "kijk of het model het
 * goed doet": *"Getoetst wordt de samengestelde opdracht: bevat hij de
 * systeeminstructie, het profiel, de juiste voorbeelden, de juiste context, en de
 * gepseudonimiseerde invoer? Dit vangt de meeste fouten, want de meeste fouten
 * zitten in het samenstellen en niet in het model."*
 *
 * Daarom draait deze set zonder provider en zonder sleutel, bij elke wijziging.
 *
 * **Wat er nog niet in zit en waarom.** Een `GoldenCase` uit §12.9 heeft ook
 * `acceptable`, `overshot` en drempels op `checks`. Die horen bij de stand **mét**
 * netwerk, en ze vragen om de stijlvoorbeelden uit O-01 — de norm waaraan de AI
 * gemeten wordt, en de enige openstaande post die alleen de opdrachtgever kan
 * invullen (§19.5, bijlage A.4). Ze verzinnen zou de norm naar de code toe
 * schrijven, en dan meet de testset zichzelf.
 *
 * De namen in de invoer komen uit bijlage A en zijn verzonnen (§15.6, DR-33).
 */

import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";
import type { AiTask, Student } from "@/domain/types";
import { pseudonymise } from "@/services/privacy/PrivacyService";
import { GROEP_4 } from "@/test/fixtures/testgegevens";

import { createPromptService, TAKEN } from "./PromptService";

/**
 * Eén gouden geval in de stand zonder netwerk.
 *
 * `acceptable`, `overshot` en `checks` uit §12.9 staan er niet in; zie de kop van
 * dit bestand.
 */
interface GoudenGeval {
  id: string;
  task: AiTask;
  /** De ruwe notitie, met de namen uit bijlage A erin. */
  input: string;
  /** Welke namen erin voorkomen, zodat de toets kan nagaan dat ze verdwijnen. */
  namen: readonly string[];
}

export const GOUDEN_GEVALLEN: readonly GoudenGeval[] = [
  {
    id: "doc.write/brug",
    task: "doc.write",
    input: "Kjeld bouwde een brug van blokken. Mees hielp met de leuning. De brug hield het.",
    namen: ["Kjeld", "Mees"],
  },
  {
    id: "doc.write/citaat",
    task: "doc.write",
    input: '"Kijk, hij staat!" riep Kjeld. Pippa legde het laatste blok erop.',
    namen: ["Kjeld", "Pippa"],
  },
  {
    id: "doc.write/twee-noas",
    task: "doc.write",
    input: "Noa B. en Noa V. werkten aan hetzelfde bouwwerk in de bouwhoek.",
    namen: ["Noa B.", "Noa V."],
  },
  {
    id: "doc.write/naam-is-woord",
    task: "doc.write",
    input: "Roos legde drie steentjes naast de rozen in de schooltuin.",
    namen: ["Roos"],
  },
];

function leerling(voornaam: string, seed: number): Student {
  const [eerste = "", ...rest] = voornaam.split(" ");
  return {
    id: newId(),
    createdAt: "2026-08-13T10:00:00.000Z",
    updatedAt: "2026-08-13T10:00:00.000Z",
    deletedAt: null,
    rev: 1,
    origin: newId(),
    schemaVersion: 1,
    firstName: eerste,
    firstNameLower: eerste.toLowerCase(),
    lastNameInitial: rest.join(" "),
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    note: "",
    pseudonymSeed: seed,
  };
}

const GROEP = GROEP_4.map((kind, plaats) => leerling(kind.voornaam, plaats + 1));

const PROFIEL = "Zinnen: gemiddeld 14 woorden.\nTijd: tegenwoordige tijd.";
const VOORBEELDEN = [{ invoer: "losse notitie", uitkomst: "lopende tekst" }];

/** De keten tot vlak vóór het versturen: afschermen en dan samenstellen. */
function stelSamen(geval: GoudenGeval) {
  const afgeschermd = pseudonymise(geval.input, { leerlingen: GROEP });
  const gebouwd = createPromptService().build({
    task: geval.task,
    tekst: afgeschermd.tekst,
    schrijfstijl: PROFIEL,
    voorbeelden: VOORBEELDEN,
    context: "",
  });

  if (!gebouwd.ok) throw new Error(`opdracht faalde: ${gebouwd.error.message}`);
  return { opdracht: gebouwd.value.opdracht, kaart: afgeschermd.kaart };
}

describe("gouden testset zonder netwerk — §12.9", () => {
  it("dekt elke taak die PromptService kent", () => {
    const gedekt = new Set(GOUDEN_GEVALLEN.map((geval) => geval.task));

    // Een taak zonder gouden geval is een taak die niemand narekent.
    for (const taak of Object.keys(TAKEN) as AiTask[]) {
      expect(gedekt.has(taak), `taak ${taak} heeft geen gouden geval`).toBe(true);
    }
  });

  it.each(GOUDEN_GEVALLEN.map((geval) => [geval.id, geval] as const))(
    "%s — de opdracht draagt de systeeminstructie",
    (_id, geval) => {
      const { opdracht } = stelSamen(geval);

      expect(opdracht.systeeminstructie).toBe(TAKEN[geval.task]!.systeeminstructie);
    },
  );

  it.each(GOUDEN_GEVALLEN.map((geval) => [geval.id, geval] as const))(
    "%s — de opdracht draagt het profiel, de voorbeelden en de context",
    (_id, geval) => {
      const { opdracht } = stelSamen(geval);

      expect(opdracht.schrijfstijl).toBe(PROFIEL);
      expect(opdracht.voorbeelden).toEqual(VOORBEELDEN);
      // `doc.write` neemt geen reekscontext mee (§12.2); het blok bestaat en is leeg.
      expect(opdracht.context).toBe("");
    },
  );

  it.each(GOUDEN_GEVALLEN.map((geval) => [geval.id, geval] as const))(
    "%s — de invoer is gepseudonimiseerd en draagt geen enkele naam",
    (_id, geval) => {
      const { opdracht } = stelSamen(geval);

      for (const naam of geval.namen) {
        expect(opdracht.invoer).not.toContain(naam);
      }
      // En geen enkele andere naam uit de lijst evenmin (INV-38).
      for (const kind of GROEP_4) {
        expect(opdracht.invoer).not.toContain(kind.voornaam);
      }
    },
  );

  it.each(GOUDEN_GEVALLEN.map((geval) => [geval.id, geval] as const))(
    "%s — de hele opdracht bevat nergens een naam",
    (_id, geval) => {
      const alsTekst = JSON.stringify(stelSamen(geval).opdracht);

      for (const kind of GROEP_4) {
        expect(alsTekst).not.toContain(kind.voornaam);
      }
    },
  );
});
