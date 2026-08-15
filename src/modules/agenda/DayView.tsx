"use client";

import { cn } from "@/lib/utils";
import { type IsoDate } from "@/lib/dates";
import { datumLang, tijdstipKort } from "@/lib/weergave";
import type { CalendarEvent } from "@/domain/types";
import type { Vakantie } from "@/services/agenda/HolidayService";

import { DAG_BEGINUUR, DAG_EINDUUR, isVakantiedag, soortklasse } from "./weergavehulp";

/**
 * De dagweergave (§6.2.3), de standaard op de telefoon.
 *
 * Een verticale tijdlijn van 07:00 tot 18:00 met hele-dag-items als strook bovenaan.
 * **Een item buiten dat venster schuift het venster op** in plaats van eruit te
 * vallen: een ouderavond om half acht 's avonds hoort te staan waar hij is, en een
 * item dat je niet ziet is erger dan een tijdlijn die een uur langer is.
 */
interface DayViewProps {
  dag: IsoDate;
  items: CalendarEvent[];
  vakanties: readonly Vakantie[];
  onKiesItem: (item: CalendarEvent) => void;
}

/** Het uur waarop een item begint, in lokale tijd. */
function uurVan(tijdstip: string): number {
  return new Date(tijdstip).getHours();
}

/** Het venster: 07:00-18:00, opgerekt tot alles erin past. */
function venster(items: CalendarEvent[]): number[] {
  const uren = items.filter((item) => !item.allDay).flatMap((item) => [uurVan(item.start), uurVan(item.end)]);
  const van = Math.min(DAG_BEGINUUR, ...uren);
  const tot = Math.max(DAG_EINDUUR, ...uren);

  return Array.from({ length: tot - van + 1 }, (_, plaats) => van + plaats);
}

export function DayView({ dag, items, vakanties, onKiesItem }: DayViewProps) {
  const vakantie = isVakantiedag(dag, vakanties);
  const heleDag = items.filter((item) => item.allDay);
  const metTijd = items.filter((item) => !item.allDay);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">{datumLang(dag)}</h2>

      {vakantie ? (
        <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">{vakantie.name}</p>
      ) : null}

      {heleDag.length > 0 ? (
        <ul className="space-y-1">
          {heleDag.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onKiesItem(item)}
                className={cn("w-full rounded-md px-3 py-2 text-left text-sm", soortklasse(item.kind))}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="divide-border divide-y rounded-md border">
        {venster(items).map((uur) => (
          <Uurrij
            key={uur}
            uur={uur}
            items={metTijd.filter((item) => uurVan(item.start) === uur)}
            onKiesItem={onKiesItem}
          />
        ))}
      </div>
    </div>
  );
}

function Uurrij({
  uur,
  items,
  onKiesItem,
}: {
  uur: number;
  items: CalendarEvent[];
  onKiesItem: (item: CalendarEvent) => void;
}) {
  return (
    <div className="flex min-h-10 gap-3 px-3 py-1">
      <span className="text-muted-foreground w-12 shrink-0 pt-1 text-xs tabular-nums">
        {String(uur).padStart(2, "0")}:00
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onKiesItem(item)}
            className={cn("block w-full truncate rounded-xs px-2 py-1 text-left text-sm", soortklasse(item.kind))}
          >
            {tijdstipKort(item.start).split(" ").pop()} {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
