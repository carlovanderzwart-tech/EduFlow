/**
 * Toetsen bij `FR-AGE-29` t/m `FR-AGE-31` — de basisweek (B-115, B-146).
 *
 * De eis bestaat uit drie zinnen en elke zin heeft hier een toets:
 *
 * 1. een vast onderdeel wordt een wekelijks herhalend item voor het schooljaar,
 * 2. zo'n item is verder een gewoon item,
 * 3. de basisweek is herkomst en geen eigenaar.
 *
 * De belangrijkste toets is de derde. Zou de basisweek eigenaar zijn, dan moesten
 * verplaatsen, exporteren, meldingen en zoeken allemaal twee keer gebouwd worden —
 * precies wat B-115 verbiedt en wat U-05 "twee mechanismen voor één probleem" noemt.
 * Daarom toetst dit bestand uitdrukkelijk dat een losgemaakte gymles blijft staan
 * als je daarna de basisweek leeghaalt.
 *
 * Zonder browser en zonder netwerk: de opslag is een echte IndexedDB uit
 * `fake-indexeddb` en de klok staat stil (DR-12).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";
import type { SchoolYear } from "@/domain/types";

import {
  alsAgendainvoer,
  basisweekVan,
  bezwaarTegen,
  eersteDagOpOfNa,
  isBasisweekreeks,
  uitBasisweek,
  WEEKDAGEN,
  type Basisonderdeel,
} from "./agenda/basisweek";
import { createAgendaService, type AgendaService } from "./agenda/AgendaService";
import { verschijningen } from "./agenda/RecurrenceService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-10-04T10:00:00.000Z";

/** Het schooljaar uit bijlage A: 24 augustus 2026 is een maandag. */
const JAAR = { firstSchoolDay: "2026-08-24", lastSchoolDay: "2027-07-16" } as SchoolYear;

const GYM: Basisonderdeel = { weekdag: 2, van: "08:30", tot: "09:15", title: "Gym" };

let storage: StorageService;
let agenda: AgendaService;

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  const klok = { now: () => new Date(NU) };
  storage = createStorageService({ db, clock: klok, origin: APPARAAT });
  agenda = createAgendaService({ storage });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

describe("de eerste dag van de reeks — `FR-AGE-29`", () => {
  it("neemt de eerste schooldag zelf als die al goed valt", () => {
    // 24 augustus 2026 is een maandag.
    expect(eersteDagOpOfNa("2026-08-24", 1)).toBe("2026-08-24");
  });

  it("schuift door naar de eerstvolgende passende dag", () => {
    expect(eersteDagOpOfNa("2026-08-24", 2)).toBe("2026-08-25");
    expect(eersteDagOpOfNa("2026-08-24", 5)).toBe("2026-08-28");
  });

  it("pakt nooit een dag vóór het schooljaar", () => {
    // Begint het jaar op een woensdag en vul je maandag in, dan is de eerste
    // maandag die van de week erna — niet die van de week ervoor.
    expect(eersteDagOpOfNa("2026-08-26", 1)).toBe("2026-08-31");
  });

  it("kent zeven dagen met de nummering van ISO 8601", () => {
    expect(WEEKDAGEN).toHaveLength(7);
    expect(WEEKDAGEN[0]).toEqual({ nummer: 1, naam: "Maandag" });
    expect(WEEKDAGEN[6]).toEqual({ nummer: 7, naam: "Zondag" });
  });
});

