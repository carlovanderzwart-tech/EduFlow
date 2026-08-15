"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import { maandagVan, plusDagen, plusMaanden, vandaagIso, type IsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { datumLang } from "@/lib/weergave";
import type { CalendarEvent, Student } from "@/domain/types";
import {
  JAAR_MINIMUM_PX,
  standaardWeergave,
  TELEFOON_MAXIMUM_PX,
  type Weergave,
} from "@/services/agenda/AgendaService";
import type { Vakantie } from "@/services/agenda/HolidayService";
import type { Diensten } from "@/services/diensten";

import { DayView } from "./DayView";
import { ItemDialog } from "./ItemDialog";
import { MonthView } from "./MonthView";
import { VakantieDialoog } from "./VakantieDialoog";
import { VakantieLijst } from "./VakantieLijst";
import { WeekView } from "./WeekView";
import { YearView } from "./YearView";
import { useAgenda } from "./hooks/useAgenda";

/**
 * De agenda (§6.2, `FR-AGE-01`).
 *
 * Vier weergaven op één scherm, met één bron van waarheid eronder: welke periode je
 * ziet en wat er in die periode staat, komt uit `AgendaService` en `HolidayService`.
 * De weergaven tekenen alleen (DR-15).
 *
 * **Op de telefoon bestaat de jaarweergave niet** (`FR-AGE-08`). In plaats daarvan
 * staat er "Vakanties": dezelfde vraag — wanneer ben ik vrij — in een vorm die op
 * 390 px te lezen is. Dat is geen uitgeklede versie maar een andere vorm.
 */
const NAMEN: Record<Weergave, string> = {
  dag: "Dag",
  week: "Week",
  maand: "Maand",
  jaar: "Jaar",
};

/** De laptopbreedte uit §5.2; wat de server aanneemt zolang er geen venster is. */
const SERVERBREEDTE = 1280;

/**
 * De vensterbreedte als externe bron in plaats van als stand.
 *
 * `useSyncExternalStore` en geen effect met `setState`: de breedte is geen stand van
 * dit scherm maar een eigenschap van de browser. Zo is er ook geen tussenrender
 * waarin het scherm nog denkt dat het 1280 px breed is terwijl het een telefoon is.
 *
 * Er wordt op **drie** dingen geluisterd. Op `resize`, en op de twee breekpunten die
 * er werkelijk toe doen: 768 px, waaronder de jaarweergave niet bestaat
 * (`FR-AGE-08`), en 1024 px, waaronder hij ook niet vanzelf opengaat. Een
 * mediaquery vuurt waar een `resize` het soms laat afweten, en het is bovendien de
 * juiste vraag: niet "hoe breed precies", maar "aan welke kant van de grens".
 */
function useVensterbreedte(): number {
  return useSyncExternalStore(
    (opnieuw) => {
      const vragen = [TELEFOON_MAXIMUM_PX, JAAR_MINIMUM_PX].map((grens) =>
        window.matchMedia(`(min-width: ${grens}px)`),
      );
      window.addEventListener("resize", opnieuw);
      for (const vraag of vragen) vraag.addEventListener("change", opnieuw);

      return () => {
        window.removeEventListener("resize", opnieuw);
        for (const vraag of vragen) vraag.removeEventListener("change", opnieuw);
      };
    },
    () => window.innerWidth,
    () => SERVERBREEDTE,
  );
}

