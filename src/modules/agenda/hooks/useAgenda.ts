"use client";

import { useCallback } from "react";

import {
  laatsteVanMaand,
  maandagVan,
  maandraster,
  plusDagen,
  type IsoDate,
} from "@/lib/dates";
import { useDienst } from "@/app/providers/useDienst";
import type { CalendarEvent, SchoolYear } from "@/domain/types";
import { perDag, type Weergave } from "@/services/agenda/AgendaService";
import type { Vakantie } from "@/services/agenda/HolidayService";
import { jaardagen, jaartellingen, type Jaardag, type Jaartellingen } from "@/services/agenda/schooljaar";
import type { Diensten } from "@/services/diensten";

/** De periode die een weergave laat zien; alle datumrekenkunde staat in `lib/dates`. */
export function periodeVan(weergave: Weergave, anker: IsoDate, schooljaar: SchoolYear | null) {
  if (weergave === "dag") return { van: anker, tot: anker };
  if (weergave === "week") {
    const maandag = maandagVan(anker);
    return { van: maandag, tot: plusDagen(maandag, 6) };
  }
  if (weergave === "maand") {
    const raster = maandraster(anker);
    return { van: raster[0]!, tot: raster[raster.length - 1]! };
  }

  // Zonder ingesteld schooljaar valt de jaarweergave terug op augustus-juli.
  const begin = schooljaar?.firstSchoolDay ?? `${anker.slice(0, 4)}-08-01`;
  return { van: begin, tot: schooljaar?.lastSchoolDay ?? laatsteVanMaand(`${Number(begin.slice(0, 4)) + 1}-07-01`) };
}

export interface Agendastand {
  schooljaar: SchoolYear | null;
  items: CalendarEvent[];
  perDag: Map<IsoDate, CalendarEvent[]>;
  vakanties: Vakantie[];
  jaardagen: Map<IsoDate, Jaardag>;
  tellingen: Jaartellingen;
  /** De melding bij een aflopend bestand, of `null` (`FR-AGE-12`). */
  vervalmelding: string | null;
  /** Aangepaste vakanties die landelijk zijn verschoven (`FR-AGE-11`). */
  verschoven: Vakantie[];
  van: IsoDate;
  tot: IsoDate;
}

/**
 * Alles wat een weergave nodig heeft, in één keer opgehaald (§10.10).
 *
 * De weergaven tekenen alleen; wat er op een dag staat en wat een dag ís, wordt in
 * de services berekend (DR-15). Anders staat "welke week is dit" straks op vier
 * plekken en lopen ze uit elkaar zodra er één wordt aangepast.
 */
export function useAgenda(weergave: Weergave, anker: IsoDate) {
  const laad = useCallback(
    async ({ agenda, holidays }: Diensten) => {
      const jaar = await agenda.huidigSchooljaar();
      if (!jaar.ok) return jaar;

      const verschoven = await holidays.synchroniseer();
      if (!verschoven.ok) return verschoven;

      const schooljaar = jaar.value;
      const { van, tot } = periodeVan(weergave, anker, schooljaar);

      const items = await agenda.periode(van, tot);
      if (!items.ok) return items;

      const vakanties = schooljaar
        ? await holidays.vakanties(schooljaar.name, schooljaar.region)
        : { ok: true as const, value: [] as Vakantie[] };
      if (!vakanties.ok) return vakanties;

      // Alleen voor de jaarweergave, want alleen dan beslaat `items` het hele
      // schooljaar. Zou een andere weergave dit raster gebruiken, dan miste hij de
      // studiedagen buiten zijn eigen periode — en dat valt niet op.
      const dagen =
        schooljaar && weergave === "jaar"
          ? jaardagen({
              firstSchoolDay: schooljaar.firstSchoolDay,
              lastSchoolDay: schooljaar.lastSchoolDay,
              vakanties: vakanties.value,
              items: items.value,
            })
          : new Map<IsoDate, Jaardag>();

      return {
        ok: true as const,
        value: {
          schooljaar,
          items: items.value,
          perDag: perDag(items.value, van, tot),
          vakanties: vakanties.value,
          jaardagen: dagen,
          tellingen: jaartellingen(dagen),
          vervalmelding: holidays.verlooptBinnenkort(),
          verschoven: verschoven.value,
          van,
          tot,
        } satisfies Agendastand,
      };
    },
    [weergave, anker],
  );

  return useDienst(laad);
}
