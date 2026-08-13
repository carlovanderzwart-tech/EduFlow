"use client";

import { ArrowDown, ArrowUp, Camera, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/ui/button";
import { diensten } from "@/services/diensten";
import { MAX_FOTOS } from "@/services/photo/PhotoService";

/**
 * De fotostrook van het schrijfscherm (FR-DOC-41, FR-DOC-45, FR-DOC-46).
 *
 * **Vier wegen naar binnen, één verwerking.** Bestandskiezer, slepen, plakken en
 * camera komen alle vier uit bij `PhotoService.voegToe`, en daar wordt de foto
 * hertekend en van zijn EXIF ontdaan (FR-DOC-52). Er is geen vijfde weg, en dat is
 * de reden dat er geen foto met GPS erin langs kan.
 *
 * **Herordenen gaat met pijlknoppen en niet met slepen** (FR-DOC-46, B-38, NFR-35).
 * Slepen komt later; pijlknoppen zijn de toegankelijke route en die is niet
 * optioneel. Ze staan zichtbaar bij elke foto, niet verstopt achter een menu.
 */
export function PhotoStrip({
  photoIds,
  onWijzig,
  onFout,
  onDatumsuggestie,
}: {
  photoIds: string[];
  onWijzig: (photoIds: string[]) => void;
  onFout: (melding: string) => void;
  onDatumsuggestie: (datum: string) => void;
}) {
  const [bezig, setBezig] = useState(false);
  const [sleept, setSleept] = useState(false);

  async function neemOp(bestanden: readonly File[]) {
    if (bestanden.length === 0) return;

    const ruimte = MAX_FOTOS - photoIds.length;
    if (ruimte <= 0) {
      onFout(`Er passen hoogstens ${MAX_FOTOS} foto's in één documentatie.`);
      return;
    }

    setBezig(true);
    const { photos } = await diensten();
    const nieuwe: string[] = [];

    for (const bestand of bestanden.slice(0, ruimte)) {
      const uitkomst = await photos.voegToe(bestand);
      if (!uitkomst.ok) {
        onFout(uitkomst.error.message);
        continue;
      }
      if (!photoIds.includes(uitkomst.value.foto.id)) nieuwe.push(uitkomst.value.foto.id);
      // De opnamedatum vult het datumveld voor; het scherm beslist (§8.3.7).
      if (uitkomst.value.datumsuggestie) {
        onDatumsuggestie(uitkomst.value.datumsuggestie.slice(0, 10));
      }
    }

    setBezig(false);
    if (bestanden.length > ruimte) {
      onFout(`Er pasten er nog ${ruimte}; de rest is niet toegevoegd (FR-DOC-45).`);
    }
    if (nieuwe.length > 0) onWijzig([...photoIds, ...nieuwe]);
  }

  function verschuif(plaats: number, richting: -1 | 1) {
    const naar = plaats + richting;
    if (naar < 0 || naar >= photoIds.length) return;

    const volgorde = [...photoIds];
    [volgorde[plaats], volgorde[naar]] = [volgorde[naar]!, volgorde[plaats]!];
    onWijzig(volgorde);
  }

  // Plakken is de derde weg (FR-DOC-41). Hij hangt aan het document, want een
  // plakactie landt op het element dat focus heeft en dat is zelden de strook.
  useEffect(() => {
    function opPlakken(gebeurtenis: ClipboardEvent) {
      const beelden = [...(gebeurtenis.clipboardData?.files ?? [])].filter((bestand) =>
        bestand.type.startsWith("image/"),
      );
      if (beelden.length > 0) void neemOp(beelden);
    }

    document.addEventListener("paste", opPlakken);
    return () => document.removeEventListener("paste", opPlakken);
  });

  return (
    <section
      aria-label="Foto's"
      className={`space-y-3 rounded-md border-2 border-dashed p-3 ${
        sleept ? "border-primary" : "border-border"
      }`}
      onDragOver={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        setSleept(true);
      }}
      onDragLeave={() => setSleept(false)}
      onDrop={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        setSleept(false);
        void neemOp([...gebeurtenis.dataTransfer.files].filter((b) => b.type.startsWith("image/")));
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-sm font-medium">
          Foto&apos;s <span className="text-muted-foreground">{photoIds.length}/{MAX_FOTOS}</span>
        </h3>

        {/* Een label en geen knop: een `<input type="file">` is de enige manier om
            de bestandskiezer te openen, en een knop eromheen zou hem verbergen. De
            invoer zelf staat in `sr-only` zodat hij bereikbaar blijft voor het
            toetsenbord en de schermlezer. */}
        <label className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ImagePlus aria-hidden="true" />
          Kies bestanden
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={bezig}
            className="sr-only"
            onChange={(gebeurtenis) => void neemOp([...(gebeurtenis.target.files ?? [])])}
          />
        </label>

        <label className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Camera aria-hidden="true" />
          Camera
          {/* `capture` opent op de telefoon de camera in plaats van de galerij. */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={bezig}
            className="sr-only"
            onChange={(gebeurtenis) => void neemOp([...(gebeurtenis.target.files ?? [])])}
          />
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        Sleep ze hierheen of plak ze met Ctrl+V. Locatiegegevens worden verwijderd voordat de foto
        wordt opgeslagen.
      </p>

      {bezig ? <p role="status" className="text-sm">Bezig met verkleinen…</p> : null}

      <ul className="space-y-2">
        {photoIds.map((photoId, plaats) => (
          <li key={photoId} className="flex items-center gap-2">
            <PhotoThumb photoId={photoId} plaats={plaats} />
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Foto ${plaats + 1} naar voren`}
                disabled={plaats === 0}
                onClick={() => verschuif(plaats, -1)}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Foto ${plaats + 1} naar achteren`}
                disabled={plaats === photoIds.length - 1}
                onClick={() => verschuif(plaats, 1)}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Foto ${plaats + 1} verwijderen`}
                onClick={() => onWijzig(photoIds.filter((id) => id !== photoId))}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Toont één foto uit de opslag. De blob-URL wordt netjes weer vrijgegeven. */
function PhotoThumb({ photoId, plaats }: { photoId: string; plaats: number }) {
  const [bron, setBron] = useState<string | null>(null);

  useEffect(() => {
    let adres: string | null = null;

    void (async () => {
      const { photos } = await diensten();
      const blob = await photos.blobVan(photoId);
      if (!blob.ok || !blob.value) return;
      adres = URL.createObjectURL(blob.value);
      setBron(adres);
    })();

    // Zonder dit houdt elke geopende documentatie zijn foto's in het geheugen vast.
    return () => {
      if (adres) URL.revokeObjectURL(adres);
    };
  }, [photoId]);

  return bron ? (
    // Een gewone `img` en geen `next/image`: die laatste wil een pad of een host om
    // te optimaliseren, en dit is een blob-URL uit IndexedDB die het apparaat niet
    // verlaat. Optimaliseren zou hier betekenen: naar een server sturen (B-03).
    <img src={bron} alt={`Foto ${plaats + 1}`} className="size-16 rounded object-cover" />
  ) : (
    <span className="size-16 rounded bg-muted" aria-hidden="true" />
  );
}
