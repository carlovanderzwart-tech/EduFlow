<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

# Hoofdstuk 6.5 — Instellingen

### 6.5 Instellingen

Instellingen zijn dienend, maar ze komen als eerste (A7 uit de review). Zonder leerlingenlijst werkt de afscherming niet, zonder stijlvoorbeeld weet de AI niet hoe jij schrijft, zonder groep kun je niets koppelen.

#### 6.5.1 Leerlingen

| Veld | Type | Verplicht | Validatie |
|---|---|---|---|
| `firstName` | tekst | ja | 1-40 tekens, geen cijfers |
| `lastNameInitial` | tekst | nee | 1-3 tekens |
| `birthDate` | datum of dag-maand | nee | niet in de toekomst |
| `note` | tekst | nee | ≤ 500 tekens, nooit naar AI |

**FR-INS-01 — Leerlingen invoeren gaat met plakken.**
*Gegeven* het veld "Plak een lijst", *wanneer* je twintig namen plakt gescheiden door regeleinden, komma's of tabs, *dan* toont de app ze als bewerkbare regels met een teller, en maakt zij ze pas aan na "Voeg 20 leerlingen toe".

**FR-INS-02 — Dubbele voornamen worden gemeld, niet geweigerd.**
*Gegeven* twee leerlingen met de naam Noa, *wanneer* je de tweede toevoegt, *dan* verschijnt "Er is al een Noa. Zet er een achternaam-initiaal bij, anders kan de app ze niet uit elkaar houden in teksten." met een invulveld ernaast. Je mag weigeren; dan krijgen beiden bij afscherming een eigen code en toont het controlescherm dat expliciet.

**FR-INS-03 — CSV-import herkent de kolommen.**
*Gegeven* een CSV met een kopregel, *wanneer* je hem importeert, *dan* raadt de app de kolommen op basis van de kopnamen en laat je ze bevestigen. Ongebruikte kolommen worden niet ingelezen.

**FR-INS-04 — Uit dienst betekent lidmaatschap beëindigen.**
*Gegeven* een leerling die van school gaat, *wanneer* je "Uit dienst" kiest met een datum, *dan* krijgen alle lopende lidmaatschappen die einddatum en verdwijnt de leerling uit de keuzelijsten, maar blijven alle documentaties waar hij in voorkomt ongewijzigd.

**FR-INS-05 — Samenvoegen bestaat voor dubbel ingevoerde leerlingen.**
*Gegeven* twee records voor hetzelfde kind, *wanneer* je ze samenvoegt, *dan* kies je welk record blijft, worden lidmaatschappen samengevoegd, en worden alle verwijzingen in documentaties, citaten, agenda-items en mailconcepten omgezet. De handeling staat in het logboek en is niet ongedaan te maken; de app zegt dat vooraf.

#### 6.5.2 Groepen en lidmaatschappen

**FR-INS-06 — Een leerling heeft geen groep maar lidmaatschappen.**
*Gegeven* het scherm van een leerling, *wanneer* je het opent, *dan* zie je een lijst "Zit in" met per regel de groep, het type, en de periode. Er is geen enkel veld waarin één groep staat. Volgt uit U-07 en B-16.

**FR-INS-07 — Een leerling kan tegelijk in meerdere groepen zitten.**
*Gegeven* Kjeld in stamgroep Groep 4 en in projectgroep Techniekclub, *wanneer* je beide lidmaatschappen bekijkt, *dan* lopen ze gelijktijdig en is geen van beide de hoofdgroep. Er bestaat geen hoofdgroep.

**FR-INS-08 — Lidmaatschappen overlappen niet binnen dezelfde groep.**
*Gegeven* een lopend lidmaatschap van Aya in Groep 4, *wanneer* je een tweede lidmaatschap van Aya in Groep 4 aanmaakt met een overlappende periode, *dan* blokkeert de app dat en stelt zij voor het bestaande lidmaatschap te verlengen. Zie INV-04 in hoofdstuk 9.

**FR-INS-09 — De jaarovergang sluit af en opent opnieuw.**
*Gegeven* het einde van een schooljaar, *wanneer* je "Nieuw schooljaar" kiest, *dan* toont de app per groep wat er gebeurt: lidmaatschappen krijgen een einddatum op de laatste schooldag, je kiest welke leerlingen meegaan naar welke nieuwe groep, en er worden nieuwe lidmaatschappen aangemaakt met de eerste schooldag als begin. Niets wordt verwijderd.

**FR-INS-10 — Het overzicht per kind toont alle groepen over de jaren.**
*Gegeven* een leerling die drie jaar op school zit, *wanneer* je zijn scherm opent, *dan* staat er een tijdlijn met alle groepen en periodes. Dit is wat een intern begeleider nodig heeft (persona Joost).

