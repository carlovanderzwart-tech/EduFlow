import { describe, expect, it } from "vitest";

import { isIsoDate, isIsoDateTime, parseIsoDateTime, toIsoDateTime } from "./dates";

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
