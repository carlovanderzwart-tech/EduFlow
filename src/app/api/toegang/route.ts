/**
 * De toegangscode inwisselen voor een cookie (T-05, FR-INS-37, §8.2.3).
 *
 * **Dit eindpunt staat niet in de bestandenlijst van werkopdracht D04**, en het is
 * er toch. D04 vraagt om een route die de toegangscode uit een cookie leest, maar
 * geen enkele stap zet die cookie ooit. Zonder dit eindpunt kan `/api/ai` dus
 * niets anders dan weigeren, en is het doel van D04 — een testtekst die heen en
 * terug gaat — niet te halen. Dat is de kleinste toevoeging die de opdracht
 * uitvoerbaar maakt; zie het besluit dat hierbij hoort.
 *
 * De code gaat één keer over de lijn en komt nooit terug: wat de browser bewaart
 * is een ondertekend kaartje met de **afdruk** van de code (§8.2.3).
 *
 * De code zelf komt uitsluitend uit de omgeving (DR-36) en staat nergens in de
 * broncode. Hij verschijnt ook nooit in een foutmelding of een logregel (§16.4).
 */

import { binnenLimiet } from "../ai/limiet";
import { COOKIE_MAX_AGE_S, COOKIE_NAAM, maakTicket } from "../ai/toegang";

export const dynamic = "force-dynamic";

function json(status: number, body: unknown, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function fout(status: number, message: string): Response {
  return json(status, { error: { code: "PRIVACY_GATE", message, recoverable: true } });
}

/** Vergelijkt zonder via de duur te verraden waar het verschil zit. */
function gelijkInConstanteTijd(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let verschil = 0;
  for (let i = 0; i < a.length; i += 1) verschil |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return verschil === 0;
}

/**
 * Het adres waar het verzoek vandaan komt, alleen om te tellen.
 *
 * T-17 noemt het adres uitdrukkelijk als tweede sleutel voor de limiet. Het wordt
 * hier gebruikt en nergens bewaard; §16.4 verbiedt het opslaan, niet het tellen.
 */
function herkomst(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
}

export async function POST(request: Request): Promise<Response> {
  const verwacht = process.env.EDUFLOW_ACCESS_CODE;
  const geheim = process.env.EDUFLOW_COOKIE_SECRET;
  if (!verwacht || !geheim) {
    return fout(
      503,
      "Deze installatie heeft nog geen toegangscode. Vraag de beheerder er een in te stellen.",
    );
  }

  // Zonder deze limiet is de code te raden door hem vaak genoeg te proberen.
  const limiet = binnenLimiet(`toegang:${herkomst(request)}`);
  if (!limiet.ok) {
    return fout(429, `Te veel pogingen. Probeer het opnieuw om ${limiet.opnieuwOm}.`);
  }

  let ruw: unknown;
  try {
    ruw = await request.json();
  } catch {
    return fout(400, "Dit verzoek klopt niet. Vernieuw de pagina en probeer het opnieuw.");
  }

  const code = (ruw as { code?: unknown })?.code;
  if (typeof code !== "string" || code.length === 0) {
    return fout(400, "Vul de toegangscode in.");
  }

  if (!gelijkInConstanteTijd(code, verwacht)) {
    // Niet zeggen wat er mis was: dat is informatie die alleen nut heeft voor wie
    // de code probeert te raden.
    return fout(401, "Deze toegangscode klopt niet. Controleer hem en probeer het opnieuw.");
  }

  const ticket = await maakTicket(code, geheim, Date.now());

  return json(
    200,
    { ok: true },
    {
      // §8.2.3: httpOnly zodat een script er niet bij kan, Secure zodat hij alleen
      // over HTTPS gaat, SameSite=Strict zodat hij nooit meegaat vanaf een andere
      // site, en negentig dagen (B-120).
      "set-cookie": `${COOKIE_NAAM}=${ticket}; Max-Age=${COOKIE_MAX_AGE_S}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    },
  );
}
