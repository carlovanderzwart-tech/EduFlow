/**
 * De snelheidslimiet van T-17 (§12.6).
 *
 * | Venster | Grens |
 * |---|---|
 * | 10 seconden | 3 aanroepen |
 * | 1 uur | 60 aanroepen |
 * | 1 dag | 300 aanroepen |
 *
 * De reden is niet dat de kosten hoog zijn: het is dat een open `/api/ai` zonder
 * slot een gratis AI-dienst is op rekening van de maker (§12.12, C7 uit de review).
 *
 * **Dit telt in het geheugen van één serverproces**, en dat is een bewuste grens
 * van de doorloop. Draaien er straks meer processen naast elkaar, dan telt elk zijn
 * eigen deel en ligt de echte grens hoger. Voor één school met één leerkracht is
 * dat ruim genoeg; een gedeelde teller vraagt om opslag buiten het proces, en dat
 * is een besluit met een nummer en geen bijvangst van D04.
 *
 * Het dagbudget in tekens uit T-17 zit er niet in: dat vraagt om de lengte van de
 * opdracht, en die telt `AIService` al lokaal voor het verbruiksoverzicht
 * (FR-INS-24, §12.12).
 */

/** De drie vensters uit T-17, van kort naar lang. */
const VENSTERS = [
  { duurMs: 10_000, grens: 3 },
  { duurMs: 60 * 60_000, grens: 60 },
  { duurMs: 24 * 60 * 60_000, grens: 300 },
] as const;

/** Zodat een vergeten sleutel het geheugen niet laat groeien. */
const LANGSTE_VENSTER_MS = VENSTERS[VENSTERS.length - 1]!.duurMs;

const gezien = new Map<string, number[]>();

export interface Limietuitkomst {
  ok: boolean;
  /** Wanneer de grens weer opengaat, als wandkloktijd voor de melding (F-08.E5). */
  opnieuwOm: string;
}

function tijdstip(moment: number): string {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(moment));
}

/**
 * Telt deze aanroep mee en zegt of hij mag.
 *
 * Alleen een geslaagde aanroep wordt geteld: een verzoek dat op de limiet strandt
 * schuift de grens niet verder op, want dan zou blijven proberen hem eindeloos
 * vooruitschuiven.
 */
export function binnenLimiet(sleutel: string, nu: number = Date.now()): Limietuitkomst {
  const eerder = (gezien.get(sleutel) ?? []).filter((moment) => nu - moment < LANGSTE_VENSTER_MS);

  for (const venster of VENSTERS) {
    const inVenster = eerder.filter((moment) => nu - moment < venster.duurMs);
    if (inVenster.length >= venster.grens) {
      gezien.set(sleutel, eerder);
      const oudste = Math.min(...inVenster);
      return { ok: false, opnieuwOm: tijdstip(oudste + venster.duurMs) };
    }
  }

  gezien.set(sleutel, [...eerder, nu]);
  return { ok: true, opnieuwOm: tijdstip(nu) };
}

/** Alleen voor de toetsen: begin met een schone teller. */
export function vergeetAlles(): void {
  gezien.clear();
}
