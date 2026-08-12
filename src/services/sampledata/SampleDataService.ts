/**
 * De verzonnen groep in één handeling (werkopdracht D02, bijlage A).
 *
 * Dit is doorloopgereedschap. Het staat er zodat de opdrachtgever punt 3 van de
 * doorloop-DoD kan halen — "één keer zelf gedaan met de verzonnen groep" — zonder
 * eerst twintig namen, drie groepen, achtentwintig lidmaatschappen en drie reeksen
 * met de hand in te tikken. **Het gaat eruit vóór v1.0**, en dat is geen losse
 * belofte: de werkopdracht zegt het, en `src/test/fixtures/testgegevens.ts` is de
 * enige plek waar de gegevens staan, dus het verwijderen is één map en één knop.
 *
 * Er komt hier nooit de naam van een echt kind in (DR-33, §15.6). De twintig zijn
 * verzonnen en elk van hen dekt een geval dat `PrivacyService` moet aankunnen.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Colour, GroupKind, Region } from "@/domain/types";
import { GROEP_4, GROEPEN, REEKSEN, SCHOOLJAAR } from "@/test/fixtures/testgegevens";

import type { GroupService } from "../groups/GroupService";
import type { SeriesService } from "../series/SeriesService";
import type { StorageService } from "../storage/StorageService";
import { ontleedLijst, type StudentService } from "../students/StudentService";

export interface SampleDataDeps {
  storage: StorageService;
  students: StudentService;
  groups: GroupService;
  series: SeriesService;
  /** De vakantieregio uit `localStorage` (§8.2.2, T-01); het schooljaar draagt hem. */
  region: Region;
}

export interface Vulling {
  leerlingen: number;
  groepen: number;
  lidmaatschappen: number;
  reeksen: number;
}

/** De stamgroep loopt precies één schooljaar (bijlage A.3); zijn periode ís dat jaar. */
const STAMGROEP = GROEPEN[0];

function kleurVan(nummer: number): Colour {
  return `series-${nummer}` as Colour;
}

/** Het schooljaar waar de drie groepen bij horen (INV-27, §8.3.8). */
async function schooljaar(deps: SampleDataDeps): Promise<Result<Uuid>> {
  const bestaande = await deps.storage.list("schoolYears");
  if (!bestaande.ok) return bestaande;

  const dit = bestaande.value.find((jaar) => jaar.name === SCHOOLJAAR);
  if (dit) return { ok: true, value: dit.id };

  const gemaakt = await deps.storage.create("schoolYears", {
    name: SCHOOLJAAR,
    firstSchoolDay: STAMGROEP.van,
    lastSchoolDay: STAMGROEP.tot,
    region: deps.region,
    isCurrent: true,
  });
  return gemaakt.ok ? { ok: true, value: gemaakt.value.id } : gemaakt;
}

/** Geeft per verzonnen sleutel ("l-01") de echte sleutel van de aangemaakte leerling. */
async function leerlingen(deps: SampleDataDeps): Promise<Result<Map<string, Uuid>>> {
  const namen = ontleedLijst(GROEP_4.map((leerling) => leerling.voornaam).join("\n"));
  const uitkomst = await deps.students.voegLijstToe(namen);
  if (!uitkomst.ok) return uitkomst;

  const kaart = new Map<string, Uuid>();
  uitkomst.value.toegevoegd.forEach((leerling, plaats) => {
    const verzonnen = GROEP_4[plaats];
    if (verzonnen) kaart.set(verzonnen.id, leerling.id);
  });
  return { ok: true, value: kaart };
}

async function groepen(
  deps: SampleDataDeps,
  schoolYearId: Uuid,
  sleutels: Map<string, Uuid>,
): Promise<Result<number>> {
  let lidmaatschappen = 0;

  for (const [plaats, verzonnen] of GROEPEN.entries()) {
    const groep = await deps.groups.maak({
      name: verzonnen.naam,
      kind: verzonnen.type as GroupKind,
      colour: kleurVan(plaats + 1),
      schoolYearId,
    });
    if (!groep.ok) return groep;

    for (const lid of verzonnen.leden) {
      const studentId = sleutels.get(lid);
      if (!studentId) continue;

      const toegevoegd = await deps.groups.voegLidToe({
        studentId,
        groupId: groep.value.id,
        from: verzonnen.van,
        to: verzonnen.tot,
      });
      if (!toegevoegd.ok) return toegevoegd;
      lidmaatschappen += 1;
    }
  }

  return { ok: true, value: lidmaatschappen };
}

async function reeksen(deps: SampleDataDeps): Promise<Result<number>> {
  for (const verzonnen of REEKSEN) {
    const gemaakt = await deps.series.maak({
      name: verzonnen.naam,
      colour: kleurVan(verzonnen.kleur),
      description: "",
    });
    if (!gemaakt.ok) return gemaakt;
  }
  return { ok: true, value: REEKSEN.length };
}

/**
 * Vult de app met bijlage A.
 *
 * Weigert zodra er al leerlingen staan. Twee keer vullen zou twintig namen
 * verdubbelen en op de weergavenaam vastlopen (INV-29); dan is een melding vooraf
 * duidelijker dan twintig meldingen achteraf.
 */
async function vulVerzonnenGroep(deps: SampleDataDeps): Promise<Result<Vulling>> {
  const bestaande = await deps.students.lijst();
  if (!bestaande.ok) return bestaande;
  if (bestaande.value.length > 0) {
    return ongeldig(
      "Er staan al leerlingen in de app. De verzonnen groep vult alleen een lege lijst. Verwijder de bestaande leerlingen eerst.",
    );
  }

  const jaar = await schooljaar(deps);
  if (!jaar.ok) return jaar;

  const sleutels = await leerlingen(deps);
  if (!sleutels.ok) return sleutels;

  const lidmaatschappen = await groepen(deps, jaar.value, sleutels.value);
  if (!lidmaatschappen.ok) return lidmaatschappen;

  const aantalReeksen = await reeksen(deps);
  if (!aantalReeksen.ok) return aantalReeksen;

  return {
    ok: true,
    value: {
      leerlingen: sleutels.value.size,
      groepen: GROEPEN.length,
      lidmaatschappen: lidmaatschappen.value,
      reeksen: aantalReeksen.value,
    },
  };
}

export function createSampleDataService(deps: SampleDataDeps) {
  return { vulVerzonnenGroep: () => vulVerzonnenGroep(deps) };
}

export type SampleDataService = ReturnType<typeof createSampleDataService>;
