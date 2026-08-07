import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Student } from "@/types/student";

import { PrivacyService, toInitial } from "./PrivacyService";

const list = vi.fn();

vi.mock("./StudentService", () => ({
  StudentService: { list: (...args: unknown[]) => list(...args) },
}));

function student(overrides: Partial<Student>): Student {
  return {
    id: crypto.randomUUID(),
    firstName: "Kjeld",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  list.mockResolvedValue([]);
});

/** Productbesluit WF-039A: voornaam wordt de eerste letter met een punt. */
describe("toInitial", () => {
  it.each([
    ["Kjeld", "K."],
    ["roos", "R."],
    ["Jan-Peter", "J."],
    ["  Sanne  ", "S."],
  ])("maakt van %s een %s", (naam, verwacht) => {
    expect(toInitial(naam)).toBe(verwacht);
  });

  it("levert niets op bij een lege naam", () => {
    expect(toInitial("   ")).toBe("");
  });
});

describe("PrivacyService.getInitialsMasker", () => {
  it("vervangt een voornaam door de initiaal", async () => {
    list.mockResolvedValue([student({ firstName: "Kjeld" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("Kjeld bouwde een toren.")).toBe("K. bouwde een toren.");
  });

  it("neemt de roepnaam mee", async () => {
    // Precies het geval waarvoor de roepnaam bestaat (besluit B-25).
    list.mockResolvedValue([student({ firstName: "Jan-Peter", callName: "JP" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("JP en Jan-Peter zijn dezelfde.")).toBe("J. en J. zijn dezelfde.");
  });

  it("pakt de langste naam eerst", async () => {
    // Zonder die volgorde wordt "Jan-Peter" als "Jan" gepakt en blijft
    // "-Peter" staan (besluit T-04).
    list.mockResolvedValue([
      student({ firstName: "Jan" }),
      student({ firstName: "Jan-Peter" }),
    ]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("Jan-Peter speelde met Jan.")).toBe("J. speelde met J.");
  });

  it("verdubbelt de punt niet aan het eind van een zin", async () => {
    // De initiaal brengt zelf een punt mee; zonder deze regel staat er "J..".
    list.mockResolvedValue([student({ firstName: "Jan" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("De toren viel om bij Jan.")).toBe("De toren viel om bij J.");
    expect(masker("Jan. Roos. Jan")).toBe("J. Roos. J.");
  });

  it("laat de achternaam staan", async () => {
    // Doc 02 spreekt van voornamen; het productbesluit bevestigt dat de
    // achternaam er niet in meegaat.
    list.mockResolvedValue([student({ firstName: "Kjeld", lastName: "de Vries" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("Kjeld de Vries")).toBe("K. de Vries");
  });

  it("raakt namen middenin een ander woord niet aan", async () => {
    list.mockResolvedValue([student({ firstName: "Roos" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("De roosters hangen klaar.")).toBe("De roosters hangen klaar.");
  });

  it("vervangt ongeacht hoofdletters", async () => {
    list.mockResolvedValue([student({ firstName: "Roos" })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("roos en ROOS")).toBe("R. en R.");
  });

  it("neemt inactieve leerlingen mee", async () => {
    // Een vertrokken kind komt nog voor in documentaties van eerder dit jaar
    // (besluit T-12).
    list.mockResolvedValue([student({ firstName: "Sanne", active: false })]);
    const masker = await PrivacyService.getInitialsMasker();

    expect(list).toHaveBeenCalledWith({ includeInactive: true });
    expect(masker("Sanne verfde.")).toBe("S. verfde.");
  });

  it("laat tekst ongemoeid als het register leeg is", async () => {
    const masker = await PrivacyService.getInitialsMasker();

    expect(masker("Niemand staat geregistreerd.")).toBe("Niemand staat geregistreerd.");
  });
});
