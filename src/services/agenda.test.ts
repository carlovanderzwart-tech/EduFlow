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

import { weekdag } from "@/lib/dates";
import { newId } from "@/lib/uuid";
import type { CalendarEvent } from "@/domain/types";

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
import { icsBestandsnaam, naarIcs } from "./agenda/IcsService";
import {
  createNotificationService,
  EERLIJKE_UITLEG,
  meldtekst,
  nuTeMelden,
  type Toestemming,
} from "./agenda/NotificationService";
import {
  afgekaptVoor,
  instanties,
  isVerschijning,
  metGat,
  reeksVan,
  verschijningen,
} from "./agenda/RecurrenceService";
import { jaardagen, jaarmaanden, jaartellingen, JAAR_MAANDEN } from "./agenda/schooljaar";
import { ontleed } from "./agenda/snelveld";
import {
  minutenVoor,
  naarDag,
  STAP_MINUTEN,
  stapVan,
  TOETSENHINT,
  verschoven,
} from "./agenda/verplaatsen";
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

/* ------------------------------------------------------------------ */
/* D09b — herhalen (§6.2.5, B-123)                                    */
/* ------------------------------------------------------------------ */

describe("de drie regels van §6.2.5 — B-123", () => {
  const wekelijks = { frequency: "wekelijks" as const, until: null, count: 4, excludedDates: [] };

  it("telt wekelijks zeven dagen op", () => {
    expect(instanties("2026-09-01", wekelijks).map((i) => i.dag)).toEqual([
      "2026-09-01",
      "2026-09-08",
      "2026-09-15",
      "2026-09-22",
    ]);
  });

  it("telt tweewekelijks veertien dagen op", () => {
    const regel = { ...wekelijks, frequency: "tweewekelijks" as const, count: 3 };

    expect(instanties("2026-09-01", regel).map((i) => i.dag)).toEqual([
      "2026-09-01",
      "2026-09-15",
      "2026-09-29",
    ]);
  });

  it("houdt maandelijks dezelfde weekdag aan en niet dezelfde datum", () => {
    // 1 september 2026 is de eerste dinsdag; de reeks blijft op de eerste dinsdag.
    const regel = { ...wekelijks, frequency: "maandelijks" as const, count: 4 };
    const dagen = instanties("2026-09-01", regel).map((i) => i.dag);

    expect(dagen).toEqual(["2026-09-01", "2026-10-06", "2026-11-03", "2026-12-01"]);
    for (const dag of dagen) expect(weekdag(dag)).toBe(2);
  });

  it("valt terug op de laatste als de hoeveelste weekdag niet bestaat", () => {
    // 29 september 2026 is de vijfde dinsdag; oktober heeft er ook vijf, november niet.
    const regel = { ...wekelijks, frequency: "maandelijks" as const, count: 3 };
    const dagen = instanties("2026-09-29", regel).map((i) => i.dag);

    expect(dagen).toHaveLength(3);
    for (const dag of dagen) expect(weekdag(dag)).toBe(2);
    // November 2026 heeft vier dinsdagen; de laatste is de 24e.
    expect(dagen[2]).toBe("2026-11-24");
  });

  it("stopt op de einddatum", () => {
    const regel = { frequency: "wekelijks" as const, until: "2026-09-16", count: null, excludedDates: [] };

    expect(instanties("2026-09-01", regel).map((i) => i.dag)).toEqual([
      "2026-09-01",
      "2026-09-08",
      "2026-09-15",
    ]);
  });

  it("slaat een gat over maar telt het wel mee (§6.2.5)", () => {
    const regel = { ...wekelijks, excludedDates: ["2026-09-08"] };
    const dagen = instanties("2026-09-01", regel).map((i) => i.dag);

    // Vier keer, waarvan één een gat: er blijven er drie over en de reeks
    // schuift niet op.
    expect(dagen).toEqual(["2026-09-01", "2026-09-15", "2026-09-22"]);
  });
});

