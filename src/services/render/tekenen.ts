/**
 * Inkt op het doek (§5.10, §5.11, §5.12).
 *
 * Elke functie hier krijgt één vlak uit het paginaplan en zet het neer. Er wordt
 * niets besloten: waar de regels breken en waar een foto komt, is in `LayoutService`
 * al bepaald. Dat is de scheiding waar `FR-DOC-113` op rust — het voorbeeld en de
 * export lopen door precies deze functies, alleen met een andere `pxPerMm`.
 */

import { MM_PER_PUNT } from "../documentation/tekstzetten";
import { PRINTLETTER, REEKS_SPATIERING, type Kader, type Vlak } from "../documentation/LayoutService";
import type { Beeld, Printstijl, Tekencontext } from "./doek";

/** §5.11: boven dit verschil in verhouding wordt een foto fors bijgesneden. */
export const FORS_BIJSNIJDEN = 1.8;

/** §5.11: benodigde pixels voor 300 dpi = breedte in mm × 11,81. */
export const PIXELS_PER_MM_300DPI = 11.81;

/** Millimeters per inch; nodig om pixels naar dpi te vertalen. */
const MM_PER_INCH = 25.4;

export interface Tekenopdracht {
  ctx: Tekencontext;
  /** De schaal: hoeveel pixels één millimeter is. */
  pxPerMm: number;
  stijl: Printstijl;
  /** De ingelezen foto's, op sleutel. Ontbreekt er een, dan blijft het vlak leeg. */
  beelden: ReadonlyMap<string, Beeld>;
}

/** De canvas-`font`-tekenreeks voor een rol uit §5.10.1. */
function letter(rol: { punt: number; gewicht: number }, opdracht: Tekenopdracht): string {
  const px = rol.punt * MM_PER_PUNT * opdracht.pxPerMm;
  return `${rol.gewicht} ${px}px ${opdracht.stijl.familie}`;
}

/**
 * De uitsnede voor een foto in een slot (§5.11).
 *
 * Gecentreerd bijsnijden, niet vervormen en geen witruimte toevoegen. Dat is de
 * enige keuze die er altijd redelijk uitziet zonder de gebruiker iets te vragen.
 */
export function uitsnede(beeld: Beeld, kader: Kader) {
  const doel = kader.breedte / kader.hoogte;
  const bron = beeld.breedte / beeld.hoogte;

  const sBreedte = bron > doel ? beeld.hoogte * doel : beeld.breedte;
  const sHoogte = bron > doel ? beeld.hoogte : beeld.breedte / doel;

  return {
    sx: (beeld.breedte - sBreedte) / 2,
    sy: (beeld.hoogte - sHoogte) / 2,
    sBreedte,
    sHoogte,
  };
}

/** §5.11: staat de foto veel schever dan het slot, dan meldt het paneel dat. */
export function wordtForsBijgesneden(beeld: Beeld, kader: Kader): boolean {
  const verhouding = beeld.breedte / beeld.hoogte / (kader.breedte / kader.hoogte);
  return verhouding > FORS_BIJSNIJDEN || verhouding < 1 / FORS_BIJSNIJDEN;
}

/** §5.11: de haalbare resolutie van een foto op deze plek, in dpi. */
export function haalbareDpi(beeld: Beeld, kader: Kader): number {
  return Math.round((beeld.breedte / kader.breedte) * MM_PER_INCH);
}

/** §5.11: haalt de foto de 300 dpi niet, dan meldt het paneel wat hij wél haalt. */
export function haaltPrintkwaliteit(beeld: Beeld, kader: Kader): boolean {
  return beeld.breedte >= kader.breedte * PIXELS_PER_MM_300DPI;
}

function tekenKop(vlak: Extract<Vlak, { soort: "kop" }>, opdracht: Tekenopdracht) {
  const { ctx, pxPerMm, stijl } = opdracht;
  const x = vlak.kader.x * pxPerMm;
  const basis = (vlak.kader.y + PRINTLETTER.reeks.regelhoogte * MM_PER_PUNT * 0.8) * pxPerMm;

  ctx.fillStyle = stijl.gedempt;
  ctx.textAlign = "left";
  if (vlak.reeks) {
    ctx.font = letter(PRINTLETTER.reeks, opdracht);
    ctx.letterSpacing = `${REEKS_SPATIERING}em`;
    ctx.fillText(vlak.reeks.toUpperCase(), x, basis);
    ctx.letterSpacing = "0px";
  }

  ctx.font = letter(PRINTLETTER.datum, opdracht);
  ctx.textAlign = "right";
  ctx.fillText(vlak.datum, (vlak.kader.x + vlak.kader.breedte) * pxPerMm, basis);

  ctx.fillStyle = stijl.inkt;
  ctx.font = letter(PRINTLETTER.titel, opdracht);
  ctx.textAlign = "left";
  for (const regel of vlak.titel) {
    ctx.fillText(regel.tekst, x, (vlak.kader.y + regel.y) * pxPerMm);
  }
}

