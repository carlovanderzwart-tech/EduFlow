# D08 — Export: één layout en de deelbare afbeelding

**Fase:** doorloop v0.1 · **Duur:** 1½ dagdeel · **Blokkeert:** —

## Doel

Er komt een afbeelding uit die je in één handeling in een mail plakt.

> Dit is het einde van de keten uit §1.1.1 — de fase "uitleveren" die nu 4 tot 6 minuten
> kost. Zonder deze opdracht bewijst de doorloop niets over de belofte.

## Lees dit, en niet meer

- `docs/06-1-modules-documentaties.md` — alleen het exportpaneel en de export
  (`FR-DOC-111` t/m `FR-DOC-119`)
- `docs/05-ontwerpfilosofie.md` — §5.10 het ontwerp van de documentatiepagina,
  §5.11 foto's, §5.12 de deelbare afbeelding
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-DOC-111` | Het paneel toont de layoutminiaturen bovenaan |
| `FR-DOC-112` | Het aantal pagina's staat vooraf vast en is zichtbaar |
| `FR-DOC-113` | Het voorbeeld **is** het eindresultaat, geen benadering |
| `FR-DOC-114` | Initialen vervangen namen op verzoek |
| `FR-DOC-115` | Toestemming beeldgebruik wordt één keer per documentatie gevraagd (B-08) |
| `FR-DOC-117` | De deelbare afbeelding gaat het deelmenu in; op de laptop "Kopieer afbeelding" (B-09) |
| `FR-DOC-118` | Exporteren zet de status op *gedeeld* (B-05) |
| `FR-DOC-119` | Een mislukte export verandert niets |
| `B-06` | Het exportscherm is een paneel over het schrijfscherm, geen apart scherm |

## Bestanden die je mag aanraken

```
src/modules/documentaties/ExportPanel.tsx
src/services/render/RenderService.ts
src/services/documentation/LayoutService.ts   ← alleen A-fotoraster
src/ui/{Panel,Button,Switch,Dialog}.tsx
```

## Wat je bouwt

1. Het exportpaneel (400px, `--size-panel`) dat over het schrijfscherm schuift. Bovenaan
   de layoutminiaturen — in de doorloop is er één actief en zijn de andere vier zichtbaar
   maar uit, zodat het paneel later niet verbouwd hoeft te worden.
2. `LayoutService` met **alleen** `A-fotoraster`, A4 liggend (297 × 210 mm), 10 mm marge.
   De signatuur is die van de vijf layouts, zodat sprint 2 er vier bijzet in plaats van
   dit herschrijft.
3. `RenderService` levert de deelbare afbeelding als JPEG. **Het voorbeeld komt uit
   dezelfde renderlaag als de export** (`FR-DOC-113`) — één weg, geen tweede.
4. De schakelaar "Vervang namen door initialen", die de leerlingenlijst gebruikt.
5. De eenmalige bevestiging beeldgebruik, per documentatie, de eerste keer dat je er een
   deelbare afbeelding van maakt (B-08).
6. Delen in één tik: de Web Share API met het bestand erin; op de laptop "Kopieer
   afbeelding" naar het klembord (B-09).
7. `FR-DOC-118`: een geslaagde export zet de status op *gedeeld*. Een mislukte export
   verandert niets — ook de status niet.

## Wat je bewust niet bouwt

Print-PDF via `pdf-lib` (`T-03`, sprint 2) — in de doorloop is Print-PDF de printfunctie
van de browser, alleen op Chrome op de laptop, en dat staat als zodanig in het paneel.
De andere vier layouts. Pagina's en vervolgpagina's (`FR-DOC-61` t/m `-70`).
Citaten in de opmaak.

## Klaar als

- [ ] Zes foto's plus tekst leveren één JPEG die er op A4 liggend goed uitziet
- [ ] Het voorbeeld in het paneel is pixel voor pixel wat je exporteert
- [ ] De schakelaar "initialen" verandert het voorbeeld direct
- [ ] De bevestiging beeldgebruik komt één keer per documentatie, niet één keer ooit
- [ ] Op de telefoon opent het deelmenu met het bestand er al in
- [ ] Op de laptop plak je de afbeelding direct in een mail
- [ ] Na een geslaagde export staat de documentatie op *gedeeld*; na een mislukte niet

## Val niet in deze kuil

**Twee renderpaden.** Een voorbeeld in HTML en een export via een canvas lopen uiteen, en
dan klopt `FR-DOC-113` niet meer. Eén renderlaag, twee uitvoerformaten — dat is §5.12 en
het is de reden dat de PDF in sprint 2 er zo makkelijk bij kan.

**Downloaden in plaats van delen.** Downloaden, terugzoeken in je fotorollen en dan pas
versturen zijn vier handelingen voor iets wat er één kan zijn (B-09, D4 uit de review).
