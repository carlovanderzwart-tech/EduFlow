/**
 * De tabellen die geen eigen toetsbestand nodig hebben.
 *
 * Voor elk schema staat hier één geldig record en de regels die het handboek er
 * uitdrukkelijk bij noemt. De invarianten die volgens §9.5 bij een service of een
 * scherm horen, staan er met opzet niet bij; die worden getoetst waar ze wonen.
 */

import { describe, expect, it } from "vitest";

import {
  aiAanroep,
  bericht,
  foto,
  fotoformaat,
  journaalregel,
  logboekregel,
  mailconcept,
  postbus,
  privacyterm,
  reeks,
  schooljaar,
  sjabloon,
  stijlprofiel,
  stijlvoorbeeld,
  terugkoppeling,
  vakantieaanpassing,
  zonderVeld,
} from "../toetsgegevens";
import { zAiInteraction, zFeedback } from "./ai";
import { zAuditEvent, zChangeLogEntry } from "./audit";
import { zMailAccount, zMailDraft, zMailMessage, zMailTemplate } from "./mail";
import { zPhoto, zPhotoVariant } from "./photo";
import { zPrivacyTerm } from "./privacy";
import { zHolidayOverride, zSchoolYear } from "./schoolYear";
import { zSeries } from "./series";
import { zStyleExample, zStyleProfile } from "./style";

describe("elk schema laat zijn eigen geldige record door", () => {
  const paren = [
    ["series", zSeries, reeks()],
    ["photos", zPhoto, foto()],
    ["photoVariants", zPhotoVariant, fotoformaat()],
    ["schoolYears", zSchoolYear, schooljaar()],
    ["holidayOverrides", zHolidayOverride, vakantieaanpassing()],
    ["mailAccounts", zMailAccount, postbus()],
    ["mailMessages", zMailMessage, bericht()],
    ["mailDrafts", zMailDraft, mailconcept()],
    ["mailTemplates", zMailTemplate, sjabloon()],
    ["privacyTerms", zPrivacyTerm, privacyterm()],
    ["styleProfile", zStyleProfile, stijlprofiel()],
    ["styleExamples", zStyleExample, stijlvoorbeeld()],
    ["aiInteractions", zAiInteraction, aiAanroep()],
    ["feedback", zFeedback, terugkoppeling()],
    ["auditEvents", zAuditEvent, logboekregel()],
    ["changeLog", zChangeLogEntry, journaalregel()],
  ] as const;

  it.each(paren)("%s", (_naam, schema, record) => {
    const uitkomst = schema.safeParse(record);
    if (!uitkomst.success) throw new Error(JSON.stringify(uitkomst.error.issues));
    expect(uitkomst.success).toBe(true);
  });

  it("weigert overal een onbekend veld", () => {
    for (const [, schema, record] of paren) {
      expect(schema.safeParse({ ...record, verzonnen: true }).success).toBe(false);
    }
  });
});

describe("zSeries — §8.3.4", () => {
  it("weigert een beschrijving boven vijfhonderd tekens", () => {
    // De beschrijving gaat als context mee naar de AI (B-04); daarom de grens.
    expect(zSeries.safeParse({ ...reeks(), description: "a".repeat(501) }).success).toBe(false);
  });

  it("weigert een lege naam", () => {
    expect(zSeries.safeParse({ ...reeks(), name: "" }).success).toBe(false);
  });
});

describe("zPhoto — §8.3.7", () => {
  it("weigert een hash die geen SHA-256 is", () => {
    expect(zPhoto.safeParse({ ...foto(), hash: "abc" }).success).toBe(false);
  });

  it("weigert een foto van nul pixels breed", () => {
    expect(zPhoto.safeParse({ ...foto(), width: 0 }).success).toBe(false);
  });

  it("weigert een negatieve verwijzingsteller", () => {
    expect(zPhoto.safeParse({ ...foto(), refCount: -1 }).success).toBe(false);
  });

  it("laat een verweesde foto toe, want die bestaat tot de opruimronde (INV-17)", () => {
    expect(zPhoto.safeParse({ ...foto(), refCount: 0 }).success).toBe(true);
  });

  it("laat een foto zonder opnamedatum toe", () => {
    expect(zPhoto.safeParse({ ...foto(), capturedAt: null }).success).toBe(true);
  });
});

