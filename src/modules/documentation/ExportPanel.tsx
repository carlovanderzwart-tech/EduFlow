"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import { downloadBestand, kanKopieren, kopieerAfbeelding } from "@/lib/delen";
import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { diensten } from "@/services/diensten";
import {
  LAYOUTS,
  tekstplekken,
  type Planopties,
} from "@/services/documentation/LayoutService";
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
 * **Downloaden, niet delen** (B-134). Tot die beslissing opende er een deelmenu,
 * en dan stond het bestand nergens terug te vinden. Nu komt het in de map
 * Downloads. Kopiëren naar het klembord staat ernaast als tweede knop, precies
 * zoals `FR-DOC-117` het formuleert.
 */
export function ExportPanel({ documentId, open, onOpenChange }: ExportPanelProps) {
  const [initialen, setInitialen] = useState(false);
  const [opmaak, setOpmaak] = useState<Planopties>({ layoutId: "A-fotoraster" });
  const [vraagToestemming, setVraagToestemming] = useState<Uitvoer | null>(null);
  const { stand, setStand } = useExport(documentId, initialen, open, opmaak);
  const { melding, fout, bezig, setFout, verstuur, bevestig, kopieer } = useVersturen(
    documentId,
    stand,
    setStand,
  );

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
          <Layoutkiezer opmaak={opmaak} onWijzig={setOpmaak} />

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
            onKopieer={() => void kopieer()}
          />
        </div>
      </SheetContent>

      <Toestemmingsvraag
        soort={vraagToestemming}
        onSluit={() => setVraagToestemming(null)}
        onBevestig={bevestig}
      />
    </Sheet>
  );
}

/**
 * De vraag van B-08, met onthouden waarvoor hij werd gesteld (`FR-DOC-115`).
 *
 * De soort wordt vastgehouden omdat de vraag tussen de klik en het versturen in
 * staat: druk je op Print-PDF, dan hoort er na "ja" een PDF te komen en geen
 * afbeelding.
 */
function Toestemmingsvraag({
  soort,
  onSluit,
  onBevestig,
}: {
  soort: Uitvoer | null;
  onSluit: () => void;
  onBevestig: (soort: Uitvoer) => Promise<unknown>;
}) {
  return (
    <ConfirmDialog
      open={soort !== null}
      onOpenChange={(aan) => {
        if (!aan) onSluit();
      }}
      title="Toestemming beeldgebruik"
      description={TOESTEMMINGSVRAAG}
      confirmLabel="Ja, ik heb toestemming"
      onConfirm={() => {
        onSluit();
        if (soort) void onBevestig(soort);
      }}
    />
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
      const wijze = await lever(soort, stand);
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

  /**
   * De afbeelding naar het klembord (`FR-DOC-117`).
   *
   * Geen export in de zin van `FR-DOC-118`: kopiëren is een tussenstap en geen
   * aflevering. De status blijft daarom op concept tot je hem echt verstuurt.
   */
  async function kopieer() {
    const eerste = stand.paginas[0];
    if (!eerste) return setFout("Er is nog niets om te kopiëren.");

    setBezig(true);
    setMelding(null);
    try {
      await kopieerAfbeelding(eerste.bestand);
      setMelding(MELDING.gekopieerd);
    } catch (oorzaak) {
      const reden = oorzaak instanceof Error ? oorzaak.message : "onbekend";
      setFout(`Kopiëren is niet gelukt (${reden}). Gebruik de knop Afbeelding downloaden.`);
    } finally {
      setBezig(false);
    }
  }

  return { melding, fout, bezig, setFout, verstuur, bevestig, kopieer };
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
  onKopieer,
}: {
  kanVersturen: boolean;
  bezig: boolean;
  paginas: number;
  onVerstuur: (soort: Uitvoer) => void;
  onKopieer: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => onVerstuur("afbeelding")} disabled={!kanVersturen}>
        {bezig ? "Bezig…" : "Afbeelding downloaden"}
      </Button>
      <Button variant="outline" onClick={() => onVerstuur("pdf")} disabled={!kanVersturen}>
        PDF downloaden
      </Button>
      {/* `FR-DOC-117`: "daarnaast", en alleen waar het klembord bestaat. Een knop
          die op dit apparaat niets kan doen is erger dan een knop die er niet is. */}
      {kanKopieren() ? (
        <Button variant="ghost" onClick={onKopieer} disabled={!kanVersturen}>
          Kopieer afbeelding
        </Button>
      ) : null}
      <FieldDescription>
        Beide komen in je map Downloads.{" "}
        {paginas === 1
          ? "De PDF bevat één A4 liggend: precies het blad hierboven."
          : `De PDF bevat ${paginas} A4's liggend: precies de bladen hierboven.`}
      </FieldDescription>
    </div>
  );
}

const MELDING = {
  afbeelding: "De afbeelding staat in je map Downloads.",
  afbeeldingen: "De pagina's staan als losse afbeeldingen in je map Downloads.",
  pdf: "De PDF staat in je map Downloads.",
  gekopieerd: "De afbeelding staat op je klembord. Plak hem in je mail.",
} as const;

/**
 * Het bestand naar de map Downloads (`FR-DOC-117`, B-134).
 *
 * Eén weg voor beide knoppen. Er is geen deelmenu meer en geen keten van
 * uitwijkmogelijkheden: het bestand komt in de map Downloads en daar is het terug
 * te vinden. Kopiëren staat als aparte knop naast deze, niet erachter.
 *
 * De afbeelding levert alle pagina's, de PDF één bestand met alle bladen erin.
 */
