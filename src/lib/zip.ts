/**
 * Een zip-bestand schrijven en lezen (§8.7).
 *
 * §8.7 schrijft één zip voor met een `manifest.json`, een map `data/` met een
 * bestand per tabel, en een map `blobs/` met de foto's. Dit is dat zip-formaat en
 * verder niets: geen domeinkennis, geen idee wat een documentatie is — gereedschap
 * dat in `lib/` hoort (§10.2).
 *
 * **Opgeslagen en niet ingepakt** (methode 0). Het leeuwendeel van een back-up is
 * beeld, en een JPEG nog eens door deflate halen levert procenten op en kost
 * seconden per foto. De JSON-bestanden zouden er wél bij winnen, maar twee methodes
 * in één schrijver is twee keer zoveel dat stuk kan.
 *
 * **Geen afhankelijkheid.** §16 vraagt bij elk pakket een reden die niet "handig"
 * is, en een opgeslagen zip is een kop, de bytes, en een inhoudsopgave achteraan.
 * Wat hier staat is te overzien; een pakket erbij is dat op termijn niet.
 */

/**
 * Bytes met een gewone `ArrayBuffer` eronder.
 *
 * `Uint8Array` alleen is sinds TypeScript 5.7 `Uint8Array<ArrayBufferLike>`, en daar
 * valt ook `SharedArrayBuffer` onder — die accepteert `Blob` niet. De vorm staat
 * hier één keer vast in plaats van bij elke aanroep met een cast te worden
 * rechtgezet.
 */
export type Bytes = Uint8Array<ArrayBuffer>;

/** Eén bestand in de zip: het pad erin en de bytes. */
export interface Zipbestand {
  pad: string;
  bytes: Bytes;
}

/**
 * De bovengrens van het oude zip-formaat.
 *
 * Boven de 4 GB is zip64 nodig, en dat is een tweede formaat met eigen velden. §8.7
 * noemt back-ups van circa 4 GB als die 212 documentaties met zes foto's bevat, dus
 * deze grens is bereikbaar. Hij wordt hier **geweigerd en niet stilzwijgend
 * overschreden**: een zip die over de rand gaat is geen foutmelding maar een bestand
 * dat niemand meer open krijgt, en dat merk je pas als je hem nodig hebt.
 */
export const ZIP_MAX_BYTES = 0xffffffff;

const LOKALE_KOP = 0x04034b50;
const MAP_KOP = 0x02014b50;
const EINDE_KOP = 0x06054b50;

/** Methode 0: opgeslagen. Versie 2.0, want meer heeft een opgeslagen zip niet nodig. */
const METHODE_OPGESLAGEN = 0;
const VERSIE = 20;

/** Bit 11: de namen staan in UTF-8. Zonder deze vlag raden lezers de codering. */
const VLAG_UTF8 = 0x0800;

const tabel = maakCrcTabel();

function maakCrcTabel(): Uint32Array {
  const uit = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let waarde = n;
    for (let bit = 0; bit < 8; bit += 1) {
      waarde = waarde & 1 ? 0xedb88320 ^ (waarde >>> 1) : waarde >>> 1;
    }
    uit[n] = waarde >>> 0;
  }
  return uit;
}

/** CRC-32 zoals de zip hem wil; elke lezer controleert hem. */
export function crc32(bytes: Bytes): number {
  let waarde = 0xffffffff;
  for (const byte of bytes) waarde = tabel[(waarde ^ byte) & 0xff]! ^ (waarde >>> 8);
  return (waarde ^ 0xffffffff) >>> 0;
}

/**
 * De tijd zoals MS-DOS hem opschreef, want dat is wat in een zip staat.
 *
 * Twee seconden nauwkeurig en vanaf 1980; dat is geen tekortkoming van deze code
 * maar van het formaat. De echte tijd staat in het manifest (§8.7).
 */
function dosTijd(moment: Date): { tijd: number; datum: number } {
  const jaar = Math.max(1980, moment.getFullYear());
  return {
    tijd: (moment.getHours() << 11) | (moment.getMinutes() << 5) | (moment.getSeconds() >> 1),
    datum: ((jaar - 1980) << 9) | ((moment.getMonth() + 1) << 5) | moment.getDate(),
  };
}

