"use client";

import { cn } from "@/lib/utils";
import type { PageSize, Template, TemplateId } from "@/services/render/templates";
import { TEMPLATES } from "@/services/render/templates/registry";

/**
 * Een miniatuur op de verhouding van een A4 liggend. De vakken komen uit het
 * template zelf, dus een miniatuur kan niet afwijken van de echte opmaak.
 */
const THUMBNAIL: PageSize = { width: 100, height: 70.7, margin: 3.4, headerHeight: 8.5 };

function Thumbnail({ template, photoCount }: { template: Template; photoCount: number }) {
  // Het werkelijke aantal foto's, zodat de miniatuur laat zien wat je krijgt en
  // niet een raster dat straks half gevuld is.
  const frame = template.frame(THUMBNAIL, Math.min(photoCount, template.photosPerPage));

  return (
    <svg
      viewBox={`0 0 ${THUMBNAIL.width} ${THUMBNAIL.height}`}
      className="w-full rounded-sm bg-white"
      aria-hidden="true"
    >
      {/* De kop staat op elke pagina, dus ook op de miniatuur. */}
      <rect
        x={THUMBNAIL.margin}
        y={THUMBNAIL.margin}
        width={THUMBNAIL.width / 2}
        height={3}
        className="fill-foreground/70"
      />
      {frame.text ? (
        <rect {...frame.text} rx={1} className="fill-foreground/15" />
      ) : null}
      {frame.photoSlots.map((slot, index) => (
        <rect key={index} {...slot} rx={1} className="fill-primary/35" />
      ))}
    </svg>
  );
}

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  /** Bepaalt hoe de miniaturen hun raster tekenen. */
  photoCount: number;
}

/**
 * De vier miniaturen bovenaan het exportpaneel (doc 04, *Opmaak*). Wisselen kan
 * altijd; de inhoud verandert niet mee.
 */
export function TemplatePicker({ value, onChange, photoCount }: TemplatePickerProps) {
  return (
    <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <legend className="sr-only">Opmaak</legend>

      {TEMPLATES.map((template) => {
        const selected = template.id === value;

        return (
          <label
            key={template.id}
            className={cn(
              "flex cursor-pointer flex-col gap-1.5 rounded-lg border p-2 text-left transition-colors",
              selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
            )}
          >
            <input
              type="radio"
              name="template"
              value={template.id}
              checked={selected}
              onChange={() => onChange(template.id)}
              className="sr-only"
            />
            <Thumbnail template={template} photoCount={photoCount} />
            <span className="text-xs font-medium">{template.name}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
