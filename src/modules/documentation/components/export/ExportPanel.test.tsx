import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Documentation } from "@/types/documentation";

import { ExportPanel } from "./ExportPanel";

vi.mock("@/services/DocumentService", () => ({
  DocumentService: { getPhoto: vi.fn().mockResolvedValue(undefined) },
}));

function makeDocument(photoCount: number): Documentation {
  return {
    id: "d1",
    title: "Bouwen met blokken",
    groupId: "g1",
    studentIds: [],
    date: "2026-08-06",
    text: "De kinderen bouwden een toren.",
    quotes: [],
    photoIds: Array.from({ length: photoCount }, (_, index) => `p${index + 1}`),
    createdAt: "2026-08-06T09:00:00.000Z",
    updatedAt: "2026-08-06T09:00:00.000Z",
  };
}

function renderPanel(photoCount: number) {
  render(
    <ExportPanel
      destination="pdf"
      onOpenChange={() => {}}
      document={makeDocument(photoCount)}
      groupName="groep geel"
      studentNames={[]}
    />,
  );
}

beforeEach(() => {
  // jsdom kent `document.fonts` niet; de renderlaag wacht daarop voordat hij
  // meet, omdat canvas anders met een vervangend lettertype tekent.
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });

  // jsdom heeft geen 2D-context en waarschuwt daarover bij elke aanroep. De
  // renderlaag kan daar tegen; deze stub houdt de testuitvoer leesbaar.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

/**
 * Deze tests kijken naar de begrenzende klassen en niet naar echte afmetingen:
 * jsdom heeft geen opmaakmotor, `getBoundingClientRect()` geeft daar overal
 * nullen. De twee feiten hieronder zijn precies wat er misging, dus ze worden
 * hier vastgelegd. Of het er daadwerkelijk goed uitziet blijft browserwerk.
 */
describe("ExportPanel", () => {
  it("begrenst zijn hoogte tot de viewport", async () => {
    renderPanel(3);
    const paneel = await screen.findByRole("dialog");

    // Het paneel hangt aan de onderrand en zet voor die kant zelf
    // `height: auto` via een attribuutselector. Een gewone hoogteklasse verliest
    // daarvan, waardoor het paneel met de inhoud meegroeide en met de bovenkant
    // het scherm uit schoof: titel en sjabloonkeuze waren onbereikbaar.
    expect(paneel.className).toMatch(/max-h-\[/);
  });

  it("laat het schuifgebied krimpen", async () => {
    renderPanel(3);
    const paneel = await screen.findByRole("dialog");

    // Zonder `min-h-0` mag een flexkind niet kleiner worden dan zijn inhoud.
    // Dan schuift er niets en groeit het paneel alsnog door de begrenzing heen.
    const schuifgebied = paneel.querySelector(".overflow-y-auto");
    expect(schuifgebied).not.toBeNull();
    expect(schuifgebied?.className).toMatch(/min-h-0/);
  });

  it.each([0, 1, 2, 3, 4, 6, 10])("toont bij %i foto's de keuze en een paginateller", async (aantal) => {
    renderPanel(aantal);

    expect(await screen.findByRole("radio", { name: /Tekst links, foto/ })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);

    await waitFor(() => {
      expect(screen.getByText(/pagina/)).toBeInTheDocument();
    });
  });
});
