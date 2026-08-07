import type { Quote } from "@/types/documentation";
import { formatAgeShort } from "@/utils/age";

import type { PageSize, Rect } from "./render/templates";
import { getTemplate } from "./render/templates/registry";
import { createMeasurer, fontOf, STYLES, type TextMeasurer, type TextStyle, wrap } from "./render/text";

export { createMeasurer, STYLES, type TextMeasurer, type TextStyle };

/**
 * Een documentatie omzetten naar pagina's volgens het gekozen template
 * (doc 03, *Services*).
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
 * wat je in het paneel ziet niet kan afwijken van wat je exporteert (doc 03:
 * *"Drie uitkomsten, één renderlaag"*).
 */

/**
 * A4 liggend op 300 dpi met 10 mm veilige marge (doc 04, besluit T-03).
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
  /** Met de reeks als voorvoegsel wanneer die is ingevuld (doc 04). */
  title: string;
  /** `Groep: Geel | Leerlingen: Geert (2,1)`. Leeg als er niets te melden valt. */
  meta: string;
  blocks: RenderBlock[];
}

/** Een gekoppelde leerling zoals de kop hem toont. */
export interface RenderStudent {
  name: string;
  /** `YYYY-MM-DD`. Ontbreekt hij, dan komt er geen leeftijd achter de naam. */
  dateOfBirth?: string;
}

/**
 * De inhoud van één pagina.
 *
 * Dit is de vorm waar de documentatie in fase 2 uit gaat bestaan: eigen tekst,
 * eigen citaten, eigen foto's en een eigen template per pagina. Vandaag levert
 * de aanroeper er precies één, opgebouwd uit de documentvelden. `layout()`
 * loopt er hoe dan ook overheen, dus fase 2 vult alleen de lijst voller.
 */
export interface PageContent {
  templateId?: string;
  text: string;
  quotes: Quote[];
  photoIds: string[];
}

export interface RenderInput {
  title: string;
  seriesName?: string;
  /**
   * Namen van de groepen, ongesorteerd. Leeg wanneer de groep is opgeruimd;
   * die verwijzing mag doodlopen (doc 02).
   */
  groupNames?: string[];
  /** De gekoppelde leerlingen, ongesorteerd. */
  students?: RenderStudent[];
  pages: PageContent[];
  size?: PageSize;
}

interface FlowLine {
  kind: "text" | "quote";
  text: string;
  style: TextStyle;
}

// ---- Kop ------------------------------------------------------------------

function buildTitle(title: string, seriesName?: string): string {
  const trimmed = title.trim() || "Zonder titel";
  const series = seriesName?.trim();
  return series ? `${series} — ${trimmed}` : trimmed;
}

/**
 * Groepen heten in de app "groep geel", en de kop zegt zelf al "Groep:". Het
 * voorvoegsel eraf halen voorkomt "Groep: groep geel".
 *
 * Aanname: alleen een letterlijk voorvoegsel "groep " wordt weggehaald. Een
 * groep die "3A" of "Grijs" heet blijft ongemoeid.
 */
function groupLabel(name: string): string {
  const trimmed = name.trim().replace(/^groep\s+/i, "");
  if (!trimmed) return "";
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

/** "Geert (2,1)", of alleen "Geert" wanneer de geboortedatum ontbreekt. */
function studentLabel(student: RenderStudent): string {
  const name = student.name.trim();
  const age = formatAgeShort(student.dateOfBirth);
  return age ? `${name} (${age})` : name;
}

/**
 * De kopregel onder de titel: `Groep: Grijs & Geel | Leerlingen: Geert (2,1)`.
 *
 * Groepen en leerlingen staan allebei alfabetisch, zodat dezelfde documentatie
 * er twee keer hetzelfde uitziet, ongeacht de volgorde waarin er is gekoppeld.
 *
 * Elke helft valt weg zodra hij leeg is, inclusief het scheidingsteken. Een
 * regel met alleen "Groep:" erop zegt niets.
 */
function buildMeta(groupNames: string[] = [], students: RenderStudent[] = []): string {
  const groups = groupNames
    .map(groupLabel)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "nl"));

  const leerlingen = students
    .filter((student) => student.name.trim())
    .sort((a, b) => a.name.trim().localeCompare(b.name.trim(), "nl"))
    .map(studentLabel);

  const delen: string[] = [];
  if (groups.length > 0) delen.push(`Groep: ${groups.join(" & ")}`);
  if (leerlingen.length > 0) delen.push(`Leerlingen: ${leerlingen.join(", ")}`);

  return delen.join(" | ");
}