describe("zPhotoVariant — §8.3.7", () => {
  it("kent precies drie formaten (INV-18)", () => {
    for (const variant of ["thumb", "screen", "print"]) {
      expect(zPhotoVariant.safeParse({ ...fotoformaat(), variant }).success).toBe(true);
    }
    expect(zPhotoVariant.safeParse({ ...fotoformaat(), variant: "origineel" }).success).toBe(false);
  });

  it("weigert een variant zonder blob", () => {
    expect(zPhotoVariant.safeParse({ ...fotoformaat(), blob: "beeld" }).success).toBe(false);
  });
});

describe("zSchoolYear en zHolidayOverride — §8.3.8", () => {
  it("kent drie regio's en geen vierde", () => {
    for (const region of ["noord", "midden", "zuid"]) {
      expect(zSchoolYear.safeParse({ ...schooljaar(), region }).success).toBe(true);
    }
    expect(zSchoolYear.safeParse({ ...schooljaar(), region: "oost" }).success).toBe(false);
  });

  it("weigert een schooldag die geen kalenderdag is", () => {
    expect(zSchoolYear.safeParse({ ...schooljaar(), firstSchoolDay: "2026-13-01" }).success).toBe(
      false,
    );
  });

  it("houdt de drieledige sleutel van een aanpassing verplicht (B-50)", () => {
    // Die drie samen zijn de sleutel, zodat een update van het bronbestand jouw
    // aanpassing niet raakt. Ontbreekt er één, dan is de aanpassing niet meer
    // terug te vinden bij de vakantie waar hij bij hoort.
    for (const veld of ["schoolYearName", "region", "holidayKey"]) {
      expect(zHolidayOverride.safeParse(zonderVeld(vakantieaanpassing(), veld)).success).toBe(
        false,
      );
    }
  });
});

describe("zMailDraft — INV-34, B-36", () => {
  it("weigert een concept zonder onderwerp", () => {
    expect(zMailDraft.safeParse({ ...mailconcept(), subject: "" }).success).toBe(false);
  });

  it("weigert een onderwerp van alleen spaties", () => {
    // INV-34 vraagt om minstens één *zichtbaar* teken.
    expect(zMailDraft.safeParse({ ...mailconcept(), subject: "   " }).success).toBe(false);
  });

  it("weigert een onderwerp boven honderdvijftig tekens", () => {
    expect(zMailDraft.safeParse({ ...mailconcept(), subject: "a".repeat(151) }).success).toBe(
      false,
    );
  });

  it("kent twee statussen en geen `verstuurd` (B-20, §9.7.2)", () => {
    expect(zMailDraft.safeParse({ ...mailconcept(), status: "overgedragen" }).success).toBe(true);
    expect(zMailDraft.safeParse({ ...mailconcept(), status: "verstuurd" }).success).toBe(false);
  });
});

describe("zMailAccount en zMailMessage — §8.3.9", () => {
  it("kent twee aanbieders (§6.3.2)", () => {
    expect(zMailAccount.safeParse({ ...postbus(), provider: "google" }).success).toBe(true);
    expect(zMailAccount.safeParse({ ...postbus(), provider: "imap" }).success).toBe(false);
  });

  it("bewaart geen tokens (T-15, FR-MAI-06)", () => {
    const metToken = { ...postbus(), accessToken: "geheim" };

    expect(zMailAccount.safeParse(metToken).success).toBe(false);
  });

  it("bewaart van bijlagen alleen de namen (FR-MAI-11)", () => {
    const metInhoud = { ...bericht(), attachments: [new Blob(["x"])] };

    expect(zMailMessage.safeParse(metInhoud).success).toBe(false);
    expect(zMailMessage.safeParse({ ...bericht(), attachmentNames: ["brief.pdf"] }).success).toBe(
      true,
    );
  });
});

