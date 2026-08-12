# Besluiten sinds de Product Bible

> ## Laatst uitgegeven nummers: **B-116** · **T-46**
>
> **Lees deze regel vóór je een nummer uitgeeft, en werk hem bij zodra je er een uitgeeft.**
> Dit is de enige plek waar nieuwe nummers vandaan komen. Hoofdstuk 19 is gesloten (B-114).

Hoofdstuk 19 van het handboek bevat alle besluiten tot en met 7 augustus 2026 en is
daarmee historisch: er komt niets meer bij. Dit bestand is het vervolg — elke keuze die
daarna de documenten verandert, met datum en reden. Nieuwste bovenaan, nummering loopt
door op hoofdstuk 19.

---

# 12 augustus 2026 — tijdens het uitvoeren van D00

## T-45 — Base UI blijft; B-116 vervalt

**Probleem.** B-116 besloot "Radix blijft; er komt geen tweede componentbibliotheek",
met als vertrekpunt dat `components/ui/` negentien primitieven "gebouwd op Radix" bevat.
Dat vertrekpunt klopt niet. Gemeten op de code van D00 stap 2:

| | |
|---|---|
| `@base-ui/react` | geïmporteerd door **elf** bestanden in `ui/`, en staat in `package.json` |
| `@radix-ui/*` | **nul** bestanden, en staat **niet** in `package.json` |

De negentien primitieven hebben shadcn-vorm, maar de primitievenlaag eronder is Base UI.

**Besluit.** **Base UI blijft.** Er komt geen tweede bibliotheek en geen migratie. B-116
vervalt en wordt door dit besluit vervangen.

**Waarom.** Dit is dezelfde redenering als B-116, toegepast op de werkelijke code. B-116
zegt: *"De bewijslast ligt bij het wisselen, niet bij het houden. Negentien primitieven
omzetten is een week werk waarvan geen enkele eis in hoofdstuk 6 of 17 beter wordt."* Dat
argument is juist — het wees alleen de verkeerde kant op, omdat het uitging van een
bibliotheek die er niet staat. "Radix blijft" zou uitgevoerd wórden wat het wilde
voorkomen: een migratie van negentien componenten, midden in de doorloop, in dezelfde
bestanden die net verhuisd zijn.

Base UI komt bovendien van hetzelfde team als Radix en levert dezelfde toegankelijkheid
waar §11.6 om vraagt: focusopsluiting, `aria-modal`, afhandeling van Escape en het
herstellen van de focus.

**Gevolg.** `claude-design/BRIEF.md` krijgt de regel dat componenten op de bestaande
**Base UI**-primitieven gebouwd worden en niet vanaf nul — hetzelfde gevolg dat B-116
beoogde, met de juiste bibliotheek. Drie plaatsen in het handboek schrijven nog Radix
voor en spreken de code dus tegen: de afhankelijkhedentabel in §16.8, de zin "geen
componentbibliotheek buiten Radix" daaronder, en §11.6. Hoofdstuk 5 noemt Radix in vier
componentrijen. Die vier bestanden zijn hiermee **niet** gewijzigd; dat is redactiewerk aan
het handboek en hoort niet in een D00-commit. Het staat als openstaand punt hieronder.

**Herziening.** Zodra Base UI geen ondersteuning meer krijgt, of een tekort tegen WCAG 2.2
AA vertoont dat `axe-core` in de bouwstraat aantoont.

## T-46 — De importregel voor `app/providers/` en `app/(app)/_shell/`

**Probleem.** B-111 voegt `src/app/providers/` toe aan §10.2 en zet de schil in
`src/app/(app)/_shell/`, maar noemt geen importregel. Gevolg na D00 stap 4: vijf modules
importeren `useDienst` uit `@/app/providers/`, en die overgang valt in geen enkele zone van
`import/no-restricted-paths`. De lintregel laat hem door omdat hij er niet over gaat — niet
omdat hij is toegestaan. Dat is precies het gat waardoor `components/` en `hooks/` een week
lang onzichtbaar bleven.

**Besluit.** De importtabel van §10.2 krijgt twee rijen:

| Van | Mag importeren uit |
|---|---|
| `modules/` | `services/`, `domain/`, `ui/`, `lib/`, **`app/providers/`** |
| `app/` | alles |

`modules/` mag **alleen** uit `app/providers/` importeren en uit geen andere map onder
`app/` — een scherm haalt zijn diensten daar op en verder niets. `app/(app)/_shell/` is
van `app/` zelf; niemand daarbuiten importeert eruit. `ui/` mag nog steeds niets uit
`app/`, want dan zou het ontwerpsysteem raamwerkbewust worden en dat is juist de reden
achter B-111.

