/**
 * Gereedschap van de bouwstraat: lezen, zoeken en de uitkomst van een poort.
 *
 * Dit stond in `run.mjs` en is eruit gehaald toen dat bestand door het activeren
 * van poort 1 boven de vierhonderd regels van DR-53 kwam. De poorten zelf en de
 * loop eromheen blijven in `run.mjs`; hier staat alleen wat elke poort deelt.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export const WORTEL = resolve(import.meta.dirname, "../..");

export const lees = (pad) => readFileSync(join(WORTEL, pad), "utf8");
export const bestaat = (pad) => existsSync(join(WORTEL, pad));

/** Alle bronbestanden onder een map, met de opgegeven extensies. */
export function bronbestanden(map, extensies = [".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx"]) {
  const start = join(WORTEL, map);
  if (!existsSync(start)) return [];

  const gevonden = [];
  const loop = (dir) => {
    for (const naam of readdirSync(dir)) {
      const pad = join(dir, naam);
      if (statSync(pad).isDirectory()) {
        if (naam === "node_modules" || naam === ".next") continue;
        loop(pad);
      } else if (extensies.some((ext) => naam.endsWith(ext))) {
        gevonden.push(pad);
      }
    }
  };
  loop(start);
  return gevonden;
}

/** Zoekt een patroon in een verzameling bestanden en geeft de treffers terug. */
export function zoek(bestanden, patroon) {
  const treffers = [];
  for (const pad of bestanden) {
    const regels = readFileSync(pad, "utf8").split(/\r?\n/);
    regels.forEach((regel, i) => {
      if (patroon.test(regel)) {
        // Altijd met schuine strepen, zodat een melding op Windows en Linux
        // hetzelfde leest en met paden te vergelijken is.
        const relatief = pad.slice(WORTEL.length + 1).replaceAll("\\", "/");
        treffers.push(`${relatief}:${i + 1}  ${regel.trim().slice(0, 120)}`);
      }
    });
  }
  return treffers;
}

export const ok = (bericht) => ({ geslaagd: true, bericht });
export const mislukt = (bericht, details = []) => ({ geslaagd: false, bericht, details });
