/**
 * Leerlingen (§10.4, §8.3.1, §9.5.3).
 *
 * Dit is het gevoeligste bestand van de app en tegelijk de motor van de
 * afscherming: `PrivacyService` leest deze namen om ze uit een tekst te halen
 * voordat er iets naar een provider gaat.
 *
 * **Een leerling heeft geen groep** (INV-23). Hij heeft nul of meer
 * lidmaatschappen, en die horen bij de groep (§9.4.3). Het schema is `strict`, dus
 * een `groupId` erbij zetten lukt niet — dat is de handhaving, niet dit
 * commentaar.
 *
 * Wat er **niet** in zit: samenvoegen (FR-INS-05) en CSV-import (FR-INS-03). Uit
 * dienst en lidmaatschappen horen bij het `Group`-aggregaat en staan daarom in
 * `GroupService` (§9.4.3, FR-INS-04).
 *
 * **Dubbele voornamen zijn iets anders dan dubbele weergavenamen**, en dat is de
 * kern van FR-INS-02 naast INV-29. "Noa B." en "Noa V." zijn twee toegestane
 * leerlingen: hun weergavenaam verschilt, dus INV-29 is heel. Hun **voornaam**
 * botst wel, en dat is geen fout maar een melding — bij het afschermen krijgt elk
 * een eigen code (§12.5 stap 7, B-76). Twee keer dezelfde weergavenaam blijft
 * onmogelijk.
 */

import { ongeldig, type Result } from "@/lib/result";
import { foldDiacritics } from "@/lib/text";
import type { Uuid } from "@/lib/uuid";
import type { Student } from "@/domain/types";

import type { StorageService } from "../storage/StorageService";

export interface StudentDeps {
  storage: StorageService;
}

/** Wat het scherm invult. De rest leidt de service af. */
export interface NieuweLeerling {
  firstName: string;
  /** Eén tot drie tekens, mag een punt bevatten (§8.3.1). Leeg als er geen botsing is. */
  lastNameInitial?: string;
}

/** Eén tot drie tekens (§6.5.1, §8.3.1). Het scherm begrenst het veld met hetzelfde getal. */
export const BEGINLETTER_MAX = 3;

/** Eén regel uit een geplakte lijst, nog niet opgeslagen (FR-INS-01). */
export interface Geplaktenaam {
  firstName: string;
  lastNameInitial: string;
}

export interface Lijstuitkomst {
  toegevoegd: Student[];
  /** Regels die niet konden, met de melding die de service erbij schreef. */
  geweigerd: { naam: string; reden: string }[];
  /** Voornamen die nu meer dan één keer voorkomen (FR-INS-02). Leeg is het normale geval. */
  dubbeleVoornamen: string[];
}

/**
 * Splitst een geplakte lijst in namen (FR-INS-01).
 *
 * Regeleinden, komma's en tabs, en niets anders: §6.5.1 noemt precies deze drie.
 * Een regel met een tweede woord erin levert de beginletter, zodat "Noa B." in één
 * keer goed staat en de gebruiker hem niet in twee velden hoeft te knippen.
 *
 * Hij staat hier en niet in het scherm, omdat DR-15 een scherm zonder regels wil
 * en omdat dezelfde splitsing later door de CSV-import wordt hergebruikt.
 */
export function ontleedLijst(tekst: string): Geplaktenaam[] {
  return tekst
    .split(/[\n\r,\t]+/u)
    .map((regel) => regel.trim())
    .filter((regel) => regel.length > 0)
    .map(ontleedRegel);
}

function ontleedRegel(regel: string): Geplaktenaam {
  const [eerste = "", ...rest] = regel.split(/\s+/u);
  return { firstName: eerste, lastNameInitial: rest.join(" ").slice(0, BEGINLETTER_MAX) };
}

/**
 * De melding bij gelijke voornamen (FR-INS-02, B-76).
 *
 * Geen weigering: twee kinderen die Noa heten mogen allebei bestaan. De melding
 * zegt wat er gebeurt bij het afschermen, want dat is de reden dat het ertoe doet.
 */
export function dubbelemelding(voornamen: readonly string[]): string | null {
  if (voornamen.length === 0) return null;
  const namen = voornamen.join(" en ");
  return `Er staan meerdere leerlingen met de voornaam ${namen}. Bij het afschermen krijgt elk van hen een eigen code. Zet er een beginletter bij als je ze in teksten uit elkaar wilt houden.`;
}

/**
 * Hoe een leerling in een lijst staat: "Noa" of "Noa V." (§9.8).
 *
 * Eén functie, want INV-29 gaat over deze samenstelling en niet over `firstName`
 * alleen. Stond hij op twee plekken, dan zou de uniciteitscontrole iets anders
 * vergelijken dan het scherm toont.
 */
