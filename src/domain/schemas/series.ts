/**
 * Schema van `series` (§8.3.4).
 *
 * `description` gaat als context mee bij de vervolgzin (B-04). Dat is de reden
 * dat er een grens van 500 tekens op staat: hij gaat de deur uit.
 */

import { z } from "zod";

import { recordSchema } from "./base";
import { zColour } from "./colour";

export const zSeries = recordSchema({
  name: z.string().min(1).max(60),
  colour: zColour,
  description: z.string().max(500),
});