describe("verschijningen binnen een periode", () => {
  async function wekelijkseAfspraak() {
    return waarde(
      await agenda.maak({
        title: "Gymles",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-01T08:00:00.000Z",
        end: "2026-09-01T09:00:00.000Z",
        recurrence: { frequency: "wekelijks", until: null, count: 6, excludedDates: [] },
      }),
    );
  }

  it("levert alleen wat de periode raakt", async () => {
    const item = await wekelijkseAfspraak();

    expect(verschijningen(item, "2026-09-07", "2026-09-13")).toHaveLength(1);
    expect(verschijningen(item, "2026-09-01", "2026-09-30")).toHaveLength(5);
  });

  it("houdt de eerste zijn eigen sleutel", async () => {
    const item = await wekelijkseAfspraak();
    const alle = verschijningen(item, "2026-09-01", "2026-10-31");

    expect(alle[0]!.id).toBe(item.id);
    expect(isVerschijning(alle[0]!.id)).toBe(false);
    expect(isVerschijning(alle[1]!.id)).toBe(true);
    expect(reeksVan(alle[1]!.id)).toBe(item.id);
  });

  it("schuift de tijden mee", async () => {
    const item = await wekelijkseAfspraak();
    const tweede = verschijningen(item, "2026-09-01", "2026-10-31")[1]!;

    expect(tweede.start).toBe("2026-09-08T08:00:00.000Z");
    expect(tweede.end).toBe("2026-09-08T09:00:00.000Z");
    expect(tweede.recurrence).toBeNull();
  });

  it("laat een item zonder herhaling met rust", async () => {
    const item = waarde(
      await agenda.maak({
        title: "Eenmalig",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-01T08:00:00.000Z",
        end: "2026-09-01T09:00:00.000Z",
      }),
    );

    expect(verschijningen(item, "2026-01-01", "2027-01-01")).toEqual([item]);
  });
});

describe("alleen deze, of alle volgende — FR-AGE-15", () => {
  const regel = { frequency: "wekelijks" as const, until: null, count: 6, excludedDates: [] };

  it("maakt met een gat één dag los en laat de rest staan", () => {
    const na = metGat(regel, "2026-09-15");

    expect(na.excludedDates).toEqual(["2026-09-15"]);
    expect(instanties("2026-09-01", na).map((i) => i.dag)).not.toContain("2026-09-15");
    expect(instanties("2026-09-01", na)).toHaveLength(5);
  });

  it("zet hetzelfde gat niet twee keer neer", () => {
    expect(metGat(metGat(regel, "2026-09-15"), "2026-09-15").excludedDates).toHaveLength(1);
  });

  it("kapt bij alle volgende af op de dag ervóór", () => {
    const na = afgekaptVoor(regel, "2026-09-15");

    expect(na.until).toBe("2026-09-14");
    expect(na.count).toBeNull();
    expect(instanties("2026-09-01", na).map((i) => i.dag)).toEqual(["2026-09-01", "2026-09-08"]);
  });

  it("laat het verleden met rust bij het afkappen", () => {
    const metOudGat = { ...regel, excludedDates: ["2026-09-08", "2026-09-22"] };
    const na = afgekaptVoor(metOudGat, "2026-09-15");

    expect(na.excludedDates).toEqual(["2026-09-08"]);
  });
});

/* ------------------------------------------------------------------ */
/* D09b — het snelveld (§6.2.5, FR-AGE-13, FR-AGE-14)                 */
/* ------------------------------------------------------------------ */

