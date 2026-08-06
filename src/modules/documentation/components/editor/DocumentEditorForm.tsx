"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SaveStatus } from "@/components/common/SaveStatus";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/useAutosave";
import { DocumentService } from "@/services/DocumentService";
import { SettingsService } from "@/services/SettingsService";
import { toServiceError } from "@/services/ServiceError";
import type { Documentation, Series } from "@/types/documentation";
import { isWorthSaving } from "@/types/documentation";
import type { Group } from "@/types/group";
import type { Student } from "@/types/student";

import { GroupField } from "./GroupField";
import { PhotoGrid } from "./PhotoGrid";
import { QuoteList } from "./QuoteList";
import { SeriesField } from "./SeriesField";
import { StudentPicker } from "./StudentPicker";

interface DocumentEditorFormProps {
  /** Al ingelezen; de beginstand voor het automatisch opslaan. */
  initialDocument: Documentation;
  initialSeriesName: string;
  series: Series[];
  groups: Group[];
  students: Student[];
}

/**
 * De velden van het bewerkscherm (doc 04, scherm 3).
 *
 * Staat los van het inlezen, zodat dit component al bij de eerste render de
 * definitieve documentatie heeft. Anders zou het automatisch opslaan het
 * verschil tussen "nog niets ingelezen" en "de gebruiker heeft iets gewijzigd"
 * niet zien, en elke documentatie die je alleen opent opnieuw wegschrijven.
 *
 * In deze sprint is dit de schrijfmodus. Gespreksmodus komt met de AI-laag:
 * daarin stelt AI de vragen en bouwt AI de documentatie op.
 */
export function DocumentEditorForm({
  initialDocument,
  initialSeriesName,
  series: initialSeries,
  groups,
  students,
}: DocumentEditorFormProps) {
  const [draft, setDraft] = useState<Documentation>(initialDocument);
  const [series, setSeries] = useState(initialSeries);
  const [seriesName, setSeriesName] = useState(initialSeriesName);
  const [photoProgress, setPhotoProgress] = useState<string>();

  // Alleen de leerlingen uit de gekozen groep zijn te koppelen (doc 04).
  const studentsInGroup = useMemo(
    () => (draft.groupId ? students.filter((student) => student.groupId === draft.groupId) : []),
    [students, draft.groupId],
  );

  /**
   * Zet zo nodig eerst de reeks om naar een id: een reeks die je in het veld
   * typt bestaat pas op het moment van opslaan.
   *
   * Geen `useCallback` nodig: `useAutosave` bewaart de callback in een ref en
   * gebruikt dus altijd de meest recente versie, inclusief de laatst getypte
   * reeksnaam.
   */
  async function save(value: Documentation) {
    const resolved = await SettingsService.createSeries(seriesName);
    if (resolved) {
      setSeries((current) =>
        current.some((entry) => entry.id === resolved.id) ? current : [...current, resolved],
      );
    }

    const { saved, doc } = await DocumentService.save({ ...value, seriesId: resolved?.id });
    if (saved) {
      setDraft((current) => ({ ...current, seriesId: doc.seriesId }));
    }
  }

  const { state, saveNow } = useAutosave({
    value: { document: draft, seriesName },
    // Een documentatie zonder tekst én zonder foto's wordt niet bewaard (doc 02).
    enabled: isWorthSaving(draft),
    onSave: async ({ document }) => {
      try {
        await save(document);
      } catch (cause) {
        const failure = toServiceError(cause);
        toast.error(failure.message, { description: failure.nextStep });
        throw failure;
      }
    },
  });

  function update(patch: Partial<Documentation>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  /**
   * De knop Opslaan bevestigt met een melding, `SaveStatus` blijft voor het
   * automatisch opslaan.
   *
   * De reden dat het niet bij `SaveStatus` alleen kan blijven: die staat
   * bovenaan het formulier en de knop staat onderaan, ruim een schermhoogte
   * lager. Wie naar de knop scrolt om te klikken, heeft de statusregel niet in
   * beeld en ziet dus niets. Doc 04 vraagt een kort bericht *in beeld*.
   *
   * Automatisch opslaan krijgt bewust géén melding: dat vuurt na elke seconde
   * stilte tijdens het typen en zou een stroom meldingen opleveren.
   */
  async function handleSaveClick() {
    const confirmed = await saveNow();
    // Bij een mislukte schrijfactie heeft `onSave` al een foutmelding getoond.
    if (confirmed) toast.success("Opgeslagen.");
  }

  /** Foto's gaan buiten het automatisch opslaan om: elke foto is direct een schrijfactie. */
  async function handleAddPhotos(files: File[]) {
    let working = draft;
    try {
      for (const [index, file] of files.entries()) {
        setPhotoProgress(`${index + 1} van ${files.length}`);
        working = await DocumentService.addPhoto(working, file);
        setDraft(working);
      }
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    } finally {
      setPhotoProgress(undefined);
    }
  }

  async function handlePhotoAction(action: Promise<Documentation>) {
    try {
      setDraft(await action);
    } catch (cause) {
      const failure = toServiceError(cause);
      toast.error(failure.message, { description: failure.nextStep });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        {/* Een echte link, geen Button: dit navigeert naar een URL. Base UI's
            Button legt hoe dan ook role="button" op, en dan kondigt een
            schermlezer een knop aan terwijl het een link is. */}
        <Link href="/documentation" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft aria-hidden="true" />
          Overzicht
        </Link>
        <SaveStatus state={state} />
      </div>

      <FieldGroup>
        <SeriesField value={seriesName} onChange={setSeriesName} series={series} />

        <Field>
          <FieldLabel htmlFor="title">Titel</FieldLabel>
          <Input
            id="title"
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Waar ging het over?"
          />
        </Field>

        <GroupField
          value={draft.groupId}
          onChange={(groupId) =>
            // Van groep wisselen laat koppelingen naar de oude groep staan; die
            // horen dan niet meer bij deze documentatie.
            update({ groupId, studentIds: groupId === draft.groupId ? draft.studentIds : [] })
          }
          groups={groups}
        />

        <StudentPicker
          students={studentsInGroup}
          selectedIds={draft.studentIds}
          onChange={(studentIds) => update({ studentIds })}
          hasGroup={Boolean(draft.groupId)}
        />

        <Field>
          <FieldLabel htmlFor="date">Datum</FieldLabel>
          <Input
            id="date"
            type="date"
            value={draft.date}
            onChange={(event) => update({ date: event.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="text">Tekst</FieldLabel>
          {/* Een gewoon tekstveld: geen rich text en geen eigen
              toetsenbordafhandeling, zodat dicteren blijft werken (doc 03). */}
          <Textarea
            id="text"
            value={draft.text}
            onChange={(event) => update({ text: event.target.value })}
            rows={8}
            placeholder="Wat gebeurde er?"
          />
        </Field>

        <QuoteList quotes={draft.quotes} onChange={(quotes) => update({ quotes })} />

        <PhotoGrid
          photoIds={draft.photoIds}
          onAdd={(files) => void handleAddPhotos(files)}
          onRemove={(photoId) => void handlePhotoAction(DocumentService.removePhoto(draft, photoId))}
          onReorder={(photoIds) =>
            void handlePhotoAction(DocumentService.reorderPhotos(draft, photoIds))
          }
          busyLabel={photoProgress}
        />
      </FieldGroup>

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Button onClick={() => void handleSaveClick()} disabled={!isWorthSaving(draft)}>
          Opslaan
        </Button>
        <p className="text-sm text-muted-foreground">
          Opslaan gaat ook automatisch tijdens het typen.
        </p>
      </div>
    </div>
  );
}
