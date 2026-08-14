/**
 * De toetsset van de afscherming (§12.5, T-04, T-08, DR-40, DR-41).
 *
 * Dit is de toetsset die DR-41 bedoelt: wijzigt er iets aan `PrivacyService`, dan
 * draait dit bestand helemaal vóór je oplevert. Hij draait zonder browser, zonder
 * netwerk en zonder opslag (DR-12), want de service is een zuivere functie.
 *
 * Alle twintig namen komen uit bijlage A en zijn verzonnen (§15.6, DR-33). Ze zijn
 * niet willekeurig gekozen: elke naam dekt een geval dat hieronder staat.
 *
 * De **rondgang** is de belangrijkste toets: `restore(pseudonymise(t)) === t` voor
 * elk van de vijftien gevallen uit `PRIVACY_GEVALLEN`. Dat is `INV-54` (B-121).
 * Werkopdracht D03 en §12.5 noemden die eis `INV-30`; dat nummer draagt in §9.5 al
 * de agendaregel over begin en einde, en B-121 heeft de rondgang daarom een eigen
 * nummer gegeven.
 */

import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";
import type { PrivacyTerm, Student } from "@/domain/types";
import { GROEP_4, NIET_IN_DE_LIJST, PRIVACY_GEVALLEN } from "@/test/fixtures/testgegevens";

import { gate, pseudonymise, restore, type Afschermlijst } from "./PrivacyService";

