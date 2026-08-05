"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import { StudentService } from "@/services/StudentService";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";

import { StudentBatchBar } from "./StudentBatchBar";
import { StudentFilters } from "./StudentFilters";
import { StudentList } from "./StudentList";
import { StudentDraft, StudentSheet } from "./StudentSheet";

/** Een batchbewerking die nog bevestigd moet worden (doc 02). */
type PendingBatch =
  | { kind: "move"; groupId: string }
  | { kind: "deactivate" }
  | { kind: "activate" };

interface StudentsTabProps {
  students: Student[];
  /** Alle groepen, ook gearchiveerde — anders mist een leerling zijn groepsnaam. */
  groups: Group[];
  loading: boolean;
  error: ServiceError | null;
  search: string;
  onSearchChange: (search: string) => void;
  groupId: string;
  onGroupChange: (groupId: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (show: boolean) => void;
  /** Herlaadt leerlingen én groepen; een verplaatsing verandert ook de aantallen. */
  onChanged: () => void;
}

function plural(count: number): string {
  return count === 1 ? "1 leerling" : `${count} leerlingen`;
}

function titleFor(pending: PendingBatch): string {
  switch (pending.kind) {
    case "move":
      return "Leerlingen verplaatsen?";
    case "deactivate":
      return "Op inactief zetten?";
    case "activate":
      return "Op actief zetten?";
  }
}

/** Doc 02: elke batchbewerking noemt het aantal — "23 leerlingen verplaatsen naar groep blauw". */
function describeBatch(pending: PendingBatch, count: number, groupName: string): string {
  switch (pending.kind) {
    case "move":
      return `${plural(count)} verplaatsen naar ${groupName}.`;
    case "deactivate":
      // Eén leerling heeft één naam; het meervoud leest anders.
      return count === 1
        ? "1 leerling op inactief zetten. De naam blijft afgeschermd in bestaande documentaties."
        : `${count} leerlingen op inactief zetten. Hun namen blijven afgeschermd in bestaande documentaties.`;
    case "activate":
      return `${plural(count)} weer op actief zetten.`;
  }
}

/**
 * Het tabblad Leerlingen (doc 04, scherm 7).
 *
 * Alle bewerkingen lopen via `StudentService`; hier staat alleen wat het scherm
 * moet weten om te tonen en te vragen.
 */
export function StudentsTab({
  students,
  groups,
  loading,
  error,
  search,
  onSearchChange,
  groupId,
  onGroupChange,
  showInactive,
  onShowInactiveChange,
  onChanged,
}: StudentsTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [pendingBatch, setPendingBatch] = useState<PendingBatch | null>(null);

  // Gearchiveerde groepen verdwijnen uit keuzelijsten, maar blijven wel namen
  // leveren voor leerlingen die er nog in zitten (besluit B-19).
  const selectableGroups = groups.filter((group) => !group.archived);

  function openSheet(student: Student | null) {
    setEditing(student);
    setSheetOpen(true);
  }

  async function handleSave(draft: StudentDraft) {
    try {
      const values = {
        firstName: draft.firstName.trim(),
        callName: draft.callName.trim() || undefined,
        lastName: draft.lastName.trim() || undefined,
        dateOfBirth: draft.dateOfBirth || undefined,
        groupId: draft.groupId,
        active: draft.active,
      };

      if (editing) {
        await StudentService.update(editing.id, values);
      } else {
        await StudentService.create(values);
      }

      setSheetOpen(false);
      onChanged();
      toast.success(editing ? "Leerling aangepast." : "Leerling toegevoegd.");
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  async function runBatch(pending: PendingBatch) {
    try {
      const count =
        pending.kind === "move"
          ? await StudentService.moveToGroup(selectedIds, pending.groupId)
          : await StudentService.setActive(selectedIds, pending.kind === "activate");

      setSelectedIds([]);
      onChanged();
      toast.success(`${plural(count)} bijgewerkt.`);
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  const pendingGroupName =
    pendingBatch?.kind === "move"
      ? (groups.find((group) => group.id === pendingBatch.groupId)?.name ?? "een andere groep")
      : "";

  const isFiltered = search !== "" || groupId !== "";

  return (
    <div className="space-y-4">
      <StudentFilters
        search={search}
        onSearchChange={onSearchChange}
        groupId={groupId}
        onGroupChange={onGroupChange}
        showInactive={showInactive}
        onShowInactiveChange={onShowInactiveChange}
        groups={selectableGroups}
        onAdd={() => openSheet(null)}
      />

      {selectedIds.length > 0 ? (
        <StudentBatchBar
          count={selectedIds.length}
          groups={selectableGroups}
          onMove={(targetGroupId) => setPendingBatch({ kind: "move", groupId: targetGroupId })}
          onDeactivate={() => setPendingBatch({ kind: "deactivate" })}
          onActivate={() => setPendingBatch({ kind: "activate" })}
          onClear={() => setSelectedIds([])}
        />
      ) : null}

      {error ? <ErrorMessage message={error.message} nextStep={error.nextStep} /> : null}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : students.length > 0 ? (
        <StudentList
          students={students}
          groups={groups}
          selectedIds={selectedIds}
          onSelectedChange={setSelectedIds}
          onEdit={(student) => openSheet(student)}
        />
      ) : isFiltered ? (
        <EmptyState
          icon={Users}
          title="Niets gevonden"
          description="Geen leerling past bij deze zoekopdracht of dit filter."
          action={{
            label: "Zoeken en filter wissen",
            onClick: () => {
              onSearchChange("");
              onGroupChange("");
            },
          }}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Nog geen leerlingen"
          description="Voeg ze toe zodat EduFlow hun namen kan afschermen voordat er tekst naar AI gaat."
          action={{ label: "Leerling toevoegen", onClick: () => openSheet(null) }}
        />
      )}

      {sheetOpen ? (
        <StudentSheet
          key={editing?.id ?? "nieuw"}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          student={editing}
          groups={selectableGroups}
          onSave={(draft) => void handleSave(draft)}
        />
      ) : null}

      <ConfirmDialog
        open={pendingBatch !== null}
        onOpenChange={(open) => {
          if (!open) setPendingBatch(null);
        }}
        title={pendingBatch ? titleFor(pendingBatch) : ""}
        description={
          pendingBatch ? describeBatch(pendingBatch, selectedIds.length, pendingGroupName) : ""
        }
        confirmLabel="Doorvoeren"
        onConfirm={() => {
          if (pendingBatch) void runBatch(pendingBatch);
          setPendingBatch(null);
        }}
      />
    </div>
  );
}
