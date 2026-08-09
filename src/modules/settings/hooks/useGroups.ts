"use client";

import { useCallback, useEffect, useState } from "react";

import { GroupService } from "@/services/GroupService";
import { ServiceError, toServiceError } from "@/services/ServiceError";
import type { Group } from "@/types/group";

/** Een groep met het aantal leerlingen erin, zoals docs/archief/04 de lijst beschrijft. */
export interface GroupWithCount {
  group: Group;
  studentCount: number;
}

/**
 * Laadt alle groepen met hun aantal leerlingen, inclusief de gearchiveerde —
 * die staan onderaan in de lijst en zijn terug te halen (docs/archief/04, scherm 7).
 *
 * Eén laadpad, net als bij de leerlingen. Het tellen gebeurt in `GroupService`.
 */
export function useGroups() {
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const all = await GroupService.getAll();
        const counted = await Promise.all(
          all.map(async (group) => ({
            group,
            studentCount: await GroupService.countStudents(group.id),
          })),
        );
        if (!active) return;

        // Gearchiveerde groepen onderaan, de rest op naam (docs/archief/04).
        setGroups(
          counted.sort((a, b) => {
            if (a.group.archived !== b.group.archived) return a.group.archived ? 1 : -1;
            return a.group.name.localeCompare(b.group.name, "nl");
          }),
        );
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
  }, [refreshCount]);

  const reload = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  return { groups, loading, error, reload };
}
