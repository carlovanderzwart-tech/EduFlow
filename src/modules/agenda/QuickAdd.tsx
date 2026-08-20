"use client";

import { useState } from "react";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { plusDagen, type IsoDate } from "@/lib/dates";
import { datumLang } from "@/lib/weergave";
import type { Student } from "@/domain/types";
import { SOORTNAMEN } from "@/services/agenda/AgendaService";
import { ontleed, type Herkenning, type Snelveldresultaat } from "@/services/agenda/snelveld";
import { diensten } from "@/services/diensten";

/**
 * Het snelveld (§6.2.5, `FR-AGE-13`, `FR-AGE-14`).
 *
 * Eén regel bovenaan de agenda. Je typt "dinsdag 14u oudergesprek Noa V." en ziet
 * meteen wat de app ervan maakt; Enter bevestigt.
 *
 * **Het concept staat er vóór de bevestiging** (`FR-AGE-14`), en dat is de hele
 * bedoeling: een verkeerde gok verrast je niet maar wordt door jou gecorrigeerd. De
 * herkende woorden staan er als plakkers bij, zodat zichtbaar is *waarom* de app
 * denkt wat hij denkt.
 *
 * **Er gaat niets naar een provider.** De ontleding staat in `snelveld.ts` en kent
 * geen netwerk (`FR-AGE-13`).
 */
interface QuickAddProps {
  dag: IsoDate;
  leerlingen: readonly Student[];
  onKlaar: () => void;
}

/** De kleur per soort herkenning; de tekst zegt het ook, kleur is nooit alleen (NFR-38). */
const PLAKKER: Record<Herkenning["soort"], string> = {
  datum: "Datum",
  tijd: "Tijd",
  duur: "Duur",
  soort: "Soort",
  leerling: "Leerling",
};

export function QuickAdd({ dag, leerlingen, onKlaar }: QuickAddProps) {
  const [regel, setRegel] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const lijst = {
    leerlingen: leerlingen.map((leerling) => ({
      id: leerling.id,
      naam: [leerling.firstName, leerling.lastNameInitial].filter(Boolean).join(" "),
    })),
  };
  const concept = regel.trim() ? ontleed(regel, dag, lijst) : null;

  async function bewaar() {
    if (!concept) return;
    setBezig(true);
    setFout(null);

    const { agenda } = await diensten();
    const uitkomst = await agenda.maak(alsInvoer(concept));
    setBezig(false);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setRegel("");
    onKlaar();
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="snelveld" className="sr-only">
        Snel een item toevoegen
      </Label>
      <form
        className="flex gap-2"
        onSubmit={(gebeurtenis) => {
          gebeurtenis.preventDefault();
          void bewaar();
        }}
      >
        <Input
          id="snelveld"
          value={regel}
          autoComplete="off"
          placeholder="dinsdag 14u oudergesprek Noa V."
          onChange={(gebeurtenis) => setRegel(gebeurtenis.target.value)}
        />
        <Button type="submit" disabled={!concept || bezig}>
          Toevoegen
        </Button>
      </form>

      {concept ? <Concept concept={concept} /> : null}
      {fout ? <ErrorMessage message={fout} nextStep="Pas de regel aan." /> : null}
    </div>
  );
}

/** Het concept-item zoals het wordt, met de herkende woorden erbij (`FR-AGE-14`). */
function Concept({ concept }: { concept: Snelveldresultaat }) {
  const wanneer = concept.van
    ? `${datumLang(concept.dag)} ${concept.van}`
    : `${datumLang(concept.dag)}, hele dag`;

  return (
    <div className="text-muted-foreground space-y-1 text-sm">
      {/* Draagt de titel dezelfde tekst als de soort — omdat er niets overbleef —
          dan staat hij er niet twee keer. */}
      <p>
        <span className="text-foreground font-medium">{SOORTNAMEN[concept.kind]}</span>
        {concept.titel === SOORTNAMEN[concept.kind] ? "" : ` · ${concept.titel}`} · {wanneer}
        {concept.van ? ` · ${concept.duurMinuten} min` : ""}
      </p>
      {concept.herkend.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {concept.herkend.map((herkenning, plaats) => (
            <li key={`${herkenning.soort}-${plaats}`}>
              <Badge variant="secondary">
                {PLAKKER[herkenning.soort]}: {herkenning.woord}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p>Niets herkend; dit wordt een afspraak vandaag met deze tekst als titel.</p>
      )}
    </div>
  );
}

/** Van concept naar wat `AgendaService` verwacht (§6.2.2, INV-31). */
function alsInvoer(concept: Snelveldresultaat) {
  const gemeenschappelijk = {
    title: concept.titel,
    kind: concept.kind,
    studentIds: concept.studentIds,
  };

  if (!concept.van) {
    return { ...gemeenschappelijk, allDay: true as const, start: concept.dag, end: concept.dag };
  }

  // De tijd is een wandkloktijd; hier gaat hij één keer naar UTC (§8.1.4).
  const begin = new Date(`${concept.dag}T${concept.van}:00`);
  const einde = new Date(begin.getTime() + concept.duurMinuten * 60_000);

  return {
    ...gemeenschappelijk,
    allDay: false as const,
    start: begin.toISOString(),
    end: einde.toISOString(),
  };
}

/** De dag waarop een snelveld-item standaard valt: die van de weergave. */
export function standaardDag(anker: IsoDate): IsoDate {
  return plusDagen(anker, 0);
}
