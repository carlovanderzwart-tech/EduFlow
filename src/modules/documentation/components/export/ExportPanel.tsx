"use client";

import { Copy, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ExportService, toFileName } from "@/services/ExportService";
import { PrivacyService, type TextMasker } from "@/services/PrivacyService";
import type { TemplateId } from "@/services/render/templates";
import { DEFAULT_TEMPLATE_ID } from "@/services/render/templates/registry";
import type { RenderInput, RenderStudent } from "@/services/RenderService";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import type { Documentation } from "@/types/documentation";

import { useRenderedPages } from "../../hooks/useRenderedPages";
import { ExportPreview } from "./ExportPreview";
import { PhotoConsentDialog } from "./PhotoConsentDialog";
import { TemplatePicker } from "./TemplatePicker";

/** Waar de gebruiker naartoe wil (doc 04, *Exporteren*). */
export type ExportDestination = "pdf" | "afbeelding";

/** Wat er na een geslaagde export op de documentatie wordt vastgelegd. */
export interface ExportedPatch {
  templateId: TemplateId;
  exportedAt: string;
  photoConsentConfirmedAt?: string;
}

type Action = "pdf" | "download" | "share" | "copy";

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
  /** De gekoppelde leerlingen; de kop toont hun naam en leeftijd. */
  students: RenderStudent[];
  /** Alleen aangeroepen na een geslaagde export. */
  onExported: (patch: ExportedPatch) => void;
}

function pageLabel(count: number): string {
  return count === 1 ? "1 pagina" : `${count} pagina's`;
}

/**
 * Wat het apparaat kan, uitgelezen zonder effect en zonder mismatch met de
 * server. Op de server is het antwoord altijd "nee": `navigator` bestaat daar
 * niet. React leest daarna op de client opnieuw.
 *
 * Een effect met `setState` zou hier ook werken, maar React 19 wijst dat
 * terecht af: het levert een extra render op voor iets wat nooit verandert.
 */
const nooitWijzigen = () => () => {};

function readCanShare(): boolean {
  return ExportService.canShare([new File([], "voorbeeld.jpg", { type: "image/jpeg" })]);
}

function readCanCopy(): boolean {
  return ExportService.canCopyImage();
}

/**
 * Het exportpaneel (besluit B-06): vier miniaturen, een voorbeeld, het aantal
 * pagina's en de exportknoppen. Het schuift over het schrijfscherm heen en is
 * geen aparte route (doc 03, *Layout*).
 *
 * **Initialen gaan door de renderlaag heen, niet door de exportlaag.** Doc 02
 * eist dat het voorbeeld toont wat je krijgt; zou de vervanging pas bij het
 * exporteren gebeuren, dan lopen voorbeeld en bestand uiteen. Daarom wordt de
 * tekst hier één keer omgezet en gebruiken voorbeeld én export dezelfde
 * pagina's.
 *
 * **`templateId` en `exportedAt` worden pas na een geslaagde export gemeld.**
 * Bij elke klik op een miniatuur wegschrijven zou `updatedAt` verzetten, en dan
 * verspringt de documentatie in het overzicht — dat sorteert op laatst
 * gewijzigd.
 */
