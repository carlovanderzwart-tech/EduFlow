import { describe, expect, it } from "vitest";

import { groep, lidmaatschap, zonderVeld } from "../toetsgegevens";
import { zGroup, zGroupMembership } from "./group";

describe("zGroup — §8.3.2", () => {
  it("laat een geldige groep door", () => {
    expect(zGroup.safeParse(groep()).success).toBe(true);
  });

  it("weigert een groepssoort die niet bestaat", () => {
    expect(zGroup.safeParse({ ...groep(), kind: "kleutergroep" }).success).toBe(false);
  });

  it("weigert een negende kleur", () => {
    expect(zGroup.safeParse({ ...groep(), colour: "series-9" }).success).toBe(false);
  });

  it("weigert een groep zonder schooljaar (INV-27)", () => {
    expect(zGroup.safeParse(zonderVeld(groep(), "schoolYearId")).success).toBe(false);
  });

  it("weigert een `studentIds` op een groep", () => {
    // Beide richtingen lopen uitsluitend via groupMemberships (U-07, B-16).
    expect(zGroup.safeParse({ ...groep(), studentIds: [] }).success).toBe(false);
  });
});

describe("zGroupMembership — §8.3.3, INV-24", () => {
  it("laat een lopend lidmaatschap door", () => {
    expect(zGroupMembership.safeParse(lidmaatschap()).success).toBe(true);
  });

  it("laat een afgesloten lidmaatschap door", () => {
    expect(zGroupMembership.safeParse({ ...lidmaatschap(), to: "2027-07-09" }).success).toBe(true);
  });

  it("weigert een einddatum vóór de begindatum", () => {
    const omgekeerd = { ...lidmaatschap(), from: "2026-10-01", to: "2026-09-30" };

    expect(zGroupMembership.safeParse(omgekeerd).success).toBe(false);
  });

  it("wijst het veld `to` aan bij die fout, zodat het scherm het kan markeren", () => {
    const uitkomst = zGroupMembership.safeParse({
      ...lidmaatschap(),
      from: "2026-10-01",
      to: "2026-09-30",
    });

    if (uitkomst.success) throw new Error("hoort te falen");
    expect(uitkomst.error.issues.some((kwestie) => kwestie.path.includes("to"))).toBe(true);
  });

  it("laat begin en einde op dezelfde dag toe", () => {
    const eenDag = { ...lidmaatschap(), from: "2026-10-01", to: "2026-10-01" };

    expect(zGroupMembership.safeParse(eenDag).success).toBe(true);
  });

  it("weigert een begindatum die geen bestaande kalenderdag is", () => {
    expect(zGroupMembership.safeParse({ ...lidmaatschap(), from: "2026-02-30" }).success).toBe(
      false,
    );
  });

  it("weigert een lidmaatschap zonder begindatum", () => {
    expect(zGroupMembership.safeParse(zonderVeld(lidmaatschap(), "from")).success).toBe(false);
  });

  it("weigert een rol die niet bestaat", () => {
    expect(zGroupMembership.safeParse({ ...lidmaatschap(), role: "hoofdgroep" }).success).toBe(
      false,
    );
  });
});