export function AgendaPage() {
  const breedte = useVensterbreedte();
  const [gekozen, setGekozen] = useState<Weergave | null>(null);
  const [anker, setAnker] = useState<IsoDate>(vandaagIso());
  const [dialoog, setDialoog] = useState<{ item: CalendarEvent | null } | null>(null);
  const [vakantie, setVakantie] = useState<Vakantie | null>(null);

  const telefoon = breedte < TELEFOON_MAXIMUM_PX;

  // FR-AGE-07: zonder eigen keuze bepalen het seizoen en de schermbreedte waar je
  // begint. Afgeleid en niet opgeslagen — een handmatige keuze wint zodra hij er is
  // en blijft dan staan voor de rest van de sessie.
  const actief = gekozen ?? standaardWeergave(new Date(), breedte);

  const { waarde, fout, bezig, herlaad } = useAgenda(actief, anker);
  const leerlingen = useLeerlingen();

  return (
    <div className="mx-auto max-w-[80rem] space-y-4 p-4 md:p-6">
      <Balk
        weergave={actief}
        telefoon={telefoon}
        titel={titelVan(actief, anker, waarde?.schooljaar?.name, telefoon)}
        onWeergave={setGekozen}
        onSchuif={(richting) => setAnker(schuif(actief, anker, richting))}
        onVandaag={() => setAnker(vandaagIso())}
        onNieuw={() => setDialoog({ item: null })}
      />

      {fout ? <ErrorMessage message={fout.message} nextStep="Vernieuw de pagina." /> : null}
      <Meldingen stand={waarde} />

      {bezig && !waarde ? <Skeleton className="h-96" /> : null}

      {waarde ? (
        <Weergavevlak
          weergave={actief}
          anker={anker}
          stand={waarde}
          telefoon={telefoon}
          onKiesDag={(dag) => {
            setAnker(dag);
            setGekozen("dag");
          }}
          onKiesItem={(item) => setDialoog({ item })}
          onKiesVakantie={setVakantie}
        />
      ) : null}

      <Panelen
        item={dialoog}
        vakantie={vakantie}
        dag={anker}
        leerlingen={leerlingen}
        onSluit={() => {
          setDialoog(null);
          setVakantie(null);
        }}
        onKlaar={() => {
          setDialoog(null);
          setVakantie(null);
          herlaad();
        }}
      />
    </div>
  );
}

/** De twee panelen die over de agenda kunnen schuiven; hoogstens één tegelijk. */
function Panelen({
  item,
  vakantie,
  dag,
  leerlingen,
  onSluit,
  onKlaar,
}: {
  item: { item: CalendarEvent | null } | null;
  vakantie: Vakantie | null;
  dag: IsoDate;
  leerlingen: readonly Student[];
  onSluit: () => void;
  onKlaar: () => void;
}) {
  if (vakantie) {
    return (
      <VakantieDialoog
        vakantie={vakantie}
        onOpenChange={(open) => !open && onSluit()}
        onKlaar={onKlaar}
      />
    );
  }
  if (!item) return null;

  return (
    <ItemDialog
      open
      item={item.item}
      dag={dag}
      leerlingen={leerlingen}
      onOpenChange={(open) => !open && onSluit()}
      onKlaar={onKlaar}
    />
  );
}

/** De leerlingenlijst voor het oudergesprek; hij verandert zelden en laadt apart. */
function useLeerlingen() {
  const laad = useCallback(({ students }: Diensten) => students.lijst(), []);
  return useDienst(laad).waarde ?? [];
}

interface BalkProps {
  weergave: Weergave;
  telefoon: boolean;
  titel: string;
  onWeergave: (weergave: Weergave) => void;
  onSchuif: (richting: -1 | 1) => void;
  onVandaag: () => void;
  onNieuw: () => void;
}

/**
 * De vier knoppen (`FR-AGE-01`, `FR-AGE-08`).
 *
 * Op de telefoon heet de vierde **Vakanties** in plaats van Jaar, en toont hij een
 * lijst in plaats van een raster. Dezelfde plek en dezelfde vraag — wanneer ben ik
 * vrij — in de vorm die op 390 px te lezen is.
 */
const KEUZES: Weergave[] = ["dag", "week", "maand", "jaar"];

