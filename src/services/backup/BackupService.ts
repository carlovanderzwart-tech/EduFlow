/**
 * Back-up maken en terugzetten (§6.5.9, §8.7, `FR-INS-28` t/m `FR-INS-32`, B-143).
 *
 * **Waarom dit het eerste is wat na de doorloop gebouwd wordt.** Alles staat in
 * IndexedDB van één browser op één apparaat. Een geleegd profiel is al het werk van
 * een schooljaar; dat is in deze doorloop twee keer gebeurd, met verzonnen namen, en
 * het viel niet eens op. Het dashboard toonde al wél een blok "Back-up maken" met een
 * knop die nergens heen ging (`FR-DAS-03`, B-02).
 *
 * **Wat erin gaat** (`FR-INS-28`): elke tabel die werk van de gebruiker draagt,
 * inclusief de foto's in alle drie de varianten. Wat er níet in gaat: de mailcache,
 * het journaal, en de AI-logboeken — zie `OVERSLAAN` hieronder.
 *
 * **Het formaat is dat van §8.7**: één zip met `manifest.json`, `data/<tabel>.json`
 * en `blobs/<hash>.<variant>.jpg`. Het manifest blijft leesbaar, de rest gaat achter
 * het wachtwoord als er een is (`FR-INS-29`).
 */

import { ongeldig, type Result } from "@/lib/result";
import { leesZip, schrijfZip, zipOmvang, ZIP_MAX_BYTES, type Bytes, type Zipbestand } from "@/lib/zip";
import {
  nieuwZout,
  ontcijfer,
  PBKDF2_RONDES,
  sha256,
  sleutelUit,
  versleutel,
} from "@/lib/versleuteling";

import {
  bestandsnaam,
  bezwaarTegen,
  FORMAATNAAM,
  FORMAATVERSIE,
  type Manifest,
} from "./manifest";
import type { Clock, StorageService } from "../storage/StorageService";
import { TABELNAMEN, type TabelNaam } from "../storage/tabellen";

/**
 * Wat er niet in de back-up gaat (`FR-INS-28`, §8.7).
 *
 * `mailMessages` is een leescache van de server en loopt na zeven dagen af (§8.8).
 * `aiInteractions` en `feedback` zijn het logboek van AI-aanroepen; §8.7 houdt ze
 * eruit vanaf een jaar oud, en sinds het AI-deel vervalt zijn ze helemaal leeg. Het
 * journaal `changeLog` hoort bij dit apparaat en niet bij het werk.
 */
const OVERSLAAN: readonly TabelNaam[] = ["mailMessages", "aiInteractions", "feedback"];

/** De tabellen die in de back-up gaan, in een vaste volgorde zodat twee bestanden vergelijkbaar zijn. */
const TABELLEN_IN_BACKUP = TABELNAMEN.filter((naam) => !OVERSLAAN.includes(naam));

/** §8.7: `blobs/<hash>.<variant>.jpg`. De hash staat op de foto, de variant op de variant. */
function blobpad(hash: string, variant: string): string {
  return `blobs/${hash}.${variant}.jpg`;
}

export interface BackupDeps {
  storage: StorageService;
  clock: Clock;
  /** Voor `manifest.appVersion`; komt uit `package.json` via `diensten.ts`. */
  appVersion: string;
  /** Voor `manifest.dbVersion`; de versie van het Dexie-schema. */
  dbVersion: number;
}

export interface Backupopdracht {
  /** Leeg betekent onversleuteld; dan staat dat ook in de bestandsnaam (`FR-INS-29`). */
  wachtwoord: string;
  /** De naam van dit apparaat, voor het manifest. */
  apparaatnaam: string;
}

export interface Backupbestand {
  manifest: Manifest;
  blob: Blob;
  naam: string;
}

/** Wat er in een gelezen back-up zit, vóór het terugzetten (`FR-INS-30`). */
export interface Gelezenbackup {
  manifest: Manifest;
  /** Per tabel de ruwe records; pas bij het terugzetten gaan ze door hun schema. */
  tabellen: Map<TabelNaam, unknown[]>;
  /** De fotobytes, op hun pad in de zip. */
  blobs: Map<string, Bytes>;
}

export type Terugzetwijze = "samenvoegen" | "vervangen";

export interface Terugzetuitkomst {
  /** Hoeveel records er zijn weggeschreven. */
  teruggezet: number;
  /** Hoeveel er zijn overgeslagen omdat wat er stond nieuwer was (`FR-INS-31`). */
  overgeslagen: number;
  /** Hoeveel er zijn verwijderd bij "alles vervangen". */
  verwijderd: number;
}