// ---- Tekst ----------------------------------------------------------------

/**
 * De lopende tekst, en daarna de citaten tussen aanhalingstekens. Doc 04 wil ze
 * los van elkaar: *"Citaten krijgen een eigen plek in de opmaak."*
 */
function buildLines(
  content: PageContent,
  box: Rect,
  measure: TextMeasurer,
): FlowLine[] {
  const lines: FlowLine[] = [];

  for (const paragraph of content.text.split("\n")) {
    if (!paragraph.trim()) continue;
    for (const text of wrap(paragraph, box.width, STYLES.body, measure)) {
      lines.push({ kind: "text", text, style: STYLES.body });
    }
  }

  for (const quote of content.quotes) {
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

/** De pagina's die één `PageContent` oplevert, nog zonder doorlopende nummering. */
function layoutPage(
  content: PageContent,
  size: PageSize,
  measure: TextMeasurer,
): RenderBlock[][] {
  const template = getTemplate(content.templateId);
  const photoIds = content.photoIds;

  // Hoeveel vellen de foto's nodig hebben bij dit template (besluit B-07).
  const photoSheets = Math.ceil(photoIds.length / template.photosPerPage);

  // De tekst wordt gemeten tegen het tekstvak van een volle pagina. Bij een
  // wisselend fotoraster blijft dat vak gelijk, dus dat mag één keer.
  const textBox = template.frame(size, template.photosPerPage).text;
  const textSheets = textBox
    ? paginate(buildLines(content, textBox, measure), textBox.height)
    : [[]];

  const sheets = Math.max(1, textSheets.length, photoSheets);
  const result: RenderBlock[][] = [];

  for (let index = 0; index < sheets; index += 1) {
    const blocks: RenderBlock[] = [];

    if (textBox) blocks.push(...toBlocks(textSheets[index] ?? [], textBox));

    const onThisSheet = photoIds.slice(
      index * template.photosPerPage,
      (index + 1) * template.photosPerPage,
    );

    // Het template krijgt het werkelijke aantal foto's van dít vel en levert
    // precies zoveel vakken. Er kan dus geen leeg vak overblijven.
    const slots = template.frame(size, onThisSheet.length).photoSlots;
    onThisSheet.forEach((photoId, slot) => {
      blocks.push({ kind: "photo", photoId, rect: slots[slot] });
    });

    result.push(blocks);
  }

  return result;
}

/**
 * Verdeelt de documentatie over pagina's.
 *
 * Loopt over de pagina's uit de invoer en legt elke pagina op volgens haar
 * eigen template. Past de inhoud van één pagina niet op één vel, dan loopt zij
 * door met de titel erboven herhaald (besluit B-07).
 *
 * Vandaag levert de aanroeper één pagina; de nummering telt hoe dan ook over
 * het geheel door, zodat meerdere pagina's straks niets anders vragen.
 */
export function layout(input: RenderInput, measure: TextMeasurer): RenderedPage[] {
  const size = input.size ?? A4_LANDSCAPE_300DPI;
  const title = buildTitle(input.title, input.seriesName);
  const meta = buildMeta(input.groupNames, input.students);

  const sheets = input.pages.flatMap((content) => layoutPage(content, size, measure));
  const totalPages = Math.max(1, sheets.length);

  return sheets.map((blocks, index) => ({
    pageNumber: index + 1,
    totalPages,
    size,
    title,
    meta,
    blocks,
  }));
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
