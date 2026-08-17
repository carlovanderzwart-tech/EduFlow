"use client";

import { useRouter } from "next/navigation";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Skeleton } from "@/ui/skeleton";
import { dagenTussen, vandaagIso, type IsoDate } from "@/lib/dates";
import { datumKort, datumLang, tijdstipKort } from "@/lib/weergave";
import type { CalendarEvent, Documentation } from "@/domain/types";
import { SOORTNAMEN, type EigenSoort } from "@/services/agenda/AgendaService";
import type { Vakantie } from "@/services/agenda/HolidayService";
import { AANDACHT_REGEL, type Aandachtleerling } from "@/services/documentation/aandacht";

import { Block, Leeg, Regel } from "./Block";
import {
  BACKUP_DRINGEND_DAGEN,
  useDashboard,
  type Dashboardstand,
} from "./hooks/useDashboard";

/**
 * Het dashboard (§6.4).
 *
 * **Vier blokken, niet vijf.** Het blok Postvak vervalt met B-106: er is geen postbus
 * meer, en een blok dat "koppel je postbus" zegt over een koppeling die niet bestaat is
 * erger dan geen blok.
 *
 * Twee kolommen op de laptop, één op de telefoon. Boven de kolommen één regel met de
 * datum in woorden en **geen begroeting met naam** — "Goedemorgen Ilse" verouderd slecht
 * en voegt niets toe (§6.4.5).
 */
