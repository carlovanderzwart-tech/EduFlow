import { contentRect, gapFor, grid, type PageSize, type Template, type TemplateFrame } from ".";

/**
 * Template A — tekst links, fotoraster rechts (docs/archief/04).
 *
 * Tekstkolom links op ongeveer een derde, daarnaast vier tot zes foto's in een
 * raster. De meest gebruikte indeling.
 */
export const templateA: Template = {
  id: "a",
  name: "Tekst links, foto's rechts",
  description: "Tekstkolom links, een raster met foto's ernaast. De meest gebruikte indeling.",
  photosPerPage: 6,

  frame(page: PageSize): TemplateFrame {
    const content = contentRect(page);
    const gap = gapFor(page);
    const textWidth = content.width / 3 - gap / 2;

    return {
      text: { x: content.x, y: content.y, width: textWidth, height: content.height },
      photoSlots: grid(
        {
          x: content.x + textWidth + gap,
          y: content.y,
          width: content.width - textWidth - gap,
          height: content.height,
        },
        3,
        2,
        gap,
      ),
    };
  },
};
