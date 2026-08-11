/**
 * Toetsen op de opslaglaag, tegen een echte IndexedDB.
 *
 * `fake-indexeddb` is geen nabootsing van het gedrag maar een echte
 * implementatie van de standaard, dus transacties, indexen en sleutels doen hier
 * wat ze in de browser ook doen. Een nagebootste opslag zou precies de fouten
 * verbergen die deze laag moet voorkomen.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { newId } from "@/lib/uuid";

import { maakDatabase, type EduFlowDatabase } from "./db";
import { createStorageService, OPSLAGDREMPEL, type StorageService } from "./StorageService";

const APPARAAT = newId();

/** Een klok die stilstaat tenzij een toets hem verzet (§10.3). */
function stilstaandeKlok(start = "2026-08-09T12:00:00.000Z") {
  let moment = new Date(start);
  return {
    now: () => moment,
    verzet: (naar: string) => {
      moment = new Date(naar);
    },
  };
}

function nieuweLeerling(naam = "Kjeld") {
  return {
    firstName: naam,
    firstNameLower: naam.toLowerCase(),
    lastNameInitial: "",
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    note: "",
    pseudonymSeed: 1,
  };
}

let db: EduFlowDatabase;
let opslag: StorageService;
let klok: ReturnType<typeof stilstaandeKlok>;
let leesfouten: string[];

beforeEach(async () => {
  // Elke toets zijn eigen database, anders lekt de ene toets in de andere.
  db = maakDatabase(`toets-${newId()}`);
  klok = stilstaandeKlok();
  leesfouten = [];
  opslag = createStorageService({
    db,
    clock: klok,
    origin: APPARAAT,
    onLeesfout: (tabel, id) => leesfouten.push(`${tabel}:${id}`),
  });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

describe("create — §8.1.3, §8.1.4", () => {
  it("vult de zes basisvelden zelf in", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));

    expect(leerling.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    expect(leerling.createdAt).toBe("2026-08-09T12:00:00.000Z");
    expect(leerling.updatedAt).toBe(leerling.createdAt);
    expect(leerling.deletedAt).toBeNull();
    expect(leerling.rev).toBe(1);
    expect(leerling.origin).toBe(APPARAAT);
    expect(leerling.schemaVersion).toBe(1);
  });

  it("werpt bij gegevens die niet door het schema komen (DR-23)", async () => {
    // Een cijfer in een voornaam is een fout in de code erboven, geen toestand
    // waar de gebruiker iets mee kan. Die hoort luid te zijn.
    await expect(
      opslag.create("students", { ...nieuweLeerling(), firstName: "Kjeld2" }),
    ).rejects.toThrow(/students/);
  });

  it("laat een aanroeper de basisvelden niet zelf zetten", async () => {
    // Het type houdt dit al tegen — `Nieuw<N>` laat de zes velden weg — dus deze
    // toets moet langs de compiler heen om er überhaupt bij te kunnen. Wat hij
    // vastlegt is de tweede grendel: de service zet ze ná de spread, dus wint hij
    // altijd. Een `rev` van 99 op een nieuw record zou INV-03 meteen breken.
    const gesmokkeld = { ...nieuweLeerling(), rev: 99, origin: "iemand-anders" } as never;

    const leerling = waarde(await opslag.create("students", gesmokkeld));

    expect(leerling.rev).toBe(1);
    expect(leerling.origin).toBe(APPARAAT);
  });
});

describe("update — INV-03", () => {
  it("telt rev met precies één op en laat createdAt staan", async () => {
    const eerst = waarde(await opslag.create("students", nieuweLeerling()));
    klok.verzet("2026-08-10T09:00:00.000Z");

    const daarna = waarde(await opslag.update("students", eerst.id, { note: "let op" }));

    expect(daarna.rev).toBe(2);
    expect(daarna.createdAt).toBe(eerst.createdAt);
    expect(daarna.updatedAt).toBe("2026-08-10T09:00:00.000Z");
    expect(daarna.note).toBe("let op");
  });

  it("telt bij elke schrijfactie door", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    for (const nummer of [2, 3, 4]) {
      const na = waarde(await opslag.update("students", leerling.id, { note: `${nummer}` }));
      expect(na.rev).toBe(nummer);
    }
  });

  it("laat een aanroeper rev en createdAt niet overschrijven", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    const stiekem = { note: "x", rev: 99, createdAt: "2020-01-01T00:00:00.000Z" } as never;

    const na = waarde(await opslag.update("students", leerling.id, stiekem));

    expect(na.rev).toBe(2);
    expect(na.createdAt).toBe(leerling.createdAt);
  });
});

