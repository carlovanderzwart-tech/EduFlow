/**
 * Of de installatie compleet is (werkopdracht D04).
 *
 * Zegt of de drie omgevingsvariabelen er zijn, en **nooit wat erin staat** — geen
 * waarde, geen begin, geen lengte. Dat laatste is geen overdrijving: uit de lengte
 * van een sleutel valt af te leiden welk soort sleutel het is.
 *
 * Hij bestaat om één vraag te beantwoorden die anders alleen met een echte
 * AI-aanroep te beantwoorden is: staat deze installatie klaar? Dat scheelt de
 * beheerder een aanroep die geld kost om erachter te komen dat er een sleutel
 * ontbreekt.
 */

export const dynamic = "force-dynamic";

export function GET(): Response {
  const ingesteld = {
    toegangscode: Boolean(process.env.EDUFLOW_ACCESS_CODE),
    cookiegeheim: Boolean(process.env.EDUFLOW_COOKIE_SECRET),
    aiSleutel: Boolean(process.env.OPENAI_API_KEY),
  };

  const compleet = Object.values(ingesteld).every(Boolean);

  return new Response(JSON.stringify({ ok: compleet, ingesteld }), {
    status: compleet ? 200 : 503,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
