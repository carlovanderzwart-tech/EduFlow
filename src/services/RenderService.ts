import type { Documentation } from "@/types/documentation";

import type { PageSize, Rect } from "./render/templates";
import { getTemplate } from "./render/templates/registry";
import { createMeasurer, fontOf, STYLES, type TextMeasurer, type TextStyle, wrap } from "./render/text";

export { createMeasurer, STYLES, type TextMeasurer, type TextStyle };

/**
 * Een documentatie omzetten naar pagina's volgens het gekozen template
 * (docs/archief/03, *Services*).
 *
 * De service valt uiteen in twee stappen die los van elkaar te begrijpen zijn:
 *
 * - `layout()` berekent wát waar staat en levert pagina's op als gewone data.
 *   Geen pixels, geen canvas, geen bestandsformaat. Daardoor is het lastigste
 *   stuk — tekst afbreken en paginabreuken bepalen — te testen zonder browser.
 * - `paint()` tekent één zo'n pagina. Dat is bewust dom werk: doorlopen en
 *   tekenen, geen beslissingen.
 *
 * Voorbeeld en export gebruiken allebei deze twee stappen. Dat is de reden dat
 * wat je in het paneel ziet niet kan afwijken van wat je exporteert (docs/archief/03:
 * *"Drie uitkomsten, één renderlaag"*).
 */

/**
 * A4 liggend op 300 dpi met 10 mm veilige marge (docs/archief/04, besluit T-03).
 *
 * 297 mm × 300 dpi ÷ 25,4 = 3508 px breed, 210 mm = 2480 px hoog, 10 mm = 118 px.
 * De inhoudsbreedte van 3272 px is precies waarom foto's op 3300 px worden
 * bewaard: een foto over de volle breedte haalt dan nog 300 dpi (besluit T-02).
 */
export const A4_LANDSCAPE_300DPI: PageSize = {
  width: 3508,
  height: 2480,
  margin: 118,
  headerHeight: 300,
};

export type RenderBlock =
  | { kind: "text" | "quote"; lines: string[]; rect: Rect; style: TextStyle }
  | { kind: "photo"; photoId: string; rect: Rect };

export interface RenderedPage {
  pageNumber: number;
  totalPages: number;
  size: PageSize;
  /** Met de reeks als voorvoegsel wanneer die is ingevuld (docs/archief/04). */
  title: string;
  /** `Leerling(en): groep geel — Kjeld, Roos`. Leeg als er niets te melden valt. */
  meta: string;
  blocks: RenderBlock[];
}

export interface RenderInput {
  document: Documentation;
  seriesName?: string;
  /** Leeg wanneer de groep is opgeruimd; die verwijzing mag doodlopen (docs/archief/02). */
  groupName?: string;
  /** Voornamen van de gekoppelde leerlingen, in de volgorde van `studentIds`. */
  studentNames?: string[];
  templateId?: string;
  size?: PageSize;
}

interface FlowLine {
  kind: "text" | "quote";
  text: string;
  style: TextStyle;
}

// ---- Kop ------------------------------------------------------------------

function buildTitle(doc: Documentation, seriesName?: string): string {
  const title = doc.title.trim() || "Zonder titel";
  const series = seriesName?.trim();
  return series ? `${series} — ${title}` : title;
}

/**
 * docs/archief/04: *"Daaronder in kleiner grijs: `Leerling(en): [groep]`. Zijn er
 * leerlingen gekoppeld, dan komen hun voornamen erachter."*
 *
 * Is de groep opgeruimd én zijn er geen leerlingen gekoppeld, dan valt de regel
 * weg. Een regel met alleen het woord "Leerling(en):" erop zegt niets.
 */
function buildMeta(groupName?: string, studentNames: string[] = []): string {
  const group = groupName?.trim();
  const names = studentNames.map((name) => name.trim()).filter(Boolean);

  if (!group && names.length === 0) return "";
  if (!group) return `Leerling(en): ${names.join(", ")}`;
  if (names.length === 0) return `Leerling(en): ${group}`;

  return `Leerling(en): ${group} — ${names.join(", ")}`;
}

// ---- Tekst ----------------------------------------------------------------

/**
 * De lopende tekst, en daarna de citaten tussen aanhalingstekens. docs/archief/04 wil ze
 * los van elkaar: *"Citaten krijgen een eigen plek in de opmaak."*
 */
function buildLines(
  doc: Documentation,
  box: Rect,
  measure: TextMeasurer,
): FlowLine[] {
  const lines: FlowLine[] = [];

  for (const paragraph of doc.text.split("\n")) {
    if (!paragraph.trim()) continue;
    for (const text of wrap(paragraph, box.width, STYLES.body, measure)) {
      lines.push({ kind: "text", text, style: STYLES.body });
    }
  }

  for (const quote of doc.quotes) {
    const text = quote.text.trim();
    if (!text) continue;
    for (const line of wrap(`“${text}”`, box.width, STYLES.quote, measure)) {
      lines.push({ kind: "quote", text: line, style: STYLES.quote });
    }
  }

  return lines;
}

