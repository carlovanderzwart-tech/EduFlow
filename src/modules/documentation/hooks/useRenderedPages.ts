"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DocumentService } from "@/services/DocumentService";
import { RenderService, type RenderedPage } from "@/services/RenderService";
import type { Documentation } from "@/types/documentation";

/**
 * Hoe breed foto's voor het voorbeeld worden ingelezen. Ruim boven het grootste
 * fotovak op voorbeeldschaal, en ver onder de 3300 px waarop ze zijn bewaard.
 *
 * Een foto op ware grootte kost ongeveer 44 MB aan geheugen; zes daarvan naast
 * elkaar op een oudere telefoon is vragen om problemen.
 */
const PREVIEW_PHOTO_WIDTH = 900;

interface UseRenderedPagesInput {
  document: Documentation;
  seriesName?: string;
  groupName?: string;
  studentNames: string[];
  templateId: string;
  /** Uit zolang het paneel dicht is: dan hoeft er niets ingelezen te worden. */
  enabled: boolean;
}

function closeAll(images: Map<string, ImageBitmap>): void {
  for (const image of images.values()) image.close();
  images.clear();
}

/**
 * Leest de foto's in en berekent de pagina's voor het voorbeeld.
 *
 * Twee dingen die hier bewust zo staan:
 *
 * - **Foto's worden één voor één ingelezen**, niet met `Promise.all`. Zes keer
 *   3300 px tegelijk decoderen is een geheugenpiek die een telefoon niet hoeft
 *   te maken voor een voorbeeld.
 * - **Elke `ImageBitmap` wordt weer vrijgegeven.** Die vallen buiten de
 *   opruiming van de browser en blijven anders staan tot het tabblad sluit.
 */
export function useRenderedPages({
  document: doc,
  seriesName,
  groupName,
  studentNames,
  templateId,
  enabled,
}: UseRenderedPagesInput) {
  const [images, setImages] = useState<Map<string, ImageBitmap>>(() => new Map());
  const [loading, setLoading] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  /** Wat er op dit moment in gebruik is; alleen deze map mag worden gesloten. */
  const inUse = useRef<Map<string, ImageBitmap>>(new Map());

  // Uit elkaar getrokken, zodat een nieuw array met dezelfde inhoud niet
  // opnieuw inleest.
  const photoKey = doc.photoIds.join(",");
  const namesKey = studentNames.join(",");

  /**
   * Tekst op canvas tekent met een vervangend lettertype zolang het echte nog
   * niet geladen is, zonder enige melding. Meten en tekenen wachten daarop.
   */
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) setFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let published = false;
    const decoded = new Map<string, ImageBitmap>();
    const ids = photoKey ? photoKey.split(",") : [];

    void (async () => {
      setLoading(true);

      for (const id of ids) {
        if (cancelled) break;

        const photo = await DocumentService.getPhoto(id);
        if (cancelled || !photo) continue;

        const bitmap = await createImageBitmap(photo.blob, {
          resizeWidth: Math.min(PREVIEW_PHOTO_WIDTH, photo.width),
          resizeQuality: "medium",
        });

        if (cancelled) {
          bitmap.close();
          break;
        }
        decoded.set(id, bitmap);
      }

      if (cancelled) {
        closeAll(decoded);
        return;
      }

      closeAll(inUse.current);
      inUse.current = decoded;
      published = true;

      setImages(new Map(decoded));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      // Alleen opruimen wat nooit in gebruik is genomen; de gepubliceerde map
      // wordt door de volgende ronde of door het afsluiten hieronder gesloten.
      if (!published) closeAll(decoded);
    };
  }, [photoKey, enabled]);

  // Bij het verlaten van het scherm alles vrijgeven.
  useEffect(() => {
    const held = inUse;
    return () => closeAll(held.current);
  }, []);

  const pages: RenderedPage[] = useMemo(() => {
    if (!enabled || !fontsReady) return [];

    return RenderService.layout(
      {
        document: doc,
        seriesName,
        groupName,
        studentNames: namesKey ? namesKey.split(",") : [],
        templateId,
      },
      RenderService.createMeasurer(),
    );
    // `namesKey` staat hier in plaats van `studentNames`: zie hierboven.
  }, [enabled, fontsReady, doc, seriesName, groupName, namesKey, templateId]);

  return { pages, images, loading: loading || !fontsReady };
}
