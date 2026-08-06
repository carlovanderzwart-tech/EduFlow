import { contentRect, gapFor, type PageSize, type Template, type TemplateFrame } from ".";

/**
 * Template C — tekst links, één grote foto (doc 04).
 *
 * Tekst links, één dominante foto rechts, eventueel één kleinere eronder. Voor
 * als één beeld de pagina draagt.
 *
 * Twee foto's per pagina is bewust weinig: zes foto's worden hier drie pagina's
 * en in template A één. Dat verschil staat met naam in besluit B-07.
 */
export const templateC: Template = {
  id: "c",
  name: "Tekst links, grote foto",
  description: "Tekst links, één dominante foto rechts. Voor als één beeld de pagina draagt.",
  photosPerPage: 2,

  frame(page: PageSize): TemplateFrame {
    const content = contentRect(page);
    const gap = gapFor(page);
    const columnWidth = content.width / 2 - gap / 2;
    const photoX = content.x + columnWidth + gap;

    // De grote foto krijgt twee derde van de hoogte, de kleinere de rest.
    const largeHeight = (content.height - gap) * (2 / 3);

    return {
      text: { x: content.x, y: content.y, width: columnWidth, height: content.height },
      photoSlots: [
        { x: photoX, y: content.y, width: columnWidth, height: largeHeight },
        {
          x: photoX,
          y: content.y + largeHeight + gap,
          width: columnWidth,
          height: content.height - largeHeight - gap,
        },
      ],
    };
  },
};
