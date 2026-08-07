/**
 * De vier opmaaktemplates uit doc 04 (*Opmaak*), afgeleid uit de bestaande
 * pagina's van maart en mei.
 *
 * Een template beschrijft **één pagina** en wordt herhaald (doc 03, *Pagina's*).
 * Ze zijn losse modules met dezelfde props, zodat een template toevoegen geen
 * bestaande documentaties raakt.
 *
 * Een template kent alleen vakken, geen inhoud: hoeveel tekst er is en hoeveel
 * pagina's dat oplevert bepaalt `RenderService`.
 */

export type TemplateId = "a" | "b" | "c" | "d";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageSize {
  width: number;
  height: number;
  /** Veilige marge rondom, zodat een kantoorprinter niets afsnijdt (doc 04). */
  margin: number;
  /** Ruimte voor titel en Leerling(en)-regel. Die staan op élke pagina (B-07). */
  headerHeight: number;
}

export interface TemplateFrame {
  /** Ontbreekt bij template D: dat template heeft geen tekst. */
  text?: Rect;
  /** Eén vak per foto, in volgorde. Minder foto's schuiven op — geen lege vakken. */
  photoSlots: Rect[];
}

export interface Template {
  id: TemplateId;
  /** Het label onder de miniatuur in het exportpaneel. */
  name: string;
  /** Waar dit template voor bedoeld is (doc 04). */
  description: string;
  /** Hoeveel foto's er op één pagina passen; bepaalt mede het aantal pagina's (B-07). */
  photosPerPage: number;
  /**
   * De vakken voor precies dit aantal foto's.
   *
   * Het aantal is een invoer en geen bovengrens: een template levert exact
   * zoveel vakken als er foto's zijn. Daardoor kan er geen leeg vak overblijven
   * en geen witruimte ontstaan waar een foto had moeten staan.
   */
  frame(page: PageSize, photoCount: number): TemplateFrame;
}

/**
 * Ruimte tussen vakken, als deel van de paginabreedte: 40 px op een pagina van
 * 3508 px.
 *
 * Bewust een verhouding en geen vast aantal pixels. De miniaturen in het
 * exportpaneel vragen dezelfde templates om hun vakken op een pagina van
 * honderd eenheden breed; met een vaste tussenruimte zou daar niets van
 * overblijven en zouden de vakken negatief worden.
 */
const GAP_RATIO = 40 / 3508;

export function gapFor(page: PageSize): number {
  return page.width * GAP_RATIO;
}

/** Het gebied onder de kop waar tekst en foto's in passen. */
export function contentRect(page: PageSize): Rect {
  return {
    x: page.margin,
    y: page.margin + page.headerHeight,
    width: page.width - page.margin * 2,
    height: page.height - page.margin * 2 - page.headerHeight,
  };
}

/**
 * Verdeelt een gebied in rijen met per rij een eigen aantal vakken.
 *
 * `[1, 2]` levert één breed vak boven twee smallere. Alle rijen zijn even hoog;
 * binnen een rij zijn de vakken even breed. Het gebied wordt volledig gevuld —
 * dat is precies wat lege plekken voorkomt.
 */
export function rowsLayout(area: Rect, rows: number[], gap: number): Rect[] {
  const rowCount = rows.length;
  if (rowCount === 0) return [];

  const rowHeight = (area.height - gap * (rowCount - 1)) / rowCount;

  return rows.flatMap((columns, rowIndex) => {
    const cellWidth = (area.width - gap * (columns - 1)) / columns;
    const y = area.y + rowIndex * (rowHeight + gap);

    return Array.from({ length: columns }, (_, column) => ({
      x: area.x + column * (cellWidth + gap),
      y,
      width: cellWidth,
      height: rowHeight,
    }));
  });
}

/**
 * De rijverdeling die bij een aantal foto's hoort.
 *
 * Gekozen op hoe een pagina eruitziet, niet op wiskundige netheid:
 *
 * | foto's | rijen | resultaat |
 * |---|---|---|
 * | 1 | `[1]` | één grote foto |
 * | 2 | `[2]` | twee gelijke foto's naast elkaar |
 * | 3 | `[1, 2]` | één dominante boven, twee kleinere eronder |
 * | 4 | `[2, 2]` | een vierkant raster |
 * | 5 | `[2, 3]` | twee grotere boven, drie kleinere eronder |
 * | 6 | `[3, 3]` | het klassieke raster |
 */
export function balancedRows(count: number): number[] {
  switch (count) {
    case 0:
      return [];
    case 1:
      return [1];
    case 2:
      return [2];
    case 3:
      return [1, 2];
    case 4:
      return [2, 2];
    case 5:
      return [2, 3];
    default:
      return [3, 3];
  }
}
