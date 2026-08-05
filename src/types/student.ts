import type { Entity } from "./entity";

/**
 * Een leerling in het register (besluit B-15). Het register bestaat om de
 * afscherming richting AI te laten werken en om een documentatie te kunnen
 * koppelen — niet om iets over een kind bij te houden. Zie doc 01, *Buiten
 * scope*.
 */
export interface Student extends Entity {
  firstName: string;
  /**
   * De naam die dagelijks gebruikt wordt, wanneer die afwijkt van de voornaam
   * (besluit B-25). Een leerkracht schrijft "JP", niet "Jan-Peter", en zonder
   * dit veld gaat die naam onafgeschermd de deur uit.
   */
  callName?: string;
  lastName?: string;
  /** `YYYY-MM-DD`. Mag leeg zijn; een register met gaten is bruikbaarder dan geen register. */
  dateOfBirth?: string;
  /**
   * Verplicht bij invoer. Mag doodlopen wanneer de groep later wordt
   * opgeruimd — dan blijft de leerling bestaan zonder groep (doc 02).
   */
  groupId?: string;
  /**
   * Een leerling die van school gaat gaat op inactief en wordt nooit hard
   * verwijderd (besluit T-14), omdat de afscherming op het volledige register
   * werkt (T-12).
   */
  active: boolean;
  /** Identificatie uit een ander systeem, voor het herkennen bij een import. */
  externalId?: string;
}

/** Alle namen van één leerling die afgeschermd moeten worden (T-12, T-13, B-25). */
export function getMaskableNames(student: Student): string[] {
  const firstName = student.firstName?.trim();
  const callName = student.callName?.trim();
  const lastName = student.lastName?.trim();

  const names = [firstName, callName].filter((name): name is string => Boolean(name));

  // De lengtegrens uit besluit T-13 geldt **alleen voor achternamen**: die
  // leveren met één of twee letters meer valse treffers op in gewone tekst dan
  // bescherming. Voor voornaam en roepnaam geldt hij niet — een kind dat "JP"
  // wordt genoemd is precies het geval waarvoor de roepnaam bestaat (B-25).
  if (lastName && lastName.length > 2) {
    names.push(lastName);
  }

  return [...new Set(names)];
}

/** "Jan-Peter de Vries", of de voornaam als er niets anders is. Afgeleid, niet opgeslagen. */
export function getStudentFullName(student: Student): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
}
