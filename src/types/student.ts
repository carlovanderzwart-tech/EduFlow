import type { Entity } from "./entity";

/**
 * Een leerling in het register. Het register bestaat om de
 * afscherming richting AI te laten werken en om een documentatie te kunnen
 * koppelen — niet om iets over een kind bij te houden. Zie docs/archief/01, *Buiten
 * scope*.
 */
export interface Student extends Entity {
  firstName: string;
  /**
   * De naam die dagelijks gebruikt wordt, wanneer die afwijkt van de voornaam
   *. Een leerkracht schrijft "JP", niet "Jan-Peter", en zonder
   * dit veld gaat die naam onafgeschermd de deur uit.
   */
  callName?: string;
  lastName?: string;
  /** `YYYY-MM-DD`. Mag leeg zijn; een register met gaten is bruikbaarder dan geen register. */
  dateOfBirth?: string;
  /**
   * Verplicht bij invoer. Mag doodlopen wanneer de groep later wordt
   * opgeruimd — dan blijft de leerling bestaan zonder groep (docs/archief/02).
   */
  groupId?: string;
  /**
   * Een leerling die van school gaat gaat op inactief en wordt nooit hard
   * verwijderd (besluit DR-26), omdat de afscherming op het volledige register
   * werkt.
   */
  active: boolean;
  /** Identificatie uit een ander systeem, voor het herkennen bij een import. */
  externalId?: string;
}

/**
 * Alle namen van één leerling die afgeschermd moeten worden.
 *
 * De Bible kent hier een ander veldenpakket: `firstName`, `firstNameLower` en
 * `lastNameInitial`, zonder aparte roepnaam (§8.3.1). Dat volgt bij
 * implementatiestap 7, samen met de achtstaps vervangingsvolgorde uit §12.5 (T-04).
 */
export function getMaskableNames(student: Student): string[] {
  const firstName = student.firstName?.trim();
  const callName = student.callName?.trim();
  const lastName = student.lastName?.trim();

  const names = [firstName, callName].filter((name): name is string => Boolean(name));

  // De lengtegrens geldt **alleen voor achternamen**: die leveren met één of twee
  // letters meer valse treffers op in gewone tekst dan bescherming. Voor voornaam
  // en roepnaam geldt hij niet — een kind dat "JP" wordt genoemd is precies het
  // geval waarvoor de roepnaam bestaat.
  if (lastName && lastName.length > 2) {
    names.push(lastName);
  }

  return [...new Set(names)];
}

/** "Jan-Peter de Vries", of de voornaam als er niets anders is. Afgeleid, niet opgeslagen. */
export function getStudentFullName(student: Student): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
}
