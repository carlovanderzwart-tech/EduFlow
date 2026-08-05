"use client";

import { useEffect, useState } from "react";

import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentService } from "@/services/DocumentService";
import { GroupService } from "@/services/GroupService";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import { SettingsService } from "@/services/SettingsService";
import { StudentService } from "@/services/StudentService";
import type { Documentation, Series } from "@/types/documentation";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";

import { DocumentEditorForm } from "./editor/DocumentEditorForm";

interface DocumentEditorProps {
  documentId: string;
  /** Waar is een nieuwe documentatie, en hoeft er niets ingelezen te worden. */
  isNew: boolean;
}

interface LoadedState {
  document: Documentation;
  seriesName: string;
  series: Series[];
  groups: Group[];
  students: Student[];
}

/**
 * Leest de documentatie en de bijbehorende keuzelijsten in, en geeft het
 * bewerken daarna over aan `DocumentEditorForm`.
 */
export function DocumentEditor({ documentId, isNew }: DocumentEditorProps) {
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [error, setError] = useState<ServiceError | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [existing, series, groups, students, settings] = await Promise.all([
          isNew ? undefined : DocumentService.get(documentId),
          SettingsService.getAllSeries(),
          GroupService.getActive(),
          StudentService.list(),
          SettingsService.get(),
        ]);

        if (!active) return;

        if (!isNew && !existing) {
          setNotFound(true);
          return;
        }

        const document =
          existing ??
          DocumentService.create({ id: documentId, groupId: settings.defaultGroupId });

        setLoaded({
          document,
          seriesName: series.find((entry) => entry.id === document.seriesId)?.name ?? "",
          series,
          groups,
          students,
        });
      } catch (cause) {
        if (active) setError(toServiceError(cause));
      }
    })();

    return () => {
      active = false;
    };
  }, [documentId, isNew]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <ErrorMessage
          message="Deze documentatie bestaat niet meer."
          nextStep="Ga terug naar het overzicht om te zien wat er nog wel is."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <ErrorMessage message={error.message} nextStep={error.nextStep} />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <DocumentEditorForm
      initialDocument={loaded.document}
      initialSeriesName={loaded.seriesName}
      series={loaded.series}
      groups={loaded.groups}
      students={loaded.students}
    />
  );
}
