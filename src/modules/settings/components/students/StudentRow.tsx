"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { getStudentFullName, type Student } from "@/types/student";
import { formatAge } from "@/utils/age";

interface StudentRowProps {
  student: Student;
  /** Leeg wanneer de groep is opgeruimd; de leerling blijft dan bestaan (docs/archief/02). */
  groupName?: string;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onEdit: () => void;
}

/**
 * Eén regel in de lijst (docs/archief/04, scherm 7): selectievakje, voornaam en
 * achternaam, de groep, en de leeftijd.
 *
 * De leeftijd komt uit de geboortedatum. Is die er niet, dan staat er niets —
 * geen streepje en geen schatting (docs/archief/02, *Leeftijd*).
 *
 * Inactieve leerlingen zijn zichtbaar grijs. De naam is een knop die over de
 * hele regel uitrekt zodat de hele regel een raakvlak is; het selectievakje
 * ligt daar met `z-10` bovenop.
 */
export function StudentRow({
  student,
  groupName,
  selected,
  onSelectedChange,
  onEdit,
}: StudentRowProps) {
  const name = getStudentFullName(student);
  const age = formatAge(student.dateOfBirth);
  const meta = [groupName, age].filter(Boolean);

  return (
    <Item variant="outline" className={cn("relative", !student.active && "opacity-60")}>
      <Checkbox
        checked={selected}
        onCheckedChange={onSelectedChange}
        aria-label={`${name} selecteren`}
        className="relative z-10"
      />

      <ItemContent>
        <ItemTitle>
          <button
            type="button"
            onClick={onEdit}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {name}
          </button>
        </ItemTitle>
        {meta.length > 0 ? <ItemDescription>{meta.join(" · ")}</ItemDescription> : null}
      </ItemContent>

      {!student.active ? (
        <ItemActions className="relative z-10">
          <Badge variant="secondary">Inactief</Badge>
        </ItemActions>
      ) : null}
    </Item>
  );
}
