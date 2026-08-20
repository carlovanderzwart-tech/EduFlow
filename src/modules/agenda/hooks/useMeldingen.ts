"use client";

import { useEffect } from "react";

import type { CalendarEvent } from "@/domain/types";
import { TIKINTERVAL_MS } from "@/services/agenda/NotificationService";
import { diensten } from "@/services/diensten";

/**
 * De meldingslus (§6.2.9, `FR-AGE-25`, B-108).
 *
 * Elke halve minuut kijken of er iets binnen tien minuten begint. **Alleen terwijl de
 * app open staat** — dat is niet een beperking van deze lus maar de hele reden dat hij
 * bestaat: een melding inplannen die afgaat met de app dicht kan op het web niet
 * zonder server, en die server willen we niet (B-108).
 *
 * De lus zet geen stand en tekent niets; hij kijkt en meldt. Daarom mag hij in een
 * effect staan zonder dat er een render uit volgt.
 */
export function useMeldingen(items: readonly CalendarEvent[]) {
  useEffect(() => {
    let actief = true;

    const kijk = async () => {
      const { notifications } = await diensten();
      if (!actief) return;
      notifications.tik(items);
    };

    void kijk();
    const tikker = window.setInterval(() => void kijk(), TIKINTERVAL_MS);

    return () => {
      actief = false;
      window.clearInterval(tikker);
    };
  }, [items]);
}
