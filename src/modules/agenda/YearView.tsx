"use client";

import { dagenInMaand, type IsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Vakantie } from "@/services/agenda/HolidayService";
import { jaarmaanden, type Jaardag, type Jaartellingen } from "@/services/agenda/schooljaar";

/**
 * De jaarweergave (§6.2.3, `FR-AGE-06`, B-10).
 *
 * Dit is de weergave waar het succescriterium aan hangt: *het schooljaar past in één
 * overzicht*. Twaalf maandkolommen naast elkaar, elke kolom een verticale strook van
 * 31 dagcellen. Schooldagen wit, weekenden lichtgrijs, vakanties gekleurd per soort,
 * studiedagen en margedagen met een markering.
 *
 * **Kleur is nooit de enige drager** (NFR-38). Elke cel draagt zijn dagnummer, een
 * `title` met de datum en wat er die dag is, en de legenda staat ernaast.
 *
 * **Het dagnummer staat in de cel** (`FR-AGE-32`, B-129). Zonder nummer is de vraag
 * "welke dag is dit" alleen te beantwoorden door rijen te tellen vanaf de bovenkant
 * van de kolom, en dat doet niemand — je klikt en kijkt wat er opent.
 *
 * **Een stip zegt dat er iets staat** (`FR-AGE-33`, B-129). Zonder stip is de
 * jaarweergave een vakantiekalender: hij toont wat de school besloot en niet wat jij
 * hebt afgesproken.
 *
 * De cellen zijn klein en dat is de bedoeling: 31 rijen maal 12 kolommen moet op
 * 1280 px passen zonder schuiven (`FR-AGE-06`). De cel is aanklikbaar en opent de dag.
 */

const MAANDNAMEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

/** De langste maand; elke kolom is even hoog zodat het raster niet zaagt. */
const MAX_DAGEN = 31;

/**
 * Een kleur per vakantiesoort.
 *
 * De waarden komen uit `tokens.css` en staan hier als tekenverwijzing en niet als
 * kleur; dat is wat DR-55 vraagt. De reekskleuren worden hergebruikt omdat ze al
 * op contrast zijn getoetst en er geen aparte vakantieschaal in §5.5 staat.
 */
const VAKANTIEKLEUR: Record<string, string> = {
  herfst: "var(--palette-series-6)",
  kerst: "var(--palette-series-3)",
  voorjaar: "var(--palette-series-8)",
  mei: "var(--palette-series-4)",
  zomer: "var(--palette-series-5)",
};

const RESERVEKLEUR = "var(--palette-series-2)";

interface YearViewProps {
  firstSchoolDay: IsoDate;
  dagen: Map<IsoDate, Jaardag>;
  vakanties: readonly Vakantie[];
  tellingen: Jaartellingen;
  onKiesDag: (dag: IsoDate) => void;
  onKiesVakantie: (vakantie: Vakantie) => void;
}

export function YearView({
  firstSchoolDay,
  dagen,
  vakanties,
  tellingen,
  onKiesDag,
  onKiesVakantie,
}: YearViewProps) {
  const maanden = jaarmaanden(firstSchoolDay, dagen);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-1">
          {maanden.map((maand) => (
            <Maandkolom key={maand.maand} maand={maand.maand} dagen={maand.dagen} onKiesDag={onKiesDag} />
          ))}
        </div>

        <Legenda vakanties={vakanties} onKies={onKiesVakantie} />
      </div>

      <Tellingen tellingen={tellingen} />
    </div>
  );
}

