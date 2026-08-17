/**
 * Schoolvakanties (§6.2.4, §13.4, §10.4).
 *
 * Vakanties komen uit een **meegeleverd bestand**, niet uit een koppeling. Dat is
 * een bewuste keuze: een externe dienst bevragen voor gegevens die één keer per
 * jaar veranderen is een afhankelijkheid zonder opbrengst (§13.4).
 *
 * **`holidayPeriods` is een leescache, geen bron.** Bij een nieuwer bestand wordt
 * de tabel geleegd en opnieuw gevuld. `holidayOverrides` blijft daarbij staan en
 * wordt eroverheen gelegd — dat is `FR-AGE-11`, en het is de kuil die de
 * werkopdracht noemt: sla je de aanpassingen in hetzelfde bestand op, dan is de
 * eerste update het moment waarop de school haar eigen data kwijt is.
 *
 * **Kerst en zomer liggen landelijk vast** (`fixed: true`, B-29, INV-32). Alleen de
 * drie adviesvakanties zijn aan te passen; een poging tot het tegendeel levert een
 * melding en geen record.
 */

import { plusDagen, type IsoDate } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { HolidayOverride, HolidayPeriod, Region } from "@/domain/types";

import type { Clock, StorageService } from "../storage/StorageService";

/** `FR-AGE-12`: hieronder meldt de app dat het bestand afloopt. */
export const WAARSCHUW_DAGEN_VOORAF = 120;

/** Eén rij uit `schoolvakanties.json` (§6.2.4). */
export interface Bestandsvakantie {
  key: string;
  name: string;
  from: IsoDate;
  to: IsoDate;
  fixed: boolean;
}

export interface Vakantiebestand {
  schemaVersion: number;
  publishedAt: IsoDate;
  validUntil: IsoDate;
  source: string;
  years: {
    schoolYear: string;
    regions: Partial<Record<Region, Bestandsvakantie[]>>;
  }[];
}

export interface HolidayDeps {
  storage: StorageService;
  /** Geïnjecteerd, zodat een toets zijn eigen bestand kan meegeven (DR-12). */
  bestand: Vakantiebestand;
  clock: Clock;
}

/** Een vakantie zoals het scherm hem toont: het bestand met de aanpassing eroverheen. */
export interface Vakantie {
  schoolYearName: string;
  region: Region;
  holidayKey: string;
  name: string;
  from: IsoDate;
  to: IsoDate;
  fixed: boolean;
  /** `true` als deze datums van de gebruiker komen en niet uit het bestand. */
  aangepast: boolean;
  /** Wat er in het bestand staat; alleen gevuld als er is aangepast. */
  landelijk: { from: IsoDate; to: IsoDate } | null;
}

/**
 * De vakantie waarin een dag valt, of `null`.
 *
 * Staat hier en niet bij een weergave: het is een vraag over vakanties, en zowel de
 * agenda als het dashboard stelt hem. Twee weergaven die het elk zelf uitrekenen is
 * twee plekken waar dezelfde regel staat (§10.2, DR-11).
 */
export function vakantieOp(dag: IsoDate, vakanties: readonly Vakantie[]): Vakantie | null {
  return vakanties.find((vakantie) => vakantie.from <= dag && dag <= vakantie.to) ?? null;
}

/** Alle rijen van het bestand, plat, met schooljaar en regio erop. */
function rijenVan(bestand: Vakantiebestand) {
  return bestand.years.flatMap((jaar) =>
    (Object.entries(jaar.regions) as [Region, Bestandsvakantie[]][]).flatMap(([region, rijen]) =>
      rijen.map((rij) => ({ ...rij, schoolYearName: jaar.schoolYear, region })),
    ),
  );
}

