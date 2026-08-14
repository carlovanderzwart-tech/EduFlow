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

export interface Layoutkeuze {
  id: LayoutId;
  naam: string;
  omschrijving: string;
  /** `false` zolang de slottabel er niet is; het paneel toont hem dan uit. */
  beschikbaar: boolean;
}

/** De vijf layouts voor de miniaturenkiezer (FR-DOC-111). Alleen A werkt. */
export const LAYOUTS: readonly Layoutkeuze[] = [
  { id: "A-fotoraster", naam: "Fotoraster", omschrijving: "Vier tot zes foto's met een korte tekst", beschikbaar: true },
  { id: "B-verhaal", naam: "Verhaal", omschrijving: "Veel tekst, één of twee foto's", beschikbaar: false },
  { id: "C-groot-beeld", naam: "Groot beeld", omschrijving: "Eén foto over de volle breedte", beschikbaar: false },
  { id: "D-alleen-beeld", naam: "Alleen beeld", omschrijving: "Twee tot vier foto's, geen tekst", beschikbaar: false },
  { id: "E-vervolg", naam: "Vervolg", omschrijving: "Wordt automatisch ingezet bij overloop", beschikbaar: false },
];

/** De legenda staat onder de inhoud en boven de voettekst (B-40). */
const LEGENDAVLAK: Kader = { x: 10, y: 180, breedte: 277, hoogte: 8 };

function slotenVan(layoutId: LayoutId): Slot[] {
  if (layoutId !== "A-fotoraster") {
    throw new Error(`Layout ${layoutId} heeft nog geen slottabel; alleen A-fotoraster bestaat (D08).`);
  }
  return A_FOTORASTER;
}

/** De datum zoals hij op papier staat: 13 oktober 2026. */
function datumOpPapier(datum: IsoDate): string {
  const moment = new Date(`${datum}T00:00:00.000Z`);
  if (Number.isNaN(moment.getTime())) return datum;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(moment);
}

/** De kop: reeksnaam en datum op één regel, daaronder de titel (§5.10.1). */
function kopvlak(slot: Slot, inhoud: Exportinhoud, meet: Tekstmeter): Vlak {
  const kopregel = PRINTLETTER.reeks.regelhoogte * (25.4 / 72);
  const titel = zet({
    tekst: inhoud.titel,
    breedte: slot.breedte,
    hoogte: slot.hoogte - kopregel,
    ...PRINTLETTER.titel,
    meet,
  });

  const regels = titel.regels.slice(0, MAX_TITELREGELS).map((regel) => ({ ...regel, y: regel.y + kopregel }));
  // §5.10.1: meer dan twee regels wordt afgekapt met een beletselteken.
  const laatste = regels[regels.length - 1];
  if (laatste && (titel.regels.length > MAX_TITELREGELS || titel.rest)) {
    laatste.tekst = `${laatste.tekst.replace(/\s+\S*$/u, "")}…`;
  }

  return { soort: "kop", kader: slot, reeks: inhoud.reeks, titel: regels, datum: datumOpPapier(inhoud.datum) };
}

function voetvlak(slot: Slot, inhoud: Exportinhoud, nummer: number, vanAantal: number): Vlak {
  const links = [inhoud.groep, datumOpPapier(inhoud.datum)].filter(Boolean).join(" · ");
  return { soort: "voettekst", kader: slot, links, rechts: `${nummer} van ${vanAantal}` };
}

export interface LayoutDeps {
  meet: Tekstmeter;
}

export function createLayoutService(deps: LayoutDeps) {
  /**
   * Verdeelt de inhoud over pagina's (§5.10.7).
   *
   * Regel 1: foto's gaan in de fotosloten, in de volgorde waarin ze staan. Regel 2:
   * zijn het er meer dan er sloten zijn, dan komt er een pagina bij in dezelfde
   * layout. Regel 3: de tekst wordt gezet op de werkelijke regelhoogte. Wat dan nog
   * overblijft komt in `opmerkingen` — zichtbaar, niet stilgehouden.
   */
  function plan(inhoud: Exportinhoud, layoutId: LayoutId = "A-fotoraster"): Exportplan {
    const sloten = slotenVan(layoutId);
    const fotosloten = sloten.filter((slot) => slot.soort === "foto");
    const tekstslot = sloten.find((slot) => slot.soort === "tekst")!;
    const kopslot = sloten.find((slot) => slot.soort === "kop")!;
    const voetslot = sloten.find((slot) => slot.soort === "voettekst")!;

    const perPagina = fotosloten.length;
    const aantalPaginas = Math.max(1, Math.ceil(inhoud.fotos.length / perPagina));
    const opmerkingen: string[] = [];

    const zetsel = zet({
      tekst: inhoud.tekst,
      breedte: tekstslot.breedte,
      hoogte: tekstslot.hoogte,
      ...PRINTLETTER.tekst,
      meet: deps.meet,
    });
    if (zetsel.rest) {
      opmerkingen.push(
        `Er past niet alle tekst op deze layout; ${zetsel.rest.length} tekens blijven over. Kies een kortere tekst of wacht op layout B (sprint 2).`,
      );
    }

    const paginas: Paginaplan[] = [];
    for (let nummer = 1; nummer <= aantalPaginas; nummer += 1) {
      const eersteFoto = (nummer - 1) * perPagina;
      const vlakken: Vlak[] = [
        kopvlak(kopslot, nummer === 1 ? inhoud : { ...inhoud, titel: `${inhoud.titel} (vervolg)` }, deps.meet),
        ...inhoud.fotos.slice(eersteFoto, eersteFoto + perPagina).map((foto, plaats) => ({
          soort: "foto" as const,
          kader: fotosloten[plaats]!,
          photoId: foto.photoId,
          bijschrift: foto.bijschrift,
        })),
        voetvlak(voetslot, inhoud, nummer, aantalPaginas),
      ];

      // De tekst staat op pagina 1 en verhuist niet mee (B-122).
      if (nummer === 1 && zetsel.regels.length > 0) {
        vlakken.push({ soort: "tekst", kader: tekstslot, regels: zetsel.regels });
      }
      // De legenda staat onderaan de laatste pagina (B-40).
      if (nummer === aantalPaginas && inhoud.legenda) {
        vlakken.push({ soort: "legenda", kader: LEGENDAVLAK, tekst: inhoud.legenda });
      }

      paginas.push({ nummer, layoutId, vlakken });
    }

    return { paginas, opmerkingen };
  }

  /** Het aantal pagina's vóór de export, voor `FR-DOC-112` en B-07. */
  function aantalPaginas(inhoud: Exportinhoud, layoutId: LayoutId = "A-fotoraster"): number {
    return plan(inhoud, layoutId).paginas.length;
  }

  return { plan, aantalPaginas, sloten: slotenVan };
}

export type LayoutService = ReturnType<typeof createLayoutService>;