/** Wat de back-up nodig heeft om zijn werk te doen, plus een geheugen voor de hashes. */
interface Opzet {
  storage: StorageService;
  clock: Clock;
  appVersion: string;
  dbVersion: number;
  /** `photoVariants` wijst naar `photos`; dat opzoeken gebeurt per foto één keer. */
  hashes: Map<string, string>;
}

/** Alles, ook wat in de prullenbak staat: wie zijn apparaat kwijtraakt op dag 29 wil het terug. */
async function alleRijen(opzet: Opzet, tabel: TabelNaam): Promise<Result<unknown[]>> {
  const levend = await opzet.storage.list(tabel);
  if (!levend.ok) return levend;
  const weg = await opzet.storage.listDeleted(tabel);
  if (!weg.ok) return weg;
  return { ok: true, value: [...levend.value, ...weg.value] };
}

/** De hash van de foto waar deze variant bij hoort; die staat op `photos`. */
async function hashVan(opzet: Opzet, photoId: string): Promise<string | null> {
  const onthouden = opzet.hashes.get(photoId);
  if (onthouden) return onthouden;

  const foto = await opzet.storage.read("photos", photoId as never);
  const hash = foto.ok && foto.value ? foto.value.hash : null;
  if (hash) opzet.hashes.set(photoId, hash);
  return hash;
}

/** De tabellen als JSON, en de foto's als losse bestanden (§8.7). */
async function verzamel(opzet: Opzet): Promise<Result<{ delen: Zipbestand[]; manifest: Manifest }>> {
  const codeerder = new TextEncoder();
  const counts: Partial<Record<TabelNaam, number>> = {};
  const delen: Zipbestand[] = [];
  let databytes = 0;
  let blobbytes = 0;

  for (const tabel of TABELLEN_IN_BACKUP) {
    const rijen = await alleRijen(opzet, tabel);
    if (!rijen.ok) return rijen;

    counts[tabel] = rijen.value.length;

    // De foto's gaan als bestand de zip in en niet als base64 in de JSON: dat
    // scheelt een derde aan omvang, en §8.7 schrijft `blobs/` voor.
    if (tabel === "photoVariants") {
      for (const variant of rijen.value as Fotovariant[]) {
        const hash = await hashVan(opzet, variant.photoId);
        if (!hash) continue;
        const bytes = new Uint8Array(await variant.blob.arrayBuffer());
        blobbytes += bytes.length;
        delen.push({ pad: blobpad(hash, variant.variant), bytes });
      }
    }

    const schoon = tabel === "photoVariants" ? zonderBlobs(rijen.value) : rijen.value;
    const json = codeerder.encode(JSON.stringify(schoon));
    databytes += json.length;
    delen.push({ pad: `data/${tabel}.json`, bytes: kopie(json) });
  }

  const paden = kopie(codeerder.encode(delen.map((deel) => deel.pad).join("\n")));
  const manifest: Manifest = {
    format: FORMAATNAAM,
    formatVersion: FORMAATVERSIE,
    createdAt: opzet.clock.now().toISOString(),
    appVersion: opzet.appVersion,
    dbVersion: opzet.dbVersion,
    device: { id: "", name: "" },
    encryption: null,
    counts,
    bytes: { data: databytes, blobs: blobbytes },
    checksum: { algorithm: "SHA-256", value: await sha256(paden) },
  };

  return { ok: true, value: { delen, manifest } };
}

/**
 * Maakt de back-up (`FR-INS-28`, `FR-INS-29`).
 *
 * De verwijderde records gaan mee. Dat is geen slordigheid: ze staan dertig dagen in
 * de prullenbak (§8.8), en wie zijn apparaat kwijtraakt op dag negenentwintig hoort
 * ze terug te kunnen halen.
 */
async function maakBackup(opzet: Opzet, opdracht: Backupopdracht): Promise<Result<Backupbestand>> {
  const verzameld = await verzamel(opzet);
  if (!verzameld.ok) return verzameld;

  const { delen, manifest } = verzameld.value;
  manifest.device = { id: "", name: opdracht.apparaatnaam };

  const inhoud = opdracht.wachtwoord
    ? await versleutelAlles(delen, opdracht.wachtwoord, manifest)
    : delen;

  const bestanden: Zipbestand[] = [
    {
      pad: "manifest.json",
      bytes: kopie(new TextEncoder().encode(JSON.stringify(manifest, null, 2))),
    },
    ...inhoud,
  ];

  const omvang = zipOmvang(bestanden);
  if (omvang > ZIP_MAX_BYTES) {
    return ongeldig(
      `Deze back-up is ${Math.round(omvang / 1e9)} GB en past niet in één zip-bestand. Verwijder eerst oude documentaties, of wacht op de back-up in delen.`,
    );
  }

  return {
    ok: true,
    value: {
      manifest,
      blob: schrijfZip(bestanden, opzet.clock.now()),
      naam: bestandsnaam(manifest),
    },
  };
}

