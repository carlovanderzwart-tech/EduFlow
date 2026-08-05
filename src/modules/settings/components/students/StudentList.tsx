"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";

import { StudentRow } from "./StudentRow";

interface StudentListProps {
  students: Student[];
  groups: Group[];
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  onEdit: (student: Student) => void;
}

/** De lijst met leerlingen, met bovenaan een vakje om alles te selecteren. */
export function StudentList({
  students,
  groups,
  selectedIds,
  onSelectedChange,
  onEdit,
}: StudentListProps) {
  const groupNames = new Map(groups.map((group) => [group.id, group.name]));
  const allSelected = students.length > 0 && selectedIds.length === students.length;

  function toggle(id: string, selected: boolean) {
    onSelectedChange(
      selected ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id),
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        {/* Het vakje zet zijn `id` op het verborgen invoerveld, niet op de knop
            zelf. Die knop krijgt daarom een eigen naam. */}
        <Checkbox
          id="select-all-students"
          aria-label="Alles selecteren"
          checked={allSelected}
          indeterminate={selectedIds.length > 0 && !allSelected}
          onCheckedChange={(checked) =>
            onSelectedChange(checked ? students.map((student) => student.id) : [])
          }
        />
        <Label htmlFor="select-all-students" className="text-muted-foreground">
          Alles selecteren
        </Label>
      </div>

      {students.map((student) => (
        <StudentRow
          key={student.id}
          student={student}
          groupName={student.groupId ? groupNames.get(student.groupId) : undefined}
          selected={selectedIds.includes(student.id)}
          onSelectedChange={(selected) => toggle(student.id, selected)}
          onEdit={() => onEdit(student)}
        />
      ))}
    </div>
  );
}
