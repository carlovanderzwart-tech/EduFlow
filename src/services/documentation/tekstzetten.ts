/**
 * Tekst in regels breken voor de gedrukte pagina (§5.10.1, §5.10.7 regel 3).
 *
 * Dit is de enige plek waar wordt bepaald wáár een regel eindigt. `RenderService`
 * zet alleen inkt neer: hij krijgt regels en tekent ze. Daardoor kan het voorbeeld
 * op het scherm niet anders breken dan de export, want ze delen deze uitkomst en
 * niet alleen deze functie (`FR-DOC-113`).
 *
 * Het meten gebeurt door een geïnjecteerde `Tekstmeter`. Reden: de werkelijke
 * breedte van een letter kent alleen de tekenlaag, en DR-12 wil deze laag toetsbaar
 * houden zonder browser. Een toets levert een meter die telt in plaats van meet.
 */

/** Breedte van een stuk tekst in millimeters, bij een puntgrootte en een gewicht. */
export type Tekstmeter = (tekst: string, punt: number, gewicht: number) => number;

/** Eén gezette regel: de tekst en de afstand van de bovenkant van het vlak, in mm. */
export interface Tekstregel {
  tekst: string;
  /** De basislijn, gemeten vanaf de bovenkant van het vlak (mm). */
  y: number;
}

export interface Zetopdracht {
  tekst: string;
  /** De beschikbare breedte in millimeters. */
  breedte: number;
  /** De beschikbare hoogte in millimeters; regels daarbuiten passen niet. */
  hoogte: number;
  punt: number;
  regelhoogte: number;
  gewicht: number;
  meet: Tekstmeter;
}

export interface Zetsel {
  regels: Tekstregel[];
  /** Wat er niet meer paste. Leeg als alles erop staat. */
  rest: string;
}

/** §5.10.1: 25,4 mm per inch, 72 punten per inch. */
export const MM_PER_PUNT = 25.4 / 72;

/**
 * De eerste basislijn ligt niet op de bovenkant van het vlak.
 *
 * Een letter hangt onder zijn basislijn; zetten we de eerste regel op y = 0, dan
 * staat de tekst buiten het vlak. Vier vijfde van de regelhoogte is de gebruikelijke
 * benadering van de hoogte boven de basislijn en werkt voor elke grootte in §5.10.1.
 */
const BASISLIJN_DEEL = 0.8;

/** Woorden, met het scheidingsteken eraan vast zodat samenvoegen verliesloos is. */
function woordenVan(alinea: string): string[] {
  return alinea.split(/(?<=\s)/u);
}

/**
 * Breekt één alinea greedy: zolang het volgende woord past, gaat het erbij.
 *
 * Past een enkel woord niet op een lege regel, dan komt het er toch op. Afbreken
 * met een streepje is een taalkundige beslissing die het handboek niet neemt, en
 * een woord stilweg weglaten is erger dan een woord dat een millimeter uitsteekt.
 */
function breekAlinea(alinea: string, opdracht: Zetopdracht): string[] {
  const { breedte, punt, gewicht, meet } = opdracht;
  const regels: string[] = [];
  let huidig = "";

  for (const woord of woordenVan(alinea)) {
    const kandidaat = huidig + woord;
    if (huidig && meet(kandidaat.trimEnd(), punt, gewicht) > breedte) {
      regels.push(huidig.trimEnd());
      huidig = woord.trimStart();
    } else {
      huidig = kandidaat;
    }
  }

  if (huidig.trim()) regels.push(huidig.trimEnd());
  return regels;
}

/**
 * Zet een tekst in een vlak en geeft terug wat er niet paste.
 *
 * De rest wordt teruggegeven en niet weggegooid: §5.10.7 regel 4 laat hem
 * doorlopen naar een vervolgpagina, en het exportpaneel meldt hem zolang die
 * vervolgpagina er nog niet is. Stil afkappen is nooit een uitkomst.
 */
export function zet(opdracht: Zetopdracht): Zetsel {
  // Een lege tekst levert geen regel op, ook geen lege. Anders komt er een
  // tekstvlak op de pagina te staan waar niets in staat.
  if (!opdracht.tekst.trim()) return { regels: [], rest: "" };

  const regelhoogteMm = opdracht.regelhoogte * MM_PER_PUNT;
  const maxRegels = Math.max(0, Math.floor(opdracht.hoogte / regelhoogteMm));

  const alineas = opdracht.tekst.split(/\n/u);
  const gebroken: { tekst: string; alinea: number }[] = [];
  alineas.forEach((alinea, nummer) => {
    const regels = alinea.trim() ? breekAlinea(alinea, opdracht) : [""];
    for (const tekst of regels) gebroken.push({ tekst, alinea: nummer });
  });

  const passend = gebroken.slice(0, maxRegels);
  const over = gebroken.slice(maxRegels);

  return {
    regels: passend.map((regel, plaats) => ({
      tekst: regel.tekst,
      y: (plaats + BASISLIJN_DEEL) * regelhoogteMm,
    })),
    // Regels weer aan elkaar met een spatie binnen een alinea en een nieuwe regel
    // ertussen: wat er niet paste blijft leesbaar als tekst.
    rest: over
      .map((regel, plaats) => (plaats > 0 && regel.alinea !== over[plaats - 1]!.alinea ? `\n${regel.tekst}` : regel.tekst))
      .join(" ")
      .replace(/ \n/gu, "\n")
      .trim(),
  };
}
