"use client";

import { useState } from "react";

import { type IsoDate } from "@/lib/dates";
import type { CalendarEvent } from "@/domain/types";
import { isVerschijning, reeksVan, type Reikwijdte } from "@/services/agenda/RecurrenceService";
import { minutenVoor, naarDag, stapVan, verschoven } from "@/services/agenda/verplaatsen";
import { diensten } from "@/services/diensten";

import { dagVanItem } from "../weergavehulp";

/**
 * Een item verplaatsen met slepen of met het toetsenbord (§6.2.5, B-38, `NFR-35`).
 *
 * **Het toetsenbordpad is niet optioneel.** B-38 en `NFR-35` zeggen dat slepen nooit
 * de enige manier is, en §6.2.5 noemt de toetsen: pijl een kwartier, `Shift` een dag,
 * `Ctrl` een week. Beide wegen gaan door dezelfde rekenfunctie, zodat ze niet
 * uiteenlopen.
 *
 * **"Met het item geselecteerd"** betekent hier: de knop van het item heeft focus. Dat
 * is geen vereenvoudiging maar de juiste uitvoering — een tweede selectiebegrip naast
 * focus levert twee dingen op die uit de pas kunnen lopen, en een schermlezer kent er
 * maar één.
 *
 * Hoort het item bij een herhaling, dan komt eerst de reikwijdtevraag van
 * `FR-AGE-15`. Een sleep is ook een wijziging.
 */
export interface Verplaatsing {
  item: CalendarEvent;
  minuten: number;
}

export function useVerplaatsen(onKlaar: () => void) {
  const [fout, setFout] = useState<string | null>(null);
  const [wachtend, setWachtend] = useState<Verplaatsing | null>(null);

  /** Voert de verschuiving uit, of stelt de reikwijdtevraag als het een reeks is. */
  async function verschuif(item: CalendarEvent, minuten: number) {
    if (minuten === 0) return;
    if (item.recurrence || isVerschijning(item.id)) return setWachtend({ item, minuten });

    await schrijf(item, minuten);
  }

  async function schrijf(item: CalendarEvent, minuten: number, reikwijdte?: Reikwijdte) {
    const { agenda } = await diensten();
    const invoer = verschoven(item, minuten);

    const uitkomst = reikwijdte
      ? await agenda.wijzigReeks(reeksVan(item.id), dagVanItem(item), reikwijdte, invoer)
      : await agenda.wijzig(item.id, invoer);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setFout(null);
    onKlaar();
  }

  /** De pijltoetsen, met de stap die de hulptoetsen aangeven (§6.2.5). */
  function opToets(item: CalendarEvent, gebeurtenis: React.KeyboardEvent) {
    const richting = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[gebeurtenis.key];
    if (richting === undefined) return;

    gebeurtenis.preventDefault();
    void verschuif(item, richting * minutenVoor(item, stapVan(gebeurtenis)));
  }

  /** Slepen naar een andere dag; het tijdstip blijft staan. */
  async function laatVallen(item: CalendarEvent, dag: IsoDate) {
    const invoer = naarDag(item, dag);
    const minuten =
      (new Date(item.allDay ? `${invoer.start}T00:00:00.000Z` : invoer.start).getTime() -
        new Date(item.allDay ? `${item.start}T00:00:00.000Z` : item.start).getTime()) /
      60_000;

    await verschuif(item, minuten);
  }

  return {
    fout,
    wachtend,
    opToets,
    laatVallen,
    /** De reikwijdte kiezen voor een wachtende verplaatsing (`FR-AGE-15`). */
    kiesReikwijdte: (reikwijdte: Reikwijdte) => {
      if (!wachtend) return;
      const { item, minuten } = wachtend;
      setWachtend(null);
      void schrijf(item, minuten, reikwijdte);
    },
    laatWachtendVallen: () => setWachtend(null),
  };
}
