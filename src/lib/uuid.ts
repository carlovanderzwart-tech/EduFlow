/**
 * Sleutels (§8.1.3, T-11).
 *
 * Elke primaire sleutel in EduFlow is een UUID versie 7: kleine letters met
 * streepjes, 36 tekens. Nadrukkelijk niet `crypto.randomUUID()` — dat levert
 * versie 4 en mist de tijdstempel waarop de rest van het datamodel leunt.
 *
 * Drie redenen uit §8.1.3, in volgorde van gewicht. Een offline apparaat moet een
 * sleutel kunnen kiezen zonder met iets te overleggen. De eerste 48 bits zijn de
 * Unix-tijd in milliseconden, waardoor records die na elkaar ontstaan ook na
 * elkaar sorteren; dat scheelt in IndexedDB een aparte index op `createdAt` en
 * houdt de B-boom compact. En de 74 willekeurige bits daarna maken een botsing
 * tussen twee apparaten in dezelfde milliseconde verwaarloosbaar.
 *
 * §8.1.3 bepaalt daarnaast dat `newId()` maar op één plek wordt aangeroepen:
 * `StorageService`. Die service bestaat nog niet; dat is implementatiestap 4.
 */

/** UUIDv7 als kleine letters met streepjes (§8.1.5). */
export type Uuid = string;

/**
 * Herkent een UUIDv7 aan het versienibble (`7`) en de variantbits (`8`, `9`,
 * `a` of `b`), niet alleen aan de lengte. Een UUIDv4 zakt hier dus voor.
 */
export const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Wereldwijd unieke, tijdgesorteerde sleutel. Enige plek waar sleutels ontstaan.
 *
 * Dit is het algoritme uit §8.1.3, met één verschil in schrijfwijze: de Bible
 * gebruikt BigInt-literals (`40n`), en die zijn niet toegestaan bij de
 * `target: ES2017` die in `tsconfig.json` staat. `BigInt(40)` levert dezelfde
 * bytes op. Het alternatief — de compilerinstelling van het hele project
 * verhogen — valt buiten deze stap.
 */
export function newId(): Uuid {
  const ms = BigInt(Date.now());
  const masker = BigInt(0xff);
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[0] = Number((ms >> BigInt(40)) & masker);
  bytes[1] = Number((ms >> BigInt(32)) & masker);
  bytes[2] = Number((ms >> BigInt(24)) & masker);
  bytes[3] = Number((ms >> BigInt(16)) & masker);
  bytes[4] = Number((ms >> BigInt(8)) & masker);
  bytes[5] = Number(ms & masker);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70; // versie 7
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant 10
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
