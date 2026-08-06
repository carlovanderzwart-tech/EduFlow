"use client";

import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { RenderService, type RenderedPage } from "@/services/RenderService";

/**
 * Op welke fractie van het exportformaat het voorbeeld wordt getekend.
 *
 * Een pagina op ware grootte is 3508 × 2480 en kost ongeveer 35 MB. Op deze
 * schaal is dat ruim 3 MB per pagina, en op een scherm nog altijd scherp.
 */
const PREVIEW_SCALE = 0.3;

function PagePreview({
  page,
  images,
}: {
  page: RenderedPage;
  images: Map<string, ImageBitmap>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current) RenderService.paint(canvas.current, page, images, PREVIEW_SCALE);
  }, [page, images]);

  return (
    <canvas
      ref={canvas}
      // Een canvas is voor een schermlezer een gat; deze omschrijving vult dat.
      role="img"
      aria-label={`Voorbeeld van pagina ${page.pageNumber} van ${page.totalPages}`}
      className="w-full rounded-lg border border-border shadow-sm"
    />
  );
}

interface ExportPreviewProps {
  pages: RenderedPage[];
  images: Map<string, ImageBitmap>;
  loading: boolean;
}

/**
 * Het voorbeeld in het exportpaneel: elke pagina zoals hij eruit komt.
 *
 * Dit is hetzelfde tekenwerk dat straks het bestand vult, alleen kleiner
 * getekend. Wat je hier ziet kan dus niet afwijken van wat je exporteert.
 */
export function ExportPreview({ pages, images, loading }: ExportPreviewProps) {
  if (loading) {
    return <Skeleton className="aspect-[297/210] w-full" />;
  }

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <PagePreview key={page.pageNumber} page={page} images={images} />
      ))}
    </div>
  );
}
