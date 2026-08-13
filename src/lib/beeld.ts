/**
 * Beeldgereedschap: verkleinen en metagegevens verliezen.
 *
 * Dit is de browserkant van FR-DOC-52. Hij staat in `lib/` en niet in de service,
 * omdat hij een canvas nodig heeft en DR-12 eist dat `PhotoService` te toetsen is
 * zonder browser. De service krijgt hem als afhankelijkheid.
 *
 * **Strippen gebeurt door hertekenen, niet door filteren.** De bytes gaan door een
 * canvas en komen er als nieuwe JPEG uit. Er is geen pad waarlangs EXIF mee kan
 * komen: het canvas kent alleen pixels. Een bibliotheek die "de GPS-tags
 * verwijdert" laat staan wat hij niet kent — een fabrikantenblok met een
 * serienummer, een miniatuur waar de locatie nog wél in zit. Hertekenen laat niets
 * staan, en dat is precies wat §12.13 en B-03 vragen.
 */

/** Wat er na het hertekenen overblijft. Geen metagegevens, alleen beeld. */
export interface Hertekendbeeld {
  blob: Blob;
  width: number;
  height: number;
  /** Uit EXIF, uitgelezen vóór het hertekenen. Alleen als datumsuggestie. */
  capturedAt: string | null;
}

/** EXIF-tag `DateTimeOriginal` (§8.3.7). */
const TAG_DATETIME_ORIGINAL = 0x9003;

/**
 * Leest `DateTimeOriginal` uit een JPEG, als hij er is.
 *
 * Bewust het enige veld dat we lezen: alles wat we niet lezen, kunnen we ook niet
 * per ongeluk ergens opslaan. De datum is de enige metagegeven met een nut voor de
 * gebruiker — hij vult het datumveld voor.
 */
export function leesOpnamedatum(bytes: ArrayBuffer): string | null {
  const zicht = new DataView(bytes);
  if (zicht.byteLength < 4 || zicht.getUint16(0) !== 0xffd8) return null;

  let plaats = 2;
  while (plaats + 4 < zicht.byteLength) {
    if (zicht.getUint8(plaats) !== 0xff) return null;
    const merk = zicht.getUint8(plaats + 1);
    const lengte = zicht.getUint16(plaats + 2);

    // APP1 draagt de EXIF-structuur.
    if (merk === 0xe1 && zicht.getUint32(plaats + 4) === 0x45786966) {
      return leesUitTiff(zicht, plaats + 10);
    }
    // Vanaf de beeldgegevens zelf staat er geen EXIF meer.
    if (merk === 0xda) return null;
    plaats += 2 + lengte;
  }
  return null;
}

/** Loopt de eerste TIFF-map af en zoekt één tag. */
function leesUitTiff(zicht: DataView, begin: number): string | null {
  if (begin + 8 > zicht.byteLength) return null;

  const kleinsteEerst = zicht.getUint16(begin) === 0x4949;
  const naarIfd = zicht.getUint32(begin + 4, kleinsteEerst);
  const ifd = begin + naarIfd;
  if (ifd + 2 > zicht.byteLength) return null;

  const aantal = zicht.getUint16(ifd, kleinsteEerst);
  for (let i = 0; i < aantal; i += 1) {
    const ingang = ifd + 2 + i * 12;
    if (ingang + 12 > zicht.byteLength) return null;

    if (zicht.getUint16(ingang, kleinsteEerst) === TAG_DATETIME_ORIGINAL) {
      const naarWaarde = begin + zicht.getUint32(ingang + 8, kleinsteEerst);
      return alsIsoDatum(zicht, naarWaarde);
    }
  }
  return null;
}

/** EXIF schrijft "2026:08:13 14:05:00"; de opslag wil een tijdstip in UTC. */
function alsIsoDatum(zicht: DataView, plaats: number): string | null {
  if (plaats + 19 > zicht.byteLength) return null;

  let tekst = "";
  for (let i = 0; i < 19; i += 1) tekst += String.fromCharCode(zicht.getUint8(plaats + i));

  const deel = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(tekst);
  if (!deel) return null;

  const moment = new Date(
    `${deel[1]}-${deel[2]}-${deel[3]}T${deel[4]}:${deel[5]}:${deel[6]}.000Z`,
  );
  return Number.isNaN(moment.getTime()) ? null : moment.toISOString();
}

/** De afmetingen na verkleinen, met de verhouding intact. */
export function nieuweMaat(
  breedte: number,
  hoogte: number,
  langeZijde: number,
): { width: number; height: number } {
  const grootste = Math.max(breedte, hoogte);
  if (grootste <= langeZijde) return { width: breedte, height: hoogte };

  const factor = langeZijde / grootste;
  return {
    width: Math.max(1, Math.round(breedte * factor)),
    height: Math.max(1, Math.round(hoogte * factor)),
  };
}

/**
 * Verkleint en herteken*t*, en levert bytes zonder enige metagegeven op.
 *
 * `imageOrientation: "from-image"` laat de browser de EXIF-draaiing toepassen op
 * de pixels. Daarna is de draaiing onderdeel van het beeld en heeft niemand het
 * tagje meer nodig — wat maar goed is, want het overleeft het canvas niet.
 */
export async function hertekenViaCanvas(
  bestand: Blob,
  langeZijde: number,
  kwaliteit: number,
): Promise<Hertekendbeeld> {
  const bytes = await bestand.arrayBuffer();
  const capturedAt = bestand.type === "image/jpeg" ? leesOpnamedatum(bytes) : null;

  const beeld = await createImageBitmap(bestand, { imageOrientation: "from-image" });
  const maat = nieuweMaat(beeld.width, beeld.height, langeZijde);

  const doek = document.createElement("canvas");
  doek.width = maat.width;
  doek.height = maat.height;

  const penseel = doek.getContext("2d");
  if (!penseel) throw new Error("Deze browser kan geen afbeelding hertekenen.");
  penseel.drawImage(beeld, 0, 0, maat.width, maat.height);
  beeld.close();

  const blob = await new Promise<Blob | null>((klaar) =>
    doek.toBlob(klaar, "image/jpeg", kwaliteit),
  );
  if (!blob) throw new Error("Het verkleinen van deze foto is mislukt.");

  return { blob, width: maat.width, height: maat.height, capturedAt };
}