export function createHolidayService(deps: HolidayDeps) {
  /**
   * De lopende synchronisatie, zodat er maar één tegelijk draait.
   *
   * Zonder deze grendel vullen twee gelijktijdige aanroepen de tabel allebei: beide
   * zien hem leeg, beide schrijven vijf rijen, en de legenda toont elke vakantie
   * twee keer. React voert een effect in ontwikkelmodus twee keer uit, dus dit is
   * geen randgeval maar de gewone gang van zaken.
   */
  let lopend: Promise<Result<Vakantie[]>> | null = null;

  /**
   * Vult de leescache als het bestand nieuwer is dan wat er staat (§13.4).
   *
   * Geeft de vakanties terug waarvan de landelijke datums zijn gewijzigd terwijl er
   * een eigen aanpassing op lag — dat is precies de melding van `FR-AGE-11`, en het
   * is de enige plek waar die vraag te beantwoorden is: na het legen is de oude
   * landelijke datum weg.
   */
  function synchroniseer(): Promise<Result<Vakantie[]>> {
    lopend ??= vul().finally(() => {
      lopend = null;
    });
    return lopend;
  }

  async function vul(): Promise<Result<Vakantie[]>> {
    const bestaand = await deps.storage.list("holidayPeriods");
    if (!bestaand.ok) return bestaand;

    const huidigeVersie = bestaand.value[0]?.fileVersion ?? 0;
    if (bestaand.value.length > 0 && huidigeVersie >= deps.bestand.schemaVersion) {
      return { ok: true, value: [] };
    }

    const overrides = await deps.storage.list("holidayOverrides");
    if (!overrides.ok) return overrides;

    // Wat er straks anders is dan wat er nu staat, en waar een aanpassing op ligt.
    const gewijzigd = verschillen(bestaand.value, rijenVan(deps.bestand), overrides.value);

    for (const rij of bestaand.value) {
      const weg = await deps.storage.purge("holidayPeriods", rij.id);
      if (!weg.ok) return weg;
    }

    for (const rij of rijenVan(deps.bestand)) {
      const geschreven = await deps.storage.create("holidayPeriods", {
        schoolYearName: rij.schoolYearName,
        region: rij.region,
        holidayKey: rij.key,
        name: rij.name,
        from: rij.from,
        to: rij.to,
        fixed: rij.fixed,
        fileVersion: deps.bestand.schemaVersion,
      });
      if (!geschreven.ok) return geschreven;
    }

    return { ok: true, value: gewijzigd };
  }

  /** De vakanties van een schooljaar en regio, met de aanpassingen eroverheen. */
  async function vakanties(schoolYearName: string, region: Region): Promise<Result<Vakantie[]>> {
    const periodes = await deps.storage.list("holidayPeriods");
    if (!periodes.ok) return periodes;

    const overrides = await deps.storage.list("holidayOverrides");
    if (!overrides.ok) return overrides;

    const eigen = new Map(
      overrides.value
        .filter((rij) => rij.schoolYearName === schoolYearName && rij.region === region)
        .map((rij) => [rij.holidayKey, rij]),
    );

    // Op sleutel ontdubbeld: raakte de tabel ooit dubbel gevuld, dan heelt dat
    // hiermee vanzelf in plaats van elke vakantie twee keer te tonen.
    const opSleutel = new Map<string, HolidayPeriod>();
    for (const rij of periodes.value) {
      if (rij.schoolYearName !== schoolYearName || rij.region !== region) continue;
      opSleutel.set(rij.holidayKey, rij);
    }

    const uit = [...opSleutel.values()]
      .map((rij) => leg(rij, eigen.get(rij.holidayKey)))
      .sort((a, b) => a.from.localeCompare(b.from));

    return { ok: true, value: uit };
  }

  /**
   * Past een adviesvakantie aan (`FR-AGE-10`).
   *
   * Het bronbestand blijft ongemoeid; er komt een `HolidayOverride` naast te staan.
   * Een vaste vakantie weigert hier, en dat is INV-32.
   */
  async function pasAan(
    schoolYearName: string,
    region: Region,
    holidayKey: string,
    from: IsoDate,
    to: IsoDate,
  ): Promise<Result<HolidayOverride>> {
    if (to < from) {
      return ongeldig("Het einde van de vakantie ligt vóór het begin. Zet het einde later.");
    }

    const periodes = await deps.storage.list("holidayPeriods");
    if (!periodes.ok) return periodes;

    const rij = periodes.value.find(
      (periode) =>
        periode.schoolYearName === schoolYearName &&
        periode.region === region &&
        periode.holidayKey === holidayKey,
    );
    if (!rij) return ongeldig("Deze vakantie staat niet in het vakantiebestand.");

    // INV-32, FR-AGE-09: kerst en zomer liggen landelijk vast.
    if (rij.fixed) {
      return ongeldig("Kerst- en zomervakantie liggen landelijk vast.");
    }

    const overrides = await deps.storage.list("holidayOverrides");
    if (!overrides.ok) return overrides;

    const bestaand = overrides.value.find(
      (override) =>
        override.schoolYearName === schoolYearName &&
        override.region === region &&
        override.holidayKey === holidayKey,
    );

    return bestaand
      ? deps.storage.update("holidayOverrides", bestaand.id, { from, to })
      : deps.storage.create("holidayOverrides", { schoolYearName, region, holidayKey, from, to });
  }

  /** Haalt een aanpassing weg; daarna gelden de landelijke datums weer. */
  async function herstel(
    schoolYearName: string,
    region: Region,
    holidayKey: string,
  ): Promise<Result<void>> {
    const overrides = await deps.storage.list("holidayOverrides");
    if (!overrides.ok) return overrides;

    const bestaand = overrides.value.find(
      (override) =>
        override.schoolYearName === schoolYearName &&
        override.region === region &&
        override.holidayKey === holidayKey,
    );
    if (!bestaand) return { ok: true, value: undefined };

    const weg = await deps.storage.purge("holidayOverrides", bestaand.id);
    return weg.ok ? { ok: true, value: undefined } : weg;
  }

  /**
   * De melding bij een aflopend bestand (`FR-AGE-12`, B-50).
   *
   * Geeft de tekst terug of `null`. Daarna blijft de agenda gewoon werken:
   * ontbrekende vakanties zijn lege dagen en geen fout.
   */
  function verlooptBinnenkort(): string | null {
    const grens = plusDagen(deps.clock.now().toISOString().slice(0, 10), WAARSCHUW_DAGEN_VOORAF);
    if (deps.bestand.validUntil > grens) return null;

    const datum = new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${deps.bestand.validUntil}T00:00:00.000Z`));

    return `De vakantiegegevens lopen af op ${datum}. Vanaf dan voer je vakanties zelf in.`;
  }

  return { synchroniseer, vakanties, pasAan, herstel, verlooptBinnenkort, bestand: deps.bestand };
}

/** Het bestand met de aanpassing eroverheen, met beide datums zichtbaar. */
function leg(rij: HolidayPeriod, eigen: HolidayOverride | undefined): Vakantie {
  return {
    schoolYearName: rij.schoolYearName,
    region: rij.region,
    holidayKey: rij.holidayKey,
    name: rij.name,
    from: eigen?.from ?? rij.from,
    to: eigen?.to ?? rij.to,
    fixed: rij.fixed,
    aangepast: Boolean(eigen),
    landelijk: eigen ? { from: rij.from, to: rij.to } : null,
  };
}

/**
 * Welke aangepaste vakanties landelijk zijn verschoven (`FR-AGE-11`).
 *
 * Alleen die met een aanpassing erop: bij de rest is de nieuwe datum gewoon de
 * nieuwe datum en valt er niets te melden.
 */
function verschillen(
  oud: HolidayPeriod[],
  nieuw: ReturnType<typeof rijenVan>,
  overrides: HolidayOverride[],
): Vakantie[] {
  const sleutel = (rij: { schoolYearName: string; region: Region; holidayKey: string }) =>
    `${rij.schoolYearName}|${rij.region}|${rij.holidayKey}`;

  const metAanpassing = new Map(
    overrides.map((override) => [sleutel({ ...override }), override] as const),
  );
  const oudeRijen = new Map(oud.map((rij) => [sleutel(rij), rij] as const));

  return nieuw
    .map((rij) => {
      const merk = sleutel({ ...rij, holidayKey: rij.key });
      const eerder = oudeRijen.get(merk);
      const eigen = metAanpassing.get(merk);
      if (!eerder || !eigen) return null;
      if (eerder.from === rij.from && eerder.to === rij.to) return null;

      return leg({ ...eerder, from: rij.from, to: rij.to, name: rij.name }, eigen);
    })
    .filter((rij) => rij !== null);
}

export type HolidayService = ReturnType<typeof createHolidayService>;
