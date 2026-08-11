<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 20. Ontwikkelregels voor AI-programmeurs

Dit hoofdstuk is geschreven voor Claude Code en voor elke andere programmeur, mens of model, die code toevoegt aan EduFlow. Het is bindend. Waar een regel botst met een gewoonte uit een ander project, wint deze regel.

### 20.1 Lees dit eerst

Voor je één regel code schrijft:

1. **Zoek de eis.** Elke wijziging hoort bij een `FR-`nummer uit hoofdstuk 6, een `NFR-`nummer uit hoofdstuk 17, of een `B-`/`T-`nummer uit hoofdstuk 19. Vind je die niet, dan is de wijziging niet besloten en schrijf je geen code (DR-01).
2. **Lees het besluit erachter.** Bijna elke merkwaardige regel in dit product heeft een reden die in hoofdstuk 19 staat. Wie de reden niet kent, bouwt hem er per ongeluk uit.
3. **Controleer de laag.** Hoort dit in een scherm, een service of het domein? Zie §10.2.

### 20.2 De regels

#### Grondregels

| ID | Regel |
|---|---|
| DR-01 | Schrijf geen code voor iets wat niet in dit handboek staat. Ontbreekt het, meld dat en stel een besluit voor; bouw niet vooruit. |
| DR-02 | Bij twijfel tussen twee oplossingen kies je de kleinste die de eis haalt (U-05). |
| DR-03 | Voeg nooit een functie toe "omdat het toch makkelijk is". Elke functie kost onderhoud, uitleg, testwerk en privacyverantwoording (B-54). |
| DR-04 | Verwijder geen bestaande controle, waarschuwing of grens zonder een besluit met nummer. |
| DR-05 | Raad nooit naar de bedoeling van een eis. Staat er iets dubbelzinnigs, meld dat met de sectieverwijzing. |

#### Lagen en afhankelijkheden

| ID | Regel |
|---|---|
| DR-11 | Houd je aan de importtabel in §10.2. Een overtreding faalt de bouwstraat. |
| DR-12 | Elke service moet te toetsen zijn zonder browser, netwerk of scherm. Heeft je service `window`, `document` of `fetch` nodig voor een regel, dan zit de regel op de verkeerde plek. |
| DR-13 | Niemand buiten `services/storage/` importeert Dexie of raakt `db` aan. Ook geen enkel scherm, ook niet "even snel". |
| DR-14 | Niemand buiten `PageService` schrijft aan `Documentation.pageIds` of `Page.documentationId`. |
| DR-15 | Schermen bevatten geen bedrijfsregel. Een `if` over zichtbaarheid mag; een `if` over geldigheid, status of privacy niet. |
| DR-16 | Alleen `AIService` roept `/api/ai` aan. Alleen `MailService` roept `/api/mail` aan. |
| DR-17 | Geen enkele service importeert React, Next of iets uit `modules/`. |
| DR-18 | Nieuwe afhankelijkheden komen er alleen met een `T-`besluit in hoofdstuk 19. |

#### Typen en validatie

| ID | Regel |
|---|---|
| DR-21 | Geen `any`. Geen `as` behalve bij een echt onvermijdelijke grens, met een regel toelichting. |
| DR-22 | Geen `@ts-ignore` of `@ts-expect-error` zonder toelichting op de regel erboven. |
| DR-23 | Elk record dat de opslag in of uit gaat, gaat door zijn Zod-schema. Ook bij lezen: een database van een half jaar oud kan gegevens bevatten die je typen niet meer beschrijven. |
| DR-24 | Elk verzoek dat de server binnenkomt, gaat door een Zod-schema met `strict`. Onbekende velden worden geweigerd, niet genegeerd. |
| DR-25 | Elke nieuwe entiteit erft van `BaseRecord` en vult `rev`, `origin` en `schemaVersion` (T-11). Ook als er nog niets synchroniseert. |
| DR-26 | Verwijderen is `deletedAt` zetten. Er staat nergens een `delete` op een record, behalve in de opruimronde. |
| DR-27 | Elk schema krijgt een migratie zodra het in gebruik is, met een omkering in woorden beschreven (§8.6). |

#### Privacy en veiligheid

