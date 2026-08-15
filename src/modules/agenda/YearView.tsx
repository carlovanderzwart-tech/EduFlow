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
 * **Kleur is nooit de enige drager** (NFR-38). Elke cel draagt een `title` met de
 * datum en wat er die dag is, de legenda staat ernaast, en een studiedag krijgt een
 * stip bovenop zijn kleur.
 *
 * De cellen zijn klein en dat is de bedoeling: 31 rijen maal 12 kolommen moet op
 * 1280 px passen zonder schuiven. De cel is aanklikbaar en opent de dag.
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
          <div key={`leeg-${plaats}`} className="h-3.5" aria-hidden="true" />
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
  const dagnummer = Number(dag.dag.slice(8, 10));
  const maand = MAANDNAMEN[Number(dag.dag.slice(5, 7)) - 1]!;
  const wat = dag.label || SOORTNAAM[dag.soort];

  return `${dagnummer} ${maand}${wat ? ` — ${wat}` : ""}`;
}

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
        "h-3.5 w-full rounded-xs border border-transparent",
        dag.soort === "buiten" && "bg-transparent",
        dag.soort === "schooldag" && "bg-background border-border",
        dag.soort === "weekend" && "bg-muted",
        dag.soort === "studiedag" && "bg-foreground",
        dag.soort === "margedag" && "bg-muted-foreground",
        dag.soort !== "buiten" && "hover:border-accent focus-visible:border-accent",
      )}
    />
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
