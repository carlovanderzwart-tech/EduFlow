/**
 * De zeven sleutels in `localStorage` (§8.2.2).
 *
 * `localStorage` is synchroon en leesbaar vóórdat IndexedDB open is. Dat is zijn
 * enige nut en meteen zijn enige toegestane gebruik: waarden die het eerste scherm
 * nodig heeft om zonder flikkering te tekenen, en die **geen persoonsgegeven** zijn
 * (DR-33).
 *
 * De tabel hieronder is de tabel uit §8.2.2, en dat is de handhaving: er komt geen
 * achtste sleutel bij zonder dat dat hoofdstuk wijzigt, want er is geen naam om
 * hem mee aan te duiden. De zevende — `lastIcsExportAt` — is er via B-124 bij
 * gekomen, en §8.2.2 is daarvoor gewijzigd in plaats van omzeild.
 *
 * Deze zeven staan **alleen** hier. Ze staan niet ook in `settings` (U-02). Ze gaan
 * niet mee in de back-up en niet mee in de synchronisatie: het zijn
 * apparaatvoorkeuren.
 *
 * Ze staan in `services/settings/` en niet in `domain/`, omdat ze geen records
 * zijn. `domain/` beschrijft het datamodel; dit zijn voorkeuren van dit ene
 * apparaat, en §8.2.2 wijst het beheer ervan uitdrukkelijk aan `SettingsService`
 * toe.
 */

import { z } from "zod";

import { zIsoDateTime, zRegion } from "@/domain/schemas";

/**
 * De sleutel-waardeopslag waar de voorkeuren in staan.
 *
 * Geïnjecteerd en niet rechtstreeks `window.localStorage`, omdat DR-12 eist dat
 * elke service te toetsen is zonder browser. Een `Map` volstaat in een toets.
 */
export interface Voorkeurenopslag {
  getItem(sleutel: string): string | null;
  setItem(sleutel: string, waarde: string): void;
  removeItem(sleutel: string): void;
}

/** Drie tonen, niet de vier van een mailconcept (§8.2.2 tegenover §8.3.11). */
const zStandaardtoon = z.enum(["warm", "zakelijk", "kort"]);

const zProviderkeuze = z.enum(["openai-eu", "vertex-eu", "bedrock-eu"]);

/** De laatst gekozen weergave per module, inclusief de jaar-of-weekkeuze uit B-31. */
const zLaatsteWeergave = z.strictObject({ module: z.string(), view: z.string() });

/** Elke vlag is een tijdstip en geen ja/nee, zodat je weet wanneer iets bevestigd is. */
const zBevestigingen = z.record(z.string(), zIsoDateTime);

/**
 * Eén regel per sleutel: de naam in `localStorage`, het schema en de standaard.
 *
 * `json` staat aan bij de twee samengestelde waarden. De vier andere staan als
 * platte tekenreeks in de opslag, precies zoals de typekolom van §8.2.2 ze noemt.
 */
export const VOORKEUREN = {
  region: { sleutel: "eduflow.region", schema: zRegion, standaard: "midden", json: false },
  defaultTone: {
    sleutel: "eduflow.defaultTone",
    schema: zStandaardtoon,
    standaard: "warm",
    json: false,
  },
  aiProvider: {
    sleutel: "eduflow.aiProvider",
    schema: zProviderkeuze,
    standaard: "openai-eu",
    json: false,
  },
  lastView: {
    sleutel: "eduflow.lastView",
    schema: zLaatsteWeergave,
    standaard: { module: "dashboard", view: "vandaag" },
    json: true,
  },
  lastBackupAt: {
    sleutel: "eduflow.lastBackupAt",
    schema: zIsoDateTime.nullable(),
    standaard: null,
    json: false,
  },
  /**
   * Het moment van de laatste ICS-export (B-124, `FR-AGE-27`).
   *
   * Een apparaatvoorkeur, net als `lastBackupAt`: exporteer je op je laptop, dan
   * hoort je telefoon niet te denken dat híj geëxporteerd heeft.
   */
  lastIcsExportAt: {
    sleutel: "eduflow.lastIcsExportAt",
    schema: zIsoDateTime.nullable(),
    standaard: null,
    json: false,
  },
  onboardingFlags: {
    sleutel: "eduflow.onboardingFlags",
    schema: zBevestigingen,
    standaard: {},
    json: true,
  },
} as const;

export type VoorkeurNaam = keyof typeof VOORKEUREN;

export type Voorkeur<Naam extends VoorkeurNaam> = z.infer<(typeof VOORKEUREN)[Naam]["schema"]>;

/**
 * Leest en schrijft de zes, met typen en standaardwaarden erin afgedwongen.
 *
 * Staat er onzin — een oude waarde, een handmatige wijziging, een halve JSON —
 * dan valt de sleutel terug op de standaardwaarde en verdwijnt de onzin bij de
 * eerstvolgende schrijfactie (§8.2.2). Nooit een fout aan de gebruiker: een
 * weergavevoorkeur die niet klopt, is geen probleem waar hij iets mee kan.
 */
export function maakVoorkeuren(opslag: Voorkeurenopslag) {
  function lees<Naam extends VoorkeurNaam>(naam: Naam): Voorkeur<Naam> {
    const regel = VOORKEUREN[naam];
    const standaard = regel.standaard as Voorkeur<Naam>;

    const ruw = opslag.getItem(regel.sleutel);
    if (ruw === null) return standaard;

    let waarde: unknown = ruw;
    if (regel.json) {
      try {
        waarde = JSON.parse(ruw);
      } catch {
        return standaard;
      }
    }

    const uitkomst = regel.schema.safeParse(waarde);
    return uitkomst.success ? (uitkomst.data as Voorkeur<Naam>) : standaard;
  }

  function schrijf<Naam extends VoorkeurNaam>(naam: Naam, waarde: Voorkeur<Naam>): void {
    const regel = VOORKEUREN[naam];
    // Een waarde die niet door zijn schema komt is een fout in de code erboven,
    // net als bij een record (DR-23).
    const gecontroleerd = regel.schema.parse(waarde);

    // Afwezig ís de leegte: `lastBackupAt` heeft `null` als standaard, en een
    // tekenreeks "null" in de opslag zou daar een tweede vorm van maken.
    if (gecontroleerd === null) {
      opslag.removeItem(regel.sleutel);
      return;
    }

    opslag.setItem(
      regel.sleutel,
      regel.json ? JSON.stringify(gecontroleerd) : String(gecontroleerd),
    );
  }

  return { lees, schrijf };
}

export type Voorkeuren = ReturnType<typeof maakVoorkeuren>;