**Waarom `app/` alles mag.** `app/` is de buitenste laag: hij stelt de andere lagen samen
en niemand importeert eruit behalve via `providers/`. Een beperking daar zou niets
beschermen wat niet al door de andere rijen wordt beschermd.

**Gevolg.** §10.2 krijgt de twee mappen in zijn boom en de twee rijen in zijn tabel.
`eslint.config.mjs` krijgt de zones die het afdwingen, zodat de regel bewaakt wordt en niet
alleen afgesproken (DR-11).

---

# 11 augustus 2026 — vier keuzes uit de tweede D00-ronde

## B-114 — Eén register geeft nummers uit, en hoofdstuk 19 is gesloten

**Probleem.** Voor de derde keer in een week botsen besluitnummers. §19.2 loste dit op
7 augustus al een keer op, en het gebeurde opnieuw: de eerste versie van dit bestand gaf
`B-81` t/m `B-91` en `T-32` t/m `T-37` uit, terwijl hoofdstuk 19 tot en met `B-97` en
`T-38` loopt. Alle zeventien botsten.

**Besluit.** Drie dingen, en het derde is het enige dat het echt oplost.

1. **Hoofdstuk 19 is gesloten** per 7 augustus 2026. Het is de historische lijst. Er komt
   nooit meer een nummer bij.
2. **Dit bestand is de enige uitgifteplek.** De nummering loopt door: `B-103` en verder,
   `T-39` en verder. De genoemde nummers zijn hernummerd; er is niets aan de bestaande
   besluiten van vóór 8 augustus veranderd, want daar wordt in code, commits en toetsen
   naar verwezen (DR-57).
3. **Bovenaan dit bestand staat het laatst uitgegeven nummer.** Wie een nummer nodig heeft,
   leest die regel, neemt de volgende, en werkt de regel bij. Eén regel, één handeling.

**Waarom niet hernummeren of samenvoegen.** Hernummeren van bestaande besluiten breekt elke
verwijzing in commit-boodschappen, codecommentaar en toetsnamen — DR-57 vraagt juist om die
verwijzingen. Samenvoegen tot één bestand maakt een document van 300 besluiten dat niemand
meer opent. Een gesloten archief plus een lopend register is de kleinste oplossing die het
probleem echt wegneemt (U-05).

**Gevolg.** `B-81`→`B-103`, `B-82`→`B-104`, `B-83`→`B-105`, `B-84`→`B-106`, `B-85`→`B-107`,
`B-86`→`B-108`, `B-87`→`B-109`, `B-88`→`B-110`, `B-89`→`B-111`, `B-90`→`B-112`,
`B-91`→`B-113`. `T-32`→`T-39` tot en met `T-37`→`T-44`. Alle verwijzingen in `docs/` zijn
meegewijzigd.

## B-115 — De basisweek blijft, maar wordt geen tweede mechanisme

**Probleem.** De repo kent een basisweek: het vaste weekrooster van de groep. B-107 zet
daarnaast herhalende afspraken in de agenda. Twee mechanismen voor één probleem is precies
wat U-05 en DR-03 verbieden, maar de basisweek weggooien haalt het handigste stuk eruit —
je vult je gymles, je muziekles en je bouwvergadering één keer in en niet twintig keer.

**Besluit.** **De basisweek is een invoerscherm, geen tweede gegevensmodel.** Je vult er je
vaste week in, en de app maakt daar gewone herhalende agenda-items van. Daarna gedragen ze
zich als elk ander item: verplaatsbaar, te wijzigen met "alleen deze of alle volgende"
(`FR-AGE-15`), en ze gaan mee in de ICS-export.

**Waarom.** Eén mechanisme onder de motorkap, één snelle route erboven. Een basisweek die
zijn eigen records heeft, betekent dat elke functie — verplaatsen, exporteren, meldingen,
zoeken — twee keer gebouwd en twee keer getoetst moet worden, en dat de twee stilletjes uit
elkaar lopen.

**Gevolg.** De basisweek krijgt `FR-AGE-29` t/m `FR-AGE-31` (zie hieronder) en hoort bij
werkopdracht D09b, niet bij D09a. Bestaande code die een eigen basisweek-record schrijft,
wordt in D09b omgezet naar het genereren van herhalende items.

