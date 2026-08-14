/**
 * Delen en kopiëren (FR-DOC-117, B-09).
 *
 * **Downloaden is de uitwijk, niet het doel.** Downloaden, terugzoeken in je
 * fotorol en dan pas versturen zijn vier handelingen voor iets wat er één kan zijn.
 * Daarom eerst het deelmenu van het apparaat met het bestand er al in; op de laptop
 * het klembord, zodat je hem rechtstreeks in een mail plakt; en pas als geen van
 * beide kan, een download.
 */

export type Deelwijze = "gedeeld" | "gekopieerd" | "gedownload";

/** Kan dit apparaat een bestand het deelmenu in sturen? */
export function kanDelen(bestand: File): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.canShare?.({ files: [bestand] }));
}

/** Kan deze browser een afbeelding op het klembord zetten? */
export function kanKopieren(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.clipboard?.write) && typeof ClipboardItem !== "undefined";
}

/**
 * Welke weg dit apparaat aankan, in de volgorde van B-09.
 *
 * Delen boven kopiëren boven downloaden. Los van het uitvoeren, zodat de keuze te
 * toetsen is zonder klembord en zonder deelmenu — en zodat het paneel vooraf kan
 * zeggen wat er gaat gebeuren.
 */
export function deelwijze(bestand: File): Deelwijze {
  if (kanDelen(bestand)) return "gedeeld";
  if (kanKopieren()) return "gekopieerd";
  return "gedownload";
}

/**
 * Zet de afbeelding op het klembord (B-09).
 *
 * JPEG is niet overal een toegestaan klembordtype; PNG wel. Het beeld wordt daarom
 * omgezet — dezelfde pixels, ander omhulsel. Dat is geen tweede renderpad: er wordt
 * niets opnieuw getekend, alleen anders verpakt.
 */
export async function kopieerAfbeelding(blob: Blob): Promise<void> {
  const png = blob.type === "image/png" ? blob : await naarPng(blob);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

async function naarPng(blob: Blob): Promise<Blob> {
  const beeld = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = beeld.width;
  canvas.height = beeld.height;
  canvas.getContext("2d")?.drawImage(beeld, 0, 0);

  return new Promise((klaar, mislukt) => {
    canvas.toBlob(
      (uit) => (uit ? klaar(uit) : mislukt(new Error("De afbeelding kon niet worden gekopieerd."))),
      "image/png",
    );
  });
}

/** Opent het deelmenu van het apparaat met het bestand erin (FR-DOC-117). */
export async function deelBestand(bestand: File, titel: string): Promise<void> {
  await navigator.share({ files: [bestand], title: titel });
}

/** De uitwijk: het bestand naar de map Downloads. */
export function downloadBestand(bestand: File): void {
  const url = URL.createObjectURL(bestand);
  const schakel = document.createElement("a");
  schakel.href = url;
  schakel.download = bestand.name;
  schakel.click();
  URL.revokeObjectURL(url);
}
