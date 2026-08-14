/**
 * Een doek dat opschrijft in plaats van tekent (DR-12).
 *
 * Hiermee is de renderlaag te toetsen zonder browser en zonder canvas. Elke
 * tekenopdracht komt in `opdrachten` te staan met de argumenten erbij, zodat een
 * toets kan nakijken wáár een letter of een foto terechtkwam in plaats van te
 * moeten geloven dat het goed ging.
 *
 * Staat naast de service en niet in `src/test/`, omdat het geen testgegeven is maar
 * een tweede uitvoering van `Doek` — dezelfde afspraak, andere invulling. `lib/` is
 * het niet, want het weet wat de renderlaag van een doek verwacht.
 *
 * **Het meet met een vaste letterbreedte.** Een echte letter is per teken anders
 * breed; dat is voor het scherm van belang en voor een toets juist niet. Een vaste
 * breedte maakt de regelafbreking voorspelbaar, en dat is wat er getoetst wordt.
 */

import type { Doek, Doekmaker, Printstijl, Tekencontext } from "./doek";

/** Elke letter telt voor de helft van de lettergrootte. */
const LETTERBREEDTE = 0.5;

export interface Opdracht {
  soort: "fillRect" | "fillText" | "drawImage" | "clip";
  argumenten: unknown[];
  /** De stand van de context op het moment van de opdracht. */
  stand: {
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    textAlign: string;
    letterSpacing: string;
  };
}

export interface Namaakdoek extends Doek {
  opdrachten: Opdracht[];
  /** Alleen de getekende teksten, in volgorde. Handig voor een snelle toets. */
  teksten(): { tekst: string; x: number; y: number; font: string }[];
}

/** De lettergrootte uit een canvas-`font`, in dezelfde eenheid als hij is gezet. */
function grootteVan(font: string): number {
  return Number(/(\d+(?:\.\d+)?)px/u.exec(font)?.[1] ?? 0);
}

export function maakNamaakdoek(breedte: number, hoogte: number): Namaakdoek {
  const opdrachten: Opdracht[] = [];

  const context: Tekencontext = {
    fillStyle: "",
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    letterSpacing: "0px",
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    rect: () => {},
    clip() {
      opdrachten.push({ soort: "clip", argumenten: [], stand: stand() });
    },
    fillRect(...argumenten) {
      opdrachten.push({ soort: "fillRect", argumenten, stand: stand() });
    },
    fillText(...argumenten) {
      opdrachten.push({ soort: "fillText", argumenten, stand: stand() });
    },
    measureText: (tekst: string) => ({ width: tekst.length * grootteVan(context.font) * LETTERBREEDTE }),
    drawImage(...argumenten) {
      opdrachten.push({ soort: "drawImage", argumenten, stand: stand() });
    },
  };

  function stand() {
    return {
      fillStyle: context.fillStyle,
      font: context.font,
      textAlign: context.textAlign,
      letterSpacing: context.letterSpacing ?? "0px",
    };
  }

  return {
    breedte,
    hoogte,
    context,
    opdrachten,
    teksten: () =>
      opdrachten
        .filter((opdracht) => opdracht.soort === "fillText")
        .map((opdracht) => ({
          tekst: String(opdracht.argumenten[0]),
          x: Number(opdracht.argumenten[1]),
          y: Number(opdracht.argumenten[2]),
          font: opdracht.stand.font,
        })),
    naarJpeg: async (kwaliteit: number) =>
      new Blob([`jpeg ${breedte}x${hoogte} q${kwaliteit}`], { type: "image/jpeg" }),
  };
}

/** De laatst gemaakte doeken, zodat een toets bij de tekenopdrachten kan. */
export function namaakDoekmaker(): { maak: Doekmaker<Namaakdoek>; doeken: Namaakdoek[] } {
  const doeken: Namaakdoek[] = [];
  return {
    maak: (breedte, hoogte) => {
      const doek = maakNamaakdoek(breedte, hoogte);
      doeken.push(doek);
      return doek;
    },
    doeken,
  };
}

/** Een tekenset met herkenbare waarden, zodat een toets ze kan aanwijzen. */
export const TOETSSTIJL: Printstijl = {
  familie: "toetsletter",
  inkt: "#1D232A",
  gedempt: "#7C8794",
  papier: "#FFFFFF",
};