> **Als "basisweek" in jouw repo iets anders betekent dan het vaste weekrooster van de
> groep, zeg dat dan — dan herzie ik dit besluit.** De rest van de redenering blijft
> staan: één mechanisme, en het handige scherm erboven.

### Nieuwe eisen

**FR-AGE-29 — De basisweek is een invoerscherm.** *Gegeven* Instellingen → Agenda →
Basisweek, *wanneer* je een vast onderdeel invult met dag, tijd en naam, *dan* maakt de app
een wekelijks herhalend agenda-item voor de duur van het schooljaar.

**FR-AGE-30 — Een gegenereerd item is een gewoon item.** *Gegeven* een item uit de
basisweek, *dan* is het te verplaatsen, te wijzigen en te verwijderen zoals elk ander item,
met dezelfde vraag "alleen deze, of alle volgende?" (`FR-AGE-15`).

**FR-AGE-31 — De basisweek is zichtbaar als herkomst, niet als eigenaar.** *Gegeven* een
gegenereerd item, *dan* toont het detailvenster "uit je basisweek" als herkomst. Wijzig je
de basisweek daarna, *dan* raakt dat de reeds gewijzigde items niet.

## B-116 — Radix blijft; er komt geen tweede componentbibliotheek

> **Vervallen op 12 augustus 2026, vervangen door T-45.** Het probleem hieronder gaat uit
> van primitieven "gebouwd op Radix", en dat is niet wat er in de repo staat: elf bestanden
> importeren `@base-ui/react`, `@radix-ui/*` komt in nul bestanden voor en staat niet in
> `package.json`. Daardoor wees de conclusie de verkeerde kant op — "Radix blijft" zou een
> migratie van negentien componenten betekenen in plaats van die te voorkomen. De
> redenering blijft staan en leidt op de werkelijke code tot **Base UI blijft**; zie T-45.
> Blijft leesbaar volgens §19.1 regel 2.

**Probleem.** `components/ui/` bevat negentien primitieven in shadcn-vorm, gebouwd op
Radix. De vraag is of `ui/` daarop verder gaat of overstapt naar Base UI.

**Besluit.** **Radix blijft.** Er komt geen tweede bibliotheek en geen migratie.

**Waarom.** De bewijslast ligt bij het wisselen, niet bij het houden. DR-18 vraagt een
`T-`besluit met een reden voor een nieuwe afhankelijkheid, en "nieuwer" is geen reden.
Negentien primitieven omzetten is een week werk waarvan geen enkele eis in hoofdstuk 6 of
17 beter wordt, en het zou midden in de doorloop gebeuren, terwijl de mappen ook al
verhuizen. Twee verbouwingen tegelijk in dezelfde bestanden is hoe je een weekend verliest
zonder te weten waaraan.

**Gevolg.** `claude-design/BRIEF.md` krijgt de regel dat componenten op de bestaande
Radix-primitieven gebouwd worden en niet vanaf nul. Anders levert Claude Design straks een
bibliotheek die niet past op wat er al staat — en dan is het alsnog een migratie, maar dan
per ongeluk.

## Over de hergebruikte FR-nummers

Volgt uit B-115. Elk `FR-`nummer dat in de repo is verzonnen en niet in hoofdstuk 6 staat,
verhuist naar de vrije ruimte van zijn eigen module — voor de agenda is dat `FR-AGE-29` en
verder, want `FR-AGE-01` t/m `-28` zijn vergeven. Dezelfde regel als bij de besluiten:
**hoofdstuk 6 is de bron, en een nummer dat daar niet staat, bestaat niet.** Claude Code
levert de omzettabel als onderdeel van D09b.

---

# 11 augustus 2026 — naar aanleiding van de D00-inventarisatie (PR #36)

## T-42 — Getypte lintcontrole komt in sprint 6, niet nu

**Probleem.** De meegeleverde `eslint.config.mjs` zette `recommendedTypeChecked` aan en
liet `eslint-config-next` vallen. Gevolg: `pnpm lint` ging van exit 0 naar 48 fouten en 8
waarschuwingen. Die 48 zijn geen nieuwe fouten — het zijn bestaande plekken die een
strengere controle nu ziet. Ze repareren is een opschoonactie, en D00 verbiedt die
expliciet.

**Besluit.** `recommendedTypeChecked` wordt teruggezet naar `recommended`.
`eslint-config-next` komt terug. De regels die geen typeinformatie nodig hebben blijven
wél op `error`: `no-explicit-any` (DR-21), `ban-ts-comment` (DR-22), de zones van DR-11,
en `no-restricted-syntax` voor DR-32, DR-37 en DR-42. Getypte controle komt in sprint 6,
samen met NFR-47.

