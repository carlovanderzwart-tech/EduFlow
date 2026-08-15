import { describe, expect, it } from "vitest";

import {
  dagenTussen,
  dagenVan,
  eersteVanMaand,
  isIsoDate,
  isIsoDateTime,
  isWeekend,
  laatsteVanMaand,
  maandagVan,
  maandraster,
  MAANDRASTER_RIJEN,
  overlapt,
  parseIsoDateTime,
  plusDagen,
  plusMaanden,
  toIsoDateTime,
  vandaagIso,
  weekdag,
} from "./dates";

describe("isIsoDate — kalenderdag van tien tekens (§8.1.4)", () => {
  it("aanvaardt een gewone dag", () => {
    expect(isIsoDate("2026-08-07")).toBe(true);
  });

  it("aanvaardt 29 februari in een schrikkeljaar", () => {
    expect(isIsoDate("2028-02-29")).toBe(true);
  });

  it("wijst 29 februari af buiten een schrikkeljaar", () => {
    expect(isIsoDate("2026-02-29")).toBe(false);
  });

  it("wijst een dag af die niet bestaat", () => {
    // JavaScript rolt deze stilzwijgend door naar 3 maart; dat mag hier niet.
    expect(isIsoDate("2026-02-31")).toBe(false);
  });

  it("wijst een dag zonder voorloopnullen af", () => {
    expect(isIsoDate("2026-8-7")).toBe(false);
  });

  it("wijst een tijdstip af", () => {
    // Een kalenderdag wordt nooit als tijdstip opgeslagen (§8.1.4).
    expect(isIsoDate("2026-08-07T12:04:55.031Z")).toBe(false);
  });
});

describe("isIsoDateTime — tijdstip in UTC (§8.1.4)", () => {
  it("aanvaardt de vorm uit §8.1.5", () => {
    expect(isIsoDateTime("2026-08-07T12:04:55.031Z")).toBe(true);
  });

  it("eist een afsluitende Z", () => {
    expect(isIsoDateTime("2026-08-07T12:04:55.031")).toBe(false);
  });

  it("wijst een lokale tijdzone af", () => {
    // Er staat nooit een lokale tijdzone in de opslag.
    expect(isIsoDateTime("2026-08-07T12:04:55.031+02:00")).toBe(false);
  });

  it("eist milliseconden", () => {
    expect(isIsoDateTime("2026-08-07T12:04:55Z")).toBe(false);
  });

  it("wijst een onmogelijk uur af", () => {
    expect(isIsoDateTime("2026-08-07T25:04:55.031Z")).toBe(false);
  });

  it("wijst een kalenderdag af", () => {
    expect(isIsoDateTime("2026-08-07")).toBe(false);
  });
});

