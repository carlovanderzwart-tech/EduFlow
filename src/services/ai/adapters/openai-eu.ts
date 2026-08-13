/**
 * De adapter voor `openai-eu` (§12.7, T-06).
 *
 * **De adapter kiest het model, de app kiest de taak.** §12.7 is daar stellig over:
 * de app vraagt om een taak plus een niveau `snel` of `zorgvuldig`. Daardoor
 * verandert er in de app niets als een aanbieder een model uitfaseert — dan
 * verandert alleen de tabel hieronder.
 *
 * **`fetch` en de sleutel komen binnen als afhankelijkheid.** De sleutel omdat DR-36
 * eist dat geheimen uitsluitend uit de omgeving komen en het lezen daarvan bij de
 * route hoort; `fetch` omdat DR-12 eist dat deze laag te toetsen is zonder netwerk.
 *
 * De vijf blokken worden hier pas platgeslagen. Hoe een aanbieder een
 * systeeminstructie van een gebruikersbericht scheidt is zijn zaak; de opdracht
 * zelf blijft de vorm houden die §12.3 voorschrijft en die D06 toont.
 */

import type { AiLevel, Opdracht } from "@/domain/schemas/aiRequest";

/** Het eindpunt met verwerking binnen de EU (T-06). */
const EU_BASIS = "https://eu.api.openai.com/v1";

/**
 * Welk model bij welk niveau hoort.
 *
 * §12.7 koppelt het niveau aan de taak: mechanisch werk met korte uitvoer gaat
 * `snel`, en wat het product zijn naam geeft gaat `zorgvuldig`. Deze twee namen
 * zijn het enige in dit bestand dat veroudert.
 */
const MODELLEN: Record<AiLevel, string> = {
  snel: "gpt-4o-mini",
  zorgvuldig: "gpt-4o",
};

/** §12.11: afbreken na dertig seconden. */
export const TIJDSLIMIET_MS = 30_000;

export interface AdapterDeps {
  /** Uit `OPENAI_API_KEY`, gelezen door de route (DR-36). */
  apiKey: string;
  fetch: typeof globalThis.fetch;
  basisUrl?: string;
}

export interface Aanroep {
  opdracht: Opdracht;
  level: AiLevel;
  temperature: number;
  maxOutputTokens: number;
  signal: AbortSignal;
}

/**
 * Slaat de vijf blokken plat naar berichten (§12.3).
 *
 * De schrijfstijl hoort bij de systeeminstructie, want die instructie verwijst er
 * letterlijk naar: "Volg de schrijfstijl hieronder." De voorbeelden worden paren
 * van invoer en uitkomst, want dat is wat blok 3 ís. Context en invoer sluiten af.
 */
export function naarBerichten(opdracht: Opdracht): { role: string; content: string }[] {
  const systeem = opdracht.schrijfstijl
    ? `${opdracht.systeeminstructie}\n\n${opdracht.schrijfstijl}`
    : opdracht.systeeminstructie;

  const voorbeelden = opdracht.voorbeelden.flatMap((paar) => [
    { role: "user", content: paar.invoer },
    { role: "assistant", content: paar.uitkomst },
  ]);

  const slot = opdracht.context ? `${opdracht.context}\n\n${opdracht.invoer}` : opdracht.invoer;

  return [{ role: "system", content: systeem }, ...voorbeelden, { role: "user", content: slot }];
}

/**
 * Leest de gebeurtenissenstroom van de aanbieder en geeft er platte tekst voor terug.
 *
 * De aanroeper krijgt dus geen `data:`-regels te verwerken. Dat houdt het
 * terugvertalen in `AIService` een zaak van tekst, en het maakt een tweede adapter
 * inwisselbaar zonder dat er iets bovenstrooms verandert.
 */
function alsTekststroom(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const lezer = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let rest = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await lezer.read();
      if (done) {
        controller.close();
        return;
      }

      rest += decoder.decode(value, { stream: true });
      const regels = rest.split("\n");
      // De laatste regel kan half zijn; die blijft staan tot de volgende brok.
      rest = regels.pop() ?? "";

      for (const regel of regels) {
        if (!regel.startsWith("data:")) continue;
        const inhoud = regel.slice(5).trim();
        if (inhoud === "" || inhoud === "[DONE]") continue;

        try {
          const brok = JSON.parse(inhoud) as { choices?: { delta?: { content?: string } }[] };
          const tekst = brok.choices?.[0]?.delta?.content;
          if (tekst) controller.enqueue(encoder.encode(tekst));
        } catch {
          // Een half JSON-object is geen fout maar een brok die nog niet af is.
          // Hem overslaan is beter dan de hele stroom laten vallen (§6.1.1).
        }
      }
    },
    cancel() {
      void lezer.cancel();
    },
  });
}

export function createOpenAiEuAdapter(deps: AdapterDeps) {
  return {
    id: "openai-eu" as const,
    displayName: "OpenAI (EU)",
    region: "EU",
    capabilities: { streaming: true, systemPrompt: true, maxContextChars: 120_000 },

    /** Ruwe schatting in eurocenten, alleen voor het verbruiksoverzicht (FR-INS-24). */
    estimateCost(charsIn: number, charsOut: number): number {
      // Ongeveer vier tekens per token (§12.12), en een tarief in de orde van
      // enkele euro's per miljoen tokens. Een schatting, geen afrekening.
      return ((charsIn + charsOut) / 4 / 1_000_000) * 500;
    },

    model(level: AiLevel): string {
      return MODELLEN[level];
    },

    async stream(aanroep: Aanroep): Promise<Response> {
      return deps.fetch(`${deps.basisUrl ?? EU_BASIS}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${deps.apiKey}`,
        },
        body: JSON.stringify({
          model: MODELLEN[aanroep.level],
          messages: naarBerichten(aanroep.opdracht),
          temperature: aanroep.temperature,
          max_tokens: aanroep.maxOutputTokens,
          stream: true,
        }),
        signal: aanroep.signal,
      });
    },

    /** Maakt van het antwoord van de aanbieder een stroom van platte tekst. */
    tekststroom: alsTekststroom,
  };
}

export type OpenAiEuAdapter = ReturnType<typeof createOpenAiEuAdapter>;
