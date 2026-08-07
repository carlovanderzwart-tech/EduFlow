import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExportService, toFileName } from "./ExportService";
import { A4_LANDSCAPE_300DPI, type RenderedPage } from "./RenderService";

const addImage = vi.fn();
const addPage = vi.fn();
const output = vi.fn(() => new Blob(["pdf"], { type: "application/pdf" }));
const jsPDFConstructor = vi.fn();

vi.mock("jspdf", () => ({
  jsPDF: class {
    constructor(options: unknown) {
      jsPDFConstructor(options);
    }
    addImage = addImage;
    addPage = addPage;
    output = output;
  },
}));

vi.mock("./DocumentService", () => ({
  DocumentService: {
    getPhoto: vi.fn().mockResolvedValue({
      id: "p1",
      documentId: "d1",
      blob: new Blob(),
      width: 1600,
      height: 1200,
      createdAt: "",
      updatedAt: "",
    }),
  },
}));

const paint = vi.fn();
vi.mock("./RenderService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./RenderService")>();
  return { ...actual, RenderService: { ...actual.RenderService, paint: (...a: unknown[]) => paint(...a) } };
});

function page(pageNumber: number, totalPages: number, photos = 0): RenderedPage {
  return {
    pageNumber,
    totalPages,
    size: A4_LANDSCAPE_300DPI,
    title: "Bouwen met blokken",
    meta: "Leerling(en): groep geel",
    blocks: Array.from({ length: photos }, (_, index) => ({
      kind: "photo" as const,
      photoId: `p${index + 1}`,
      rect: { x: 0, y: 0, width: 100, height: 100 },
    })),
  };
}

function pages(count: number, photosPerPage = 0): RenderedPage[] {
  return Array.from({ length: count }, (_, index) => page(index + 1, count, photosPerPage));
}

beforeEach(() => {
  vi.clearAllMocks();

  // jsdom kan niet tekenen; deze stubs laten de exportketen wel doorlopen.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,xxx");
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    type?: string,
  ) {
    callback(new Blob(["beeld"], { type: type ?? "image/png" }));
  });

  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1600, height: 1200, close: vi.fn() }));
});

describe("toFileName", () => {
  it.each([
    ["Bouwen met blokken", undefined, "bouwen-met-blokken.pdf"],
    ["Bouwen met blokken", 2, "bouwen-met-blokken-2.pdf"],
    ["  ", undefined, "documentatie.pdf"],
    ["Café/Déjà: vu!", undefined, "café-déjà-vu.pdf"],
  ])("maakt van %s een bestandsnaam", (titel, pagina, verwacht) => {
    expect(toFileName(titel, "pdf", pagina)).toBe(verwacht);
  });
});

describe("ExportService.toPdf", () => {
  it("maakt één A4 liggend bij één pagina", async () => {
    const blob = await ExportService.toPdf(pages(1));

    expect(jsPDFConstructor).toHaveBeenCalledWith({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    expect(addImage).toHaveBeenCalledTimes(1);
    expect(addPage).not.toHaveBeenCalled();
    expect(blob.type).toBe("application/pdf");
  });

  it("voegt een blad toe per extra pagina", async () => {
    await ExportService.toPdf(pages(3));

    expect(addImage).toHaveBeenCalledTimes(3);
    // Drie pagina's is twee keer een blad toevoegen: het eerste bestaat al.
    expect(addPage).toHaveBeenCalledTimes(2);
  });

  it("zet het beeld op de volle A4, want de marge zit er al in", async () => {
    await ExportService.toPdf(pages(1));

    expect(addImage).toHaveBeenCalledWith(expect.any(String), "JPEG", 0, 0, 297, 210);
  });

  it("werkt zonder foto's", async () => {
    await expect(ExportService.toPdf(pages(1, 0))).resolves.toBeInstanceOf(Blob);
    expect(paint).toHaveBeenCalledTimes(1);
  });

  it("werkt met veel foto's", async () => {
    await ExportService.toPdf(pages(2, 6));

    expect(paint).toHaveBeenCalledTimes(2);
    // Op ware grootte: 300 dpi (doc 04).
    expect(paint).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), expect.anything(), 1);
  });

  it("weigert zonder pagina's", async () => {
    await expect(ExportService.toPdf([])).rejects.toThrow();
  });
});

