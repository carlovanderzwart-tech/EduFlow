"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { SaveStatus, type SaveState } from "@/ui/SaveStatus";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import type { Region } from "@/domain/types";
import { diensten } from "@/services/diensten";

export interface Schooljaarformulier {
  name: string;
  firstSchoolDay: string;
  lastSchoolDay: string;
}

/**
 * Het schooljaar (FR-INS-26, §8.3.8).
 *
 * Hij staat hier omdat een groep bij precies één schooljaar hoort (INV-27): zonder
 * dit veld is er geen groep te maken, en dan doet het scherm Groepen niets.
 *
 * Anders dan de vier instellingen ernaast heeft dit formulier wél een knop. Drie
 * velden die elkaar nodig hebben — een naam en twee datums waarvan de tweede na de
 * eerste ligt (INV-28) — zouden bij elke toetsaanslag falen op een halve invoer, en
 * dat is precies de melding die §4.7 verbiedt.
 */
export function SchoolYearForm({
  begin,
  region,
  onOpgeslagen,
}: {
  begin: Schooljaarformulier;
  region: Region;
  onOpgeslagen: () => void;
}) {
  const [formulier, setFormulier] = useState(begin);
  const [status, setStatus] = useState<SaveState>("idle");
  const [fout, setFout] = useState<string | null>(null);

  async function bewaar() {
    setStatus("saving");
    setFout(null);

    const { agenda } = await diensten();
    const uitkomst = await agenda.zetSchooljaar({ ...formulier, region });

    if (!uitkomst.ok) {
      setStatus("idle");
      setFout(uitkomst.error.message);
      return;
    }
    setStatus("saved");
    onOpgeslagen();
  }

  return (
    <form
      className="space-y-4 border-t border-border pt-6"
      onSubmit={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        void bewaar();
      }}
    >
      <Field>
        <FieldLabel htmlFor="schooljaar">Schooljaar</FieldLabel>
        <FieldDescription>
          Bepaalt bij welk jaar je groepen horen en wat &quot;dit schooljaar&quot; betekent in een
          filter.
        </FieldDescription>
        <Input
          id="schooljaar"
          className="max-w-40"
          placeholder="2026-2027"
          value={formulier.name}
          onChange={(gebeurtenis) =>
            setFormulier({ ...formulier, name: gebeurtenis.target.value })
          }
        />
      </Field>

      <div className="flex flex-wrap gap-4">
        <Field className="w-44">
          <FieldLabel htmlFor="eerste-schooldag">Eerste schooldag</FieldLabel>
          <Input
            id="eerste-schooldag"
            type="date"
            value={formulier.firstSchoolDay}
            onChange={(gebeurtenis) =>
              setFormulier({ ...formulier, firstSchoolDay: gebeurtenis.target.value })
            }
          />
        </Field>
        <Field className="w-44">
          <FieldLabel htmlFor="laatste-schooldag">Laatste schooldag</FieldLabel>
          <Input
            id="laatste-schooldag"
            type="date"
            value={formulier.lastSchoolDay}
            onChange={(gebeurtenis) =>
              setFormulier({ ...formulier, lastSchoolDay: gebeurtenis.target.value })
            }
          />
        </Field>
      </div>

      {fout ? <ErrorMessage message={fout} nextStep="Pas de datums aan." /> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving" || !formulier.name.trim()}>
          Schooljaar opslaan
        </Button>
        <SaveStatus state={status} />
      </div>
    </form>
  );
}
