import { contentRect, gapFor, grid, type PageSize, type Template, type TemplateFrame } from ".";

/**
 * Template D — alleen foto's (doc 04).
 *
 * Raster van vier tot zes foto's, geen tekst. Voor een fotoserie zonder
 * verhaal. De titel en de Leerling(en)-regel blijven wél staan: die horen bij
 * elke pagina (doc 04, *Regels voor alle templates*).
 *
 * Omdat er geen tekstvak is, bepaalt hier uitsluitend het aantal foto's hoeveel
 * pagina's het worden.
 */
export const templateD: Template = {
  id: "d",
  name: "Alleen foto's",
  description: "Een raster met foto's, zonder tekst. Voor een fotoserie zonder verhaal.",
  photosPerPage: 6,

  frame(page: PageSize): TemplateFrame {
    return { photoSlots: grid(contentRect(page), 3, 2, gapFor(page)) };
  },
};
