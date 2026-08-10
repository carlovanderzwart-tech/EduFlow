import { describe, expect, it } from "vitest";

import { instellingen, zonderVeld } from "../toetsgegevens";
import { zSettings } from "./settings";

describe("zSettings — §8.3.14, T-50", () => {
  it("laat een geldig instellingenrecord door", () => {
    expect(zSettings.safeParse(instellingen()).success).toBe(true);
  });

  it("eist het apparaat-id, want elk record draagt het als `origin`", () => {
    // §8.1.4: het apparaat-id is een UUIDv7 die bij de eerste start ontstaat en
    // in de settings-tabel staat.
    expect(zSettings.safeParse(zonderVeld(instellingen(), "deviceId")).success).toBe(false);
    expect(zSettings.safeParse({ ...instellingen(), deviceId: "pc-ilse" }).success).toBe(false);
  });

  it("weigert een drempel buiten een schooljaar", () => {
    expect(zSettings.safeParse({ ...instellingen(), attentionThresholdDays: 0 }).success).toBe(
      false,
    );
    expect(zSettings.safeParse({ ...instellingen(), attentionThresholdDays: 366 }).success).toBe(
      false,
    );
  });

  it("kent twee woorden voor een leerling en geen derde", () => {
    expect(zSettings.safeParse({ ...instellingen(), pupilNoun: "kind" }).success).toBe(true);
    expect(zSettings.safeParse({ ...instellingen(), pupilNoun: "pupil" }).success).toBe(false);
  });
});

describe("FR-MAI-24 — vier detectoren zijn niet uit te zetten", () => {
  it("weigert BSN, IBAN, e-mailadres en telefoonnummer in de uitzetlijst", () => {
    // Dit is handhaving in het type: die vier bestaan niet als waarde, dus ze
    // kunnen nooit worden uitgezet. Ze zijn "vast aan en grijs".
    for (const detector of ["bsn", "iban", "email", "telefoon"]) {
      expect(
        zSettings.safeParse({ ...instellingen(), disabledDetectors: [detector] }).success,
      ).toBe(false);
    }
  });

  it("laat de vijf overige detectoren wel uitzetten", () => {
    const vijf = ["adres", "aanhef", "ondertekening", "handtekeningblok", "achternaam"];

    expect(zSettings.safeParse({ ...instellingen(), disabledDetectors: vijf }).success).toBe(true);
  });
});

describe("wat hier niet hoort te staan — §8.2.2", () => {
  it("weigert de zes waarden die alleen in localStorage staan", () => {
    // U-02 in de praktijk: één gegeven, één plek. `strict` maakt dat afdwingbaar.
    for (const veld of ["region", "defaultTone", "aiProvider", "lastView", "lastBackupAt"]) {
      expect(zSettings.safeParse({ ...instellingen(), [veld]: "x" }).success).toBe(false);
    }
  });

  it("weigert een gebruikersnaam, want er is geen User in 1.0 (T-50)", () => {
    expect(zSettings.safeParse({ ...instellingen(), userName: "Ilse" }).success).toBe(false);
  });
});