| ID | Regel |
|---|---|
| DR-31 | Er vertrekt geen AI-aanroep die niet door `PrivacyService.pseudonymise()` is gegaan. Er is geen uitzondering, ook niet voor een test met verzonnen namen. |
| DR-32 | Er gaat nooit een beeldgegeven naar `/api/ai`. Niet als bestand, niet als base64, niet als naam, niet als hash. |
| DR-33 | Persoonsgegevens gaan nooit naar `localStorage`, `sessionStorage` (behalve de herstelversie uit §11.7), een URL, een logregel of een foutmelding. |
| DR-34 | Vraag nooit een nieuw recht aan bij Microsoft of Google zonder een besluit. Verzendrechten zijn verboden (B-20). |
| DR-35 | Voeg nooit een script van een derde partij toe. Geen analyse, geen lettertype van een netwerk, geen widget. |
| DR-36 | Geheimen komen uitsluitend uit de omgeving. Een sleutel in de broncode faalt de bouwstraat. |
| DR-37 | Gebruik nooit `dangerouslySetInnerHTML`. HTML uit mail wordt ontdaan van opmaak vóór weergave. |

#### Kwaliteit

| ID | Regel |
|---|---|
| DR-38 | Elk scherm dat je toevoegt of wijzigt, doorstaat `axe-core` op niveau AA. |
| DR-39 | Blijf binnen de bundelgrenzen uit §11.8. Zwaar gereedschap wordt lui geladen. |
| DR-40 | Elke `FR-`eis krijgt minstens één toets die naar dat nummer verwijst in de naam (NFR-48). |
| DR-41 | Wijzig je `PrivacyService`, `PromptService` of `LayoutService`, dan draai je hun volledige toetsset vóór je oplevert. |
| DR-42 | Verwijs nergens naar een verzendeindpunt. De bouwstraat zoekt op `sendMail` en `messages/send`. |
| DR-43 | Elke fout die een gebruiker kan zien, heeft een Nederlandse tekst die zegt wat er aan de hand is en wat de volgende stap is (§4.7). |
| DR-44 | Geef nooit een `Documentation`, `Student`, `Page`, `Block`, `MailMessage` of `MailDraft` als geheel aan een logfunctie. |
| DR-45 | Los een fout niet op door een toets te versoepelen. Faalt een toets, dan is dat informatie. |

#### Vorm

| ID | Regel |
|---|---|
| DR-51 | Nederlandse schermteksten, Engelse code (§9.9 en §20.2). Nooit half. |
| DR-52 | Namen uit §5.1 en §5.2 zijn bindend. Verzin geen `DocService` naast `DocumentationService`. |
| DR-53 | Geen bestand boven 400 regels, geen functie boven 60 regels (NFR-44). |
| DR-54 | Geen magische getallen. Een drempel, een grens of een duur staat als benoemde constante, met een verwijzing naar de eis. |
| DR-55 | Geen vaste waarden in componenten: kleuren, ruimtes, straal en duur komen uit de tokens (§5.6). |
| DR-56 | Commentaar legt uit *waarom*, niet *wat*. Een regel die uitlegt wat de code doet, is een regel die de code niet duidelijk genoeg maakt. |
| DR-57 | Bij een merkwaardige keuze zet je het besluitnummer erbij: `// B-70: meer dan zeven dagen vooruit is bijna altijd een typefout`. |

### 20.3 Commits en oplevering

Eén commit per samenhangende wijziging. De boodschap:

```
<gebied>: <wat er verandert in één zin>

Waarom: <de reden, of het besluitnummer>
Eis: FR-DOC-93
Toetsen: <wat er is toegevoegd of gewijzigd>
```

Gebieden: `doc`, `agenda`, `mail`, `dashboard`, `instellingen`, `services`, `ui`, `domain`, `infra`, `docs`.

Vóór opleveren draai je: typecontrole, lint, eenheidstoetsen, de gouden testset zonder netwerk, en de schermtoetsen van de gebieden die je hebt geraakt. Alles moet slagen. Dat is DR-45 in de praktijk.

### 20.4 Werken met dit handboek als AI-programmeur

Deze paragraaf is specifiek voor een model dat aan dit project werkt.

**Wat je wel doet.**

- Je leest de betrokken hoofdstukken vóór je begint, niet tijdens.
- Je noemt in je eerste antwoord welke eisnummers je gaat raken. Klopt dat niet, dan corrigeert de opdrachtgever je voordat er code is.
- Je stelt één vraag tegelijk als iets ontbreekt, en je stelt er een besluit bij voor met een reden. Dat is sneller dan een open vraag.
- Je schrijft de toets vóór of tegelijk met de code, nooit erna als sluitpost.
- Je meldt aan het eind wat je hebt gedaan, welke besluiten nieuw zijn, en wat je bewust niet hebt gedaan.

