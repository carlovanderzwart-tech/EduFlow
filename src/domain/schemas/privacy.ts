/**
 * Schema van `privacyTerms` (§8.3.10, FR-INS-19).
 *
 * `termLower` is de kleineletterversie waarop de afscherming zoekt. De controle
 * is dezelfde als bij `Student.firstNameLower`: de waarde is zijn eigen
 * kleineletterversie. Diakrieten blijven staan; het wegvouwen daarvan gebeurt
 * pas bij het zoeken in `PrivacyService` (§12.5), niet in de opslag (§8.5).
 *
 * Er is geen schema voor de pseudoniemkaart, en dat is geen omissie. §8.3.10 en
 * T-23: hij wordt niet opgeslagen.
 */

import { z } from "zod";

import { recordSchema } from "./base";

export const zPrivacyTermKind = z.enum(["achternaam", "collega", "school", "plaats", "overig"]);

export const zPrivacyTerm = recordSchema({
  term: z.string().min(1),
  termLower: z
    .string()
    .min(1)
    .refine((waarde) => waarde === waarde.toLowerCase(), "Verwacht kleine letters"),
  kind: zPrivacyTermKind,
  enabled: z.boolean(),
});
