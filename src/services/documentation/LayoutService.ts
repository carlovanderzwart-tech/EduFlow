/**
 * De layouts van de gedrukte pagina (§5.10, §10.4).
 *
 * Deze service kent één ding: waar op een A4 iets terechtkomt. Hij tekent niets en
 * hij weet niet of hij voor het scherm of voor een bestand werkt. Wat hij oplevert
 * is een **paginaplan**: een lijst pagina's met vlakken in millimeters, met de tekst
 * al in regels gebroken. `RenderService` zet dat plan om in inkt, op welke schaal
 * dan ook. Dat is `FR-DOC-113` — niet "twee wegen die hetzelfde doen", maar één
 * uitkomst die twee keer wordt getekend.
 *
 * **Alleen `A-fotoraster`** (werkopdracht D08). De vier andere layouts uit §5.10
 * staan in `LAYOUTS` met hun naam maar zonder sloten; het exportpaneel toont ze
 * zichtbaar-maar-uit, zodat er in sprint 2 een slottabel bij komt in plaats van een
 * verbouwing.
 *
 * **De tekst blijft in de doorloop op pagina 1** (B-122). §5.10.2 laat bij zes
 * foto's de tekst verhuizen naar `E-vervolg`, en die layout bouwt D08 uitdrukkelijk
 * niet. In plaats van een halve vervolgpagina houden we de tekst waar hij staat en
 * schuiven de foto's door; het paneel meldt hoeveel pagina's dat worden (B-07).
 */

import type { IsoDate } from "@/lib/dates";
import type { Uuid } from "@/lib/uuid";
import type { LayoutId } from "@/domain/types";

import { zet, type Tekstmeter, type Tekstregel } from "./tekstzetten";

/** A4 liggend met 10 mm marge rondom (T-13, §5.10). */
export const PAGINA = { breedte: 297, hoogte: 210, marge: 10 } as const;

/** De typografie van de gedrukte pagina (§5.10.1). Punten, niet pixels. */
export const PRINTLETTER = {
  titel: { punt: 24, regelhoogte: 28, gewicht: 600 },
  reeks: { punt: 10, regelhoogte: 12, gewicht: 500 },
  datum: { punt: 10, regelhoogte: 12, gewicht: 400 },
  /** §5.10.6: de herhaalde titel op een vervolgpagina is 14 pt, niet 24. */
  vervolgtitel: { punt: 14, regelhoogte: 17, gewicht: 600 },
  tekst: { punt: 11, regelhoogte: 16.5, gewicht: 400 },
  bijschrift: { punt: 8.5, regelhoogte: 11, gewicht: 400 },
  voettekst: { punt: 7.5, regelhoogte: 9, gewicht: 400 },
} as const;

/** §5.10.1: de titel is hoogstens twee regels, daarna een beletselteken. */
const MAX_TITELREGELS = 2;

/** §5.10.1: de reeksnaam staat in hoofdletters met 0,08 em spatiëring. */
export const REEKS_SPATIERING = 0.08;

export interface Kader {
  x: number;
  y: number;
  breedte: number;
  hoogte: number;
}

export interface Slot extends Kader {
  naam: string;
  soort: "kop" | "foto" | "tekst" | "voettekst";
}

export type Vlak =
  | { soort: "kop"; kader: Kader; reeks: string; titel: Tekstregel[]; datum: string }
  | { soort: "foto"; kader: Kader; photoId: Uuid; bijschrift: string }
  | { soort: "tekst"; kader: Kader; regels: Tekstregel[] }
  | { soort: "legenda"; kader: Kader; tekst: string }
  | { soort: "voettekst"; kader: Kader; links: string; rechts: string };

export interface Paginaplan {
  nummer: number;
  layoutId: LayoutId;
  vlakken: Vlak[];
}

export interface Exportplan {
  paginas: Paginaplan[];
  /** Wat er niet past, in schermtaal. Leeg als alles erop staat. */
  opmerkingen: string[];
}

