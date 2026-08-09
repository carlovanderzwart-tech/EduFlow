import { parseISODate } from "./date";

/**
 * Leeftijd in jaren en maanden, zoals docs/archief/02 vraagt: "4 jaar en 1 maand".
 *
 * Geeft `null` bij een ontbrekende of onleesbare geboortedatum. docs/archief/04 is daar
 * expliciet over: dan toont EduFlow niets — geen streepje en geen schatting.
 */
export interface Age {
  years: number;
  months: number;
}

export function calculateAge(dateOfBirth: string, today: Date = new Date()): Age | null {
  const birth = parseISODate(dateOfBirth);
  if (!birth) return null;
  if (birth > today) return null;

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  // De maand is nog niet vol wanneer de dag van de maand nog niet is bereikt.
  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months };
}

/** "4 jaar en 1 maand", "5 jaar", "3 maanden". Leeg bij geen geboortedatum. */
export function formatAge(dateOfBirth: string | undefined, today: Date = new Date()): string {
  if (!dateOfBirth) return "";

  const age = calculateAge(dateOfBirth, today);
  if (!age) return "";

  const yearPart = age.years === 1 ? "1 jaar" : `${age.years} jaar`;
  const monthPart = age.months === 1 ? "1 maand" : `${age.months} maanden`;

  if (age.years === 0) return monthPart;
  if (age.months === 0) return yearPart;
  return `${yearPart} en ${monthPart}`;
}
