/**
 * De keten (§12.1, DR-16, DR-31).
 *
 * De volgorde is vast en er is geen enkele route die hem overslaat:
 *
 *   gate → pseudonymise → PromptService → *controlescherm (D06)* → /api/ai →
 *   provider → stroom terug → restore → AIInteraction
 *
 * **Dit is de enige plek in de app die `/api/ai` aanroept** (DR-16). Geen scherm,
 * geen andere service.
 *
 * De keten is met opzet in **twee** functies geknipt en niet in één. §12.1 zet het
 * controlescherm tussen het samenstellen en het versturen; die naad moet dus
 * bestaan, ook nu D06 er nog niet is. `bereidVoor` levert precies wat dat scherm
 * toont, `verstuur` doet wat de gebruiker daarna bevestigt. Eén functie die alles
 * doet, zou het controlescherm onmogelijk maken zonder verbouwing (B-11, INV-43).
 *
 * **De pseudoniemkaart blijft in het geheugen** (T-23). Hij zit in het object dat
 * tussen de twee stappen doorgegeven wordt en gaat nergens de opslag in.
 */

import { ongeldig, type AppError, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { AiOutcome, AiTask, PseudonymMap, Student } from "@/domain/types";
import {
  bevatBeeldgegeven,
  type AiProviderId,
  type AiRequest,
  type Opdracht,
  type Voorbeeld,
} from "@/domain/schemas/aiRequest";
import { gate, pseudonymise, restore } from "@/services/privacy/PrivacyService";

import type { Clock, StorageService } from "../storage/StorageService";
import type { Taakbepaling, PromptService } from "./PromptService";

/**
 * Het enige eindpunt dat deze service aanroept (DR-16).
 *
 * Hij staat als benoemde constante en niet los in de aanroep, zodat er precies één
 * plek in de broncode is waar deze tekenreeks voorkomt. De bouwstraat bewaakt de
 * rest: het blok `eduflow/dr-16-api` in `eslint.config.mjs` verbiedt dit letterlijk
 * overal behalve in `services/ai/`, `services/mail/` en de routes zelf.
 */
const AI_EINDPUNT = "/api/ai";

/** §12.11: eenmaal opnieuw, na twee seconden, stil. Nooit vaker. */
const NIEUWE_POGING_NA_MS = 2_000;
/** §12.11: afbreken na dertig seconden. */
const TIJDSLIMIET_MS = 30_000;

/**
 * De langst denkbare code, om een brok veilig af te knippen (§12.10).
 *
 * `[LEERLING-AMBIGU-999]` is twintig tekens; vierentwintig geeft lucht zonder dat
 * er merkbaar getreuzeld wordt met tonen.
 */
const MAX_CODELENGTE = 24;

export interface AIDeps {
  storage: StorageService;
  prompts: PromptService;
  clock: Clock;
  fetch: typeof globalThis.fetch;
  /** De providerkeuze uit `localStorage` (§8.2.2). */
  provider: AiProviderId;
}

export interface AIInvoer {
  task: AiTask;
  /** De tekst van de gebruiker, **met** namen. Het afschermen gebeurt hier. */
  tekst: string;
  leerlingen: readonly Student[];
  /** De leerlingen die aan deze documentatie hangen (§12.5 stap 7). */
  gekoppeld?: readonly Uuid[];
  /** Het tijdstip van de eenmalige bevestiging bij een lege lijst (T-08), of null. */
  legeLijstBevestigdOp?: string | null;
  schrijfstijl?: string;
  voorbeelden?: readonly Voorbeeld[];
  context?: string;
  documentationId?: Uuid | null;
}

/**
 * Wat het controlescherm toont en wat `verstuur` nodig heeft.
 *
 * De kaart staat erin en gaat nergens anders heen (T-23).
 */
export interface Voorbereiding {
  opdracht: Opdracht;
  taak: Taakbepaling;
  kaart: PseudonymMap;
  /** Hoeveel gegevens zijn afgeschermd — het getal rechtsboven in §12.14. */
  afgeschermd: number;
  /** Wat het scherm erbij moet melden (§12.5 stap 7, B-76). */
  meldingen: string[];
  documentationId: Uuid | null;
}

/** Welk model het werd. De server weet het; de app krijgt het in een kop terug. */
interface Gebruiktmodel {
  model: string;
  region: string;
}

/**
 * Wat het logboek noteert als de aanroep nooit een antwoord opleverde.
 *
 * `zAiInteraction` eist een niet-lege `model` en `region`, en een mislukte aanroep
 * moet juist wél vastgelegd worden: §12.11 verbiedt stil falen.
 */
const GEBRUIKT_MODEL_ONBEKEND: Gebruiktmodel = { model: "onbekend", region: "onbekend" };

const GEEN_ANTWOORD: AppError = {
  code: "AI_UNREACHABLE",
  message:
    "De AI is niet bereikbaar. Je tekst staat nog gewoon in het scherm. Probeer het zo opnieuw.",
  recoverable: true,
  action: { label: "Opnieuw", kind: "retry" },
};

/**
 * Vertaalt een stroom terug, brok voor brok (§12.10).
 *
 * Een brok kan een code doorsnijden: `[LEERL` in de ene en `ING-3]` in de volgende.
 * Daarom houdt deze functie alles vanaf het laatste onafgesloten haakje vast tot
 * het af is. Blijft dat haakje te lang open staan, dan was het geen code maar een
 * gewone blokhaak, en gaat hij alsnog naar buiten.
 */
export function maakBrokvertaler(kaart: PseudonymMap) {
  let wacht = "";

  return {
    brok(tekst: string): string {
      wacht += tekst;

      const open = wacht.lastIndexOf("[");
      const knip =
        open !== -1 && !wacht.slice(open).includes("]") && wacht.length - open <= MAX_CODELENGTE
          ? open
          : wacht.length;

      const vrij = wacht.slice(0, knip);
      wacht = wacht.slice(knip);
      return restore(vrij, kaart);
    },
    rest(): string {
      const laatste = restore(wacht, kaart);
      wacht = "";
      return laatste;
    },
  };
}

/** Of het antwoord van de provider een nieuwe poging verdient (§12.11). */
function magOpnieuw(status: number | null): boolean {
  return status === null || status >= 500 || status === 429;
}

export function createAIService(deps: AIDeps) {
  /**
   * Poort, afscherming en opdracht — alles vóór het controlescherm (§12.1).
   *
   * Hier staat DR-31 in code: er is geen pad van `bereidVoor` naar `verstuur` dat
   * `pseudonymise` overslaat, want `verstuur` heeft de kaart nodig die alleen deze
   * functie oplevert.
   */
  async function bereidVoor(invoer: AIInvoer): Promise<Result<Voorbereiding>> {
    const poort = gate(invoer.leerlingen, invoer.legeLijstBevestigdOp ?? null);
    if (!poort.ok) return poort;

    const afgeschermd = pseudonymise(invoer.tekst, {
      leerlingen: invoer.leerlingen,
      gekoppeld: invoer.gekoppeld,
    });

    const opdracht = deps.prompts.build({
      task: invoer.task,
      tekst: afgeschermd.tekst,
      schrijfstijl: invoer.schrijfstijl,
      voorbeelden: invoer.voorbeelden,
      context: invoer.context,
    });
    if (!opdracht.ok) return opdracht;

    // De derde plek waar §12.13 wordt afgedwongen: vlak vóór het versturen. De
    // andere twee zijn het opdrachttype zelf en de route.
    if (bevatBeeldgegeven(opdracht.value.opdracht)) {
      return ongeldig(
        "Er zit een afbeelding in deze tekst. Foto's gaan nooit naar de AI. Haal hem eruit en probeer het opnieuw.",
      );
    }

    return {
      ok: true,
      value: {
        opdracht: opdracht.value.opdracht,
        taak: opdracht.value.taak,
        kaart: afgeschermd.kaart,
        afgeschermd: afgeschermd.kaart.size,
        meldingen: afgeschermd.meldingen,
        documentationId: invoer.documentationId ?? null,
      },
    };
  }

  /** Eén poging naar de route, met tijdslimiet (§12.11). */
  async function poging(verzoek: AiRequest): Promise<Response> {
    const afbreker = new AbortController();
    const wekker = setTimeout(() => afbreker.abort(), TIJDSLIMIET_MS);

    try {
      return await deps.fetch(
        AI_EINDPUNT,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(verzoek),
          signal: afbreker.signal,
        },
      );
    } finally {
      clearTimeout(wekker);
    }
  }

  /**
   * Verstuurt en levert de tekst terug, al vertaald (§12.1, §12.10).
   *
   * Eén nieuwe poging en niet meer: twee stille pogingen maken een trage aanroep
   * drie keer zo traag en verdubbelen de kosten zonder dat de gebruiker weet
   * waarom (§12.11, §3.7).
   */
  async function verstuur(
    voorbereiding: Voorbereiding,
  ): Promise<Result<AsyncGenerator<string, void>>> {
    const verzoek: AiRequest = {
      task: voorbereiding.taak.id,
      level: voorbereiding.taak.level,
      provider: deps.provider,
      opdracht: voorbereiding.opdracht,
    };

    const begonnen = deps.clock.now().getTime();
    let antwoord: Response | null = null;
    let status: number | null = null;

    for (const beurt of [0, 1]) {
      if (beurt === 1) await new Promise((klaar) => setTimeout(klaar, NIEUWE_POGING_NA_MS));

      try {
        const dit = await poging(verzoek);
        if (dit.ok) {
          antwoord = dit;
          break;
        }
        status = dit.status;
      } catch {
        status = null;
      }

      if (!magOpnieuw(status)) break;
    }

    if (!antwoord?.body) {
      await leg(voorbereiding, begonnen, 0, "failed", GEBRUIKT_MODEL_ONBEKEND);
      return { ok: false, error: GEEN_ANTWOORD };
    }

    // Welk model het werd, weet alleen de server: §12.7 legt die keuze bij de
    // adapter. De route zet hem in een kop zodat het logboek hem kan noemen.
    const gebruikt = {
      model: antwoord.headers.get("x-eduflow-model") ?? GEBRUIKT_MODEL_ONBEKEND.model,
      region: antwoord.headers.get("x-eduflow-region") ?? GEBRUIKT_MODEL_ONBEKEND.region,
    };

    return { ok: true, value: lees(antwoord.body, voorbereiding, begonnen, gebruikt) };
  }

  /** Leest de stroom, vertaalt hem terug en legt de aanroep vast als hij klaar is. */
  async function* lees(
    body: ReadableStream<Uint8Array>,
    voorbereiding: Voorbereiding,
    begonnen: number,
    gebruikt: Gebruiktmodel,
  ): AsyncGenerator<string, void> {
    const vertaler = maakBrokvertaler(voorbereiding.kaart);
    const lezer = body.getReader();
    const decoder = new TextDecoder();
    let tekens = 0;

    try {
      for (;;) {
        const { done, value } = await lezer.read();
        if (done) break;

        const stuk = vertaler.brok(decoder.decode(value, { stream: true }));
        tekens += stuk.length;
        if (stuk) yield stuk;
      }

      const slot = vertaler.rest();
      tekens += slot.length;
      if (slot) yield slot;

      await leg(voorbereiding, begonnen, tekens, "accepted", gebruikt);
    } catch {
      await leg(voorbereiding, begonnen, tekens, "failed", gebruikt);
      throw new Error("De stroom van de AI brak af.");
    } finally {
      lezer.releaseLock();
    }
  }

  /**
   * Legt de aanroep vast: **tellingen, geen inhoud** (§12.1, DR-44, §16.4).
   *
   * Geen opdracht, geen antwoord, geen zin uit een documentatie. Dit is het
   * logboek dat bij een privacygesprek op tafel komt (FR-PRV-08).
   */
  async function leg(
    voorbereiding: Voorbereiding,
    begonnen: number,
    charsOut: number,
    outcome: AiOutcome,
    gebruikt: Gebruiktmodel,
  ): Promise<void> {
    const opdracht = voorbereiding.opdracht;
    const charsIn =
      opdracht.systeeminstructie.length +
      opdracht.schrijfstijl.length +
      opdracht.context.length +
      opdracht.invoer.length;

    await deps.storage.create("aiInteractions", {
      task: voorbereiding.taak.id,
      provider: deps.provider,
      model: gebruikt.model,
      region: gebruikt.region,
      charsIn,
      charsOut,
      pseudonymCount: voorbereiding.afgeschermd,
      durationMs: Math.max(0, deps.clock.now().getTime() - begonnen),
      outcome,
      rejectReason: null,
      similarity: 0,
      documentationId: voorbereiding.documentationId,
    });
  }

  return { bereidVoor, verstuur };
}

export type AIService = ReturnType<typeof createAIService>;