async function lever(soort: Uitvoer, stand: Exportstand) {
  if (soort === "pdf") {
    downloadBestand(await maakPdf(stand));
    return "pdf" as const;
  }

  for (const pagina of stand.paginas) downloadBestand(pagina.bestand);
  return stand.paginas.length === 1 ? ("afbeelding" as const) : ("afbeeldingen" as const);
}

/** De gerenderde pagina's als één PDF (`FR-DOC-116`, B-128). */
async function maakPdf(stand: Exportstand): Promise<File> {
  const { pdf } = await diensten();
  const uitkomst = await pdf.bundel(
    stand.paginas.map((pagina) => ({ nummer: pagina.nummer, jpeg: pagina.bestand })),
    stand.pdfnaam.replace(/\.pdf$/u, ""),
  );
  if (!uitkomst.ok) throw new Error(uitkomst.error.message);

  return new File([uitkomst.value], stand.pdfnaam, { type: "application/pdf" });
}

/**
 * De layoutkeuze, de tekstplek en de schakelaar van B-28 (`FR-DOC-111`,
 * `FR-DOC-128`, B-140, B-141).
 *
 * De vier layouts uit §5.10 staan er allemaal; `E-vervolg` niet, want die kies je
 * niet — hij komt eraan omdat je tekst niet paste (§5.10.6).
 *
 * De tekstplek verschijnt alleen waar de keuze iets betekent: in het raster van
 * layout A zijn de zes vakken onderling verwisselbaar, en daar kun je de tekst dus
 * ergens anders neerzetten. In B liggen de twee kolommen vast, in C is er één vak
 * en in D geen.
 */
function Layoutkiezer({
  opmaak,
  onWijzig,
}: {
  opmaak: Planopties;
  onWijzig: (opmaak: Planopties) => void;
}) {
  const gekozen = opmaak.layoutId ?? "A-fotoraster";
  const plekken = tekstplekken(gekozen);
  const heeftTekstvak = LAYOUT_MET_TEKST.has(gekozen);

  return (
    <fieldset className="space-y-3">
      <legend className="pb-2 text-sm font-medium">Layout</legend>
      <div className="grid grid-cols-2 gap-2">
        {LAYOUTS.map((keuze) => (
          <button
            key={keuze.id}
            type="button"
            disabled={!keuze.beschikbaar}
            aria-pressed={keuze.id === gekozen}
            title={keuze.omschrijving}
            // De tekstplek hoort bij de layout; hem meenemen naar een andere zou
            // een slotnaam opleveren die daar niet bestaat.
            onClick={() => onWijzig({ layoutId: keuze.id })}
            className="aria-pressed:border-(--color-accent) rounded-md border p-2 text-xs aria-pressed:bg-(--color-accent-quiet) disabled:opacity-50"
          >
            {keuze.naam}
          </button>
        ))}
      </div>
      <FieldDescription>
        {LAYOUTS.find((keuze) => keuze.id === gekozen)?.omschrijving}
      </FieldDescription>

      {heeftTekstvak && plekken.length > 1 ? (
        <Tekstplek plekken={plekken} opmaak={opmaak} onWijzig={onWijzig} />
      ) : null}

      {!heeftTekstvak ? <Tekstweglaten opmaak={opmaak} onWijzig={onWijzig} /> : null}
    </fieldset>
  );
}

/** Waar de tekst komt te staan (`FR-DOC-128`, B-141). */
function Tekstplek({
  plekken,
  opmaak,
  onWijzig,
}: {
  plekken: string[];
  opmaak: Planopties;
  onWijzig: (opmaak: Planopties) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="tekstplek">Waar komt de tekst?</FieldLabel>
      <NativeSelect
        id="tekstplek"
        value={opmaak.tekstslot ?? ""}
        onChange={(gebeurtenis) =>
          onWijzig({ ...opmaak, tekstslot: gebeurtenis.target.value || undefined })
        }
      >
        <NativeSelectOption value="">Standaard</NativeSelectOption>
        {plekken.map((naam, plaats) => (
          <NativeSelectOption key={naam} value={naam}>
            {PLEKNAMEN[plaats] ?? naam}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldDescription>
        Het vak dat je kiest wordt het tekstvak; waar de tekst stond komt een foto.
      </FieldDescription>
    </Field>
  );
}

/** B-28: bij een layout zonder tekstvak laat je de tekst bewust weg, of niet. */
function Tekstweglaten({
  opmaak,
  onWijzig,
}: {
  opmaak: Planopties;
  onWijzig: (opmaak: Planopties) => void;
}) {
  return (
    <div>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="tekst-weg">Laat de tekst weg</FieldLabel>
        <Switch
          id="tekst-weg"
          checked={opmaak.laatTekstWeg === true}
          onCheckedChange={(aan) => onWijzig({ ...opmaak, laatTekstWeg: aan })}
        />
      </Field>
      <FieldDescription className="pt-1">
        Deze layout toont geen lopende tekst. Laat je hem staan, dan komt hij op een
        vervolgpagina (B-28).
      </FieldDescription>
    </div>
  );
}

/** Welke layouts een tekstvak hebben; D heeft er geen (§5.10.5). */
const LAYOUT_MET_TEKST = new Set(["A-fotoraster", "B-verhaal", "C-groot-beeld"]);

/**
 * De zes vakken van het raster in gewone taal (`FR-DOC-128`).
 *
 * "A4" zegt niets tegen een leerkracht; "linksonder" wel. De volgorde volgt de
 * slottabel van §5.10.2: drie boven, drie onder.
 */
const PLEKNAMEN = [
  "Linksboven",
  "Midden boven",
  "Rechtsboven",
  "Linksonder",
  "Midden onder",
  "Rechtsonder",
];

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
