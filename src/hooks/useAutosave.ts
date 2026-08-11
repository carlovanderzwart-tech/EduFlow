"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SaveState } from "@/ui/SaveStatus";

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
 * het scherm (besluit T-09, docs/archief/02 *Algemene eisen*).
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

  // Telt de bevestigingen. Zonder deze teller zou een tweede bevestiging binnen
  // twee seconden niets veranderen aan de status — die staat dan al op "saved" —
  // en zou het effect hieronder niet opnieuw draaien. De melding van de tweede
  // klik zou dan verdwijnen op de klok van de eerste.
  const [confirmationCount, setConfirmationCount] = useState(0);

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

  const confirmSaved = useCallback(() => {
    setState("saved");
    setConfirmationCount((count) => count + 1);
  }, []);

  /**
   * Stil opslaan: schrijft alleen weg als er iets gewijzigd is, en zwijgt
   * anders. Dit is wat de debounce, `pagehide` en het verlaten van het scherm
   * nodig hebben — die horen niets te melden wanneer er niets te doen viel.
   *
   * Geeft terug of er daadwerkelijk is weggeschreven.
   */
  const flush = useCallback(async () => {
    if (!enabledRef.current) return false;

    const serialized = JSON.stringify(valueRef.current);
    if (serialized === savedSnapshot.current) return false; // niets gewijzigd

    setState("saving");
    try {
      await onSaveRef.current(valueRef.current);
      savedSnapshot.current = serialized;
      confirmSaved();
      return true;
    } catch {
      // De melding komt van de aanroeper; hier alleen de indicator terugzetten,
      // zodat er niet ten onrechte "Opgeslagen." blijft staan.
      setState("idle");
      return false;
    }
  }, [confirmSaved]);

  /**
   * Opslaan op verzoek van de gebruiker. Bevestigt **altijd**, ook wanneer er
   * niets gewijzigd is (docs/archief/04, *Gedeelde patronen*: *"Kort bericht in beeld:
   * 'Opgeslagen.'"*). De knop staat er voor de zekerheid, en een knop die
   * zwijgt geeft die zekerheid niet.
   *
   * Is er niets gewijzigd, dan volgt alleen de bevestiging en **geen**
   * schrijfactie: een tweede keer wegschrijven zou `updatedAt` verzetten en de
   * documentatie in het overzicht laten verspringen, dat op laatst gewijzigd
   * sorteert. Bevestigen mag de volgorde van je overzicht niet veranderen.
   *
   * Geeft terug of er bevestigd mag worden: `true` bij een geslaagde
   * schrijfactie én wanneer er niets te schrijven viel, `false` wanneer het
   * opslaan mislukte. De aanroeper hangt daar zijn melding aan, zodat er nooit
   * "Opgeslagen." verschijnt boven een mislukte poging.
   */
  const saveNow = useCallback(async () => {
    if (!enabledRef.current) return false;

    if (JSON.stringify(valueRef.current) === savedSnapshot.current) {
      confirmSaved();
      return true;
    }

    return flush();
  }, [flush, confirmSaved]);

  // Debounce op wijzigingen.
  useEffect(() => {
    if (!enabled) return;
    if (JSON.stringify(value) === savedSnapshot.current) return;

    const timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value, enabled, flush]);

  // Laat "Opgeslagen." niet eeuwig staan. `confirmationCount` staat erbij zodat
  // een volgende bevestiging de klok opnieuw laat lopen.
  useEffect(() => {
    if (state !== "saved") return;
    const timer = setTimeout(() => setState("idle"), SAVED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [state, confirmationCount]);

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

  return { state, saveNow };
}
