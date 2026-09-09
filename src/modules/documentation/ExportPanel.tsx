"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import { deelBestand, deelwijze, downloadBestand, kanDelen, kopieerAfbeelding } from "@/lib/delen";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { diensten } from "@/services/diensten";
import { LAYOUTS } from "@/services/documentation/LayoutService";
import { vraagtToestemming } from "@/services/documentation/toestemming";

import { useExport, type Exportpagina, type Exportstand } from "./hooks/useExport";

/** FR-DOC-115, B-08: de vraag die één keer per documentatie komt. */
const TOESTEMMINGSVRAAG =
  "Op deze foto's staan kinderen. Heb je voor deze kinderen toestemming voor beeldgebruik?";

/** De twee wegen naar buiten (§6.1.12). Beide zijn een export in de zin van `FR-DOC-118`. */
export type Uitvoer = "afbeelding" | "pdf";

interface ExportPanelProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Het exportpaneel (§6.1.12, B-06, D08).
 *
 * Een paneel over het schrijfscherm en geen apart scherm: je blijft bij je tekst
 * staan terwijl je kijkt hoe hij eruitkomt. Vier delen, in deze volgorde — de
 * layoutkiezer, het voorbeeld, de opties en de twee knoppen.
 *
 * **Het voorbeeld is het bestand.** Wat je hier ziet is de JPEG die je verstuurt,
 * op ware grootte gerenderd en door de browser kleiner getoond (`FR-DOC-113`). Er
 * is geen tweede weergave die ernaast kan gaan lopen.
 *
 * **Delen, niet downloaden** (B-09). Op de telefoon opent het deelmenu met het
 * bestand er al in; op de laptop gaat de afbeelding naar het klembord zodat je hem
 * in een mail plakt. Downloaden is de uitwijk voor wie geen van beide heeft.
 */
export function ExportPanel({ documentId, open, onOpenChange }: ExportPanelProps) {
  const [initialen, setInitialen] = useState(false);
  const [vraagToestemming, setVraagToestemming] = useState<Uitvoer | null>(null);
  const { stand, setStand } = useExport(documentId, initialen, open);
  const { melding, fout, bezig, setFout, verstuur, bevestig } = useVersturen(documentId, stand, setStand);

  function begin(soort: Uitvoer) {
    setFout(null);
    if (vraagtToestemming(stand)) setVraagToestemming(soort);
    else void verstuur(soort);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-(--size-panel) gap-0 overflow-y-auto sm:max-w-(--size-panel)">
        <SheetHeader>
          <SheetTitle>Exporteren</SheetTitle>
          <SheetDescription>Wat je hier ziet is precies wat je verstuurt.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <Layoutkiezer />

          {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}
          {stand.fout ? <ErrorMessage message={stand.fout} nextStep="Ga terug naar het overzicht." /> : null}

          <Voorbeeld bezig={stand.bezig} paginas={stand.paginas} />

          {stand.plan?.opmerkingen.map((opmerking) => (
            <p key={opmerking} className="text-sm text-muted-foreground">
              {opmerking}
            </p>
          ))}

          <Initialenschakelaar aan={initialen} onWijzig={setInitialen} />

          {melding ? <p className="text-sm text-success">{melding}</p> : null}
          {stand.gedeeld ? <p className="text-sm text-muted-foreground">Deze documentatie staat op gedeeld.</p> : null}

          <Knoppen
            kanVersturen={!stand.bezig && !bezig && stand.paginas.length > 0}
            bezig={bezig}
            paginas={stand.paginas.length}
            onVerstuur={begin}
          />
        </div>
      </SheetContent>

      <ConfirmDialog
        open={vraagToestemming !== null}
        onOpenChange={(aan) => {
          if (!aan) setVraagToestemming(null);
        }}
        title="Toestemming beeldgebruik"
        description={TOESTEMMINGSVRAAG}
        confirmLabel="Ja, ik heb toestemming"
        onConfirm={() => {
          const soort = vraagToestemming;
          setVraagToestemming(null);
          if (soort) void bevestig(soort);
        }}
      />
    </Sheet>
  );
}