/** Verdeelt regels over pagina's op werkelijke regelhoogte, niet op aantal. */
function paginate(lines: FlowLine[], boxHeight: number): FlowLine[][] {
  if (lines.length === 0) return [[]];

  const pages: FlowLine[][] = [];
  let current: FlowLine[] = [];
  let used = 0;

  for (const line of lines) {
    if (current.length > 0 && used + line.style.lineHeight > boxHeight) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(line);
    used += line.style.lineHeight;
  }

  pages.push(current);
  return pages;
}

/** Aaneengesloten regels van dezelfde soort worden één blok. */
function toBlocks(lines: FlowLine[], box: Rect): RenderBlock[] {
  const blocks: RenderBlock[] = [];
  let y = box.y;
  let index = 0;

  while (index < lines.length) {
    const { kind, style } = lines[index];
    const startY = y;
    const run: string[] = [];

    while (index < lines.length && lines[index].kind === kind) {
      run.push(lines[index].text);
      y += lines[index].style.lineHeight;
      index += 1;
    }

    blocks.push({
      kind,
      lines: run,
      style,
      rect: { x: box.x, y: startY, width: box.width, height: y - startY },
    });
  }

  return blocks;
}

// ---- Opmaak ---------------------------------------------------------------

/**
 * Verdeelt de documentatie over pagina's.
 *
 * Het aantal pagina's is het hoogste van twee dingen: hoeveel pagina's de
 * foto's nodig hebben bij dit template, en hoeveel de tekst nodig heeft. Zes
 * foto's zijn daardoor één pagina in template A en drie in template C
 * (besluit B-07).
 */
export function layout(input: RenderInput, measure: TextMeasurer): RenderedPage[] {
  const size = input.size ?? A4_LANDSCAPE_300DPI;
  const template = getTemplate(input.templateId);
  const frame = template.frame(size);

  const title = buildTitle(input.document, input.seriesName);
  const meta = buildMeta(input.groupName, input.studentNames);

  const textPages = frame.text
    ? paginate(buildLines(input.document, frame.text, measure), frame.text.height)
    : [[]];

  const photoIds = input.document.photoIds;
  const photoPages = Math.ceil(photoIds.length / template.photosPerPage);
  const totalPages = Math.max(1, textPages.length, photoPages);

  const pages: RenderedPage[] = [];

  for (let index = 0; index < totalPages; index += 1) {
    const blocks: RenderBlock[] = [];

    if (frame.text) {
      blocks.push(...toBlocks(textPages[index] ?? [], frame.text));
    }

    // Minder foto's dan het template aankan: de rest schuift op, er blijven
    // geen lege vakken staan (docs/archief/04).
    const onThisPage = photoIds.slice(
      index * template.photosPerPage,
      (index + 1) * template.photosPerPage,
    );
    onThisPage.forEach((photoId, slot) => {
      blocks.push({ kind: "photo", photoId, rect: frame.photoSlots[slot] });
    });

    pages.push({ pageNumber: index + 1, totalPages, size, title, meta, blocks });
  }

  return pages;
}

// ---- Tekenen --------------------------------------------------------------

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  style: TextStyle,
  x: number,
  y: number,
): void {
  ctx.font = fontOf(style);
  ctx.fillStyle = style.color;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    // Binnen de regelhoogte gecentreerd, zodat regels niet tegen elkaar plakken.
    const offset = (style.lineHeight - style.fontSize) / 2;
    ctx.fillText(line, x, y + index * style.lineHeight + offset);
  });
}

/** Vult het vak volledig en snijdt bij, zonder de verhouding te vervormen. */
function drawPhoto(ctx: CanvasRenderingContext2D, image: CanvasImageSource, rect: Rect): void {
  const width = "width" in image ? Number(image.width) : 0;
  const height = "height" in image ? Number(image.height) : 0;
  if (!width || !height) return;

  const scale = Math.max(rect.width / width, rect.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  ctx.drawImage(
    image,
    rect.x + (rect.width - drawWidth) / 2,
    rect.y + (rect.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  ctx.restore();
}

/**
 * Tekent één pagina op een canvas.
 *
 * `scale` bepaalt de resolutie: 1 is exportformaat, het voorbeeld gebruikt een
 * fractie daarvan. Een pagina op ware grootte is 3508 × 2480 en kost ongeveer
 * 35 MB aan geheugen; dat wil je niet voor drie miniaturen tegelijk.
 */
export function paint(
  canvas: HTMLCanvasElement,
  page: RenderedPage,
  images: Map<string, CanvasImageSource>,
  scale = 1,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = Math.round(page.size.width * scale);
  canvas.height = Math.round(page.size.height * scale);

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, page.size.width, page.size.height);

  drawLines(ctx, [page.title], STYLES.title, page.size.margin, page.size.margin);
  if (page.meta) {
    drawLines(
      ctx,
      [page.meta],
      STYLES.meta,
      page.size.margin,
      page.size.margin + STYLES.title.lineHeight,
    );
  }

  for (const block of page.blocks) {
    if (block.kind === "photo") {
      const image = images.get(block.photoId);
      if (image) drawPhoto(ctx, image, block.rect);
      continue;
    }
    drawLines(ctx, block.lines, block.style, block.rect.x, block.rect.y);
  }
}

export const RenderService = { layout, paint, createMeasurer };
