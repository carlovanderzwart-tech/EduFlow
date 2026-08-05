"use client";

import { useEffect, useState } from "react";

import { getStorageEstimate } from "@/services/db";

import { ErrorMessage } from "./ErrorMessage";

const WARN_FROM_RATIO = 0.8;

/**
 * Waarschuwt wanneer de opslag voor 80% vol zit (besluit T-09).
 *
 * Nodig omdat Safari sinds versie 17 helemaal niets meldt als het vol raakt:
 * er komt een `QuotaExceededError` en verder niets (doc 03, *Opslaglimiet*).
 *
 * Doc 02 wil hier een knop naar exporteren en opruimen. Exporteren bestaat nog
 * niet, dus verwijst de melding nu alleen naar opruimen.
 */
export function StorageWarning() {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const estimate = await getStorageEstimate();
      if (active && estimate) setRatio(estimate.ratio);
    })();

    return () => {
      active = false;
    };
  }, []);

  if (ratio === null || ratio < WARN_FROM_RATIO) return null;

  return (
    <ErrorMessage
      message={`De opslag op dit apparaat is ${Math.round(ratio * 100)}% vol.`}
      nextStep="Ruim documentaties op die je niet meer nodig hebt, zodat er ruimte vrijkomt."
    />
  );
}