/**
 * Toestemming vragen, versturen, en pas daarna de status omzetten.
 *
 * De volgorde is de eis (`FR-DOC-118`, `FR-DOC-119`): eerst het onomkeerbare stuk,
 * daarna pas de administratie. Gaat het delen mis — een weggeklikt deelmenu is al
 * genoeg — dan wordt `markeerGedeeld` niet bereikt en blijft de documentatie op
 * concept staan. Andersom zou het dashboard denken dat het werk weg is terwijl er
 * niets is verstuurd.
 */
function useVersturen(
  documentId: string,
  stand: Exportstand,
  setStand: Dispatch<SetStateAction<Exportstand>>,
) {
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function verstuur(soort: Uitvoer) {
    if (stand.paginas.length === 0) return setFout("Er is nog niets om te versturen.");

    // Het omzetten naar het klembord duurt bij een blad van 2480 px merkbaar lang.
    // Zonder deze merker lijkt de knop niets te doen en tikt de gebruiker nog eens.
    setBezig(true);
    setMelding(null);
    try {
      const wijze = soort === "pdf" ? await leverPdf(stand) : await lever(stand.paginas);
      const { documentation } = await diensten();
      const uitkomst = await documentation.markeerGedeeld(documentId);
      if (!uitkomst.ok) return setFout(uitkomst.error.message);

      setStand((huidig) => ({ ...huidig, gedeeld: true }));
      setMelding(MELDING[wijze]);
    } catch (oorzaak) {
      const reden = oorzaak instanceof Error ? oorzaak.message : "onbekend";
      setFout(`De export is niet gelukt (${reden}). De documentatie is niet gewijzigd.`);
    } finally {
      setBezig(false);
    }
  }

  async function bevestig(soort: Uitvoer) {
    const { documentation } = await diensten();
    const uitkomst = await documentation.geefBeeldtoestemming(documentId);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    setStand((huidig) => ({ ...huidig, toestemmingGegeven: true }));
    void verstuur(soort);
  }

  return { melding, fout, bezig, setFout, verstuur, bevestig };
}

/** FR-DOC-114: de schakelaar die namen door initialen vervangt. */
function Initialenschakelaar({ aan, onWijzig }: { aan: boolean; onWijzig: (aan: boolean) => void }) {
  return (
    <div>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="initialen">Vervang namen door initialen</FieldLabel>
        <Switch id="initialen" checked={aan} onCheckedChange={onWijzig} />
      </Field>
      <FieldDescription className="pt-1">
        Kjeld wordt K. Botsen er twee, dan komt er onderaan een legenda bij.
      </FieldDescription>
    </div>
  );
}

/**
 * De twee knoppen (§6.1.12).
 *
 * Beide leveren precies de pagina's uit het voorbeeld hierboven en verder niets.
 * Print-PDF liep tot B-128 via `window.print()`; dat drukte het scherm af — het
 * formulier, de navigatie en dit paneel — in plaats van de documentatie. De PDF
 * wordt nu in de app gemaakt, zoals `FR-DOC-116` al vroeg.
 */
function Knoppen({
  kanVersturen,
  bezig,
  paginas,
  onVerstuur,
}: {
  kanVersturen: boolean;
  bezig: boolean;
  paginas: number;
  onVerstuur: (soort: Uitvoer) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => onVerstuur("afbeelding")} disabled={!kanVersturen}>
        {bezig ? "Bezig…" : "Deelbare afbeelding"}
      </Button>
      <Button variant="outline" onClick={() => onVerstuur("pdf")} disabled={!kanVersturen}>
        Print-PDF
      </Button>
      <FieldDescription>
        {paginas === 1
          ? "De PDF bevat één A4 liggend: precies het blad hierboven."
          : `De PDF bevat ${paginas} A4's liggend: precies de bladen hierboven.`}
      </FieldDescription>
    </div>
  );
}

