"use client";

import { useCallback, useEffect, useState } from "react";

import { ServiceError, toServiceError } from "@/services/ServiceError";
import { StudentService, type StudentFilter } from "@/services/StudentService";
import type { Student } from "@/types/student";

/**
 * Laadt de leerlingen die bij het filter passen. Zoeken, filteren op groep en
 * het al dan niet meenemen van inactieve leerlingen zit in `StudentService` —
 * componenten bevatten geen businesslogica (docs/archief/03).
 *
 * Eén laadpad. Opnieuw laden gebeurt door de teller te verhogen, niet door de
 * query op een tweede plek te herhalen.
 */
export function useStudents(filter: StudentFilter) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Uit elkaar getrokken zodat het effect niet opnieuw draait bij een nieuw
  // objectliteral met dezelfde inhoud.
  const { search, groupId, includeInactive } = filter;

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const result = await StudentService.list({ search, groupId, includeInactive });
        if (!active) return;
        setStudents(result);
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
  }, [search, groupId, includeInactive, refreshCount]);

  const reload = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  return { students, loading, error, reload };
}
