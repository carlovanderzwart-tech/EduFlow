"use client";

import { ClipboardList, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { BEGINLETTER_MAX, ontleedLijst, type Geplaktenaam } from "@/services/students/StudentService";

/**
 * "Plak een lijst" (FR-INS-01).
 *
 * Twee stappen, en dat is de eis en niet een voorkeur: eerst tonen wat de app
 * gelezen heeft, mét teller, en pas daarna aanmaken. Twintig namen die stilzwijgend
 * ontstaan zijn twintig namen die je één voor één moet nalopen.
 *
 * Het splitsen zelf staat in `StudentService` (DR-15). Dit scherm kent één regel:
 * welk veld het toont.
 */
export function StudentPasteForm({
  onToevoegen,
}: {
  onToevoegen: (regels: Geplaktenaam[]) => Promise<void>;
}) {
  const [tekst, setTekst] = useState("");
  const [regels, setRegels] = useState<Geplaktenaam[] | null>(null);
  const [bezig, setBezig] = useState(false);

  const gelezen = ontleedLijst(tekst);

  function wijzig(plaats: number, deel: Partial<Geplaktenaam>) {
    setRegels((huidige) =>
      (huidige ?? []).map((regel, index) => (index === plaats ? { ...regel, ...deel } : regel)),
    );
  }

  async function bevestig() {
    if (!regels) return;
    setBezig(true);
    await onToevoegen(regels.filter((regel) => regel.firstName.trim().length > 0));
    setBezig(false);
    setRegels(null);
    setTekst("");
  }

  if (regels) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {regels.length === 1 ? "Eén naam gelezen." : `${regels.length} namen gelezen.`} Pas ze aan
          waar het nodig is. Een beginletter houdt twee kinderen met dezelfde voornaam uit elkaar.
        </p>

        <ul className="space-y-2">
          {regels.map((regel, plaats) => (
            <li key={plaats} className="flex flex-wrap items-end gap-2">
              <Input
                aria-label={`Voornaam op regel ${plaats + 1}`}
                className="min-w-40 flex-1"
                value={regel.firstName}
                onChange={(gebeurtenis) => wijzig(plaats, { firstName: gebeurtenis.target.value })}
              />
              <Input
                aria-label={`Beginletter op regel ${plaats + 1}`}
                className="w-24"
                maxLength={BEGINLETTER_MAX}
                value={regel.lastNameInitial}
                onChange={(gebeurtenis) =>
                  wijzig(plaats, { lastNameInitial: gebeurtenis.target.value })
                }
              />
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" disabled={bezig} onClick={() => void bevestig()}>
            <UserPlus aria-hidden="true" />
            {regels.length === 1 ? "Voeg 1 leerling toe" : `Voeg ${regels.length} leerlingen toe`}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setRegels(null)}>
            Terug naar de lijst
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel htmlFor="plaklijst">Plak een lijst</FieldLabel>
        <FieldDescription>
          Eén naam per regel, of gescheiden door komma&apos;s of tabs. Zet een beginletter achter de
          voornaam als twee kinderen hetzelfde heten: &quot;Noa B.&quot;
        </FieldDescription>
        <Textarea
          id="plaklijst"
          rows={4}
          value={tekst}
          onChange={(gebeurtenis) => setTekst(gebeurtenis.target.value)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={gelezen.length === 0}
          onClick={() => setRegels(gelezen)}
        >
          <ClipboardList aria-hidden="true" />
          Lees de lijst
        </Button>
        <span className="text-sm text-muted-foreground">
          {gelezen.length === 0
            ? "Nog geen namen gevonden."
            : gelezen.length === 1
              ? "1 naam gevonden."
              : `${gelezen.length} namen gevonden.`}
        </span>
      </div>
    </div>
  );
}