**Waarom.** Een codebase van 35 pull requests voor het eerst getypt linten is een eigen
project. Met 48 rode meldingen als vertrekpunt is "lint is groen" geen poort meer, en dan
is elke verplaatsing in D00 blind.

## T-43 — Drie ontbrekende afhankelijkheden vastleggen

**Probleem.** `@eslint/js`, `typescript-eslint` en `eslint-plugin-import` staan alleen in
`node_modules` en niet in `package.json`. Lint werkt bij toeval; `pnpm install
--frozen-lockfile` op een andere machine breekt.

**Besluit.** Alle drie als `devDependencies` vastleggen, plus
`eslint-import-resolver-typescript`. Dit is de `T-`goedkeuring die DR-18 vraagt.

## T-44 — `tokens.css` wordt ingelezen door `globals.css`

**Probleem.** `src/ui/tokens.css` heeft nul importeurs; `globals.css` draait actief met
eigen vaste waarden. Twee bronnen voor dezelfde waarden is fout 2 uit §20.6.

**Besluit.** `globals.css` begint met `@import "../ui/tokens.css";`. De vaste waarden erin
worden vervangen door tokens tijdens stap 2 van D00, wanneer `components/ui/` toch naar
`ui/` verhuist. Niet eerder, want dan is het een wijziging vermomd als verplaatsing.

## B-110 — `StorageWarning.tsx` wordt verwijderd

**Probleem.** Nul importeurs, en het enige echte laagconflict in de repo: het haalt
gegevens op uit `services/storage/` terwijl het in `ui/` thuishoort, waar dat niet mag.

**Besluit.** Verwijderen, in de stap waarin `components/common/` verhuist.

**Waarom.** Dood hout dat bovendien de enige blokkade voor stap 3 is. **Dit verwijdert de
eis niet:** `FR-INS-34` (waarschuwing bij 80% opslaggebruik) staat in sprint 6 en wordt
daar opnieuw gebouwd, dan wel goed — het scherm toont, de service meet.

## B-111 — De schil hoort bij `app/`, niet bij `ui/`

**Probleem.** `components/layout/` (AppShell, Sidebar, Topbar, BottomNav, navigatiedata)
importeert de navigatie van Next. §10.2 wijst geen plek aan. In `ui/` zetten maakt het
ontwerpsysteem raamwerkbewust.

**Besluit.** `src/app/(app)/_shell/`. Daarmee blijft `ui/` los te bekijken en te bouwen —
precies wat Claude Design nodig heeft om componenten te tonen zonder de app te starten.

**Aanvulling op §10.2:** er komt één map bij, `src/app/providers/`, voor React-context die
diensten in de boom hangt. Daar gaat `useDienst` heen. `services/` blijft daarmee vrij van
React (DR-17) en de composition root `services/diensten.ts` blijft waar hij is.
`useAutosave` gaat naar `modules/documentaties/hooks/`, zoals §10.2 al voorschrijft.

## B-112 — Eén plek voor testgegevens, samengevoegd in D01

**Probleem.** `domain/toetsgegevens.ts` (418 regels, 8 importeurs) en
`test/fixtures/testgegevens.ts` (228 regels, 0 importeurs) bevatten allebei testgegevens.
`domain/` is voor typen, schema's en invarianten — niet voor gegevens.

**Besluit.** De blijvende plek is `src/test/fixtures/`. **Bijlage A is normatief voor de
inhoud:** de twintig namen van Groep 4 — De Regenboog, de drie reeksen en de drie groepen
staan vast omdat elke naam een geval dekt dat `PrivacyService` moet aankunnen. Samenvoegen
gebeurt in D01, niet in D00 — daar worden de domeintypen toch aangeraakt. Tot die tijd komt
er geen nieuwe importeur bij op `domain/toetsgegevens.ts`.

## B-113 — De routewijziging gaat naar een eigen werkopdracht, ná D01

**Probleem.** Stap 6 van de inventarisatie (de `(app)`-groep en Nederlandse routenamen, 12
routes en ±18 padteksten) is de enige stap die zichtbaar kapot kan gaan. `DocumentEditor`
bouwt zijn pad op met een sjabloontekenreeks; geen zoek-en-vervang vindt die heel, en als
hij breekt maakt een tweede keer opslaan een tweede documentatie aan.

**Besluit.** Stap 6 wordt werkopdracht `D00b-routes.md` en gebeurt **ná D01**.

