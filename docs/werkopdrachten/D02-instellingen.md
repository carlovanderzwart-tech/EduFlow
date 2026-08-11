# D02 — Instellingen: leerlingen, groepen, reeksen

**Fase:** doorloop v0.1 · **Duur:** 1 dagdeel · **Blokkeert:** D03, D05

## Doel

De verzonnen groep van twintig staat in de app, met de drie groepen en de drie reeksen.

> Dit komt vóór documentatie en niet erna. Zonder leerlingenlijst doet de afscherming
> stilzwijgend niets, en dat is precies het scenario waar dit product tegen beschermt
> (review A7, FR-INS-18).

## Lees dit, en niet meer

- `docs/06-5-modules-instellingen.md` — §6.5, alleen leerlingen, groepen en reeksen
- `docs/A-testgegevens.md`
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-INS-01` | Leerlingen invoeren gaat met plakken |
| `FR-INS-02` | Dubbele voornamen worden gemeld, niet geweigerd |
| `FR-INS-04` | Uit dienst betekent lidmaatschap beëindigen, niet verwijderen |
| `FR-INS-06` | Een leerling heeft geen groep maar lidmaatschappen |
| `FR-INS-07` | Een leerling kan tegelijk in meerdere groepen zitten |
| `FR-INS-08` | Lidmaatschappen overlappen niet binnen dezelfde groep |
| `FR-INS-11` | Een reeks heeft naam, kleur en beschrijving |
| `FR-INS-12` | Een reeks verwijderen laat documentaties bestaan |
| `FR-INS-45` | Wijzigingen werken meteen door, zonder opslaanknop |

## Bestanden die je mag aanraken

```
src/services/settings/SettingsService.ts
src/modules/instellingen/{StudentList,GroupList,SeriesList}.tsx
src/app/(app)/instellingen/page.tsx
src/ui/{Button,Field,Card,ListRow,Chip}.tsx
```

## Wat je bouwt

1. **Leerlingen**: een tekstvlak waar je twintig namen in plakt, één per regel. Bij
   opslaan een melding als er dubbele voornamen zijn — met de tekst dat elk zijn eigen
   code krijgt, niet met een weigering (FR-INS-02, B-76).
2. **Groepen als lidmaatschappen met een looptijd** (FR-INS-06). Dit is het belangrijkste
   ontwerpbesluit van deze opdracht: een leerling heeft géén veld `groep`. Bouw je dat
   toch, dan werkt flow F-22 niet en kan Joost zijn zeven documentaties uit drie groepen
   nooit terugvinden.
3. **Reeksen**: naam (1–60 tekens), kleur uit de acht vaste `--palette-series-*`,
   optionele beschrijving.
4. Een knop **"Vul de verzonnen groep"** die `src/test/fixtures/testgegevens.ts` inlaadt.
   Deze knop blijft in de doorloop staan en gaat eruit vóór v1.0.

## Wat je bewust niet bouwt

CSV-import (`FR-INS-03`, sprint 1). Samenvoegen van dubbele leerlingen (`FR-INS-05`).
Het overzicht per kind over de jaren (`FR-INS-10`). Stijlprofiel, privacy-instellingen,
provider, back-up, opslag, toegangscode — allemaal later. Zoeken in instellingen.

## Klaar als

- [ ] Twintig namen plakken en ze staan er, met de melding over Noa B. en Noa V.
- [ ] Noa V. zit tegelijk in Groep 4 en in de Techniekclub, met verschillende looptijden
- [ ] Twee overlappende lidmaatschappen in dezelfde groep worden geweigerd (`FR-INS-08`)
- [ ] Een reeks verwijderen laat de documentaties staan (`FR-INS-12`)
- [ ] Toetsen met de `FR-`nummers in de naam slagen

## Val niet in deze kuil

**Een veld `groepId` op `Student`.** Het lijkt eenvoudiger en het is de reden dat de helft
van de leerlingadministraties niet met een projectgroep overweg kan. §9.4 en B-16 leggen
uit waarom lidmaatschap een eigen aggregaat is.

**Achternamen.** De lijst bevat alleen voornamen. Dat is geen vergetelheid maar
dataminimalisatie (§15.3).