#### 6.5.3 Reeksen

**FR-INS-11 — Een reeks heeft een naam, een kleur en een beschrijving.**
*Gegeven* het reeksenscherm, *wanneer* je een reeks aanmaakt, *dan* kies je een naam (1-60 tekens), een kleur uit acht vaste kleuren, en optioneel een beschrijving die als context meegaat naar de AI bij de vervolgzin (B-04).

**FR-INS-12 — Een reeks verwijderen laat documentaties bestaan.**
*Gegeven* een reeks met vier documentaties, *wanneer* je hem verwijdert, *dan* verliezen de vier hun reeksverwijzing en blijven ze verder ongewijzigd. De app zegt vooraf hoeveel documentaties het betreft.

#### 6.5.4 Schrijfstijl

Dit scherm maakt B-23 waar: wat de app over jouw schrijven geleerd heeft, kun je lezen.

**FR-INS-13 — Het stijlprofiel is leesbaar.**
*Gegeven* Instellingen → Schrijfstijl, *wanneer* je het opent, *dan* zie je in gewone taal wat er gemeten is: "Je zinnen zijn gemiddeld 14 woorden. Je schrijft in de tegenwoordige tijd. Je gebruikt bijna altijd minstens één citaat. Je vermijdt: prachtig, geweldig, enorm trots."

**FR-INS-14 — Elk kenmerk is te overschrijven.**
*Gegeven* een gemeten kenmerk, *wanneer* je het aanpast, *dan* geldt jouw waarde en stopt de app met meten op dat kenmerk, met de aantekening "handmatig ingesteld" en een knop "Weer laten meten".

**FR-INS-15 — Het profiel is te wissen.**
*Gegeven* de knop "Begin opnieuw", *wanneer* je die gebruikt, *dan* worden alle gemeten kenmerken, correctieregels en voorbeeldselecties verwijderd. Je stijlvoorbeelden blijven, want die heb je zelf gemaakt.

**FR-INS-16 — Stijlvoorbeelden bestaan uit drie delen.**
*Gegeven* een stijlvoorbeeld, *wanneer* je het bewerkt, *dan* vul je in: de ruwe notitie zoals jij die maakt, de documentatie zoals die zou moeten worden, en optioneel een te ver doorgeschoten versie met de reden waarom die fout is. Het derde deel is wat de gouden testset toetsbaar maakt (§12.9, D8 uit de review).

**FR-INS-17 — Stijlvoorbeelden gaan door PrivacyService.**
*Gegeven* een stijlvoorbeeld met de naam Roos erin, *wanneer* het als voorbeeld meegaat naar de AI, *dan* is die naam vervangen, ook als Roos niet in je huidige leerlingenlijst staat. De app waarschuwt bij het opslaan: "Er staan namen in dit voorbeeld die niet in je leerlingenlijst staan. Voeg ze toe aan Extra termen of vervang ze door verzonnen namen." Dit is het gat dat B6 uit de review aanwees.

#### 6.5.5 Privacy

**FR-INS-18 — De leerlingenlijst is de kern van de afscherming.**
*Gegeven* het privacyscherm, *wanneer* je het opent, *dan* staat bovenaan het aantal leerlingen dat wordt afgeschermd en de zin "Namen die hier niet in staan, worden niet automatisch afgeschermd."