export function weergavenaam(leerling: Pick<Student, "firstName" | "lastNameInitial">): string {
  return leerling.lastNameInitial
    ? `${leerling.firstName} ${leerling.lastNameInitial}`
    : leerling.firstName;
}

/**
 * De vorm waarop twee namen botsen.
 *
 * Diakrieten worden gevouwen omdat "Hanaë" en "Hanae" in een lijst niet uit elkaar
 * te houden zijn, en dat is precies wat INV-29 wil voorkomen. Dat is dezelfde
 * afweging als bij het afschermen (§12.5): liever één keer te veel vinden.
 */
function botsvorm(naam: string): string {
  return foldDiacritics(naam).toLowerCase().replace(/\s+/gu, " ").trim();
}

export function createStudentService(deps: StudentDeps) {
  async function lijst(): Promise<Result<Student[]>> {
    const uitkomst = await deps.storage.list("students");
    if (!uitkomst.ok) return uitkomst;

    return {
      ok: true,
      value: [...uitkomst.value].sort((a, b) =>
        weergavenaam(a).localeCompare(weergavenaam(b), "nl"),
      ),
    };
  }

  /**
   * Voegt een leerling toe (INV-29).
   *
   * Bij een botsing faalt het opslaan met de melding uit §9.5.3. De service stelt
   * geen toevoeging voor; dat doet het scherm, want daar staat het veld waarin de
   * gebruiker hem intypt.
   */
  async function voegToe(invoer: NieuweLeerling): Promise<Result<Student>> {
    const firstName = invoer.firstName.trim();
    const lastNameInitial = (invoer.lastNameInitial ?? "").trim();

    if (!firstName) {
      return ongeldig("Een leerling heeft een voornaam nodig. Vul er een in.");
    }

    const bestaande = await deps.storage.list("students");
    if (!bestaande.ok) return bestaande;

    const nieuwe = botsvorm(weergavenaam({ firstName, lastNameInitial }));
    if (bestaande.value.some((leerling) => botsvorm(weergavenaam(leerling)) === nieuwe)) {
      // §4.7: wat er gebeurde, wat het betekent, wat de volgende stap is.
      return ongeldig(
        lastNameInitial
          ? "Er staat al een leerling met deze naam en beginletter. Kies een andere beginletter."
          : "Er staat al een leerling die zo heet. Zet een beginletter van de achternaam erbij.",
      );
    }

    return deps.storage.create("students", {
      firstName,
      // §8.3.1: kleine letters, diakrieten behouden. De zoekindex bewaart wat er
      // staat; alleen de botscontrole hierboven vouwt ze weg.
      firstNameLower: firstName.toLowerCase(),
      lastNameInitial,
      birthDay: null,
      birthMonth: null,
      birthYear: null,
      note: "",
      // "volgnummer" uit §8.3.1: hij bepaalt `[LEERLING-n]` bij het afschermen, en
      // twee leerlingen met hetzelfde nummer zouden hetzelfde pseudoniem krijgen.
      pseudonymSeed: bestaande.value.reduce((hoogste, l) => Math.max(hoogste, l.pseudonymSeed), 0) + 1,
    });
  }

  /**
   * Zet of wist de geboortedatum (`FR-AGE-24`, B-139).
   *
   * **Dag en maand zonder jaar mag**, en dat is geen slordigheid maar de eis: *"dan
   * wordt dat opgeslagen zonder jaar en verschijnt de verjaardag zonder leeftijd.
   * Dat is dataminimalisatie in de praktijk."* Een jaar zonder dag en maand mag
   * niet — daar is geen verjaardag uit te halen en geen leeftijd, dus het levert
   * alleen een geboortejaar op dat nergens voor dient (§15).
   *
   * `null` op alle drie wist de datum. Dat is de weg terug voor wie hem per ongeluk
   * invulde, en §15.4 vraagt die weg uitdrukkelijk.
   */
  /** Verwijderen is markeren (§8.1.6); de leerling blijft dertig dagen herstelbaar (T-11). */
  function verwijder(id: Uuid): Promise<Result<Student>> {
    return deps.storage.softDelete("students", id);
  }

  return {
    lijst,
    voegToe,
    zetGeboortedatum: (id: Uuid, datum: Geboortedatum) =>
      zetGeboortedatum(deps.storage, id, datum),
    voegLijstToe: (regels: readonly Geplaktenaam[]) =>
      voegLijstToe(deps.storage, voegToe, regels),
    dubbeleVoornamen: () => dubbeleVoornamen(deps.storage),
    verwijder,
  };
}

