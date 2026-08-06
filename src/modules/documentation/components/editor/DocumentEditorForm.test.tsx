import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Documentation } from "@/types/documentation";

import { DocumentEditorForm } from "./DocumentEditorForm";

const push = vi.fn();
const save = vi.fn();
const success = vi.fn();
const error = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => success(...args),
    error: (...args: unknown[]) => error(...args),
  },
}));

vi.mock("@/services/DocumentService", () => ({
  DocumentService: {
    save: (...args: unknown[]) => save(...args),
    getPhoto: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/SettingsService", () => ({
  SettingsService: { createSeries: vi.fn().mockResolvedValue(undefined) },
}));

const document: Documentation = {
  id: "d1",
  title: "Bouwen met blokken",
  groupId: "g1",
  studentIds: [],
  date: "2026-08-06",
  text: "De kinderen bouwden een toren.",
  quotes: [],
  photoIds: [],
  createdAt: "2026-08-06T09:00:00.000Z",
  updatedAt: "2026-08-06T09:00:00.000Z",
};

function renderForm() {
  render(
    <DocumentEditorForm
      initialDocument={document}
      initialSeriesName=""
      series={[]}
      groups={[]}
      students={[]}
    />,
  );
}

function klikOpslaan() {
  return act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  save.mockResolvedValue({ saved: true, doc: document });
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Issue #11 en #21 samen: de knop Opslaan bevestigt zichtbaar en brengt je
 * terug naar het overzicht; automatisch opslaan doet geen van beide.
 */
describe("DocumentEditorForm", () => {
  describe("de knop Opslaan", () => {
    it("bevestigt en gaat terug naar het overzicht", async () => {
      renderForm();
      await klikOpslaan();

      expect(success).toHaveBeenCalledWith("Opgeslagen.", expect.anything());
      expect(push).toHaveBeenCalledWith("/documentation");
    });

    it("laat de bevestiging na twee seconden verdwijnen", async () => {
      renderForm();
      await klikOpslaan();

      // Sonner houdt een melding standaard vier seconden vast; dat is voor een
      // bevestiging te lang, en langer dan `SaveStatus` aanhoudt.
      expect(success).toHaveBeenCalledWith("Opgeslagen.", { duration: 2000 });
    });

    it("schrijft niets weg wanneer er niets gewijzigd is", async () => {
      renderForm();
      await klikOpslaan();

      // Wel bevestigen en navigeren, maar geen schrijfactie: die zou
      // `updatedAt` verzetten en de documentatie in het overzicht laten
      // verspringen.
      expect(save).not.toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith("/documentation");
    });

    it("schrijft wél weg na een wijziging", async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText("Tekst"), {
        target: { value: "De toren viel om." },
      });
      await klikOpslaan();

      expect(save).toHaveBeenCalledOnce();
      expect(push).toHaveBeenCalledWith("/documentation");
    });

    it("blijft op de editor wanneer het opslaan mislukt", async () => {
      save.mockRejectedValue(new Error("opslag vol"));
      renderForm();

      fireEvent.change(screen.getByLabelText("Tekst"), {
        target: { value: "De toren viel om." },
      });
      await klikOpslaan();

      expect(error).toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      // Wegnavigeren zou het werk uit beeld halen dat juist niet bewaard is.
      expect(push).not.toHaveBeenCalled();
    });
  });

  describe("automatisch opslaan", () => {
    it("meldt niets en navigeert niet", async () => {
      vi.useFakeTimers();
      renderForm();

      fireEvent.change(screen.getByLabelText("Tekst"), {
        target: { value: "De toren viel om." },
      });
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(save).toHaveBeenCalledOnce();
      expect(success).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });
  });
});
