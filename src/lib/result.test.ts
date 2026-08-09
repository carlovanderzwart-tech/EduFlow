import { describe, expect, it } from "vitest";

import type { AppError, ErrorCode, Result } from "./result";

describe("Result — §10.3, T-27", () => {
  it("versmalt naar de waarde bij ok", () => {
    const uitkomst: Result<number> = { ok: true, value: 42 };

    if (!uitkomst.ok) throw new Error("hoort ok te zijn");
    expect(uitkomst.value).toBe(42);
  });

  it("versmalt naar de fout bij niet-ok", () => {
    const uitkomst: Result<number> = {
      ok: false,
      error: {
        code: "STORAGE_FULL",
        message: "De opslag op dit apparaat is vol.",
        recoverable: true,
      },
    };

    if (uitkomst.ok) throw new Error("hoort een fout te zijn");
    expect(uitkomst.error.code).toBe("STORAGE_FULL");
  });

  it("draagt de handeling mee die het scherm aanbiedt", () => {
    const fout: AppError = {
      code: "AI_UNREACHABLE",
      message: "Meeschrijven lukt nu niet. Je tekst staat er nog.",
      recoverable: true,
      action: { label: "Opnieuw proberen", kind: "retry" },
    };

    expect(fout.action?.kind).toBe("retry");
  });
});

describe("ErrorCode — alleen wat de Bible noemt", () => {
  it("kent de drie codes uit §10.3", () => {
    const codes: ErrorCode[] = ["STORAGE_FULL", "AI_UNREACHABLE", "PRIVACY_GATE"];

    expect(codes).toHaveLength(3);
  });

  it("weigert een code die de Bible niet noemt", () => {
    // @ts-expect-error — de unie is gesloten. Deze toets bestaat om te bewijzen
    // dat er geen code bijkomt zonder dat de Bible hem noemt; zonder de
    // onderdrukking zou hij niet compileren, en dat is precies de bedoeling.
    const verzonnen: ErrorCode = "MAIL_BOUNCED";

    expect(verzonnen).toBe("MAIL_BOUNCED");
  });
});
