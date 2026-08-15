"use client";

import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/ui/EmptyState";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { dagenTussen } from "@/lib/dates";
import { datumKort } from "@/lib/weergave";
import type { Vakantie } from "@/services/agenda/HolidayService";

/**
 * De vakanties als lijst (`FR-AGE-08`).
 *
 * Dit is wat er op de telefoon in plaats van de jaarweergave staat. Niet een
 * uitgeklede jaarweergave maar een andere vorm van dezelfde vraag: wanneer ben ik
 * vrij, en hoeveel dagen zijn dat. Twaalf maandkolommen op 390 px zou een raster
 * opleveren waarin een cel kleiner is dan een vingertop.
 */
export function VakantieLijst({
  vakanties,
  zonderSchooljaar,
  onKies,
}: {
  vakanties: readonly Vakantie[];
  zonderSchooljaar: boolean;
  onKies: (vakantie: Vakantie) => void;
}) {
  if (zonderSchooljaar) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nog geen schooljaar ingesteld"
        description="Stel bij Instellingen je schooljaar en je regio in; dan staan je vakanties hier."
      />
    );
  }

  if (vakanties.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Geen vakanties gevonden"
        description="Het vakantiebestand kent dit schooljaar of deze regio nog niet. Ontbrekende vakanties zijn lege dagen, geen fout."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {vakanties.map((vakantie) => (
        <li key={vakantie.holidayKey}>
          {/* Ook een vaste vakantie is te openen: dan staat er wáárom hij vastligt
              in plaats van niets, en dat is wat FR-AGE-09 vraagt. */}
          <button type="button" className="w-full text-left" onClick={() => onKies(vakantie)}>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{vakantie.name}</ItemTitle>
                <ItemDescription>
                  {datumKort(vakantie.from)} tot en met {datumKort(vakantie.to)} ·{" "}
                  {dagenTussen(vakantie.from, vakantie.to) + 1} dagen
                  {vakantie.aangepast ? " · aangepast" : ""}
                  {vakantie.fixed ? " · ligt landelijk vast" : ""}
                </ItemDescription>
              </ItemContent>
            </Item>
          </button>
        </li>
      ))}
    </ul>
  );
}
