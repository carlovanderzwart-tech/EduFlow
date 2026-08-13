/**
 * Het ondertekende sessiekaartje in de cookie `eduflow_access` (§8.2.3, T-05).
 *
 * §8.2.3 schrijft voor wat erin zit: "Ondertekend sessiekaartje met het
 * toegangscode-id en een vervaldatum. **Niet de code zelf.**" Dat laatste is de
 * kern — de code hoeft nooit terug naar de browser, dus hij gaat er ook nooit heen.
 *
 * Ondertekend met HMAC-SHA-256 uit `EDUFLOW_COOKIE_SECRET` (DR-36). Zonder dat
 * geheim is het kaartje na te maken en is de hele poort een suggestie.
 *
 * De vergelijking gebeurt in constante tijd. Een gewone `===` op een handtekening
 * lekt via de duur waar de eerste byte afwijkt; dat is een bekende manier om een
 * handtekening teken voor teken te raden.
 */

/** B-120: negentig dagen. §8.2.3 geeft de reden, FR-INS-37 is erop gewijzigd. */
export const COOKIE_MAX_AGE_S = 90 * 24 * 60 * 60;

export const COOKIE_NAAM = "eduflow_access";

interface Ticket {
  /** Niet de code, maar zijn afdruk: genoeg om de limiet per code te tellen. */
  codeId: string;
  verlooptOp: number;
}

function encoder(): TextEncoder {
  return new TextEncoder();
}

async function sleutel(geheim: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder().encode(geheim),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function naarBasis64Url(ruw: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(ruw)))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/=+$/u, "");
}

async function onderteken(inhoud: string, geheim: string): Promise<string> {
  const handtekening = await crypto.subtle.sign(
    "HMAC",
    await sleutel(geheim),
    encoder().encode(inhoud),
  );
  return naarBasis64Url(handtekening);
}

/** Vergelijkt zonder via de duur te verraden waar het verschil zit. */
function gelijkInConstanteTijd(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let verschil = 0;
  for (let i = 0; i < a.length; i += 1) verschil |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return verschil === 0;
}

/** De afdruk van de toegangscode. De code zelf verlaat de server nooit. */
export async function codeAfdruk(code: string, geheim: string): Promise<string> {
  return (await onderteken(`code:${code}`, geheim)).slice(0, 16);
}

/** Maakt een kaartje dat `COOKIE_MAX_AGE_S` geldig is. */
export async function maakTicket(code: string, geheim: string, nu: number): Promise<string> {
  const ticket: Ticket = {
    codeId: await codeAfdruk(code, geheim),
    verlooptOp: nu + COOKIE_MAX_AGE_S * 1_000,
  };
  const inhoud = naarBasis64Url(encoder().encode(JSON.stringify(ticket)).buffer as ArrayBuffer);
  return `${inhoud}.${await onderteken(inhoud, geheim)}`;
}

/**
 * Leest het kaartje uit het verzoek en geeft het code-id terug, of `null`.
 *
 * `null` bij alles wat niet klopt: geen cookie, een verminkte vorm, een
 * handtekening die niet klopt, of een kaartje dat verlopen is. De aanroeper krijgt
 * geen reden te horen — welke van de vier het was, is informatie die alleen nut
 * heeft voor wie hem probeert te raden.
 */
export async function leesTicket(request: Request): Promise<string | null> {
  const geheim = process.env.EDUFLOW_COOKIE_SECRET;
  if (!geheim) return null;

  const koek = request.headers
    .get("cookie")
    ?.split(";")
    .map((deel) => deel.trim())
    .find((deel) => deel.startsWith(`${COOKIE_NAAM}=`))
    ?.slice(COOKIE_NAAM.length + 1);
  if (!koek) return null;

  const [inhoud, handtekening] = koek.split(".");
  if (!inhoud || !handtekening) return null;

  const verwacht = await onderteken(inhoud, geheim);
  if (!gelijkInConstanteTijd(handtekening, verwacht)) return null;

  try {
    const ticket = JSON.parse(atob(inhoud.replace(/-/gu, "+").replace(/_/gu, "/"))) as Ticket;
    if (typeof ticket.codeId !== "string" || typeof ticket.verlooptOp !== "number") return null;
    if (ticket.verlooptOp < Date.now()) return null;
    return ticket.codeId;
  } catch {
    return null;
  }
}
