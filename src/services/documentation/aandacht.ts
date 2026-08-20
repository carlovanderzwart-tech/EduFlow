/**
 * Het blok Aandacht (§6.4.4, `FR-DAS-06`, `FR-DAS-07`).
 *
 * **Dit is een geheugensteun over jouw documentatie, geen signaal over een kind.** Dat
 * staat er niet voor de vorm: §1.4.2 verbiedt het oordeel, en een signaal is een
 * oordeel met een ander lettertype. Daarom staat er geen score, geen kleur en geen
 * geschiedenis — alleen hoeveel schooldagen het is, en de regel eronder die zegt waar
 * het over gaat.
 *
 * **Vakantiedagen tellen niet mee.** Zes weken zomervakantie zou anders elke leerling
 * in het blok zetten op de eerste schooldag van september, en dan zegt het blok niets
 * meer dan dat het zomer is geweest.
 *
 * Zuiver en zonder opslag: de gegevens komen uit de bestaande services. Er is geen
 * `DashboardService`, en dat is een eis van D11 — een eigen service zou een tweede
 * plek zijn waar deze regel staat.
 */

import { dagenVan, isWeekend, type IsoDate } from "@/lib/dates";
import type { Documentation, Student } from "@/domain/types";

import type { Vakantie } from "../agenda/HolidayService";

/** §6.4.4: de standaarddrempel, in schooldagen. */
export const DREMPEL_STANDAARD = 21;

/** §6.4.4: instelbaar tussen deze twee. */
export const DREMPEL_MIN = 10;
export const DREMPEL_MAX = 60;

/** §6.4.2: hoogstens vijf regels in het blok. */
export const MAX_AANDACHT = 5;

/** De verplichte regel uit `FR-DAS-06`, woordelijk. */
export const AANDACHT_REGEL = "Dit gaat over jouw documentatie, niet over dit kind.";

export interface Aandachtleerling {
  student: Student;
  /** Het aantal schooldagen sinds de laatste koppeling, of `null` als er geen is. */
  schooldagen: number | null;
}

export interface Aandachtopzet {
  /** Alleen leerlingen met een lopend lidmaatschap (§6.4.4). */
  leerlingen: readonly Student[];
  documentaties: readonly Documentation[];
  vakanties: readonly Vakantie[];
  drempel: number;
  vandaag: IsoDate;
}

/**
 * Hoeveel schooldagen er tussen twee dagen liggen.
 *
 * Geen weekend en geen vakantie. De begindag telt niet mee, de einddag wel — het gaat
 * om "hoe lang is het geleden", en dat is nul op de dag zelf.
 */
export function schooldagenTussen(
  van: IsoDate,
  tot: IsoDate,
  vakanties: readonly Vakantie[],
): number {
  if (tot <= van) return 0;

  const inVakantie = (dag: IsoDate) =>
    vakanties.some((vakantie) => vakantie.from <= dag && dag <= vakantie.to);

  return dagenVan(van, tot).slice(1).filter((dag) => !isWeekend(dag) && !inVakantie(dag)).length;
}

/**
 * De leerlingen die lang niet in een documentatie voorkwamen (§6.4.4).
 *
 * Aflopend gesorteerd op het aantal schooldagen, want wie het langst niet voorkwam
 * staat bovenaan. Wie **nooit** voorkwam staat daar nog boven: die heeft geen datum om
 * vanaf te rekenen, en dat is het duidelijkste geval van allemaal.
 */
export function aandacht(opzet: Aandachtopzet): Aandachtleerling[] {
  const laatste = new Map<string, IsoDate>();
  for (const documentatie of opzet.documentaties) {
    for (const studentId of documentatie.studentIds) {
      const bekend = laatste.get(studentId);
      if (!bekend || documentatie.date > bekend) laatste.set(studentId, documentatie.date);
    }
  }

  return opzet.leerlingen
    .map((student) => {
      const datum = laatste.get(student.id);
      return {
        student,
        schooldagen: datum ? schooldagenTussen(datum, opzet.vandaag, opzet.vakanties) : null,
      };
    })
    .filter((rij) => rij.schooldagen === null || rij.schooldagen >= opzet.drempel)
    .sort((a, b) => (b.schooldagen ?? Infinity) - (a.schooldagen ?? Infinity))
    .slice(0, MAX_AANDACHT);
}
