"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { FieldDescription } from "@/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { type IsoDate } from "@/lib/dates";
import { tijdstipKort } from "@/lib/weergave";
import type { CalendarEvent, SchoolYear } from "@/domain/types";
import { icsBestandsnaam, naarIcs } from "@/services/agenda/IcsService";
import type { Vakantie } from "@/services/agenda/HolidayService";
import { diensten } from "@/services/diensten";

/**
 * De ICS-export (§6.2.7, `FR-AGE-20`, `FR-AGE-27`).
 *
 * **Dit is de route naar echte herinneringen**, en dat staat er ook. EduFlow bezit het
 * schooljaar; de agenda-app op je telefoon doet het klokwerk (§6.2.9). Een halve
 * belofte over meldingen zou schadelijker zijn dan deze omweg.
 *
 * **De teller uit `FR-AGE-27`** zegt hoeveel items er zijn gewijzigd sinds je voor het
 * laatst exporteerde. Dat moment staat in `eduflow.lastIcsExportAt` (B-124), en de
 * stabiele `UID` uit `FR-AGE-20` zorgt dat een tweede import geen dubbelen maakt.
 */
interface ExportDialogProps {
  schooljaar: SchoolYear;
  items: readonly CalendarEvent[];
  vakanties: readonly Vakantie[];
  van: IsoDate;
  tot: IsoDate;
  /** Het moment van de vorige export, of `null` (B-124). */
  laatste: string | null;
  /** Hoeveel items sindsdien zijn gewijzigd (`FR-AGE-27`). */
  gewijzigd: number;
  onOpenChange: (open: boolean) => void;
  onGeexporteerd: () => void;
}

export function ExportDialog({
  schooljaar,
  items,
  vakanties,
  van,
  tot,
  laatste,
  gewijzigd,
  onOpenChange,
  onGeexporteerd,
}: ExportDialogProps) {
  const [fout, setFout] = useState<string | null>(null);
  const [klaar, setKlaar] = useState(false);

  async function exporteer() {
    setFout(null);
    const { settings } = await diensten();

    try {
      const ics = naarIcs({ items, vakanties, van, tot, gemaaktOp: new Date().toISOString() });
      const bestand = new File([ics], icsBestandsnaam(schooljaar.name), { type: "text/calendar" });

      const url = URL.createObjectURL(bestand);
      const schakel = document.createElement("a");
      schakel.href = url;
      schakel.download = bestand.name;
      schakel.click();
      URL.revokeObjectURL(url);

      settings.zetVoorkeur("lastIcsExportAt", new Date().toISOString());
      setKlaar(true);
      onGeexporteerd();
    } catch (oorzaak) {
      const reden = oorzaak instanceof Error ? oorzaak.message : "onbekend";
      setFout(`De export is niet gelukt (${reden}).`);
    }
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-(--size-panel) gap-0 overflow-y-auto sm:max-w-(--size-panel)">
        <SheetHeader>
          <SheetTitle>Agenda exporteren</SheetTitle>
          <SheetDescription>Schooljaar {schooljaar.name}, met de vakanties erbij.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <p className="text-sm">
            Importeer dit bestand in de agenda-app van je telefoon of laptop. Die neemt de
            meldingen over — daar is hij beter in dan een webapp ooit wordt.
          </p>

          <FieldDescription>
            Elk item houdt dezelfde sleutel bij elke export, dus een tweede import maakt geen
            dubbelen.
          </FieldDescription>

          {laatste ? (
            <p className="text-muted-foreground text-sm">
              Laatst geëxporteerd op {tijdstipKort(laatste)}.
              {gewijzigd === 0
                ? " Er is sindsdien niets gewijzigd."
                : ` Sindsdien ${gewijzigd} ${gewijzigd === 1 ? "item" : "items"} gewijzigd.`}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Je hebt nog niet eerder geëxporteerd.</p>
          )}

          {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}
          {klaar ? <p className="text-success text-sm">Het bestand staat in je map Downloads.</p> : null}

          <div className="flex gap-2">
            <Button onClick={() => void exporteer()}>Exporteer agenda</Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Sluiten
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
