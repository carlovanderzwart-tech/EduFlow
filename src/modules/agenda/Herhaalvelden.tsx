"use client";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import type { IsoDate } from "@/lib/dates";
import type { Recurrence, RecurrenceFrequency } from "@/domain/types";
import { FREQUENTIENAMEN } from "@/services/agenda/RecurrenceService";

/**
 * De herhaling in de itemdialoog (§6.2.5, B-123).
 *
 * **Drie regels en twee manieren om te eindigen.** Meer niet: §6.2.5 kiest dat
 * bewust, en een reeks die eindigt is een reeks die te tellen en uit te schrijven is.
 * Er is geen "eindeloos", en dat is geen omissie — zie B-123.
 */
export const HERHAALKEUZES: (RecurrenceFrequency | "geen")[] = [
  "geen",
  "wekelijks",
  "tweewekelijks",
  "maandelijks",
];

/** Waar een reeks standaard op eindigt als je er een aanzet. */
const STANDAARD_AANTAL = 10;

interface HerhaalveldenProps {
  waarde: Recurrence | null;
  /** De begindag; de einddatum kan niet daarvóór liggen. */
  begin: IsoDate;
  onWijzig: (regel: Recurrence | null) => void;
}

export function Herhaalvelden({ waarde, begin, onWijzig }: HerhaalveldenProps) {
  const opAantal = waarde?.count !== null && waarde?.count !== undefined;

  function kiesFrequentie(keuze: string) {
    if (keuze === "geen") return onWijzig(null);

    onWijzig({
      frequency: keuze as RecurrenceFrequency,
      until: null,
      count: STANDAARD_AANTAL,
      excludedDates: waarde?.excludedDates ?? [],
    });
  }

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="herhaal">Herhalen</FieldLabel>
        <NativeSelect
          id="herhaal"
          value={waarde?.frequency ?? "geen"}
          onChange={(gebeurtenis) => kiesFrequentie(gebeurtenis.target.value)}
        >
          {HERHAALKEUZES.map((keuze) => (
            <NativeSelectOption key={keuze} value={keuze}>
              {keuze === "geen" ? "Niet herhalen" : FREQUENTIENAMEN[keuze]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      {waarde ? (
        <>
          <Field>
            <FieldLabel htmlFor="herhaal-einde">Tot</FieldLabel>
            <FieldDescription>Een reeks eindigt op een datum of na een aantal keren.</FieldDescription>
            <NativeSelect
              id="herhaal-einde"
              value={opAantal ? "aantal" : "datum"}
              onChange={(gebeurtenis) =>
                onWijzig(
                  gebeurtenis.target.value === "aantal"
                    ? { ...waarde, count: STANDAARD_AANTAL, until: null }
                    : { ...waarde, count: null, until: begin },
                )
              }
            >
              <NativeSelectOption value="aantal">Na een aantal keren</NativeSelectOption>
              <NativeSelectOption value="datum">Tot en met een datum</NativeSelectOption>
            </NativeSelect>
          </Field>

          {opAantal ? (
            <Field className="w-40">
              <FieldLabel htmlFor="herhaal-aantal">Aantal keren</FieldLabel>
              <Input
                id="herhaal-aantal"
                type="number"
                min={2}
                max={160}
                value={waarde.count ?? STANDAARD_AANTAL}
                onChange={(gebeurtenis) =>
                  onWijzig({ ...waarde, count: Number(gebeurtenis.target.value), until: null })
                }
              />
            </Field>
          ) : (
            <Field className="w-40">
              <FieldLabel htmlFor="herhaal-tot">Tot en met</FieldLabel>
              <Input
                id="herhaal-tot"
                type="date"
                min={begin}
                value={waarde.until ?? begin}
                onChange={(gebeurtenis) =>
                  onWijzig({ ...waarde, until: gebeurtenis.target.value, count: null })
                }
              />
            </Field>
          )}
        </>
      ) : null}
    </div>
  );
}
