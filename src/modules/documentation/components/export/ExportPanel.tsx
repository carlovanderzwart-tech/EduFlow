"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TemplateId } from "@/services/render/templates";
import { DEFAULT_TEMPLATE_ID } from "@/services/render/templates/registry";
import type { Documentation } from "@/types/documentation";

import { useRenderedPages } from "../../hooks/useRenderedPages";
import { ExportPreview } from "./ExportPreview";
import { TemplatePicker } from "./TemplatePicker";

/** Waar de gebruiker naartoe wil. Bepaalt in deze stap alleen de titel. */
export type ExportDestination = "pdf" | "afbeelding";

const TITLES: Record<ExportDestination, string> = {
  pdf: "Print-PDF",
  afbeelding: "Deelbare afbeelding",
};

interface ExportPanelProps {
  destination: ExportDestination;
  onOpenChange: (open: boolean) => void;
  document: Documentation;
  seriesName?: string;
  groupName?: string;
  studentNames: string[];
}

function pageLabel(count: number): string {
  return count === 1 ? "1 pagina" : `${count} pagina's`;
}

/**
 * Het exportpaneel (besluit B-06): vier miniaturen, een voorbeeld en het aantal
 * pagina's. Het schuift over het schrijfscherm heen en is geen aparte route
 * (doc 03, *Layout*).
 *
 * Het gekozen template blijft bewust in de state van dit component. Het bij
 * elke klik wegschrijven zou `updatedAt` verzetten, en dan verspringt de
 * documentatie in het overzicht — dat sorteert op laatst gewijzigd. De keuze
 * wordt vastgelegd zodra er echt geëxporteerd wordt.
 */
export function ExportPanel({
  destination,
  onOpenChange,
  document: doc,
  seriesName,
  groupName,
  studentNames,
}: ExportPanelProps) {
  const [templateId, setTemplateId] = useState<TemplateId>(
    () => (doc.templateId as TemplateId | undefined) ?? DEFAULT_TEMPLATE_ID,
  );

  const { pages, images, loading } = useRenderedPages({
    document: doc,
    seriesName,
    groupName,
    studentNames,
    templateId,
    enabled: true,
  });

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] gap-0">
        <SheetHeader>
          <SheetTitle>{TITLES[destination]}</SheetTitle>
          <SheetDescription>
            {loading ? "Voorbeeld wordt opgebouwd…" : pageLabel(pages.length)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <TemplatePicker value={templateId} onChange={setTemplateId} />
          <ExportPreview pages={pages} images={images} loading={loading} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
