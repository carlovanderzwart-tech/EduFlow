/**
 * De browserkant van de renderlaag (§5.12, DR-12).
 *
 * `RenderService` kent geen canvas; hij kent een `Doek`. Hier staat de enige echte
 * invulling daarvan. Dezelfde afspraak als bij `hertekenViaCanvas`: het gereedschap
 * woont in `lib/`, de regel woont in `services/`, en daardoor is de regel te toetsen
 * zonder browser.
 */

/** Waar de printletter vandaan komt: `--font-print` uit `tokens.css` (§5.10.1). */
const PRINTLETTER_TEKEN = "--font-print";
const INKT_TEKEN = "--palette-gray-900";
const GEDEMPT_TEKEN = "--palette-gray-500";
const PAPIER_TEKEN = "--palette-gray-0";

/** Zonder document — bij het tekenen op de server — vallen we terug op deze waarden. */
const TERUGVAL = {
  familie: "sans-serif",
  inkt: "#1D232A",
  gedempt: "#7C8794",
  papier: "#FFFFFF",
};

/**
 * De tekenset van de printlaag, uit `tokens.css`.
 *
 * Lezen in plaats van overschrijven: DR-55 wil één bron voor elke waarde, en de
 * printlaag is daarop alleen een uitzondering in zijn eenheid (millimeters), niet
 * in zijn herkomst.
 */
export function printstijl() {
  if (typeof document === "undefined") return TERUGVAL;

  const stijl = getComputedStyle(document.documentElement);
  const lees = (teken: string, terugval: string) => stijl.getPropertyValue(teken).trim() || terugval;

  return {
    familie: lees(PRINTLETTER_TEKEN, TERUGVAL.familie),
    inkt: lees(INKT_TEKEN, TERUGVAL.inkt),
    gedempt: lees(GEDEMPT_TEKEN, TERUGVAL.gedempt),
    papier: lees(PAPIER_TEKEN, TERUGVAL.papier),
  };
}

/** Een echt canvas met een 2D-context. */
export function browserDoek(breedte: number, hoogte: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(breedte));
  canvas.height = Math.max(1, Math.round(hoogte));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Deze browser levert geen 2D-context; tekenen kan niet.");

  // Zonder dit worden foto's bij het verkleinen korrelig, en dat is precies waar
  // een export van zes foto's op stukloopt.
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  return {
    breedte: canvas.width,
    hoogte: canvas.height,
    context,
    naarJpeg: (kwaliteit: number) =>
      new Promise<Blob>((klaar, mislukt) => {
        canvas.toBlob(
          (blob) => (blob ? klaar(blob) : mislukt(new Error("De afbeelding kon niet worden gemaakt."))),
          "image/jpeg",
          kwaliteit,
        );
      }),
  };
}

/** Een foto uit de opslag als tekenbare bron, met zijn ware maten. */
export async function leesBeeld(blob: Blob) {
  const bron = await createImageBitmap(blob);
  return { bron, breedte: bron.width, hoogte: bron.height };
}
