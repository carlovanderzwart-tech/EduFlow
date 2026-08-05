"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Group } from "@/types/group";

interface StudentBatchBarProps {
  count: number;
  groups: Group[];
  onMove: (groupId: string) => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onClear: () => void;
}

/**
 * Verschijnt zodra er leerlingen zijn aangevinkt (doc 04, scherm 7). Drie
 * acties: verplaatsen naar een andere groep, op inactief zetten, weer op actief
 * zetten.
 *
 * **Geen verwijderknop.** Leerlingen worden nooit hard verwijderd (T-14), en een
 * massale verwijdering is precies de handeling waarmee de afscherming stukgaat
 * (doc 02, *Batchbewerkingen*).
 *
 * Het bevestigen gebeurt niet hier maar bij de aanroeper: die kent de namen van
 * de groepen en kan de vraag daardoor voluit stellen.
 */
export function StudentBatchBar({
  count,
  groups,
  onMove,
  onDeactivate,
  onActivate,
  onClear,
}: StudentBatchBarProps) {
  const [targetGroupId, setTargetGroupId] = useState("");

  const label = count === 1 ? "1 leerling geselecteerd" : `${count} leerlingen geselecteerd`;

  return (
    <div
      // Een gebied met een eigen naam, zodat een schermlezer meteen hoort
      // waarover de knoppen gaan.
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3"
    >
      <span className="text-sm font-medium">{label}</span>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <NativeSelect
          aria-label="Verplaatsen naar groep"
          value={targetGroupId}
          onChange={(event) => setTargetGroupId(event.target.value)}
        >
          <NativeSelectOption value="">Kies een groep</NativeSelectOption>
          {groups.map((group) => (
            <NativeSelectOption key={group.id} value={group.id}>
              {group.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Button
          variant="outline"
          size="sm"
          disabled={!targetGroupId}
          onClick={() => {
            onMove(targetGroupId);
            setTargetGroupId("");
          }}
        >
          Verplaatsen
        </Button>
        <Button variant="outline" size="sm" onClick={onDeactivate}>
          Op inactief zetten
        </Button>
        <Button variant="outline" size="sm" onClick={onActivate}>
          Op actief zetten
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Selectie wissen
        </Button>
      </div>
    </div>
  );
}