**Wat je niet doet.**

- Je verzint geen functionaliteit die niet in dit handboek staat, ook niet als hij voor de hand ligt (DR-01).
- Je "verbetert" geen bestaande keuze zonder de reden ervan te kennen. Bijna elke vreemde regel hier is een besluit uit hoofdstuk 19.
- Je vervangt geen bestaande afhankelijkheid door een alternatief dat je beter kent.
- Je genereert geen voorbeeldgegevens met echte namen. Gebruik de groep uit bijlage A.
- Je laat geen `TODO` achter. Wat niet af is, is niet opgeleverd; wat besloten moet worden, gaat naar hoofdstuk 19.
- Je verzwakt geen privacycontrole om een test te laten slagen. Dat is de enige regel in dit hoofdstuk waarvan overtreding het project schaadt op een manier die je niet meer terugdraait.

**Als je vastloopt.** Meld precies drie dingen: welke eis je probeerde te halen, welke twee mogelijkheden je zag, en welke informatie je mist om te kiezen. Dat is genoeg om je in één antwoord verder te helpen.

### 20.5 Het `CLAUDE.md`-bestand

In de wortel van het project staat een kort bestand dat bij elke sessie meekomt. Het herhaalt dit hoofdstuk niet maar wijst ernaar.

```markdown
# EduFlow

AI-assistent voor pedagogische professionals. Documentaties, agenda, mail.
Volledige specificatie: `docs/06 - Product Bible.md`. Dat document is bindend.

## Lees dit vóór je code schrijft
- Hoofdstuk 2: de tien uitgangspunten, met de rangorde uit B-52
- Hoofdstuk 20: de ontwikkelregels (DR-01 t/m DR-57)
- Hoofdstuk 19: het besluitenregister — bijna elke vreemde regel staat daar uitgelegd

## De vijf regels die je nooit overtreedt
1. Geen AI-aanroep zonder PrivacyService (DR-31)
2. Geen beeldgegeven naar /api/ai (DR-32)
3. Geen verzendrecht bij Microsoft of Google (DR-34, B-20)
4. Geen persoonsgegevens in localStorage, een URL of een logregel (DR-33)
5. Geen code voor iets wat niet in het handboek staat (DR-01)

## Structuur
- `modules/` alleen schermen · `services/` alle regels · `domain/` typen en invarianten
- Importregels: hoofdstuk 10.2. Overtreding faalt de bouwstraat.
- Nederlandse schermtaal, Engelse code.

## Commando's
pnpm dev · pnpm test · pnpm test:golden · pnpm lint · pnpm typecheck · pnpm e2e

## Testgegevens
Groep 4 - De Regenboog, twintig verzonnen namen: zie hoofdstuk 13 van het handboek.
Gebruik nooit namen van echte kinderen, ook niet in een voorbeeld.
```

### 20.6 De vijf fouten die dit project het meest zouden schaden

Ter afsluiting, en met opzet als laatste woord van dit handboek: dit zijn de vijf manieren waarop deze code stuk gaat op een manier die je niet meer repareert.

1. **Een AI-aanroep die `PrivacyService` overslaat.** De tekst is weg en komt niet terug. Elke nieuwe route naar de AI begint met de vraag of hij door de poort gaat.
2. **Een tweede plek waar een regel staat.** Een statusberekening in een scherm, een layout in de renderer, een zinslengte in twee bestanden. Ze lopen uit elkaar en niemand merkt wanneer.
3. **Een `delete` op een record.** Bij de eerste synchronisatie in fase 2 keert het terug vanaf de server, en dan weet niemand meer waarom.
4. **Een functie die er "even bij" komt.** Hij vraagt uitleg, hij vraagt onderhoud, hij vraagt een privacyparagraaf, en over een jaar is het product een tweede administratielast. Dat is scenario drie uit §1.7.
5. **Een versoepelde toets.** Een gouden testgeval dat te streng leek en wat losser is gezet, is de dag waarop niemand meer weet of de AI nog schrijft zoals de gebruiker schrijft.

Alles in dit handboek is uiteindelijk bedoeld om die vijf te voorkomen.

---
