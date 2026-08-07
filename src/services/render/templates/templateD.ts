import {
  balancedRows,
  contentRect,
  gapFor,
  rowsLayout,
  type PageSize,
  type Template,
  type TemplateFrame,
} from ".";

/**
 * Template D — alleen foto's (doc 04).
 *
 * Een raster met foto's, geen tekst. Voor een fotoserie zonder verhaal. De
 * titel en de kopregel blijven wél staan: die horen bij elke pagina (doc 04,
 * *Regels voor alle templates*).
 *
 * Omdat er geen tekstvak is, bepaalt hier uitsluitend het aantal foto's hoeveel
 * pagina's het worden — en vullen de foto's de pagina altijd helemaal.
 */
export const templateD: Template = {
  id: "d",
  name: "Alleen foto's",
  description: "Een raster met foto's, zonder tekst. Voor een fotoserie zonder verhaal.",
  photosPerPage: 6,

  frame(page: PageSize, photoCount: number): TemplateFrame {
    return {
      photoSlots: rowsLayout(contentRect(page), balancedRows(photoCount), gapFor(page)),
    };
  },
};