**Waarom.** Na D01 is `FR-DOC-01` ("een documentatie ontstaat bij de eerste inhoud")
afgedwongen in `DocumentationService` en niet meer in een scherm. Een verkeerd pad kan dan
hoogstens een navigatiefout geven en geen dubbel record. Dezelfde stap, hetzelfde werk,
maar het ergste gevolg is weg.

## Correctie op D00 stap 3 — de aanname klopte niet

D00 stap 3 voorspelde honderden laagmeldingen die je eerst op `warn` zou zetten. De teller
staat op nul: de veertien zones wijzen naar `./ui`, `./modules/documentaties` en
`./modules/instellingen`, en die mappen heten vandaag `components`, `documentation` en
`settings`. De regels grijpen dus nergens aan.

**De inventarisatie heeft gelijk en D00 stap 3 had ongelijk.** De zones blijven op
`error`. Verwacht dat het getal tijdens elke verplaatsing tijdelijk oploopt — dat is het
bewijs dat de zone eindelijk aangrijpt — en aan het eind van die stap weer op nul staat.
Stap 3 van D00 is hierop herschreven.

---

# 11 augustus 2026 — na de afwijzing van Microsoft 365

## B-106 — De mailmodule krijgt geen postbus

**Probleem.** De aanvraag voor beheerdersgoedkeuring op Microsoft 365 is afgewezen. §6.3
stond volledig op een gekoppelde postbus: lezen, samenvatten, een concept terugschrijven.
Zonder goedkeuring bestaat die module niet, en een tweede aanvraag lost niets op — het is
de organisatie die zegt dat een externe toepassing geen postbustoegang krijgt.

**Besluit.** De module Mail wordt herschreven tot wat hij zonder koppeling kan zijn: **je
geeft een opdracht in gewone taal, de AI levert een mail met onderwerp en tekst, jij
kopieert hem naar je eigen mailprogramma.** Geen postvak, geen OAuth, geen tokens, geen
adapters. Gmail vervalt in hetzelfde besluit: één mailroute of geen — twee adapters
onderhouden voor een module die in beide gevallen op dezelfde muur stuit, is werk zonder
uitkomst.

**Waarom.** Dit is de helft van §1.1.4 waar de app wél iets aan kan doen. Het terugvinden
en lezen van de mail waar je op antwoordt, kan Outlook prima; wat Outlook niet kan is de
toon kiezen, en dat was toch al het zware deel — twaalf tot twintig minuten per mail, en
het zwaarste deel is niet het typen.

**Gevolg.** §6.3 is herschreven. Elf eisen zijn ingetrokken (`FR-MAI-01`, `-03` t/m `-11`,
`-14`); zie de tabel in §6.3.7. `T-15` (tokenopslag) vervalt. `T-30` en `DR-42` blijven
staan: het schrappen van een controle vereist een besluit, en DR-42 is nu triviaal te
handhaven. Het blok *Postvak* verdwijnt uit het dashboard, dat daarmee vier blokken heeft.
De vijf AI-bewerkingen die door B-04 naar versie 1.1 waren geschoven, komen terug in 1.0
(`FR-MAI-36`) — de module is nu klein genoeg om ze te dragen.

**Wanneer dit terugkomt.** §13.6: bij meer dan tien gebruikers binnen één bestuur, met een
bestaande verwerkersovereenkomst, en met een ICT-coördinator die de goedkeuring namens de
organisatie aanvraagt in plaats van namens een leerkracht. Dat is fase 2.

## B-107 — De agenda wordt een volwaardige agenda

**Probleem.** §18.3 verdeelde de agenda over sprint 4 en liet dag- en weekweergave,
herhalingen, slepen en het snelveld daar staan. Met de agenda als volwaardig onderdeel van
het programma is een maandweergave zonder herhalingen geen agenda maar een overzicht.

**Besluit.** Alle vier de weergaven (dag, week, maand, jaar), herhalende afspraken, slepen
om te verplaatsen en de snelinvoer in gewone taal komen in de doorloop. De agenda moet
aanvoelen als de agenda-app die de gebruiker al kent.

**Waarom.** Een agenda die je naast je echte agenda moet gebruiken, gebruik je niet. Dat
is faalscenario drie uit §1.7.4 in zijn zuiverste vorm: een tweede plek om iets in te
vullen.

