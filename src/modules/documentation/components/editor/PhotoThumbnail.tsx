"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { DocumentService } from "@/services/DocumentService";

/**
 * Toont één foto. Haalt zijn eigen blob op, maakt daar een object-URL van en
 * geeft die bij het opruimen weer vrij (docs/archief/03, *Foto's*).
 *
 * docs/archief/03 schrijft dit expliciet zo voor: foto-blobs gaan niet door Context heen,
 * anders hertekent het halve scherm bij elke wijziging.
 */
export function PhotoThumbnail({ photoId, alt }: { photoId: string; alt: string }) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;

    void DocumentService.getPhoto(photoId).then((photo) => {
      if (!active || !photo) return;
      objectUrl = URL.createObjectURL(photo.blob);
      setUrl(objectUrl);
    });

    return () => {
      active = false;
      // Zonder vrijgeven blijft elke foto in het geheugen staan zolang het
      // tabblad open is.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  if (!url) return <Skeleton className="aspect-square w-full rounded-lg" />;

  return (
    // next/image kan een blob-URL niet optimaliseren; die bestaat alleen in dit
    // tabblad en gaat nooit langs een server.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="aspect-square w-full rounded-lg object-cover" />
  );
}
