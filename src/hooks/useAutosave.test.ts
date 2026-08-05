import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutosave } from "./useAutosave";

const SAVE_DELAY_MS = 1000;
const SAVED_VISIBLE_MS = 2000;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Laat de debounce aflopen en de belofte van `onSave` afhandelen. */
async function letAutosaveRun(ms = SAVE_DELAY_MS) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe("useAutosave", () => {
  describe("expliciet opslaan", () => {
    it("bevestigt zonder te schrijven wanneer er niets gewijzigd is", async () => {
      // De kern van issue #21: de knop staat er voor de zekerheid, dus hij
      // bevestigt ook als autosave hem al voor was. Zonder schrijfactie, want
      // die zou `updatedAt` verzetten en de documentatie in het overzicht laten
      // verspringen.
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutosave({ value: { text: "hallo" }, onSave }));

      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).not.toHaveBeenCalled();
      expect(result.current.state).toBe("saved");
    });

    it("schrijft wél weg wanneer er iets gewijzigd is", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).toHaveBeenCalledOnce();
      expect(onSave).toHaveBeenCalledWith({ text: "hallo wereld" });
      expect(result.current.state).toBe("saved");
    });

    it("schrijft niet nog een keer weg bij een tweede klik", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      await act(async () => {
        await result.current.saveNow();
      });
      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).toHaveBeenCalledOnce();
      expect(result.current.state).toBe("saved");
    });

    it("bevestigt niet wanneer het opslaan mislukt", async () => {
      const onSave = vi.fn().mockRejectedValue(new Error("opslag vol"));
      const { result, rerender } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      await act(async () => {
        await result.current.saveNow();
      });

      // Geen valse bevestiging; de melding zelf komt van de aanroeper.
      expect(result.current.state).toBe("idle");
    });

    it("doet niets zolang er nog niets te bewaren is", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutosave({ value: { text: "" }, onSave, enabled: false }),
      );

      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).not.toHaveBeenCalled();
      expect(result.current.state).toBe("idle");
    });

    it("laat de melding opnieuw staan bij een tweede bevestiging", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutosave({ value: { text: "hallo" }, onSave }));

      await act(async () => {
        await result.current.saveNow();
      });

      // Vlak vóór de melding zou verdwijnen nog een keer bevestigen.
      await act(async () => {
        vi.advanceTimersByTime(SAVED_VISIBLE_MS - 100);
      });
      await act(async () => {
        await result.current.saveNow();
      });

      // Op de klok van de eerste klik zou de melding nu weg zijn.
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.state).toBe("saved");

      // Op de klok van de tweede klik verdwijnt hij alsnog.
      await act(async () => {
        vi.advanceTimersByTime(SAVED_VISIBLE_MS);
      });
      expect(result.current.state).toBe("idle");
    });
  });

  describe("automatisch opslaan", () => {
    it("schrijft weg na een seconde stilte", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      expect(onSave).not.toHaveBeenCalled();

      await letAutosaveRun();

      expect(onSave).toHaveBeenCalledOnce();
      expect(result.current.state).toBe("saved");
    });

    it("schrijft niets weg bij het enkel openen van een documentatie", async () => {
      // Ook niet in ontwikkelmodus, waar React effecten dubbel uitvoert: de
      // vergelijking gaat op inhoud, niet op het aantal renders.
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(() => useAutosave({ value: { text: "hallo" }, onSave }));

      rerender();
      await letAutosaveRun(SAVE_DELAY_MS * 3);

      expect(onSave).not.toHaveBeenCalled();
    });

    it("meldt niets wanneer er niets gewijzigd is", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutosave({ value: { text: "hallo" }, onSave }));

      await letAutosaveRun(SAVE_DELAY_MS * 3);

      // Alleen een expliciete klik bevestigt zonder wijziging; de timer zwijgt.
      expect(result.current.state).toBe("idle");
    });

    it("laat de melding na twee seconden verdwijnen", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      await letAutosaveRun();
      expect(result.current.state).toBe("saved");

      await act(async () => {
        vi.advanceTimersByTime(SAVED_VISIBLE_MS);
      });

      expect(result.current.state).toBe("idle");
    });

    it("schrijft weg bij het verlaten van het scherm", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender, unmount } = renderHook(
        ({ text }) => useAutosave({ value: { text }, onSave }),
        { initialProps: { text: "hallo" } },
      );

      rerender({ text: "hallo wereld" });
      await act(async () => {
        unmount();
      });

      expect(onSave).toHaveBeenCalledOnce();
    });

    it("schrijft weg wanneer het tabblad wordt weggelegd", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(({ text }) => useAutosave({ value: { text }, onSave }), {
        initialProps: { text: "hallo" },
      });

      rerender({ text: "hallo wereld" });
      await act(async () => {
        window.dispatchEvent(new Event("pagehide"));
      });

      expect(onSave).toHaveBeenCalledOnce();
    });
  });
});