describe("verwijderen is markeren — §8.1.6, INV-02", () => {
  it("zet deletedAt en laat het record staan", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    klok.verzet("2026-08-11T08:00:00.000Z");

    const weg = waarde(await opslag.softDelete("students", leerling.id));

    expect(weg.deletedAt).toBe("2026-08-11T08:00:00.000Z");
    expect(weg.rev).toBe(2);
    expect(await db.students.get(leerling.id)).toBeDefined();
  });

  it("houdt een verwijderd record uit elke lijst", async () => {
    const blijft = waarde(await opslag.create("students", nieuweLeerling("Aya")));
    const gaat = waarde(await opslag.create("students", nieuweLeerling("Bram")));
    await opslag.softDelete("students", gaat.id);

    const lijst = waarde(await opslag.list("students"));

    expect(lijst.map((l) => l.id)).toEqual([blijft.id]);
  });

  it("geeft een verwijderd record ook niet terug bij read", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    await opslag.softDelete("students", leerling.id);

    expect(waarde(await opslag.read("students", leerling.id))).toBeNull();
  });

  it("toont hem wel in de prullenbak", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    await opslag.softDelete("students", leerling.id);

    const prullenbak = waarde(await opslag.listDeleted("students"));

    expect(prullenbak.map((l) => l.id)).toEqual([leerling.id]);
  });

  it("haalt hem pas echt weg bij purge", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    await opslag.purge("students", leerling.id);

    expect(await db.students.get(leerling.id)).toBeUndefined();
  });
});

describe("het journaal — §9.6, §8.3.13", () => {
  it("schrijft één regel per schrijfactie, met de juiste bewerking", async () => {
    const leerling = waarde(await opslag.create("students", nieuweLeerling()));
    await opslag.update("students", leerling.id, { note: "x" });
    await opslag.softDelete("students", leerling.id);

    const regels = await db.changeLog.toArray();

    expect(regels.map((r) => r.op)).toEqual(["create", "update", "delete"]);
    expect(regels.map((r) => r.rev)).toEqual([1, 2, 3]);
    expect(regels.every((r) => r.table === "students")).toBe(true);
    expect(regels.every((r) => r.origin === APPARAAT)).toBe(true);
  });

  it("bevat geen veldwaarden", async () => {
    await opslag.create("students", nieuweLeerling("Hanaë"));

    const regel = (await db.changeLog.toArray())[0]!;

    expect(JSON.stringify(regel)).not.toContain("Hanaë");
  });

  it("laat niets achter als de schrijfactie faalt", async () => {
    // Eén transactie: mislukt hij, dan is er niets veranderd (§9.4 regel A).
    await expect(
      opslag.create("students", { ...nieuweLeerling(), firstName: "1" }),
    ).rejects.toThrow();

    expect(await db.changeLog.count()).toBe(0);
    expect(await db.students.count()).toBe(0);
  });
});

describe("één aggregaat, één transactie, één journaalregel — §10.7, §9.4 regel A", () => {
  /** Een documentatie met haar eerste pagina: het kleinste aggregaat met twee tabellen. */
  async function documentatieMetPagina() {
    return opslag.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
      const pagina = await schrijver.maak("pages", {
        documentationId: newId(),
        order: 1,
        layoutId: "B-verhaal",
        autoCreated: false,
        blocks: [],
      });
      const documentatie = await schrijver.maak("documentations", {
        title: "Kunstwerk",
        date: "2026-08-09",
        seriesId: null,
        studentIds: [],
        groupIds: [],
        pageIds: [pagina.id],
        privateNote: "",
        status: "concept",
        firstExportedAt: null,
        archivedAt: null,
        imageConsentAt: null,
      });
      return { documentatie, pagina };
    });
  }

  it("schrijft beide records en journaalt alleen de wortel", async () => {
    const { documentatie, pagina } = waarde(await documentatieMetPagina());

    expect(await db.documentations.count()).toBe(1);
    expect(await db.pages.count()).toBe(1);
    expect(documentatie.pageIds).toEqual([pagina.id]);

    // §9.6: één regel per gewijzigd aggregaat, met de wortelsleutel.
    const regels = await db.changeLog.toArray();
    expect(regels).toHaveLength(1);
    expect(regels[0]!.table).toBe("documentations");
    expect(regels[0]!.recordId).toBe(documentatie.id);
  });

  it("laat niets achter als één van de records faalt", async () => {
    const uitkomst = opslag.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
      await schrijver.maak("pages", {
        documentationId: newId(),
        order: 1,
        layoutId: "B-verhaal",
        autoCreated: false,
        blocks: [],
      });
      // Een documentatie zonder pagina's komt niet door INV-08.
      return schrijver.maak("documentations", {
        title: "Kunstwerk",
        date: "2026-08-09",
        seriesId: null,
        studentIds: [],
        groupIds: [],
        pageIds: [],
        privateNote: "",
        status: "concept",
        firstExportedAt: null,
        archivedAt: null,
        imageConsentAt: null,
      });
    });

    await expect(uitkomst).rejects.toThrow(/documentations/);
    expect(await db.pages.count()).toBe(0);
    expect(await db.changeLog.count()).toBe(0);
  });

  it("weigert een aggregaat waarin de wortel niet is geschreven", async () => {
    // Zonder ophoging van `rev` op de wortel is er geen versie van het geheel, en
    // daar leunt §10.8 op bij twee tabbladen.
    await expect(
      opslag.schrijfAggregaat("documentations", ["pages"], (schrijver) =>
        schrijver.maak("pages", {
          documentationId: newId(),
          order: 1,
          layoutId: "B-verhaal",
          autoCreated: false,
          blocks: [],
        }),
      ),
    ).rejects.toThrow(/wortel/);
  });

  it("telt de rev van de wortel op bij een wijziging binnen de grens", async () => {
    const { documentatie, pagina } = waarde(await documentatieMetPagina());
    klok.verzet("2026-08-10T09:00:00.000Z");

    const na = waarde(
      await opslag.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
        await schrijver.wijzig("pages", pagina.id, {
          blocks: [{ id: newId(), slot: 0, order: 1, kind: "text", text: "Vandaag geverfd." }],
        });
        return schrijver.wijzig("documentations", documentatie.id, { title: "Kunstwerk Dok" });
      }),
    );

    expect(na.rev).toBe(2);
    expect(na.title).toBe("Kunstwerk Dok");
    expect((await db.changeLog.toArray()).map((r) => r.rev)).toEqual([1, 2]);
  });
});

