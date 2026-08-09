import { DocumentService } from "./DocumentService";
import { RenderService, type RenderedPage } from "./RenderService";
import { toServiceError } from "./ServiceError";

/**
 * Print-PDF en deelbare afbeelding maken, delen en kopiëren (docs/archief/03,
 * *Services*).
 *
 * Deze service maakt geen opmaak. Hij krijgt de pagina's die `RenderService`
 * al heeft berekend en zet die om naar bestanden — dat is de scheiding uit
 * docs/archief/03: *"`RenderService` bouwt de documentatie op tot pagina's;
 * `ExportService` zet die om."*
 *
 * Het tekenen zelf loopt ook hier via `RenderService.paint()`. Er is dus één
 * renderlaag: wat in het voorbeeld staat is wat in het bestand komt.
 */

/** docs/archief/04: de deelbare afbeelding is ongeveer 1600 pixels breed. */
const SHARE_IMAGE_WIDTH = 1600;

/** Genoeg om drukwerk niet zichtbaar te laten inleveren, zonder onnodig grote bestanden. */
const JPEG_QUALITY = 0.92;

/** A4 liggend in millimeters. De marge zit al in de getekende pagina (docs/archief/04). */
const A4_LANDSCAPE_MM = { width: 297, height: 210 };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas leverde geen afbeelding"))),
      type,
      quality,
    );
  });
}

/** Geeft het geheugen van een canvas vrij; een pagina op ware grootte is ~35 MB. */
function release(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Tekent één pagina op ware grootte of geschaald.
 *
 * Leest de foto's van díé pagina in, tekent, en geeft ze meteen weer vrij. Zo
 * staat er nooit meer dan één pagina aan foto's in het geheugen, ook niet bij
 * een documentatie van tien pagina's.
 */
async function paintPage(page: RenderedPage, scale: number): Promise<HTMLCanvasElement> {
  const photoIds = page.blocks
    .filter((block) => block.kind === "photo")
    .map((block) => (block.kind === "photo" ? block.photoId : ""));

  const images = new Map<string, ImageBitmap>();

  try {
    for (const photoId of photoIds) {
      const photo = await DocumentService.getPhoto(photoId);
      if (!photo) continue;
      images.set(photoId, await createImageBitmap(photo.blob));
    }

    const canvas = document.createElement("canvas");
    RenderService.paint(canvas, page, images, scale);
    return canvas;
  } finally {
    for (const image of images.values()) image.close();
  }
}

/** Maakt van een titel een bruikbare bestandsnaam. */
export function toFileName(title: string, extension: string, page?: number): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "documentatie";

  return page ? `${base}-${page}.${extension}` : `${base}.${extension}`;
}

export const ExportService = {
  /**
   * Print-PDF: A4 liggend, alle pagina's, foto's op 300 dpi (docs/archief/04, T-03).
   *
   * De pagina's worden op ware grootte getekend (3508 × 2480) en als afbeelding
   * op een A4 gezet. De veilige marge van 10 mm zit al in het getekende beeld,
   * dus de afbeelding vult het blad en een kantoorprinter snijdt niets weg.
   *
   * **De bibliotheek wordt hier pas geladen.** `jsPDF` staat achter een
   * dynamische import, zodat niemand die hem nooit gebruikt hem toch binnenhaalt.
   * Gekozen omdat we maar één ding nodig hebben — een afbeelding op een blad van
   * vaste maat — en `addImage()` precies dat doet, zonder worker of wasm.
   */
  async toPdf(pages: RenderedPage[]): Promise<Blob> {
    if (pages.length === 0) throw new Error("geen pagina's om te exporteren");

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (const [index, page] of pages.entries()) {
        if (index > 0) pdf.addPage();

        const canvas = await paintPage(page, 1);
        try {
          pdf.addImage(
            canvas.toDataURL("image/jpeg", JPEG_QUALITY),
            "JPEG",
            0,
            0,
            A4_LANDSCAPE_MM.width,
            A4_LANDSCAPE_MM.height,
          );
        } finally {
          release(canvas);
        }
      }

      return pdf.output("blob");
    } catch (cause) {
      throw toServiceError(cause);
    }
  },

  /** Eén JPG per pagina, ongeveer 1600 pixels breed (docs/archief/04). */
  async toImages(pages: RenderedPage[]): Promise<Blob[]> {
    if (pages.length === 0) throw new Error("geen pagina's om te exporteren");

    try {
      const blobs: Blob[] = [];

      for (const page of pages) {
        const canvas = await paintPage(page, SHARE_IMAGE_WIDTH / page.size.width);
        try {
          blobs.push(await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY));
        } finally {
          release(canvas);
        }
      }

      return blobs;
    } catch (cause) {
      throw toServiceError(cause);
    }
  },

  /**
   * Eén pagina als PNG, voor het klembord.
   *
   * Bewust geen JPEG: `ClipboardItem` accepteert in Chrome, Safari en Firefox
   * alleen `image/png`. Downloaden en delen blijven JPG zoals gedocumenteerd.
   */
  async toClipboardImage(page: RenderedPage): Promise<Blob> {
    try {
      const canvas = await paintPage(page, SHARE_IMAGE_WIDTH / page.size.width);
      try {
        return await canvasToBlob(canvas, "image/png");
      } finally {
        release(canvas);
      }
    } catch (cause) {
      throw toServiceError(cause);
    }
  },

  download(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Niet meteen intrekken: sommige browsers starten de download pas na de
    // huidige taak en krijgen dan een lege URL.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },

  /** Of het deelmenu van het apparaat deze bestanden aankan. */
  canShare(files: File[]): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      typeof navigator.share === "function" &&
      navigator.canShare({ files })
    );
  },

  /**
   * Deelt bestanden via het deelmenu (besluit B-09).
   *
   * Geeft `false` wanneer delen niet kan of de gebruiker het menu wegklikt. Dat
   * laatste is geen fout, maar ook geen export: er is dan niets de deur uit
   * gegaan, dus de documentatie hoort niet op afgerond te komen.
   */
  async share(files: File[], title: string): Promise<boolean> {
    if (!this.canShare(files)) return false;

    try {
      await navigator.share({ files, title });
      return true;
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return false;
      throw toServiceError(cause);
    }
  },

  /** Of dit apparaat een afbeelding op het klembord kan zetten. */
  canCopyImage(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard?.write === "function" &&
      typeof ClipboardItem !== "undefined"
    );
  },

  /** Zet een PNG op het klembord. Geeft `false` wanneer de browser weigert. */
  async copyImage(blob: Blob): Promise<boolean> {
    if (!this.canCopyImage()) return false;

    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      return true;
    } catch {
      // Sommige browsers weigeren zonder gebruikersgebaar of buiten focus. Dan
      // valt de aanroeper terug op downloaden.
      return false;
    }
  },
};
