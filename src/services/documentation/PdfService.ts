/**
 * De PDF (`FR-DOC-116`, T-14, B-128).
 *
 * Eén bestand met één A4-liggende pagina per gerenderde pagina, **in de app
 * gemaakt en niet met de printfunctie van de browser**. Dat laatste staat zo in
 * `FR-DOC-116`, en de reden bleek bij de eerste eigen test: `window.print()`
 * drukt het scherm af, dus kwamen er dertien pagina's uit met het formulier, de
 * navigatie en het exportpaneel erop. Wat je wilde printen stond er niet bij.
 *
 * **De bladzijde is de al gerenderde JPEG.** Er wordt hier niets getekend en
 * niets gemeten: `RenderService` heeft de pagina al op 2480 × 1754 gezet, en die
 * afbeelding gaat als geheel op het blad. Daardoor kan de PDF per definitie niet
 * afwijken van de deelbare afbeelding — hetzelfde beeld, een andere verpakking.
 * Dat is dezelfde belofte als `FR-DOC-113`, nu ook voor papier.
 *
 * `pdf-lib` staat in de goedgekeurde lijst van §16 en is bij T-14 aangewezen. Hij
 * wordt pas geladen als je op de knop drukt: 400 kB in het eerste scherm van een
 * app die op een schoollaptop moet starten, voor een knop die de meeste sessies
 * niet wordt aangeraakt, is de verkeerde ruil (§17.2).
 */

import { ongeldig, type Result } from "@/lib/result";

import { PAGINA } from "./LayoutService";

/**
 * Millimeters naar punten, de eenheid van een PDF.
 *
 * 72 punten per inch, 25,4 mm per inch. A4 liggend wordt daarmee 841,89 × 595,28
 * pt. Die twee getallen staan hier niet uitgeschreven maar afgeleid, want dan
 * blijft §5.10's `PAGINA` de enige plek waar het bladformaat staat (U-03).
 */
const PUNT_PER_MM = 72 / 25.4;

export const PDF_BREEDTE_PT = PAGINA.breedte * PUNT_PER_MM;
export const PDF_HOOGTE_PT = PAGINA.hoogte * PUNT_PER_MM;

/** Eén bladzijde: de JPEG die `RenderService` al heeft gemaakt. */
export interface Pdfpagina {
  nummer: number;
  jpeg: Blob;
}

/**
 * De laadfunctie van `pdf-lib`, geïnjecteerd zodat DR-12 blijft gelden.
 *
 * Een toets levert er zijn eigen, en hoeft daarvoor geen bundelaar na te bootsen.
 */
export type Pdfmaker = () => Promise<PdfBibliotheek>;

/** Precies het stukje `pdf-lib` dat hier wordt gebruikt, en niets meer. */
export interface PdfBibliotheek {
  PDFDocument: {
    create(): Promise<PdfDocument>;
  };
}

export interface PdfDocument {
  embedJpg(bytes: ArrayBuffer | Uint8Array): Promise<PdfBeeld>;
  addPage(afmeting: [number, number]): PdfBlad;
  setTitle(titel: string): void;
  setProducer(naam: string): void;
  setCreator(naam: string): void;
  save(): Promise<Uint8Array>;
}

export interface PdfBeeld {
  width: number;
  height: number;
}

export interface PdfBlad {
  drawImage(beeld: PdfBeeld, plaats: { x: number; y: number; width: number; height: number }): void;
}

export interface PdfDeps {
  laad: Pdfmaker;
}

/**
 * De naam die in de eigenschappen van het bestand komt.
 *
 * Geen leerlingnaam en geen tekst uit de documentatie: een PDF draagt zijn
 * metagegevens mee naar iedereen die hem opent, en DR-33 laat geen persoonsgegeven
 * op een plek staan waar niemand hem verwacht. De titel van de documentatie is
 * geen persoonsgegeven op zichzelf, maar hij is er wel vaak vol van.
 */
export const PDF_PRODUCENT = "EduFlow";

export function createPdfService(deps: PdfDeps) {
  const { laad } = deps;

  /**
   * De pagina's in één PDF, in volgorde van nummer.
   *
   * Het beeld vult het blad tot de rand. Dat mag, want de marge van 10 mm zit al
   * ín de gerenderde pagina (§5.10): zou hier nog een marge bij komen, dan stond
   * er twee keer een rand omheen en klopte de tekstbreedte van §5.9 niet meer.
   */
  async function bundel(paginas: readonly Pdfpagina[], titel: string): Promise<Result<Blob>> {
    if (paginas.length === 0) return ongeldig("Er is nog niets om te printen.");

    const { PDFDocument } = await laad();
    const document = await PDFDocument.create();

    document.setTitle(titel);
    document.setProducer(PDF_PRODUCENT);
    document.setCreator(PDF_PRODUCENT);

    const geordend = [...paginas].sort((a, b) => a.nummer - b.nummer);
    for (const pagina of geordend) {
      const beeld = await document.embedJpg(await pagina.jpeg.arrayBuffer());
      const blad = document.addPage([PDF_BREEDTE_PT, PDF_HOOGTE_PT]);
      blad.drawImage(beeld, { x: 0, y: 0, width: PDF_BREEDTE_PT, height: PDF_HOOGTE_PT });
    }

    const bytes = await document.save();
    // `slice()` maakt een gewone ArrayBuffer van de weergave; een `Uint8Array` uit
    // een gedeeld geheugengebied accepteert `Blob` niet in elke browser.
    return { ok: true, value: new Blob([bytes.slice().buffer as ArrayBuffer], { type: "application/pdf" }) };
  }

  return { bundel };
}

export type PdfService = ReturnType<typeof createPdfService>;
