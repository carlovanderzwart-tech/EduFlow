"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";
import { formatAge } from "@/utils/age";

/** Wat er in het paneel staat. Alles tekst, zodat lege velden leeg blijven. */
export interface StudentDraft {
  firstName: string;
  callName: string;
  lastName: string;
  dateOfBirth: string;
  groupId: string;
  active: boolean;
}

interface StudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` voor een nieuwe leerling. */
  student: Student | null;
  /** Alleen niet-gearchiveerde groepen; gearchiveerde horen niet in keuzelijsten. */
  groups: Group[];
  onSave: (draft: StudentDraft) => void;
}

function toDraft(student: Student | null): StudentDraft {
  return {
    firstName: student?.firstName ?? "",
    callName: student?.callName ?? "",
    lastName: student?.lastName ?? "",
    dateOfBirth: student?.dateOfBirth ?? "",
    groupId: student?.groupId ?? "",
    active: student?.active ?? true,
  };
}

/**
 * Een leerling toevoegen of aanpassen (docs/archief/04, scherm 7). Schuift over het
 * scherm, met voornaam, roepnaam, achternaam, geboortedatum, groep, en actief
 * of inactief.
 *
 * **Voornaam en groep zijn verplicht, de rest mag leeg** (docs/archief/02): een register
 * met gaten is bruikbaarder dan een register dat je pas mag opslaan als je
 * alles weet.
 *
 * De aanroeper geeft dit paneel een `key` mee, zodat het bij een andere
 * leerling opnieuw begint zonder dat er een effect aan te pas komt.
 */
export function StudentSheet({
  open,
  onOpenChange,
  student,
  groups,
  onSave,
}: StudentSheetProps) {
  const [draft, setDraft] = useState<StudentDraft>(() => toDraft(student));
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof StudentDraft>(key: K, value: StudentDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const missingFirstName = draft.firstName.trim() === "";
  const missingGroup = draft.groupId === "";
  const age = formatAge(draft.dateOfBirth || undefined);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (missingFirstName || missingGroup) {
      setShowErrors(true);
      return;
    }

    onSave(draft);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{student ? "Leerling aanpassen" : "Leerling toevoegen"}</SheetTitle>
          <SheetDescription>
            Voornaam en groep zijn verplicht. De rest mag je later invullen.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-5 px-4">
            <Field>
              <FieldLabel htmlFor="student-first-name">Voornaam</FieldLabel>
              <Input
                id="student-first-name"
                value={draft.firstName}
                onChange={(event) => set("firstName", event.target.value)}
                aria-invalid={showErrors && missingFirstName}
                autoComplete="off"
              />
              {showErrors && missingFirstName ? (
                <FieldError>Vul een voornaam in.</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="student-call-name">Roepnaam</FieldLabel>
              <FieldDescription>
                Alleen invullen als je een andere naam gebruikt dan de voornaam. Zo wordt ook die
                naam afgeschermd voordat er tekst naar AI gaat.
              </FieldDescription>
              <Input
                id="student-call-name"
                value={draft.callName}
                onChange={(event) => set("callName", event.target.value)}
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="student-last-name">Achternaam</FieldLabel>
              <Input
                id="student-last-name"
                value={draft.lastName}
                onChange={(event) => set("lastName", event.target.value)}
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="student-date-of-birth">Geboortedatum</FieldLabel>
              <Input
                id="student-date-of-birth"
                type="date"
                value={draft.dateOfBirth}
                onChange={(event) => set("dateOfBirth", event.target.value)}
              />
              {/* Staat er geen geboortedatum, dan staat hier niets — geen
                  streepje en geen schatting (docs/archief/02, *Leeftijd*). */}
              {age ? <FieldDescription>{age}</FieldDescription> : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="student-group">Groep</FieldLabel>
              <NativeSelect
                id="student-group"
                className="w-full"
                value={draft.groupId}
                onChange={(event) => set("groupId", event.target.value)}
                aria-invalid={showErrors && missingGroup}
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
                  Je hebt nog geen groepen. Maak er eerst een aan bij Groepen.
                </FieldDescription>
              ) : null}
              {showErrors && missingGroup ? <FieldError>Kies een groep.</FieldError> : null}
            </Field>

            <Field orientation="horizontal">
              {/* Zie `StudentFilters`: de `id` belandt op het verborgen
                  invoerveld, dus de knop krijgt een eigen naam. */}
              <Switch
                id="student-active"
                aria-label="Actief"
                checked={draft.active}
                onCheckedChange={(checked) => set("active", checked)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="student-active">Actief</Label>
                {/* Geen verwijderknop, en in gewone taal waarom (docs/archief/04). */}
                <FieldDescription>
                  Een leerling die van school gaat zet je op inactief. De naam blijft dan
                  afgeschermd in documentaties van eerder dit jaar.
                </FieldDescription>
              </div>
            </Field>
          </div>

          <SheetFooter>
            <Button type="submit">Opslaan</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
