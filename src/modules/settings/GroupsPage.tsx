"use client";

import { Users } from "lucide-react";
import { useCallback, useState } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import type { GroupKind } from "@/domain/types";
import { diensten, type Diensten } from "@/services/diensten";
import { GROEPSOORTEN } from "@/services/groups/GroupService";
import { volgendeKleur } from "@/services/series/SeriesService";

import { GroupMembers } from "./GroupMembers";

/**
 * Groepen en lidmaatschappen (§6.5.2).
 *
 * Een groep hoort bij precies één schooljaar (INV-27). Is er nog geen schooljaar,
 * dan kan er geen groep bestaan en zegt het scherm dat in plaats van een formulier
 * te tonen dat bij het opslaan faalt (§4.7).
 *
 * De jaarovergang (FR-INS-09) en de tijdlijn per kind (FR-INS-10) staan hier niet;
 * die horen bij een latere stap.
 */
export function GroupsPage() {
  const [naam, setNaam] = useState("");
  const [soort, setSoort] = useState<GroupKind>("stamgroep");
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback(async ({ groups, students, storage }: Diensten) => {
    const groepen = await groups.lijst();
    if (!groepen.ok) return groepen;

    const leerlingen = await students.lijst();
    if (!leerlingen.ok) return leerlingen;

    const lidmaatschappen = await storage.list("groupMemberships");
    if (!lidmaatschappen.ok) return lidmaatschappen;

    const jaren = await storage.list("schoolYears");
    if (!jaren.ok) return jaren;

    return {
      ok: true as const,
      value: {
        groepen: groepen.value,
        leerlingen: leerlingen.value,
        lidmaatschappen: lidmaatschappen.value,
        schoolYearId: (jaren.value.find((jaar) => jaar.isCurrent) ?? jaren.value[0])?.id ?? null,
      },
    };
  }, []);

  const { waarde, fout: laadfout, bezig, herlaad } = useDienst(laad);

  async function maakGroep() {
    if (!waarde?.schoolYearId) return;
    const { groups } = await diensten();

    const uitkomst = await groups.maak({
      name: naam,
      kind: soort,
      colour: volgendeKleur(waarde.groepen.length),
      schoolYearId: waarde.schoolYearId,
    });

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setNaam("");
    setFout(null);
    herlaad();
  }

  async function voegLidToe(groupId: string, studentId: string, van: string) {
    const { groups } = await diensten();
    const uitkomst = await groups.voegLidToe({ studentId, groupId, from: van });
    setFout(uitkomst.ok ? null : uitkomst.error.message);
    herlaad();
  }

  async function beeindig(membershipId: string, per: string) {
    const { groups } = await diensten();
    const uitkomst = await groups.beeindig(membershipId, per);
    setFout(uitkomst.ok ? null : uitkomst.error.message);
    herlaad();
  }

  if (laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {bezig && !waarde ? <Skeleton className="h-24" /> : null}

      {waarde && !waarde.schoolYearId ? (
        <EmptyState
          icon={Users}
          title="Nog geen schooljaar"
          description="Een groep hoort bij een schooljaar. Vul in Instellingen de verzonnen groep om er een klaar te zetten."
        />
      ) : null}

      {waarde?.schoolYearId ? (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(gebeurtenis) => {
            gebeurtenis.preventDefault();
            void maakGroep();
          }}
        >
          <Input
            aria-label="Naam van de groep"
            className="min-w-40 flex-1"
            placeholder="Naam van de groep"
            value={naam}
            onChange={(gebeurtenis) => setNaam(gebeurtenis.target.value)}
          />
          <NativeSelect
            aria-label="Soort groep"
            className="w-48"
            value={soort}
            onChange={(gebeurtenis) => setSoort(gebeurtenis.target.value as GroupKind)}
          >
            {Object.entries(GROEPSOORTEN).map(([sleutel, naamvanSoort]) => (
              <NativeSelectOption key={sleutel} value={sleutel}>
                {naamvanSoort}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button type="submit" disabled={!naam.trim()}>
            Groep toevoegen
          </Button>
        </form>
      ) : null}

      {fout ? <ErrorMessage message={fout} nextStep="Pas de periode of de naam aan." /> : null}

      {waarde?.groepen.map((groep) => (
        <Item key={groep.id} variant="outline" className="flex-col items-stretch gap-3">
          <ItemContent>
            <ItemTitle>{groep.name}</ItemTitle>
            <ItemDescription>{GROEPSOORTEN[groep.kind]}</ItemDescription>
          </ItemContent>
          <GroupMembers
            leden={waarde.lidmaatschappen.filter((lid) => lid.groupId === groep.id)}
            leerlingen={waarde.leerlingen}
            onToevoegen={(studentId, van) => voegLidToe(groep.id, studentId, van)}
            onBeeindigen={beeindig}
          />
        </Item>
      ))}

      {waarde && waarde.schoolYearId && waarde.groepen.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nog geen groepen"
          description="Een leerling zit niet ín een groep maar heeft een lidmaatschap met een looptijd. Maak eerst een groep."
        />
      ) : null}
    </div>
  );
}
