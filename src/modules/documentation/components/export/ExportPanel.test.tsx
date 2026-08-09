import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Documentation } from "@/types/documentation";

import { ExportPanel, type ExportDestination } from "./ExportPanel";

const toPdf = vi.fn();
const toImages = vi.fn();
const toClipboardImage = vi.fn();
const download = vi.fn();
const share = vi.fn();
const copyImage = vi.fn();
const canShare = vi.fn();
const canCopyImage = vi.fn();

vi.mock("@/services/ExportService", () => ({
  toFileName: (title: string, ext: string, page?: number) =>
    page ? `${title}-${page}.${ext}` : `${title}.${ext}`,
  ExportService: {
    toPdf: (...a: unknown[]) => toPdf(...a),
    toImages: (...a: unknown[]) => toImages(...a),
    toClipboardImage: (...a: unknown[]) => toClipboardImage(...a),
    download: (...a: unknown[]) => download(...a),
    share: (...a: unknown[]) => share(...a),
    copyImage: (...a: unknown[]) => copyImage(...a),
    canShare: (...a: unknown[]) => canShare(...a),
    canCopyImage: () => canCopyImage(),
  },
}));

vi.mock("@/services/PrivacyService", () => ({
  PrivacyService: {
    getInitialsMasker: vi.fn().mockResolvedValue((text: string) => text.replace(/Kjeld/g, "K.")),
  },
}));

vi.mock("@/services/DocumentService", () => ({
  DocumentService: { getPhoto: vi.fn().mockResolvedValue(undefined) },
}));

const onExported = vi.fn();

function makeDocument(overrides: Partial<Documentation> = {}): Documentation {
  return {
    id: "d1",
    title: "Bouwen met blokken",
    groupId: "g1",
    studentIds: [],
    date: "2026-08-06",
    text: "Kjeld bouwde een toren.",
    quotes: [],
    photoIds: ["p1", "p2"],
    createdAt: "2026-08-06T09:00:00.000Z",
    updatedAt: "2026-08-06T09:00:00.000Z",
    ...overrides,
  };
}

function renderPanel(destination: ExportDestination = "pdf", doc = makeDocument()) {
  render(
    <ExportPanel
      destination={destination}
      onOpenChange={() => {}}
      document={doc}
      groupName="groep geel"
      studentNames={["Kjeld"]}
      onExported={onExported}
    />,
  );
}