**Gevolg.** Werkopdracht D09 valt uiteen in D09a (weergaven en vakanties) en D09b
(afspraken, herhalen, verplaatsen, snelveld). De doorloop groeit van ±15 naar ±18
dagdelen. Sprint 4 uit §18.3 wordt daarmee grotendeels leeg en verschuift naar afwerken:
ICS, verjaardagen, en de koppelingen naar documentatie en mail.

## B-108 — Meldingen alleen terwijl de app open is

**Probleem.** "Misschien via het web meldingen kunnen geven?" Het antwoord is
ongemakkelijker dan het lijkt. De **Notification Triggers API** — de enige manier om een
melding lokaal in te plannen die afgaat terwijl de app dicht is — is door Chrome
definitief gestaakt; de reden die het Chrome-team zelf geeft, is dat een geannuleerde
afspraak niet betrouwbaar uit de wachtrij te halen was. **Web Push** werkt wel, ook op
iOS sinds 16.4 en alleen voor een webapp op het beginscherm — wat B-02 toch al eist —
maar loopt altijd via een pushdienst. Dat betekent een server die weet *wanneer* jouw
afspraak is.

**Besluit.** EduFlow toont meldingen via de Notification API, maar **alleen terwijl de app
in een tabblad open staat**, ook op de achtergrond. Er komt geen pushserver en dus geen
melding als de app dicht is. In Instellingen → Agenda staat dat er letterlijk bij, met de
verwijzing naar de ICS-export.

**Waarom.** De variant met een pushserver was verdedigbaar — een server die alleen een
tijdstip en een apparaat-abonnement bewaart en een melding zonder inhoud stuurt, leert
niets over een kind. Maar het is een derde server, een derde gegevensstroom, een extra
gesprek met de functionaris en een afhankelijkheid die kapot kan op een moment dat je het
niet merkt. Voor een eenmansproject in de doorloopfase weegt dat niet op tegen de winst,
zeker niet omdat er een betere route is die niets kost.

**Gevolg.** `FR-AGE-25` is herschreven, `FR-AGE-27` en `FR-AGE-28` zijn toegevoegd. De
eerlijke tekst in Instellingen is onderdeel van het besluit, niet een toelichting erop: een
gemiste herinnering waarvan je dacht dat hij zou komen, is erger dan een herinnering die je
nooit verwachtte.

**De route die wél werkt.** De ICS-export (`FR-AGE-20`) zet je schooljaar in de agenda-app
van je telefoon, en díé geeft meldingen — beter dan een webapp ooit gaat doen, en zonder
dat er iets naar een server gaat. `FR-AGE-27` maakt dat expliciet: na een wijziging toont
het agendascherm hoeveel items er zijn veranderd en biedt een nieuwe export aan. De
stabiele `UID` uit `FR-AGE-20` zorgt dat de tweede import geen dubbelen maakt.
**EduFlow bezit het schooljaar; de telefoon doet het klokwerk.**

## B-109 — Het plakveld voor een ontvangen mail, met verplichte detectoren

**Probleem.** Zonder postbus zal de leerkracht die op een oudermail wil antwoorden, die
mail ergens in de app plakken. §1.4.4 wijst een chatbot af met precies dit argument: *een
leeg invoerveld nodigt uit tot plakken, en wat er geplakt wordt is een oudermail met een
achternaam, een telefoonnummer en de naam van een behandelaar.*

**Besluit.** Er komt een apart veld **"De mail waarop je antwoordt"**, met de detectoren
uit `FR-MAI-24` die dráíen zodra je plakt — vóór de knop, vóór de aanroep, vóór het
controlescherm — en die tonen wat ze hebben gevonden. Het controlescherm blijft hier niet
over te slaan (`FR-MAI-12`). Het plakveld wordt niet opgeslagen (`FR-MAI-35`).

**Waarom.** De keuze is niet óf het gebeurt, maar of het gebeurt in een veld dat erop
voorbereid is of in een veld dat er niets mee doet. Een bekend risico met een vangnet is
beter dan hetzelfde risico verstopt in een opdrachtveld.

**Gevolg.** `FR-MAI-33` t/m `FR-MAI-35` toegevoegd. `services/privacy/detectors.ts` komt in
de doorloop en niet in sprint 5. In het gesprek met de functionaris is dit één regel:
*"wij lezen geen postbus; wij hebben één veld waar de gebruiker zelf een mail in kan
plakken, en dit is wat daar gebeurt."*

## T-41 — De mailadapters vervallen, de servicevorm blijft

