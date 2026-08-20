"use client";

import { useCallback } from "react";

import { maandagVan, plusDagen, vandaagIso, type IsoDate } from "@/lib/dates";
import { useDienst } from "@/app/providers/useDienst";
import type { CalendarEvent, Documentation, SchoolYear } from "@/domain/types";
import { perDag } from "@/services/agenda/AgendaService";
import { vakantieOp, type Vakantie } from "@/services/agenda/HolidayService";
import { aandacht, type Aandachtleerling } from "@/services/documentation/aandacht";
import type { Diensten } from "@/services/diensten";

/** §6.4.2: hoogstens acht agenda-items in het blok Deze week. */
export const MAX_WEEKITEMS = 8;

/** §6.4.2: vijf documentaties in Verder werken aan. */
export const MAX_CONCEPTEN = 5;

/** `FR-DAS-03`: na dertig dagen wordt het blok Back-up dringend. */
export const BACKUP_DRINGEND_DAGEN = 30;

export interface Dashboardstand {
  vandaag: IsoDate;
  schooljaar: SchoolYear | null;
  /** De items van maandag tot en met zondag, tijd oplopend (§6.4.2). */
  week: CalendarEvent[];
  /** De studiedag van vandaag, als eerste regel (`FR-DAS-05`). */
  studiedagVandaag: CalendarEvent | null;
  /** De vakantie waarin vandaag valt, of `null` (`FR-DAS-04`). */
  vakantieNu: Vakantie | null;
  /** De eerstvolgende schooldag na die vakantie (`FR-DAS-04`). */
  eersteSchooldag: IsoDate | null;
  /** Concepten op `updatedAt` aflopend (`FR-DAS-01`, `FR-DAS-02`). */
  concepten: Documentation[];
  /** Leeg als het blok uit staat (`FR-DAS-07`, B-125). */
  aandacht: Aandachtleerling[];
  aandachtAan: boolean;
  laatsteBackup: string | null;
}

/**
 * Alles wat het dashboard toont, uit de bestaande services (§6.4.1).
 *
 * **Er is geen `DashboardService`.** Het dashboard heeft geen eigen gegevens; alles is
 * een verwijzing. De toets die §6.4.1 zelf noemt: haal je het dashboard weg, dan verlies
 * je geen informatie, alleen tijd. Een eigen service zou een tweede plek zijn waar een
 * regel staat — fout 2 uit §20.6.
 */
export function useDashboard() {
  const laad = useCallback(
    async ({ agenda, holidays, documentation, students, groups, settings }: Diensten) => {
      const vandaag = vandaagIso();
      const maandag = maandagVan(vandaag);
      const zondag = plusDagen(maandag, 6);

      const record = await settings.lees();
      if (!record.ok) return record;

      const jaar = await agenda.huidigSchooljaar();
      if (!jaar.ok) return jaar;

      const items = await agenda.periode(maandag, zondag);
      if (!items.ok) return items;

      const alleDocs = await documentation.lijst();
      if (!alleDocs.ok) return alleDocs;

      const vakanties = jaar.value
        ? await holidays.vakanties(jaar.value.name, jaar.value.region)
        : { ok: true as const, value: [] as Vakantie[] };
      if (!vakanties.ok) return vakanties;

      const vandaagItems = perDag(items.value, maandag, zondag).get(vandaag) ?? [];
      const vakantieNu = vakantieOp(vandaag, vakanties.value);

      return {
        ok: true as const,
        value: {
          vandaag,
          schooljaar: jaar.value,
          week: items.value.slice(0, MAX_WEEKITEMS),
          // FR-DAS-05: een studiedag van vandaag staat als eerste regel.
          studiedagVandaag: vandaagItems.find((item) => item.kind === "studiedag") ?? null,
          vakantieNu,
          eersteSchooldag: vakantieNu ? plusDagen(vakantieNu.to, 1) : null,
          // FR-DAS-02: op het dashboard altijd `updatedAt` — "waar was ik".
          concepten: alleDocs.value
            .filter((doc) => doc.status === "concept")
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, MAX_CONCEPTEN),
          aandachtAan: record.value.showAttention,
          // FR-DAS-07: staat het blok uit, dan wordt er niets uitgerekend.
          aandacht: record.value.showAttention
            ? aandacht({
                leerlingen: await lopendeLeerlingen(students, groups),
                documentaties: alleDocs.value,
                vakanties: vakanties.value,
                drempel: record.value.attentionThresholdDays,
                vandaag,
              })
            : [],
          laatsteBackup: settings.voorkeur("lastBackupAt"),
        } satisfies Dashboardstand,
      };
    },
    [],
  );

  return useDienst(laad);
}

/**
 * De leerlingen met een lopend groepslidmaatschap (§6.4.4).
 *
 * Wie uit dienst is of nog niet begonnen hoort niet in het blok: dat zou een
 * geheugensteun zijn over een kind dat niet in je groep zit.
 */
async function lopendeLeerlingen(
  students: Diensten["students"],
  groups: Diensten["groups"],
) {
  const alle = await students.lijst();
  if (!alle.ok) return [];

  // `zitIn` geeft de lopende lidmaatschappen van één leerling; dat is precies de
  // vraag hier, en het houdt de regel over "wat is lopend" op één plek (DR-14).
  const uit = [];
  for (const student of alle.value) {
    const groepen = await groups.zitIn(student.id);
    if (groepen.ok && groepen.value.length > 0) uit.push(student);
  }
  return uit;
}
