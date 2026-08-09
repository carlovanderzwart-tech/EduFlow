/**
 * Zeven overtredingen van DR-44 en twee regels die wél mogen.
 *
 * Dit bestand hoort bij `dr-44.test.ts` en staat daarom in `globalIgnores` van
 * `eslint.config.mjs`: `pnpm lint` slaat het over, en de toets lint het
 * uitdrukkelijk mét `ignore: false`. Zonder dat zou `pnpm lint` altijd rood zijn
 * en zou de lintregel niet meer te bewijzen zijn.
 *
 * Er staat `declare const` en geen echte waarde. De regel kijkt naar typen, dus
 * er hoeft niets te draaien; een bestand dat wél draait zou een logregel met
 * persoonsgegevens uitvoeren, en dat is precies wat DR-44 verbiedt.
 */

import type { Block, Documentation, MailDraft, MailMessage, Page, Student } from "../types";

declare const documentatie: Documentation;
declare const leerling: Student;
declare const pagina: Page;
declare const blok: Block;
declare const bericht: MailMessage;
declare const concept: MailDraft;
declare const lijst: Documentation[];
declare const logger: { warn: (...regels: unknown[]) => void };

export function overtredingen(): void {
  console.log(documentatie);
  console.error(leerling);
  console.warn(pagina);
  console.info(blok);
  console.debug(bericht);
  logger.warn(concept);
  console.log(lijst);
}

export function magWel(): void {
  console.log(documentatie.id);
  console.log(`${lijst.length} documentaties`);
}