describe("ExportService.toImages", () => {
  it("levert één JPG bij één pagina", async () => {
    const blobs = await ExportService.toImages(pages(1));

    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe("image/jpeg");
  });

  it("levert één JPG per pagina", async () => {
    expect(await ExportService.toImages(pages(4))).toHaveLength(4);
  });

  it("tekent op ongeveer 1600 pixels breed", async () => {
    await ExportService.toImages(pages(1));

    const schaal = paint.mock.calls[0][3] as number;
    expect(Math.round(A4_LANDSCAPE_300DPI.width * schaal)).toBe(1600);
  });

  it("weigert zonder pagina's", async () => {
    await expect(ExportService.toImages([])).rejects.toThrow();
  });
});

describe("ExportService.toClipboardImage", () => {
  it("levert een PNG, want het klembord neemt geen JPEG", async () => {
    const blob = await ExportService.toClipboardImage(page(1, 1));

    expect(blob.type).toBe("image/png");
  });
});

describe("delen", () => {
  const file = new File([new Blob()], "a.jpg", { type: "image/jpeg" });

  it("meldt dat delen niet kan zonder Web Share", () => {
    vi.stubGlobal("navigator", {});

    expect(ExportService.canShare([file])).toBe(false);
  });

  it("deelt wanneer het apparaat het aankan", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share, canShare: () => true });

    await expect(ExportService.share([file], "Titel")).resolves.toBe(true);
    expect(share).toHaveBeenCalledWith({ files: [file], title: "Titel" });
  });

  it("valt terug wanneer delen niet ondersteund wordt", async () => {
    vi.stubGlobal("navigator", {});

    await expect(ExportService.share([file], "Titel")).resolves.toBe(false);
  });

  it("ziet wegklikken niet als een export", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("weg", "AbortError"));
    vi.stubGlobal("navigator", { share, canShare: () => true });

    // Er is niets de deur uit gegaan, dus dit telt niet als export.
    await expect(ExportService.share([file], "Titel")).resolves.toBe(false);
  });

  it("meldt een echte fout wel", async () => {
    const share = vi.fn().mockRejectedValue(new Error("kapot"));
    vi.stubGlobal("navigator", { share, canShare: () => true });

    await expect(ExportService.share([file], "Titel")).rejects.toThrow();
  });
});

describe("klembord", () => {
  const png = new Blob(["x"], { type: "image/png" });

  it("meldt dat kopiëren niet kan zonder Clipboard API", () => {
    vi.stubGlobal("navigator", {});

    expect(ExportService.canCopyImage()).toBe(false);
  });

  it("kopieert een PNG", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal("ClipboardItem", class {
      constructor(public items: Record<string, Blob>) {}
    });

    await expect(ExportService.copyImage(png)).resolves.toBe(true);
    expect(write).toHaveBeenCalled();
  });

  it("valt terug wanneer de browser het klembord weigert", async () => {
    const write = vi.fn().mockRejectedValue(new Error("geweigerd"));
    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal("ClipboardItem", class {
      constructor(public items: Record<string, Blob>) {}
    });

    // Geen fout naar boven: de aanroeper downloadt dan.
    await expect(ExportService.copyImage(png)).resolves.toBe(false);
  });

  it("valt terug wanneer ClipboardItem ontbreekt", async () => {
    vi.stubGlobal("navigator", { clipboard: { write: vi.fn() } });
    vi.stubGlobal("ClipboardItem", undefined);

    await expect(ExportService.copyImage(png)).resolves.toBe(false);
  });
});