**Besluit.** `services/mail/adapters/` vervalt; `MailService` houdt zijn plek in de
lagenstructuur maar heeft geen poort meer naar buiten. De nepmap uit werkopdracht D10 is
niet meer nodig en `src/data/nepmap.json` komt er niet.

**Waarom.** De service blijft bestaan omdat de regels (sjablonen, concepten, de
detectoren aanroepen, het controlepad) ergens moeten wonen en niet in een scherm horen
(DR-15). Alleen de buitenkant valt weg.

---

# 11 augustus 2026 — de doorloop

## B-103 — De nulmeting blokkeert de bouw niet

**Probleem.** §1.6.1 zegt: *"Pas als die twaalf metingen compleet zijn, begint sprint 1"* —
en de nulmeting loopt van 24 augustus tot en met 18 september 2026. §18.2 zet sprint 1 op
11 augustus tot 14 september. Die twee kunnen niet allebei waar zijn, en de strengste
lezing kost vijf weken bouwtijd.

**Besluit.** De bouw start op 11 augustus. De nulmeting loopt van 24 augustus tot 18
september volgens hetzelfde protocol, maar hij meet de *huidige* werkwijze en heeft de
app dus niet nodig. Voorwaarde: de twaalf gemeten documentaties worden op de oude manier
gemaakt, niet in EduFlow, ook niet gedeeltelijk.

**Waarom.** De nulmeting bestaat om de belofte breekbaar te maken. Dat doel wordt gehaald
zolang de twaalf metingen zuiver zijn; het wordt niet beter door er ook nog de bouw op te
laten wachten. Wachten kost daarentegen wél de enige meetperiode van dit schooljaar
(§1.8.1) en schuift het gesprek met de functionaris gegevensbescherming van september
naar december.

**Gevolg.** §1.6.1 wordt aangepast: "Pas als die twaalf metingen compleet zijn, begint
sprint 1" vervalt en wordt "De twaalf metingen worden op de oude manier gemaakt, ook als
de bouw al is begonnen." §18.2 blijft ongewijzigd.

## B-104 — Een doorloop vóór de sprints

**Probleem.** De sprintvolgorde uit §18.3 bouwt module voor module diep uit. Het product
als geheel is daarmee pas in sprint 6 (april 2027) voor het eerst te zien of te tonen.
Twee dingen breken daarop: de motivatie van een eenmansproject, en §1.5.5, dat Karins
moment op *één middag in september 2026* zet — met een werkende app op het scherm.

**Besluit.** Vóór sprint 1 komt een **doorloop** (v0.1): alle vijf de modules dun maar
echt werkend, in tien werkopdrachten. Daarna gaan de sprints uit §18.3 door in dezelfde
volgorde, maar op een fundament dat al is gezien.

**Waarom.** De architectuur uit hoofdstuk 10 blijkt pas te kloppen als er vijf modules op
staan; dat in sprint 5 ontdekken is duur. En het FG-gesprek verschuift van december naar
september, wat de poort met drie maanden vervroegt.

**Gevolg.** §18.2 krijgt een fase vóór sprint 1. De werkopdrachten staan in
`docs/werkopdrachten/`. Wat in de doorloop bewust dun blijft, staat in werkopdracht
`README.md` en komt terug in de sprint waar het hoort.

## B-105 — Twee Definitions of Done

**Probleem.** De acht punten uit §18.6 bevatten een zelfreview van minstens 24 uur later
(B-80) en één werkdag echt gebruiken. Toegepast op elke stap van de doorloop kost elke
werkopdracht minimaal twee kalenderdagen, ongeacht zijn omvang.

**Besluit.** De doorloop kent een eigen Definition of Done met drie punten: het draait
zonder fouten in de console, de geautomatiseerde toetsen zijn groen, en de opdrachtgever
heeft het één keer zelf gedaan met de verzonnen groep. De acht punten uit §18.6 gelden
onverkort vanaf v0.9 en zijn hoe dan ook verplicht vóór het eerste echte kind.

**Waarom.** De acht punten zijn niet te streng, ze zijn te streng voor deze fase. Punt 5
(nieuwe gegevensstroom besproken met de functionaris) blijft ook in de doorloop gelden,
want dat is geen kwaliteitspoort maar een grens.

## T-39 — De hoofdstukken zijn de bron, de monoliet is de archiefkopie

**Besluit.** Het handboek staat als losse hoofdstukken in `docs/`. `product-bible-volledig.md`
blijft bestaan voor menselijke lezers en voor de functionaris gegevensbescherming, maar
wordt tijdens een fase niet bijgewerkt; hij wordt aan het eind van elke fase opnieuw
samengesteld.

