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
 * Template A — tekst links, fotoraster rechts (doc 04).
 *
 * Tekstkolom links op ongeveer een derde, daarnaast de foto's in een raster.
 * De meest gebruikte indeling.
 *
 * Het raster past zich aan het aantal foto's aan: bij vier foto's een 2×2 in
 * plaats van vier vakken in een raster voor zes met twee gaten rechtsonder.
 */
export const templateA: Template = {
  id: "a",
  name: "Tekst links, foto's rechts",
  description: "Tekstkolom links, een raster met foto's ernaast. De meest gebruikte indeling.",
  photosPerPage: 6,

  frame(page: PageSize, photoCount: number): TemplateFrame {
    const content = contentRect(page);
    const gap = gapFor(page);
    const textWidth = content.width / 3 - gap / 2;

    return {
      text: { x: content.x, y: content.y, width: textWidth, height: content.height },
      photoSlots: rowsLayout(
        {
          x: content.x + textWidth + gap,
          y: content.y,
          width: content.width - textWidth - gap,
          height: content.height,
        },
        balancedRows(photoCount),
        gap,
      ),
    };
  },
};