describe("zStyleProfile — §8.3.11, FR-INS-14", () => {
  it("draagt per kenmerk of het handmatig is overschreven", () => {
    const zonderVlag = { ...stijlprofiel(), tense: { value: "verleden" } };

    expect(zStyleProfile.safeParse(zonderVlag).success).toBe(false);
  });

  it("weigert een verhouding buiten nul tot één", () => {
    const scheef = { ...stijlprofiel(), descriptionRatio: { value: 1.4, manual: false } };

    expect(zStyleProfile.safeParse(scheef).success).toBe(false);
  });

  it("weigert een aanspreekvorm die niet bestaat", () => {
    const onbekend = { ...stijlprofiel(), address: { value: "jij", manual: false } };

    expect(zStyleProfile.safeParse(onbekend).success).toBe(false);
  });
});

describe("zAiInteraction — §8.3.12, FR-PRV-08", () => {
  it("kent de acht taken uit het handboek", () => {
    for (const task of [
      "doc.write",
      "doc.title",
      "doc.followup",
      "doc.spelling",
      "talk.build",
      "mail.summarise",
      "mail.write",
      "mail.tone",
    ]) {
      expect(zAiInteraction.safeParse({ ...aiAanroep(), task }).success).toBe(true);
    }
  });

  it("weigert een prompt of een antwoord in het logboek", () => {
    // Dit is de reden dat dit logboek bij een privacygesprek op tafel kan.
    expect(zAiInteraction.safeParse({ ...aiAanroep(), prompt: "..." }).success).toBe(false);
    expect(zAiInteraction.safeParse({ ...aiAanroep(), response: "..." }).success).toBe(false);
  });

  it("weigert een overeenkomst buiten nul tot één", () => {
    expect(zAiInteraction.safeParse({ ...aiAanroep(), similarity: 1.2 }).success).toBe(false);
  });

  it("kent de vier afwijsredenen uit B-73, plus leeg", () => {
    for (const reden of ["te_lang", "te_bloemrijk", "klopt_niet", "anders", null]) {
      expect(zAiInteraction.safeParse({ ...aiAanroep(), rejectReason: reden }).success).toBe(true);
    }
    expect(zAiInteraction.safeParse({ ...aiAanroep(), rejectReason: "saai" }).success).toBe(false);
  });

  it("weigert een oordeel dat niet bestaat", () => {
    expect(zFeedback.safeParse({ ...terugkoppeling(), verdict: "prima" }).success).toBe(false);
  });
});

describe("zChangeLogEntry — §8.3.13", () => {
  it("erft niet van het basisrecord", () => {
    // De enige tabel waarvoor dat geldt (§8.3). Een journaalregel heeft geen
    // eigen `rev`; de `rev` erin is die van het gewijzigde aggregaat.
    const metBasis = { ...journaalregel(), id: "0198a1b2-c3d4-7ef0-8123-456789abcdef" };

    expect(zChangeLogEntry.safeParse(metBasis).success).toBe(false);
  });

  it("bevat geen veldwaarden", () => {
    const metWaarden = { ...journaalregel(), before: {}, after: {} };

    expect(zChangeLogEntry.safeParse(metWaarden).success).toBe(false);
  });

  it("kent drie bewerkingen", () => {
    for (const op of ["create", "update", "delete"]) {
      expect(zChangeLogEntry.safeParse({ ...journaalregel(), op }).success).toBe(true);
    }
    expect(zChangeLogEntry.safeParse({ ...journaalregel(), op: "purge" }).success).toBe(false);
  });
});

describe("zAuditEvent — §8.3.13, INV-52", () => {
  it("laat een feitelijke beschrijving zonder namen door", () => {
    expect(zAuditEvent.safeParse(logboekregel()).success).toBe(true);
  });

  it("weigert een regel zonder soort", () => {
    expect(zAuditEvent.safeParse({ ...logboekregel(), kind: "" }).success).toBe(false);
  });
});
