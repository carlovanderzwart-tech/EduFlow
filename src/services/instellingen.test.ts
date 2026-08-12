/**
 * Toetsen bij werkopdracht D02 — leerlingen, groepen en reeksen.
 *
 * Elke toets draagt het `FR-`nummer dat hij bewijst in zijn naam (DR-40). Ze staan
 * los van `diensten.test.ts` omdat dat bestand de eerste verticale slice dekt en
 * anders over de vierhonderd regels zou gaan (DR-53).
 *
 * Eén echte database per toets, een stilstaande klok, geen browser en geen netwerk
 * (§10.10, DR-12). De namen komen uit bijlage A en zijn verzonnen (§15.6).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";
import { GROEP_4, GROEPEN, REEKSEN } from "@/test/fixtures/testgegevens";

import { createAgendaService } from "./agenda/AgendaService";
import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createGroupService, type GroupService } from "./groups/GroupService";
import { createSampleDataService, type SampleDataService } from "./sampledata/SampleDataService";
import { createSeriesService, type SeriesService } from "./series/SeriesService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";
import {
  createStudentService,
  dubbelemelding,
  ontleedLijst,
  weergavenaam,
  type StudentService,
} from "./students/StudentService";

const APPARAAT = newId();
const NU = "2026-08-11T10:00:00.000Z";

/** De periodes uit bijlage A.3, zodat een toets ze niet zelf verzint. */
const STAMGROEP = GROEPEN[0];
const TECHNIEKCLUB = GROEPEN[1];

let storage: StorageService;
let students: StudentService;
let groups: GroupService;
let series: SeriesService;
let documentation: DocumentationService;
let sampleData: SampleDataService;

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  const clock = { now: () => new Date(NU) };

  storage = createStorageService({ db, clock, origin: APPARAAT });
  students = createStudentService({ storage });
  groups = createGroupService({ storage });
  series = createSeriesService({ storage });
  documentation = createDocumentationService({ storage, clock });
  sampleData = createSampleDataService({
    storage,
    students,
    groups,
    series,
    region: "midden",
  });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

function fout(uitkomst: { ok: boolean; error?: { message: string } }): string {
  if (uitkomst.ok) throw new Error("hoort te falen");
  return uitkomst.error!.message;
}

/** Een schooljaar om groepen aan te hangen (INV-27). */
async function schooljaar(): Promise<string> {
  const jaar = await storage.create("schoolYears", {
    name: "2026-2027",
    firstSchoolDay: STAMGROEP.van,
    lastSchoolDay: STAMGROEP.tot,
    region: "midden" as const,
    isCurrent: true,
  });
  return waarde(jaar).id;
}

async function eenGroep(naam = "Groep 4 — De Regenboog") {
  return waarde(
    await groups.maak({
      name: naam,
      kind: "stamgroep",
      colour: "series-1",
      schoolYearId: await schooljaar(),
    }),
  );
}

async function eenLeerling(voornaam = "Aya", beginletter = "") {
  return waarde(await students.voegToe({ firstName: voornaam, lastNameInitial: beginletter }));
}

