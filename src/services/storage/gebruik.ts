/**
 * Hoeveel opslag er gebruikt is (§9.8, INV-53, T-09).
 *
 * Staat los van de records omdat het een vraag aan de browser is en niet aan de
 * database: `navigator.storage.estimate()` telt alles wat deze oorsprong bezit,
 * inclusief de servicewerker en de cache.
 *
 * Geeft de browser geen schatting, dan is `bekend` onwaar en waarschuwt het scherm
 * niet. Een waarschuwing op een gok is erger dan geen waarschuwing.
 */

/** Boven deze verhouding verschijnt de waarschuwing (INV-53, T-09). */
export const OPSLAGDREMPEL = 0.8;

export interface Opslaggebruik {
  gebruikt: number;
  beschikbaar: number;
  /** Boven `OPSLAGDREMPEL` hoort de waarschuwing te verschijnen. */
  verhouding: number;
  /** `false` als de browser geen schatting geeft; dan is er niets te waarschuwen. */
  bekend: boolean;
}

/** Uitgesplitst zodat een toets een volle schijf kan naspelen. */
export type Schatter = () => Promise<{ usage?: number; quota?: number } | undefined>;

export const BROWSERSCHATTING: Schatter = () =>
  typeof navigator !== "undefined" && navigator.storage?.estimate
    ? navigator.storage.estimate()
    : Promise.resolve(undefined);

export async function meetOpslag(schatten: Schatter): Promise<Opslaggebruik> {
  const schatting = await schatten();
  const gebruikt = schatting?.usage ?? 0;
  const beschikbaar = schatting?.quota ?? 0;

  return {
    gebruikt,
    beschikbaar,
    verhouding: beschikbaar > 0 ? gebruikt / beschikbaar : 0,
    bekend: beschikbaar > 0,
  };
}
