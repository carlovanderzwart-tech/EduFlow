"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { getStudentFullName, type Student } from "@/types/student";

interface StudentPickerProps {
  /** De leerlingen uit de gekozen groep. Leeg wanneer er nog geen groep is. */
  students: Student[];
  selectedIds: string[];
  onChange: (studentIds: string[]) => void;
  hasGroup: boolean;
}

/**
 * Nul of meer leerlingen uit de gekozen groep aanvinken (besluit B-17).
 *
 * Leeg laten is de normale situatie en kost geen handeling: het merendeel van de
 * documentaties gaat over de hele groep. Vinkjes en geen zoekveld, want een
 * groep is een korte lijst.
 *
 * Wie je koppelt hoeft niet te kloppen met wie er in de tekst wordt genoemd: de
 * afscherming werkt op de tekst, niet op de koppeling (docs/archief/02).
 */
export function StudentPicker({ students, selectedIds, onChange, hasGroup }: StudentPickerProps) {
  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((entry) => entry !== id));
  }

  return (
    <Field>
      <FieldLabel>Leerlingen</FieldLabel>
      <FieldDescription>
        Optioneel. Gaat deze documentatie over een paar specifieke kinderen? Vink ze aan.
      </FieldDescription>

      {!hasGroup ? (
        <FieldDescription>Kies eerst een groep.</FieldDescription>
      ) : students.length === 0 ? (
        <FieldDescription>Deze groep heeft nog geen leerlingen.</FieldDescription>
      ) : (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {students.map((student) => {
            const inputId = `student-${student.id}`;
            return (
              <li key={student.id} className="flex items-center gap-2">
                <Checkbox
                  id={inputId}
                  checked={selectedIds.includes(student.id)}
                  onCheckedChange={(checked) => toggle(student.id, checked === true)}
                />
                <label htmlFor={inputId} className="text-sm">
                  {getStudentFullName(student)}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </Field>
  );
}