/** Schrijft de zip in één keer; de aanroeper levert de bytes al aan. */
export function schrijfZip(bestanden: readonly Zipbestand[], moment = new Date()): Blob {
  const { tijd, datum } = dosTijd(moment);
  const codeerder = new TextEncoder();

  const stukken: Bytes[] = [];
  const mapregels: Bytes[] = [];
  let plaats = 0;

  for (const bestand of bestanden) {
    const naam = naarBytes(codeerder.encode(bestand.pad));
    const som = crc32(bestand.bytes);
    const omvang = bestand.bytes.length;

    const kop = new DataView(new ArrayBuffer(30));
    kop.setUint32(0, LOKALE_KOP, true);
    kop.setUint16(4, VERSIE, true);
    kop.setUint16(6, VLAG_UTF8, true);
    kop.setUint16(8, METHODE_OPGESLAGEN, true);
    kop.setUint16(10, tijd, true);
    kop.setUint16(12, datum, true);
    kop.setUint32(14, som, true);
    kop.setUint32(18, omvang, true);
    kop.setUint32(22, omvang, true);
    kop.setUint16(26, naam.length, true);
    kop.setUint16(28, 0, true);

    const mapregel = new DataView(new ArrayBuffer(46));
    mapregel.setUint32(0, MAP_KOP, true);
    mapregel.setUint16(4, VERSIE, true);
    mapregel.setUint16(6, VERSIE, true);
    mapregel.setUint16(8, VLAG_UTF8, true);
    mapregel.setUint16(10, METHODE_OPGESLAGEN, true);
    mapregel.setUint16(12, tijd, true);
    mapregel.setUint16(14, datum, true);
    mapregel.setUint32(16, som, true);
    mapregel.setUint32(20, omvang, true);
    mapregel.setUint32(24, omvang, true);
    mapregel.setUint16(28, naam.length, true);
    mapregel.setUint32(42, plaats, true);

    stukken.push(new Uint8Array(kop.buffer), naam, bestand.bytes);
    mapregels.push(new Uint8Array(mapregel.buffer), naam);
    plaats += 30 + naam.length + omvang;
  }

  const mapbytes = mapregels.reduce((som, deel) => som + deel.length, 0);
  const einde = new DataView(new ArrayBuffer(22));
  einde.setUint32(0, EINDE_KOP, true);
  einde.setUint16(8, bestanden.length, true);
  einde.setUint16(10, bestanden.length, true);
  einde.setUint32(12, mapbytes, true);
  einde.setUint32(16, plaats, true);

  return new Blob([...stukken, ...mapregels, new Uint8Array(einde.buffer)], {
    type: "application/zip",
  });
}

/** De totale omvang vooraf, zodat de grens van §8.7 vóór het schrijven bekend is. */
/**
 * Dezelfde bytes, met de vorm die `Blob` accepteert.
 *
 * `TextEncoder.encode` belooft alleen `ArrayBufferLike`. Kopiëren is hier goedkoop —
 * het gaat om bestandsnamen — en het houdt de cast op één plek.
 */
function naarBytes(bytes: Uint8Array): Bytes {
  const uit = new Uint8Array(bytes.length);
  uit.set(bytes);
  return uit;
}

export function zipOmvang(bestanden: readonly Zipbestand[]): number {
  const codeerder = new TextEncoder();
  return bestanden.reduce((som, bestand) => {
    const naam = codeerder.encode(bestand.pad).length;
    return som + 30 + naam + bestand.bytes.length + 46 + naam;
  }, 22);
}

/**
 * Leest een zip terug.
 *
 * Via de inhoudsopgave achteraan en niet door de lokale koppen af te lopen: dat is
 * hoe een zip bedoeld is om gelezen te worden, en het is de enige manier die klopt
 * als er ooit iets vóór het eerste bestand is gezet.
 */
export function leesZip(bytes: Bytes): Zipbestand[] {
  const lezer = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eindePlaats = zoekEinde(lezer);
  if (eindePlaats === null) throw new Error("Dit is geen zip-bestand.");

  const aantal = lezer.getUint16(eindePlaats + 10, true);
  let plaats = lezer.getUint32(eindePlaats + 16, true);

  const ontcijferaar = new TextDecoder();
  const uit: Zipbestand[] = [];

  for (let n = 0; n < aantal; n += 1) {
    if (lezer.getUint32(plaats, true) !== MAP_KOP) throw new Error("De inhoudsopgave klopt niet.");

    const som = lezer.getUint32(plaats + 16, true);
    const omvang = lezer.getUint32(plaats + 24, true);
    const naamlengte = lezer.getUint16(plaats + 28, true);
    const extra = lezer.getUint16(plaats + 30, true);
    const opmerking = lezer.getUint16(plaats + 32, true);
    const lokaal = lezer.getUint32(plaats + 42, true);
    const pad = ontcijferaar.decode(bytes.subarray(plaats + 46, plaats + 46 + naamlengte));

    // De lokale kop herhaalt de naam- en extralengte, en die mogen afwijken van de
    // inhoudsopgave. Daarom wordt hij hier opnieuw gelezen in plaats van geraden.
    const lokaleNaam = lezer.getUint16(lokaal + 26, true);
    const lokaleExtra = lezer.getUint16(lokaal + 28, true);
    const begin = lokaal + 30 + lokaleNaam + lokaleExtra;
    const inhoud = bytes.slice(begin, begin + omvang);

    if (crc32(inhoud) !== som) {
      throw new Error(`Het bestand ${pad} in deze back-up is beschadigd.`);
    }

    uit.push({ pad, bytes: inhoud });
    plaats += 46 + naamlengte + extra + opmerking;
  }

  return uit;
}

/**
 * Zoekt de inhoudsopgave, vanaf het einde terug.
 *
 * De eindkop mag een opmerking van 64 kB achter zich hebben, dus de plaats ligt niet
 * vast. Terugzoeken is wat elke zip-lezer doet.
 */
function zoekEinde(lezer: DataView): number | null {
  const vroegste = Math.max(0, lezer.byteLength - 22 - 0xffff);
  for (let plaats = lezer.byteLength - 22; plaats >= vroegste; plaats -= 1) {
    if (lezer.getUint32(plaats, true) === EINDE_KOP) return plaats;
  }
  return null;
}
