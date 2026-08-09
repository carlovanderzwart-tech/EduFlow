"use client";

import { Plus } from "lucide-react";

import { SearchField } from "@/components/common/SearchField";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import type { Group } from "@/types/group";

interface StudentFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  groupId: string;
  onGroupChange: (groupId: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (show: boolean) => void;
  /** Alleen niet-gearchiveerde groepen; die verdwijnen uit keuzelijsten. */
  groups: Group[];
  onAdd: () => void;
}

/**
 * Bovenaan het tabblad Leerlingen (docs/archief/04, scherm 7): zoeken op naam, filteren
 * op groep, en een knop om een leerling toe te voegen.
 *
 * De schakelaar "Toon inactieve leerlingen" staat hier ook: inactieve
 * leerlingen zijn er wel, maar staan standaard niet in de lijst.
 */
export function StudentFilters({
  search,
  onSearchChange,
  groupId,
  onGroupChange,
  showInactive,
  onShowInactiveChange,
  groups,
  onAdd,
}: StudentFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <SearchField
          value={search}
          onValueChange={onSearchChange}
          label="Zoek een leerling op naam"
          placeholder="Zoek op naam"
          className="flex-1"
        />
        {/* Op een smal scherm alleen het plusicoon; het label blijft via
            aria-label beschikbaar voor schermlezers. */}
        <Button onClick={onAdd} aria-label="Leerling toevoegen">
          <Plus aria-hidden="true" />
          <span className="hidden sm:inline">Leerling toevoegen</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field className="w-auto">
          <FieldLabel htmlFor="student-filter-group">Groep</FieldLabel>
          <NativeSelect
            id="student-filter-group"
            value={groupId}
            onChange={(event) => onGroupChange(event.target.value)}
          >
            <NativeSelectOption value="">Alle groepen</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <div className="flex items-center gap-2">
          {/* De schakelaar zet zijn `id` op het verborgen invoerveld, niet op
              de knop zelf. Die knop krijgt daarom een eigen naam; het zichtbare
              label blijft staan om op te klikken. */}
          <Switch
            id="show-inactive"
            aria-label="Toon inactieve leerlingen"
            checked={showInactive}
            onCheckedChange={onShowInactiveChange}
          />
          <Label htmlFor="show-inactive">Toon inactieve leerlingen</Label>
        </div>
      </div>
    </div>
  );
}