const MELDING = {
  gedeeld: "Het deelmenu is geopend met de afbeelding erin.",
  gekopieerd: "De afbeelding staat op je klembord. Plak hem in je mail.",
  gedownload: "De afbeelding staat in je map Downloads.",
  "pdf-gedeeld": "Het deelmenu is geopend met de PDF erin.",
  "pdf-gedownload": "De PDF staat in je map Downloads.",
} as const;

/**
 * Delen als het kan, anders kopiëren, anders downloaden (FR-DOC-117, B-09).
 *
 * Delen en kopiëren gaan over de eerste pagina; downloaden over alle. Dat is geen
 * inconsistentie maar de aard van de wegen: een deelmenu en een klembord dragen
 * één beeld, een map draagt er meer.
 */
async function lever(paginas: Exportpagina[]) {
  const eerste = paginas[0]!;
  const wijze = deelwijze(eerste.bestand);

  if (wijze === "gedeeld") await deelBestand(eerste.bestand, eerste.bestand.name);
  else if (wijze === "gekopieerd") await kopieerAfbeelding(eerste.bestand);
  else for (const pagina of paginas) downloadBestand(pagina.bestand);

  return wijze;
}

/**
 * De PDF: één bestand, alle bladen (`FR-DOC-116`, B-128).
 *
 * Geen klembord in de rij: een PDF plak je niet in een mailvenster. Delen als het
 * apparaat het kan, anders downloaden — de twee wegen die voor een document
 * bestaan.
 */
async function leverPdf(stand: Exportstand) {
  const { pdf } = await diensten();
  const uitkomst = await pdf.bundel(
    stand.paginas.map((pagina) => ({ nummer: pagina.nummer, jpeg: pagina.bestand })),
    stand.pdfnaam.replace(/\.pdf$/u, ""),
  );
  if (!uitkomst.ok) throw new Error(uitkomst.error.message);

  const bestand = new File([uitkomst.value], stand.pdfnaam, { type: "application/pdf" });
  if (kanDelen(bestand)) {
    await deelBestand(bestand, stand.pdfnaam);
    return "pdf-gedeeld" as const;
  }

  downloadBestand(bestand);
  return "pdf-gedownload" as const;
}

/**
 * De vijf miniaturen (FR-DOC-111).
 *
 * Vier ervan staan uit. Ze staan er wél, zodat het paneel in sprint 2 een slottabel
 * krijgt in plaats van een verbouwing, en zodat je nu al ziet dat de keuze bestaat.
 */
function Layoutkiezer() {
  return (
    <fieldset>
      <legend className="pb-2 text-sm font-medium">Layout</legend>
      <div className="grid grid-cols-3 gap-2">
        {LAYOUTS.map((keuze) => (
          <button
            key={keuze.id}
            type="button"
            disabled={!keuze.beschikbaar}
            aria-pressed={keuze.beschikbaar}
            title={keuze.omschrijving}
            className="rounded-md border p-2 text-xs aria-pressed:border-accent aria-pressed:bg-accent/10 disabled:opacity-50"
          >
            {keuze.naam}
          </button>
        ))}
      </div>
      <FieldDescription className="pt-2">
        In deze versie is alleen Fotoraster gevuld. De andere vier komen later.
      </FieldDescription>
    </fieldset>
  );
}

/** Het voorbeeld: de bestanden zelf, kleiner getoond (FR-DOC-113, FR-DOC-112). */
function Voorbeeld({ bezig, paginas }: { bezig: boolean; paginas: Exportpagina[] }) {
  if (bezig) return <Skeleton className="aspect-[297/210] w-full" />;

  return (
    <div className="space-y-2">
      {paginas.map((pagina) => (
        // De afbeelding komt uit de renderlaag; `next/image` kan hier niets aan
        // verbeteren en zou een tweede weg naar het beeld toevoegen.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={pagina.nummer}
          src={pagina.url}
          alt={`Voorbeeld van pagina ${pagina.nummer}`}
          className="w-full rounded-md border"
        />
      ))}
      <p className="text-sm text-muted-foreground">
        {paginas.length} {paginas.length === 1 ? "pagina" : "pagina's"}
      </p>
    </div>
  );
}
