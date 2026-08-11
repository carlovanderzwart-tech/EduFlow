"use client";

import { useEffect, useState } from "react";

import { opslag } from "@/services/storage/start";
import { OPSLAGDREMPEL } from "@/services/storage/StorageService";

import { ErrorMessage } from "@/ui/ErrorMessage";

/**
 * Waarschuwt wanneer de opslag voor tachtig procent vol zit (INV-53, T-09).
 *
 * Nodig omdat Safari sinds versie 17 helemaal niets meldt als het vol raakt: er
 * komt een `QuotaExceededError` en verder niets. Zonder deze waarschuwing merkt de
 * gebruiker het pas als een documentatie niet meer opslaat.
 *
 * De verhouding komt uit `StorageService.usage()` en niet meer uit een eigen
 * aanroep van `navigator.storage`. Dat is DR-13: de opslaglaag is van
 * `services/storage/` en van niemand anders — ook niet voor een schatting.
 */
export function StorageWarning() {
  const [verhouding, setVerhouding] = useState<number | null>(null);

  useEffect(() => {
    let actief = true;

    void (async () => {
      const uitkomst = await (await opslag()).usage();
      // Geeft de browser geen schatting, dan waarschuwt het scherm niet: een
      // waarschuwing op een gok is erger dan geen waarschuwing.
      if (!actief || !uitkomst.ok || !uitkomst.value.bekend) return;
      setVerhouding(uitkomst.value.verhouding);
    })();

    return () => {
      actief = false;
    };
  }, []);

  if (verhouding === null || verhouding < OPSLAGDREMPEL) return null;

  return (
    <ErrorMessage
      message={`De opslag op dit apparaat is ${Math.round(verhouding * 100)}% vol.`}
      nextStep="Ruim documentaties op die je niet meer nodig hebt, zodat er ruimte vrijkomt."
    />
  );
}
