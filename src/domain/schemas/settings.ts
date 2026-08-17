/**
 * Schema van `settings` (§8.3.14).
 *
 * Zes velden plus het apparaat-id. Wat hier níét staat, staat in `localStorage`
 * (§8.2.2): de regio, de standaardtoon, de providerkeuze, de laatste weergave, de
 * back-updatum en de eenmalige bevestigingen. Die zes staan daar alleen.
 *
 * `disabledDetectors` is een lijst van uitzonderingen en geen schakelaar. De vier
 * gevoeligste detectoren — BSN, IBAN, e-mailadres en telefoonnummer — staan niet
 * in de opsomming en zijn daarmee niet uit te zetten (FR-MAI-24). Dat is
 * handhaving in het type: er is geen waarde om ze mee te noemen.
 */

import { z } from "zod";

import { recordSchema, zUuid } from "./base";

/** De vijf detectoren die je mag uitzetten (§6.3.10, FR-MAI-24). */
export const zDisableableDetector = z.enum([
  "adres",
  "aanhef",
  "ondertekening",
  "handtekeningblok",
  "achternaam",
]);

export const zPupilNoun = z.enum(["leerling", "kind"]);

export const zSettings = recordSchema({
  // Het apparaat-id dat elk record als `origin` draagt (§8.1.4).
  deviceId: zUuid,
  defaultGroupId: zUuid.nullable(),
  defaultStudentIds: z
    .array(zUuid)
    .refine((sleutels) => new Set(sleutels).size === sleutels.length, "Dubbele leerling"),
  // §6.4.4 legt de drempel vast tussen 10 en 60 schooldagen. §9.8 noemt 42 in een
  // terzijde en §6.4.4 noemt 21 als standaard; het hoofdstuk dat over dit blok gaat
  // is specifieker, dus die wint.
  attentionThresholdDays: z.number().int().min(10).max(60),
  // B-125: staat hij uit, dan wordt het blok niet berekend en niet getoond.
  showAttention: z.boolean(),
  pupilNoun: zPupilNoun,
  disabledDetectors: z.array(zDisableableDetector),
  showOutgoingRequest: z.boolean(),
});
