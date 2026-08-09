"use client";

import { useCallback, useEffect, useState } from "react";

import { DocumentService } from "@/services/DocumentService";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import type { Documentation, DocumentFilter } from "@/types/documentation";

/**
 * Laadt de documentaties die bij het filter passen. Het filteren zelf zit in
 * `DocumentService`, inclusief de zoekindex — componenten bevatten geen
 * businesslogica (docs/archief/03).
 *
 * Er is één laadpad. Opnieuw laden gebeurt door de teller te verhogen, niet door
 * de query op een tweede plek te herhalen.
 */
export function useDocumentations(filter: DocumentFilter) {
  const [documents, setDocuments] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Uit elkaar getrokken zodat het effect niet opnieuw draait bij een nieuw
  // objectliteral met dezelfde inhoud.
  const { search, seriesId, groupId, studentId, from, to } = filter;

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const result = await DocumentService.list({
          search,
          seriesId,
          groupId,
          studentId,
          from,
          to,
        });
        if (!active) return;
        setDocuments(result);
        setError(null);
      } catch (cause) {
        if (active) setError(toServiceError(cause));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [search, seriesId, groupId, studentId, from, to, refreshCount]);

  const reload = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  return { documents, loading, error, reload };
}