/** Wacht tot het voorbeeld klaar is; daarvoor zijn de knoppen uitgeschakeld. */
async function wachtOpVoorbeeld() {
  await waitFor(() => {
    expect(screen.getByText(/pagina/)).toBeInTheDocument();
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

  toPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
  toImages.mockResolvedValue([new Blob(["jpg"], { type: "image/jpeg" })]);
  toClipboardImage.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
  share.mockResolvedValue(true);
  copyImage.mockResolvedValue(true);
  canShare.mockReturnValue(false);
  canCopyImage.mockReturnValue(false);
});

describe("ExportPanel", () => {
  describe("opmaak", () => {
    it("begrenst zijn hoogte tot de viewport", async () => {
      renderPanel();
      const paneel = await screen.findByRole("dialog");

      // Het paneel hangt aan de onderrand en zet zelf `height: auto`. Zonder
      // maximumhoogte groeit het met de bovenkant het scherm uit.
      expect(paneel.className).toMatch(/max-h-\[/);
    });

    it("laat het schuifgebied krimpen", async () => {
      renderPanel();
      const paneel = await screen.findByRole("dialog");

      const schuifgebied = paneel.querySelector(".overflow-y-auto");
      expect(schuifgebied?.className).toMatch(/min-h-0/);
    });

    it("toont de vier sjablonen en een paginateller", async () => {
      renderPanel();
      await wachtOpVoorbeeld();

      expect(screen.getAllByRole("radio")).toHaveLength(4);
    });
  });

  describe("Print-PDF", () => {
    it("downloadt en meldt de geslaagde export", async () => {
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /PDF downloaden/ }));

      await waitFor(() => expect(download).toHaveBeenCalled());
      expect(toPdf).toHaveBeenCalledOnce();
      expect(onExported).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: "a", exportedAt: expect.any(String) }),
      );
    });

    it("legt het gekozen sjabloon vast", async () => {
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("radio", { name: /grote foto/ }));
      fireEvent.click(screen.getByRole("button", { name: /PDF downloaden/ }));

      await waitFor(() => expect(onExported).toHaveBeenCalled());
      expect(onExported).toHaveBeenCalledWith(expect.objectContaining({ templateId: "c" }));
    });

    it("vraagt geen toestemming: die hoort bij de deelbare afbeelding", async () => {
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /PDF downloaden/ }));

      await waitFor(() => expect(onExported).toHaveBeenCalled());
      expect(screen.queryByText(/toestemming hebben voor beeldgebruik/)).not.toBeInTheDocument();
    });

    it("toont geen initialenschakelaar", async () => {
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      // docs/archief/04: de schakelaar zit alleen bij de deelbare afbeelding.
      expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    });
  });

  describe("mislukte export", () => {
    it("meldt niets, slaat niets op en houdt de gebruiker in het paneel", async () => {
      toPdf.mockRejectedValue(new Error("kapot"));
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /PDF downloaden/ }));

      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
      expect(onExported).not.toHaveBeenCalled();
      expect(download).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("zet de knop daarna weer aan", async () => {
      toPdf.mockRejectedValue(new Error("kapot"));
      renderPanel("pdf");
      await wachtOpVoorbeeld();

      const knop = screen.getByRole("button", { name: /PDF downloaden/ });
      fireEvent.click(knop);

      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
      expect(screen.getByRole("button", { name: /PDF downloaden/ })).toBeEnabled();
    });
  });

  describe("deelbare afbeelding", () => {
    it("vraagt de eerste keer om toestemming en exporteert pas daarna", async () => {
      renderPanel("afbeelding");
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Downloaden/ }));

      // Besluit B-08: eerst de vraag, dan pas het bestand.
      expect(await screen.findByText(/toestemming hebben voor beeldgebruik/)).toBeInTheDocument();
      expect(toImages).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Ja, doorgaan" }));

      await waitFor(() => expect(download).toHaveBeenCalled());
      expect(onExported).toHaveBeenCalledWith(
        expect.objectContaining({ photoConsentConfirmedAt: expect.any(String) }),
      );
    });

    it("vraagt niet opnieuw wanneer het al eens is bevestigd", async () => {
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Downloaden/ }));

      await waitFor(() => expect(download).toHaveBeenCalled());
      expect(screen.queryByText(/toestemming hebben voor beeldgebruik/)).not.toBeInTheDocument();
    });

    it("downloadt elke pagina als eigen bestand", async () => {
      toImages.mockResolvedValue([
        new Blob(["1"], { type: "image/jpeg" }),
        new Blob(["2"], { type: "image/jpeg" }),
      ]);
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /afbeeldingen|Downloaden/ }));

      await waitFor(() => expect(download).toHaveBeenCalledTimes(2));
    });

    it("heeft een initialenschakelaar", async () => {
      renderPanel("afbeelding");
      await wachtOpVoorbeeld();

      expect(screen.getByRole("switch", { name: "Namen als initialen" })).toBeInTheDocument();
    });

    it("deelt wanneer het apparaat dat kan", async () => {
      canShare.mockReturnValue(true);
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Delen/ }));

      await waitFor(() => expect(share).toHaveBeenCalled());
      expect(onExported).toHaveBeenCalled();
    });

    it("ziet wegklikken van het deelmenu niet als export", async () => {
      canShare.mockReturnValue(true);
      share.mockResolvedValue(false);
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Delen/ }));

      await waitFor(() => expect(share).toHaveBeenCalled());
      expect(onExported).not.toHaveBeenCalled();
    });

    it("toont geen deelknop wanneer het apparaat niet kan delen", async () => {
      canShare.mockReturnValue(false);
      renderPanel("afbeelding");
      await wachtOpVoorbeeld();

      expect(screen.queryByRole("button", { name: /Delen/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Downloaden/ })).toBeInTheDocument();
    });

    it("kopieert naar het klembord wanneer dat kan", async () => {
      canCopyImage.mockReturnValue(true);
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Kopiëren/ }));

      await waitFor(() => expect(copyImage).toHaveBeenCalled());
      expect(download).not.toHaveBeenCalled();
      expect(onExported).toHaveBeenCalled();
    });

    it("downloadt wanneer het klembord weigert", async () => {
      canCopyImage.mockReturnValue(true);
      copyImage.mockResolvedValue(false);
      renderPanel("afbeelding", makeDocument({ photoConsentConfirmedAt: "2026-08-01T10:00:00.000Z" }));
      await wachtOpVoorbeeld();

      fireEvent.click(screen.getByRole("button", { name: /Kopiëren/ }));

      await waitFor(() => expect(download).toHaveBeenCalled());
      expect(onExported).toHaveBeenCalled();
    });
  });
});