export function DashboardPage() {
  const router = useRouter();
  const { waarde, fout, bezig } = useDashboard();

  if (fout) {
    return (
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <ErrorMessage message={fout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <h1 className="text-lg font-medium">{hoofdregel(waarde?.vandaag)}</h1>

      {bezig && !waarde ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : null}

      {waarde ? <Blokken stand={waarde} onGa={(pad) => router.push(pad)} /> : null}
    </div>
  );
}

/** "Vrijdag 7 augustus" — de datum in woorden, zonder naam (§6.4.5). */
function hoofdregel(vandaag: IsoDate | undefined): string {
  const dag = vandaag ?? vandaagIso();
  const naam = new Intl.DateTimeFormat("nl-NL", { weekday: "long" }).format(
    new Date(`${dag}T12:00:00.000Z`),
  );
  return `${naam.charAt(0).toUpperCase()}${naam.slice(1)} ${datumLang(dag).replace(/\s\d{4}$/u, "")}`;
}

function Blokken({ stand, onGa }: { stand: Dashboardstand; onGa: (pad: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DezeWeek stand={stand} onGa={onGa} className="md:row-span-2" />
      <VerderWerkenAan concepten={stand.concepten} onGa={onGa} />
      {/* FR-DAS-07: staat het uit, dan is het blok er niet — het loopt niet leeg. */}
      {stand.aandachtAan ? <Aandacht rijen={stand.aandacht} onGa={onGa} /> : null}
      <Backup laatste={stand.laatsteBackup} onGa={onGa} />
    </div>
  );
}

/** Deze week (§6.4.2), met de vakantie en de studiedag van `FR-DAS-04` en `-05`. */
function DezeWeek({
  stand,
  onGa,
  className,
}: {
  stand: Dashboardstand;
  onGa: (pad: string) => void;
  className?: string;
}) {
  const overige = stand.week.filter((item) => item.id !== stand.studiedagVandaag?.id);
  const leeg = !stand.studiedagVandaag && !stand.vakantieNu && overige.length === 0;

  return (
    <Block kop="Deze week" knop={{ label: "Open agenda", onClick: () => onGa("/agenda") }} className={className}>
      {leeg ? (
        <Leeg tekst="Deze week staat er niets in je agenda." />
      ) : (
        <ul>
          {stand.vakantieNu ? <Vakantieregels vakantie={stand.vakantieNu} eerste={stand.eersteSchooldag} /> : null}
          {stand.studiedagVandaag ? (
            <Regel gemarkeerd onClick={() => onGa("/agenda")}>
              {stand.studiedagVandaag.title}
            </Regel>
          ) : null}
          {overige.map((item) => (
            <Regel key={item.id} onClick={() => onGa("/agenda")}>
              {wanneer(item)} · {item.title}
            </Regel>
          ))}
        </ul>
      )}
    </Block>
  );
}

/** `FR-DAS-04`: de vakantie, en daaronder de eerstvolgende schooldag. */
function Vakantieregels({ vakantie, eerste }: { vakantie: Vakantie; eerste: IsoDate | null }) {
  return (
    <>
      <Regel gemarkeerd>
        {vakantie.name}, tot en met {datumLang(vakantie.to)}
      </Regel>
      {eerste ? <Regel>Eerste schooldag: {datumLang(eerste)}</Regel> : null}
    </>
  );
}

/** `FR-DAS-01`, `FR-DAS-02`: vijf concepten op `updatedAt`. */
function VerderWerkenAan({
  concepten,
  onGa,
}: {
  concepten: Documentation[];
  onGa: (pad: string) => void;
}) {
  return (
    <Block
      kop="Verder werken aan"
      knop={{ label: "Nieuwe documentatie", onClick: () => onGa("/documentation/nieuw") }}
    >
      {concepten.length === 0 ? (
        <Leeg tekst="Je hebt geen documentaties in bewerking." />
      ) : (
        <ul>
          {concepten.map((doc) => (
            <Regel key={doc.id} onClick={() => onGa(`/documentation/${doc.id}`)}>
              {doc.title || "Zonder titel"} · {datumKort(doc.date)}
            </Regel>
          ))}
        </ul>
      )}
      {/* De drie mailconcepten van FR-DAS-01 komen in D10; de mailmodule bestaat nog
          niet. Een tussenkopje zonder inhoud zou beloven wat er niet is. */}
    </Block>
  );
}

/**
 * `FR-DAS-06`: een geheugensteun, geen signaal.
 *
 * Geen score, geen kleur, geen sortering die een oordeel suggereert — alleen het aantal
 * schooldagen, en de verplichte regel eronder.
 */
function Aandacht({ rijen, onGa }: { rijen: Aandachtleerling[]; onGa: (pad: string) => void }) {
  return (
    <Block
      kop="Aandacht"
      voetregel={AANDACHT_REGEL}
      knop={{ label: "Open leerlingen", onClick: () => onGa("/settings/students") }}
    >
      {rijen.length === 0 ? (
        <Leeg tekst="Alle leerlingen komen recent voor." />
      ) : (
        <ul>
          {rijen.map(({ student, schooldagen }) => (
            <Regel key={student.id}>
              {[student.firstName, student.lastNameInitial].filter(Boolean).join(" ")} ·{" "}
              {schooldagen === null ? "nog niet gekoppeld" : `${schooldagen} schooldagen`}
            </Regel>
          ))}
        </ul>
      )}
    </Block>
  );
}

/** `FR-DAS-03`: na dertig dagen een waarschuwingsrand en een tekst die het uitlegt. */
function Backup({ laatste, onGa }: { laatste: string | null; onGa: (pad: string) => void }) {
  const dagen = laatste ? dagenTussen(laatste.slice(0, 10), vandaagIso()) : null;
  const dringend = dagen === null || dagen > BACKUP_DRINGEND_DAGEN;

  return (
    <Block
      kop="Back-up"
      dringend={dringend}
      knop={{ label: "Back-up maken", onClick: () => onGa("/settings") }}
    >
      {laatste === null ? (
        <Leeg tekst="Je hebt nog geen back-up gemaakt." />
      ) : dringend ? (
        <p>
          Je laatste back-up is van {datumLang(laatste.slice(0, 10))}. Op dit apparaat is dat je
          enige beveiliging tegen verlies.
        </p>
      ) : (
        <p>Je laatste back-up is van {datumLang(laatste.slice(0, 10))}.</p>
      )}
    </Block>
  );
}

/** Wanneer een item is, in de vorm die bij zijn variant past (INV-31). */
function wanneer(item: CalendarEvent): string {
  if (item.allDay) return `${datumKort(item.start)} · ${SOORTNAMEN[item.kind as EigenSoort] ?? item.kind}`;
  return tijdstipKort(item.start);
}