/** Wat het scherm aanlevert; alle drie leeg wist de datum. */
export interface Geboortedatum {
  dag: number | null;
  maand: number | null;
  jaar: number | null;
}

/**
 * Zet of wist de geboortedatum (`FR-AGE-24`, B-139).
 *
 * **Dag en maand zonder jaar mag**, en dat is geen slordigheid maar de eis: *"dan
 * wordt dat opgeslagen zonder jaar en verschijnt de verjaardag zonder leeftijd. Dat
 * is dataminimalisatie in de praktijk."* Een jaar zonder dag en maand mag niet —
 * daar is geen verjaardag uit te halen en geen leeftijd, dus het levert alleen een
 * geboortejaar op dat nergens voor dient (§15).
 *
 * Alle drie leeg wist de datum. Dat is de weg terug voor wie hem per ongeluk
 * invulde, en §15.4 vraagt die weg uitdrukkelijk.
 */
async function zetGeboortedatum(
  storage: StorageService,
  id: Uuid,
  datum: Geboortedatum,
): Promise<Result<Student>> {
  const leeg = datum.dag === null && datum.maand === null && datum.jaar === null;
  if (!leeg && (datum.dag === null || datum.maand === null)) {
    return ongeldig(
      "Vul een dag én een maand in. Het jaar mag je weglaten; dan is er geen leeftijd.",
    );
  }

  if (!leeg && !bestaatDatum(datum.dag!, datum.maand!)) {
    return ongeldig("Deze dag bestaat niet in deze maand. Pas hem aan.");
  }

  return storage.update("students", id, {
    birthDay: leeg ? null : datum.dag,
    birthMonth: leeg ? null : datum.maand,
    birthYear: leeg ? null : datum.jaar,
  });
}

/**
 * Bestaat deze dag in deze maand? (`FR-AGE-24`)
 *
 * Zonder jaar, want het jaar mag ontbreken. 29 februari telt daarom als een
 * bestaande dag: in een schrikkeljaar is hij er, en een kind dat dan jarig is
 * bestaat ook in de jaren waarin de dag niet valt.
 */
function bestaatDatum(dag: number, maand: number): boolean {
  if (maand < 1 || maand > 12 || dag < 1) return false;
  const LANGSTE_MAAND = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dag <= LANGSTE_MAAND[maand - 1]!;
}

/**
 * Voegt een geplakte lijst in één handeling toe (FR-INS-01).
 *
 * Regel voor regel via `voegToe`, zodat de botscontrole van INV-29 en het
 * volgnummer van §8.3.1 op één plek blijven staan. Een regel die niet kan houdt de
 * andere negentien niet tegen: de gebruiker heeft er twintig geplakt en krijgt er
 * negentien plus één melding, niet nul plus één melding (§4.7).
 */
async function voegLijstToe(
  storage: StorageService,
  voegToe: (invoer: NieuweLeerling) => Promise<Result<Student>>,
  regels: readonly Geplaktenaam[],
): Promise<Result<Lijstuitkomst>> {
  const toegevoegd: Student[] = [];
  const geweigerd: Lijstuitkomst["geweigerd"] = [];

  for (const regel of regels) {
    const uitkomst = await voegToe(regel);
    if (uitkomst.ok) {
      toegevoegd.push(uitkomst.value);
      continue;
    }
    // Een volle opslag is geen regelfout maar een toestand van het apparaat: die
    // hoort de aanroeper als `Result` te krijgen, niet als regel in een lijstje.
    if (uitkomst.error.code !== "INVALID_INPUT") return uitkomst;
    geweigerd.push({ naam: weergavenaam(regel), reden: uitkomst.error.message });
  }

  const dubbele = await dubbeleVoornamen(storage);
  if (!dubbele.ok) return dubbele;

  return { ok: true, value: { toegevoegd, geweigerd, dubbeleVoornamen: dubbele.value } };
}

/** Welke voornamen meer dan één keer voorkomen (FR-INS-02). */
async function dubbeleVoornamen(storage: StorageService): Promise<Result<string[]>> {
  const uitkomst = await storage.list("students");
  if (!uitkomst.ok) return uitkomst;

  const eerste = new Map<string, string>();
  const dubbel = new Set<string>();
  for (const leerling of uitkomst.value) {
    const sleutel = botsvorm(leerling.firstName);
    if (eerste.has(sleutel)) dubbel.add(eerste.get(sleutel)!);
    else eerste.set(sleutel, leerling.firstName);
  }

  return { ok: true, value: [...dubbel].sort((a, b) => a.localeCompare(b, "nl")) };
}

export type StudentService = ReturnType<typeof createStudentService>;
