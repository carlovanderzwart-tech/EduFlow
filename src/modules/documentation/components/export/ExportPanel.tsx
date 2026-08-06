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
      {/*
        `max-h` en niet `h`: het paneel zet voor deze kant zelf `height: auto`
        via een attribuutselector, en die wint van een gewone hoogteklasse. Een
        hoogte meegeven had dus geen effect — het paneel groeide mee met de
        inhoud en schoof met de bovenkant het scherm uit, want het hangt aan de
        onderrand. Een maximumhoogte botst niet met `height: auto` en begrenst
        hem wél.
      */}
      <SheetContent side="bottom" className="max-h-[92dvh] gap-0">
        <SheetHeader className="mx-auto w-full max-w-4xl">
          <SheetTitle>{TITLES[destination]}</SheetTitle>
          <SheetDescription>
            {loading ? "Voorbeeld wordt opgebouwd…" : pageLabel(pages.length)}
          </SheetDescription>
        </SheetHeader>

        {/*
          `min-h-0` is wat het schuiven mogelijk maakt: een flexkind mag zonder
          dat niet kleiner worden dan zijn inhoud, en dan schuift er niets maar
          groeit het paneel alsnog.

          `max-w-4xl` houdt het voorbeeld op een breed scherm leesbaar. Zonder
          die grens wordt een liggende A4 op 1920 px zo hoog dat de knoppen
          erboven wegvallen.
        */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-4">
            <TemplatePicker value={templateId} onChange={setTemplateId} />
            <ExportPreview pages={pages} images={images} loading={loading} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
