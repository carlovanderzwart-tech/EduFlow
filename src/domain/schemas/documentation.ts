/**
 * Schema van `documentations` (§8.3.5, §6.1.1).
 *
 * **De grenzen aan `date` staan hier niet, en dat is geen vergeetachtigheid.**
 * Het handboek geeft er drie die elkaar uitsluiten: §8.3.5 zegt "≤ vandaag + 7
 * dagen (B-70)", §6.1.1 zegt "niet vóór 2015-08-01, niet later dan vandaag plus
 * 365 dagen", en INV-16 zegt "niet in de toekomst". Bovendien vraagt elk van de
 * drie om de huidige tijd, en §10.3 legt de klok uitdrukkelijk bij de
 * servicelaag: "zonder injecteerbare klok is B-70 niet te toetsen zonder de
 * systeemtijd te verzetten". Wat hier blijft staan is de vorm: een geldige
 * kalenderdag.
 *
 * **INV-15 staat hier ook niet.** Dat `status` en `firstExportedAt` bij elkaar
 * horen, wordt volgens INV-15 niet bij het lezen geweigerd maar gecorrigeerd en
 * gelogd door `DocumentationService`. Een schema dat zo'n record afkeurt zou
 * werk onbereikbaar maken dat de service juist kan repareren.
 */

import { z } from "zod";

import { recordSchema, zIsoDate, zIsoDateTime, zUuid } from "./base";

export const zDocumentationStatus = z.enum(["concept", "gedeeld"]);

/** Geen dubbele verwijzingen: §6.1.1 eist dat voor `studentIds` en `groupIds`. */
const geenDubbelen = (sleutels: string[]) => new Set(sleutels).size === sleutels.length;

export const zDocumentation = recordSchema({
  title: z.string().max(120),
  date: zIsoDate,
  seriesId: zUuid.nullable(),
  studentIds: z.array(zUuid).max(60).refine(geenDubbelen, "Dubbele leerling"),
  groupIds: z.array(zUuid).max(10).refine(geenDubbelen, "Dubbele groep"),
  // Minstens één pagina zodra de documentatie bestaat (INV-08, §6.1.1).
  pageIds: z.array(zUuid).min(1).max(20).refine(geenDubbelen, "Dubbele pagina"),
  privateNote: z.string().max(2_000),
  status: zDocumentationStatus,
  firstExportedAt: zIsoDateTime.nullable(),
  archivedAt: zIsoDateTime.nullable(),
  imageConsentAt: zIsoDateTime.nullable(),
});
