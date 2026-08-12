# D06 — Laat AI meeschrijven en het controlescherm

**Fase:** doorloop v0.1 · **Duur:** 1½ dagdeel · **Blokkeert:** —

## Doel

Je laat de AI meeschrijven aan een documentatie, ziet vóór verzending precies wat eruit
gaat, en neemt het voorstel over of gooit het weg.

> Dit is het scherm dat Karin in september wil zien. Alles wat hier half af is, is in dat
> gesprek een vraag die je niet kunt beantwoorden.

## Lees dit, en niet meer

- `docs/06-1-modules-documentaties.md` — alleen §6.1 over "Laat AI meeschrijven" en het
  controlescherm (`FR-DOC-71` t/m `FR-DOC-83`)
- `docs/12-ai-architectuur.md` — §12.3 de opdracht, §12.14 wat de gebruiker hiervan ziet
- `docs/04-ux-principes.md` — §4.5 wachten en tempo, §4.8 bevestigen en ongedaan maken
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-DOC-71` | De knop is uit zonder tekst (onder 20 tekens) |
| `FR-DOC-72` | Het controlescherm toont **vijf blokken** |
| `FR-DOC-73` | Niets vertrekt vóór het controlescherm |
| `FR-DOC-74` | Voorbeelden en reeksdelen zijn per aanroep uit te vinken |
| `FR-DOC-75` | Harde poort bij een lege leerlingenlijst |
| `FR-DOC-76` | De eenmalige bevestiging is in te trekken |
| `FR-DOC-77` / `-78` | Het antwoord komt binnen als stroom; stoppen behoudt wat er is |
| `FR-DOC-79` | Precies drie uitkomstknoppen: Overnemen, Opnieuw, Weggooien |
| `FR-DOC-80` | Overnemen vraagt: onder mijn tekst plakken, of mijn tekst vervangen |
| `FR-DOC-81` | Overnemen is ongedaan te maken en dat overleeft herladen (`T-07`) |
| `FR-DOC-82` | Opnieuw is beperkt tot drie pogingen |
| `FR-DOC-83` | De vergelijking markeert niet alleen met kleur (NFR-38) |
| `NFR-07` | Eerste teken binnen 2 seconden (p90) |

## Bestanden die je mag aanraken

```
src/modules/documentaties/AIPanel.tsx
src/modules/documentaties/ReviewPanel.tsx        ← "Bekijk wat er verstuurd wordt"
src/modules/documentaties/hooks/useAIProposal.ts
src/services/ai/AIService.ts                     ← alleen de haak voor het controlescherm
src/ui/{Panel,Button,Checkbox,Diff}.tsx
```

## Wat je bouwt

1. De knop **"Laat AI meeschrijven"**, uit onder 20 tekens (`FR-DOC-71`).
2. Het controlescherm als **paneel over het schrijfscherm** (B-06), 400px, met de vijf
   blokken uit §12.3 — **letterlijk de tekst die verstuurd wordt**, niet een samenvatting
   ervan. De blokken voor voorbeelden en reeksdelen hebben een vinkje waarmee je ze voor
   deze aanroep weglaat (`FR-DOC-74`).
3. De harde poort: bij een lege leerlingenlijst geen aanroep, met een uitleg en een
   eenmalige bevestiging die je later kunt intrekken (`FR-DOC-75`, `-76`, `T-08`).
4. Het voorstel komt binnen als stroom, onder je eigen tekst in de contentkolom — geen
   apart AI-venster (§11.5). Stoppen bewaart wat er al is.
5. **Precies drie knoppen.** Overnemen vraagt aanvullen of vervangen, en zet een
   ongedaan-maken-punt dat een herlading overleeft (`T-07`). Opnieuw telt af van drie.
6. De vergelijkingsweergave markeert met tekst én vorm, niet alleen met kleur.

## Wat je bewust niet bouwt

Titelvoorstellen (`FR-DOC-91`, `-92`) en de vervolgzin op basis van de reeks
(`FR-DOC-93` t/m `-96`) — die horen bij `StyleService` in sprint 3. Gespreksmodus.
De feedbacklus (`FeedbackService`). De gouden testset met netwerk.

## Klaar als

- [ ] Met een lege leerlingenlijst gebeurt er niets, en het scherm zegt waarom
- [ ] Het controlescherm toont de systeeminstructie, het stijlvoorbeeld en jouw tekst,
      met de namen al vervangen — precies zoals het verstuurd wordt
- [ ] Een vinkje uitzetten haalt dat blok aantoonbaar uit het verzoek
- [ ] Overnemen → ongedaan maken → herladen → de ongedaanmaking staat er nog
- [ ] Na drie keer Opnieuw is de knop uit
- [ ] Toetsen met de `FR-DOC-`nummers in de naam slagen
- [ ] **Je hebt met de verzonnen groep één hele documentatie geschreven en overgenomen**

## Val niet in deze kuil

**Een controlescherm dat een samenvatting toont.** Dan is het geen controle. Het moet de
letterlijke opdracht zijn, inclusief de systeeminstructie — anders klopt de belofte uit
§4 niet en merkt Karin dat in vijf minuten.

**Overnemen zonder ongedaan maken.** Autosave overschrijft de vorige versie direct; één
tik kan je tekst wissen. Dat is `T-07` en het is de reden dat die er staat.

**De knop actief laten bij een leeg veld.** Een AI-voorstel op nul tekens is een verzinsel,
en verzinsels zijn §3.8.
