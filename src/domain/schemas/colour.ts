/**
 * De acht kleuren (§5.5).
 *
 * `groups.colour` en `series.colour` heten in §8.3.2 en §8.3.4 allebei "een van
 * acht" zonder ze op te sommen. §5.5 somt precies één verzameling van acht op.
 * Er is geen negende: vanaf de negende reeks begint de toekenning opnieuw bij
 * `series-1`, want twee reeksen met dezelfde kleur is minder erg dan een negende
 * kleur die niemand herkent.
 */

import { z } from "zod";

export const zColour = z.enum([
  "series-1",
  "series-2",
  "series-3",
  "series-4",
  "series-5",
  "series-6",
  "series-7",
  "series-8",
]);