export interface Exportfoto {
  photoId: Uuid;
  /** §5.10.1: alleen als er een alternatieve tekst is ingevuld. */
  bijschrift: string;
}

export interface Exportinhoud {
  titel: string;
  /** De naam van de reeks, of leeg. Staat bóven de titel (§5.10.1). */
  reeks: string;
  datum: IsoDate;
  tekst: string;
  fotos: Exportfoto[];
  /** De voettekst draagt de groepsnaam, de datum en de paginaaanduiding (§5.10.1). */
  groep: string;
  /**
   * De kinderen waar deze documentatie over gaat, met hun leeftijd (`FR-DOC-127`).
   *
   * Al samengesteld door de aanroeper: naam plus `6,1`, of alleen de naam als er
   * geen geboortejaar is (`FR-AGE-24`). De initialenschakelaar is er al overheen
   * geweest, want deze laag weet niet wie er afgeschermd moet worden (DR-31 is
   * daar; hier staat alleen waar iets op het blad komt).
   */
  leerlingen: string[];
  /** De legenda bij initialen; leeg als er geen botsing is (B-40). */
  legenda: string;
}

/**
 * Layout A — fotoraster (§5.10.2).
 *
 * De maten komen letterlijk uit de tabel. Ze staan hier als getallen en niet als
 * tekens uit `tokens.css`, want de printlaag rekent in millimeters en heeft een
 * eigen tekenset — dat is de enige uitzondering die §5.9 op DR-55 toestaat.
 */
const A_FOTORASTER: Slot[] = [
  { naam: "A0", soort: "kop", x: 10, y: 10, breedte: 277, hoogte: 26 },
  { naam: "A1", soort: "foto", x: 10, y: 40, breedte: 88, hoogte: 66 },
  { naam: "A2", soort: "foto", x: 104.5, y: 40, breedte: 88, hoogte: 66 },
  { naam: "A3", soort: "foto", x: 199, y: 40, breedte: 88, hoogte: 66 },
  { naam: "A4", soort: "foto", x: 10, y: 110, breedte: 88, hoogte: 66 },
  { naam: "A5", soort: "foto", x: 104.5, y: 110, breedte: 88, hoogte: 66 },
  { naam: "A6", soort: "tekst", x: 199, y: 110, breedte: 88, hoogte: 66 },
  { naam: "A7", soort: "voettekst", x: 10, y: 192, breedte: 277, hoogte: 8 },
];

/**
 * Layout B — verhaal (§5.10.3).
 *
 * Twee tekstkolommen, want 277 mm in één kolom levert regels van ver boven de 90
 * tekens. De tekst loopt van B3 naar B4.
 */
const B_VERHAAL: Slot[] = [
  { naam: "B0", soort: "kop", x: 10, y: 10, breedte: 277, hoogte: 26 },
  { naam: "B1", soort: "foto", x: 10, y: 40, breedte: 133, hoogte: 90 },
  { naam: "B2", soort: "foto", x: 154, y: 40, breedte: 133, hoogte: 90 },
  { naam: "B3", soort: "tekst", x: 10, y: 136, breedte: 133, hoogte: 54 },
  { naam: "B4", soort: "tekst", x: 154, y: 136, breedte: 133, hoogte: 54 },
  { naam: "B5", soort: "voettekst", x: 10, y: 192, breedte: 277, hoogte: 8 },
];

/** Layout C — groot beeld (§5.10.4). Eén dominante foto, een kort onderschrift. */
const C_GROOT_BEELD: Slot[] = [
  { naam: "C0", soort: "kop", x: 10, y: 10, breedte: 277, hoogte: 26 },
  { naam: "C1", soort: "foto", x: 10, y: 40, breedte: 277, hoogte: 122 },
  { naam: "C2", soort: "tekst", x: 10, y: 168, breedte: 190, hoogte: 22 },
  { naam: "C3", soort: "foto", x: 206, y: 168, breedte: 81, hoogte: 22 },
  { naam: "C4", soort: "voettekst", x: 10, y: 192, breedte: 277, hoogte: 8 },
];

