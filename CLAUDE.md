# EduFlow

AI-assistent voor pedagogische professionals. Documentaties, agenda, mail.
Het handboek in `docs/` is bindend. Wat daar niet in staat, wordt niet gebouwd (DR-01).

## Lees dit vóór je code schrijft

Lees **alleen** de hoofdstukken die bij je werkopdracht staan. Lees nooit
`docs/product-bible-volledig.md` — dat is de archiefkopie van 9.115 regels.

- `docs/20-ontwikkelregels.md` — DR-01 t/m DR-57. Altijd.
- `docs/19-besluitenregister.md` — bijna elke vreemde regel staat daar uitgelegd.
- `docs/02-productfilosofie.md` — de tien uitgangspunten en hun rangorde (B-52).
- `docs/README.md` — wegwijzer naar de rest.

## De vijf regels die je nooit overtreedt

1. Geen AI-aanroep zonder `PrivacyService.pseudonymise()` (DR-31). Geen uitzondering,
   ook niet voor een test met verzonnen namen.
2. Geen beeldgegeven naar `/api/ai` — niet als bestand, base64, naam of hash (DR-32).
3. Geen verzendrecht bij Microsoft of Google (DR-34, B-20).
4. Geen persoonsgegevens in `localStorage`, een URL, een logregel of een foutmelding (DR-33).
5. Geen code voor iets wat niet in het handboek staat (DR-01). Ontbreekt het: meld het,
   stel een besluit voor met een reden, bouw niet vooruit.

## Structuur

- `src/modules/` alleen schermen · `src/services/` alle regels · `src/domain/` typen en
  invarianten · `src/ui/` ontwerpsysteem · `src/lib/` gereedschap zonder domeinkennis.
- Importregels staan in `docs/10-service-architectuur.md` §10.2 en worden afgedwongen
  door `eslint.config.mjs`. Een overtreding faalt de bouwstraat (DR-11).
- Geen service importeert React, Next of iets uit `modules/` (DR-17).
- Alleen `services/storage/` raakt Dexie aan (DR-13).
- Alleen `AIService` roept `/api/ai` aan; alleen `MailService` roept `/api/mail` aan (DR-16).
- Nederlandse schermteksten, Engelse code. Nooit half (DR-51).
- Geen vaste kleuren, ruimtes, stralen of duren in componenten — alles uit
  `src/ui/tokens.css` (DR-55). Geen magische getallen (DR-54).
- Geen bestand boven 400 regels, geen functie boven 60 regels (DR-53).

## Werkwijze per sessie

1. Je krijgt één werkopdracht uit `docs/werkopdrachten/`. Lees hem helemaal.
2. Noem in je eerste antwoord welke `FR-`nummers je gaat raken en welke bestanden.
   Wacht op akkoord voordat je code schrijft.
3. Schrijf de toets vóór of tegelijk met de code, nooit erna (DR-40: elke `FR-`eis
   krijgt een toets die het nummer in de naam heeft).
4. Eindig met: wat je hebt gedaan, welke besluiten nieuw zijn, wat je bewust niet
   hebt gedaan. Laat geen `TODO` achter.

Loop je vast, meld dan precies drie dingen: welke eis je probeerde te halen, welke twee
mogelijkheden je zag, en welke informatie je mist om te kiezen.

## Commando's

```
pnpm dev · pnpm test · pnpm test:golden · pnpm lint · pnpm typecheck · pnpm e2e
```

Vóór opleveren draaien: typecontrole, lint, eenheidstoetsen, de gouden testset zonder
netwerk, en de schermtoetsen van de gebieden die je hebt geraakt. Een falende toets is
informatie — los hem nooit op door de toets te versoepelen (DR-45).

## Commit-boodschap

```
<gebied>: <wat er verandert in één zin>

Waarom: <de reden, of het besluitnummer>
Eis: FR-DOC-93
Toetsen: <wat er is toegevoegd of gewijzigd>
```

Gebieden: `doc`, `agenda`, `mail`, `dashboard`, `instellingen`, `services`, `ui`,
`domain`, `infra`, `docs`.

## Testgegevens

Groep 4 — De Regenboog, twintig verzonnen namen: `src/test/fixtures/testgegevens.ts`,
toegelicht in `docs/A-testgegevens.md`. Gebruik nooit de naam van een echt kind, ook
niet in een voorbeeld, een schermafbeelding of een commit-boodschap.

## Fase

Wij bouwen nu de **doorloop** (v0.1): alle modules dun, in plaats van één module diep.
Zie `docs/werkopdrachten/README.md`. De doorloop-DoD heeft drie punten, niet acht:
het draait zonder consolefouten, de toetsen zijn groen, en de opdrachtgever heeft het
één keer zelf gedaan met de verzonnen groep. De acht punten uit §18.6 gelden vanaf v0.9.
