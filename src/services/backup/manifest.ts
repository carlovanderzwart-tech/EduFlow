/**
 * Het manifest van een back-up (§8.7, B-143).
 *
 * De eerste pagina van het bestand: wat erin zit, wanneer het gemaakt is, op welk
 * apparaat, en of het versleuteld is. `FR-INS-30` leunt erop — *"dan toont de app
 * eerst wat erin zit (aantallen per soort, datum, apparaat)"* — en dat kan alleen
 * als dit deel **onversleuteld** in de zip staat.
 *
 * Dat is geen lek. Een aantal en een apparaatnaam zeggen niets over een kind; de
 * namen, de teksten en de foto's zitten in de versleutelde bestanden ernaast. Zou
 * het manifest ook dicht zijn, dan moest je je wachtwoord intypen voordat de app je
 * kon vertellen wélk bestand je in handen hebt, en dat is precies de keuze waarin
 * mensen hun laatste goede back-up overschrijven.
 *
 * Deze module raakt de opslag niet en is te toetsen zonder database (DR-12).
 */

import type { TabelNaam } from "../storage/tabellen";

/** §8.7: `formatVersion` 2. Een ouder bestand wordt herkend en geweigerd, niet geraden. */
export const FORMAATVERSIE = 2;
export const FORMAATNAAM = "eduflow-backup";

export interface Versleutelgegevens {
  algorithm: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  /** Het zout, als hex. Geen geheim: het voorkomt alleen dezelfde sleutel bij hetzelfde wachtwoord. */
  salt: string;
}

export interface Manifest {
  format: typeof FORMAATNAAM;
  formatVersion: number;
  createdAt: string;
  appVersion: string;
  dbVersion: number;
  device: { id: string; name: string };
  /** `null` bij een onversleutelde back-up (`FR-INS-29`). */
  encryption: Versleutelgegevens | null;
  counts: Partial<Record<TabelNaam, number>>;
  bytes: { data: number; blobs: number };
  checksum: { algorithm: "SHA-256"; value: string };
}

/**
 * Is dit een back-up die deze versie kan lezen?
 *
 * Meldt wát er mis is en niet alleen dát er iets mis is: je staat met een bestand in
 * je hand en wilt weten of je verder moet zoeken (§4.7).
 */
export function bezwaarTegen(manifest: unknown): string | null {
  if (!manifest || typeof manifest !== "object") {
    return "Dit bestand bevat geen back-up van EduFlow.";
  }

  const kop = manifest as Partial<Manifest>;
  if (kop.format !== FORMAATNAAM) {
    return "Dit bestand bevat geen back-up van EduFlow.";
  }

  if (kop.formatVersion !== FORMAATVERSIE) {
    return `Deze back-up heeft formaat ${kop.formatVersion ?? "onbekend"}; deze versie van EduFlow leest formaat ${FORMAATVERSIE}.`;
  }

  return null;
}

/** De bestandsnaam uit §8.7: `eduflow-backup-2026-08-07-pc-carlo.zip`. */
export function bestandsnaam(manifest: Manifest): string {
  const dag = manifest.createdAt.slice(0, 10);
  const apparaat = manifest.device.name.replace(/[\\/:*?"<>|\s]+/gu, "-").replace(/^-|-$/gu, "");
  const achtervoegsel = manifest.encryption ? "" : "-onversleuteld";

  return `${FORMAATNAAM}-${dag}${apparaat ? `-${apparaat}` : ""}${achtervoegsel}.zip`;
}

/**
 * Wat er in de back-up zit, in schermtaal (`FR-INS-30`).
 *
 * Alleen de soorten die er zijn, en alleen die waar een mens iets mee kan. Een regel
 * "0 sjablonen" zegt niets; "212 documentaties" zegt of je het goede bestand hebt.
 */
const TOONBAAR: { tabel: TabelNaam; enkel: string; meervoud: string }[] = [
  { tabel: "documentations", enkel: "documentatie", meervoud: "documentaties" },
  { tabel: "photos", enkel: "foto", meervoud: "foto's" },
  { tabel: "students", enkel: "leerling", meervoud: "leerlingen" },
  { tabel: "groups", enkel: "groep", meervoud: "groepen" },
  { tabel: "series", enkel: "reeks", meervoud: "reeksen" },
  { tabel: "calendarEvents", enkel: "agenda-item", meervoud: "agenda-items" },
];

export function samenvatting(manifest: Manifest): string[] {
  return TOONBAAR.flatMap(({ tabel, enkel, meervoud }) => {
    const aantal = manifest.counts[tabel] ?? 0;
    return aantal === 0 ? [] : [`${aantal} ${aantal === 1 ? enkel : meervoud}`];
  });
}
