/**
 * Groepen en lidmaatschappen (§10.4, §8.3.2, §8.3.3, §9.4.3).
 *
 * **Een leerling heeft geen groep** (INV-23, U-07, B-16). Hij heeft nul of meer
 * lidmaatschappen met een looptijd, en die horen bij het `Group`-aggregaat. Beide
 * richtingen — "wie zit er in deze groep" en "in welke groepen zit dit kind" —
 * lopen uitsluitend via `GroupMembership`. Daarom staat er in dit bestand geen
 * enkele functie die één groep bij een leerling zoekt: die vraag heeft geen
 * antwoord, en dat is de bedoeling (FR-INS-07: er bestaat geen hoofdgroep).
 *
 * Elke schrijfactie loopt via `schrijfAggregaat` met `groups` als wortel. Dat is
 * §9.4.3 en §9.6 tegelijk: de regels die bewaakt worden gaan over de groep, en de
 * `rev` van de wortel is de versie van het geheel. De overlapcontrole van INV-25
 * staat daarom **binnen** die transactie en niet ervoor.
 */

import type { IsoDate } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import { datumKort } from "@/lib/weergave";
import type { Colour, Group, GroupKind, GroupMembership, MembershipRole } from "@/domain/types";

import type { StorageService } from "../storage/StorageService";

export interface GroupDeps {
  storage: StorageService;
}

/** Wat het scherm invult bij een nieuwe groep. De rest leidt de service af. */
export interface Nieuwegroep {
  name: string;
  kind: GroupKind;
  colour: Colour;
  /** Een groep hoort bij precies één schooljaar (INV-27). */
  schoolYearId: Uuid;
}

export interface Nieuwlidmaatschap {
  studentId: Uuid;
  groupId: Uuid;
  from: IsoDate;
  /** Leeg betekent lopend (INV-24). */
  to?: IsoDate | null;
  role?: MembershipRole;
}

/**
 * De vergelijkingswaarde van een lidmaatschap dat nog loopt.
 *
 * Een lege einddatum is geen ontbrekend gegeven maar "voorlopig geen einde"
 * (§8.3.3). Met deze bovengrens is de overlapvraag één vergelijking in plaats van
 * vier gevallen, en `JJJJ-MM-DD` blijft alfabetisch vergelijkbaar (DR-54).
 */
const OPEN_EINDE = "9999-12-31";

/** Nederlandse namen voor de schermen; de code houdt de sleutels aan (§9.9, DR-51). */
export const GROEPSOORTEN: Record<GroupKind, string> = {
  stamgroep: "Stamgroep",
  combinatiegroep: "Combinatiegroep",
  projectgroep: "Projectgroep",
  zorggroep: "Zorggroep",
  instroomgroep: "Instroomgroep",
  overig: "Overig",
};

type Periode = Pick<GroupMembership, "from" | "to">;

/** Twee periodes raken elkaar (INV-25). Randen tellen mee: 17 juli tot 17 juli is één dag. */
function overlapt(a: Periode, b: Periode): boolean {
  return a.from <= (b.to ?? OPEN_EINDE) && b.from <= (a.to ?? OPEN_EINDE);
}

/**
 * De melding bij een botsing (INV-25, FR-INS-08).
 *
 * §9.5.3 eist dat de botsende periode te zien is en dat de app aanbiedt de vorige
 * af te sluiten. De tekst volgt §4.7: wat er is, wat het betekent, wat je doet.
 */
function botsmelding(bestaand: Periode): string {
  const periode = bestaand.to
    ? `van ${datumKort(bestaand.from)} tot ${datumKort(bestaand.to)}`
    : `sinds ${datumKort(bestaand.from)}`;
  return `Deze leerling zit al in deze groep ${periode}. Twee lidmaatschappen tegelijk maken onduidelijk in welke groep het kind zat. Verleng het bestaande lidmaatschap of sluit het eerst af.`;
}

async function lijst(storage: StorageService): Promise<Result<Group[]>> {
  const uitkomst = await storage.list("groups");
  if (!uitkomst.ok) return uitkomst;
  return { ok: true, value: [...uitkomst.value].sort((a, b) => a.name.localeCompare(b.name, "nl")) };
}

async function maak(storage: StorageService, invoer: Nieuwegroep): Promise<Result<Group>> {
  const name = invoer.name.trim();
  if (!name) return ongeldig("Een groep heeft een naam nodig. Vul er een in.");

  return storage.schrijfAggregaat("groups", [], (schrijver) =>
    schrijver.maak("groups", { ...invoer, name }),
  );
}

/** Wie er in deze groep zitten of hebben gezeten, met hun looptijd. */
async function leden(storage: StorageService, groupId: Uuid): Promise<Result<GroupMembership[]>> {
  const uitkomst = await storage.list("groupMemberships");
  if (!uitkomst.ok) return uitkomst;
  return { ok: true, value: uitkomst.value.filter((lid) => lid.groupId === groupId) };
}

