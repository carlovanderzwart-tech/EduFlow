"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SaveState } from "@/components/common/SaveStatus";

const SAVE_DELAY_MS = 1000;
const SAVED_VISIBLE_MS = 2000;

interface UseAutosaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<void>;
  /** Uit zolang er nog niets te bewaren is. */
  enabled?: boolean;
}

/**
 * Slaat automatisch op na een seconde stilte, en altijd bij het verlaten van
 * het scherm (besluit T-09, doc 02 *Algemene eisen*).
 *
 * Niet bij elke toetsaanslag: dat zou bij elke letter naar IndexedDB schrijven.
 *
 * Of er iets te bewaren valt wordt bepaald door de inhoud te vergelijken met wat
 * er als laatste is opgeslagen — niet door bij te houden de hoeveelste render
 * het is. Dat laatste lijkt te werken, maar React voert effecten in
 * ontwikkelmodus bewust dubbel uit, waardoor het enkel openen van een
 * documentatie hem alsnog zou wegschrijven.
 */
export function useAutosave<T>({ value, onSave, enabled = true }: UseAutosaveOptions<T>) {
  const [state, setState] = useState<SaveState>("idle");

  // De beginstand: wat er stond toen dit scherm werd geopend. De initialisatie
  // van een ref draait één keer per mount, dus dit is een betrouwbaar ijkpunt.
  const savedSnapshot = useRef(JSON.stringify(value));

  // Refs, zodat opslaan bij het verlaten van het scherm de laatste waarde en de
  // laatste callback gebruikt.
  const valueRef = useRef(value);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    valueRef.current = value;
    onSaveRef.current = onSave;
    enabledRef.current = enabled;
  });

  const flush = useCallback(async () => {
    if (!enabledRef.current) return;

    const serialized = JSON.stringify(valueRef.current);
    if (serialized === savedSnapshot.current) return; // niets gewijzigd

    setState("saving");
    try {
      await onSaveRef.current(valueRef.current);
      savedSnapshot.current = serialized;
      setState("saved");
    } catch {
      // De melding komt van de aanroeper; hier alleen de indicator terugzetten,
      // zodat er niet ten onrechte "Opgeslagen." blijft staan.
      setState("idle");
    }
  }, []);

  // Debounce op wijzigingen.
  useEffect(() => {
    if (!enabled) return;
    if (JSON.stringify(value) === savedSnapshot.current) return;

    const timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value, enabled, flush]);

  // Laat "Opgeslagen." niet eeuwig staan.
  useEffect(() => {
    if (state !== "saved") return;
    const timer = setTimeout(() => setState("idle"), SAVED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // Bij het verlaten van het scherm: wegnavigeren (opruimen van dit effect) en
  // het sluiten of wegleggen van het tabblad (pagehide, want op iOS vuurt
  // beforeunload niet).
  useEffect(() => {
    const handlePageHide = () => void flush();
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      void flush();
    };
  }, [flush]);

  return { state, flush };
}
