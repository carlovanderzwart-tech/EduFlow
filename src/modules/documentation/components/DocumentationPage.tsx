"use client";

import { NotebookPen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SearchField } from "@/components/common/SearchField";
import { StorageWarning } from "@/components/common/StorageWarning";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentService } from "@/services/DocumentService";
import { GroupService } from "@/services/GroupService";
import { toServiceError } from "@/services/ServiceError";
import { SettingsService } from "@/services/SettingsService";
import { StudentService } from "@/services/StudentService";
import type { Documentation, Series } from "@/types/documentation";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";
import { getCurrentSchoolYearRange } from "@/utils/date";
import { createId } from "@/utils/id";

import { useDocumentations } from "../hooks/useDocumentations";
import { DocumentFilters, type FilterValues } from "./overview/DocumentFilters";
import { DocumentList } from "./overview/DocumentList";
import { SeriesGroupList } from "./overview/SeriesGroupList";

/** Het lopende schooljaar is de standaardperiode (docs/archief/02). */
function initialFilters(): FilterValues {
  const { from, to } = getCurrentSchoolYearRange();
  return { seriesId: "", groupId: "", studentId: "", from, to };
}

/** docs/archief/04 eist dat een bevestiging zegt wát er verdwijnt, foto's inbegrepen. */
function describeDeletion(doc: Documentation): string {
  const title = doc.title.trim() || "Zonder titel";
  const photoCount = doc.photoIds.length;

  const photos =
    photoCount === 0
      ? ""
      : photoCount === 1
        ? ", samen met de foto die erbij hoort"
        : `, samen met de ${photoCount} foto's die erbij horen`;

  return `"${title}" verdwijnt${photos}. Dit kan niet ongedaan worden gemaakt.`;
}

export function DocumentationPage() {
  const router = useRouter();
  const defaults = useMemo(() => initialFilters(), []);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>(defaults);
  const [series, setSeries] = useState<Series[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Documentation | null>(null);

  const { documents, loading, error, reload } = useDocumentations({
    search,
    seriesId: filters.seriesId || undefined,
    groupId: filters.groupId || undefined,
    studentId: filters.studentId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  // Keuzelijsten voor de filters. Eén laadpad; verversen gaat via de teller.
  const [sideDataVersion, setSideDataVersion] = useState(0);
  const reloadSideData = useCallback(() => setSideDataVersion((count) => count + 1), []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const [allSeries, allGroups, allStudents] = await Promise.all([
        SettingsService.getAllSeries(),
        GroupService.getActive(),
        StudentService.list(),
      ]);
      if (!active) return;
      setSeries(allSeries);
      setGroups(allGroups);
      setStudents(allStudents);
    })();

    return () => {
      active = false;
    };
  }, [sideDataVersion]);

  const isFiltered =
    filters.seriesId !== "" ||
    filters.groupId !== "" ||
    filters.studentId !== "" ||
    filters.from !== defaults.from ||
    filters.to !== defaults.to;

  function startNew() {
    // Het id wordt hier gemaakt, zodat de editor een vaste URL heeft en een
    // verversing na het eerste opslaan gewoon werkt.
    router.push(`/documentation/${createId()}?nieuw=1`);
  }

  async function handleDuplicate(id: string) {
    try {
      const copy = await DocumentService.duplicate(id);
      reload();
      reloadSideData();
      toast.success("Documentatie gedupliceerd.", {
        action: { label: "Openen", onClick: () => router.push(`/documentation/${copy.id}`) },
      });
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  async function handleDelete(doc: Documentation) {
    try {
      await DocumentService.remove(doc.id);
      reload();
      toast.success("Documentatie verwijderd.");
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  const hasAnyDocuments = documents.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex gap-2">
        <SearchField
          value={search}
          onValueChange={setSearch}
          label="Zoek in documentaties"
          placeholder="Zoek in titel, tekst en citaten"
          className="flex-1"
        />
        {/* Op een smal scherm alleen het plusicoon; het label blijft via
            aria-label beschikbaar voor schermlezers. */}
        <Button onClick={startNew} aria-label="Nieuwe documentatie">
          <Plus aria-hidden="true" />
          <span className="hidden sm:inline">Nieuwe documentatie</span>
        </Button>
      </div>

      <StorageWarning />

      <DocumentFilters
        values={filters}
        onChange={setFilters}
        series={series}
        groups={groups}
        students={students}
        onReset={() => setFilters(defaults)}
        isFiltered={isFiltered}
      />

      {error ? <ErrorMessage message={error.message} nextStep={error.nextStep} /> : null}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : hasAnyDocuments ? (
        <Tabs defaultValue="alles">
          <TabsList>
            <TabsTrigger value="alles">Alles</TabsTrigger>
            <TabsTrigger value="reeks">Per reeks</TabsTrigger>
          </TabsList>
          <TabsContent value="alles" className="pt-3">
            <DocumentList
              documents={documents}
              series={series}
              groups={groups}
              onDuplicate={handleDuplicate}
              onDelete={setPendingDelete}
            />
          </TabsContent>
          <TabsContent value="reeks" className="pt-3">
            <SeriesGroupList
              documents={documents}
              series={series}
              groups={groups}
              onDuplicate={handleDuplicate}
              onDelete={setPendingDelete}
            />
          </TabsContent>
        </Tabs>
      ) : search || isFiltered ? (
        <EmptyState
          icon={NotebookPen}
          title="Niets gevonden"
          description="Geen documentatie past bij deze zoekopdracht of filters."
          action={{
            label: "Zoeken en filters wissen",
            onClick: () => {
              setSearch("");
              setFilters(defaults);
            },
          }}
        />
      ) : (
        <EmptyState
          icon={NotebookPen}
          title="Nog geen documentaties"
          description="Hier komen je documentaties te staan. Begin met je eerste."
          action={{ label: "Nieuwe documentatie", onClick: startNew }}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Documentatie verwijderen?"
        description={pendingDelete ? describeDeletion(pendingDelete) : ""}
        confirmLabel="Verwijderen"
        destructive
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