function tekenFoto(vlak: Extract<Vlak, { soort: "foto" }>, opdracht: Tekenopdracht) {
  const beeld = opdracht.beelden.get(vlak.photoId);
  if (!beeld) return;

  const { ctx, pxPerMm } = opdracht;
  const { sx, sy, sBreedte, sHoogte } = uitsnede(beeld, vlak.kader);
  const bijschrift = vlak.bijschrift ? PRINTLETTER.bijschrift.regelhoogte * MM_PER_PUNT : 0;
  const hoogte = vlak.kader.hoogte - bijschrift;

  ctx.drawImage(
    beeld.bron,
    sx,
    sy,
    sBreedte,
    sHoogte,
    vlak.kader.x * pxPerMm,
    vlak.kader.y * pxPerMm,
    vlak.kader.breedte * pxPerMm,
    hoogte * pxPerMm,
  );

  // §5.10.1: het bijschrift staat er alleen als er een alternatieve tekst is.
  if (!vlak.bijschrift) return;
  ctx.fillStyle = opdracht.stijl.gedempt;
  ctx.font = letter(PRINTLETTER.bijschrift, opdracht);
  ctx.textAlign = "left";
  ctx.fillText(vlak.bijschrift, vlak.kader.x * pxPerMm, (vlak.kader.y + vlak.kader.hoogte) * pxPerMm);
}

function tekenTekst(vlak: Extract<Vlak, { soort: "tekst" }>, opdracht: Tekenopdracht) {
  const { ctx, pxPerMm } = opdracht;
  ctx.fillStyle = opdracht.stijl.inkt;
  ctx.font = letter(PRINTLETTER.tekst, opdracht);
  ctx.textAlign = "left";
  for (const regel of vlak.regels) {
    ctx.fillText(regel.tekst, vlak.kader.x * pxPerMm, (vlak.kader.y + regel.y) * pxPerMm);
  }
}

function tekenVoet(vlak: Extract<Vlak, { soort: "voettekst" }>, opdracht: Tekenopdracht) {
  const { ctx, pxPerMm } = opdracht;
  const basis = (vlak.kader.y + PRINTLETTER.voettekst.regelhoogte * MM_PER_PUNT * 0.8) * pxPerMm;

  ctx.fillStyle = opdracht.stijl.gedempt;
  ctx.font = letter(PRINTLETTER.voettekst, opdracht);
  ctx.textAlign = "left";
  ctx.fillText(vlak.links, vlak.kader.x * pxPerMm, basis);
  ctx.textAlign = "right";
  ctx.fillText(vlak.rechts, (vlak.kader.x + vlak.kader.breedte) * pxPerMm, basis);
}

function tekenLegenda(vlak: Extract<Vlak, { soort: "legenda" }>, opdracht: Tekenopdracht) {
  const { ctx, pxPerMm } = opdracht;
  ctx.fillStyle = opdracht.stijl.gedempt;
  ctx.font = letter(PRINTLETTER.voettekst, opdracht);
  ctx.textAlign = "left";
  ctx.fillText(
    vlak.tekst,
    vlak.kader.x * pxPerMm,
    (vlak.kader.y + PRINTLETTER.voettekst.regelhoogte * MM_PER_PUNT * 0.8) * pxPerMm,
  );
}

/** Zet één vlak neer. De volgorde van de vlakken bepaalt wat bovenop komt. */
export function tekenVlak(vlak: Vlak, opdracht: Tekenopdracht) {
  opdracht.ctx.save();
  if (vlak.soort === "kop") tekenKop(vlak, opdracht);
  if (vlak.soort === "foto") tekenFoto(vlak, opdracht);
  if (vlak.soort === "tekst") tekenTekst(vlak, opdracht);
  if (vlak.soort === "voettekst") tekenVoet(vlak, opdracht);
  if (vlak.soort === "legenda") tekenLegenda(vlak, opdracht);
  opdracht.ctx.restore();
}
