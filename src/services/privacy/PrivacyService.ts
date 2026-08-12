/**
 * De afscherming (§12.5, §12.13, T-04, T-08, DR-31).
 *
 * Dit is de belangrijkste service van het product. Fout 1 uit §20.6 is een
 * AI-aanroep die hier niet doorheen gaat: de tekst is dan weg en komt niet terug.
 *
 * Hij is een **zuivere functie over tekst**. Geen netwerk, geen opslag, geen
 * React, geen klok (§12.5, DR-12). Wat hij nodig heeft — de leerlingenlijst, de
 * extra termen, wie er aan de documentatie hangt, en of de lege lijst ooit is
 * bevestigd — krijgt hij mee. Daardoor is elk van de vijftien gevallen uit
 * `PRIVACY_GEVALLEN` te toetsen zonder iets op te starten.
 *
 * **De rondgang is de belangrijkste eigenschap**: `restore(pseudonymise(t)) === t`
 * voor elke tekst uit de toetsset (§12.5, hier `INV-30` genoemd zoals werkopdracht
 * D03 en §12.5 hem noemen; in §9.5.4 draagt dat nummer een agendaregel).
 *
 * **Zoeken doet hij op de gevouwen vorm, vervangen op de oorspronkelijke.** Dat
 * is §12.5 stap 6 en het is de reden dat hij `foldDiacriticsPerChar` gebruikt en
 * niet `foldDiacritics`: alleen bij gelijke lengte blijven de posities in beide
 * vormen dezelfde, en alleen dan kan de vervanging op de oorspronkelijke spelling
 * plaatsvinden.
 */

import { type AppError, type Result } from "@/lib/result";
import { foldDiacriticsPerChar } from "@/lib/text";
import type { Uuid } from "@/lib/uuid";
import type { PrivacyTerm, PseudonymEntry, PseudonymMap, Student } from "@/domain/types";

/**
 * De Nederlandse achtervoegsels uit §12.5 stap 5.
 *
 * De volgorde is niet alfabetisch maar van lang naar kort, want een alternatie
 * kiest het eerste dat past: stond `je` vóór `tje`, dan zou "Kjeldtje" als
 * "Kjeldt" + "je" worden gelezen.
 */
const ACHTERVOEGSELS = ["tje", "pje", "'s", "je", "ke", "s"] as const;

/** Precies het patroon uit §12.5 stap 3. Een streepje telt niet als woordteken. */
const GRENS_VOOR = "(?<![\\p{L}\\p{N}])";
const GRENS_NA = "(?![\\p{L}\\p{N}])";

/** Wat `restore()` in een antwoord herkent. `LEERLING-AMBIGU` staat vooraan (§12.5 stap 7). */
const CODEPATROON = /\[(?:LEERLING-AMBIGU|LEERLING|TERM)-\d+\]/gu;

export interface Afschermlijst {
  /** De kern van de afscherming (FR-INS-18). */
  leerlingen: readonly Student[];
  /** Wat de lijst niet dekt: achternamen, collega's, de school (FR-INS-19). */
  termen?: readonly PrivacyTerm[];
  /** De leerlingen die aan deze documentatie hangen (§12.5 stap 7, B-76). */
  gekoppeld?: readonly Uuid[];
}

export interface Pseudonimisering {
  tekst: string;
  kaart: PseudonymMap;
  /**
   * Wat het controlescherm erbij moet zeggen (§12.5 stap 7, B-76).
   *
   * Staat in de uitkomst en niet in een logregel, omdat de gebruiker dit moet
   * zien vóór de aanroep vertrekt: raden welk kind bedoeld is, is erger dan het
   * niet weten.
   */
  meldingen: string[];
}

/** Eén term om op te zoeken, met de code die ervoor in de plaats komt. */
interface Zoekterm {
  /** Gevouwen en in kleine letters: waarop gezocht wordt (§12.5 stap 6). */
  zoek: string;
  code: string;
  kind: PseudonymEntry["kind"];
}

