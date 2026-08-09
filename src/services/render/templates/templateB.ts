import { contentRect, gapFor, grid, type PageSize, type Template, type TemplateFrame } from ".";

/**
 * Template B — tekst boven, fotorij onder (docs/archief/04).
 *
 * Tekst over de volle breedte bovenaan, daaronder een rij foto's. Voor langere
 * teksten: de tekst krijgt hier de meeste ruimte van alle templates.
 */
export const templateB: Template = {
  id: "b",
  name: "Tekst boven, foto's onder",
  description: "Tekst over de volle breedte, met een rij foto's eronder. Voor langere teksten.",
  photosPerPage: 4,

  frame(page: PageSize): TemplateFrame {
    const content = contentRect(page);
    const gap = gapFor(page);
    const textHeight = content.height * 0.45;

    return {
      text: { x: content.x, y: content.y, width: content.width, height: textHeight },
      photoSlots: grid(
        {
          x: content.x,
          y: content.y + textHeight + gap,
          width: content.width,
          height: content.height - textHeight - gap,
        },
        4,
        1,
        gap,
      ),
    };
  },
};
