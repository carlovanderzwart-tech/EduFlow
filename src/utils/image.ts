/**
 * Een afbeelding verkleinen naar JPEG. Generiek: weet niets van documentaties.
 *
 * De lange zijde gaat naar maximaal 3300 pixels (besluit T-02): dat dekt 279 mm
 * op 300 dpi en dus de volle breedte van een A4 liggend met marge. Kleinere
 * foto's worden niet opgeschaald — dat levert geen scherpte op, alleen bytes.
 */

export const MAX_LONG_EDGE = 3300;
const JPEG_QUALITY = 0.9;

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

/** Berekent de doelmaat: lange zijde naar de grens, verhouding behouden, nooit opschalen. */
export function fitWithinLongEdge(
  width: number,
  height: number,
  maxLongEdge: number = MAX_LONG_EDGE,
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  const scale = Math.min(1, maxLongEdge / longEdge);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function decode(file: Blob): Promise<ImageBitmap> {
  // `from-image` past de EXIF-rotatie toe. Telefoonfoto's staan vaak gedraaid
  // opgeslagen met een oriëntatievlag; zonder dit belandt een staande foto
  // liggend in de export. Oudere browsers kennen de optie niet.
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

export async function resizeImageToJpeg(file: Blob): Promise<ResizedImage> {
  const bitmap = await decode(file);

  try {
    const { width, height } = fitWithinLongEdge(bitmap.width, bitmap.height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d-context niet beschikbaar");

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) throw new Error("toBlob gaf niets terug");

    return { blob, width, height };
  } finally {
    // Vrijgeven, anders blijft het gedecodeerde beeld in het geheugen staan.
    bitmap.close();
  }
}