describe("plakken — FR-INS-01, FR-INS-02", () => {
  it("splitst een geplakte lijst op regeleinden, komma's en tabs (FR-INS-01)", () => {
    const regels = ontleedLijst("Aya\nBram,Cato\tDani\n\n  Elin  ");

    expect(regels.map((regel) => regel.firstName)).toEqual([
      "Aya",
      "Bram",
      "Cato",
      "Dani",
      "Elin",
    ]);
  });

  it("leest 'Noa B.' als voornaam plus beginletter (FR-INS-01)", () => {
    expect(ontleedLijst("Noa B.")).toEqual([{ firstName: "Noa", lastNameInitial: "B." }]);
  });

  it("voegt de hele verzonnen groep in één handeling toe (FR-INS-01)", async () => {
    const namen = ontleedLijst(GROEP_4.map((leerling) => leerling.voornaam).join("\n"));
    const uitkomst = waarde(await students.voegLijstToe(namen));

    expect(uitkomst.toegevoegd).toHaveLength(GROEP_4.length);
    expect(uitkomst.geweigerd).toEqual([]);
  });

  it("meldt de dubbele voornaam Noa in plaats van hem te weigeren (FR-INS-02, B-76)", async () => {
    const namen = ontleedLijst(GROEP_4.map((leerling) => leerling.voornaam).join("\n"));
    const uitkomst = waarde(await students.voegLijstToe(namen));

    // Beide Noa's staan er, want hun weergavenaam verschilt (INV-29).
    expect(uitkomst.toegevoegd.map(weergavenaam)).toEqual(
      expect.arrayContaining(["Noa B.", "Noa V."]),
    );
    expect(uitkomst.dubbeleVoornamen).toEqual(["Noa"]);
    expect(dubbelemelding(uitkomst.dubbeleVoornamen)).toContain("een eigen code");
  });

  it("houdt de andere regels overeind als er één niet kan (FR-INS-01, §4.7)", async () => {
    await eenLeerling("Bram");
    const uitkomst = waarde(await students.voegLijstToe(ontleedLijst("Bram\nCato")));

    expect(uitkomst.toegevoegd.map((leerling) => leerling.firstName)).toEqual(["Cato"]);
    expect(uitkomst.geweigerd).toHaveLength(1);
    expect(uitkomst.geweigerd[0]!.naam).toBe("Bram");
  });

  it("laat twee gelijke weergavenamen niet ontstaan (INV-29)", async () => {
    const uitkomst = waarde(await students.voegLijstToe(ontleedLijst("Noa\nNoa")));

    expect(uitkomst.toegevoegd).toHaveLength(1);
    expect(uitkomst.geweigerd[0]!.reden).toContain("beginletter");
  });
});

