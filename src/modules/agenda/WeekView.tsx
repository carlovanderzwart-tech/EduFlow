"use client";

import { dagenVan, maandagVan, plusDagen, type IsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { tijdstipKort } from "@/lib/weergave";
import type { CalendarEvent } from "@/domain/types";
import type { Vakantie } from "@/services/agenda/HolidayService";

import { DAGNAMEN, isVakantiedag, soortklasse } from "./weergavehulp";

/**
 * De weekweergave (§6.2.3).
 *
 * Zeven kolommen, met **zaterdag en zondag op een kwart breedte**: daar staat zelden
 * iets, maar het weekend moet wel zichtbaar blijven. Hele-dag-items staan als balk
 * onder de dagnamen, en een vakantie loopt daar als één doorlopende balk overheen in
 * plaats van als zeven losse blokjes.
 *
 * De huidige dag krijgt een gemarkeerde **kolomkop** en geen gekleurde achtergrond;
 * dat laatste vecht met de items die erin staan.
 */
interface WeekViewProps {
  anker: IsoDate;
  perDag: Map<IsoDate, CalendarEvent[]>;
  vakanties: readonly Vakantie[];
  vandaag: IsoDate;
  onKiesDag: (dag: IsoDate) => void;
  onKiesItem: (item: CalendarEvent) => void;
}

export function WeekView({
  anker,
  perDag,
  vakanties,
  vandaag,
  onKiesDag,
  onKiesItem,
}: WeekViewProps) {
  const maandag = maandagVan(anker);
  const dagen = dagenVan(maandag, plusDagen(maandag, 6));

  return (
    <div className="space-y-2">
      <Vakantiebalk dagen={dagen} vakanties={vakanties} />

      <div className="grid grid-cols-[repeat(5,1fr)_repeat(2,0.25fr)] gap-px">
        {dagen.map((dag, plaats) => (
          <Dagkolom
            key={dag}
            dag={dag}
            naam={DAGNAMEN[plaats]!}
            items={perDag.get(dag) ?? []}
            isVandaag={dag === vandaag}
            onKiesDag={onKiesDag}
            onKiesItem={onKiesItem}
          />
        ))}
      </div>
    </div>
  );
}

/** Eén doorlopende balk per vakantie, in plaats van zeven losse blokjes. */
function Vakantiebalk({
  dagen,
  vakanties,
}: {
  dagen: IsoDate[];
  vakanties: readonly Vakantie[];
}) {
  const geraakt = vakanties.filter((vakantie) =>
    dagen.some((dag) => vakantie.from <= dag && dag <= vakantie.to),
  );
  if (geraakt.length === 0) return null;

  return (
    <ul className="space-y-1">
      {geraakt.map((vakantie) => (
        <li key={vakantie.holidayKey} className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
          {vakantie.name}
        </li>
      ))}
    </ul>
  );
}

interface DagkolomProps {
  dag: IsoDate;
  naam: string;
  items: CalendarEvent[];
  isVandaag: boolean;
  onKiesDag: (dag: IsoDate) => void;
  onKiesItem: (item: CalendarEvent) => void;
}

function Dagkolom({ dag, naam, items, isVandaag, onKiesDag, onKiesItem }: DagkolomProps) {
  const heleDag = items.filter((item) => item.allDay);
  const metTijd = items.filter((item) => !item.allDay);

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => onKiesDag(dag)}
        className={cn(
          "w-full rounded-t-md border-b-2 px-1 py-1 text-center text-xs",
          isVandaag ? "border-accent text-accent font-medium" : "border-border text-muted-foreground",
        )}
      >
        <span className="block truncate">{naam}</span>
        <span className="block">{Number(dag.slice(8, 10))}</span>
      </button>

      <div className="min-h-40 space-y-1 p-1">
        {heleDag.map((item) => (
          <Blokje key={item.id} item={item} onKies={onKiesItem} />
        ))}
        {metTijd.map((item) => (
          <Blokje key={item.id} item={item} onKies={onKiesItem} metTijd />
        ))}
      </div>
    </div>
  );
}

function Blokje({
  item,
  onKies,
  metTijd = false,
}: {
  item: CalendarEvent;
  onKies: (item: CalendarEvent) => void;
  metTijd?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onKies(item)}
      className={cn("block w-full truncate rounded-xs px-1 py-0.5 text-left text-xs", soortklasse(item.kind))}
    >
      {metTijd ? `${tijdstipKort(item.start).split(" ").pop()} ` : ""}
      {item.title}
    </button>
  );
}
