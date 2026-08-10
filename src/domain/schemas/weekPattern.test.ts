import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { aangepasteDag, basisweek, vakantieperiode, zonderVeld } from "../toetsgegevens";
import { zHolidayPeriod } from "./schoolYear";
import { zWeekPattern, zWeekPatternOverride } from "./weekPattern";

describe("zWeekPattern — §8.3.15, B-98", () => {
  it("laat een geldige basisweek door", () => {
    expect(zWeekPattern.safeParse(basisweek()).success).toBe(true);
  });

  it("laat een lopende versie toe zonder einddatum", () => {
    expect(zWeekPattern.safeParse({ ...basisweek(), validTo: null }).success).toBe(true);
  });

  it("weigert een geldigheidsperiode die eindigt vóór hij begint (B-99)", () => {
    const omgekeerd = { ...basisweek(), validFrom: "2026-11-01", validTo: "2026-10-31" };

    expect(zWeekPattern.safeParse(omgekeerd).success).toBe(false);
  });

  it("weigert meer dan veertig weekonderdelen", () => {
    const een = basisweek().lines[0]!;
    const teveel = Array.from({ length: 41 }, () => ({ ...een, id: newId() }));

    expect(zWeekPattern.safeParse({ ...basisweek(), lines: teveel }).success).toBe(false);
  });

  it("laat een lege basisweek toe, want een nieuw schooljaar begint leeg (FR-AGE-31)", () => {
    expect(zWeekPattern.safeParse({ ...basisweek(), lines: [] }).success).toBe(true);
  });
});

describe("INV-55 — een weekonderdeel eindigt ná zijn begin", () => {
  function metOnderdeel(velden: Record<string, unknown>): unknown {
    const week = basisweek();
    return { ...week, lines: [{ ...week.lines[0]!, ...velden }] };
  }

  it("weigert een eindtijd vóór de begintijd", () => {
    expect(zWeekPattern.safeParse(metOnderdeel({ endTime: "08:00" })).success).toBe(false);
  });

  it("weigert een duur van nul", () => {
    expect(zWeekPattern.safeParse(metOnderdeel({ endTime: "08:30" })).success).toBe(false);
  });

  it("weigert een tijd die geen wandkloktijd is (T-46)", () => {
    expect(zWeekPattern.safeParse(metOnderdeel({ startTime: "8:30" })).success).toBe(false);
    expect(zWeekPattern.safeParse(metOnderdeel({ startTime: "24:00" })).success).toBe(false);
    expect(
      zWeekPattern.safeParse(metOnderdeel({ startTime: "2026-09-14T08:30:00.000Z" })).success,
    ).toBe(false);
  });

  it("weigert een weekdag buiten de week", () => {
    expect(zWeekPattern.safeParse(metOnderdeel({ weekday: 0 })).success).toBe(false);
    expect(zWeekPattern.safeParse(metOnderdeel({ weekday: 8 })).success).toBe(false);
  });
});

describe("zWeekPatternOverride — §8.3.16", () => {
  it("kent drie soorten en geen vierde", () => {
    expect(zWeekPatternOverride.safeParse(aangepasteDag()).success).toBe(true);
    expect(
      zWeekPatternOverride.safeParse(zonderVeld({ ...aangepasteDag(), kind: "dag-vervalt" }, "lineId"))
        .success,
    ).toBe(true);
    expect(
      zWeekPatternOverride.safeParse({ ...aangepasteDag(), kind: "onderdeel-toegevoegd" }).success,
    ).toBe(false);
  });

  it("eist een onderdeel bij de twee soorten die er een raken", () => {
    expect(zWeekPatternOverride.safeParse(zonderVeld(aangepasteDag(), "lineId")).success).toBe(
      false,
    );
  });

  it("weigert een onderdeel bij `dag-vervalt`, want die raakt de hele dag", () => {
    const dagMetOnderdeel = { ...aangepasteDag(), kind: "dag-vervalt" };

    expect(zWeekPatternOverride.safeParse(dagMetOnderdeel).success).toBe(false);
  });
});

describe("zHolidayPeriod — §8.3.8, T-49", () => {
  it("laat een geldige vakantieperiode door", () => {
    expect(zHolidayPeriod.safeParse(vakantieperiode()).success).toBe(true);
  });

  it("draagt de bestandsversie op de rij zelf", () => {
    // Zo is één rij lezen genoeg om te weten of het bestand nieuwer is (§13.4).
    expect(zHolidayPeriod.safeParse(zonderVeld(vakantieperiode(), "fileVersion")).success).toBe(
      false,
    );
  });

  it("houdt de drieledige sleutel verplicht, zodat een aanpassing hem terugvindt", () => {
    for (const veld of ["schoolYearName", "region", "holidayKey"]) {
      expect(zHolidayPeriod.safeParse(zonderVeld(vakantieperiode(), veld)).success).toBe(false);
    }
  });

  it("weigert een einddatum vóór de begindatum", () => {
    const omgekeerd = { ...vakantieperiode(), from: "2026-10-25", to: "2026-10-17" };

    expect(zHolidayPeriod.safeParse(omgekeerd).success).toBe(false);
  });
});
