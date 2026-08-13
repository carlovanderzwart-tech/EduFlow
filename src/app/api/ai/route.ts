/**
 * De serverroute (§12.6, T-05, T-17, T-29, DR-24, DR-32, DR-36).
 *
 * Vier poorten, in de volgorde van §12.6, en pas daarna gaat er iets naar een
 * aanbieder:
 *
 *   1. toegangscode uit de ondertekende cookie   (T-05, §8.2.3)
 *   2. snelheidslimiet per code en per adres     (T-17)
 *   3. Zod met `strict`                          (DR-24)
 *   4. beeldcontrole op de inhoud                (T-29, DR-32)
 *
 * De sleutel komt uitsluitend uit de omgeving (DR-36). Staat hij er niet, dan
 * weigert de route — hij valt nooit terug op een aanroep zonder sleutel, en er
 * staat nergens een sleutel in de broncode.
 *
 * **Er komt niets uit dit bestand in een logregel.** §16.4 verbiedt de opdracht,
 * het antwoord, de cookie en het adres. Wat er misgaat, gaat als code en Nederlandse
 * tekst naar de client, en verder nergens heen.
 */

import { zAiRequest, bevatBeeldgegeven } from "@/domain/schemas/aiRequest";
import { createOpenAiEuAdapter } from "@/services/ai/adapters/openai-eu";

import { leesTicket } from "./toegang";
import { binnenLimiet } from "./limiet";

/** De stroom moet per brok doorgegeven worden, dus niet vooraf gerenderd (§12.10). */
export const dynamic = "force-dynamic";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Een fout in de vorm die het scherm verwacht (§10.3, DR-43).
 *
 * Nederlandse tekst die zegt wat er is en wat de volgende stap is, en nooit een
 * foutcode in de zin zelf (§4.7).
 */
function fout(status: number, message: string, code = "AI_UNREACHABLE"): Response {
  return json(status, { error: { code, message, recoverable: true } });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Toegangscode (T-05). Zonder geldig kaartje komt er niets langs.
  const ticket = await leesTicket(request);
  if (!ticket) {
    return fout(
      401,
      "Dit apparaat heeft nog geen toegang. Voer de toegangscode in om verder te kunnen.",
      "PRIVACY_GATE",
    );
  }

  // 2. Snelheidslimiet (T-17), per toegangscode.
  const limiet = binnenLimiet(ticket);
  if (!limiet.ok) {
    return fout(
      429,
      `Je hebt de AI even te vaak gevraagd. Het gaat weer open om ${limiet.opnieuwOm}. Je tekst blijft staan.`,
    );
  }

  // 3. Zod met `strict` (DR-24): een onbekend veld wordt geweigerd, niet genegeerd.
  let ruw: unknown;
  try {
    ruw = await request.json();
  } catch {
    return fout(400, "Dit verzoek klopt niet. Vernieuw de pagina en probeer het opnieuw.");
  }

  const verzoek = zAiRequest.safeParse(ruw);
  if (!verzoek.success) {
    return fout(400, "Dit verzoek klopt niet. Vernieuw de pagina en probeer het opnieuw.");
  }

  // 4. Beeldcontrole (T-29, DR-32). Grover dan nodig, en dat is de bedoeling.
  if (bevatBeeldgegeven(verzoek.data)) {
    return fout(
      422,
      "Er zit een afbeelding in dit verzoek. Foto's gaan nooit naar de AI en blijven op dit apparaat.",
    );
  }

  if (verzoek.data.provider !== "openai-eu") {
    return fout(400, "Deze aanbieder is nog niet beschikbaar. Kies in Instellingen een andere.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fout(
      503,
      "De AI is op deze installatie nog niet ingesteld. Vraag de beheerder de sleutel toe te voegen.",
    );
  }

  const adapter = createOpenAiEuAdapter({ apiKey, fetch: globalThis.fetch });

  let antwoord: Response;
  try {
    antwoord = await adapter.stream({
      opdracht: verzoek.data.opdracht,
      level: verzoek.data.level,
      // Temperatuur en lengte horen bij de taak (§12.2) en staan in PromptService;
      // de route herhaalt ze niet, hij geeft door wat hem bereikt.
      temperature: verzoek.data.level === "zorgvuldig" ? 0.4 : 0.2,
      maxOutputTokens: 1_200,
      signal: request.signal,
    });
  } catch {
    return fout(502, "De AI is niet bereikbaar. Je tekst staat nog in het scherm.");
  }

  if (!antwoord.ok || !antwoord.body) {
    // De tekst van de aanbieder gaat niet door naar de client: die kan de opdracht
    // bevatten (§16.4).
    return fout(502, "De AI gaf geen antwoord. Probeer het zo opnieuw.");
  }

  return new Response(adapter.tekststroom(antwoord.body), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      // Welk model het werd, weet alleen deze kant (§12.7). Het logboek noteert het.
      "x-eduflow-model": adapter.model(verzoek.data.level),
      "x-eduflow-region": adapter.region,
    },
  });
}