/**
 * Leest een back-up en controleert hem (`FR-INS-30`).
 *
 * Het manifest eerst, want daar staat of er een wachtwoord nodig is en of dit
 * formaat te lezen valt. Pas daarna gaan de gegevens open — en een verkeerd
 * wachtwoord levert hier een nette melding op, geen stapel onleesbare bytes.
 */
async function leesBackup(bestand: Blob, wachtwoord: string): Promise<Result<Gelezenbackup>> {
  let onderdelen: Zipbestand[];
  try {
    onderdelen = leesZip(new Uint8Array(await bestand.arrayBuffer()));
  } catch (fout) {
    return ongeldig(fout instanceof Error ? fout.message : "Dit bestand is niet te openen.");
  }

  const manifestdeel = onderdelen.find((deel) => deel.pad === "manifest.json");
  if (!manifestdeel) return ongeldig("Dit bestand bevat geen back-up van EduFlow.");

  let manifest: Manifest;
  try {
    manifest = JSON.parse(new TextDecoder().decode(manifestdeel.bytes)) as Manifest;
  } catch {
    return ongeldig("Het manifest van deze back-up is beschadigd.");
  }

  const bezwaar = bezwaarTegen(manifest);
  if (bezwaar) return ongeldig(bezwaar);

  if (manifest.encryption && !wachtwoord) {
    return ongeldig("Deze back-up is versleuteld. Vul het wachtwoord in waarmee hij is gemaakt.");
  }

  const sleutel = manifest.encryption
    ? await sleutelUit(wachtwoord, hexNaarBytes(manifest.encryption.salt))
    : null;

  return pakUit(onderdelen, sleutel, manifest);
}

