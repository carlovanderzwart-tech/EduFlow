"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import type { Student } from "@/domain/types";
import { diensten } from "@/services/diensten";
import { leeftijdOp, leeftijdTekst, type Leeftijd } from "@/services/students/leeftijd";

/**
 * De geboortedatum van één leerling (`FR-AGE-24`, B-139).
 *
 * **Drie velden en niet één datumveld.** Een `<input type="date">` eist een heel
 * jaar, en `FR-AGE-24` laat juist toe dat het jaar ontbreekt: *"dan wordt dat
 * opgeslagen zonder jaar en verschijnt de verjaardag zonder leeftijd. Dat is
 * dataminimalisatie in de praktijk."* Wie het jaar niet nodig heeft, hoort het niet
 * te hoeven invullen.
 *
 * De leeftijd staat er meteen naast, want dát is waarvoor het jaar wordt gevraagd.
 * Zie je `6,1` verschijnen, dan weet je dat je het goed hebt ingetypt.
 */
export function Geboortedatum({
  leerling,
  onOpgeslagen,
}: {
  leerling: Student;
  onOpgeslagen: () => void;
}) {
  const [dag, setDag] = useState(tekstVan(leerling.birthDay));
  const [maand, setMaand] = useState(tekstVan(leerling.birthMonth));
  const [jaar, setJaar] = useState(tekstVan(leerling.birthYear));
  const [fout, setFout] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);

  const voorbeeld = leeftijdOp(
    { birthDay: getalVan(dag), birthMonth: getalVan(maand), birthYear: getalVan(jaar) },
    new Date(),
  );

  async function bewaar() {
    const uitkomst = await opslaan(leerling.id, { dag, maand, jaar });

    if (!uitkomst.ok) {
      setMelding(null);
      return setFout(uitkomst.error.message);
    }

    setFout(null);
    setMelding(voorbeeld ? `Opgeslagen. Leeftijd nu: ${leeftijdTekst(voorbeeld)}.` : "Opgeslagen.");
    onOpgeslagen();
  }

  return (
    <section className="border-border space-y-3 border-t pt-6">
      <Field>
        <FieldLabel htmlFor="geboortedag">Geboortedatum</FieldLabel>
        <FieldDescription>
          Alleen nodig voor de verjaardag en de leeftijd achter de naam. Het jaar mag je
          weglaten; dan verschijnt er geen leeftijd. Leeglaten mag ook.
        </FieldDescription>
        <Velden
          dag={dag}
          maand={maand}
          jaar={jaar}
          leeftijd={voorbeeld}
          onDag={setDag}
          onMaand={setMaand}
          onJaar={setJaar}
        />
      </Field>

      <Button variant="outline" onClick={() => void bewaar()}>
        Geboortedatum opslaan
      </Button>

      {melding ? (
        <p role="status" className="text-sm">
          {melding}
        </p>
      ) : null}
      {fout ? <ErrorMessage message={fout} nextStep="Pas de datum aan." /> : null}
    </section>
  );
}

/** De drie velden naast elkaar, met de uitkomst ernaast zodra hij er is. */
function Velden({
  dag,
  maand,
  jaar,
  leeftijd,
  onDag,
  onMaand,
  onJaar,
}: {
  dag: string;
  maand: string;
  jaar: string;
  leeftijd: Leeftijd | null;
  onDag: (waarde: string) => void;
  onMaand: (waarde: string) => void;
  onJaar: (waarde: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Getal id="geboortedag" label="Dag" waarde={dag} max={31} onWijzig={onDag} />
      <Getal id="geboortemaand" label="Maand" waarde={maand} max={12} onWijzig={onMaand} />
      <Getal id="geboortejaar" label="Jaar" waarde={jaar} max={9999} breed onWijzig={onJaar} />

      {leeftijd ? (
        <p className="pb-2 text-sm" aria-live="polite">
          Leeftijd: <strong>{leeftijdTekst(leeftijd)}</strong>
        </p>
      ) : null}
    </div>
  );
}

function Getal({
  id,
  label,
  waarde,
  max,
  breed = false,
  onWijzig,
}: {
  id: string;
  label: string;
  waarde: string;
  max: number;
  breed?: boolean;
  onWijzig: (waarde: string) => void;
}) {
  return (
    <Field className={breed ? "w-24" : "w-20"}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={waarde}
        onChange={(gebeurtenis) => onWijzig(gebeurtenis.target.value)}
      />
    </Field>
  );
}

/** De drie velden omzetten naar getallen en wegschrijven; de regels staan in de service. */
async function opslaan(id: Student["id"], velden: { dag: string; maand: string; jaar: string }) {
  const { students } = await diensten();
  return students.zetGeboortedatum(id, {
    dag: getalVan(velden.dag),
    maand: getalVan(velden.maand),
    jaar: getalVan(velden.jaar),
  });
}

function tekstVan(getal: number | null): string {
  return getal === null ? "" : String(getal);
}

/** Een leeg veld is `null` en niet nul; nul is geen dag en geen maand. */
function getalVan(tekst: string): number | null {
  const getal = Number(tekst.trim());
  return tekst.trim() === "" || Number.isNaN(getal) || getal <= 0 ? null : getal;
}
