/**
 * Toetsen bij werkopdracht D09a — de agenda en het vakantiebestand.
 *
 * Elke toets draagt het `FR-`nummer dat hij bewijst in zijn naam (DR-40). De keten
 * draait zonder browser: de opslag is een echte IndexedDB uit `fake-indexeddb` en
 * het vakantiebestand komt als afhankelijkheid binnen (DR-12).
 *
 * De belangrijkste toets is die van `FR-AGE-11`. Een school past haar
 * herfstvakantie aan, en een half jaar later komt er een nieuw vakantiebestand.
 * Overleeft die aanpassing dat niet, dan is de eerste update het moment waarop de
 * school haar eigen data kwijt is — en dat merkt niemand tot het augustus is.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import {
  createAgendaService,
  dagenVanItem,
  perDag,
  standaardWeergave,
  type AgendaService,
} from "./agenda/AgendaService";
import {
  createHolidayService,
  WAARSCHUW_DAGEN_VOORAF,
  type HolidayService,
  type Vakantiebestand,
} from "./agenda/HolidayService";
import { jaardagen, jaarmaanden, jaartellingen, JAAR_MAANDEN } from "./agenda/schooljaar";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-08-13T10:00:00.000Z";

/** Een klein bestand met één schooljaar en één regio; genoeg voor elke regel. */
function bestand(versie = 2, herfstTot = "2026-10-25"): Vakantiebestand {
  return {
    schemaVersion: versie,
    publishedAt: "2026-06-01",
    validUntil: "2029-08-31",
    source: "toets",
    years: [
      {
        schoolYear: "2026-2027",
        regions: {
          midden: [
            { key: "herfst", name: "Herfstvakantie", from: "2026-10-17", to: herfstTot, fixed: false },
            { key: "kerst", name: "Kerstvakantie", from: "2026-12-19", to: "2027-01-03", fixed: true },
            { key: "voorjaar", name: "Voorjaarsvakantie", from: "2027-02-20", to: "2027-02-28", fixed: false },
            { key: "mei", name: "Meivakantie", from: "2027-04-24", to: "2027-05-09", fixed: false },
            { key: "zomer", name: "Zomervakantie", from: "2027-07-17", to: "2027-08-29", fixed: true },
          ],
        },
      },
    ],
  };
}

let storage: StorageService;
let agenda: AgendaService;
let holidays: HolidayService;
let klok: { now: () => Date; verzet: (naar: string) => void };

