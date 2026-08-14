/**
 * De renderlaag (§5.12, §10.4, FR-DOC-113).
 *
 * Eén weg van paginaplan naar beeld. Het voorbeeld in het exportpaneel en het
 * bestand dat je verstuurt komen uit dezelfde functie met alleen een andere
 * `pxPerMm`; er is geen tweede tekenpad dat uit de pas kan lopen. §5.12 wil de
 * deelbare afbeelding uit de PDF rasteren (B-27); zolang `pdf-lib` er niet is
 * (T-03, sprint 2) is dit dezelfde belofte met één stap minder — en straks krijgt
 * de PDF hetzelfde plan, niet een eigen berekening.
 *
 * **Deze service meet ook.** `LayoutService` breekt de regels met de meter die hier
 * vandaan komt, zodat de layout meet met precies de letter waarmee straks getekend
 * wordt. Meten met een andere letter dan tekenen is de stille manier waarop
 * `FR-DOC-113` alsnog scheurt.
 */

import { MM_PER_PUNT } from "../documentation/tekstzetten";
import { PAGINA, type Paginaplan } from "../documentation/LayoutService";
import type { Beeld, Doek, Doekmaker, Printstijl } from "./doek";
import { tekenVlak } from "./tekenen";

/** §5.12: 2480 × 1754 px op A4 liggend. Scherp op elk scherm, klein in een mail. */
export const EXPORT_BREEDTE_PX = 2480;
export const EXPORT_HOOGTE_PX = 1754;

/** §5.12: onder deze kwaliteit gaan tekstranden zichtbaar rafelen. */
export const JPEG_KWALITEIT = 0.88;

export interface RenderDeps<D extends Doek> {
  doek: Doekmaker<D>;
  stijl: Printstijl;
}

export interface Tekenverzoek {
  plan: Paginaplan;
  beelden: ReadonlyMap<string, Beeld>;
}

export function createRenderService<D extends Doek>(deps: RenderDeps<D>) {
  /**
   * Een doek van één pixel, alleen om te meten.
   *
   * Wordt één keer gemaakt en daarna hergebruikt: een canvas per gemeten woord is
   * bij een tekst van duizend woorden merkbaar traag.
   */
  let meetdoek: D | null = null;

  /**
   * De breedte van een stuk tekst in millimeters, met de letter van §5.10.1.
   *
   * De lettergrootte wordt in millimeters ingesteld in plaats van in pixels. Een
   * canvas rekent lineair, dus dan komt de gemeten breedte er ook in millimeters
   * uit — en hoeft er nergens een schaal doorheen die een afrondingsverschil tussen
   * meten en tekenen kan opleveren.
   */
  function meet(tekst: string, punt: number, gewicht: number): number {
    meetdoek ??= deps.doek(1, 1);
    const grootteInMm = punt * MM_PER_PUNT;
    meetdoek.context.font = `${gewicht} ${grootteInMm}px ${deps.stijl.familie}`;
    return meetdoek.context.measureText(tekst).width;
  }

  /**
   * Tekent één pagina op een doek van de gevraagde breedte.
   *
   * De hoogte volgt uit de paginaverhouding: A4 liggend is vast (T-13) en een doek
   * met een andere verhouding zou de layout uitrekken.
   */
  function tekenOpDoek(verzoek: Tekenverzoek, breedtePx: number) {
    const pxPerMm = breedtePx / PAGINA.breedte;
    const doek = deps.doek(breedtePx, Math.round(PAGINA.hoogte * pxPerMm));

    doek.context.fillStyle = deps.stijl.papier;
    doek.context.fillRect(0, 0, doek.breedte, doek.hoogte);

    for (const vlak of verzoek.plan.vlakken) {
      tekenVlak(vlak, { ctx: doek.context, pxPerMm, stijl: deps.stijl, beelden: verzoek.beelden });
    }

    return doek;
  }

  /** Het voorbeeld in het paneel: hetzelfde plan, kleiner (FR-DOC-113). */
  function voorbeeld(verzoek: Tekenverzoek, breedtePx: number) {
    return tekenOpDoek(verzoek, breedtePx);
  }

  /** De deelbare afbeelding: hetzelfde plan, op ware grootte (§5.12). */
  async function jpeg(verzoek: Tekenverzoek): Promise<Blob> {
    return tekenOpDoek(verzoek, EXPORT_BREEDTE_PX).naarJpeg(JPEG_KWALITEIT);
  }

  return { meet, voorbeeld, jpeg };
}

export type RenderService = ReturnType<typeof createRenderService>;

/**
 * De bestandsnaam uit §5.12: `2026-10-13 Kunstwerk Dok 2 - pagina 1 van 3.jpg`.
 *
 * Terug te vinden in een fotorol, en dat is de hele reden dat hij zo lang is. Wat
 * niet in een bestandsnaam mag, gaat eruit — een schuine streep in een titel maakt
 * anders stilzwijgend een map aan.
 */
export function bestandsnaam(datum: string, titel: string, nummer: number, vanAantal: number): string {
  const schoon = titel.replace(/[\\/:*?"<>|]/gu, " ").replace(/\s+/gu, " ").trim();
  const kern = schoon ? `${datum} ${schoon}` : datum;
  return `${kern} - pagina ${nummer} van ${vanAantal}.jpg`;
}
