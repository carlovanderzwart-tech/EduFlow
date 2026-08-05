/**
 * Datums zijn kalenderdagen zonder tijd, opgeslagen als `YYYY-MM-DD`.
 *
 * Let op: `new Date("2026-08-04")` wordt door de standaard als UTC-middernacht
 * gelezen. In een tijdzone achter UTC levert formatteren dan de dag ervoor op.
 * Daarom wordt hier altijd expliciet met lokale datumdelen gewerkt en nooit met
 * `toISOString()`.
 */

/** Zet een `Date` om naar `YYYY-MM-DD` in de lokale tijdzone. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Leest `YYYY-MM-DD` als lokale middernacht. Ongeldige invoer geeft `null`. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Vangt datums als 2026-02-31, die JavaScript stilzwijgend doorrolt.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Vandaag als `YYYY-MM-DD`. */
export function todayISO(): string {
  return toISODate(new Date());
}

const longFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "4 augustus 2026". Geeft de invoer onveranderd terug als die geen datum is. */
export function formatDateLong(value: string): string {
  const date = parseISODate(value);
  return date ? longFormatter.format(date) : value;
}

/** "4 aug 2026", voor lijsten waar ruimte krap is. */
export function formatDateShort(value: string): string {
  const date = parseISODate(value);
  return date ? shortFormatter.format(date) : value;
}

/**
 * Het lopende schooljaar, dat in Nederland op 1 augustus begint en op 31 juli
 * eindigt. Standaardbereik voor het periodefilter (doc 02).
 */
export function getCurrentSchoolYearRange(today: Date = new Date()): {
  from: string;
  to: string;
} {
  const august = 7; // maandindex 0-gebaseerd
  const startYear = today.getMonth() >= august ? today.getFullYear() : today.getFullYear() - 1;

  return {
    from: toISODate(new Date(startYear, august, 1)),
    to: toISODate(new Date(startYear + 1, august, 0)), // dag 0 = laatste dag van juli
  };
}

/** "2025/2026" voor het lopende schooljaar. Vast formaat, zodat filteren klopt. */
export function getCurrentSchoolYearLabel(today: Date = new Date()): string {
  const august = 7;
  const startYear = today.getMonth() >= august ? today.getFullYear() : today.getFullYear() - 1;
  return `${startYear}/${startYear + 1}`;
}