describe("een vast onderdeel wordt een herhalend item — `FR-AGE-29`", () => {
  it("herhaalt wekelijks tot de laatste schooldag", () => {
    const invoer = alsAgendainvoer(GYM, JAAR);

    expect(invoer.recurrence).toEqual({
      frequency: "wekelijks",
      until: "2027-07-16",
      count: null,
      excludedDates: [],
    });
  });

  it("zet `until` en niet `count` (B-123)", () => {
    // Een schooljaar heeft een einddatum en geen aantal weken, en B-123 staat er
    // precies één van de twee toe.
    const { recurrence } = alsAgendainvoer(GYM, JAAR);

    expect(recurrence.until).not.toBeNull();
    expect(recurrence.count).toBeNull();
  });

  it("begint op de eerste passende dag met de ingevulde tijd", () => {
    const invoer = alsAgendainvoer(GYM, JAAR);

    expect(invoer.start.slice(0, 10)).toBe("2026-08-25");
    expect(invoer.allDay).toBe(false);
    // Half negen blijft half negen: de wandkloktijd is lokaal omgerekend (§8.1.4).
    expect(new Date(invoer.start).getHours()).toBe(8);
    expect(new Date(invoer.start).getMinutes()).toBe(30);
  });

  it("draagt de herkomst basisweek (`FR-AGE-31`)", () => {
    expect(alsAgendainvoer(GYM, JAAR).source).toBe("derived");
  });

  it("belandt als echt agenda-item in de opslag (`FR-AGE-29`)", async () => {
    const item = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));

    expect(item.title).toBe("Gym");
    expect(item.source).toBe("derived");
    expect(isBasisweekreeks(item)).toBe(true);
  });
});

describe("wat er niet doorheen komt — `FR-AGE-29`", () => {
  it("weigert zonder schooljaar", () => {
    expect(bezwaarTegen(GYM, null)).toMatch(/schooljaar/i);
  });

  it("weigert een naamloos onderdeel", () => {
    expect(bezwaarTegen({ ...GYM, title: "   " }, JAAR)).toMatch(/naam/i);
  });

  it("weigert een eindtijd vóór de begintijd", () => {
    expect(bezwaarTegen({ ...GYM, van: "10:00", tot: "09:00" }, JAAR)).toMatch(/eindtijd/i);
  });

  it("weigert een onderdeel van nul minuten", () => {
    expect(bezwaarTegen({ ...GYM, van: "09:00", tot: "09:00" }, JAAR)).not.toBeNull();
  });

  it("laat een geldig onderdeel door", () => {
    expect(bezwaarTegen(GYM, JAAR)).toBeNull();
  });
});

describe("een gegenereerd item is een gewoon item — `FR-AGE-30`", () => {
  it("is te wijzigen zoals elk ander item", async () => {
    const item = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));

    const na = waarde(
      await agenda.wijzig(item.id, {
        title: "Gym in de grote zaal",
        kind: "afspraak",
        allDay: false,
        start: item.start,
        end: item.end,
      }),
    );

    expect(na.title).toBe("Gym in de grote zaal");
  });

  it("is te verwijderen zoals elk ander item", async () => {
    const item = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));
    waarde(await agenda.verwijder(item.id));

    expect(basisweekVan(waarde(await agenda.lijst()))).toHaveLength(0);
  });

  it("verschijnt gewoon in de lijst van de agenda", async () => {
    await agenda.maak(alsAgendainvoer(GYM, JAAR));

    expect(waarde(await agenda.lijst())).toHaveLength(1);
  });
});

