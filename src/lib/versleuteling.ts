/**
 * Versleutelen met een wachtwoord (§8.7, `FR-INS-29`).
 *
 * §8.7 noemt de getallen: PBKDF2-SHA256 met 600.000 rondes, een willekeurig zout
 * van 16 bytes, en AES-GCM met een eigen initialisatievector per bestand. Elk
 * bestand afzonderlijk, *"zodat terugzetten in stappen kan zonder alles in het
 * geheugen te laden"*.
 *
 * Alles via WebCrypto. Er is geen pakket voor, en dat is geen bezuiniging: een
 * eigen implementatie van AES of PBKDF2 is precies het soort code dat er goed
 * uitziet en stil fout is.
 *
 * **Er is geen herstelroute bij een vergeten wachtwoord** (`FR-INS-29`). Dat is
 * geen tekortkoming maar de bedoeling: een achterdeur voor de maker is een
 * achterdeur voor iedereen.
 */

import type { Bytes } from "./zip";

/** §8.7: 600.000 rondes. Genoeg om raden duur te maken, kort genoeg om te wachten. */
export const PBKDF2_RONDES = 600_000;

/** §8.7: zestien bytes zout, één keer per back-up. */
export const ZOUT_BYTES = 16;

/** AES-GCM wil twaalf bytes; langer maakt het niet veiliger, korter wel onveiliger. */
const IV_BYTES = 12;

/**
 * Maakt een sleutel uit een wachtwoord.
 *
 * Het zout staat in het manifest, want zonder zout is er niets terug te zetten. Dat
 * is veilig: een zout is geen geheim, het zorgt er alleen voor dat twee back-ups met
 * hetzelfde wachtwoord niet dezelfde sleutel krijgen.
 */
export async function sleutelUit(wachtwoord: string, zout: Bytes): Promise<CryptoKey> {
  const basis = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(wachtwoord),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: zout as BufferSource, iterations: PBKDF2_RONDES, hash: "SHA-256" },
    basis,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function nieuwZout(): Bytes {
  return crypto.getRandomValues(new Uint8Array(ZOUT_BYTES));
}

/**
 * Versleutelt één bestand: de initialisatievector voorop, de versleutelde bytes erna.
 *
 * Voorop en niet in het manifest, zodat een bestand op zichzelf te ontcijferen is.
 * Een vector hergebruiken over twee bestanden breekt AES-GCM volledig; daarom krijgt
 * elk bestand een eigen verse.
 */
export async function versleutel(sleutel: CryptoKey, bytes: Bytes): Promise<Bytes> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const gesloten = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    sleutel,
    bytes as BufferSource,
  );

  const uit = new Uint8Array(IV_BYTES + gesloten.byteLength);
  uit.set(iv, 0);
  uit.set(new Uint8Array(gesloten), IV_BYTES);
  return uit;
}

/**
 * Ontcijfert wat `versleutel` maakte.
 *
 * Een verkeerd wachtwoord levert hier een fout op en geen onzin: AES-GCM draagt een
 * controlegetal, dus er komt niets terug wat op gegevens lijkt maar het niet is.
 */
export async function ontcijfer(sleutel: CryptoKey, bytes: Bytes): Promise<Bytes> {
  const iv = bytes.subarray(0, IV_BYTES);
  const rest = bytes.subarray(IV_BYTES);

  const open = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    sleutel,
    rest as BufferSource,
  );
  return new Uint8Array(open);
}

/** De controlesom uit het manifest (§8.7), over de onversleutelde gegevens. */
export async function sha256(bytes: Bytes): Promise<string> {
  const som = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(som)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
