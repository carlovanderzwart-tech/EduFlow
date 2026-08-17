"use client";

import { useState } from "react";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { kanMelden } from "@/lib/melder";
import { EERLIJKE_UITLEG, type Toestemming } from "@/services/agenda/NotificationService";
import { diensten } from "@/services/diensten";

/**
 * Meldingen aanzetten (§6.2.9, `FR-AGE-25`, `FR-AGE-28`, B-108).
 *
 * **De uitleg is onderdeel van de functie, niet een voetnoot erbij.** Dat is de derde
 * kuil die de werkopdracht noemt: staat er alleen "Meldingen aan", dan denkt de
 * gebruiker dat hij een herinnering krijgt bij het oudergesprek. Dat krijgt hij niet.
 * Een gemiste herinnering waarvan je dacht dat hij zou komen is erger dan een
 * herinnering die je nooit verwachtte.
 *
 * **Er wordt niet uit zichzelf gevraagd** (`FR-AGE-28`). De browservraag komt pas na
 * een klik op de knop hieronder, en dat is geen omweg: bij het eerste bezoek vragen is
 * de snelste manier om een permanente weigering te krijgen, en die is op iOS lastig
 * terug te draaien.
 */
export function Meldingen({ toestemming }: { toestemming: Toestemming }) {
  const [stand, setStand] = useState<Toestemming>(toestemming);
  const beschikbaar = kanMelden();

  async function vraag() {
    const { notifications } = await diensten();
    setStand(await notifications.vraagToestemming());
  }

  return (
    <Field>
      <FieldLabel>Meldingen</FieldLabel>
      <FieldDescription>{EERLIJKE_UITLEG}</FieldDescription>

      {!beschikbaar ? (
        <p className="text-muted-foreground text-sm">
          Deze browser kan geen meldingen tonen. De agenda werkt gewoon; alleen de melding
          blijft weg.
        </p>
      ) : stand === "granted" ? (
        <p className="text-sm">
          Meldingen staan aan. Ze komen terwijl EduFlow open staat, ook op een achtergrondtabblad.
        </p>
      ) : stand === "denied" ? (
        <p className="text-muted-foreground text-sm">
          Je hebt meldingen geweigerd. Dat is terug te draaien via het slotje in de adresbalk van
          je browser, bij de instellingen voor deze site.
        </p>
      ) : (
        <div>
          <Button variant="outline" onClick={() => void vraag()}>
            Meldingen aanzetten
          </Button>
          <FieldDescription className="pt-2">
            Je browser vraagt hierna om toestemming. EduFlow vraagt er nooit uit zichzelf om.
          </FieldDescription>
        </div>
      )}
    </Field>
  );
}