/** Een leerling zoals de opslag hem oplevert, uit een verzonnen naam uit bijlage A. */
function leerling(voornaam: string, seed: number): Student {
  const [eerste = "", ...rest] = voornaam.split(" ");
  return {
    id: newId(),
    createdAt: "2026-08-11T10:00:00.000Z",
    updatedAt: "2026-08-11T10:00:00.000Z",
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

/** De hele verzonnen groep, met het volgnummer uit bijlage A als `pseudonymSeed`. */
const GROEP: Student[] = GROEP_4.map((kind, plaats) => leerling(kind.voornaam, plaats + 1));

const LIJST: Afschermlijst = { leerlingen: GROEP };

function zoek(voornaam: string): Student {
  const gevonden = GROEP.find(
    (kind) => `${kind.firstName} ${kind.lastNameInitial}`.trim() === voornaam,
  );
  if (!gevonden) throw new Error(`${voornaam} staat niet in de verzonnen groep`);
  return gevonden;
}

function code(voornaam: string): string {
  return `[LEERLING-${zoek(voornaam).pseudonymSeed}]`;
}

/* ------------------------------------------------------------------ */
/* De vijftien gevallen uit bijlage A                                 */
/* ------------------------------------------------------------------ */

describe("PRIVACY_GEVALLEN — T-04, §12.5", () => {
  it.each(PRIVACY_GEVALLEN.map((geval) => [geval.naam, geval] as const))(
    "%s",
    (_naam, geval) => {
      const uitkomst = pseudonymise(geval.invoer, LIJST);

      if (geval.vervangt) {
        expect(uitkomst.tekst, geval.waarom).not.toBe(geval.invoer);
        expect(uitkomst.kaart.size, geval.waarom).toBeGreaterThan(0);
      } else {
        expect(uitkomst.tekst, geval.waarom).toBe(geval.invoer);
        expect(uitkomst.kaart.size, geval.waarom).toBe(0);
      }
    },
  );

  it.each(PRIVACY_GEVALLEN.map((geval) => [geval.naam, geval] as const))(
    "rondgang op %s (INV-54)",
    (_naam, geval) => {
      const uitkomst = pseudonymise(geval.invoer, LIJST);

      expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe(geval.invoer);
    },
  );
});

/* ------------------------------------------------------------------ */
/* De tabel met verplichte gevallen uit §12.5, letterlijk             */
/* ------------------------------------------------------------------ */

describe("de verplichte gevallen uit §12.5", () => {
  // Deze uitkomsten staan mét codenummer in het handboek. Ze toetsen dus niet
  // alleen het vervangen maar ook de nummering: `pseudonymSeed` is het volgnummer
  // uit bijlage A, en Kjeld is de elfde en Roos de negentiende.
  it.each([
    ["De rozen in de schooltuin", "De rozen in de schooltuin"],
    ["samenwerken", "samenwerken"],
    ["Kjelds idee", "[LEERLING-11]s idee"],
    ["Kjeldje", "[LEERLING-11]je"],
    ["KJELD riep", "[LEERLING-11] riep"],
    ["Hanaë", "[LEERLING-8]"],
  ])("%s", (invoer, verwacht) => {
    expect(pseudonymise(invoer, LIJST).tekst).toBe(verwacht);
  });

  /**
   * De rij "Roos plukte een roos" uit §12.5 staat hier **niet**, want hij spreekt
   * stap 4 van diezelfde paragraaf tegen.
   *
   * Stap 4 eist hoofdletterongevoelig zoeken. Dan is de bloem "roos" niet van de
   * leerling Roos te onderscheiden, en wordt hij dus ook vervangen. De rij in de
   * tabel verwacht het tegenovergestelde. Eén van beide moet wijken, en dat is een
   * besluit met een nummer, geen stillere toets (DR-45).
   *
   * Zolang dat besluit er niet is, wint de veilige kant: één keer te veel
   * vervangen is een lelijke opdracht, één keer te weinig is een naam die weg is
   * (§12.5 over diakrieten, §20.6 fout 1). De rondgang blijft hoe dan ook exact,
   * dus de gebruiker ziet gewoon "Roos plukte een roos" terug.
   */
  it("vervangt ook de kleine letter, en zet hem exact terug", () => {
    const uitkomst = pseudonymise("Roos plukte een roos", LIJST);

    expect(uitkomst.tekst).toBe("[LEERLING-19] plukte een [LEERLING-19]");
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("Roos plukte een roos");
  });
});

/* ------------------------------------------------------------------ */
/* De acht regels van T-04, elk apart                                 */
/* ------------------------------------------------------------------ */

describe("woordgrenzen — T-04, §12.5 stap 3", () => {
  it("vervangt Roos als naam maar laat rozen staan", () => {
    const uitkomst = pseudonymise("Roos legde er drie steentjes naast bij de rozen.", LIJST);

    expect(uitkomst.tekst).toBe(`${code("Roos")} legde er drie steentjes naast bij de rozen.`);
  });

  it("laat samenwerken en samen heel, met leerling Sam", () => {
    const zin = "De kinderen waren aan het samenwerken. Ze deden het samen.";

    expect(pseudonymise(zin, LIJST).tekst).toBe(zin);
  });

  it("laat categorie heel, met leerling Cato", () => {
    const zin = "Het was een categorie die ze zelf bedacht.";

    expect(pseudonymise(zin, LIJST).tekst).toBe(zin);
  });

  it("vindt een naam aan het einde van een zin", () => {
    const uitkomst = pseudonymise("Het laatste blok legde Pippa.", LIJST);

    expect(uitkomst.tekst).toBe(`Het laatste blok legde ${code("Pippa")}.`);
  });

  it("laat een streepje als grens gelden (§12.5 stap 3)", () => {
    const uitkomst = pseudonymise("Het bouwwerk Sam-Sam stond er nog.", LIJST);

    // Een streepje is geen letter en geen cijfer, dus beide helften zijn woorden.
    expect(uitkomst.tekst).toBe(`Het bouwwerk ${code("Sam")}-${code("Sam")} stond er nog.`);
  });
});

describe("langste eerst — T-04, §12.5 stap 2", () => {
  it("pakt Jan-Peter als geheel en niet als Jan", () => {
    const lijst: Afschermlijst = {
      leerlingen: [leerling("Jan", 1), leerling("Jan-Peter", 2)],
    };
    const uitkomst = pseudonymise("Jan-Peter bouwde met Jan.", lijst);

    expect(uitkomst.tekst).toBe("[LEERLING-2] bouwde met [LEERLING-1].");
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("Jan-Peter bouwde met Jan.");
  });

  it("pakt Noa B. als geheel en niet als Noa met een losse letter", () => {
    const uitkomst = pseudonymise("Noa B. en Noa V. werkten aan hetzelfde bouwwerk.", LIJST);

    expect(uitkomst.tekst).toBe(
      `${code("Noa B.")} en ${code("Noa V.")} werkten aan hetzelfde bouwwerk.`,
    );
    expect(uitkomst.meldingen).toEqual([]);
  });
});

describe("hoofdletters — T-04, §12.5 stap 4", () => {
  it("vindt KJELD en zet hem als KJELD terug", () => {
    const uitkomst = pseudonymise("KJELD stond op de tekening.", LIJST);

    expect(uitkomst.tekst).toBe(`${code("Kjeld")} stond op de tekening.`);
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("KJELD stond op de tekening.");
  });

  it("houdt twee vormen van dezelfde naam uit elkaar bij het terugvertalen", () => {
    const uitkomst = pseudonymise("KJELD riep het. Kjeld lachte.", LIJST);

    expect(uitkomst.tekst).toBe(`${code("Kjeld")} riep het. ${code("Kjeld")} lachte.`);
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("KJELD riep het. Kjeld lachte.");
  });
});

describe("verbuigingen — T-04, §12.5 stap 5", () => {
  it.each([
    ["Kjelds idee werkte niet meteen.", "s idee werkte niet meteen."],
    ["Kjeldje mocht als eerste.", "je mocht als eerste."],
    ["Kjelds tekening hing er.", "s tekening hing er."],
  ])("%s", (invoer, staart) => {
    const uitkomst = pseudonymise(invoer, LIJST);

    expect(uitkomst.tekst).toBe(`${code("Kjeld")}${staart}`);
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe(invoer);
  });

  it("laat het achtervoegsel staan en neemt het niet in de code op", () => {
    const uitkomst = pseudonymise("Kjelds idee", LIJST);

    expect(uitkomst.kaart.get(code("Kjeld"))!.forms).toEqual(["Kjeld"]);
  });
});

describe("diakrieten — T-04, §12.5 stap 6", () => {
  it("vindt Hanaë met Hanae in de lijst", () => {
    const uitkomst = pseudonymise("Hanaë wees precies één ding aan.", LIJST);

    expect(uitkomst.tekst).toBe(`${code("Hanae")} wees precies één ding aan.`);
  });

  it("zet de spelling uit de tekst terug, niet die uit de lijst", () => {
    const uitkomst = pseudonymise("Hanaë wees precies één ding aan.", LIJST);

    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("Hanaë wees precies één ding aan.");
  });

  it("laat woorden met een diakriet die geen naam zijn ongemoeid", () => {
    const zin = "Ze deden het één voor één, blèrend van plezier.";

    expect(pseudonymise(zin, LIJST).tekst).toBe(zin);
  });
});

describe("dubbele voornamen — T-04, §12.5 stap 7, B-76", () => {
  it("geeft Noa B. en Noa V. elk een eigen code", () => {
    expect(code("Noa B.")).not.toBe(code("Noa V."));
  });

  it("kiest de gekoppelde leerling bij een kale Noa", () => {
    const lijst: Afschermlijst = { leerlingen: GROEP, gekoppeld: [zoek("Noa V.").id] };
    const uitkomst = pseudonymise("Noa begon opnieuw.", lijst);

    expect(uitkomst.tekst).toBe(`${code("Noa V.")} begon opnieuw.`);
    expect(uitkomst.meldingen).toEqual([]);
  });

  it("geeft [LEERLING-AMBIGU-1] plus melding als beide gekoppeld zijn", () => {
    const lijst: Afschermlijst = {
      leerlingen: GROEP,
      gekoppeld: [zoek("Noa B.").id, zoek("Noa V.").id],
    };
    const uitkomst = pseudonymise("Noa begon opnieuw.", lijst);

    expect(uitkomst.tekst).toBe("[LEERLING-AMBIGU-1] begon opnieuw.");
    expect(uitkomst.meldingen[0]).toContain("De app kan niet zien welke bedoeld is");
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("Noa begon opnieuw.");
  });

  it("geeft [LEERLING-AMBIGU-1] als er geen enkele gekoppeld is", () => {
    const uitkomst = pseudonymise("Noa begon opnieuw.", LIJST);

    expect(uitkomst.tekst).toBe("[LEERLING-AMBIGU-1] begon opnieuw.");
    expect(uitkomst.meldingen).toHaveLength(1);
  });

  it("meldt niets over een dubbele naam die niet in de tekst staat", () => {
    const uitkomst = pseudonymise("Bram bouwde een toren van negen blokken.", LIJST);

    expect(uitkomst.meldingen).toEqual([]);
  });
});

describe("terugvertalen op de code — §12.5 stap 8", () => {
  it("blijft kloppen als het model de zin omzet", () => {
    const uitkomst = pseudonymise("Guus, Mees en Bram kozen alle drie een andere kant.", LIJST);
    const antwoord = `Alle drie kozen ze een andere kant: ${code("Bram")}, ${code("Guus")} en ${code("Mees")}.`;

    expect(restore(antwoord, uitkomst.kaart)).toBe(
      "Alle drie kozen ze een andere kant: Bram, Guus en Mees.",
    );
  });

  it("laat een code staan die het model zelf verzonnen heeft (INV-40)", () => {
    const uitkomst = pseudonymise("Bram bouwde een toren.", LIJST);

    expect(restore(`${code("Bram")} en [LEERLING-99] bouwden.`, uitkomst.kaart)).toBe(
      "Bram en [LEERLING-99] bouwden.",
    );
  });

  it("geeft dezelfde codes bij een tweede aanroep op dezelfde lijst (INV-41)", () => {
    const eerste = pseudonymise("Guus en Mees speelden.", LIJST);
    const tweede = pseudonymise("Mees en Guus speelden.", LIJST);

    expect([...eerste.kaart.keys()].sort()).toEqual([...tweede.kaart.keys()].sort());
  });
});

describe("de lijst is een vangnet, geen garantie — §6.1, B-11", () => {
  it.each(NIET_IN_DE_LIJST)("laat %s staan, want hij staat niet in de lijst", (naam) => {
    const uitkomst = pseudonymise(`${naam} deed mee.`, LIJST);

    expect(uitkomst.tekst).toBe(`${naam} deed mee.`);
  });
});

describe("extra termen — FR-INS-19", () => {
  function term(waarde: string, enabled = true): PrivacyTerm {
    return {
      id: newId(),
      createdAt: "2026-08-11T10:00:00.000Z",
      updatedAt: "2026-08-11T10:00:00.000Z",
      deletedAt: null,
      rev: 1,
      origin: newId(),
      schemaVersion: 1,
      term: waarde,
      termLower: waarde.toLowerCase(),
      kind: "overig",
      enabled,
    };
  }

  it("vervangt een extra term met een eigen codesoort", () => {
    const uitkomst = pseudonymise("We liepen naar De Regenboog.", {
      leerlingen: GROEP,
      termen: [term("De Regenboog")],
    });

    expect(uitkomst.tekst).toBe("We liepen naar [TERM-1].");
    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe("We liepen naar De Regenboog.");
  });

  it("slaat een uitgezette term over", () => {
    const zin = "We liepen naar De Regenboog.";
    const uitkomst = pseudonymise(zin, { leerlingen: GROEP, termen: [term("De Regenboog", false)] });

    expect(uitkomst.tekst).toBe(zin);
  });

  it("houdt dezelfde nummering aan bij dezelfde termenlijst (INV-41)", () => {
    const termen = [term("Zwaluwstraat"), term("Aster")];
    const eerste = pseudonymise("Aster en Zwaluwstraat.", { leerlingen: [], termen });
    const tweede = pseudonymise("Zwaluwstraat en Aster.", { leerlingen: [], termen });

    expect(eerste.tekst).toBe("[TERM-1] en [TERM-2].");
    expect(tweede.tekst).toBe("[TERM-2] en [TERM-1].");
  });
});

describe("de poort — T-08, FR-INS-20", () => {
  it("blokkeert bij een lege leerlingenlijst en zegt waarom", () => {
    const uitkomst = gate([]);

    expect(uitkomst.ok).toBe(false);
    if (uitkomst.ok) return;
    expect(uitkomst.error.code).toBe("PRIVACY_GATE");
    expect(uitkomst.error.message).toContain("afscherming doet dan niets");
    expect(uitkomst.error.action?.target).toBe("/settings/students");
  });

  it("laat door zodra er één leerling is", () => {
    expect(gate([leerling("Bram", 1)]).ok).toBe(true);
  });

  it("laat door na de eenmalige bevestiging", () => {
    expect(gate([], "2026-08-11T10:00:00.000Z").ok).toBe(true);
  });

  it("vraagt opnieuw als de lijst later weer leeg raakt zonder bevestiging", () => {
    expect(gate([], null).ok).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* De set van minimaal 120 gevallen uit §12.5                         */
/* ------------------------------------------------------------------ */

/**
 * Zeven zinsvormen over alle twintig namen: honderdveertig rondgangen.
 *
 * §12.5 eist een set van **minimaal 120 gevallen**, en poort 9 van §16.9 bewaakt
 * dat. De vijftien gevallen uit bijlage A dekken de lastige uitzonderingen; deze
 * matrix dekt de breedte — elke naam in elke vorm die T-04 noemt: kaal, met
 * bezitsvorm, met verkleinvorm, in hoofdletters, aan het begin en aan het eind van
 * een zin, en naast een woord dat erop lijkt.
 *
 * De vormen staan hier als sjabloon en niet uitgeschreven, omdat honderdveertig
 * met de hand geschreven zinnen een lijst is die niemand naleest — en dan toetst
 * hij niet meer wat hij belooft.
 */
const ZINSVORMEN = [
  (naam: string) => `${naam} bouwde een toren van negen blokken.`,
  (naam: string) => `Het laatste blok legde ${naam}.`,
  (naam: string) => `"Kijk, hij staat!" riep ${naam}.`,
  (naam: string) => `${naam}s idee werkte niet meteen.`,
  (naam: string) => `${naam}je mocht als eerste.`,
  (naam: string) => `${naam.toUpperCase()} stond op de tekening.`,
  (naam: string) => `Samen met ${naam} ruimden ze de bouwhoek op.`,
];

const RONDGANGSET: string[] = GROEP_4.flatMap((kind) =>
  ZINSVORMEN.map((vorm) => vorm(kind.voornaam)),
);

describe("de rondgang over de volledige set — §12.5, INV-54, poort 9", () => {
  it("telt minstens honderdtwintig gevallen", () => {
    expect(RONDGANGSET.length).toBeGreaterThanOrEqual(120);
  });

  it.each(RONDGANGSET)("restore(pseudonymise(%s)) is de oorspronkelijke tekst", (zin) => {
    const uitkomst = pseudonymise(zin, LIJST);

    expect(restore(uitkomst.tekst, uitkomst.kaart)).toBe(zin);
  });

  it("laat in geen van de honderdveertig een naam achter (INV-38)", () => {
    // Als **woord**, niet als letterreeks. "Samen" bevat "sam" en hoort te blijven
    // staan; dat is precies de woordgrens uit §12.5 stap 3, en een toets die die
    // grens negeert zou de service dwingen hem te overtreden.
    const alsWoord = (naam: string) =>
      new RegExp(
        `(?<![\\p{L}\\p{N}])${naam.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?![\\p{L}\\p{N}])`,
        "iu",
      );

    for (const zin of RONDGANGSET) {
      const uit = pseudonymise(zin, LIJST).tekst;
      for (const kind of GROEP_4) {
        expect(alsWoord(kind.voornaam).test(uit), `${kind.voornaam} bleef staan in: ${uit}`).toBe(
          false,
        );
      }
    }
  });
});

describe("een lijst die niet klopt laat de poort niet hangen", () => {
  it("slaat een lege naam over in plaats van eeuwig te zoeken", () => {
    const lijst: Afschermlijst = { leerlingen: [leerling("", 1), leerling("Bram", 2)] };
    const uitkomst = pseudonymise("Bram bouwde een toren.", lijst);

    expect(uitkomst.tekst).toBe("[LEERLING-2] bouwde een toren.");
  });
});

describe("de belofte van INV-38", () => {
  it("laat geen enkele naam uit de lijst achter in de uitgaande tekst", () => {
    const zin = GROEP_4.map((kind) => `${kind.voornaam} deed mee.`).join(" ");
    const uitkomst = pseudonymise(zin, LIJST);

    for (const kind of GROEP_4) {
      expect(uitkomst.tekst).not.toContain(kind.voornaam);
    }
  });

  it("laat ook geen verbogen vorm achter", () => {
    const uitkomst = pseudonymise("Kjelds idee, Kjeldje, KJELD en Kjeld.", LIJST);

    expect(uitkomst.tekst.toLowerCase()).not.toContain("kjeld");
  });
});
