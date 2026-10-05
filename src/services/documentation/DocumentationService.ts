/**
 * Documentaties (§10.4, §6.1.1, §9.4.1).
 *
 * De wortel van het grootste aggregaat: een documentatie met haar pagina's en de
 * blokken daarin. Wie een pagina wil wijzigen, gaat langs deze service — er is
 * geen andere schrijver van `pages` (§9.4 regel A, DR-14).
 *
 * **Deze eerste versie schrijft één tekstblok op één pagina.** Dat is met opzet
 * het kleinste dat werkt: pagina's toevoegen, herordenen en de overloop naar een
 * vervolgpagina horen bij `PageService` en `LayoutService` (§10.4), en die bestaan
 * nog niet. Wat hier staat is niets wat straks weer moet weg — het is de eerste
 * pagina, met de layout die INV-22 voorschrijft.
 *
 * **Het werk staat in drie buren.** `schrijven.ts` draagt het aggregaatpad — maken,
 * bewaren, openen — `blokken.ts` de omzetting tussen tekst en blokken, en
 * `verwijderen.ts` plus `archiveren.ts` de twee manieren om iets uit beeld te halen.
 * Wat hier overblijft zijn de kleine leesacties en de bedrading. Dat is wat deze
 * fabriek van 161 regels onder de zestig van DR-53 bracht.
 */

import { toIsoDateTime, type IsoDate } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Documentation, Page } from "@/domain/types";

import type { Clock, StorageService } from "../storage/StorageService";
import { archiveer, haalUitArchief } from "./archiveren";
import { isFotoblok, isTekstblok } from "./blokken";
import { bewaar, maak, open } from "./schrijven";
import { maakDocumentatieprullenbak } from "./verwijderen";

export { MAX_TEKST, WAARSCHUW_VANAF } from "./blokken";

export interface DocumentationDeps {
  storage: StorageService;
  clock: Clock;
}

/** Wat het schrijfscherm invult. De rest leidt de service af. */
export interface Documentatieinvoer {
  title: string;
  date: IsoDate;
  studentIds: Uuid[];
  /** Hoogstens één reeks, als verwijzing — nooit in de titel (INV-19, FR-DOC-05). */
  seriesId?: Uuid | null;
  /** Nul of meer groepen, náást de leerlingen (FR-DOC-06). */
  groupIds?: Uuid[];
  /** De lopende tekst. Belandt als tekstblok(ken) op de eerste pagina. */
  text: string;
  /** Nooit in een export, nooit naar AI (FR-DOC-08, §8.3.5). */
  privateNote?: string;
  /** De foto's, in de volgorde waarin ze staan (FR-DOC-46). */
  photoIds?: Uuid[];
}

/** Een documentatie met haar pagina's: het hele aggregaat in één keer (§9.4.1). */
export interface GeopendeDocumentatie {
  documentatie: Documentation;
  paginas: Page[];
}

export function createDocumentationService(deps: DocumentationDeps) {
  const { storage } = deps;

  /**
   * Legt de toestemming beeldgebruik vast (FR-DOC-115, B-08).
   *
   * Eén keer per documentatie, niet één keer ooit: de vraag hoort bij deze foto's
   * van deze kinderen. Een tweede keer vragen bij dezelfde documentatie is ruis;
   * niet meer vragen bij de volgende is een belofte die niemand heeft gedaan.
   */
  async function geefBeeldtoestemming(id: Uuid): Promise<Result<Documentation>> {
    return storage.update("documentations", id, {
      imageConsentAt: toIsoDateTime(deps.clock.now()),
    });
  }

  /**
   * Zet de status op *gedeeld* na een geslaagde export (FR-DOC-118, B-05, B-13).
   *
   * `firstExportedAt` draagt de status (INV-15) en wordt daarom maar één keer gezet:
   * de datum van de **eerste** export blijft staan, ook als je hem later nog eens
   * verstuurt. Bij een mislukte export wordt deze functie niet aangeroepen, en dan
   * verandert er niets — dat is `FR-DOC-119`.
   */
  async function markeerGedeeld(id: Uuid): Promise<Result<Documentation>> {
    const huidig = await storage.read("documentations", id);
    if (!huidig.ok) return huidig;
    if (!huidig.value) return ongeldig("Deze documentatie bestaat niet meer.");

    return storage.update("documentations", id, {
      status: "gedeeld",
      firstExportedAt: huidig.value.firstExportedAt ?? toIsoDateTime(deps.clock.now()),
    });
  }

  /** Nieuwste eerst, want dat is waar je verder werkt (§6.1.2). */
  async function lijst(): Promise<Result<Documentation[]>> {
    const uitkomst = await storage.list("documentations");
    if (!uitkomst.ok) return uitkomst;

    return {
      ok: true,
      value: [...uitkomst.value].sort(
        (a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt),
      ),
    };
  }

  /**
   * De lopende tekst: alle tekstblokken van de eerste pagina, weer aaneen.
   *
   * Zonder scheidingsteken, want zo is hij ook geknipt. Wat je terugkrijgt is
   * teken voor teken wat je intypte.
   */
  function tekstVan(geopend: GeopendeDocumentatie): string {
    return (geopend.paginas[0]?.blocks ?? [])
      .filter(isTekstblok)
      .sort((a, b) => a.order - b.order)
      .map((blok) => blok.text)
      .join("");
  }

  /** De foto's van een documentatie, in de volgorde waarin ze staan (FR-DOC-46). */
  function fotosVan(geopend: GeopendeDocumentatie): Uuid[] {
    return (geopend.paginas[0]?.blocks ?? [])
      .filter(isFotoblok)
      .sort((a, b) => a.order - b.order)
      .map((blok) => blok.photoId);
  }

  return {
    maak: (invoer: Documentatieinvoer) => maak(storage, deps.clock, invoer),
    bewaar: (id: Uuid, invoer: Documentatieinvoer) => bewaar(storage, deps.clock, id, invoer),
    open: (id: Uuid) => open(storage, id),
    lijst,
    tekstVan,
    fotosVan,
    geefBeeldtoestemming,
    markeerGedeeld,
    // De prullenbak staat in `verwijderen.ts` en `../prullenbak.ts` (B-135,
    // B-138): dit bestand zat al tegen de 400 regels van DR-53, en een groep en
    // een reeks gebruiken hetzelfde werk. Een scherm hoeft maar één plek te kennen.
    ...maakDocumentatieprullenbak(storage, deps.clock),
    // Archiveren staat in `archiveren.ts` (B-144): het is geen status maar een
    // datum, en het hoort bij hetzelfde onderwerp als de prullenbak — uit beeld.
    archiveer: (id: Uuid) => archiveer(storage, deps.clock, id),
    haalUitArchief: (id: Uuid) => haalUitArchief(storage, id),
  };
}

export type DocumentationService = ReturnType<typeof createDocumentationService>;
