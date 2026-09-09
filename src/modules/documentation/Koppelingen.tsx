"use client";

import { useState } from "react";

import { Checkbox } from "@/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import type { Group, Series, Student } from "@/domain/types";
import { weergavenaam } from "@/services/students/StudentService";

import { NieuweReeks } from "./NieuweReeks";

interface Koppelingenvelden {
  seriesId: string;
  studentIds: string[];
  groupIds: string[];
}

/**
 * De regel onderaan de reekskeuze, letterlijk uit §6.1.
 *
 * De waarde begint met een teken dat geen uuid kan zijn, zodat hij nooit met een
 * echte reeks kan botsen.
 */
const NIEUW = "+nieuw";

/**
 * Waar een documentatie aan hangt (FR-DOC-05, FR-DOC-06).
 *
 * **De reeks is een verwijzing en geen voorvoegsel** (FR-DOC-05, INV-21). Hij komt
 * nooit in de titel terecht; hij staat apart, en het overzicht toont hem apart.
 * Wie hem in de titel schrijft, ziet hem in elke lijst dubbel staan.
 *
 * **Leerlingen en groepen staan náást elkaar en niet in plaats van elkaar**
 * (FR-DOC-06). Nul of meer van allebei: een documentatie over de hele groep hoeft
 * geen twintig vinkjes, en een documentatie over drie kinderen hoeft geen groep.
 */
export function Koppelingen({
  formulier,
  leerlingen,
  groepen,
  reeksen,
  onWijzig,
}: {
  formulier: Koppelingenvelden;
  leerlingen: Student[];
  groepen: Group[];
  reeksen: Series[];
  onWijzig: (deel: Partial<Koppelingenvelden>) => void;
}) {
  function wissel(lijst: string[], id: string, aan: boolean): string[] {
    return aan ? [...lijst, id] : lijst.filter((sleutel) => sleutel !== id);
  }

  return (
    <div className="space-y-6">
      <Reeksveld
        gekozen={formulier.seriesId}
        reeksen={reeksen}
        onKies={(seriesId) => onWijzig({ seriesId })}
      />

      <FieldSet>
        <FieldLegend variant="label">Leerlingen</FieldLegend>
        {leerlingen.length === 0 ? (
          <FieldDescription>
            Je hebt nog geen leerlingen. Voeg ze toe bij Instellingen om ze hier te kunnen kiezen.
          </FieldDescription>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {leerlingen.map((leerling) => (
              <div key={leerling.id} className="flex items-center gap-2">
                <Checkbox
                  id={`leerling-${leerling.id}`}
                  checked={formulier.studentIds.includes(leerling.id)}
                  onCheckedChange={(aan) =>
                    onWijzig({ studentIds: wissel(formulier.studentIds, leerling.id, aan === true) })
                  }
                />
                <Label htmlFor={`leerling-${leerling.id}`}>{weergavenaam(leerling)}</Label>
              </div>
            ))}
          </div>
        )}
      </FieldSet>

      {groepen.length > 0 ? (
        <FieldSet>
          <FieldLegend variant="label">Groepen</FieldLegend>
          <FieldDescription>Naast de leerlingen, niet in plaats van.</FieldDescription>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {groepen.map((groep) => (
              <div key={groep.id} className="flex items-center gap-2">
                <Checkbox
                  id={`groep-${groep.id}`}
                  checked={formulier.groupIds.includes(groep.id)}
                  onCheckedChange={(aan) =>
                    onWijzig({ groupIds: wissel(formulier.groupIds, groep.id, aan === true) })
                  }
                />
                <Label htmlFor={`groep-${groep.id}`}>{groep.name}</Label>
              </div>
            ))}
          </div>
        </FieldSet>
      ) : null}
    </div>
  );
}

/**
 * De reekskeuze, met "Nieuwe reeks maken…" onderaan (§6.1, `FR-DOC-125`, B-127).
 *
 * De net gemaakte reeks wordt hier bij de lijst gezet in plaats van dat het hele
 * scherm opnieuw laadt. Herladen zou het concept waar je in typt weggooien — en
 * dat is precies het werk dat je probeerde te bewaren.
 */
function Reeksveld({
  gekozen,
  reeksen,
  onKies,
}: {
  gekozen: string;
  reeksen: Series[];
  onKies: (seriesId: string) => void;
}) {
  const [nieuwe, setNieuwe] = useState<Series[]>([]);
  const [maakt, setMaakt] = useState(false);

  const alle = [...reeksen, ...nieuwe].sort((a, b) => a.name.localeCompare(b.name, "nl"));

  if (maakt) {
    return (
      <Field>
        <FieldLabel htmlFor="reeks">Reeks</FieldLabel>
        <NieuweReeks
          aantalBestaand={alle.length}
          onAnnuleer={() => setMaakt(false)}
          onGemaakt={(reeks) => {
            setNieuwe((eerder) => [...eerder, reeks]);
            setMaakt(false);
            // Wie een reeks maakt terwijl hij aan het schrijven is, wil hem er
            // ook aan hangen. Anders staat hij er wel maar hangt de documentatie
            // nog nergens aan.
            onKies(reeks.id);
          }}
        />
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel htmlFor="reeks">Reeks</FieldLabel>
      <FieldDescription>
        Hoort deze documentatie bij een reeks? De naam komt niet in de titel te staan.
      </FieldDescription>
      <NativeSelect
        id="reeks"
        value={gekozen}
        onChange={(gebeurtenis) => {
          const waarde = gebeurtenis.target.value;
          if (waarde === NIEUW) setMaakt(true);
          else onKies(waarde);
        }}
      >
        <NativeSelectOption value="">Geen reeks</NativeSelectOption>
        {alle.map((reeks) => (
          <NativeSelectOption key={reeks.id} value={reeks.id}>
            {reeks.name}
          </NativeSelectOption>
        ))}
        <NativeSelectOption value={NIEUW}>Nieuwe reeks maken…</NativeSelectOption>
      </NativeSelect>
    </Field>
  );
}
