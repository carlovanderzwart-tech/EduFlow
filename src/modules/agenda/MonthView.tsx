"use client";

import { maandraster, type IsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/domain/types";
import type { Vakantie } from "@/services/agenda/HolidayService";

import { DAGNAMEN, isVakantiedag, MAX_ITEMS_PER_CEL, soortklasse } from "./weergavehulp";

/**
 * De maandweergave (§6.2.3).
 *
 * **Altijd zes rijen**, ook als de maand er vier vult. Dat is geen slordigheid maar
 * de eis: bladeren van februari naar maart mag de hoogte van de pagina niet laten
 * springen, want dan verschuift alles eronder mee terwijl je aan het lezen bent.
 *
 * **Vakanties kleuren de cel en verschijnen niet als item.** Een vakantieweek zou
 * anders vijf identieke regels tonen en de rest verdringen.
 */
interface MonthViewProps {
  anker: IsoDate;
  perDag: Map<IsoDate, CalendarEvent[]>;
  vakanties: readonly Vakantie[];
  vandaag: IsoDate;
  onKiesDag: (dag: IsoDate) => void;
}

export function MonthView({ anker, perDag, vakanties, vandaag, onKiesDag }: MonthViewProps) {
  const raster = maandraster(anker);
  const maand = anker.slice(0, 7);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px pb-1">
        {DAGNAMEN.map((naam) => (
          <div key={naam} className="text-muted-foreground text-center text-xs font-medium">
            {naam}
          </div>
        ))}
      </div>

      <div className="bg-border grid grid-cols-7 gap-px overflow-hidden rounded-md border">
        {raster.map((dag) => (
          <Cel
            key={dag}
            dag={dag}
            items={perDag.get(dag) ?? []}
            buitenDeMaand={dag.slice(0, 7) !== maand}
            vakantie={isVakantiedag(dag, vakanties)}
            isVandaag={dag === vandaag}
            onKies={onKiesDag}
          />
        ))}
      </div>
    </div>
  );
}

interface CelProps {
  dag: IsoDate;
  items: CalendarEvent[];
  buitenDeMaand: boolean;
  vakantie: Vakantie | null;
  isVandaag: boolean;
  onKies: (dag: IsoDate) => void;
}

function Cel({ dag, items, buitenDeMaand, vakantie, isVandaag, onKies }: CelProps) {
  // De vakantie kleurt de cel; de items die niet passen worden geteld (§6.2.3).
  const zichtbaar = items.slice(0, MAX_ITEMS_PER_CEL);
  const rest = items.length - zichtbaar.length;

  return (
    <button
      type="button"
      onClick={() => onKies(dag)}
      className={cn(
        "bg-background min-h-24 p-1 text-left align-top",
        buitenDeMaand && "text-muted-foreground",
        vakantie && "bg-muted",
        "hover:bg-accent/5 focus-visible:bg-accent/5",
      )}
    >
      <span
        className={cn(
          "text-xs",
          isVandaag && "bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 font-medium",
        )}
      >
        {Number(dag.slice(8, 10))}
      </span>

      {vakantie ? (
        <span className="text-muted-foreground block truncate text-[0.6875rem]">{vakantie.name}</span>
      ) : null}

      <ul className="space-y-0.5 pt-0.5">
        {zichtbaar.map((item) => (
          <li key={item.id} className={cn("truncate rounded-xs px-1 text-[0.6875rem]", soortklasse(item.kind))}>
            {item.title}
          </li>
        ))}
      </ul>

      {rest > 0 ? <span className="text-muted-foreground text-[0.6875rem]">+{rest} meer</span> : null}
    </button>
  );
}