/**
 * De lijst "Zit in" van één leerling (FR-INS-06).
 *
 * Meerdere lidmaatschappen tegelijk is normaal en geen van beide is de hoofdgroep
 * (FR-INS-07). De volgorde is die van de begindatum, want dat is de volgorde
 * waarin ze zijn ontstaan.
 */
async function zitIn(storage: StorageService, studentId: Uuid): Promise<Result<GroupMembership[]>> {
  const uitkomst = await storage.list("groupMemberships");
  if (!uitkomst.ok) return uitkomst;

  const eigen = uitkomst.value
    .filter((lid) => lid.studentId === studentId)
    .sort((a, b) => a.from.localeCompare(b.from));
  return { ok: true, value: eigen };
}

/**
 * Voegt een leerling toe aan een groep (FR-INS-08, INV-24, INV-25).
 *
 * De overlapcontrole en het schrijven staan in dezelfde transactie van het
 * aggregaat, zoals §9.5.3 voorschrijft: ertussen zou een tweede tabblad een botsend
 * lidmaatschap kunnen wegschrijven zonder dat deze aanroep het ziet.
 */
async function voegLidToe(
  storage: StorageService,
  invoer: Nieuwlidmaatschap,
): Promise<Result<GroupMembership>> {
  const nieuw = {
    studentId: invoer.studentId,
    groupId: invoer.groupId,
    from: invoer.from,
    to: invoer.to ?? null,
    role: invoer.role ?? ("lid" as const),
  };

  if (nieuw.to && nieuw.to < nieuw.from) {
    return ongeldig("De einddatum ligt vóór de begindatum. Kies een latere einddatum.");
  }

  const bestaande = await zitIn(storage, nieuw.studentId);
  if (!bestaande.ok) return bestaande;

  const botsing = bestaande.value.find(
    (lid) => lid.groupId === nieuw.groupId && overlapt(lid, nieuw),
  );
  if (botsing) return ongeldig(botsmelding(botsing));

  return storage.schrijfAggregaat("groups", ["groupMemberships"], async (schrijver) => {
    const lidmaatschap = await schrijver.maak("groupMemberships", nieuw);
    // De wortel draagt de journaalregel en de versie van het geheel (§9.6, §10.8).
    await schrijver.wijzig("groups", nieuw.groupId, {});
    return lidmaatschap;
  });
}

/** Sluit één lidmaatschap af op een datum. Verwijdert niets (§8.1.6). */
async function beeindig(
  storage: StorageService,
  membershipId: Uuid,
  per: IsoDate,
): Promise<Result<GroupMembership>> {
  const bestaand = await storage.read("groupMemberships", membershipId);
  if (!bestaand.ok) return bestaand;
  if (!bestaand.value) return ongeldig("Dit lidmaatschap bestaat niet meer. Vernieuw de pagina.");
  if (per < bestaand.value.from) {
    return ongeldig("De einddatum ligt vóór de begindatum. Kies een latere datum.");
  }

  const groupId = bestaand.value.groupId;
  return storage.schrijfAggregaat("groups", ["groupMemberships"], async (schrijver) => {
    const lidmaatschap = await schrijver.wijzig("groupMemberships", membershipId, { to: per });
    await schrijver.wijzig("groups", groupId, {});
    return lidmaatschap;
  });
}

/**
 * Uit dienst (FR-INS-04).
 *
 * Alle lopende lidmaatschappen krijgen deze einddatum. De leerling zelf blijft
 * bestaan en elke documentatie waar hij in voorkomt blijft ongewijzigd — dat is het
 * hele punt van deze handeling tegenover verwijderen. Een lidmaatschap dat pas ná
 * de uitdienstdatum begint, wordt één dag lang in plaats van negatief (INV-24).
 */
async function uitDienst(
  storage: StorageService,
  studentId: Uuid,
  per: IsoDate,
): Promise<Result<number>> {
  const lopend = await zitIn(storage, studentId);
  if (!lopend.ok) return lopend;

  const open = lopend.value.filter((lid) => lid.to === null || lid.to > per);
  for (const lid of open) {
    const uitkomst = await beeindig(storage, lid.id, per >= lid.from ? per : lid.from);
    if (!uitkomst.ok) return uitkomst;
  }

  return { ok: true, value: open.length };
}

export function createGroupService({ storage }: GroupDeps) {
  return {
    lijst: () => lijst(storage),
    maak: (invoer: Nieuwegroep) => maak(storage, invoer),
    leden: (groupId: Uuid) => leden(storage, groupId),
    zitIn: (studentId: Uuid) => zitIn(storage, studentId),
    voegLidToe: (invoer: Nieuwlidmaatschap) => voegLidToe(storage, invoer),
    beeindig: (membershipId: Uuid, per: IsoDate) => beeindig(storage, membershipId, per),
    uitDienst: (studentId: Uuid, per: IsoDate) => uitDienst(storage, studentId, per),
  };
}

export type GroupService = ReturnType<typeof createGroupService>;