describe("het snelveld ontleedt lokaal — FR-AGE-13", () => {
  // 1 september 2026 is een dinsdag.
  const VANDAAG = "2026-09-01";
  const NOA_B = newId();
  const NOA_V = newId();
  const LIJST = {
    leerlingen: [
      { id: NOA_B, naam: "Noa B." },
      { id: NOA_V, naam: "Noa V." },
      { id: newId(), naam: "Kjeld" },
    ],
  };

  it("leest het voorbeeld uit §6.2.5", () => {
    const uit = ontleed("dinsdag 14u oudergesprek Noa V.", VANDAAG, LIJST);

    expect(uit.kind).toBe("oudergesprek");
    expect(uit.dag).toBe("2026-09-01");
    expect(uit.van).toBe("14:00");
    expect(uit.studentIds).toEqual([NOA_V]);
    expect(uit.duurMinuten).toBe(30);
  });

  it("pakt de langste naam en niet de kortste", () => {
    // "Noa B." mag niet als "Noa" eindigen met een losse B in de titel.
    const uit = ontleed("gesprek Noa B.", VANDAAG, LIJST);

    expect(uit.studentIds).toEqual([NOA_B]);
    expect(uit.titel).not.toMatch(/B\./u);
  });

  it("kent vandaag, morgen en overmorgen", () => {
    expect(ontleed("morgen overleg", VANDAAG, LIJST).dag).toBe("2026-09-02");
    expect(ontleed("overmorgen overleg", VANDAAG, LIJST).dag).toBe("2026-09-03");
    expect(ontleed("vandaag overleg", VANDAAG, LIJST).dag).toBe("2026-09-01");
  });

  it("kiest bij een weekdag de eerstvolgende, vandaag meegeteld", () => {
    expect(ontleed("dinsdag overleg", VANDAAG, LIJST).dag).toBe("2026-09-01");
    expect(ontleed("woensdag overleg", VANDAAG, LIJST).dag).toBe("2026-09-02");
    expect(ontleed("maandag overleg", VANDAAG, LIJST).dag).toBe("2026-09-07");
  });

  it("leest een datum als d-m en als d-m-jjjj", () => {
    expect(ontleed("13-10 overleg", VANDAAG, LIJST).dag).toBe("2026-10-13");
    expect(ontleed("13-10-2027 overleg", VANDAAG, LIJST).dag).toBe("2027-10-13");
  });

  it("kent de vier tijdvormen uit §6.2.5", () => {
    expect(ontleed("14u overleg", VANDAAG, LIJST).van).toBe("14:00");
    expect(ontleed("14:30 overleg", VANDAAG, LIJST).van).toBe("14:30");
    // "half 3" is half drie, dus 14:30 en niet 15:30.
    expect(ontleed("half 3 overleg", VANDAAG, LIJST).van).toBe("02:30");
    expect(ontleed("kwart voor 4 overleg", VANDAAG, LIJST).van).toBe("03:45");
    expect(ontleed("kwart over 4 overleg", VANDAAG, LIJST).van).toBe("04:15");
  });

  it("kent de duurwoorden", () => {
    expect(ontleed("14u overleg 45 min", VANDAAG, LIJST).duurMinuten).toBe(45);
    expect(ontleed("14u overleg 2 uur", VANDAAG, LIJST).duurMinuten).toBe(120);
    expect(ontleed("14u overleg anderhalf uur", VANDAAG, LIJST).duurMinuten).toBe(90);
  });

  it("kent de soortwoorden en hun synoniemen", () => {
    expect(ontleed("teamdag", VANDAAG, LIJST).kind).toBe("studiedag");
    expect(ontleed("ouderavond", VANDAAG, LIJST).kind).toBe("oudergesprek");
    expect(ontleed("vergadering", VANDAAG, LIJST).kind).toBe("afspraak");
    expect(ontleed("documenteren met groep 4", VANDAAG, LIJST).kind).toBe("documentatiemoment");
  });

  it("maakt van wat overblijft de titel", () => {
    const uit = ontleed("morgen 9u zwemles met de hele groep", VANDAAG, LIJST);

    expect(uit.titel).toBe("zwemles met de hele groep");
  });

  it("geeft een titel als er verder niets staat", () => {
    expect(ontleed("teamdag", VANDAAG, LIJST).titel).toBe("Studiedag");
  });

  it("maakt van een studiedag een hele dag (§6.2.2)", () => {
    expect(ontleed("teamdag vrijdag", VANDAAG, LIJST).van).toBeNull();
    // Met een tijd erbij is het geen hele dag meer.
    expect(ontleed("teamdag vrijdag 9u", VANDAAG, LIJST).van).toBe("09:00");
  });

  it("meldt wat het herkend heeft, zodat het scherm het kan markeren (FR-AGE-14)", () => {
    const uit = ontleed("dinsdag 14u oudergesprek Noa V.", VANDAAG, LIJST);
    const soorten = uit.herkend.map((h) => h.soort);

    expect(soorten).toContain("datum");
    expect(soorten).toContain("tijd");
    expect(soorten).toContain("soort");
    expect(soorten).toContain("leerling");
  });

  it("valt terug op een afspraak vandaag als er niets herkenbaars staat", () => {
    const uit = ontleed("iets doen", VANDAAG, LIJST);

    expect(uit.kind).toBe("afspraak");
    expect(uit.dag).toBe(VANDAAG);
    expect(uit.titel).toBe("iets doen");
    expect(uit.herkend).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* D09b — ICS-export (§6.2.7, FR-AGE-20)                              */
/* ------------------------------------------------------------------ */

describe("de ICS-export — FR-AGE-20", () => {
  const GEMAAKT = "2026-09-01T10:00:00.000Z";

  const vakantie = {
    schoolYearName: "2026-2027",
    region: "midden" as const,
    holidayKey: "herfst",
    name: "Herfstvakantie",
    from: "2026-10-17",
    to: "2026-10-25",
    fixed: false,
    aangepast: false,
    landelijk: null,
  };

  async function eenItem() {
    return waarde(
      await agenda.maak({
        title: "Oudergesprek",
        kind: "oudergesprek",
        allDay: false,
        start: "2026-10-13T12:00:00.000Z",
        end: "2026-10-13T12:30:00.000Z",
        studentIds: [newId()],
      }),
    );
  }

  it("levert een geldig omhulsel", async () => {
    const ics = naarIcs({
      items: [await eenItem()],
      vakanties: [],
      van: "2026-09-01",
      tot: "2027-07-16",
      gemaaktOp: GEMAAKT,
    });

    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
  });

  it("geeft elk item een UID die uit zijn sleutel komt", async () => {
    const item = await eenItem();
    const ics = naarIcs({ items: [item], vakanties: [], van: "2026-09-01", tot: "2027-07-16", gemaaktOp: GEMAAKT });

    expect(ics).toContain(`UID:${item.id}@eduflow.local`);
  });

  it("levert bij twee exports dezelfde UID, zodat een tweede import geen dubbelen maakt", async () => {
    const item = await eenItem();
    const opzet = { items: [item], vakanties: [], van: "2026-09-01", tot: "2027-07-16" };

    const eerste = naarIcs({ ...opzet, gemaaktOp: GEMAAKT });
    const tweede = naarIcs({ ...opzet, gemaaktOp: "2026-12-01T10:00:00.000Z" });

    const uid = (tekst: string) => /UID:(.+)/u.exec(tekst)![1];
    expect(uid(tweede)).toBe(uid(eerste));
  });

  it("schrijft een hele-dag-gebeurtenis met een einde de dag erna", async () => {
    const ics = naarIcs({
      items: [],
      vakanties: [vakantie],
      van: "2026-09-01",
      tot: "2027-07-16",
      gemaaktOp: GEMAAKT,
    });

    expect(ics).toContain("DTSTART;VALUE=DATE:20261017");
    // ICS sluit een hele-dag-reeks exclusief af: 26 oktober, niet 25.
    expect(ics).toContain("DTEND;VALUE=DATE:20261026");
  });

  it("schrijft een herhaling uit in plaats van als RRULE", async () => {
    const reeks = waarde(
      await agenda.maak({
        title: "Gymles",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-01T08:00:00.000Z",
        end: "2026-09-01T09:00:00.000Z",
        recurrence: { frequency: "wekelijks", until: null, count: 4, excludedDates: [] },
      }),
    );
    const ics = naarIcs({ items: [reeks], vakanties: [], van: "2026-09-01", tot: "2026-10-31", gemaaktOp: GEMAAKT });

    expect(ics).not.toContain("RRULE");
    expect(ics.match(/BEGIN:VEVENT/gu)).toHaveLength(4);
  });

  it("ontsnapt een komma in de titel", async () => {
    const item = waarde(
      await agenda.maak({
        title: "Gesprek, met beide ouders",
        kind: "afspraak",
        allDay: false,
        start: "2026-10-13T12:00:00.000Z",
        end: "2026-10-13T12:30:00.000Z",
      }),
    );
    const ics = naarIcs({ items: [item], vakanties: [], van: "2026-09-01", tot: "2027-07-16", gemaaktOp: GEMAAKT });

    // Twee backslashes in de bron, één in de uitvoer: dat is wat RFC 5545 wil.
    expect(ics).toContain("SUMMARY:Gesprek\\, met beide ouders");
  });

  it("laat de afgeleide verjaardagen eruit (§6.2.7)", async () => {
    const verjaardag = { ...(await eenItem()), kind: "verjaardag" as const, title: "Kjeld is jarig" };
    const ics = naarIcs({ items: [verjaardag], vakanties: [], van: "2026-09-01", tot: "2027-07-16", gemaaktOp: GEMAAKT });

    expect(ics).not.toContain("jarig");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  it("houdt elke regel binnen vijfenzeventig tekens", async () => {
    const item = waarde(
      await agenda.maak({
        title: "Een heel lange titel die ruim over de vijfenzeventig tekens heen gaat en dus gevouwen moet worden",
        kind: "afspraak",
        allDay: false,
        start: "2026-10-13T12:00:00.000Z",
        end: "2026-10-13T12:30:00.000Z",
      }),
    );
    const ics = naarIcs({ items: [item], vakanties: [], van: "2026-09-01", tot: "2027-07-16", gemaaktOp: GEMAAKT });

    for (const regel of ics.split("\r\n")) expect(regel.length).toBeLessThanOrEqual(75);
  });

  it("draagt een bestandsnaam die in een downloadmap terug te vinden is", () => {
    expect(icsBestandsnaam("2026-2027")).toBe("EduFlow 2026-2027.ics");
  });
});

/* ------------------------------------------------------------------ */
/* D09b — verplaatsen (§6.2.5, B-38, NFR-35)                          */
/* ------------------------------------------------------------------ */

describe("verplaatsen met het toetsenbord — B-38, NFR-35", () => {
  async function afspraak() {
    return waarde(
      await agenda.maak({
        title: "Overleg",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-01T08:00:00.000Z",
        end: "2026-09-01T09:00:00.000Z",
      }),
    );
  }

  async function studiedag() {
    return waarde(
      await agenda.maak({
        title: "Studiedag",
        kind: "studiedag",
        allDay: true,
        start: "2026-09-01",
        end: "2026-09-01",
      }),
    );
  }

  it("kent de drie stappen uit §6.2.5", () => {
    expect(STAP_MINUTEN.kwartier).toBe(15);
    expect(STAP_MINUTEN.dag).toBe(1_440);
    expect(STAP_MINUTEN.week).toBe(10_080);
  });

  it("leest de toetsen zoals §6.2.5 ze beschrijft", () => {
    expect(stapVan({ ctrlKey: false, metaKey: false, shiftKey: false })).toBe("kwartier");
    expect(stapVan({ ctrlKey: false, metaKey: false, shiftKey: true })).toBe("dag");
    expect(stapVan({ ctrlKey: true, metaKey: false, shiftKey: false })).toBe("week");
    // Op een Mac doet Cmd hetzelfde als Ctrl.
    expect(stapVan({ ctrlKey: false, metaKey: true, shiftKey: false })).toBe("week");
    // Beide ingedrukt betekent de grootste stap.
    expect(stapVan({ ctrlKey: true, metaKey: false, shiftKey: true })).toBe("week");
  });

  it("schuift een afspraak een kwartier op", async () => {
    const na = verschoven(await afspraak(), STAP_MINUTEN.kwartier);

    expect(na.start).toBe("2026-09-01T08:15:00.000Z");
    expect(na.end).toBe("2026-09-01T09:15:00.000Z");
  });

  it("schuift terug bij een negatieve stap", async () => {
    const na = verschoven(await afspraak(), -STAP_MINUTEN.week);

    expect(na.start).toBe("2026-08-25T08:00:00.000Z");
  });

  it("schuift een hele-dag-item in hele dagen, ook met de gewone pijl", async () => {
    const dag = await studiedag();

    // Een kwartier heeft voor een studiedag geen betekenis; de pijl wordt een dag.
    expect(minutenVoor(dag, "kwartier")).toBe(STAP_MINUTEN.dag);
    expect(minutenVoor(dag, "week")).toBe(STAP_MINUTEN.week);

    const na = verschoven(dag, minutenVoor(dag, "kwartier"));
    expect(na.start).toBe("2026-09-02");
    expect(na.end).toBe("2026-09-02");
  });

  it("laat een afspraak wél een kwartier schuiven", async () => {
    expect(minutenVoor(await afspraak(), "kwartier")).toBe(15);
  });

  it("houdt de duur vast bij het verplaatsen naar een andere dag", async () => {
    const na = naarDag(await afspraak(), "2026-09-03");

    expect(na.start).toBe("2026-09-03T08:00:00.000Z");
    expect(na.end).toBe("2026-09-03T09:00:00.000Z");
  });

  it("neemt de herhaling mee, zodat de reikwijdtevraag hem kan afhandelen", async () => {
    const reeks = waarde(
      await agenda.maak({
        title: "Gymles",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-01T08:00:00.000Z",
        end: "2026-09-01T09:00:00.000Z",
        recurrence: { frequency: "wekelijks", until: null, count: 4, excludedDates: [] },
      }),
    );

    expect(verschoven(reeks, STAP_MINUTEN.kwartier).recurrence).toEqual(reeks.recurrence);
  });

  it("noemt de toetsen in de hint (§6.2.5)", () => {
    expect(TOETSENHINT).toMatch(/kwartier/u);
    expect(TOETSENHINT).toMatch(/Shift/u);
    expect(TOETSENHINT).toMatch(/Ctrl/u);
  });
});

/* ------------------------------------------------------------------ */
/* D09b — meldingen (§6.2.9, FR-AGE-25, FR-AGE-28, B-108)             */
/* ------------------------------------------------------------------ */

describe("meldingen — FR-AGE-25, FR-AGE-28, B-108", () => {
  const NUUR = new Date("2026-09-01T08:00:00.000Z");

  /** Een melder die opschrijft in plaats van te melden (DR-12). */
  function nepMelder(stand: Toestemming = "granted") {
    const getoond: { titel: string; tekst: string }[] = [];
    let toestemming = stand;
    let gevraagd = 0;

    return {
      getoond,
      get gevraagd() {
        return gevraagd;
      },
      melder: {
        toestemming: () => toestemming,
        vraag: async () => {
          gevraagd += 1;
          toestemming = "granted" as Toestemming;
          return toestemming;
        },
        toon: (titel: string, tekst: string) => void getoond.push({ titel, tekst }),
      },
    };
  }

  function item(start: string, allDay = false): CalendarEvent {
    return {
      id: newId(),
      title: "Oudergesprek",
      kind: "oudergesprek",
      allDay,
      start,
      end: start,
      note: "",
      location: "",
      groupIds: [],
      studentIds: [],
      documentationId: null,
      mailDraftId: null,
      source: "own",
      recurrence: null,
      createdAt: NU,
      updatedAt: NU,
      deletedAt: null,
      rev: 1,
      origin: APPARAAT,
      schemaVersion: 1,
    } as CalendarEvent;
  }

  it("meldt een item dat binnen tien minuten begint", () => {
    const items = [item("2026-09-01T08:05:00.000Z")];

    expect(nuTeMelden(items, NUUR, new Set())).toHaveLength(1);
  });

  it("laat een item dat verder weg ligt met rust", () => {
    const items = [item("2026-09-01T09:00:00.000Z")];

    expect(nuTeMelden(items, NUUR, new Set())).toEqual([]);
  });

  it("laat een item dat al begonnen is met rust", () => {
    const items = [item("2026-09-01T07:55:00.000Z")];

    expect(nuTeMelden(items, NUUR, new Set())).toEqual([]);
  });

  it("meldt een hele-dag-item niet; middernacht helpt niemand", () => {
    const items = [item("2026-09-01", true)];

    expect(nuTeMelden(items, NUUR, new Set())).toEqual([]);
  });

  it("meldt hetzelfde item niet twee keer", () => {
    const eenItem = item("2026-09-01T08:05:00.000Z");
    const nep = nepMelder();
    const dienst = createNotificationService({ melder: nep.melder, clock: { now: () => NUUR } });

    expect(dienst.tik([eenItem])).toHaveLength(1);
    expect(dienst.tik([eenItem])).toHaveLength(0);
    expect(nep.getoond).toHaveLength(1);
  });

  it("meldt niets zonder toestemming (FR-AGE-28)", () => {
    const nep = nepMelder("default");
    const dienst = createNotificationService({ melder: nep.melder, clock: { now: () => NUUR } });

    expect(dienst.tik([item("2026-09-01T08:05:00.000Z")])).toEqual([]);
    expect(nep.getoond).toEqual([]);
    // En er is niet uit zichzelf gevraagd.
    expect(nep.gevraagd).toBe(0);
  });

  it("meldt niets na een weigering", () => {
    const nep = nepMelder("denied");
    const dienst = createNotificationService({ melder: nep.melder, clock: { now: () => NUUR } });

    expect(dienst.tik([item("2026-09-01T08:05:00.000Z")])).toEqual([]);
  });

  it("vraagt pas als hij erom gevraagd wordt (FR-AGE-28)", async () => {
    const nep = nepMelder("default");
    const dienst = createNotificationService({ melder: nep.melder, clock: { now: () => NUUR } });

    expect(nep.gevraagd).toBe(0);
    expect(await dienst.vraagToestemming()).toBe("granted");
    expect(nep.gevraagd).toBe(1);
  });

  it("zegt hoe lang het nog duurt", () => {
    expect(meldtekst(item("2026-09-01T08:05:00.000Z"), NUUR)).toBe("begint over 5 minuten");
    expect(meldtekst(item("2026-09-01T08:01:00.000Z"), NUUR)).toBe("begint over 1 minuut");
    expect(meldtekst(item("2026-09-01T08:00:00.000Z"), NUUR)).toBe("begint nu");
  });

  it("draagt de uitleg die §6.2.9 woordelijk voorschrijft", () => {
    expect(EERLIJKE_UITLEG).toBe(
      "EduFlow stuurt geen meldingen als de app dicht is. Wil je een herinnering op je telefoon, exporteer de agenda dan naar je eigen agenda-app — die doet het wel.",
    );
  });
});
