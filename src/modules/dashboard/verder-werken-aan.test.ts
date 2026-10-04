import { describe, expect, it } from "vitest";

import type { Documentation } from "@/domain/types";

import { verderWerkenAan } from "./hooks/useDashboard";

/**
 * Het blok Verder werken aan (`FR-DAS-01`, `FR-DAS-02`, `FR-DOC-120`).
 *
 * De hele inhoud van dat blok is één functie van drie zinnen, en die is zuiver —
 * daarom is er geen dashboard voor nodig om hem te toetsen.
 *
 * Deze toetsen staan hier en niet bij de andere archiveertoetsen, omdat een module
 * nooit uit een andere module importeert (§10.2) en dat ook voor een toets geldt.
 */

function concept(title: string, updatedAt: string, archivedAt: string | null = null): Documentation {
  return { title, status: "concept", updatedAt, archivedAt } as Documentation;
}

describe("Verder werken aan — `FR-DAS-01`, `FR-DAS-02`, `FR-DOC-120`", () => {
  it("laat gearchiveerde concepten weg (`FR-DOC-120`)", () => {
    const blok = verderWerkenAan([
      concept("Bouwhoek", "2026-10-03T09:00:00.000Z"),
      concept("Kunstwerk Dok", "2026-10-04T09:00:00.000Z", "2026-10-04T10:00:00.000Z"),
    ]);

    // Dit blok gaat over waar je gebleven was. Werk dat je bewust hebt afgesloten
    // hoort daar niet meer tussen (B-144).
    expect(blok.map((doc) => doc.title)).toEqual(["Bouwhoek"]);
  });

  it("laat gedeelde documentaties weg (`FR-DAS-01`)", () => {
    const gedeeld = { ...concept("Al weg", "2026-10-04T09:00:00.000Z"), status: "gedeeld" };

    expect(verderWerkenAan([gedeeld as Documentation])).toHaveLength(0);
  });

  it("houdt de volgorde op laatst bewerkt (`FR-DAS-02`)", () => {
    const blok = verderWerkenAan([
      concept("Oud", "2026-09-01T09:00:00.000Z"),
      concept("Nieuw", "2026-10-04T09:00:00.000Z"),
    ]);

    // Elders is "wanneer" de dag waarop het gebeurde; hier is het waar je was.
    expect(blok.map((doc) => doc.title)).toEqual(["Nieuw", "Oud"]);
  });

  it("toont er hoogstens vijf (`FR-DAS-01`)", () => {
    const zes = Array.from({ length: 6 }, (_, nummer) =>
      concept(`Nummer ${nummer}`, `2026-10-0${nummer + 1}T09:00:00.000Z`),
    );

    expect(verderWerkenAan(zes)).toHaveLength(5);
  });

  it("laat de meegegeven lijst met rust (DR-24)", () => {
    const lijst = [
      concept("Oud", "2026-09-01T09:00:00.000Z"),
      concept("Nieuw", "2026-10-04T09:00:00.000Z"),
    ];

    verderWerkenAan(lijst);

    expect(lijst.map((doc) => doc.title)).toEqual(["Oud", "Nieuw"]);
  });
});