/**
 * Layout D — alleen beeld (§5.10.5). Geen tekstslot, en dat is de bedoeling.
 *
 * De kop is compacter dan bij de andere: 16 mm in plaats van 26, want er staat
 * alleen een titel en een datum.
 */
const D_ALLEEN_BEELD: Slot[] = [
  { naam: "D0", soort: "kop", x: 10, y: 10, breedte: 277, hoogte: 16 },
  { naam: "D1", soort: "foto", x: 10, y: 30, breedte: 136.5, hoogte: 78 },
  { naam: "D2", soort: "foto", x: 150.5, y: 30, breedte: 136.5, hoogte: 78 },
  { naam: "D3", soort: "foto", x: 10, y: 112, breedte: 136.5, hoogte: 78 },
  { naam: "D4", soort: "foto", x: 150.5, y: 112, breedte: 136.5, hoogte: 78 },
  { naam: "D5", soort: "voettekst", x: 10, y: 192, breedte: 277, hoogte: 8 },
];

/**
 * Layout E — vervolg (§5.10.6).
 *
 * De layout die de overloop opvangt. Hij staat niet in de miniaturenkiezer: je
 * kiest hem niet, hij komt eraan omdat je tekst niet paste.
 */
const E_VERVOLG: Slot[] = [
  { naam: "E0", soort: "kop", x: 10, y: 10, breedte: 277, hoogte: 14 },
  { naam: "E1", soort: "tekst", x: 10, y: 30, breedte: 133, hoogte: 160 },
  { naam: "E2", soort: "tekst", x: 154, y: 30, breedte: 133, hoogte: 160 },
  { naam: "E3", soort: "voettekst", x: 10, y: 192, breedte: 277, hoogte: 8 },
];

const SLOTTABELLEN: Record<LayoutId, Slot[]> = {
  "A-fotoraster": A_FOTORASTER,
  "B-verhaal": B_VERHAAL,
  "C-groot-beeld": C_GROOT_BEELD,
  "D-alleen-beeld": D_ALLEEN_BEELD,
  "E-vervolg": E_VERVOLG,
};

export interface Layoutkeuze {
  id: LayoutId;
  naam: string;
  omschrijving: string;
  /** `false` zolang de slottabel er niet is; het paneel toont hem dan uit. */
  beschikbaar: boolean;
}

/**
 * De layouts voor de miniaturenkiezer (`FR-DOC-111`, B-140).
 *
 * Vier om uit te kiezen. `E-vervolg` staat er niet bij en dat is §5.10.6: *"Hij
 * bestaat niet in de miniaturenkiezer"* — je kiest hem niet, hij komt eraan omdat
 * je tekst niet paste.
 */
export const LAYOUTS: readonly Layoutkeuze[] = [
  { id: "A-fotoraster", naam: "Fotoraster", omschrijving: "Vier tot zes foto's met een korte tekst", beschikbaar: true },
  { id: "B-verhaal", naam: "Verhaal", omschrijving: "Veel tekst, één of twee foto's", beschikbaar: true },
  { id: "C-groot-beeld", naam: "Groot beeld", omschrijving: "Eén foto over de volle breedte", beschikbaar: true },
  { id: "D-alleen-beeld", naam: "Alleen beeld", omschrijving: "Twee tot vier foto's, geen tekst", beschikbaar: true },
];

/** De legenda staat onder de inhoud en boven de voettekst (B-40). */
const LEGENDAVLAK: Kader = { x: 10, y: 180, breedte: 277, hoogte: 8 };

function slotenVan(layoutId: LayoutId): Slot[] {
  return SLOTTABELLEN[layoutId];
}

/** De datum zoals hij op papier staat: 13 oktober 2026. */
function datumOpPapier(datum: IsoDate): string {
  const moment = new Date(`${datum}T00:00:00.000Z`);
  if (Number.isNaN(moment.getTime())) return datum;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(moment);
}

