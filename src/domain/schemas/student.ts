/**
 * Schema van `students` (§8.3.1).
 *
 * De grendel van dit bestand is `strict`, geërfd uit `recordSchema`. INV-23 zegt
 * dat een leerling geen groep heeft, en dat het schema het veld weigert. Zonder
 * `strict` zou `groupId` er stilzwijgend bij kunnen komen en zou de invariant
 * alleen een zin in een handboek zijn.
 *
 * `birthYear` heeft in §8.3.1 een bovengrens "huidig jaar". Die staat hier niet:
 * hij vraagt om de huidige tijd, en §10.3 legt de klok bij de servicelaag zodat
 * hij te toetsen blijft. De ondergrens 1990 is wel absoluut.
 */

import { z } from "zod";

import { recordSchema } from "./base";

export const zStudent = recordSchema({
  // "geen cijfers": een leerlingnaam met een cijfer erin is bijna altijd een
  // ingeplakte regel uit een lijst met leerlingnummers.
  firstName: z.string().min(1).max(40).regex(/^\D+$/u, "Een voornaam bevat geen cijfers"),
  firstNameLower: z
    .string()
    .min(1)
    .max(40)
    .refine((waarde) => waarde === waarde.toLowerCase(), "Verwacht kleine letters"),
  lastNameInitial: z.string().max(3),
  birthDay: z.number().int().min(1).max(31).nullable(),
  birthMonth: z.number().int().min(1).max(12).nullable(),
  birthYear: z.number().int().min(1990).nullable(),
  note: z.string().max(500),
  pseudonymSeed: z.number().int().min(1),
});
