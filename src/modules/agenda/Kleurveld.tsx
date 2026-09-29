"use client";

import { Field, FieldDescription, FieldLegend, FieldSet } from "@/ui/field";
import { cn } from "@/lib/utils";
import type { Colour } from "@/domain/types";
import { SOORTNAMEN, type EigenSoort } from "@/services/agenda/AgendaService";
import { PALET } from "@/services/series/SeriesService";

/**
 * De kleur van één agenda-item (`FR-AGE-35`, B-133).
 *
 * Negen knoppen: eerst "Zoals de soort", dan de acht van §5.5. De eerste staat
 * vooraan en is de standaard, want dát is wat §6.2.2 voorschrijft — de kleurkolom
 * van die tabel blijft de regel en dit veld is de uitzondering die je zelf zet.
 *
 * Een eigen kleur is nooit de enige drager (NFR-38): elk item toont zijn titel, de
 * dialoog noemt de soort met zoveel woorden, en elke knop hier draagt zijn naam in
 * het `aria-label`.
 */
export function Kleurveld({
  waarde,
  soort,
  onWijzig,
}: {
  waarde: Colour | null;
  soort: EigenSoort;
  onWijzig: (kleur: Colour | null) => void;
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Kleur</FieldLegend>
      <FieldDescription>
        Standaard de kleur van de soort. Een eigen kleur helpt om bij elkaar horende
        afspraken in één oogopslag terug te vinden.
      </FieldDescription>
      <Field orientation="horizontal" className="flex-wrap gap-2">
        <button
          type="button"
          aria-label={`Zoals de soort: ${SOORTNAMEN[soort]}`}
          aria-pressed={waarde === null}
          onClick={() => onWijzig(null)}
          className={cn(
            "border-border h-8 rounded-full border-2 px-3 text-xs",
            waarde === null && "border-foreground",
          )}
        >
          Zoals de soort
        </button>

        {PALET.map((optie) => (
          <button
            key={optie}
            type="button"
            aria-label={`Kleur ${optie.replace("series-", "")}`}
            aria-pressed={optie === waarde}
            onClick={() => onWijzig(optie)}
            className={cn(
              "size-8 rounded-full border-2",
              optie === waarde ? "border-foreground" : "border-transparent",
            )}
            style={{ backgroundColor: `var(--palette-${optie})` }}
          />
        ))}
      </Field>
    </FieldSet>
  );
}