function Maandkolom({
  maand,
  dagen,
  onKiesDag,
}: {
  maand: IsoDate;
  dagen: Jaardag[];
  onKiesDag: (dag: IsoDate) => void;
}) {
  const naam = MAANDNAMEN[Number(maand.slice(5, 7)) - 1]!;
  const leeg = MAX_DAGEN - dagenInMaand(maand);

  return (
    <div className="min-w-0">
      <div className="truncate pb-1 text-center text-xs font-medium" title={`${naam} ${maand.slice(0, 4)}`}>
        {naam.slice(0, 3)}
      </div>
      <div className="flex flex-col gap-px">
        {dagen.map((dag) => (
          <Dagcel key={dag.dag} dag={dag} onKies={onKiesDag} />
        ))}
        {Array.from({ length: leeg }, (_, plaats) => (
          <div key={`leeg-${plaats}`} className="h-4" aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}

/** De naam van een dagsoort, voor wie de kleur niet ziet (NFR-38). */
const SOORTNAAM: Record<Jaardag["soort"], string> = {
  vakantie: "vakantie",
  studiedag: "studiedag",
  margedag: "margedag",
  weekend: "weekend",
  schooldag: "schooldag",
  buiten: "",
};

/** Wat er op de cel te lezen valt als je erop staat. Kleur is nooit de enige drager. */
function omschrijving(dag: Jaardag): string {
  const maand = MAANDNAMEN[Number(dag.dag.slice(5, 7)) - 1]!;
  const wat = dag.label || SOORTNAAM[dag.soort];
  // De stip is een tweede drager naast de kleur, en dit is de derde: wie de cel
  // niet ziet, hoort hier wat erop staat (NFR-38).
  const staat =
    dag.items === 0 ? "" : dag.items === 1 ? " — 1 afspraak" : ` — ${dag.items} afspraken`;

  return `${dagnummer(dag)} ${maand}${wat ? ` — ${wat}` : ""}${staat}`;
}

/** Het getal in de cel: 1 tot en met 31, zonder voorloopnul. */
function dagnummer(dag: Jaardag): number {
  return Number(dag.dag.slice(8, 10));
}

/**
 * De letterkleur per dagsoort.
 *
 * Nodig omdat het dagnummer op vijf verschillende ondergronden komt te staan, en
 * §5.3 vraagt overal 4,5:1. Nagemeten in de browser, licht thema:
 *
 * | soort     | letter op vulling                  | contrast |
 * |-----------|------------------------------------|----------|
 * | vakantie  | wit op `series-1` t/m `series-8`    | 4,75-7,08|
 * | studiedag | `background` op `foreground`        | 19,1     |
 * | margedag  | `background` op `muted-foreground`  | 4,7      |
 * | weekend   | `foreground` op `muted`             | 19,1     |
 * | schooldag | `foreground` op `background`        | 20,9     |
 * | buiten    | `muted-foreground` op de pagina     | 4,7      |
 *
 * Het weekend krijgt bewust de gewone letterkleur en niet de gedempte: die haalde
 * op `bg-muted` 4,34 en dat is te weinig. Dat de weekendkolom terugtreedt doet de
 * vulling al; daar hoeft de letter niet nog eens aan mee te helpen.
 *
 * Voor vakantie staat de kleur vast en niet op een rol die met het thema meedraait,
 * want de vulling doet dat namelijk óók niet: `series-*` is dezelfde hex in beide
 * thema's.
 */
const LETTERKLEUR: Record<Jaardag["soort"], string> = {
  vakantie: "text-(--color-text-on-accent)",
  studiedag: "text-background",
  margedag: "text-background",
  weekend: "text-foreground",
  schooldag: "text-foreground",
  buiten: "text-muted-foreground",
};

function Dagcel({ dag, onKies }: { dag: Jaardag; onKies: (dag: IsoDate) => void }) {
  const vakantie = dag.soort === "vakantie";
  const kleur = vakantie ? (VAKANTIEKLEUR[dag.holidayKey ?? ""] ?? RESERVEKLEUR) : undefined;

  return (
    <button
      type="button"
      title={omschrijving(dag)}
      aria-label={omschrijving(dag)}
      disabled={dag.soort === "buiten"}
      onClick={() => onKies(dag.dag)}
      style={vakantie ? { backgroundColor: kleur } : undefined}
      className={cn(
        "flex h-4 w-full items-center justify-between gap-px rounded-xs border border-transparent px-0.5 tabular-nums",
        "text-2xs leading-none",
        LETTERKLEUR[dag.soort],
        dag.soort === "buiten" && "bg-transparent",
        dag.soort === "schooldag" && "bg-background border-border",
        dag.soort === "weekend" && "bg-muted",
        dag.soort === "studiedag" && "bg-foreground",
        dag.soort === "margedag" && "bg-muted-foreground",
        dag.soort !== "buiten" && "hover:border-accent focus-visible:border-accent",
      )}
    >
      {/* Verborgen voor de voorleesfunctie: het `aria-label` hierboven zegt al
          "17 september — schooldag — 2 afspraken". Zonder dit leest hij "17" en
          dan dezelfde zin nog eens. */}
      <span aria-hidden="true">{dagnummer(dag)}</span>
      {dag.items > 0 ? (
        <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-current" />
      ) : null}
    </button>
  );
}

function Legenda({
  vakanties,
  onKies,
}: {
  vakanties: readonly Vakantie[];
  onKies: (vakantie: Vakantie) => void;
}) {
  return (
    <div className="w-56 shrink-0 space-y-1 text-xs">
      <h3 className="font-medium">Legenda</h3>
      <ul className="space-y-1">
        {vakanties.map((vakantie) => (
          <li key={vakantie.holidayKey}>
            {/* Ook een vaste vakantie is te openen: dan staat er wáárom hij
                vastligt in plaats van niets (FR-AGE-09). */}
            <button
              type="button"
              onClick={() => onKies(vakantie)}
              className="hover:bg-muted flex w-full items-start gap-2 rounded-xs p-0.5 text-left"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 size-3 shrink-0 rounded-xs"
                style={{ backgroundColor: VAKANTIEKLEUR[vakantie.holidayKey] ?? RESERVEKLEUR }}
              />
              <span className="min-w-0">
                <span className="block truncate">{vakantie.name}</span>
                <span className="text-muted-foreground">
                  {kort(vakantie.from)} – {kort(vakantie.to)}
                  {vakantie.aangepast ? " · aangepast" : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="bg-foreground size-3 shrink-0 rounded-xs" />
          Studiedag
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="bg-muted-foreground size-3 shrink-0 rounded-xs" />
          Margedag
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="bg-muted size-3 shrink-0 rounded-xs" />
          Weekend
        </li>
        {/* `FR-AGE-33`: de stip staat in de legenda, want een merkteken dat je
            nergens uitgelegd ziet is een vlekje. */}
        <li className="flex items-center gap-2">
          <span className="flex size-3 shrink-0 items-center justify-end">
            <span aria-hidden="true" className="bg-foreground size-1 rounded-full" />
          </span>
          Er staat iets in de agenda
        </li>
      </ul>
    </div>
  );
}

function Tellingen({ tellingen }: { tellingen: Jaartellingen }) {
  return (
    <p className="text-muted-foreground text-sm">
      {tellingen.schooldagen} schooldagen · {tellingen.studiedagen} studiedagen ·{" "}
      {tellingen.margedagen} margedagen · {tellingen.vakantiedagen} vakantiedagen
    </p>
  );
}

/** "17 okt", kort genoeg voor de legenda. */
function kort(dag: IsoDate): string {
  return `${Number(dag.slice(8, 10))} ${MAANDNAMEN[Number(dag.slice(5, 7)) - 1]!.slice(0, 3)}`;
}