describe("GroupService — FR-INS-04, FR-INS-06, FR-INS-07, FR-INS-08", () => {
  it("geeft een leerling lidmaatschappen en geen groep (FR-INS-06, INV-23)", async () => {
    const groep = await eenGroep();
    const aya = await eenLeerling();

    waarde(await groups.voegLidToe({ studentId: aya.id, groupId: groep.id, from: STAMGROEP.van }));

    const zitIn = waarde(await groups.zitIn(aya.id));
    expect(zitIn).toHaveLength(1);
    expect(zitIn[0]!.groupId).toBe(groep.id);
    expect(aya).not.toHaveProperty("groupId");
  });

  it("laat één leerling tegelijk in twee groepen zitten (FR-INS-07)", async () => {
    const schoolYearId = await schooljaar();
    const stam = waarde(
      await groups.maak({
        name: STAMGROEP.naam,
        kind: "stamgroep",
        colour: "series-1",
        schoolYearId,
      }),
    );
    const club = waarde(
      await groups.maak({
        name: TECHNIEKCLUB.naam,
        kind: "projectgroep",
        colour: "series-2",
        schoolYearId,
      }),
    );
    const noa = await eenLeerling("Noa", "V.");

    waarde(
      await groups.voegLidToe({
        studentId: noa.id,
        groupId: stam.id,
        from: STAMGROEP.van,
        to: STAMGROEP.tot,
      }),
    );
    waarde(
      await groups.voegLidToe({
        studentId: noa.id,
        groupId: club.id,
        from: TECHNIEKCLUB.van,
        to: TECHNIEKCLUB.tot,
      }),
    );

    const zitIn = waarde(await groups.zitIn(noa.id));
    expect(zitIn.map((lid) => lid.groupId).sort()).toEqual([stam.id, club.id].sort());
    // Geen van beide is de hoofdgroep: er is geen veld dat er een aanwijst.
    expect(zitIn[0]).not.toHaveProperty("isPrimary");
  });

  it("weigert twee overlappende lidmaatschappen in dezelfde groep (FR-INS-08, INV-25)", async () => {
    const groep = await eenGroep();
    const aya = await eenLeerling();

    waarde(
      await groups.voegLidToe({
        studentId: aya.id,
        groupId: groep.id,
        from: STAMGROEP.van,
        to: STAMGROEP.tot,
      }),
    );

    const tweede = await groups.voegLidToe({
      studentId: aya.id,
      groupId: groep.id,
      from: TECHNIEKCLUB.van,
      to: TECHNIEKCLUB.tot,
    });

    expect(fout(tweede)).toContain("zit al in deze groep");
    expect(waarde(await groups.leden(groep.id))).toHaveLength(1);
  });

  it("laat twee periodes na elkaar in dezelfde groep wel toe (INV-25)", async () => {
    const groep = await eenGroep();
    const aya = await eenLeerling();

    waarde(
      await groups.voegLidToe({
        studentId: aya.id,
        groupId: groep.id,
        from: "2026-08-24",
        to: "2026-12-19",
      }),
    );
    const tweede = await groups.voegLidToe({
      studentId: aya.id,
      groupId: groep.id,
      from: "2027-01-05",
      to: "2027-07-17",
    });

    expect(waarde(tweede).from).toBe("2027-01-05");
  });

  it("weigert een einddatum vóór de begindatum (INV-24)", async () => {
    const groep = await eenGroep();
    const aya = await eenLeerling();

    const uitkomst = await groups.voegLidToe({
      studentId: aya.id,
      groupId: groep.id,
      from: "2026-11-03",
      to: "2026-09-08",
    });

    expect(fout(uitkomst)).toContain("einddatum");
  });

  it("sluit bij uit dienst alle lopende lidmaatschappen af (FR-INS-04)", async () => {
    const schoolYearId = await schooljaar();
    const stam = waarde(
      await groups.maak({ name: "Groep 4", kind: "stamgroep", colour: "series-1", schoolYearId }),
    );
    const club = waarde(
      await groups.maak({
        name: "Techniekclub",
        kind: "projectgroep",
        colour: "series-2",
        schoolYearId,
      }),
    );
    const kjeld = await eenLeerling("Kjeld");

    waarde(await groups.voegLidToe({ studentId: kjeld.id, groupId: stam.id, from: "2026-08-24" }));
    waarde(await groups.voegLidToe({ studentId: kjeld.id, groupId: club.id, from: "2026-11-03" }));

    const afgesloten = waarde(await groups.uitDienst(kjeld.id, "2026-12-19"));
    expect(afgesloten).toBe(2);

    const zitIn = waarde(await groups.zitIn(kjeld.id));
    expect(zitIn.map((lid) => lid.to)).toEqual(["2026-12-19", "2026-12-19"]);
    // De leerling zelf blijft bestaan; alleen zijn lidmaatschappen zijn afgelopen.
    expect(waarde(await students.lijst())).toHaveLength(1);
  });

  it("telt de rev van de groep op bij elke wijziging aan het aggregaat (§9.6, §10.8)", async () => {
    const groep = await eenGroep();
    const aya = await eenLeerling();

    waarde(await groups.voegLidToe({ studentId: aya.id, groupId: groep.id, from: "2026-08-24" }));

    const opnieuw = waarde(await storage.read("groups", groep.id));
    expect(opnieuw!.rev).toBe(groep.rev + 1);
  });
});

