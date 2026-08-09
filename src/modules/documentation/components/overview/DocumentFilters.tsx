"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Series } from "@/types/documentation";
import type { Group } from "@/types/group";
import { getStudentFullName, type Student } from "@/types/student";

export interface FilterValues {
  seriesId: string;
  groupId: string;
  studentId: string;
  from: string;
  to: string;
}

interface DocumentFiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  series: Series[];
  groups: Group[];
  students: Student[];
  onReset: () => void;
  isFiltered: boolean;
}

/**
 * Filteren op reeks, groep, leerling en periode (docs/archief/04, scherm 2). Meer niet.
 *
 * In een `details`/`summary` ingeklapt, zodat de lijst op een telefoon in beeld
 * blijft. Dat is de native manier: geen JavaScript, en toetsenbord en
 * schermlezer werken zonder extra werk.
 *
 * Keuzelijsten zijn native selects en de periode twee native datumvelden. Op de
 * telefoon geeft dat het keuzemenu van het apparaat zelf.
 */
export function DocumentFilters({
  values,
  onChange,
  series,
  groups,
  students,
  onReset,
  isFiltered,
}: DocumentFiltersProps) {
  function set<K extends keyof FilterValues>(key: K, value: FilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  // Filteren op leerling doet alleen iets binnen de gekozen groep; buiten die
  // groep zou je leerlingen aanbieden die nooit een treffer geven.
  const selectableStudents = values.groupId
    ? students.filter((student) => student.groupId === values.groupId)
    : students;

  return (
    <details className="rounded-lg border border-border">
      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium">
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        Filters
        {isFiltered ? <span className="text-muted-foreground">(actief)</span> : null}
      </summary>

      <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="filter-series">Reeks</FieldLabel>
          <NativeSelect
            id="filter-series"
            value={values.seriesId}
            onChange={(event) => set("seriesId", event.target.value)}
          >
            <NativeSelectOption value="">Alle reeksen</NativeSelectOption>
            {series.map((entry) => (
              <NativeSelectOption key={entry.id} value={entry.id}>
                {entry.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-group">Groep</FieldLabel>
          <NativeSelect
            id="filter-group"
            value={values.groupId}
            onChange={(event) => onChange({ ...values, groupId: event.target.value, studentId: "" })}
          >
            <NativeSelectOption value="">Alle groepen</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-student">Leerling</FieldLabel>
          <NativeSelect
            id="filter-student"
            value={values.studentId}
            onChange={(event) => set("studentId", event.target.value)}
          >
            <NativeSelectOption value="">Alle leerlingen</NativeSelectOption>
            {selectableStudents.map((student) => (
              <NativeSelectOption key={student.id} value={student.id}>
                {getStudentFullName(student)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-from">Van</FieldLabel>
          <Input
            id="filter-from"
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => set("from", event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-to">Tot en met</FieldLabel>
          <Input
            id="filter-to"
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => set("to", event.target.value)}
          />
        </Field>

        {isFiltered ? (
          <Button variant="outline" size="sm" className="justify-self-start" onClick={onReset}>
            Filters wissen
          </Button>
        ) : null}
      </div>
    </details>
  );
}
