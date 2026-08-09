"use client";

import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupService } from "@/services/GroupService";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import type { Group } from "@/types/group";

import type { GroupWithCount } from "../../hooks/useGroups";
import { GroupDraft, GroupSheet } from "./GroupSheet";
import { GroupRow } from "./GroupRow";

/** Een handeling die nog bevestigd moet worden. Beide zeggen wat er gebeurt (docs/archief/04). */
type PendingAction = { kind: "archive" | "remove"; entry: GroupWithCount };

interface GroupsTabProps {
  groups: GroupWithCount[];
  loading: boolean;
  error: ServiceError | null;
  /** Herlaadt groepen én leerlingen; archiveren zet leerlingen op inactief. */
  onChanged: () => void;
}

function plural(count: number): string {
  return count === 1 ? "1 leerling" : `${count} leerlingen`;
}

/**
 * docs/archief/04 eist dat een bevestiging zegt wát er gebeurt. Bij archiveren is de
 * bijzin over de afscherming geen franje: het is de reden dat archiveren geen
 * verwijderen is.
 */
function describe({ kind, entry }: PendingAction): string {
  const { name } = entry.group;
  const count = entry.studentCount;

  if (kind === "archive") {
    if (count === 0) return `${name} wordt gearchiveerd. Er zitten geen leerlingen in.`;
    if (count === 1) {
      return `${name} wordt gearchiveerd en de leerling erin gaat op inactief. Die naam blijft afgeschermd in bestaande documentaties.`;
    }
    return `${name} wordt gearchiveerd en de ${count} leerlingen erin gaan op inactief. Hun namen blijven afgeschermd in bestaande documentaties.`;
  }

  if (count === 0) {
    return `${name} verdwijnt uit de lijst. Documentaties met deze groep blijven bestaan en raken hun groep kwijt.`;
  }

  return `${name} verdwijnt uit de lijst. De ${plural(count)} en de documentaties blijven bestaan en raken hun groep kwijt.`;
}

/**
 * Het tabblad Groepen (docs/archief/04, scherm 7): toevoegen, hernoemen, opruimen en
 * archiveren. Alle bewerkingen lopen via `GroupService`.
 */
export function GroupsTab({ groups, loading, error, onChanged }: GroupsTabProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  function openSheet(group: Group | null) {
    setEditing(group);
    setSheetOpen(true);
  }

  async function handleSave(draft: GroupDraft) {
    try {
      if (editing) {
        await GroupService.update(editing.id, {
          name: draft.name.trim(),
          schoolYear: draft.schoolYear.trim() || editing.schoolYear,
        });
      } else {
        await GroupService.create(draft.name, draft.schoolYear);
      }

      setSheetOpen(false);
      onChanged();
      toast.success(editing ? "Groep hernoemd." : "Groep toegevoegd.");
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  async function run(action: PendingAction) {
    try {
      if (action.kind === "archive") {
        const { studentsDeactivated } = await GroupService.archive(action.entry.group.id);
        toast.success(
          studentsDeactivated === 0
            ? "Groep gearchiveerd."
            : `Groep gearchiveerd, ${plural(studentsDeactivated)} op inactief.`,
        );
      } else {
        await GroupService.remove(action.entry.group.id);
        toast.success("Groep opgeruimd.");
      }

      onChanged();
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  async function handleUnarchive(group: Group) {
    try {
      await GroupService.unarchive(group.id);
      onChanged();
      // De leerlingen blijven inactief; dat is een keuze, dus zeg het erbij.
      toast.success("Groep teruggehaald. De leerlingen blijven inactief.");
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openSheet(null)} aria-label="Groep toevoegen">
          <Plus aria-hidden="true" />
          <span className="hidden sm:inline">Groep toevoegen</span>
        </Button>
      </div>

      {error ? <ErrorMessage message={error.message} nextStep={error.nextStep} /> : null}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-2">
          {groups.map((entry) => (
            <GroupRow
              key={entry.group.id}
              group={entry.group}
              studentCount={entry.studentCount}
              onRename={() => openSheet(entry.group)}
              onArchive={() => setPending({ kind: "archive", entry })}
              onUnarchive={() => void handleUnarchive(entry.group)}
              onRemove={() => setPending({ kind: "remove", entry })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Nog geen groepen"
          description="Maak een groep aan, dan kun je er leerlingen in zetten."
          action={{ label: "Groep toevoegen", onClick: () => openSheet(null) }}
        />
      )}

      {sheetOpen ? (
        <GroupSheet
          key={editing?.id ?? "nieuw"}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          group={editing}
          onSave={(draft) => void handleSave(draft)}
        />
      ) : null}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={pending?.kind === "remove" ? "Groep opruimen?" : "Groep archiveren?"}
        description={pending ? describe(pending) : ""}
        confirmLabel={pending?.kind === "remove" ? "Opruimen" : "Archiveren"}
        destructive={pending?.kind === "remove"}
        onConfirm={() => {
          if (pending) void run(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
