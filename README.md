# Werkopdrachten — de doorloop (v0.1)

Tien opdrachten. Elke opdracht is **één sessie met Claude Code, één commit, en eindigt
met iets dat je op het scherm ziet**. Een sessie die twee opdrachten doet, weet van geen
van beide meer precies wat er is afgesproken — begin een nieuwe sessie, niet een nieuwe
alinea.

Zie besluit B-82 in `docs/BESLUITEN.md` voor waarom de doorloop vóór de sprints komt.

## De volgorde

| # | Opdracht | Dagdelen | Blokkeert |
|---|---|---:|---|
| [D01](D01-storage.md) | `StorageService`, `BaseRecord` en het schema | 1 | alles |
| [D02](D02-instellingen.md) | Instellingen: leerlingen, groepen, reeksen | 1 | D03, D05 |
| [D03](D03-privacy.md) | `PrivacyService` met de volledige toetsset | 1½ | D04 |
| [D04](D04-ai-route.md) | `/api/ai`, `AIService`, `PromptService` | 1 | D06 |
| [D05](D05-schrijfmodus.md) | Schrijfmodus: velden, autosave, foto's | 2 | D06, D08 |
| [D06](D06-ai-meeschrijven.md) | Laat AI meeschrijven + het controlescherm | 1½ | — |
| [D07](D07-overzicht.md) | Overzicht met zoeken en filters | 1 | — |
| [D08](D08-export.md) | Export: één layout, deelbare afbeelding | 1½ | — |
| [D09a](D09a-agenda-weergaven.md) | Agenda: dag, week, maand, jaar + vakanties | 2 | D09b |
| [D09b](D09b-agenda-afspraken.md) | Herhalen, slepen, snelveld, meldingen, ICS | 2 | — |
| [D10](D10-mail.md) | Mail: opdracht in, mail uit | 1½ | — |
| [D11](D11-dashboard.md) | Dashboard (vier blokken) | ½ | — |

**Totaal ±18 dagdelen.** D01 t/m D04 zijn het fundament en moeten op volgorde. D05 t/m
D11 kunnen in principe in elke volgorde, maar de bovenstaande geeft het snelst iets om
te laten zien.

> **Bijgewerkt op 11 augustus 2026.** De agenda is uitgebreid tot een volwaardige agenda
> (B-85) en daarmee gesplitst in D09a en D09b: +2½ dagdeel. De mailmodule is kleiner
> geworden doordat de postbuskoppeling vervalt (B-84): −2 dagdelen, en het dashboard is
> een eigen halve opdracht geworden nu het blok Postvak weg is. Netto ±3 dagdelen erbij.

## Doorloop-DoD (B-83)

Drie punten, niet acht:

1. Het draait zonder fouten in de console.
2. De geautomatiseerde toetsen zijn groen, inclusief de toets die het `FR-`nummer in
   zijn naam heeft (DR-40).
3. De opdrachtgever heeft het één keer zelf gedaan met de verzonnen groep.

De acht punten uit §18.6 gelden vanaf v0.9. Eén punt daaruit geldt óók nu al, want het
is geen kwaliteitspoort maar een grens: **een nieuwe gegevensstroom staat in hoofdstuk 15
en is besproken met de functionaris gegevensbescherming vóór het eerste echte kind.**

## Wat in de doorloop bewust dun blijft

Dit is de tabel die de snelheid maakt. Alles hieronder komt terug in de sprint waar het
hoort; niets hiervan is geschrapt.

| Onderdeel | Doorloop | Komt terug in |
|---|---|---|
| ~~Mailkoppeling~~ | **Vervallen (B-84)** — er komt geen postbus | Fase 2, als een bestuur het aanvraagt |
| Meldingen | Alleen terwijl de app open is (B-86) | Blijft zo; de ICS-export naar je eigen agenda-app is de route naar echte herinneringen |
| Print-PDF | Browserprint, alleen Chrome op de laptop | Sprint 2 (`pdf-lib` + `pdf.js`, T-03) |
| Layouts | Eén: `A-fotoraster` | Sprint 2 (vijf, met overloopregels) |
| Foto's | Eén variant, geen bijsnijden | Sprint 1/2 (drie varianten, bijsnijden, draaien) |
| Gespreksmodus | Niet | Sprint 3 |
| Reeksen en stijlprofiel | Reeks als veld, geen vervolgzin | Sprint 3 (`StyleService`) |
| Back-up | Alleen exporteren | Sprint 1 (met terugzetten en samenvoegen) |
| Toegankelijkheid | Toetsenbordbediening waar hij gratis is | Sprint 6 (WCAG 2.2 AA met `axe-core`) |
| Snelheidseisen | Geen meting | Sprint 6 (`NFR-01` t/m `NFR-17`) |
| Telefoon | Werkt, maar niet mooi | Sprint 6 (plus "op het beginscherm zetten", B-02) |
| Archiveren en prullenbak | `deletedAt` wordt gezet, geen scherm | Sprint 2 |

## Wat je in de doorloop **niet** mag afzwakken

Later inbouwen is hier duurder dan nu bouwen, en bij de eerste twee is "later" te laat:

- `PrivacyService` met de harde poort bij een lege leerlingenlijst (DR-31, FR-INS-20).
- Het volledige controlescherm vóór elke AI-aanroep (FR-DOC-72, FR-DOC-73).
- Geen enkel beeldgegeven richting `/api/ai` (DR-32).
- IndexedDB als enige opslag voor persoonsgegevens (T-01, DR-33).
- `BaseRecord` op elke entiteit, met `rev`, `origin` en `schemaVersion` (DR-25) — ook al
  synchroniseert er nog niets. Dit er later in verbouwen raakt elk record dat er dan is.