function stilstaandeKlok(start: string) {
  let moment = new Date(start);
  return { now: () => moment, verzet: (naar: string) => void (moment = new Date(naar)) };
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  klok = stilstaandeKlok(NU);
  storage = createStorageService({ db, clock: klok, origin: APPARAAT });
  agenda = createAgendaService({ storage });
  holidays = createHolidayService({ storage, bestand: bestand(), clock: klok });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

function fout(uitkomst: { ok: boolean; error?: { message: string } }): string {
  if (uitkomst.ok) throw new Error("hoort te falen");
  return uitkomst.error!.message;
}

describe("het vakantiebestand komt binnen — §13.4", () => {
  it("vult de leescache met alle rijen", async () => {
    await holidays.synchroniseer();

    const vakanties = waarde(await holidays.vakanties("2026-2027", "midden"));
    expect(vakanties.map((rij) => rij.holidayKey)).toEqual([
      "herfst",
      "kerst",
      "voorjaar",
      "mei",
      "zomer",
    ]);
  });

  it("vult niet opnieuw bij dezelfde versie", async () => {
    await holidays.synchroniseer();
    const eerste = waarde(await storage.list("holidayPeriods")).map((rij) => rij.id);

    await holidays.synchroniseer();
    const tweede = waarde(await storage.list("holidayPeriods")).map((rij) => rij.id);

    expect(tweede).toEqual(eerste);
  });

  it("draagt de bestandsversie op elke rij", async () => {
    await holidays.synchroniseer();

    for (const rij of waarde(await storage.list("holidayPeriods"))) {
      expect(rij.fileVersion).toBe(2);
    }
  });
});

describe("vaste vakanties zijn niet te bewerken — FR-AGE-09, INV-32", () => {
  beforeEach(async () => {
    await holidays.synchroniseer();
  });

  it("weigert de kerstvakantie", async () => {
    const uitkomst = await holidays.pasAan("2026-2027", "midden", "kerst", "2026-12-20", "2027-01-04");

    expect(fout(uitkomst)).toBe("Kerst- en zomervakantie liggen landelijk vast.");
  });

  it("weigert de zomervakantie", async () => {
    const uitkomst = await holidays.pasAan("2026-2027", "midden", "zomer", "2027-07-18", "2027-08-30");

    expect(uitkomst.ok).toBe(false);
  });

  it("laat de herfstvakantie wel aanpassen (FR-AGE-10)", async () => {
    await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-19", "2026-10-27");

    const herfst = waarde(await holidays.vakanties("2026-2027", "midden"))[0]!;
    expect(herfst.from).toBe("2026-10-19");
    expect(herfst.aangepast).toBe(true);
    expect(herfst.landelijk).toEqual({ from: "2026-10-17", to: "2026-10-25" });
  });

  it("laat het bronbestand ongemoeid (FR-AGE-10)", async () => {
    await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-19", "2026-10-27");

    const rij = waarde(await storage.list("holidayPeriods")).find((r) => r.holidayKey === "herfst")!;
    expect(rij.from).toBe("2026-10-17");
  });

  it("weigert een einde vóór het begin", async () => {
    const uitkomst = await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-25", "2026-10-17");

    expect(fout(uitkomst)).toMatch(/ligt vóór het begin/u);
  });

  it("herstelt naar de landelijke datums", async () => {
    await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-19", "2026-10-27");
    await holidays.herstel("2026-2027", "midden", "herfst");

    const herfst = waarde(await holidays.vakanties("2026-2027", "midden"))[0]!;
    expect(herfst.from).toBe("2026-10-17");
    expect(herfst.aangepast).toBe(false);
  });
});

describe("aanpassingen overleven een update — FR-AGE-11, B-50", () => {
  it("houdt de eigen datums vast na een nieuwer bestand", async () => {
    await holidays.synchroniseer();
    await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-19", "2026-10-27");

    // Een nieuwer bestand waarin de herfstvakantie landelijk is verschoven.
    const nieuwer = createHolidayService({
      storage,
      bestand: bestand(3, "2026-10-24"),
      clock: klok,
    });
    await nieuwer.synchroniseer();

    const herfst = waarde(await nieuwer.vakanties("2026-2027", "midden"))[0]!;
    expect(herfst.from).toBe("2026-10-19");
    expect(herfst.to).toBe("2026-10-27");
    expect(herfst.landelijk).toEqual({ from: "2026-10-17", to: "2026-10-24" });
  });

  it("meldt welke aangepaste vakantie landelijk is verschoven", async () => {
    await holidays.synchroniseer();
    await holidays.pasAan("2026-2027", "midden", "herfst", "2026-10-19", "2026-10-27");

    const nieuwer = createHolidayService({ storage, bestand: bestand(3, "2026-10-24"), clock: klok });
    const gewijzigd = waarde(await nieuwer.synchroniseer());

    expect(gewijzigd).toHaveLength(1);
    expect(gewijzigd[0]!.name).toBe("Herfstvakantie");
  });

  it("zwijgt over een vakantie waar geen aanpassing op ligt", async () => {
    await holidays.synchroniseer();

    const nieuwer = createHolidayService({ storage, bestand: bestand(3, "2026-10-24"), clock: klok });

    expect(waarde(await nieuwer.synchroniseer())).toEqual([]);
  });
});

describe("een aflopend bestand meldt zichzelf — FR-AGE-12, B-50", () => {
  it("zwijgt zolang het einde ver weg is", () => {
    expect(holidays.verlooptBinnenkort()).toBeNull();
  });

  it("meldt zich binnen honderdtwintig dagen", () => {
    klok.verzet("2029-06-01T10:00:00.000Z");

    expect(holidays.verlooptBinnenkort()).toBe(
      "De vakantiegegevens lopen af op 31 augustus 2029. Vanaf dan voer je vakanties zelf in.",
    );
  });

  it("gebruikt de grens uit §6.2.4", () => {
    expect(WAARSCHUW_DAGEN_VOORAF).toBe(120);
  });
});

describe("een oudergesprek heeft precies één leerling — FR-AGE-04", () => {
  it("weigert er nul", async () => {
    const uitkomst = await agenda.maak({
      title: "Gesprek",
      kind: "oudergesprek",
      allDay: false,
      start: "2026-09-01T14:00:00.000Z",
      end: "2026-09-01T14:30:00.000Z",
    });

    expect(fout(uitkomst)).toMatch(/precies één leerling/u);
  });

  it("weigert er twee", async () => {
    const uitkomst = await agenda.maak({
      title: "Gesprek",
      kind: "oudergesprek",
      allDay: false,
      start: "2026-09-01T14:00:00.000Z",
      end: "2026-09-01T14:30:00.000Z",
      studentIds: [newId(), newId()],
    });

    expect(uitkomst.ok).toBe(false);
  });

  it("neemt er één aan", async () => {
    const uitkomst = await agenda.maak({
      title: "Gesprek",
      kind: "oudergesprek",
      allDay: false,
      start: "2026-09-01T14:00:00.000Z",
      end: "2026-09-01T14:30:00.000Z",
      studentIds: [newId()],
    });

    expect(uitkomst.ok).toBe(true);
  });
});

describe("een item eindigt niet vóór het begint — FR-AGE-03, INV-30", () => {
  it("weigert een einde dat eerder ligt", async () => {
    const uitkomst = await agenda.maak({
      title: "Studiedag",
      kind: "studiedag",
      allDay: true,
      start: "2026-09-10",
      end: "2026-09-09",
    });

    expect(fout(uitkomst)).toMatch(/einde ligt vóór het begin/u);
  });
});

describe("wat er op een dag staat", () => {
  it("zet een hele-dag-item op elke dag die het beslaat", () => {
    const item = {
      allDay: true as const,
      start: "2026-10-17",
      end: "2026-10-25",
    } as never;

    expect(dagenVanItem(item)).toHaveLength(9);
  });

  it("verdeelt items over de dagen van de periode", async () => {
    waarde(
      await agenda.maak({
        title: "Studiedag",
        kind: "studiedag",
        allDay: true,
        start: "2026-09-10",
        end: "2026-09-11",
      }),
    );
    const items = waarde(await agenda.periode("2026-09-07", "2026-09-13"));
    const kaart = perDag(items, "2026-09-07", "2026-09-13");

    expect(kaart.get("2026-09-09")).toHaveLength(0);
    expect(kaart.get("2026-09-10")).toHaveLength(1);
    expect(kaart.get("2026-09-11")).toHaveLength(1);
    expect(kaart.size).toBe(7);
  });

  it("laat een item buiten de periode weg", async () => {
    await agenda.maak({
      title: "Ver weg",
      kind: "studiedag",
      allDay: true,
      start: "2027-01-10",
      end: "2027-01-10",
    });

    expect(waarde(await agenda.periode("2026-09-07", "2026-09-13"))).toEqual([]);
  });
});

describe("welke weergave opengaat — FR-AGE-07, FR-AGE-08, B-31", () => {
  it("start in de zomer in het jaar", () => {
    expect(standaardWeergave(new Date(2026, 6, 1), 1280)).toBe("jaar");
    expect(standaardWeergave(new Date(2026, 8, 15), 1280)).toBe("jaar");
  });

  it("start daarbuiten in de week", () => {
    expect(standaardWeergave(new Date(2026, 8, 16), 1280)).toBe("week");
    expect(standaardWeergave(new Date(2026, 10, 3), 1280)).toBe("week");
  });

  it("start op de telefoon altijd in de dag (FR-AGE-08)", () => {
    expect(standaardWeergave(new Date(2026, 6, 1), 390)).toBe("dag");
    expect(standaardWeergave(new Date(2026, 10, 3), 390)).toBe("dag");
  });

  it("kiest onder 1024 px geen jaar, ook niet in de zomer", () => {
    expect(standaardWeergave(new Date(2026, 6, 1), 900)).toBe("week");
  });
});

describe("het schooljaar als raster — §6.2.3, B-10", () => {
  const opzet = {
    firstSchoolDay: "2026-08-24",
    lastSchoolDay: "2027-07-16",
    vakanties: [
      {
        schoolYearName: "2026-2027",
        region: "midden" as const,
        holidayKey: "herfst",
        name: "Herfstvakantie",
        from: "2026-10-17",
        to: "2026-10-25",
        fixed: false,
        aangepast: false,
        landelijk: null,
      },
    ],
    items: [],
  };

  it("geeft elke dag van het schooljaar een soort", () => {
    const dagen = jaardagen(opzet);

    expect(dagen.get("2026-08-24")!.soort).toBe("schooldag");
    expect(dagen.get("2026-08-29")!.soort).toBe("weekend");
    expect(dagen.get("2026-10-19")!.soort).toBe("vakantie");
    expect(dagen.get("2026-10-19")!.holidayKey).toBe("herfst");
  });

  it("kent geen dagen buiten het schooljaar", () => {
    const dagen = jaardagen(opzet);

    expect(dagen.has("2026-08-23")).toBe(false);
    expect(dagen.has("2027-07-17")).toBe(false);
  });

  it("laat een studiedag boven een vakantie gaan", () => {
    const dagen = jaardagen({
      ...opzet,
      items: [
        {
          kind: "studiedag",
          allDay: true,
          start: "2026-10-19",
          end: "2026-10-19",
          title: "Teamdag",
        } as never,
      ],
    });

    expect(dagen.get("2026-10-19")!.soort).toBe("studiedag");
    expect(dagen.get("2026-10-19")!.label).toBe("Teamdag");
  });

  it("telt vakantiedagen zonder het weekend mee te rekenen", () => {
    const telling = jaartellingen(jaardagen(opzet));

    // De herfstvakantie van 17 t/m 25 oktober telt vijf schooldagen.
    expect(telling.vakantiedagen).toBe(5);
    expect(telling.schooldagen).toBeGreaterThan(200);
  });

  it("levert twaalf maandkolommen", () => {
    const maanden = jaarmaanden(opzet.firstSchoolDay, jaardagen(opzet));

    expect(maanden).toHaveLength(JAAR_MAANDEN);
    expect(maanden[0]!.maand).toBe("2026-08-01");
    expect(maanden[11]!.maand).toBe("2027-07-01");
  });

  it("vult elke maand met zijn eigen aantal dagen", () => {
    const maanden = jaarmaanden(opzet.firstSchoolDay, jaardagen(opzet));

    expect(maanden[0]!.dagen).toHaveLength(31);
    // Februari 2027 telt er 28.
    expect(maanden.find((maand) => maand.maand === "2027-02-01")!.dagen).toHaveLength(28);
  });

  it("zet dagen buiten het schooljaar op buiten", () => {
    const augustus = jaarmaanden(opzet.firstSchoolDay, jaardagen(opzet))[0]!;

    expect(augustus.dagen[0]!.soort).toBe("buiten");
    expect(augustus.dagen[23]!.soort).toBe("schooldag");
  });
});

describe("twee keer synchroniseren vult niet twee keer", () => {
  it("levert bij gelijktijdige aanroepen één set rijen op", async () => {
    // React voert een effect in ontwikkelmodus twee keer uit. Zonder grendel zien
    // beide aanroepen een lege tabel en schrijven ze er allebei vijf rijen in.
    await Promise.all([holidays.synchroniseer(), holidays.synchroniseer()]);

    expect(waarde(await storage.list("holidayPeriods"))).toHaveLength(5);
    expect(waarde(await holidays.vakanties("2026-2027", "midden"))).toHaveLength(5);
  });

  it("toont elke vakantie één keer, ook als de tabel ooit dubbel is gevuld", async () => {
    await holidays.synchroniseer();
    // Een dubbele rij zoals een eerdere versie hem kon achterlaten.
    await storage.create("holidayPeriods", {
      schoolYearName: "2026-2027",
      region: "midden",
      holidayKey: "herfst",
      name: "Herfstvakantie",
      from: "2026-10-17",
      to: "2026-10-25",
      fixed: false,
      fileVersion: 2,
    });

    expect(waarde(await holidays.vakanties("2026-2027", "midden"))).toHaveLength(5);
  });
});
