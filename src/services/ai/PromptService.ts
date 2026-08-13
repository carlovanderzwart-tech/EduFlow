/**
 * Waar de opdracht ontstaat (§12.2, §12.3, INV-43).
 *
 * **Eén plek, en met opzet maar één.** INV-43 zegt: wat het controlescherm toont
 * is exact wat er verstuurd wordt. Dat is alleen waar te maken als er één object
 * bestaat dat allebei voedt. Stelde de route de opdracht half samen, dan toont D06
 * iets anders dan wat er de deur uit gaat — op precies de plek waar Karin gaat
 * kijken (fout 2 uit §20.6).
 *
 * De vijf blokken staan in de vaste volgorde van §12.3 en worden hier niet
 * samengevoegd tot één tekenreeks. Het platslaan gebeurt pas in de adapter, want
 * hoe een aanbieder een systeeminstructie van een gebruikersbericht scheidt, is
 * zijn zaak en niet die van de opdracht.
 *
 * **Er is geen beeldveld en dat is de handhaving** (INV-39, DR-32). Het opdrachttype
 * kent er geen; een foto is hier niet uit te drukken, ook niet per ongeluk.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { AiTask } from "@/domain/types";
import type { AiLevel, Opdracht, Voorbeeld } from "@/domain/schemas/aiRequest";

/**
 * Wat een taak vastlegt (§12.2).
 *
 * `goldenCases` uit §12.2 staat er niet bij: de gouden gevallen zelf ontbreken nog
 * (O-01) en een leeg veld dat niemand vult is een belofte die niemand nakomt.
 * Hij komt erbij zodra de voorbeelden er zijn.
 */
export interface Taakbepaling {
  id: AiTask;
  level: AiLevel;
  systeeminstructie: string;
  temperature: number;
  maxOutputTokens: number;
  /** Hoeveel stijlvoorbeelden er meegaan (§12.4). */
  exampleCount: number;
  includeStyleProfile: boolean;
  includeSeriesContext: boolean;
  maxInputChars: number;
  /** FR-MAI-12: bij `mail.*` altijd, bij `doc.*` standaard aan. */
  reviewRequired: "always" | "default-on" | "never";
}

/**
 * De systeeminstructie voor `doc.write`, letterlijk zoals §12.3 hem geeft.
 *
 * Woordelijk overgenomen en niet geparafraseerd. Twee regels verdienen een
 * aantekening omdat ze er niet toevallig staan: de regel over de codes tussen
 * blokhaken, want een model dat `[LEERLING-1]` netjes vervangt door "de leerling"
 * maakt het terugvertalen onmogelijk; en de regel over oordelen, die B-25 naar de
 * opdracht zelf vertaalt.
 */
const DOC_WRITE = `Je bent een schrijfhulp voor een leerkracht in het Nederlandse funderend onderwijs.
Je maakt van losse observaties één lopende tekst voor pedagogische documentatie
die naar ouders gaat.

Wat je doet:
- Je gebruikt uitsluitend wat er in de invoer staat.
- Je maakt van losse zinnen lopende zinnen en zet ze in een logische volgorde.
- Je corrigeert spelling en interpunctie.
- Je behoudt citaten woordelijk, inclusief kindertaal en grammaticafouten.

Wat je niet doet:
- Je voegt geen gebeurtenissen, personen, plaatsen, tijden of gevoelens toe die er niet staan.
- Je schrijft niet wat een kind kan, is, of leert. Je schrijft wat er gebeurde en wat er gezegd is.
- Je gebruikt geen oordelen: niet knap, niet goed, niet trots, niet prachtig.
- Je verandert de codes tussen blokhaken niet. [LEERLING-1] blijft [LEERLING-1].
- Je schrijft geen inleiding, geen titel, geen afsluiting en geen opmerking over jezelf.

Vorm:
- Nederlands.
- Volg de schrijfstijl hieronder. Wijkt die af van wat je zelf zou kiezen, dan volg je de stijl.
- Geef alleen de tekst terug, zonder aanhalingstekens eromheen en zonder toelichting.`;

/**
 * De taken die een opdracht kunnen opleveren.
 *
 * Alleen `doc.write`. §12.2 noemt er tien, maar §12.3 geeft er één letterlijk uit,
 * en een systeeminstructie verzinnen voor de andere negen is precies wat DR-01
 * verbiedt: dat is de tekst die bepaalt hoe de app over kinderen schrijft. De
 * vorm van deze tabel is wél die van §12.2, zodat een taak erbij komt zonder dat
 * de architectuur verandert.
 */
export const TAKEN: Partial<Record<AiTask, Taakbepaling>> = {
  "doc.write": {
    id: "doc.write",
    // §12.7: dit is waar het product op beoordeeld wordt.
    level: "zorgvuldig",
    systeeminstructie: DOC_WRITE,
    temperature: 0.4,
    maxOutputTokens: 1_200,
    exampleCount: 2,
    includeStyleProfile: true,
    includeSeriesContext: false,
    maxInputChars: 8_000,
    reviewRequired: "default-on",
  },
};

export interface Opdrachtinvoer {
  task: AiTask;
  /** De **gepseudonimiseerde** tekst. Wie hier een naam in stopt, omzeilt DR-31. */
  tekst: string;
  /** Het stijlprofiel in leesbare regels (§12.3 blok 2). Leeg mag. */
  schrijfstijl?: string;
  voorbeelden?: readonly Voorbeeld[];
  /** Reeksdelen, sjabloon, toon — afhankelijk van de taak (§12.3 blok 4). */
  context?: string;
}

export function createPromptService() {
  /**
   * Stelt de opdracht samen (§12.3).
   *
   * Geeft een `Result` en geen uitzondering: een tekst die te lang is, is iets waar
   * de gebruiker iets mee kan (§10.3, §4.7).
   */
  function build(invoer: Opdrachtinvoer): Result<{ opdracht: Opdracht; taak: Taakbepaling }> {
    const taak = TAKEN[invoer.task];
    if (!taak) {
      return ongeldig(
        "Deze AI-taak bestaat nog niet in deze versie. Kies een andere of wacht op een volgende versie.",
      );
    }

    const tekst = invoer.tekst.trim();
    if (!tekst) {
      return ongeldig("Er is nog geen tekst om mee te werken. Typ eerst iets.");
    }
    if (tekst.length > taak.maxInputChars) {
      return ongeldig(
        `Deze tekst is te lang voor één keer. Hij telt ${tekst.length} tekens en er passen er ${taak.maxInputChars}. Splits hem in twee delen.`,
      );
    }

    const opdracht: Opdracht = {
      systeeminstructie: taak.systeeminstructie,
      schrijfstijl: taak.includeStyleProfile ? (invoer.schrijfstijl ?? "") : "",
      // Meer voorbeelden meesturen dan de taak toestaat maakt de opdracht duurder
      // zonder hem beter te maken (§12.4).
      voorbeelden: (invoer.voorbeelden ?? []).slice(0, taak.exampleCount),
      context: taak.includeSeriesContext ? (invoer.context ?? "") : "",
      invoer: tekst,
    };

    return { ok: true, value: { opdracht, taak } };
  }

  return { build };
}

export type PromptService = ReturnType<typeof createPromptService>;
