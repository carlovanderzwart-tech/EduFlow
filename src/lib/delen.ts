/**
 * Het bestand naar buiten brengen (`FR-DOC-117`, B-134).
 *
 * **Downloaden is de weg, niet de uitwijk.** Tot B-134 stond het deelmenu voorop
 * (B-09) met het klembord erachter, met als redenering dat downloaden en dan
 * terugzoeken vier handelingen zijn. De eerste eigen test wees anders uit: op de
 * laptop opende er een deelvenster dat je niet wilde, en het bestand stond nergens.
 * Eén voorspelbare plek — de map Downloads — wint het van een menu waarvan je per
 * apparaat niet weet wat erin staat.
 *
 * Kopiëren blijft, maar als **tweede knop** en niet als schakel in een keten. Dat
 * is ook wat `FR-DOC-117` letterlijk zegt: *"Op de laptop verschijnt daarnaast
 * «Kopieer afbeelding»"* — daarnaast, niet in plaats van.
 */

/** Kan deze browser een afbeelding op het klembord zetten? */
export function kanKopieren(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard?.write) &&
    typeof ClipboardItem !== "undefined"
  );
}

/**
 * Zet de afbeelding op het klembord (B-09, `FR-DOC-117`).
 *
 * JPEG is niet overal een toegestaan klembordtype; PNG wel. Het beeld wordt daarom
 * omgezet — dezelfde pixels, ander omhulsel. Dat is geen tweede renderpad: er wordt
 * niets opnieuw getekend, alleen opnieuw verpakt.
 */
export async function kopieerAfbeelding(blob: Blob): Promise<void> {
  const beeld = await createImageBitmap(blob);
  const doek = document.createElement("canvas");
  doek.width = beeld.width;
  doek.height = beeld.height;
  doek.getContext("2d")?.drawImage(beeld, 0, 0);

  const png = await new Promise<Blob | null>((klaar) => doek.toBlob(klaar, "image/png"));
  if (!png) throw new Error("De afbeelding kon niet naar het klembord");

  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

/**
 * Het bestand naar de map Downloads (`FR-DOC-117`, B-134).
 *
 * Het adres wordt pas vrijgegeven nadat de browser de klik heeft afgehandeld. Bij
 * een blad van enkele megabytes leest hij er nog uit terwijl de regel eronder al
 * draait; intrekken op dezelfde tik levert dan een lege download op.
 */
export function downloadBestand(bestand: File): void {
  const url = URL.createObjectURL(bestand);
  const schakel = document.createElement("a");
  schakel.href = url;
  schakel.download = bestand.name;
  schakel.click();

  setTimeout(() => URL.revokeObjectURL(url), TERUGGEEFVERTRAGING_MS);
}

/** Ruim genoeg voor een blad van 2480 px, kort genoeg om niets op te hopen. */
const TERUGGEEFVERTRAGING_MS = 60_000;
