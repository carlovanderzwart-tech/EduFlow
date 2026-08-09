import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import type { DomainEvent, DomainEventType } from ".";
import { DE_NUMMER } from ".";

/** DE-01 tot en met DE-39, zoals §9.6 ze nummert. */
const VERWACHTE_NUMMERS: string[] = Array.from(
  { length: 39 },
  (_, index) => `DE-${String(index + 1).padStart(2, "0")}`,
);

describe("de negenendertig domeingebeurtenissen — §9.6", () => {
  it("kent er precies negenendertig", () => {
    expect(Object.keys(DE_NUMMER)).toHaveLength(39);
  });

  it("dekt DE-01 tot en met DE-39, zonder gat en zonder doublure", () => {
    // Regel 1 van het besluitenregister: een nummer wordt nooit hergebruikt
    // (§19.1). Een dubbel nummer zou twee gebeurtenissen dezelfde herkomst geven.
    expect([...Object.values(DE_NUMMER)].sort()).toEqual(VERWACHTE_NUMMERS);
  });

  it("geeft elke gebeurtenis een unieke naam", () => {
    expect(new Set(Object.keys(DE_NUMMER)).size).toBe(39);
  });

  it("draagt de namen die §9.6 letterlijk geeft", () => {
    expect(DE_NUMMER.DocumentationCreated).toBe("DE-01");
    expect(DE_NUMMER.PhotoAdded).toBe("DE-08");
    expect(DE_NUMMER.PrivacyGateBlocked).toBe("DE-18");
    expect(DE_NUMMER.DocumentationExported).toBe("DE-21");
    expect(DE_NUMMER.DocumentationShared).toBe("DE-22");
    expect(DE_NUMMER.MailDraftHandedOff).toBe("DE-34");
    expect(DE_NUMMER.AccessCodeRejected).toBe("DE-39");
  });
});

describe("de unie is gesloten", () => {
  it("herkent elke gebeurtenis aan zijn `type`", () => {
    const gebeurtenis: DomainEvent = {
      type: "DocumentationCreated",
      documentationId: newId(),
      date: "2026-10-13",
      source: "gespreksmodus",
    };

    // Versmallen op `type` is wat een luisteraar straks doet; zonder
    // gediscrimineerde unie zou dat een reeks controles op losse velden worden.
    if (gebeurtenis.type !== "DocumentationCreated") throw new Error("verkeerde tak");
    expect(gebeurtenis.source).toBe("gespreksmodus");
  });

  it("weigert een gebeurtenis die het handboek niet noemt", () => {
    // @ts-expect-error — de unie is gesloten. Zonder de onderdrukking zou deze
    // regel niet compileren, en dat is precies de bedoeling: er komt geen
    // veertigste gebeurtenis bij zonder dat §9.6 hem noemt (DR-01).
    const verzonnen: DomainEventType = "DocumentationPrinted";

    expect(verzonnen).toBe("DocumentationPrinted");
  });
});

describe("DE-21 en DE-22 zijn niet hetzelfde", () => {
  it("vuurt DE-21 bij elke export en DE-22 alleen bij de eerste", () => {
    // Dat onderscheid draagt de overgang naar `gedeeld` (B-13, INV-15). Eén
    // gebeurtenis voor allebei zou de status bij elke export opnieuw zetten.
    const documentationId = newId();
    const elkeExport: DomainEvent = {
      type: "DocumentationExported",
      documentationId,
      kind: "pdf",
      pageCount: 3,
      initialsUsed: true,
    };
    const eersteKeer: DomainEvent = {
      type: "DocumentationShared",
      documentationId,
      kind: "pdf",
      at: "2026-11-14T10:00:00.000Z",
    };

    expect(DE_NUMMER[elkeExport.type]).toBe("DE-21");
    expect(DE_NUMMER[eersteKeer.type]).toBe("DE-22");
  });
});