**FR-INS-19 — Extra termen vangen wat de lijst niet dekt.**
*Gegeven* het veld Extra termen, *wanneer* je woorden toevoegt (achternamen, namen van collega's, de naam van de school, een straatnaam), *dan* worden die op dezelfde manier vervangen als leerlingnamen, met een eigen codesoort.

**FR-INS-20 — Zonder leerlingen geen AI, tenzij bevestigd.**
*Gegeven* een lege leerlingenlijst, *wanneer* je een AI-functie start, *dan* blokkeert de app met "Je leerlingenlijst is leeg. De afscherming doet dan niets." en twee knoppen: "Leerlingen toevoegen" en "Toch doorgaan". De tweede vraagt om een eenmalige bevestiging die in het logboek komt. Volgt uit T-08.

**FR-INS-21 — Het controlescherm is instelbaar bij documentatie, niet bij mail.**
*Gegeven* Instellingen → Privacy, *wanneer* je "Toon altijd wat er verstuurd wordt" uitzet, *dan* geldt dat alleen voor documentatie; bij mail blijft het verplicht (FR-MAI-12). De schakelaar staat standaard aan.

#### 6.5.6 AI-provider

**FR-INS-22 — De standaard verwerkt binnen de EU.**
*Gegeven* een verse installatie, *wanneer* je de providerinstelling bekijkt, *dan* staat er een aanbieder met verwerking binnen de EU geselecteerd, met de regio erbij. Volgt uit T-06.

**FR-INS-23 — Bij elke provider staat wat er geldt.**
*Gegeven* de providerlijst, *wanneer* je hem opent, *dan* staat per aanbieder in een tabel: verwerkingsregio, of er op je gegevens getraind wordt, of er zero-retention is, en of er een verwerkersovereenkomst via het bestuur ligt. Een aanbieder zonder die overeenkomst is kiesbaar maar krijgt een waarschuwing en komt in het logboek.

**FR-INS-24 — Het verbruik is zichtbaar.**
*Gegeven* het providerscherm, *wanneer* je het opent, *dan* zie je het aantal aanroepen deze maand, het aantal tekens, en de schatting van de kosten. Zonder inhoud, alleen tellingen.

#### 6.5.7 Regio en schooljaar

**FR-INS-25 — De regio bepaalt de vakanties.**
*Gegeven* de keuze Noord, Midden of Zuid, *wanneer* je hem wijzigt, *dan* worden de vakanties herberekend en blijven overrides staan (FR-AGE-11). De regio staat in `localStorage` (T-01), want hij zegt niets over een persoon.

**FR-INS-26 — Het schooljaar bepaalt de standaardperiode.**
*Gegeven* een ingesteld schooljaar met een eerste en laatste schooldag, *wanneer* je een filter op periode gebruikt, *dan* is "dit schooljaar" een snelkeuze met die datums.

#### 6.5.8 Taal

**FR-INS-27 — Leerling of Kind is één instelling.**
*Gegeven* Instellingen → Taal, *wanneer* je "Kind" kiest, *dan* wordt in alle schermteksten, knoppen, foutmeldingen, lege toestanden en exports "leerling" vervangen door "kind" en "leerlingen" door "kinderen", inclusief de samenstellingen. De instelling raakt geen opgeslagen gegevens en geen codenamen. Zie §9.9.

#### 6.5.9 Back-up maken en terugzetten

**FR-INS-28 — Een back-up bevat alles.**
*Gegeven* de knop "Back-up maken", *wanneer* je hem gebruikt, *dan* levert de app één bestand met alle documentaties, pagina's, foto's in alle drie de varianten, leerlingen, groepen, lidmaatschappen, reeksen, agenda-items, overrides, mailconcepten, sjablonen, stijlprofiel, stijlvoorbeelden en instellingen. Niet meegenomen: de mailcache, het logboek van AI-aanroepen ouder dan een jaar, en de tokens. Het formaat staat in §8.7.

**FR-INS-29 — Een back-up is te versleutelen.**
*Gegeven* het back-upscherm, *wanneer* je een wachtwoord opgeeft, *dan* wordt het bestand versleuteld en is het zonder dat wachtwoord niet te openen. De app waarschuwt dat een vergeten wachtwoord het bestand onbruikbaar maakt en biedt geen herstel. Zonder wachtwoord kan ook; dan staat er in de bestandsnaam `onversleuteld`.

**FR-INS-30 — Terugzetten vraagt om samenvoegen of vervangen.**
*Gegeven* een back-upbestand, *wanneer* je het terugzet, *dan* toont de app eerst wat erin zit (aantallen per soort, datum, apparaat) en vraagt zij: "Samenvoegen met wat er nu staat" of "Alles vervangen". Bij vervangen is er een tweede bevestiging waarin je het aantal huidige documentaties moet zien staan.

**FR-INS-31 — Bij samenvoegen wint de nieuwste bewerking per record.**
*Gegeven* een documentatie die in beide bestaat, *wanneer* je samenvoegt, *dan* blijft de versie met de hoogste `updatedAt` staan en wordt de andere als kopie bewaard met de aantekening "uit back-up van 3 juli". Je kunt die kopie daarna verwijderen. Voor foto's geldt de hash: gelijke hash is hetzelfde bestand.

**FR-INS-32 — De herinnering komt na dertig dagen.**
*Gegeven* geen back-up in dertig dagen, *wanneer* het dashboard opent, *dan* verschijnt het blok uit FR-DAS-03. Volgt uit B-02.

#### 6.5.10 Opslag

**FR-INS-33 — Het verbruik is uitgesplitst.**
*Gegeven* het opslagscherm, *wanneer* je het opent, *dan* zie je een balk met het gebruikte deel van de beschikbare ruimte, en daaronder de verdeling: foto's, documentaties, mailcache, overig, met per regel het aantal en de omvang.

**FR-INS-34 — Bij 80 procent waarschuwt de app.**
*Gegeven* een verbruik boven 80 procent van de schatting, *wanneer* je iets opslaat, *dan* verschijnt eenmalig per sessie "Je opslag raakt vol. Maak een back-up en ruim op." met een knop naar dit scherm. Volgt uit T-09.

**FR-INS-35 — Bij 95 procent blokkeert de app nieuwe foto's.**
*Gegeven* een verbruik boven 95 procent, *wanneer* je een foto toevoegt, *dan* wordt die geweigerd met "Er is geen ruimte meer voor foto's. Tekst opslaan werkt nog wel." Tekst blijft altijd werken; werk verliezen mag niet (U-10, hoofdstuk 4).

**FR-INS-36 — Opruimen begint bij het grootste.**
*Gegeven* het opruimscherm, *wanneer* je het opent, *dan* staan de documentaties gesorteerd op omvang, met per regel het aantal foto's, en met de acties "Exporteren en verwijderen" en "Alleen de afdrukvariant van de foto's weggooien" (dat laatste bespaart ongeveer 70 procent en houdt de documentatie leesbaar op het scherm).

#### 6.5.11 Toegangscode en apparaten

**FR-INS-37 — De toegangscode wordt per apparaat één keer gevraagd.**
*Gegeven* een nieuw apparaat, *wanneer* je de app opent, *dan* vraagt zij één keer om de toegangscode en zet zij daarna een cookie met een looptijd van een jaar. Geen account, geen wachtwoord dat je moet onthouden. Volgt uit T-05 en B-21.

**FR-INS-38 — De code is te wijzigen en apparaten zijn los in te trekken.**
*Gegeven* het apparatenscherm, *wanneer* je een apparaat intrekt, *dan* moet dat apparaat de code opnieuw invoeren. De lijst toont per apparaat een zelfgekozen naam, de browser, en de datum van het laatste gebruik. Er staan geen IP-adressen in.

#### 6.5.12 Alles wissen

**FR-INS-39 — Alles wissen is één handeling met een harde bevestiging.**
*Gegeven* de knop "Wis alles op dit apparaat", *wanneer* je hem gebruikt, *dan* toont de app wat er verdwijnt met aantallen, biedt zij eerst "Maak eerst een back-up" aan, en vraagt zij om het woord `WISSEN` te typen. Daarna worden IndexedDB, `localStorage` en de cookies gewist en start de app opnieuw op als nieuw.

#### 6.5.13 Over EduFlow

**FR-INS-40 — Het scherm Over vertelt waar alles staat.**
*Gegeven* Instellingen → Over, *wanneer* je het opent, *dan* zie je het versienummer, de datum van de bouw, de gekozen provider met regio, de versie van het vakantiebestand, en een lijst in gewone taal van wat waar staat: wat op dit apparaat blijft, wat naar de AI gaat, wat naar je mailaanbieder gaat en wat nergens heen gaat. Met een verwijzing naar de privacyverklaring en naar het logboek (hoofdstuk 16).

**FR-INS-41 — Er is een knop "Wat weet de app over mij".**
*Gegeven* het scherm Over, *wanneer* je die knop gebruikt, *dan* opent een overzicht met alle gegevens per soort en een telling, met de mogelijkheid alles te exporteren als leesbaar bestand. Dit dient het inzagerecht uit hoofdstuk 15.

**FR-INS-42 — De instellingen zelf staan verdeeld volgens T-01.**
*Gegeven* de opslag, *wanneer* je nagaat waar een instelling staat, *dan* geldt: regio, standaardtoon, provider, laatst gekozen weergave, back-updatum en de eenmalige vragen staan in `localStorage`; al het overige, inclusief leerlingen, groepen, stijlprofiel en stijlvoorbeelden, staat in IndexedDB. Zie §8.2.

**FR-INS-43 — Instellingen zijn doorzoekbaar.**
*Gegeven* meer dan vijftig instellingen over dertien schermen, *wanneer* je in het zoekveld bovenaan Instellingen typt, *dan* krijg je de bijpassende instellingen met hun pad, en springt kiezen ernaartoe met de instelling gemarkeerd.

**FR-INS-44 — Elke instelling zegt wat hij doet.**
*Gegeven* een instelling, *wanneer* je hem bekijkt, *dan* staat er onder de naam één zin die het gevolg beschrijft, niet de werking. Dus "Namen worden vervangen voordat tekst naar de AI gaat", niet "Schakelt PrivacyService in".

**FR-INS-45 — Wijzigingen werken meteen door.**
*Gegeven* een gewijzigde instelling, *wanneer* je het scherm verlaat, *dan* is er geen opslaanknop geweest: elke wijziging is meteen opgeslagen en meteen van kracht, met een korte bevestiging in de statusregel.

---