/**
 * De kop: reeksnaam en datum op één regel, daaronder de titel (§5.10.1).
 *
 * Op een vervolgpagina is hij kleiner en zonder reeksregel: §5.10.6 vraagt 14 pt in
 * plaats van 24, en er is daar geen reeks te herhalen. Zonder dat onderscheid past
 * de titel niet in de 14 mm van `E0` en komt de pagina zonder kop uit de machine —
 * precies het losse blad dat B-07 wil voorkomen.
 */
function kopvlak(slot: Slot, inhoud: Exportinhoud, meet: Tekstmeter, vervolg = false): Vlak {
  const letter = vervolg ? PRINTLETTER.vervolgtitel : PRINTLETTER.titel;
  const kopregel = vervolg ? 0 : PRINTLETTER.reeks.regelhoogte * (25.4 / 72);
  const titel = zet({
    tekst: inhoud.titel,
    breedte: slot.breedte,
    hoogte: slot.hoogte - kopregel,
    ...letter,
    meet,
  });

  const regels = titel.regels.slice(0, MAX_TITELREGELS).map((regel) => ({ ...regel, y: regel.y + kopregel }));
  // §5.10.1: meer dan twee regels wordt afgekapt met een beletselteken.
  const laatste = regels[regels.length - 1];
  if (laatste && (titel.regels.length > MAX_TITELREGELS || titel.rest)) {
    laatste.tekst = `${laatste.tekst.replace(/\s+\S*$/u, "")}…`;
  }

  return {
    soort: "kop",
    kader: slot,
    reeks: vervolg ? "" : inhoud.reeks,
    titel: regels,
    datum: vervolg ? "" : datumOpPapier(inhoud.datum),
  };
}

/**
 * De voettekst: wie, waar en wanneer (§5.10.1, `FR-DOC-127`).
 *
 * De kinderen staan vóór de datum en ná de groep, want dat is de volgorde waarin
 * je ze leest: eerst waar het speelde, dan over wie het gaat, dan wanneer.
 *
 * Er zit een grens op. Een documentatie over de hele groep krijgt soms twintig
 * vinkjes, en twintig namen passen niet op 277 mm bij 7,5 pt. Daarboven staat er
 * "en nog 14" — korter dan de namen, en eerlijker dan een afgekapte regel.
 */
function voetvlak(slot: Slot, inhoud: Exportinhoud, nummer: number, vanAantal: number): Vlak {
  const links = [inhoud.groep, kinderen(inhoud.leerlingen), datumOpPapier(inhoud.datum)]
    .filter(Boolean)
    .join(" · ");
  return { soort: "voettekst", kader: slot, links, rechts: `${nummer} van ${vanAantal}` };
}

/** §5.10.1: de voettekst is één regel van 7,5 pt. Zes namen is wat daar redelijk op past. */
const MAX_NAMEN_IN_VOET = 6;

function kinderen(namen: readonly string[]): string {
  if (namen.length === 0) return "";
  if (namen.length <= MAX_NAMEN_IN_VOET) return namen.join(", ");

  const eerste = namen.slice(0, MAX_NAMEN_IN_VOET).join(", ");
  return `${eerste} en nog ${namen.length - MAX_NAMEN_IN_VOET}`;
}

/**
 * Waar de tekst komt te staan (`FR-DOC-128`, B-141).
 *
 * In layout A zijn de zes vakken van het raster onderling verwisselbaar: de tekst
 * staat standaard rechtsonder, maar linksboven kan net zo goed. Dat is wat de
 * opdrachtgever vroeg — *"kiezen waar de tekst komt"* — en het is in dit raster de
 * enige plek waar die keuze iets betekent. In B en E liggen de twee kolommen vast,
 * in C is er één vak en in D geen.
 *
 * Omruilen en niet verplaatsen: het gekozen vak wordt tekst, en het vak waar de
 * tekst stond wordt foto. Zo blijft het raster vol en verandert er niets aan de
 * maten uit §5.10.2.
 */
