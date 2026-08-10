/**
 * Schema van `documentations` (§8.3.5, §6.1.1).
 *
 * **Van de drie grenzen aan `date` staat hier alleen de ondergrens.** INV-16
 * geeft er drie en wijst ze aan drie plekken toe. De ondergrens 2015-08-01 is
 * absoluut en staat hieronder. De bovengrens van zeven dagen (B-70) en de grens
 * van het oudste schooljaar in de opslag horen bij `DocumentationService`: de
 * eerste vraagt de huidige tijd, de tweede vraagt andere records. §10.3 legt de
 * klok uitdrukkelijk bij de servicelaag — "zonder injecteerbare klok is B-70 niet
 * te toetsen zonder de systeemtijd te verzetten" — en een schema dat andere
 * records leest bestaat niet.
 *
 * **INV-15 staat hier ook niet.** Dat `status` en `firstExportedAt` bij elkaar
 * horen, wordt volgens INV-15 niet bij het lezen geweigerd maar gecorrigeerd en
 * gelogd door `DocumentationService`. Een schema dat zo'n record afkeurt zou
 * werk onbereikbaar maken dat de service juist kan repareren.
 */

import { z } from "zod";

import { recordSchema, zIsoDate, zIsoDateTime, zUuid } from "./base";

export const zDocumentationStatus = z.enum(["concept", "gedeeld"]);

/**
 * De vroegste datum die een documentatie mag dragen (INV-16, §6.1.1).
 *
 * Vergelijken op de tekenreeks mag: een `IsoDate` heeft een vaste breedte, dus
 * alfabetische volgorde ís chronologische volgorde.
 */
const VROEGSTE_DATUM = "2015-08-01";

/** Geen dubbele verwijzingen: §6.1.1 eist dat voor `studentIds` en `groupIds`. */
const geenDubbelen = (sleutels: string[]) => new Set(sleutels).size === sleutels.length;

export const zDocumentation = recordSchema({
  title: z.string().max(120),
  date: zIsoDate.refine((dag) => dag >= VROEGSTE_DATUM, `Niet vóór ${VROEGSTE_DATUM}`),
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