describe("herkomst, geen eigenaar — `FR-AGE-31`, B-115", () => {
  it("leest de basisweek terug uit de agenda zelf", async () => {
    await agenda.maak(alsAgendainvoer(GYM, JAAR));
    await agenda.maak(
      alsAgendainvoer({ weekdag: 4, van: "13:00", tot: "13:45", title: "Muziek" }, JAAR),
    );
    // Een gewone afspraak die er niets mee te maken heeft.
    await agenda.maak({
      title: "Oudergesprek",
      kind: "oudergesprek",
      allDay: false,
      start: "2026-09-01T14:00:00.000Z",
      end: "2026-09-01T14:30:00.000Z",
    });

    const week = basisweekVan(waarde(await agenda.lijst()));

    // Er is geen tweede gegevensmodel: dit ís de agenda, gefilterd (B-146).
    expect(week.map((item) => item.title)).toEqual(["Gym", "Muziek"]);
  });

  it("sorteert op weekdag en daarna op tijd", async () => {
    await agenda.maak(
      alsAgendainvoer({ weekdag: 5, van: "09:00", tot: "09:45", title: "Vrijdag ochtend" }, JAAR),
    );
    await agenda.maak(
      alsAgendainvoer({ weekdag: 1, van: "14:00", tot: "14:45", title: "Maandag middag" }, JAAR),
    );
    await agenda.maak(
      alsAgendainvoer({ weekdag: 1, van: "08:30", tot: "09:15", title: "Maandag ochtend" }, JAAR),
    );

    const week = basisweekVan(waarde(await agenda.lijst()));

    expect(week.map((item) => item.title)).toEqual([
      "Maandag ochtend",
      "Maandag middag",
      "Vrijdag ochtend",
    ]);
  });

  it("laat een losgemaakte keer staan als de basisweek leeg wordt (`FR-AGE-31`)", async () => {
    const gym = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));

    // "Alleen deze": één gymles verschuift naar een ander lokaal en een andere tijd.
    waarde(
      await agenda.wijzigReeks(gym.id, "2026-09-08", "deze", {
        title: "Gym — in de gymzaal van de buren",
        kind: "afspraak",
        allDay: false,
        start: "2026-09-08T10:00:00.000Z",
        end: "2026-09-08T10:45:00.000Z",
      }),
    );

    // En daarna haal je het hele onderdeel uit je basisweek.
    waarde(await agenda.verwijder(gym.id));

    const over = waarde(await agenda.lijst());

    // Dit is de hele belofte van "herkomst, geen eigenaar": wat je zelf hebt
    // aangepast blijft van jou, ook als de basisweek verdwijnt.
    expect(over.map((item) => item.title)).toEqual(["Gym — in de gymzaal van de buren"]);
    expect(basisweekVan(over)).toHaveLength(0);
  });

  it("draagt de herkomst óók op een verschijning verderop in het jaar", async () => {
    const gym = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));

    // `RecurrenceService` haalt `recurrence` van een verschijning af — die is de
    // reeks niet. Zou `uitBasisweek` daarop kijken, dan zei de agenda alleen bij de
    // allereerste gymles waar hij vandaan kwam, en bij de veertig daarna niet.
    const [eerste, tweede] = verschijningen(gym, "2026-08-24", "2026-09-05");

    expect(tweede).toBeDefined();
    expect(tweede!.recurrence).toBeNull();
    expect(uitBasisweek(eerste!)).toBe(true);
    expect(uitBasisweek(tweede!)).toBe(true);
  });

  it("geeft een item dat je met 'alle volgende' wijzigt aan jou terug", async () => {
    const gym = waarde(await agenda.maak(alsAgendainvoer(GYM, JAAR)));

    const vervolg = waarde(
      await agenda.wijzigReeks(gym.id, "2027-03-02", "volgende", {
        title: "Gym",
        kind: "afspraak",
        allDay: false,
        start: "2027-03-02T09:00:00.000Z",
        end: "2027-03-02T09:45:00.000Z",
      }),
    );

    // Vanaf het moment dat je hem zelf hebt bijgesteld is hij van jou. Dat is wat
    // "herkomst, geen eigenaar" betekent: de basisweek bestuurt hem niet meer.
    expect(vervolg.source).toBe("own");
    expect(uitBasisweek(vervolg)).toBe(false);
  });

  it("rekent een eenmalig item niet tot de basisweek", async () => {
    const los = waarde(
      await agenda.maak({
        title: "Studiedag",
        kind: "studiedag",
        allDay: true,
        start: "2026-10-05",
        end: "2026-10-05",
      }),
    );

    expect(uitBasisweek(los)).toBe(false);
  });
});
