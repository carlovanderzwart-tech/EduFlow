"use client";

import { Checkbox } from "@/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import type { Group, Series, Student } from "@/domain/types";
import { weergavenaam } from "@/services/students/StudentService";

interface Koppelingenvelden {
  seriesId: string;
  studentIds: string[];
  groupIds: string[];
}

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
      <Field>
        <FieldLabel htmlFor="reeks">Reeks</FieldLabel>
        <FieldDescription>
          Hoort deze documentatie bij een reeks? De naam komt niet in de titel te staan.
        </FieldDescription>
        <NativeSelect
          id="reeks"
          value={formulier.seriesId}
          onChange={(gebeurtenis) => onWijzig({ seriesId: gebeurtenis.target.value })}
        >
          <NativeSelectOption value="">Geen reeks</NativeSelectOption>
          {reeksen.map((reeks) => (
            <NativeSelectOption key={reeks.id} value={reeks.id}>
              {reeks.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

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