describe("lezen van een record dat niet meer klopt — §6.1.1", () => {
  it("slaat hem over en meldt hem, in plaats van de hele lijst te breken", async () => {
    const goed = waarde(await opslag.create("students", nieuweLeerling("Aya")));
    // Buiten de service om schrijven is precies wat een oudere versie van de app
    // gedaan zou kunnen hebben.
    await db.students.put({ ...goed, id: newId(), firstName: "Mees7" } as never);

    const lijst = waarde(await opslag.list("students"));

    expect(lijst.map((l) => l.firstName)).toEqual(["Aya"]);
    expect(leesfouten).toHaveLength(1);
  });
});

describe("opslaggebruik — INV-53, §9.8", () => {
  it("rekent de verhouding uit", async () => {
    const dienst = createStorageService({
      db,
      clock: klok,
      origin: APPARAAT,
      schatting: async () => ({ usage: 900, quota: 1000 }),
    });

    const gebruik = waarde(await dienst.usage());

    expect(gebruik.verhouding).toBeCloseTo(0.9);
    expect(gebruik.bekend).toBe(true);
    expect(gebruik.verhouding).toBeGreaterThan(OPSLAGDREMPEL);
  });

  it("waarschuwt niet als de browser geen schatting geeft", async () => {
    // Een waarschuwing op een gok is erger dan geen waarschuwing.
    const dienst = createStorageService({
      db,
      clock: klok,
      origin: APPARAAT,
      schatting: async () => undefined,
    });

    const gebruik = waarde(await dienst.usage());

    expect(gebruik.bekend).toBe(false);
    expect(gebruik.verhouding).toBe(0);
  });
});

describe("een volle opslag is een waarde, geen uitzondering — §10.3, T-27", () => {
  it("geeft STORAGE_FULL terug met een tekst voor de gebruiker", async () => {
    const vol = Object.assign(new Error("vol"), { name: "QuotaExceededError" });
    vi.spyOn(db.students, "add").mockRejectedValueOnce(vol);

    const uitkomst = await opslag.create("students", nieuweLeerling());

    expect(uitkomst.ok).toBe(false);
    if (uitkomst.ok) throw new Error("hoort te falen");
    expect(uitkomst.error.code).toBe("STORAGE_FULL");
    expect(uitkomst.error.recoverable).toBe(true);
    // §4.7: geen foutcode in de tekst zelf.
    expect(uitkomst.error.message).not.toContain("STORAGE_FULL");
  });

  it("laat een andere fout gewoon door", async () => {
    // Alleen een volle opslag is een toestand waar de gebruiker iets mee kan.
    // De rest is een fout in de code en hoort niet als nette waarde terug.
    vi.spyOn(db.students, "add").mockRejectedValueOnce(new Error("iets anders"));

    await expect(opslag.create("students", nieuweLeerling())).rejects.toThrow("iets anders");
  });
});

describe("alle zesentwintig tabellen zijn bereikbaar — §8.2", () => {
  it("opent elke store", async () => {
    await db.open();
    const namen = db.tables.map((t) => t.name).sort();

    // Vijfentwintig tabellen met een `id`, plus changeLog met een sleutel buiten
    // het record: samen de zesentwintig uit §8.3.
    expect(namen).toHaveLength(26);
    expect(namen).toContain("changeLog");
    expect(namen).toContain("weekPatternOverrides");
  });
});
