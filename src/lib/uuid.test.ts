import { afterEach, describe, expect, it, vi } from "vitest";

import { newId, UUID_V7 } from "./uuid";

/** De eerste 48 bits van een UUIDv7 zijn de Unix-tijd in milliseconden (§8.1.3). */
function tijdstempelVan(id: string): number {
  return Number(BigInt(`0x${id.slice(0, 8)}${id.slice(9, 13)}`));
}

describe("newId — §8.1.3, T-11", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("levert de vorm die de Bible voorschrijft", () => {
    expect(newId()).toMatch(UUID_V7);
  });

  it("zet het versienibble op 7", () => {
    // Teken 15 van een UUID is het versienibble.
    expect(newId()[14]).toBe("7");
  });

  it("zet de variantbits op 10", () => {
    // Teken 20 hoort 8, 9, a of b te zijn.
    expect(newId()[19]).toMatch(/[89ab]/);
  });

  it("draagt de kloktijd in de eerste 48 bits", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));

    expect(tijdstempelVan(newId())).toBe(Date.now());
  });

  it("sorteert op ontstaansvolgorde", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));
    const eerste = newId();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.001Z"));
    const tweede = newId();
    vi.setSystemTime(new Date("2026-08-09T12:00:01.000Z"));
    const derde = newId();

    expect([derde, eerste, tweede].sort()).toEqual([eerste, tweede, derde]);
  });

  it("geeft geen twee keer dezelfde sleutel binnen dezelfde milliseconde", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));

    const sleutels = new Set(Array.from({ length: 500 }, newId));

    expect(sleutels.size).toBe(500);
  });
});

describe("UUID_V7 — herkent versie 7 en niets anders", () => {
  it("wijst een UUIDv4 af", () => {
    // Dit is de reden dat `crypto.randomUUID()` niet voldoet (§8.1.3). Het
    // bestaande `src/utils/id.ts` gebruikt hem nog wel; dat wordt bij
    // implementatiestap 4 omgezet en valt buiten deze stap.
    expect(crypto.randomUUID()).not.toMatch(UUID_V7);
  });

  it("wijst een sleutel met de juiste lengte maar het verkeerde versienibble af", () => {
    expect("0198a1b2-c3d4-4ef0-8123-456789abcdef").not.toMatch(UUID_V7);
  });

  it("wijst een sleutel met verkeerde variantbits af", () => {
    expect("0198a1b2-c3d4-7ef0-c123-456789abcdef").not.toMatch(UUID_V7);
  });

  it("wijst hoofdletters af", () => {
    expect(newId().toUpperCase()).not.toMatch(UUID_V7);
  });
});
