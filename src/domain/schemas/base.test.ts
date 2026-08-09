import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { basisRecord, leerling, zonderVeld } from "../toetsgegevens";
import { CURRENT_SCHEMA_VERSION, zBaseRecord } from "./base";
import { zStudent } from "./student";

/** Één veld anders maken zonder het type te hoeven kennen. */
function met(velden: Record<string, unknown>): unknown {
  return { ...basisRecord(), ...velden };
}

describe("zBaseRecord — §8.1.5, B1", () => {
  it("laat een geldig basisrecord door", () => {
    expect(zBaseRecord.safeParse(basisRecord()).success).toBe(true);
  });

  it("weigert een UUIDv4 als sleutel (INV-01)", () => {
    // Dit is precies het verschil tussen de twee versies van het basisschema:
    // §8.3 gebruikt `z.string().uuid()` en laat een v4 door, §8.1.5 niet.
    expect(zBaseRecord.safeParse(met({ id: crypto.randomUUID() })).success).toBe(false);
  });

  it("weigert een sleutel met het verkeerde versienibble", () => {
    expect(
      zBaseRecord.safeParse(met({ id: "0198a1b2-c3d4-4ef0-8123-456789abcdef" })).success,
    ).toBe(false);
  });

  it("weigert hoofdletters in een sleutel", () => {
    expect(zBaseRecord.safeParse(met({ id: newId().toUpperCase() })).success).toBe(false);
  });

  it("weigert een `origin` die geen apparaatsleutel is", () => {
    // §8.3 laat hier elke tekenreeks van 1 tot 64 tekens toe; §8.1.4 zegt dat een
    // apparaat-id een UUIDv7 is.
    expect(zBaseRecord.safeParse(met({ origin: "pc-ilse" })).success).toBe(false);
  });

  it("weigert `rev` nul", () => {
    // §8.1.4: de teller begint op 1. §8.3 staat 0 toe; dat zou een record zonder
    // enige schrijfactie beschrijven.
    expect(zBaseRecord.safeParse(met({ rev: 0 })).success).toBe(false);
  });

  it("weigert een gebroken `rev`", () => {
    expect(zBaseRecord.safeParse(met({ rev: 1.5 })).success).toBe(false);
  });
});

describe("schemaVersion — §8.1.5, INV-06", () => {
  it("staat op 7 en niet op iets anders", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(7);
  });

  it("weigert een record zonder versienummer", () => {
    expect(zBaseRecord.safeParse(zonderVeld(basisRecord(), "schemaVersion")).success).toBe(false);
  });

  it("weigert een hogere versie dan de app kent", () => {
    // §8.6: een oudere app die een nieuwer record leest, vernielt stilzwijgend
    // velden die zij niet kent. Daarom de bovengrens.
    expect(zBaseRecord.safeParse(met({ schemaVersion: 8 })).success).toBe(false);
  });

  it("laat een ouder record door zodat het gemigreerd kan worden", () => {
    expect(zBaseRecord.safeParse(met({ schemaVersion: 1 })).success).toBe(true);
  });
});

describe("datumvelden — §8.1.4", () => {
  it("weigert een tijdstip met een tijdzone in plaats van UTC", () => {
    expect(zBaseRecord.safeParse(met({ createdAt: "2026-08-09T14:04:55.031+02:00" })).success).toBe(
      false,
    );
  });

  it("weigert een tijdstip zonder milliseconden", () => {
    expect(zBaseRecord.safeParse(met({ updatedAt: "2026-08-09T12:04:55Z" })).success).toBe(false);
  });

  it("weigert een kalenderdag die niet bestaat", () => {
    expect(zBaseRecord.safeParse(met({ createdAt: "2026-02-31T12:00:00.000Z" })).success).toBe(
      false,
    );
  });

  it("laat `deletedAt` leeg zijn, want leeg betekent: bestaat", () => {
    expect(zBaseRecord.safeParse(met({ deletedAt: null })).success).toBe(true);
    expect(zBaseRecord.safeParse(met({ deletedAt: "2026-08-09T12:04:55.031Z" })).success).toBe(true);
  });
});

describe("INV-04 — createdAt ligt niet ná updatedAt", () => {
  it("weigert een record dat vóór zijn eigen ontstaan is gewijzigd", () => {
    const omgedraaid = met({
      createdAt: "2026-08-09T12:04:55.031Z",
      updatedAt: "2026-08-01T09:15:00.000Z",
    });

    expect(zBaseRecord.safeParse(omgedraaid).success).toBe(false);
  });

  it("laat een record toe dat nog nooit gewijzigd is", () => {
    const gelijk = met({
      createdAt: "2026-08-09T12:04:55.031Z",
      updatedAt: "2026-08-09T12:04:55.031Z",
    });

    expect(zBaseRecord.safeParse(gelijk).success).toBe(true);
  });

  it("geldt ook voor een tabel die van het basisrecord erft", () => {
    const student = { ...leerling(), createdAt: "2027-01-01T00:00:00.000Z" };

    expect(zStudent.safeParse(student).success).toBe(false);
  });
});

describe("strict — DR-24, de voorwaarde onder INV-23", () => {
  it("weigert een onbekend veld op het basisrecord", () => {
    expect(zBaseRecord.safeParse(met({ verzonnen: true })).success).toBe(false);
  });

  it("houdt `strict` vast bij het uitbreiden", () => {
    // Zonder dit zou elke tabel los zijn zodra hij velden toevoegt, en zou
    // INV-23 alleen op het basisrecord gelden.
    expect(zStudent.safeParse({ ...leerling(), verzonnen: true }).success).toBe(false);
  });
});
