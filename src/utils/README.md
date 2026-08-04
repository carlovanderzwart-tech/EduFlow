# Utils

Kleine, generieke helperfuncties zonder businesslogica en zonder afhankelijkheid
van een specifieke module (bijvoorbeeld datumnotatie of bestandsgrootte
formatteren).

Let op het onderscheid met `src/lib/`: `src/lib/utils.ts` bevat de `cn()`-helper
van shadcn/ui en is eigendom van de UI-laag. Eigen, domeinspecifieke helpers
horen hier, in `src/utils/`, zoals in de mappenstructuur van
`docs/03 - Technical Architecture.md`.

Leeg in Sprint 1.
