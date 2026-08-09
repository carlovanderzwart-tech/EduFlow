# EduFlow

AI-assistent voor pedagogische professionals. Documentaties, agenda, mail.
Volledige specificatie: `docs/EduFlow - Product Bible v1.0.md`. Dat document is bindend.

Spreekt de code dit document tegen, dan wint het document.

## Lees dit vóór je code schrijft

- Hoofdstuk 2: de tien uitgangspunten, met de rangorde uit B-52
- Hoofdstuk 20: de ontwikkelregels (DR-01 t/m DR-57)
- Hoofdstuk 19: het besluitenregister — bijna elke vreemde regel staat daar uitgelegd

## De vijf regels die je nooit overtreedt

1. Geen AI-aanroep zonder `PrivacyService` (DR-31)
2. Geen beeldgegeven naar `/api/ai` (DR-32)
3. Geen verzendrecht bij Microsoft of Google (DR-34, B-20)
4. Geen persoonsgegevens in `localStorage`, een URL of een logregel (DR-33)
5. Geen code voor iets wat niet in het handboek staat (DR-01)

## Structuur

- `modules/` alleen schermen · `services/` alle regels · `domain/` typen en invarianten
- Importregels: §10.2. Overtreding faalt de bouwstraat.
- Nederlandse schermtaal, Engelse code.

## Commando's

`pnpm dev` · `pnpm test` · `pnpm test:golden` · `pnpm lint` · `pnpm typecheck` · `pnpm e2e`

## Testgegevens

Groep 4 – De Regenboog, twintig verzonnen namen: zie bijlage A van het handboek.
Gebruik nooit namen van echte kinderen, ook niet in een voorbeeld.

## Waar de code nog afwijkt

De codebase is op 8 augustus 2026 volledig getoetst aan de Bible en wijkt op de dragende
constructie nog af. De implementatievolgorde staat in §19.5 en de begeleidende review; loop
niet vooruit op een stap. Twee afhankelijkheden zijn tijdelijk (T-45): `idb` verdwijnt bij
stap 4, `jspdf` bij stap 13. Bouw daar geen nieuwe functionaliteit op.

Historische documenten staan in `docs/archief/` en zijn niet meer normatief. De
besluitnummers daarin betekenen iets anders dan dezelfde nummers in hoofdstuk 19.

@AGENTS.md
