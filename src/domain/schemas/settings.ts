/**
 * Schema van `settings` (§8.3.14, T-50).
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
  // §9.8 rekent met 42 dagen; een drempel buiten een schooljaar is zinloos.
  attentionThresholdDays: z.number().int().min(1).max(365),
  pupilNoun: zPupilNoun,
  disabledDetectors: z.array(zDisableableDetector),
  showOutgoingRequest: z.boolean(),
});
