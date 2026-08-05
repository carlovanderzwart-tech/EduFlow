"use client";

import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

import { PhotoThumbnail } from "./PhotoThumbnail";

interface PhotoGridProps {
  photoIds: string[];
  onAdd: (files: File[]) => void;
  onRemove: (photoId: string) => void;
  onReorder: (photoIds: string[]) => void;
  /** Bijvoorbeeld "2 van 5" tijdens het verkleinen. */
  busyLabel?: string;
}

/**
 * Foto's toevoegen, verwijderen en van volgorde wisselen (doc 02).
 *
 * Volgorde wisselen gebeurt met knoppen en niet met slepen. Slepen vraagt een
 * extra bibliotheek en werkt op een telefoon slecht samen met scrollen; knoppen
 * werken op elk apparaat en zijn met het toetsenbord te gebruiken.
 */
export function PhotoGrid({ photoIds, onAdd, onRemove, onReorder, busyLabel }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= photoIds.length) return;
    const next = [...photoIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  return (
    <Field>
      <FieldLabel>Foto&apos;s</FieldLabel>
      <FieldDescription>
        Foto&apos;s blijven op dit apparaat en worden nooit naar AI verstuurd. De volgorde bepaalt
        straks de opmaak.
      </FieldDescription>

      {photoIds.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photoIds.map((photoId, index) => (
            <li key={photoId} className="space-y-1">
              <PhotoThumbnail photoId={photoId} alt={`Foto ${index + 1}`} />
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Foto ${index + 1} naar voren`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Foto ${index + 1} verwijderen`}
                  onClick={() => onRemove(photoId)}
                >
                  <X aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Foto ${index + 1} naar achteren`}
                  disabled={index === photoIds.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Wordt bediend via de knop hieronder. Daarom uit de tabvolgorde en
          verborgen voor hulpsoftware: anders belandt een toetsenbordgebruiker op
          een naamloos bestandsveld. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          if (files.length > 0) onAdd(files);
          // Leegmaken, zodat dezelfde foto opnieuw gekozen kan worden.
          event.target.value = "";
        }}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(busyLabel)}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          Foto&apos;s toevoegen
        </Button>

        {busyLabel ? (
          <p
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Spinner aria-hidden="true" aria-label={undefined} role={undefined} className="size-3.5" />
            Foto {busyLabel} verwerken…
          </p>
        ) : null}
      </div>
    </Field>
  );
}