function metTekstOp(sloten: Slot[], gekozen: string | undefined): Slot[] {
  const doel = sloten.find((slot) => slot.naam === gekozen);
  const huidig = sloten.find((slot) => slot.soort === "tekst");
  if (!doel || !huidig || doel.naam === huidig.naam || doel.soort !== "foto") return sloten;

  return sloten.map((slot) => {
    if (slot.naam === doel.naam) return { ...slot, soort: "tekst" as const };
    if (slot.naam === huidig.naam) return { ...slot, soort: "foto" as const };
    return slot;
  });
}

/** De vakken waar de tekst in deze layout terecht kán komen (`FR-DOC-128`). */
export function tekstplekken(layoutId: LayoutId): string[] {
  const sloten = SLOTTABELLEN[layoutId];
  return sloten.filter((slot) => slot.soort === "tekst" || slot.soort === "foto").map((s) => s.naam);
}

export interface Planopties {
  layoutId?: LayoutId;
  /** De naam van het slot dat de tekst krijgt; leeg is de stand uit §5.10. */
  tekstslot?: string;
  /** B-28: bij een layout zonder tekstvak kun je de tekst bewust weglaten. */
  laatTekstWeg?: boolean;
}

export interface LayoutDeps {
  meet: Tekstmeter;
}

/**
 * Zet de tekst in de tekstvakken, het ene na het andere.
 *
 * Levert per vak de regels op en wat er daarna nog over is. Bij layout B zijn dat er
 * twee naast elkaar; bij E ook. Wat na het laatste vak overblijft gaat naar een
 * vervolgpagina (§5.10.7 regel 4).
 */
function vulTekstvakken(tekst: string, vakken: Slot[], meet: Tekstmeter) {
  const gevuld: { slot: Slot; regels: Tekstregel[] }[] = [];
  let rest = tekst;

  for (const vak of vakken) {
    if (!rest) break;
    const zetsel = zet({
      tekst: rest,
      breedte: vak.breedte,
      hoogte: vak.hoogte,
      ...PRINTLETTER.tekst,
      meet,
    });
    if (zetsel.regels.length > 0) gevuld.push({ slot: vak, regels: zetsel.regels });
    rest = zetsel.rest;
  }

  return { gevuld, rest };
}

/** De vervolgpagina van §5.10.6: herhaalde titel, twee tekstkolommen. */
function vervolgpagina(
  tekst: string,
  inhoud: Exportinhoud,
  nummer: number,
  meet: Tekstmeter,
): Paginaplan {
  const sloten = slotenVan("E-vervolg");
  const tekstvakken = sloten.filter((slot) => slot.soort === "tekst");
  const { gevuld } = vulTekstvakken(tekst, tekstvakken, meet);

  return {
    nummer,
    layoutId: "E-vervolg",
    vlakken: [
      kopvlak(sloten.find((slot) => slot.soort === "kop")!, vervolgvan(inhoud), meet, true),
      ...gevuld.map((vak) => ({ soort: "tekst" as const, kader: vak.slot, regels: vak.regels })),
    ],
  };
}

/** Wat er niet vanzelf past, in schermtaal (§4.6: zichtbaar, niet stilgehouden). */
function opmerkingenOver(tekst: string, tekstvakken: number, rest: string): string[] {
  const uit: string[] = [];

  // Layout D heeft geen tekstvak (§5.10.5). Dat is geen fout: de tekst gaat naar een
  // vervolgpagina, tenzij je hem bewust weglaat (B-28).
  if (tekst && tekstvakken === 0) {
    uit.push(
      'Deze layout toont geen lopende tekst. Je tekst komt op een vervolgpagina. Wil je dat niet, zet dan "Laat de tekst weg" aan.',
    );
  }

  if (rest) {
    uit.push(
      `Niet alle tekst past op deze layout; de rest komt op een vervolgpagina (${rest.length} tekens).`,
    );
  }

  return uit;
}