describe("SeriesService — FR-INS-11, FR-INS-12", () => {
  it("bewaart naam, kleur en beschrijving (FR-INS-11)", async () => {
    const reeks = waarde(
      await series.maak({
        name: REEKSEN[0].naam,
        colour: "series-1",
        description: "Vier delen over het kunstwerk bij de haven.",
      }),
    );

    expect(reeks.name).toBe("Kunstwerk Dok");
    expect(reeks.colour).toBe("series-1");
    expect(reeks.description).toContain("Vier delen");
  });

  it("weigert een naam boven zestig tekens (FR-INS-11)", async () => {
    const uitkomst = await series.maak({ name: "a".repeat(61), colour: "series-1" });

    expect(fout(uitkomst)).toContain("te lang");
  });

  it("laat documentaties bestaan bij het verwijderen van een reeks (FR-INS-12, INV-20)", async () => {
    const reeks = waarde(await series.maak({ name: "ONDERZOEK Natuur", colour: "series-2" }));
    const geopend = waarde(
      await documentation.maak({
        title: "Wat we vonden bij de sloot",
        date: "2026-08-10",
        studentIds: [],
        text: "Drie kinderen schepten water uit de sloot.",
      }),
    );
    const documentatie = waarde(
      await storage.update("documentations", geopend.documentatie.id, { seriesId: reeks.id }),
    );

    expect(waarde(await series.aantalDocumentaties(reeks.id))).toBe(1);

    const losgemaakt = waarde(await series.verwijder(reeks.id));
    expect(losgemaakt).toBe(1);

    const daarna = waarde(await storage.read("documentations", documentatie.id));
    expect(daarna).not.toBeNull();
    expect(daarna!.seriesId).toBeNull();
    expect(daarna!.title).toBe("Wat we vonden bij de sloot");
    expect(waarde(await series.lijst())).toHaveLength(0);
  });
});

describe("het schooljaar — FR-INS-26, INV-28", () => {
  it("bestaat niet zolang je er geen hebt ingesteld (FR-INS-26)", async () => {
    const agenda = createAgendaService({ storage });

    expect(waarde(await agenda.huidigSchooljaar())).toBeNull();
  });

  it("weigert een laatste schooldag vóór de eerste (INV-28)", async () => {
    const agenda = createAgendaService({ storage });

    const uitkomst = await agenda.zetSchooljaar({
      name: "2026-2027",
      firstSchoolDay: "2027-07-17",
      lastSchoolDay: "2026-08-24",
      region: "midden",
    });

    expect(fout(uitkomst)).toContain("laatste schooldag");
  });

  it("wijzigt het lopende jaar in plaats van er een tweede naast te zetten (INV-28)", async () => {
    const agenda = createAgendaService({ storage });

    waarde(
      await agenda.zetSchooljaar({
        name: "2026-2027",
        firstSchoolDay: STAMGROEP.van,
        lastSchoolDay: STAMGROEP.tot,
        region: "midden",
      }),
    );
    waarde(
      await agenda.zetSchooljaar({
        name: "2027-2028",
        firstSchoolDay: "2027-08-23",
        lastSchoolDay: "2028-07-14",
        region: "noord",
      }),
    );

    expect(waarde(await storage.list("schoolYears"))).toHaveLength(1);
    expect(waarde(await agenda.huidigSchooljaar())!.name).toBe("2027-2028");
  });
});

describe("de verzonnen groep — werkopdracht D02", () => {
  it("zet twintig leerlingen, drie groepen en drie reeksen klaar", async () => {
    const vulling = waarde(await sampleData.vulVerzonnenGroep());

    expect(vulling.leerlingen).toBe(GROEP_4.length);
    expect(vulling.groepen).toBe(GROEPEN.length);
    expect(vulling.reeksen).toBe(REEKSEN.length);
    expect(vulling.lidmaatschappen).toBe(
      GROEPEN.reduce((totaal, groep) => totaal + groep.leden.length, 0),
    );
  });

  it("zet Noa V. tegelijk in Groep 4 en in de Techniekclub (F-22, FR-INS-07)", async () => {
    waarde(await sampleData.vulVerzonnenGroep());

    const alle = waarde(await students.lijst());
    const noa = alle.find((leerling) => weergavenaam(leerling) === "Noa V.")!;
    const zitIn = waarde(await groups.zitIn(noa.id));

    expect(zitIn).toHaveLength(2);
    expect(zitIn.map((lid) => lid.from)).toEqual([STAMGROEP.van, TECHNIEKCLUB.van]);
  });

  it("vult niet een tweede keer over een bestaande lijst heen", async () => {
    waarde(await sampleData.vulVerzonnenGroep());

    expect(fout(await sampleData.vulVerzonnenGroep())).toContain("al leerlingen");
  });
});
