"use client";

import { useCallback, useEffect, useState } from "react";

import type { AppError, Result } from "@/lib/result";
import { diensten, type Diensten } from "@/services/diensten";

/**
 * Eén laadpad van scherm naar service (§10.10, DR-13).
 *
 * Een component vraagt gegevens op via een hook die een service aanroept, nooit
 * rechtstreeks via Dexie. Deze hook is die ene weg: hij wacht tot de opslag open
 * is, houdt de uitkomst vast, en houdt de fout apart zodat het scherm hem kan
 * tonen in plaats van leeg te blijven.
 *
 * `laad` hoort met `useCallback` te komen. Zonder die stabiele identiteit draait het
 * effect elke render opnieuw, en dat is een laadlus.
 */
export function useDienst<T>(laad: (diensten: Diensten) => Promise<Result<T>>) {
  const [waarde, setWaarde] = useState<T | null>(null);
  const [fout, setFout] = useState<AppError | null>(null);
  const [bezig, setBezig] = useState(true);
  const [ronde, setRonde] = useState(0);

  useEffect(() => {
    let actief = true;

    void (async () => {
      setBezig(true);

      // De `try` is er met bloed bij geschreven. Werpt `laad` — een service die een
      // geschonden invariant meldt, een record dat niet meer bij zijn schema past —
      // dan blijft zonder deze afhandeling `bezig` op `true` staan en kijkt de
      // gebruiker eeuwig naar een skelet. Een fout die je ziet is altijd beter dan
      // een scherm dat blijft laden (§9.5.3).
      try {
        const uitkomst = await laad(await diensten());
        if (!actief) return;

        if (uitkomst.ok) {
          setWaarde(uitkomst.value);
          setFout(null);
        } else {
          setFout(uitkomst.error);
        }
      } catch (oorzaak) {
        if (!actief) return;
        setFout({
          code: "INVALID_INPUT",
          message: oorzaak instanceof Error ? oorzaak.message : "Er ging iets onverwachts mis.",
          // Vernieuwen helpt hier meestal: de opslag heelt zichzelf bij het opstarten.
          recoverable: true,
        });
      }

      setBezig(false);
    })();

    return () => {
      actief = false;
    };
  }, [laad, ronde]);

  /** Opnieuw laden gebeurt door de teller te verhogen, niet door de vraag te herhalen. */
  const herlaad = useCallback(() => setRonde((r) => r + 1), []);

  return { waarde, fout, bezig, herlaad };
}
