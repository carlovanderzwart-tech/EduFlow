"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Item, ItemActions, ItemContent, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import { diensten, type Diensten } from "@/services/diensten";
import { weergavenaam } from "@/services/students/StudentService";

/**
 * Leerlingen (§6.5.2).
 *
 * Twee velden, want INV-29 vraagt om twee: een voornaam, en een beginletter van de
 * achternaam zodra twee kinderen hetzelfde heten. Bij een botsing weigert
 * `StudentService` het opslaan en zegt hij waarom; dit scherm toont die tekst en
 * vertaalt hem niet (§10.3).
 *
 * Wat er nog niet is: geboortedatum, notitie, groepen, samenvoegen, uit dienst en
 * importeren uit een lijst. Die staan in §6.5.2 en §6.5.3.
 */
export function StudentsPage() {
  const [voornaam, setVoornaam] = useState("");
  const [beginletter, setBeginletter] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezigMetOpslaan, setBezigMetOpslaan] = useState(false);

  const laad = useCallback(({ students }: Diensten) => students.lijst(), []);
  const { waarde: leerlingen, fout: laadfout, bezig, herlaad } = useDienst(laad);

  async function voegToe() {
    setBezigMetOpslaan(true);
    setFout(null);

    const { students } = await diensten();
    const uitkomst = await students.voegToe({ firstName: voornaam, lastNameInitial: beginletter });
    setBezigMetOpslaan(false);

    if (!uitkomst.ok) {
      setFout(uitkomst.error.message);
      return;
    }

    setVoornaam("");
    setBeginletter("");
    herlaad();
  }

  async function verwijder(id: string) {
    const { students } = await diensten();
    const uitkomst = await students.verwijder(id);
    if (!uitkomst.ok) {
      setFout(uitkomst.error.message);
      return;
    }
    herlaad();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(gebeurtenis) => {
          gebeurtenis.preventDefault();
          void voegToe();
        }}
      >
        <Field className="min-w-40 flex-1">
          <FieldLabel htmlFor="voornaam">Voornaam</FieldLabel>
          <Input
            id="voornaam"
            value={voornaam}
            autoComplete="off"
            onChange={(gebeurtenis) => setVoornaam(gebeurtenis.target.value)}
          />
        </Field>
        <Field className="w-24">
          <FieldLabel htmlFor="beginletter">Beginletter</FieldLabel>
          <Input
            id="beginletter"
            value={beginletter}
            maxLength={3}
            autoComplete="off"
            onChange={(gebeurtenis) => setBeginletter(gebeurtenis.target.value)}
          />
        </Field>
        <Button type="submit" disabled={bezigMetOpslaan || !voornaam.trim()}>
          <UserPlus aria-hidden="true" />
          Toevoegen
        </Button>
      </form>

      {fout ? <ErrorMessage message={fout} nextStep="Pas de naam aan en probeer het opnieuw." /> : null}
      {laadfout ? (
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      ) : null}

      {bezig && !leerlingen ? <Skeleton className="h-20" /> : null}

      {leerlingen && leerlingen.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nog geen leerlingen"
          description="Voeg de kinderen van je groep toe. EduFlow gebruikt hun namen om ze af te schermen voordat er tekst naar AI gaat."
        />
      ) : null}

      {leerlingen && leerlingen.length > 0 ? (
        <ul className="space-y-2">
          {leerlingen.map((leerling) => (
            <li key={leerling.id}>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>{weergavenaam(leerling)}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${weergavenaam(leerling)} verwijderen`}
                    onClick={() => void verwijder(leerling.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </ItemActions>
              </Item>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
