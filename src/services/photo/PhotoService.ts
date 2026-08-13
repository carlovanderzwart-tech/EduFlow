/**
 * Foto's (§10.4, §8.3.7, §9.5.2).
 *
 * **Een foto verlaat dit apparaat niet** (B-03, DR-32). Deze service slaat hem op,
 * verkleint hem en ontdoet hem van alles wat erin verstopt zit; hij kent geen
 * netwerk en geen AI, en dat is geen toeval maar de belofte waar §6.1 op rust.
 *
 * **Het strippen van EXIF gebeurt niet met een filter maar door hertekenen**
 * (FR-DOC-52). De bytes gaan door een canvas en komen er als nieuwe JPEG uit. Wat
 * er aan metagegevens in zat — GPS, apparaat, serienummer, gezichten — bestaat in
 * de uitvoer niet meer, want er is geen pad waarlangs het mee kan komen. Een
 * bibliotheek die "de GPS-tags verwijdert" laat alles staan wat hij niet kent; dit
 * laat niets staan.
 *
 * `DateTimeOriginal` wordt vóór het hertekenen uitgelezen en apart teruggegeven,
 * puur als **datumsuggestie** voor het schrijfscherm (§8.3.7). Hij gaat niet mee de
 * afbeelding in.
 *
 * **Eén variant in de doorloop.** §8.3.7 en INV-18 willen er drie — `thumb`,
 * `screen` en `print` — maar werkopdracht D05 zegt uitdrukkelijk: "Eén variant in de
 * doorloop; de drie varianten komen in sprint 1." Er wordt dus alleen `print`
 * gemaakt, op 3300 px (T-02). Dat is een bewuste afwijking van INV-18 en geen
 * vergetelheid; hij staat hier zodat de volgende die dit leest niet gaat zoeken.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Photo } from "@/domain/types";

import type { StorageService } from "../storage/StorageService";

/** T-02: 3300 px op de lange zijde. Genoeg voor A4 op 300 dpi. */
export const LANGE_ZIJDE_PX = 3300;

/** §8.3.7: JPEG, kwaliteit 88. */
const JPEG_KWALITEIT = 0.88;

/** FR-DOC-45: een documentatie bevat nooit meer dan twintig foto's. */
export const MAX_FOTOS = 20;

/** Wat een browser aankan én wat wij eruit kunnen hertekenen. */
const TOEGESTAAN = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export interface PhotoDeps {
  storage: StorageService;
  /** Geïnjecteerd, want DR-12 wil deze laag toetsbaar zonder browser. */
  tekenen: Hertekenaar;
}

/** Het resultaat van hertekenen: nieuwe bytes, zonder enige metagegeven. */
export interface Hertekend {
  blob: Blob;
  width: number;
  height: number;
  /** Uit EXIF, vóór het hertekenen. Alleen als datumsuggestie (§8.3.7). */
  capturedAt: string | null;
}

export type Hertekenaar = (bestand: Blob, langeZijde: number, kwaliteit: number) =>
  Promise<Hertekend>;

export interface Toegevoegd {
  foto: Photo;
  /** De suggestie voor het datumveld; het scherm beslist of het hem gebruikt. */
  datumsuggestie: string | null;
  /** `true` als deze foto er al was; dan is er niets bij geschreven (FR-INS-31). */
  bestondAl: boolean;
}

/** SHA-256 over de **oorspronkelijke** bytes, zodat dubbelen herkenbaar blijven. */
async function hashVan(bestand: Blob): Promise<string> {
  const ruw = await crypto.subtle.digest("SHA-256", await bestand.arrayBuffer());
  return [...new Uint8Array(ruw)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createPhotoService(deps: PhotoDeps) {
  /**
   * Neemt een bestand op (FR-DOC-41).
   *
   * Alle vier de wegen — bestandskiezer, slepen, plakken en camera — komen hier
   * uit. Dat is wat FR-DOC-41 met "leiden alle vier tot dezelfde verwerking"
   * bedoelt: er is één functie, dus er is geen weg waarlangs een foto met zijn
   * GPS er alsnog in glipt.
   */
  async function voegToe(bestand: Blob): Promise<Result<Toegevoegd>> {
    if (!TOEGESTAAN.includes(bestand.type)) {
      return ongeldig(
        "Dit bestand is geen foto die de app kan verwerken. Kies een JPEG, PNG of HEIC.",
      );
    }

    const hash = await hashVan(bestand);

    // Dezelfde foto twee keer opslaan is twee keer de ruimte voor één beeld.
    const bestaande = await deps.storage.list("photos");
    if (!bestaande.ok) return bestaande;

    const alBekend = bestaande.value.find((foto) => foto.hash === hash);
    if (alBekend) {
      return { ok: true, value: { foto: alBekend, datumsuggestie: null, bestondAl: true } };
    }

    const hertekend = await deps.tekenen(bestand, LANGE_ZIJDE_PX, JPEG_KWALITEIT);

    return deps.storage.schrijfAggregaat("photos", ["photoVariants"], async (schrijver) => {
      const foto = await schrijver.maak("photos", {
        width: hertekend.width,
        height: hertekend.height,
        bytes: hertekend.blob.size,
        hash,
        capturedAt: hertekend.capturedAt,
        // Al toegepast bij het hertekenen; hier alleen ter informatie (§8.3.7).
        orientation: 1,
        refCount: 0,
      });

      await schrijver.maak("photoVariants", {
        photoId: foto.id,
        variant: "print",
        blob: hertekend.blob,
        bytes: hertekend.blob.size,
      });

      return { foto, datumsuggestie: hertekend.capturedAt, bestondAl: false };
    });
  }

  /** De bytes van één foto, om hem te tonen. */
  async function blobVan(photoId: Uuid): Promise<Result<Blob | null>> {
    const varianten = await deps.storage.list("photoVariants");
    if (!varianten.ok) return varianten;

    const variant = varianten.value.find((rij) => rij.photoId === photoId);
    return { ok: true, value: variant?.blob ?? null };
  }

  /** Verwijderen is markeren (§8.1.6); de opruimronde van §8.8 ruimt de bytes op. */
  function verwijder(photoId: Uuid): Promise<Result<Photo>> {
    return deps.storage.softDelete("photos", photoId);
  }

  return { voegToe, blobVan, verwijder };
}

export type PhotoService = ReturnType<typeof createPhotoService>;