/** De onderdelen openen en sorteren in tabellen en beeld. */
async function pakUit(
  onderdelen: readonly Zipbestand[],
  sleutel: CryptoKey | null,
  manifest: Manifest,
): Promise<Result<Gelezenbackup>> {
  const tabellen = new Map<TabelNaam, unknown[]>();
  const blobs = new Map<string, Bytes>();

  for (const deel of onderdelen) {
    if (deel.pad === "manifest.json") continue;

    let bytes = deel.bytes;
    if (sleutel) {
      try {
        bytes = await ontcijfer(sleutel, bytes);
      } catch {
        return ongeldig(
          "Dit wachtwoord opent de back-up niet. Er is geen herstelroute bij een vergeten wachtwoord.",
        );
      }
    }

    if (deel.pad.startsWith("blobs/")) {
      blobs.set(deel.pad, bytes);
      continue;
    }

    const tabel = deel.pad.replace(/^data\//u, "").replace(/\.json$/u, "") as TabelNaam;
    if (!TABELNAMEN.includes(tabel)) continue;

    try {
      tabellen.set(tabel, JSON.parse(new TextDecoder().decode(bytes)) as unknown[]);
    } catch {
      return ongeldig(`Het onderdeel ${deel.pad} van deze back-up is beschadigd.`);
    }
  }

  return { ok: true, value: { manifest, tabellen, blobs } };
}

/** Eén record, met de botsingsregel van `FR-INS-31`. Geeft terug of hij is geschreven. */
async function zetRijTerug(
  opzet: Opzet,
  tabel: TabelNaam,
  rij: unknown,
  gelezen: Gelezenbackup,
  wijze: Terugzetwijze,
): Promise<Result<boolean>> {
  const id = (rij as { id?: string }).id;
  if (!id) return { ok: true, value: false };

  if (wijze === "samenvoegen") {
    const bestaand = await opzet.storage.read(tabel, id as never);
    if (!bestaand.ok) return bestaand;

    const hier = bestaand.value?.updatedAt;
    const daar = (rij as { updatedAt?: string }).updatedAt;
    if (hier && daar && hier >= daar) return { ok: true, value: false };
  }

  // Een fotovariant draagt zijn beeld niet in de JSON maar in `blobs/`.
  const compleet =
    tabel === "photoVariants"
      ? await metBlob(opzet, rij, gelezen)
      : (rij as Record<string, unknown>);
  if (!compleet) return { ok: true, value: false };

  const geschreven = await opzet.storage.zetTerug(tabel, compleet);
  if (!geschreven.ok) return geschreven;
  return { ok: true, value: true };
}

/** Hangt het beeld weer aan de variant; zonder beeld wordt de rij overgeslagen. */
async function metBlob(
  opzet: Opzet,
  rij: unknown,
  gelezen: Gelezenbackup,
): Promise<unknown | null> {
  const variant = rij as { photoId: string; variant: string };
  const hash = await hashVan(opzet, variant.photoId);
  if (!hash) return null;

  const bytes = gelezen.blobs.get(blobpad(hash, variant.variant));
  if (!bytes) return null;

  return { ...(rij as object), blob: new Blob([bytes], { type: "image/jpeg" }) };
}

async function wisTabel(opzet: Opzet, tabel: TabelNaam): Promise<Result<number>> {
  const rijen = await alleRijen(opzet, tabel);
  if (!rijen.ok) return rijen;

  for (const rij of rijen.value) {
    const weg = await opzet.storage.purge(tabel, (rij as { id: string }).id as never);
    if (!weg.ok) return weg;
  }

  return { ok: true, value: rijen.value.length };
}

/**
 * Zet de back-up terug (`FR-INS-30`, `FR-INS-31`).
 *
 * **Samenvoegen**: per record wint de hoogste `updatedAt`. Staat er iets nieuwers,
 * dan blijft dat staan en wordt het record uit de back-up overgeslagen.
 *
 * **Alles vervangen**: wat er staat gaat er eerst uit. Het scherm vraagt daar een
 * tweede bevestiging voor waarin het huidige aantal documentaties staat, want dit is
 * de enige handeling in de app die werk weggooit dat niet in een prullenbak belandt.
 *
 * De instellingen blijven bij samenvoegen staan (§8.7): ze horen bij dit apparaat.
 */
async function zetBackupTerug(
  opzet: Opzet,
  gelezen: Gelezenbackup,
  wijze: Terugzetwijze,
): Promise<Result<Terugzetuitkomst>> {
  const uitkomst: Terugzetuitkomst = { teruggezet: 0, overgeslagen: 0, verwijderd: 0 };

  for (const tabel of TABELLEN_IN_BACKUP) {
    if (tabel === "settings" && wijze === "samenvoegen") continue;

    if (wijze === "vervangen" && tabel !== "settings") {
      const weg = await wisTabel(opzet, tabel);
      if (!weg.ok) return weg;
      uitkomst.verwijderd += weg.value;
    }

    for (const rij of gelezen.tabellen.get(tabel) ?? []) {
      const terug = await zetRijTerug(opzet, tabel, rij, gelezen, wijze);
      if (!terug.ok) return terug;
      if (terug.value) uitkomst.teruggezet += 1;
      else uitkomst.overgeslagen += 1;
    }
  }

  return { ok: true, value: uitkomst };
}

export function createBackupService(deps: BackupDeps) {
  const opzet: Opzet = { ...deps, hashes: new Map() };

  return {
    maak: (opdracht: Backupopdracht) => maakBackup(opzet, opdracht),
    lees: (bestand: Blob, wachtwoord: string) => leesBackup(bestand, wachtwoord),
    zetTerug: (gelezen: Gelezenbackup, wijze: Terugzetwijze) =>
      zetBackupTerug(opzet, gelezen, wijze),
  };
}

export type BackupService = ReturnType<typeof createBackupService>;

interface Fotovariant {
  photoId: string;
  variant: string;
  blob: Blob;
}

/** De variantrijen zonder hun beeld; dat gaat als bestand mee (§8.7). */
function zonderBlobs(rijen: readonly unknown[]): unknown[] {
  return rijen.map((rij) => {
    const rest: Record<string, unknown> = { ...(rij as Record<string, unknown>) };
    delete rest.blob;
    return rest;
  });
}

/** Versleutelt alle onderdelen behalve het manifest, en zet het zout erin (`FR-INS-29`). */
async function versleutelAlles(
  onderdelen: readonly Zipbestand[],
  wachtwoord: string,
  manifest: Manifest,
): Promise<Zipbestand[]> {
  const zout = nieuwZout();
  const sleutel = await sleutelUit(wachtwoord, zout);

  manifest.encryption = {
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_RONDES,
    salt: bytesNaarHex(zout),
  };

  const uit: Zipbestand[] = [];
  for (const deel of onderdelen) {
    uit.push({ pad: deel.pad, bytes: await versleutel(sleutel, deel.bytes) });
  }
  return uit;
}

function kopie(bytes: Uint8Array): Bytes {
  const uit = new Uint8Array(bytes.length);
  uit.set(bytes);
  return uit;
}

function bytesNaarHex(bytes: Bytes): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexNaarBytes(hex: string): Bytes {
  const uit = new Uint8Array(hex.length / 2);
  for (let n = 0; n < uit.length; n += 1) uit[n] = Number.parseInt(hex.slice(n * 2, n * 2 + 2), 16);
  return uit;
}

