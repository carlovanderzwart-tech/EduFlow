"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { SaveStatus, type SaveState } from "@/ui/SaveStatus";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Switch } from "@/ui/switch";
import { diensten } from "@/services/diensten";
import type { PupilNoun, Region } from "@/domain/types";
import {
  AANDACHT_REGEL,
  DREMPEL_MAX,
  DREMPEL_MIN,
} from "@/services/documentation/aandacht";

export interface Instellingenformulier {
  pupilNoun: PupilNoun;
  attentionThresholdDays: number;
  /** `FR-DAS-07`, B-125: uit betekent ook: niet berekenen. */
  showAttention: boolean;
  showOutgoingRequest: boolean;
  region: Region;
}

/**
 * De instellingen die een scherm hebben, zonder opslaanknop (FR-INS-45).
 *
 * "Wanneer je het scherm verlaat, dan is er geen opslaanknop geweest: elke
 * wijziging is meteen opgeslagen en meteen van kracht, met een korte bevestiging in
 * de statusregel." Dat is de reden dat elke `onChange` hier schrijft en de knop weg
 * is — niet een stijlkeuze maar de eis.
 *
 * Elke instelling zegt wat hij dóet en niet hoe hij werkt (FR-INS-44).
 */
export function SettingsForm({ begin }: { begin: Instellingenformulier }) {
  const [formulier, setFormulier] = useState(begin);
  const [status, setStatus] = useState<SaveState>("idle");
  const [fout, setFout] = useState<string | null>(null);

  async function wijzig(deel: Partial<Instellingenformulier>) {
    const bijgewerkt = { ...formulier, ...deel };
    setFormulier(bijgewerkt);
    setStatus("saving");
    setFout(null);

    const { settings } = await diensten();
    // De regio staat in `localStorage` en de rest in het ene record (§8.2.2, T-01).
    if (deel.region) settings.zetVoorkeur("region", deel.region);

    // Elk veld dat een scherm heeft, staat hier. `Instellingenwijziging` is een
    // `Partial`, dus een vergeten veld levert geen typefout op — het verdwijnt
    // stilletjes en de schakelaar lijkt te werken tot je de pagina vernieuwt.
    const uitkomst = await settings.wijzig({
      pupilNoun: bijgewerkt.pupilNoun,
      attentionThresholdDays: bijgewerkt.attentionThresholdDays,
      showAttention: bijgewerkt.showAttention,
      showOutgoingRequest: bijgewerkt.showOutgoingRequest,
    });

    if (!uitkomst.ok) {
      setStatus("idle");
      setFout(uitkomst.error.message);
      return;
    }
    setStatus("saved");
  }

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel htmlFor="pupil-noun">Hoe noem je ze?</FieldLabel>
        <FieldDescription>
          Deze keuze geldt in alle schermteksten tegelijk (FR-INS-27).
        </FieldDescription>
        <NativeSelect
          id="pupil-noun"
          value={formulier.pupilNoun}
          onChange={(gebeurtenis) =>
            void wijzig({ pupilNoun: gebeurtenis.target.value as PupilNoun })
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
          onChange={(gebeurtenis) => void wijzig({ region: gebeurtenis.target.value as Region })}
        >
          <NativeSelectOption value="noord">Noord</NativeSelectOption>
          <NativeSelectOption value="midden">Midden</NativeSelectOption>
          <NativeSelectOption value="zuid">Zuid</NativeSelectOption>
        </NativeSelect>
      </Field>

      {/* FR-DAS-07: uitzetten laat het blok verdwijnen én stopt de berekening. */}
      <div>
        <Field orientation="horizontal">
          <Switch
            id="show-attention"
            checked={formulier.showAttention}
            onCheckedChange={(aan) => void wijzig({ showAttention: aan })}
          />
          <Label htmlFor="show-attention">Toon het blok Aandacht op het dashboard</Label>
        </Field>
        <FieldDescription className="pt-1">
          {AANDACHT_REGEL} Zet je het uit, dan wordt er ook niets meer uitgerekend.
        </FieldDescription>
      </div>

      {formulier.showAttention ? (
        <Field>
          <FieldLabel htmlFor="attention">
            Na hoeveel schooldagen vraagt een leerling aandacht?
          </FieldLabel>
          <FieldDescription>
            Eenentwintig schooldagen is ongeveer een maand lesgeven. Tussen {DREMPEL_MIN} en{" "}
            {DREMPEL_MAX}. Vakantiedagen tellen niet mee.
          </FieldDescription>
          <Input
            id="attention"
            type="number"
            min={DREMPEL_MIN}
            max={DREMPEL_MAX}
            inputMode="numeric"
            className="max-w-28"
            value={formulier.attentionThresholdDays}
            onChange={(gebeurtenis) =>
              void wijzig({ attentionThresholdDays: Number(gebeurtenis.target.value) })
            }
          />
        </Field>
      ) : null}

      <Field orientation="horizontal">
        <Switch
          id="show-outgoing"
          checked={formulier.showOutgoingRequest}
          onCheckedChange={(aan) => void wijzig({ showOutgoingRequest: aan })}
        />
        <Label htmlFor="show-outgoing">Laat zien wat er naar AI gaat</Label>
      </Field>

      {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}

      <SaveStatus state={status} />
    </div>
  );
}
