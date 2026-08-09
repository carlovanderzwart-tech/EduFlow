"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Series } from "@/types/documentation";

interface SeriesFieldProps {
  /** De naam van de reeks; leeg wanneer de documentatie er niet bij hoort. */
  value: string;
  onChange: (value: string) => void;
  series: Series[];
}

/**
 * De reeks: kiezen uit bestaande reeksen of een nieuwe aanmaken (docs/archief/04).
 *
 * Een gewoon tekstveld met een `datalist`, geen keuzelijst met eigen
 * toetsenbordafhandeling. Dat is wat docs/archief/03 vraagt onder *Invoervelden blijven
 * saai*: vrije invoer blijft mogelijk — een nieuwe reeks aanmaken is hetzelfde
 * handelingspatroon als een bestaande kiezen — en dicteren blijft werken.
 */
export function SeriesField({ value, onChange, series }: SeriesFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="series">Reeks</FieldLabel>
      <FieldDescription>
        Optioneel. Hoort deze documentatie bij een doorlopend project? Kies een bestaande reeks of
        typ een nieuwe naam.
      </FieldDescription>
      <Input
        id="series"
        list="series-options"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Bijvoorbeeld: Kunstwerk Dok"
        autoComplete="off"
      />
      <datalist id="series-options">
        {series.map((entry) => (
          <option key={entry.id} value={entry.name} />
        ))}
      </datalist>
    </Field>
  );
}
