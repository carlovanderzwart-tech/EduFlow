"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SaveStatus, type SaveState } from "@/components/common/SaveStatus";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { useDienst } from "@/hooks/useDienst";
import type { PupilNoun, Region } from "@/domain/types";
import { diensten, type Diensten } from "@/services/diensten";

/**
 * Instellingen (§6.5).
 *
 * Vier instellingen, en niet meer: de drie uit het `settings`-record die een scherm
 * hebben (FR-INS-21, FR-INS-27 en de drempel van §9.8) plus de regio, die in
 * `localStorage` staat omdat de agenda hem nodig heeft vóór de database open is
 * (§8.2.2, T-01). Dat `SettingsService` ze uit twee opslagplaatsen haalt, merkt dit
 * scherm niet — dat is wat §10.4 hem toewijst.
 *
 * Reeksen, de AI-provider, de detectoren, de standaardgroep, het logboek en wissen
 * staan in §6.5 en komen later. Ze staan hier niet als lege knop: een knop die niets
 * doet is erger dan een knop die er nog niet is.
 */
export function SettingsPage() {
  const [status, setStatus] = useState<SaveState>("idle");
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback(async ({ settings }: Diensten) => {
    const record = await settings.lees();
    if (!record.ok) return record;

    return {
      ok: true as const,
      value: {
        pupilNoun: record.value.pupilNoun,
        attentionThresholdDays: record.value.attentionThresholdDays,
        showOutgoingRequest: record.value.showOutgoingRequest,
        region: settings.voorkeur("region"),
      },
    };
  }, []);

  const { waarde, fout: laadfout, bezig } = useDienst(laad);
  const [concept, setConcept] = useState<typeof waarde>(null);

  // Het scherm bewerkt een kopie: de opslag krijgt hem pas bij Opslaan te zien.
  const formulier = concept ?? waarde;

  function wijzig(deel: Partial<NonNullable<typeof waarde>>) {
    if (!formulier) return;
    setConcept({ ...formulier, ...deel });
    setStatus("idle");
  }

  async function bewaar() {
    if (!formulier) return;
    setStatus("saving");
    setFout(null);

    const { settings } = await diensten();
    const uitkomst = await settings.wijzig({
      pupilNoun: formulier.pupilNoun,
      attentionThresholdDays: formulier.attentionThresholdDays,
      showOutgoingRequest: formulier.showOutgoingRequest,
    });

    if (!uitkomst.ok) {
      setStatus("idle");
      setFout(uitkomst.error.message);
      return;
    }

    settings.zetVoorkeur("region", formulier.region);
    setStatus("saved");
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
      <Item variant="outline" className="relative">
        <ItemContent>
          <ItemTitle>
            <Link
              href="/settings/students"
              className="after:absolute after:inset-0 after:content-['']"
            >
              Leerlingen
            </Link>
          </ItemTitle>
          <ItemDescription>
            Wie er in je groep zitten. EduFlow gebruikt deze namen om ze af te schermen voordat er
            tekst naar AI gaat.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Users aria-hidden="true" className="size-4 text-muted-foreground" />
        </ItemActions>
      </Item>

      {bezig && !formulier ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {formulier ? (
        <form
          className="space-y-6"
          onSubmit={(gebeurtenis) => {
            gebeurtenis.preventDefault();
            void bewaar();
          }}
        >
          <Field>
            <FieldLabel htmlFor="pupil-noun">Hoe noem je ze?</FieldLabel>
            <FieldDescription>
              Deze keuze geldt in alle schermteksten tegelijk (FR-INS-27).
            </FieldDescription>
            <NativeSelect
              id="pupil-noun"
              value={formulier.pupilNoun}
              onChange={(gebeurtenis) =>
                wijzig({ pupilNoun: gebeurtenis.target.value as PupilNoun })
              }
            >
              <NativeSelectOption value="leerling">Leerling</NativeSelectOption>
              <NativeSelectOption value="kind">Kind</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="region">Vakantieregio</FieldLabel>
            <FieldDescription>
              Bepaalt welke vakantiedata de agenda toont. Een regio is een landsdeel, geen
              persoonsgegeven.
            </FieldDescription>
            <NativeSelect
              id="region"
              value={formulier.region}
              onChange={(gebeurtenis) => wijzig({ region: gebeurtenis.target.value as Region })}
            >
              <NativeSelectOption value="noord">Noord</NativeSelectOption>
              <NativeSelectOption value="midden">Midden</NativeSelectOption>
              <NativeSelectOption value="zuid">Zuid</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="attention">Na hoeveel dagen vraagt een leerling aandacht?</FieldLabel>
            <FieldDescription>
              Zes weken is de periode tussen twee vakanties. Tussen 1 en 365 dagen.
            </FieldDescription>
            <Input
              id="attention"
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              className="max-w-28"
              value={formulier.attentionThresholdDays}
              onChange={(gebeurtenis) =>
                wijzig({ attentionThresholdDays: Number(gebeurtenis.target.value) })
              }
            />
          </Field>

          <Field orientation="horizontal">
            <Switch
              id="show-outgoing"
              checked={formulier.showOutgoingRequest}
              onCheckedChange={(aan) => wijzig({ showOutgoingRequest: aan })}
            />
            <Label htmlFor="show-outgoing">Laat zien wat er naar AI gaat</Label>
          </Field>

          {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"}>
              Opslaan
            </Button>
            <SaveStatus state={status} />
          </div>
        </form>
      ) : null}
    </div>
  );
}
