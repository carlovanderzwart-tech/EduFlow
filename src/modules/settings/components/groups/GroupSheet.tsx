"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Group } from "@/types/group";

export interface GroupDraft {
  name: string;
  schoolYear: string;
}

interface GroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` voor een nieuwe groep. */
  group: Group | null;
  onSave: (draft: GroupDraft) => void;
}

/**
 * Een groep toevoegen of hernoemen (docs/archief/04, scherm 7).
 *
 * Een groep bevat een naam en een schooljaar (docs/archief/02). Laat je het schooljaar
 * leeg, dan vult `GroupService` het lopende schooljaar in — de service bepaalt
 * dat, niet dit scherm.
 */
export function GroupSheet({ open, onOpenChange, group, onSave }: GroupSheetProps) {
  const [draft, setDraft] = useState<GroupDraft>(() => ({
    name: group?.name ?? "",
    schoolYear: group?.schoolYear ?? "",
  }));
  const [showErrors, setShowErrors] = useState(false);

  const missingName = draft.name.trim() === "";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (missingName) {
      setShowErrors(true);
      return;
    }

    onSave(draft);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{group ? "Groep hernoemen" : "Groep toevoegen"}</SheetTitle>
          <SheetDescription>
            Een groep is de plek waar je leerlingen in zet, bijvoorbeeld &quot;groep geel&quot;.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-5 px-4">
            <Field>
              <FieldLabel htmlFor="group-name">Naam</FieldLabel>
              <Input
                id="group-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                aria-invalid={showErrors && missingName}
                autoComplete="off"
              />
              {showErrors && missingName ? <FieldError>Vul een naam in.</FieldError> : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="group-school-year">Schooljaar</FieldLabel>
              <FieldDescription>
                Laat je dit leeg, dan vult EduFlow het lopende schooljaar in.
              </FieldDescription>
              <Input
                id="group-school-year"
                value={draft.schoolYear}
                onChange={(event) => setDraft({ ...draft, schoolYear: event.target.value })}
                placeholder="2025/2026"
                autoComplete="off"
              />
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