function Balk({ weergave, telefoon, titel, onWeergave, onSchuif, onVandaag, onNieuw }: BalkProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {weergave === "jaar" ? null : (
          <>
            <Button variant="outline" size="icon-sm" aria-label="Vorige" onClick={() => onSchuif(-1)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Volgende" onClick={() => onSchuif(1)}>
              <ChevronRight aria-hidden="true" />
            </Button>
            <Button variant="outline" size="sm" onClick={onVandaag}>
              Vandaag
            </Button>
          </>
        )}
        <h1 className="text-base font-medium">{titel}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-md border" role="group" aria-label="Weergave">
          {KEUZES.map((keuze) => (
            <button
              key={keuze}
              type="button"
              aria-pressed={keuze === weergave}
              onClick={() => onWeergave(keuze)}
              className={cn(
                "px-3 py-1.5 text-sm first:rounded-s-md last:rounded-e-md",
                keuze === weergave ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              {keuze === "jaar" && telefoon ? "Vakanties" : NAMEN[keuze]}
            </button>
          ))}
        </div>

        <Button onClick={onNieuw}>
          <Plus aria-hidden="true" />
          Nieuw
        </Button>
      </div>
    </div>
  );
}

interface VlakProps {
  weergave: Weergave;
  anker: IsoDate;
  stand: NonNullable<ReturnType<typeof useAgenda>["waarde"]>;
  telefoon: boolean;
  onKiesDag: (dag: IsoDate) => void;
  onKiesItem: (item: CalendarEvent) => void;
  onKiesVakantie: (vakantie: Vakantie) => void;
}

function Weergavevlak({
  weergave,
  anker,
  stand,
  telefoon,
  onKiesDag,
  onKiesItem,
  onKiesVakantie,
}: VlakProps) {
  const vandaag = vandaagIso();

  if (weergave === "dag") {
    return (
      <DayView
        dag={anker}
        items={stand.perDag.get(anker) ?? []}
        vakanties={stand.vakanties}
        onKiesItem={onKiesItem}
      />
    );
  }

  if (weergave === "week") {
    return (
      <WeekView
        anker={anker}
        perDag={stand.perDag}
        vakanties={stand.vakanties}
        vandaag={vandaag}
        onKiesDag={onKiesDag}
        onKiesItem={onKiesItem}
      />
    );
  }

  if (weergave === "maand") {
    return (
      <MonthView
        anker={anker}
        perDag={stand.perDag}
        vakanties={stand.vakanties}
        vandaag={vandaag}
        onKiesDag={onKiesDag}
      />
    );
  }

  // FR-AGE-08: op de telefoon bestaat de jaarweergave niet, de vakantielijst wel.
  if (telefoon || !stand.schooljaar) {
    return (
      <VakantieLijst
        vakanties={stand.vakanties}
        zonderSchooljaar={!stand.schooljaar}
        onKies={onKiesVakantie}
      />
    );
  }

  return (
    <YearView
      firstSchoolDay={stand.schooljaar.firstSchoolDay}
      dagen={stand.jaardagen}
      vakanties={stand.vakanties}
      tellingen={stand.tellingen}
      onKiesDag={onKiesDag}
      onKiesVakantie={onKiesVakantie}
    />
  );
}

function Melding({ tekst }: { tekst: string }) {
  return <p className="bg-muted rounded-md px-3 py-2 text-sm">{tekst}</p>;
}

/**
 * De twee meldingen die het vakantiebestand kan geven (`FR-AGE-11`, `FR-AGE-12`).
 *
 * Ze staan boven de weergave en niet in een venster: het is informatie, geen vraag.
 * De agenda blijft in beide gevallen gewoon werken.
 */
function Meldingen({ stand }: { stand: ReturnType<typeof useAgenda>["waarde"] }) {
  if (!stand) return null;

  return (
    <>
      {stand.vervalmelding ? <Melding tekst={stand.vervalmelding} /> : null}
      {stand.verschoven.map((vakantie) => (
        <Melding
          key={vakantie.holidayKey}
          tekst={`De landelijke data voor ${vakantie.name} zijn gewijzigd. Jouw aanpassing blijft staan.`}
        />
      ))}
    </>
  );
}

/** Waar je bent, in woorden die bij de weergave passen. */
function titelVan(
  weergave: Weergave,
  anker: IsoDate,
  schooljaar: string | undefined,
  telefoon: boolean,
): string {
  if (weergave === "dag") return datumLang(anker);
  if (weergave === "week") {
    const maandag = maandagVan(anker);
    return `${datumLang(maandag)} – ${datumLang(plusDagen(maandag, 6))}`;
  }
  if (weergave === "maand") return datumLang(anker).replace(/^\d+\s/u, "");

  const kop = telefoon ? "Vakanties" : "Schooljaar";
  return schooljaar ? `${kop} ${schooljaar}` : kop;
}

/** Eén periode vooruit of achteruit, in de eenheid van de weergave. */
function schuif(weergave: Weergave, anker: IsoDate, richting: -1 | 1): IsoDate {
  if (weergave === "dag") return plusDagen(anker, richting);
  if (weergave === "week") return plusDagen(anker, richting * 7);
  if (weergave === "maand") return plusMaanden(anker, richting);
  return anker;
}
