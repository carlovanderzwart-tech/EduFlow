/**
 * De vier opmaaktemplates uit docs/archief/04 (*Opmaak*), afgeleid uit de bestaande
 * pagina's van maart en mei.
 *
 * Een template beschrijft **één pagina** en wordt herhaald (docs/archief/03, *Pagina's*).
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
  /** Veilige marge rondom, zodat een kantoorprinter niets afsnijdt (docs/archief/04). */
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
  /** Waar dit template voor bedoeld is (docs/archief/04). */
  description: string;
  /** Hoeveel foto's er op één pagina passen; bepaalt mede het aantal pagina's (B-07). */
  photosPerPage: number;
  frame(page: PageSize): TemplateFrame;
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

/** Verdeelt een gebied in gelijke vakken, rij voor rij. */
export function grid(area: Rect, columns: number, rows: number, gap: number): Rect[] {
  const cellWidth = (area.width - gap * (columns - 1)) / columns;
  const cellHeight = (area.height - gap * (rows - 1)) / rows;

  const slots: Rect[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      slots.push({
        x: area.x + column * (cellWidth + gap),
        y: area.y + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
      });
    }
  }
  return slots;
}