/**
 * Verdeelt de inhoud over pagina's (§5.10.7).
 *
 * Regel 1: foto's gaan in de fotosloten, in de volgorde waarin ze staan. Regel 2:
 * zijn het er meer dan er sloten zijn, dan komt er een pagina bij in dezelfde
 * layout. Regel 3: de tekst wordt gezet op de werkelijke regelhoogte. Regel 4: wat
 * dan nog overblijft krijgt een vervolgpagina in `E-vervolg`.
 */
function maakPlan(inhoud: Exportinhoud, opties: Planopties, meet: Tekstmeter): Exportplan {
  const layoutId = opties.layoutId ?? "A-fotoraster";
  const sloten = metTekstOp(slotenVan(layoutId), opties.tekstslot);

  const fotosloten = sloten.filter((slot) => slot.soort === "foto");
  const tekstsloten = sloten.filter((slot) => slot.soort === "tekst");
  const kopslot = sloten.find((slot) => slot.soort === "kop")!;
  const voetslot = sloten.find((slot) => slot.soort === "voettekst")!;

  const tekst = opties.laatTekstWeg ? "" : inhoud.tekst;
  const { gevuld, rest } = vulTekstvakken(tekst, tekstsloten, meet);

  const perPagina = Math.max(1, fotosloten.length);
  const fotopaginas = Math.max(1, Math.ceil(inhoud.fotos.length / perPagina));
  const paginas: Paginaplan[] = [];

  for (let nummer = 1; nummer <= fotopaginas; nummer += 1) {
    const eersteFoto = (nummer - 1) * perPagina;
    const vlakken: Vlak[] = [
      kopvlak(kopslot, nummer === 1 ? inhoud : vervolgvan(inhoud), meet),
      ...inhoud.fotos.slice(eersteFoto, eersteFoto + perPagina).map((foto, plaats) => ({
        soort: "foto" as const,
        kader: fotosloten[plaats]!,
        photoId: foto.photoId,
        bijschrift: foto.bijschrift,
      })),
    ];

    // De tekst staat op pagina 1 en verhuist niet mee (B-122).
    if (nummer === 1) {
      for (const vak of gevuld) {
        vlakken.push({ soort: "tekst", kader: vak.slot, regels: vak.regels });
      }
    }

    paginas.push({ nummer, layoutId, vlakken });
  }

  // §5.10.7 regel 4: wat niet paste krijgt een pagina in `E-vervolg`. Ook de tekst
  // van layout D komt hier terecht — E is de vervolglayout en herhaalt de titel, en
  // dat is precies waar B-28 om vroeg (B-142).
  if (rest) paginas.push(vervolgpagina(rest, inhoud, paginas.length + 1, meet));

  // De voettekst en de legenda kennen pas hun paginanummer als alle pagina's er zijn.
  for (const pagina of paginas) {
    pagina.vlakken.push(voetvlak(voetslot, inhoud, pagina.nummer, paginas.length));
    if (pagina.nummer === paginas.length && inhoud.legenda) {
      pagina.vlakken.push({ soort: "legenda", kader: LEGENDAVLAK, tekst: inhoud.legenda });
    }
  }

  return { paginas, opmerkingen: opmerkingenOver(tekst, tekstsloten.length, rest) };
}

export function createLayoutService(deps: LayoutDeps) {
  return {
    plan: (inhoud: Exportinhoud, opties: Planopties = {}) => maakPlan(inhoud, opties, deps.meet),

    /** Het aantal pagina's vóór de export, voor `FR-DOC-112` en B-07. */
    aantalPaginas: (inhoud: Exportinhoud, opties: Planopties = {}) =>
      maakPlan(inhoud, opties, deps.meet).paginas.length,

    sloten: slotenVan,
    tekstplekken,
  };
}

/** §5.10.6: de herhaalde titel draagt "(vervolg)", anders is het blad niet thuis te brengen. */
function vervolgvan(inhoud: Exportinhoud): Exportinhoud {
  return { ...inhoud, titel: `${inhoud.titel} (vervolg)` };
}

export type LayoutService = ReturnType<typeof createLayoutService>;
