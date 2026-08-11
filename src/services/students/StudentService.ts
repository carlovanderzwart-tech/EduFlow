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
 * Wat er in deze eerste versie **niet** in zit: samenvoegen, uit dienst, importeren
 * uit een lijst, en lidmaatschappen. Die staan in §6.5.2 en §6.5.3 en komen bij de
 * stap die de groepen bouwt.
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

  /** Verwijderen is markeren (§8.1.6); de leerling blijft dertig dagen herstelbaar (T-11). */
  function verwijder(id: Uuid): Promise<Result<Student>> {
    return deps.storage.softDelete("students", id);
  }

  return { lijst, voegToe, verwijder };
}

export type StudentService = ReturnType<typeof createStudentService>;
