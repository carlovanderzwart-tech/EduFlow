import { Check } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

export type SaveState = "idle" | "saving" | "saved";

/**
 * Terugkoppeling van automatisch opslaan.
 *
 * docs/archief/04 (*Gedeelde patronen*): *"Opslaan. Automatisch tijdens het typen. Kort
 * bericht in beeld: 'Opgeslagen.'"*
 *
 * Bewust geen toast: automatisch opslaan gebeurt na elke seconde stilte tijdens
 * het typen, en een toast per keer levert een stroom meldingen op. Dit is een
 * rustige regel naast het veld.
 *
 * `aria-live="polite"` meldt de wijziging aan een schermlezer zonder te
 * onderbreken; `role="status"` hoort daarbij. De vaste hoogte voorkomt dat de
 * inhoud eronder verschuift zodra de melding komt of gaat.
 */
export function SaveStatus({ state }: { state: SaveState }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="flex h-5 items-center gap-1.5 text-xs text-muted-foreground"
    >
      {state === "saving" ? (
        <>
          {/* De primitive draagt zelf `role="status"` en een Engels
              `aria-label="Loading"`. Binnen deze regio is dat dubbel: de
              statusmelding staat er al in het Nederlands naast. Daarom hier
              decoratief. */}
          <Spinner aria-hidden="true" aria-label={undefined} role={undefined} className="size-3" />
          Opslaan…
        </>
      ) : null}
      {state === "saved" ? (
        <>
          <Check aria-hidden="true" className="size-3" />
          Opgeslagen.
        </>
      ) : null}
    </p>
  );
}