**Waarom.** Een AI-programmeur die 9.115 regels moet doorzoeken, leest in de praktijk een
willekeurige selectie. Verwijzen naar één hoofdstuk van 300 regels is het verschil tussen
raden en lezen.

**Gevolg.** DR-01 blijft gelden op hoofdstukniveau. `CLAUDE.md` verbiedt expliciet het
lezen van de monoliet.

## T-40 — De ontwerptekens komen vóór de componenten

**Besluit.** `src/ui/tokens.css` wordt in week 0 volledig ingevuld uit §5.3 t/m §5.6 —
alle kleuren, ruimtes, letters, stralen, schaduwen, maten, lagen en duren, licht en
donker. Componenten worden pas daarna gebouwd, en uitsluitend met tokens (DR-55).

**Waarom.** Vaste waarden die eenmaal in twintig componenten staan, komen er niet meer uit.
De donkere modus uit §18.4 is dan een tweede verbouwing in plaats van één regel.

---

# Openstaand

> **Nummering gecorrigeerd op 11 augustus 2026.** Dit blok gebruikte eerst `O-01` t/m
> `O-04` opnieuw, terwijl §19.5 die nummers al vergeven heeft aan `O-01` t/m `O-07`. Dat
> is precies de botsing die §19.2 op 7 augustus heeft opgeruimd, en hij was hier per
> ongeluk teruggezet. Hieronder gelden de nummers uit §19.5; alleen wat écht nieuw is,
> krijgt een nieuw nummer vanaf `O-08`.

- **O-01 — Stijlvoorbeelden** *(§19.5, ongewijzigd)*. Drie of vier paren van een ruwe
  notitie, de gewenste documentatie en een doorgeschoten versie, met verzonnen namen
  (§12.9, FR-INS-16). **Dit is de enige openstaande post die alleen de opdrachtgever kan
  invullen, en zonder deze voorbeelden is de Definition of Done op het punt AI-kwaliteit
  niet in te vullen.**
- **O-03 — Gesprek functionaris gegevensbescherming** *(§19.5)*. Door B-104 verschuift het
  moment van december naar september 2026: zodra de doorloop staat, niet later
  (§1.5.5, §15.6).
- **O-05 — Nulmeting** *(§19.5)*. Twaalf documentaties handmatig geklokt, 24 augustus tot
  18 september 2026. Door B-103 blokkeert dit de bouw niet meer.
- **O-06 — Vakantiebestand vullen** *(§19.5)*. Drie regio's, met versienummer en
  `validUntil` (§13.4). §19.5 zegt "vóór sprint 4"; door B-107 is dat vervroegd naar
  **vóór werkopdracht D09a**. De schooljaren 2026-2027 en 2027-2028 volstaan voor nu.
- ~~**O-08 — Beheerdersgoedkeuring Microsoft 365.**~~ **Afgesloten op 11 augustus 2026:
  afgewezen.** Zie B-106. Dit staat er doorgestreept en niet verwijderd, omdat een
  openstaand punt dat verdwijnt zonder uitkomst er over een jaar uitziet als vergeten werk.
- **O-09 — De bestaande repository naar §10.2.** De repository is 35 pull requests diep;
  de opzet-opdracht in `SETUP.md` ging uit van een leeg project. Zie werkopdracht
  `D00-bestaande-repo.md`, die die opdracht vervangt.
- **O-10 — Vier hoofdstukken schrijven nog Radix voor.** Volgt uit T-45. Het handboek
  spreekt de code tegen op vier plaatsen: de afhankelijkhedentabel in §16.8, de zin "geen
  componentbibliotheek buiten Radix" daaronder, §11.6 ("panelen en dialoogvensters komen
  uit Radix"), en vier componentrijen in hoofdstuk 5 die Radix Select, Switch, Checkbox,
  Tabs en Dialog noemen. Dezelfde tabel in §16.8 schrijft bovendien `zustand`, `pdf-lib`
  en `pdfjs-dist` voor, die geen van drieën in `package.json` staan, en noemt
  `@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`,
  `class-variance-authority`, `sonner` en `tw-animate-css` niet, die er wel in staan.
  Nodig: één redactieronde over die vier bestanden, met §16.8 gelijkgetrokken aan
  `package.json`. Dat is schrijfwerk aan het handboek en hoort niet in een D00-commit.
  **Vóór `claude-design/BRIEF.md` wordt geschreven**, want anders bouwt Claude Design op
  de verkeerde primitieven.
