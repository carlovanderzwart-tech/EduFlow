"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Group } from "@/types/group";

interface GroupFieldProps {
  value: string | undefined;
  onChange: (groupId: string | undefined) => void;
  groups: Group[];
}

/**
 * Eén groep, gekozen uit je eigen groepen. De Bible schrijft meerdere groepen per
 * documentatie voor (B-17); dat volgt bij implementatiestap 11.
 *
 * Een native keuzelijst, zodat je op de telefoon het keuzemenu van het apparaat
 * zelf krijgt en er geen eigen toetsenbordafhandeling overheen ligt.
 */
export function GroupField({ value, onChange, groups }: GroupFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="group">Groep</FieldLabel>
      <FieldDescription>Over wie gaat deze documentatie?</FieldDescription>
      <NativeSelect
        id="group"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <NativeSelectOption value="">Kies een groep</NativeSelectOption>
        {groups.map((group) => (
          <NativeSelectOption key={group.id} value={group.id}>
            {group.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {groups.length === 0 ? (
        <FieldDescription>
          Je hebt nog geen groepen. Voeg ze toe bij Instellingen.
        </FieldDescription>
      ) : null}
    </Field>
  );
}
