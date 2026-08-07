import {
  contentRect,
  gapFor,
  rowsLayout,
  type PageSize,
  type Template,
  type TemplateFrame,
} from ".";

/**
 * Template B — tekst boven, fotorij onder (doc 04).
 *
 * Tekst over de volle breedte bovenaan, daaronder een rij foto's. Voor langere
 * teksten: de tekst krijgt hier de meeste ruimte van alle templates.
 *
 * Eén rij, hoe weinig foto's er ook zijn. Twee foto's worden dus twee brede
 * foto's naast elkaar en niet twee smalle met een gat ernaast. Een tweede rij
 * zou de strook halveren en de foto's onleesbaar klein maken.
 */
export const templateB: Template = {
  id: "b",
  name: "Tekst boven, foto's onder",
  description: "Tekst over de volle breedte, met een rij foto's eronder. Voor langere teksten.",
  photosPerPage: 4,

  frame(page: PageSize, photoCount: number): TemplateFrame {
    const content = contentRect(page);
    const gap = gapFor(page);
    const textHeight = content.height * 0.45;

    return {
      text: { x: content.x, y: content.y, width: content.width, height: textHeight },
      photoSlots: rowsLayout(
        {
          x: content.x,
          y: content.y + textHeight + gap,
          width: content.width,
          height: content.height - textHeight - gap,
        },
        photoCount > 0 ? [photoCount] : [],
        gap,
      ),
    };
  },
};