export function ExportPanel({
  destination,
  onOpenChange,
  document: doc,
  seriesName,
  groupName,
  students,
  onExported,
}: ExportPanelProps) {
  const [templateId, setTemplateId] = useState<TemplateId>(
    () => (doc.templateId as TemplateId | undefined) ?? DEFAULT_TEMPLATE_ID,
  );
  const [useInitials, setUseInitials] = useState(false);
  const [masker, setMasker] = useState<TextMasker | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<ServiceError | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [consentGiven, setConsentGiven] = useState<string>();

  const canShare = useSyncExternalStore(nooitWijzigen, readCanShare, () => false);
  const canCopy = useSyncExternalStore(nooitWijzigen, readCanCopy, () => false);

  const isImage = destination === "afbeelding";

  // Alleen de deelbare afbeelding kent de initialenschakelaar (doc 04).
  useEffect(() => {
    if (!isImage) return;

    let active = true;
    void PrivacyService.getInitialsMasker().then((next) => {
      // In een functie gewikkeld: React zou een losse functie als updater zien.
      if (active) setMasker(() => next);
    });

    return () => {
      active = false;
    };
  }, [isImage]);

  const masked = useInitials && masker ? masker : null;

  /**
   * De invoer voor de renderlaag. Eén pagina, opgebouwd uit de documentvelden;
   * `layout()` loopt over een lijst, dus meerdere pagina's vragen hier straks
   * alleen een langere lijst.
   *
   * De initialen worden hier toegepast en niet bij het exporteren. Doc 02 eist
   * dat het voorbeeld toont wat je krijgt, en dat kan alleen als de vervanging
   * vóór het opmaken gebeurt.
   */
  const renderInput: RenderInput = useMemo(
    () => ({
      title: doc.title,
      seriesName,
      groupNames: groupName ? [groupName] : [],
      students: students.map((student) => ({
        name: masked ? masked(student.name) : student.name,
        dateOfBirth: student.dateOfBirth,
      })),
      pages: [
        {
          templateId,
          text: masked ? masked(doc.text) : doc.text,
          quotes: doc.quotes.map((quote) => ({
            ...quote,
            text: masked ? masked(quote.text) : quote.text,
          })),
          photoIds: doc.photoIds,
        },
      ],
    }),
    [doc, seriesName, groupName, students, templateId, masked],
  );

  const { pages, images, loading } = useRenderedPages({ input: renderInput, enabled: true });

  const needsConsent = isImage && !doc.photoConsentConfirmedAt && !consentGiven;

  function finish(consentAt?: string) {
    onExported({
      templateId,
      exportedAt: new Date().toISOString(),
      ...(consentAt ? { photoConsentConfirmedAt: consentAt } : {}),
    });
  }

  async function perform(action: Action, consentAt?: string) {
    setBusy(action);
    setError(null);

    try {
      const fileTitle = doc.title.trim() || "Documentatie";

      if (action === "pdf") {
        ExportService.download(await ExportService.toPdf(pages), toFileName(fileTitle, "pdf"));
        finish(consentAt);
        return;
      }

      if (action === "copy") {
        const png = await ExportService.toClipboardImage(pages[0]);
        if (await ExportService.copyImage(png)) {
          finish(consentAt);
          return;
        }
        // Klembord geweigerd of niet beschikbaar: dan maar downloaden.
        const [first] = await ExportService.toImages([pages[0]]);
        ExportService.download(first, toFileName(fileTitle, "jpg"));
        finish(consentAt);
        return;
      }

      const blobs = await ExportService.toImages(pages);
      const files = blobs.map(
        (blob, index) =>
          new File([blob], toFileName(fileTitle, "jpg", blobs.length > 1 ? index + 1 : undefined), {
            type: "image/jpeg",
          }),
      );

      if (action === "share") {
        // Wegklikken van het deelmenu is geen fout, maar ook geen export: er is
        // dan niets de deur uit gegaan.
        if (await ExportService.share(files, fileTitle)) finish(consentAt);
        return;
      }

      for (const file of files) ExportService.download(file, file.name);
      finish(consentAt);
    } catch (cause) {
      setError(toServiceError(cause));
    } finally {
      setBusy(null);
    }
  }

  function start(action: Action) {
    if (needsConsent) {
      setPending(action);
      return;
    }
    void perform(action);
  }

  const disabled = busy !== null || loading || pages.length === 0;

  function label(action: Action, text: string) {
    return busy === action ? (
      <>
        <Spinner aria-hidden="true" aria-label={undefined} role={undefined} />
        Bezig…
      </>
    ) : (
      text
    );
  }

  return (
    <Sheet open onOpenChange={(open) => (busy ? undefined : onOpenChange(open))}>
      {/*
        `max-h` en niet `h`: het paneel zet voor deze kant zelf `height: auto`
        via een attribuutselector, en die wint van een gewone hoogteklasse. Een
        maximumhoogte botst niet met `height: auto` en begrenst hem wél.
      */}
      <SheetContent side="bottom" className="max-h-[92dvh] gap-0">
        <SheetHeader className="mx-auto w-full max-w-4xl">
          <SheetTitle>{TITLES[destination]}</SheetTitle>
          <SheetDescription>
            {loading ? "Voorbeeld wordt opgebouwd…" : pageLabel(pages.length)}
          </SheetDescription>
        </SheetHeader>

        {/*
          `min-h-0` maakt het schuiven mogelijk: een flexkind mag zonder dat niet
          kleiner worden dan zijn inhoud. `max-w-4xl` houdt het voorbeeld op een
          breed scherm leesbaar.
        */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-4">
            <TemplatePicker
              value={templateId}
              onChange={setTemplateId}
              photoCount={doc.photoIds.length}
            />

            {isImage ? (
              <div className="flex items-center gap-2">
                <Switch
                  id="use-initials"
                  aria-label="Namen als initialen"
                  checked={useInitials}
                  onCheckedChange={setUseInitials}
                  disabled={busy !== null}
                />
                <Label htmlFor="use-initials">Namen als initialen</Label>
              </div>
            ) : null}

            {error ? <ErrorMessage message={error.message} nextStep={error.nextStep} /> : null}

            <ExportPreview pages={pages} images={images} loading={loading} />
          </div>
        </div>

        <SheetFooter className="mx-auto w-full max-w-4xl flex-row flex-wrap gap-2">
          {destination === "pdf" ? (
            <Button onClick={() => start("pdf")} disabled={disabled}>
              <Download aria-hidden="true" />
              {label("pdf", "PDF downloaden")}
            </Button>
          ) : (
            <>
              {canShare ? (
                <Button onClick={() => start("share")} disabled={disabled}>
                  <Share2 aria-hidden="true" />
                  {label("share", "Delen")}
                </Button>
              ) : null}

              <Button
                variant={canShare ? "outline" : "default"}
                onClick={() => start("download")}
                disabled={disabled}
              >
                <Download aria-hidden="true" />
                {label("download", pages.length > 1 ? `${pages.length} afbeeldingen` : "Downloaden")}
              </Button>

              {canCopy ? (
                <Button variant="outline" onClick={() => start("copy")} disabled={disabled}>
                  <Copy aria-hidden="true" />
                  {label("copy", pages.length > 1 ? "Eerste pagina kopiëren" : "Kopiëren")}
                </Button>
              ) : null}
            </>
          )}
        </SheetFooter>
      </SheetContent>

      <PhotoConsentDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        onConfirm={() => {
          const at = new Date().toISOString();
          setConsentGiven(at);
          if (pending) void perform(pending, at);
          setPending(null);
        }}
      />
    </Sheet>
  );
}
