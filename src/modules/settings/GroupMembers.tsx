"use client";

import { CalendarOff, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { datumKort, vandaag } from "@/lib/weergave";
import type { GroupMembership, Student } from "@/domain/types";
import { weergavenaam } from "@/services/students/StudentService";

/**
 * Wie er in één groep zitten, met hun looptijd (FR-INS-06).
 *
 * Er staat hier geen enkele knop "verwijder uit de groep". Een lidmaatschap loopt
 * af, het verdwijnt niet: anders is later niet meer te zien in welke groep een kind
 * zat toen een documentatie werd geschreven (§8.1.6, FR-INS-04).
 */
export function GroupMembers({
  leden,
  leerlingen,
  onToevoegen,
  onBeeindigen,
}: {
  leden: GroupMembership[];
  leerlingen: Student[];
  onToevoegen: (studentId: string, van: string) => Promise<void>;
  onBeeindigen: (membershipId: string, per: string) => Promise<void>;
}) {
  const [studentId, setStudentId] = useState("");
  const [van, setVan] = useState(vandaag());

  const beschikbaar = leerlingen.filter(
    (leerling) => !leden.some((lid) => lid.studentId === leerling.id && lid.to === null),
  );

  function naamVan(id: string): string {
    const leerling = leerlingen.find((kind) => kind.id === id);
    return leerling ? weergavenaam(leerling) : "Onbekende leerling";
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <ul className="space-y-1 text-sm">
        {leden.length === 0 ? (
          <li className="text-muted-foreground">Nog niemand in deze groep.</li>
        ) : null}
        {leden.map((lid) => (
          <li key={lid.id} className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{naamVan(lid.studentId)}</span>
            <span className="text-muted-foreground">
              {lid.to
                ? `${datumKort(lid.from)} tot ${datumKort(lid.to)}`
                : `sinds ${datumKort(lid.from)}`}
            </span>
            {lid.to === null ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Lidmaatschap van ${naamVan(lid.studentId)} afsluiten`}
                onClick={() => void onBeeindigen(lid.id, vandaag())}
              >
                <CalendarOff aria-hidden="true" />
                Afsluiten
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-2">
        <NativeSelect
          aria-label="Leerling om toe te voegen"
          className="min-w-40 flex-1"
          value={studentId}
          onChange={(gebeurtenis) => setStudentId(gebeurtenis.target.value)}
        >
          <NativeSelectOption value="">Kies een leerling</NativeSelectOption>
          {beschikbaar.map((leerling) => (
            <NativeSelectOption key={leerling.id} value={leerling.id}>
              {weergavenaam(leerling)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          type="date"
          aria-label="Begindatum van het lidmaatschap"
          className="w-44"
          value={van}
          onChange={(gebeurtenis) => setVan(gebeurtenis.target.value)}
        />
        <Button
          variant="outline"
          disabled={!studentId}
          onClick={() => {
            void onToevoegen(studentId, van);
            setStudentId("");
          }}
        >
          <UserPlus aria-hidden="true" />
          Toevoegen
        </Button>
      </div>
    </div>
  );
}
