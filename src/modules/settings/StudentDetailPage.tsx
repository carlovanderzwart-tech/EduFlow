"use client";

import { CalendarOff, UserMinus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import { datumKort, vandaag } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import { GROEPSOORTEN } from "@/services/groups/GroupService";
import { weergavenaam } from "@/services/students/StudentService";

/**
 * Het scherm van één leerling (FR-INS-06, FR-INS-04).
 *
 * **Er staat hier geen groep, maar een lijst "Zit in"** — dat is de hele reden dat
 * dit scherm bestaat. FR-INS-06 vraagt er letterlijk om: per regel de groep, het
 * type en de periode, en nergens een veld waarin één groep staat. Wie hier een
 * keuzelijst "groep" zou tekenen, maakt de tien functies onmogelijk die U-07 en
 * B-16 juist mogelijk maken.
 *
 * Meerdere regels tegelijk is normaal en geen van beide is de hoofdgroep
 * (FR-INS-07): Noa V. zit vanaf 3 november in Groep 4 én in de Techniekclub.
 *
 * De tijdlijn over meerdere jaren (FR-INS-10) staat hier niet; die hoort bij een
 * latere stap.
 */
export function StudentDetailPage({ studentId }: { studentId: string }) {
  const [per, setPer] = useState(vandaag());
  const [fout, setFout] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);

  const laad = useCallback(
    async ({ students, groups }: Diensten) => {
      const alle = await students.lijst();
      if (!alle.ok) return alle;

      const groepen = await groups.lijst();
      if (!groepen.ok) return groepen;

      const zitIn = await groups.zitIn(studentId);
      if (!zitIn.ok) return zitIn;

      return {
        ok: true as const,
        value: {
          leerling: alle.value.find((kind) => kind.id === studentId) ?? null,
          groepen: groepen.value,
          zitIn: zitIn.value,
        },
      };
    },
    [studentId],
  );

  const { waarde, fout: laadfout, bezig, herlaad } = useDienst(laad);

  async function uitDienst() {
    const { groups } = await diensten();
    const uitkomst = await groups.uitDienst(studentId, per);

    if (!uitkomst.ok) {
      setMelding(null);
      setFout(uitkomst.error.message);
      return;
    }

    setFout(null);
    setMelding(
      uitkomst.value === 0
        ? "Er liep geen enkel lidmaatschap meer. Er is niets gewijzigd."
        : `${uitkomst.value === 1 ? "Eén lidmaatschap is" : `${uitkomst.value} lidmaatschappen zijn`} afgesloten per ${datumKort(per)}. De documentaties blijven ongewijzigd.`,
    );
    herlaad();
  }

  if (laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  if (bezig && !waarde) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (waarde && !waarde.leerling) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <EmptyState
          icon={UserMinus}
          title="Deze leerling bestaat niet meer"
          description="Hij is verwijderd of de koppeling klopt niet. Ga terug naar de lijst."
        />
        <Link href="/settings/students" className="text-sm underline">
          Terug naar Leerlingen
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <Link href="/settings/students" className="text-sm underline">
          Terug naar Leerlingen
        </Link>
        <h2 className="mt-2 text-xl font-semibold">
          {waarde?.leerling ? weergavenaam(waarde.leerling) : ""}
        </h2>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Zit in</h3>
        {waarde?.zitIn.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen lidmaatschappen. Voeg deze leerling toe aan een groep bij Groepen.
          </p>
        ) : null}
        <ul className="space-y-2">
          {waarde?.zitIn.map((lid) => {
            const groep = waarde.groepen.find((g) => g.id === lid.groupId);
            return (
              <li key={lid.id}>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>{groep?.name ?? "Onbekende groep"}</ItemTitle>
                    <ItemDescription>
                      {groep ? GROEPSOORTEN[groep.kind] : "—"} ·{" "}
                      {lid.to
                        ? `${datumKort(lid.from)} tot ${datumKort(lid.to)}`
                        : `sinds ${datumKort(lid.from)}`}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <Field className="max-w-xs">
          <FieldLabel htmlFor="uit-dienst">Uit dienst per</FieldLabel>
          <FieldDescription>
            Sluit alle lopende lidmaatschappen af op deze datum. De leerling en zijn
            documentaties blijven bestaan.
          </FieldDescription>
          <Input
            id="uit-dienst"
            type="date"
            className="w-44"
            value={per}
            onChange={(gebeurtenis) => setPer(gebeurtenis.target.value)}
          />
        </Field>
        <Button variant="outline" onClick={() => void uitDienst()}>
          <CalendarOff aria-hidden="true" />
          Uit dienst
        </Button>
        {melding ? (
          <p role="status" className="text-sm">
            {melding}
          </p>
        ) : null}
        {fout ? <ErrorMessage message={fout} nextStep="Kies een latere datum." /> : null}
      </section>
    </div>
  );
}