describe("toIsoDateTime en parseIsoDateTime", () => {
  it("schrijft altijd in UTC met een afsluitende Z", () => {
    const geschreven = toIsoDateTime(new Date(Date.UTC(2026, 7, 7, 12, 4, 55, 31)));

    expect(geschreven).toBe("2026-08-07T12:04:55.031Z");
    expect(isIsoDateTime(geschreven)).toBe(true);
  });

  it("laat de dag niet verschuiven rond middernacht", () => {
    // De valkuil uit §8.1.4: 1 januari mag op geen enkel apparaat 31 december
    // worden. Omdat er in UTC wordt geschreven, kan dat niet gebeuren.
    expect(toIsoDateTime(new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0)))).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("leest terug wat het schreef", () => {
    const moment = new Date(Date.UTC(2026, 7, 7, 12, 4, 55, 31));

    expect(parseIsoDateTime(toIsoDateTime(moment))?.getTime()).toBe(moment.getTime());
  });

  it("geeft null bij een waarde die niet klopt", () => {
    expect(parseIsoDateTime("gisteren")).toBeNull();
    expect(parseIsoDateTime("2026-02-31T00:00:00.000Z")).toBeNull();
    expect(parseIsoDateTime("2026-08-07")).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* Rekenen met kalenderdagen (D09a)                                   */
/* ------------------------------------------------------------------ */

describe("plusDagen en dagenTussen — §8.1.4", () => {
  it("telt een dag op", () => {
    expect(plusDagen("2026-08-07", 1)).toBe("2026-08-08");
  });

  it("gaat over een maandgrens heen", () => {
    expect(plusDagen("2026-08-31", 1)).toBe("2026-09-01");
  });

  it("gaat over een jaargrens heen, ook terug", () => {
    expect(plusDagen("2026-12-31", 1)).toBe("2027-01-01");
    expect(plusDagen("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("kent 29 februari in een schrikkeljaar", () => {
    expect(plusDagen("2028-02-28", 1)).toBe("2028-02-29");
    expect(plusDagen("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("struikelt niet over de zomertijdgrens", () => {
    // In Europe/Amsterdam gaat de klok in de nacht van 28 op 29 maart 2026
    // vooruit. Zou hier in lokale tijd gerekend worden, dan zou die dag korter
    // zijn dan 24 uur en het tellen misgaan.
    expect(plusDagen("2026-03-28", 1)).toBe("2026-03-29");
    expect(plusDagen("2026-10-24", 1)).toBe("2026-10-25");
    expect(dagenTussen("2026-03-01", "2026-04-01")).toBe(31);
    expect(dagenTussen("2026-10-01", "2026-11-01")).toBe(31);
  });

  it("telt een heel jaar", () => {
    expect(dagenTussen("2026-01-01", "2027-01-01")).toBe(365);
    expect(dagenTussen("2028-01-01", "2029-01-01")).toBe(366);
  });

  it("telt terug als de tweede dag eerder ligt", () => {
    expect(dagenTussen("2026-08-10", "2026-08-07")).toBe(-3);
  });
});

describe("weekdagen — ISO 8601", () => {
  it("noemt maandag 1 en zondag 7", () => {
    // 10 augustus 2026 is een maandag.
    expect(weekdag("2026-08-10")).toBe(1);
    expect(weekdag("2026-08-16")).toBe(7);
  });

  it("rekent zaterdag en zondag tot het weekend", () => {
    expect(isWeekend("2026-08-15")).toBe(true);
    expect(isWeekend("2026-08-16")).toBe(true);
    expect(isWeekend("2026-08-14")).toBe(false);
  });

  it("geeft de maandag van de week", () => {
    expect(maandagVan("2026-08-13")).toBe("2026-08-10");
    expect(maandagVan("2026-08-10")).toBe("2026-08-10");
    // Zondag hoort bij de week die de maandag ervóór begon.
    expect(maandagVan("2026-08-16")).toBe("2026-08-10");
  });
});

describe("maanden", () => {
  it("geeft de eerste en de laatste dag", () => {
    expect(eersteVanMaand("2026-08-13")).toBe("2026-08-01");
    expect(laatsteVanMaand("2026-08-13")).toBe("2026-08-31");
    expect(laatsteVanMaand("2026-02-05")).toBe("2026-02-28");
    expect(laatsteVanMaand("2028-02-05")).toBe("2028-02-29");
  });

  it("schuift maanden op zonder over een korte maand te struikelen", () => {
    expect(plusMaanden("2026-01-31", 1)).toBe("2026-02-01");
    expect(plusMaanden("2026-12-15", 1)).toBe("2027-01-01");
    expect(plusMaanden("2027-01-15", -1)).toBe("2026-12-01");
  });
});

describe("het maandraster — §6.2.3", () => {
  it("telt altijd zes rijen van zeven dagen", () => {
    for (const maand of ["2026-02-01", "2026-08-01", "2027-01-01", "2028-02-01"]) {
      expect(maandraster(maand)).toHaveLength(MAANDRASTER_RIJEN * 7);
    }
  });

  it("begint op een maandag", () => {
    expect(weekdag(maandraster("2026-08-01")[0]!)).toBe(1);
  });

  it("bevat elke dag van de maand zelf", () => {
    const raster = maandraster("2026-08-01");

    expect(raster).toContain("2026-08-01");
    expect(raster).toContain("2026-08-31");
  });

  it("levert aaneengesloten dagen", () => {
    const raster = maandraster("2026-08-01");

    for (let plaats = 1; plaats < raster.length; plaats += 1) {
      expect(dagenTussen(raster[plaats - 1]!, raster[plaats]!)).toBe(1);
    }
  });
});

describe("dagenVan", () => {
  it("neemt beide einden mee", () => {
    expect(dagenVan("2026-08-07", "2026-08-09")).toEqual([
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
    ]);
  });

  it("geeft één dag als begin en einde gelijk zijn", () => {
    expect(dagenVan("2026-08-07", "2026-08-07")).toEqual(["2026-08-07"]);
  });

  it("geeft niets als het einde eerder ligt", () => {
    expect(dagenVan("2026-08-09", "2026-08-07")).toEqual([]);
  });
});

describe("overlapt", () => {
  it("ziet een echte overlap", () => {
    expect(overlapt("2026-08-01", "2026-08-10", "2026-08-05", "2026-08-15")).toBe(true);
  });

  it("telt een gedeeld eindpunt als overlap", () => {
    expect(overlapt("2026-08-01", "2026-08-10", "2026-08-10", "2026-08-15")).toBe(true);
  });

  it("ziet geen overlap bij periodes die elkaar net missen", () => {
    expect(overlapt("2026-08-01", "2026-08-09", "2026-08-10", "2026-08-15")).toBe(false);
  });
});

describe("vandaagIso", () => {
  it("geeft de lokale kalenderdag en niet die van UTC", () => {
    // Nieuwjaarsnacht: in Amsterdam is het al 1 januari, in UTC nog 31 december.
    const nieuwjaar = new Date(2027, 0, 1, 0, 30);

    expect(vandaagIso(nieuwjaar)).toBe("2027-01-01");
  });
});