function ontsnap(waarde: string): string {
  return waarde.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** Het patroon van §12.5 stap 3 plus de verbuigingen van stap 5. */
function patroonVoor(zoek: string): RegExp {
  return new RegExp(
    `${GRENS_VOOR}${ontsnap(zoek)}(?:${ACHTERVOEGSELS.join("|")})?${GRENS_NA}`,
    "giu",
  );
}

/** De vorm waarop twee namen hetzelfde zijn: gevouwen en klein (§12.5 stap 6). */
function sleutel(waarde: string): string {
  return foldDiacriticsPerChar(waarde).toLowerCase();
}

/**
 * Zet de termen klaar, langste eerst (§12.5 stappen 1, 2 en 7).
 *
 * Langste eerst is geen optimalisatie maar een eis: zonder die volgorde wordt
 * "Jan-Peter" gevonden als "Jan" en blijft "-Peter" staan. Om dezelfde reden
 * staat de weergavenaam "Noa B." als eigen term náást de voornaam "Noa" — anders
 * levert "Noa B. en Noa V." twee keer dezelfde code op met de beginletter er nog
 * los achter.
 */
function bouwTermen(lijst: Afschermlijst): { termen: Zoekterm[]; meldingen: string[] } {
  const meldingen: string[] = [];
  const termen: Zoekterm[] = [];

  for (const leerling of lijst.leerlingen) {
    if (!leerling.lastNameInitial) continue;
    const volledig = `${leerling.firstName} ${leerling.lastNameInitial}`;
    termen.push({ zoek: sleutel(volledig), code: leerlingcode(leerling), kind: "leerling" });
  }

  termen.push(...voornamen(lijst, meldingen));
  termen.push(...extraTermen(lijst.termen ?? []));

  // Stap 2. Bij gelijke lengte de alfabetische volgorde, zodat twee aanroepen op
  // dezelfde lijst dezelfde uitkomst geven (INV-41).
  termen.sort((a, b) => b.zoek.length - a.zoek.length || a.zoek.localeCompare(b.zoek));
  return { termen, meldingen };
}

function leerlingcode(leerling: Student): string {
  return `[LEERLING-${leerling.pseudonymSeed}]`;
}

/**
 * De voornamen, met de dubbelzinnigheid van §12.5 stap 7 al opgelost.
 *
 * Eén voornaam, twee kinderen: dan bepaalt de koppeling aan de documentatie welke
 * bedoeld is. Is dat er niet één, dan krijgt het voorkomen `[LEERLING-AMBIGU-n]`
 * en zegt het controlescherm waarom (B-76). Raden is hier erger dan niet weten.
 */
function voornamen(lijst: Afschermlijst, meldingen: string[]): Zoekterm[] {
  const gekoppeld = new Set(lijst.gekoppeld ?? []);
  const perNaam = new Map<string, Student[]>();

  for (const leerling of lijst.leerlingen) {
    const naam = sleutel(leerling.firstName);
    perNaam.set(naam, [...(perNaam.get(naam) ?? []), leerling]);
  }

  let ambigu = 0;
  return [...perNaam].map(([zoek, kandidaten]) => {
    if (kandidaten.length === 1) {
      return { zoek, code: leerlingcode(kandidaten[0]!), kind: "leerling" as const };
    }

    const aangewezen = kandidaten.filter((leerling) => gekoppeld.has(leerling.id));
    if (aangewezen.length === 1) {
      return { zoek, code: leerlingcode(aangewezen[0]!), kind: "leerling" as const };
    }

    ambigu += 1;
    meldingen.push(
      `Er staan ${kandidaten.length} kinderen met de naam ${kandidaten[0]!.firstName} in deze documentatie. De app kan niet zien welke bedoeld is.`,
    );
    return { zoek, code: `[LEERLING-AMBIGU-${ambigu}]`, kind: "ambigu" as const };
  });
}

/**
 * De eigen woordenlijst (FR-INS-19).
 *
 * Eén codesoort voor alle vijf de soorten, en dat is wat FR-INS-19 vraagt: "op
 * dezelfde manier vervangen als leerlingnamen, met een eigen codesoort". §9.2
 * kent fijnere codes — `[COLLEGA-1]`, `[SCHOOL]`, `[OUDER-1]` — maar die horen
 * bij de detectoren voor mail, en die staan in sprint 5 (FR-MAI-24).
 *
 * Het nummer volgt de alfabetische volgorde van de termen en niet hun
 * invoervolgorde, zodat twee aanroepen op dezelfde lijst dezelfde codes geven
 * (INV-41).
 */
function extraTermen(termen: readonly PrivacyTerm[]): Zoekterm[] {
  return [...termen]
    .filter((term) => term.enabled)
    .sort((a, b) => a.termLower.localeCompare(b.termLower))
    .map((term, plaats) => ({
      zoek: sleutel(term.term),
      code: `[TERM-${plaats + 1}]`,
      kind: "term" as const,
    }));
}

interface Vervanging {
  start: number;
  /** Exclusief, en zonder het achtervoegsel: "Kjelds" wordt `[LEERLING-11]s`. */
  eind: number;
  code: string;
  kind: PseudonymEntry["kind"];
}

/** Zoekt alle voorkomens, langste term eerst, zonder elkaar te overlappen. */
function zoekVervangingen(gevouwen: string, termen: readonly Zoekterm[]): Vervanging[] {
  const gevonden: Vervanging[] = [];

  for (const term of termen) {
    const patroon = patroonVoor(term.zoek);
    let treffer: RegExpExecArray | null;

    while ((treffer = patroon.exec(gevouwen)) !== null) {
      const start = treffer.index;
      const eind = start + term.zoek.length;
      // Een kortere term binnen een al gevonden langere overslaan: dat is stap 2
      // in de praktijk. "Noa" binnen "Noa B." hoort niet nog eens vervangen.
      const botst = gevonden.some((eerder) => start < eerder.eind && eerder.start < eind);
      if (!botst) gevonden.push({ start, eind, code: term.code, kind: term.kind });
    }
  }

  return gevonden.sort((a, b) => a.start - b.start);
}

/**
 * Vervangt namen door codes (§12.5 stappen 1 tot en met 7).
 *
 * De tekst wordt eerst naar NFC genormaliseerd, zodat "Hanaë" één teken is en het
 * vouwen van stap 6 hem vindt. Voor tekst die al in NFC staat — wat elke browser
 * en elk toetsenbord oplevert — verandert dat niets, en de rondgang blijft exact.
 */
export function pseudonymise(tekst: string, lijst: Afschermlijst): Pseudonimisering {
  const origineel = tekst.normalize("NFC");
  const { termen, meldingen } = bouwTermen(lijst);
  const vervangingen = zoekVervangingen(foldDiacriticsPerChar(origineel), termen);

  const kaart = new Map<string, PseudonymEntry>();
  for (const vervanging of vervangingen) {
    const ingang = kaart.get(vervanging.code) ?? { kind: vervanging.kind, forms: [] };
    ingang.forms.push(origineel.slice(vervanging.start, vervanging.eind));
    kaart.set(vervanging.code, ingang);
  }

  // Van achter naar voren, anders verschuiven de posities die nog moeten komen.
  let uit = origineel;
  for (const vervanging of [...vervangingen].reverse()) {
    uit = uit.slice(0, vervanging.start) + vervanging.code + uit.slice(vervanging.eind);
  }

  // Alleen melden over namen die er ook echt in stonden: een tweede Noa in de
  // lijst is geen mededeling waard zolang er geen Noa in de tekst staat.
  const gebruikt = new Set(vervangingen.map((vervanging) => vervanging.code));
  const zichtbaar = meldingen.filter((_, plaats) => gebruikt.has(`[LEERLING-AMBIGU-${plaats + 1}]`));

  return { tekst: uit, kaart, meldingen: zichtbaar };
}

/**
 * Zet de codes terug (§12.5 stap 8).
 *
 * Werkt uitsluitend op de codes en nooit op de namen. Daardoor blijft het correct
 * ook als het model de zin heeft omgezet: `[LEERLING-3]` is te vinden waar hij ook
 * staat, een naam die het model verplaatst heeft niet.
 *
 * Een code die niet in de kaart staat blijft staan. Dat is met opzet: hij is dan
 * verzonnen door het model, en dat hoort zichtbaar te zijn (INV-40).
 */
export function restore(tekst: string, kaart: PseudonymMap): string {
  const teller = new Map<string, number>();

  return tekst.replace(CODEPATROON, (code) => {
    const ingang = kaart.get(code);
    if (!ingang) return code;

    const plaats = teller.get(code) ?? 0;
    teller.set(code, plaats + 1);
    return ingang.forms[plaats] ?? ingang.forms[0] ?? code;
  });
}

/**
 * De poort vóór elke AI-aanroep (T-08, FR-INS-20, DR-31).
 *
 * Zonder leerlingen doet de afscherming niets, en dat is precies het scenario
 * waar dit product tegen beschermt. De poort blokkeert dan zichtbaar in plaats
 * van stilzwijgend door te laten.
 *
 * De bevestiging komt als waarde binnen en wordt hier niet gelezen: §8.2.2 legt
 * hem in `eduflow.onboardingFlags`, en een service die `localStorage` aanraakt is
 * niet te toetsen zonder browser (DR-12). Zij vervalt zodra er wél leerlingen
 * zijn — dat volgt uit de eerste regel hieronder en niet uit een opruimactie.
 */
export function gate(
  leerlingen: readonly Student[],
  bevestigdOp: string | null = null,
): Result<void> {
  if (leerlingen.length > 0) return { ok: true, value: undefined };
  if (bevestigdOp) return { ok: true, value: undefined };

  return { ok: false, error: POORT };
}

const POORT: AppError = {
  code: "PRIVACY_GATE",
  message:
    "Je leerlingenlijst is leeg. De afscherming doet dan niets. Voeg leerlingen toe, of bevestig één keer dat je zonder wilt doorgaan.",
  recoverable: true,
  action: { label: "Leerlingen toevoegen", kind: "navigate", target: "/settings/students" },
};

/** De sleutel van de eenmalige bevestiging in `eduflow.onboardingFlags` (§8.2.2, T-08). */
export const POORT_BEVESTIGING = "legeLeerlingenlijst";
