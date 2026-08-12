<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 4. UX-principes

### 4.1 Het uitgangspunt: het werk is niet de app

Ilse staat op donderdagmiddag om tien voor drie in haar lokaal. Er liggen zes foto's op haar
telefoon, over twintig minuten komen er ouders binnen, en er is een documentatie die af moet. Ze is
niet bezig met EduFlow, ze is bezig met Groep 4 – De Regenboog. Elke seconde die de app voor
zichzelf opeist, is een seconde die zij niet aan haar werk besteedt.

EduFlow wordt daarom niet afgerekend op wat hij kan, maar op wat hij kost. Drie maten:

- **Tijd tot de eerste letter.** Van openen tot een cursor in een tekstveld: hoogstens drie
  handelingen en twee seconden.
- **Aantal handelingen tot een geëxporteerde documentatie.** Hoogstens twaalf in schrijfmodus (zie
  §4.4).
- **Aantal keren dat je aan de app moet denken.** Nul is het doel. Elke melding en elke keuze die
  niet over het kind gaat, telt tegen.

Hieruit volgt ook wat er niet is: geen rondleiding, geen tips van de dag, geen badges, geen
voortgangsbalk, geen aanmoediging om vaker te documenteren. Er is één samenhangende
eerste-keer-ervaring (B-49) die alleen vraagt wat de app nodig heeft om te werken: je groep, je
leerlingen en je toegangscode. Daarna houdt hij zijn mond.

### 4.2 De tien UX-principes van EduFlow

Deze tien principes gelden voor elk scherm in elke module. Bij elk principe staat een goed en een
fout voorbeeld uit dit product, niet uit de theorie.

#### 4.2.1 UXP-01 — Zichtbaarheid boven verbergen

**De regel.** Wat je kunt doen, staat in beeld. Een handeling die alleen bestaat als je hem al
kent, bestaat niet.

**Goed.** Rij-acties achter een zichtbare knop met drie punten (B-33). De hoofdnavigatie altijd in
beeld: zijbalk op de laptop, onderbalk op de telefoon. **Bekijk wat er verstuurd wordt** naast de
AI-knop.

**Fout.** Een hamburgermenu waarin Documentaties, Agenda en Mail verdwijnen. Lang indrukken om te
verwijderen, wat op een laptop niet eens bestaat.

#### 4.2.2 UXP-02 — Eén scherm per taak

**De regel.** Een taak wordt afgemaakt op de plek waar hij begint. Navigeren is geen onderdeel van
werken.

**Goed.** Het exportpaneel schuift over het schrijfscherm (B-06): layout kiezen, voorbeeld zien en
exporteren zonder de documentatie te verlaten. In Mail staan bericht en concept naast elkaar.

**Fout.** Een aparte exportpagina waarna je de weg terug moet zoeken. Instellingen die je door vier
stappen leiden voordat je één leerling kunt toevoegen.

#### 4.2.3 UXP-03 — Niets gaat verloren

**De regel.** Werk verdwijnt niet door een fout, een storing, een gesloten tabblad of een lege
batterij.

**Goed.** Automatisch opslaan na één seconde stilte en bij het verlaten van het scherm.
Waarschuwing bij 80 procent van de opslaglimiet (T-09). De app op het beginscherm zetten op de
telefoon, met een back-upherinnering na een maand (B-02).

**Fout.** Een AI-voorstel dat je tekst overschrijft zonder dat er iets terug te halen valt. Een
opslagfout die je documentatie leeg achterlaat.

#### 4.2.4 UXP-04 — Elke handeling is terug te draaien

**De regel.** Ongedaan maken is de standaard, bevestigen de uitzondering (zie §4.8).

**Goed.** **Overnemen** is altijd ongedaan te maken (T-07, B-39). Verwijderen is markeren (T-11):
dertig dagen prullenbak. Herordenen, verplaatsen en het aanzetten van een correctieregel zijn ook
terug te draaien.

**Fout.** Een venster "Weet je het zeker" als vervanging voor ongedaan maken. Dat verplaatst het
risico naar het moment waarop je het minst oplet.

#### 4.2.5 UXP-05 — Standaardwaarden doen het werk

**De regel.** Elk veld dat de app redelijk kan invullen, is ingevuld. Wat de app niet kan weten,
vraagt hij.

**Goed.** De datum staat op vandaag of komt uit de foto's. Groep en leerlingen komen uit wat je het
laatst gebruikte. De layout is die van vorige keer. Op de laptop is de jaarweergave standaard
tussen 1 juli en 15 september (B-31).

**Fout.** Een leeg datumveld dat je verplicht invult voordat je mag opslaan. Een documentatie die
niet ontstaat zonder dat je eerst een reeks kiest. En de andere kant op: de layout automatisch
kiezen op basis van je inhoud (B-11), want dan verandert de opmaak onder je handen.

#### 4.2.6 UXP-06 — Wachten wordt getoond, niet verzwegen

**De regel.** Bij elke wachttijd boven de seconde weet je waarop je wacht en hoe lang het ongeveer
nog duurt.

**Goed.** AI-tekst streamt binnen twee seconden binnen. De export toont "pagina 2 van 3". Het
postvak toont skeletregels waar de berichten komen te staan.

**Fout.** Een knop die acht seconden niets zichtbaars doet. Een draaiend rondje zonder tekst bij
een export van twaalf seconden.

#### 4.2.7 UXP-07 — Fouten zijn in gewone taal

**De regel.** Een melding zegt wat er gebeurde, wat het voor jouw werk betekent en wat de volgende
stap is. In die volgorde, in hoogstens drie zinnen (zie §4.7 en §4.10).

**Goed.** "Er is nu geen internet. Schrijven, foto's en de agenda werken door. Meeschrijven en
mail komen terug zodra je verbinding hebt."

**Fout.** "Error 429: rate limit exceeded", en net zo fout: "Er is iets misgegaan".

#### 4.2.8 UXP-08 — Lege schermen leren je wat je kunt doen

**De regel.** Een leeg scherm is de beste plek om iets uit te leggen, want er is toch niets anders
te zien. Twee zinnen en één knop (zie §4.6).

**Goed.** "Er staan nog geen leerlingen in de lijst. Zonder namen kan EduFlow ze niet vervangen
voordat tekst naar de AI gaat." Knop: **Leerlingen toevoegen**.

**Fout.** Een grijs vlak met "Geen resultaten": een mededeling over de database, niet over jou.

#### 4.2.9 UXP-09 — De belangrijkste knop is de grootste

**De regel.** Per scherm is er één handeling die je het vaakst wilt doen. Die is gevuld, groter en
staat rechts of onderaan. De rest is omlijnd of een tekstknop.

**Goed.** In het exportpaneel is **Deelbare afbeelding** gevuld en **Print-PDF** omlijnd, want
delen gebeurt vaker. In Mail is **Als concept in je mailprogramma** de gevulde knop.

**Fout.** Drie even grote knoppen naast elkaar. Een gevulde, opvallende **Verwijderen**-knop.

#### 4.2.10 UXP-10 — Toetsenbord is een volwaardige route

**De regel.** Alles wat met de muis of met een vinger kan, kan met het toetsenbord, in dezelfde
volgorde en met zichtbare focus.

**Goed.** Foto's herorden je met pijlknoppen én slepen (B-38). Escape sluit het exportpaneel en zet
de focus terug op de knop die het opende.

**Fout.** Een fotovolgorde die alleen met slepen te wijzigen is. Een menu dat alleen opengaat bij
aanwijzen met de muis.

### 4.3 Desktop first in de praktijk

Desktop first (U-04, B-14) gaat niet over welk apparaat belangrijker is, maar over de volgorde
waarin je beslist. Elke functie wordt eerst ontworpen en gebouwd op 1280 pixels breed. Daar past
alle informatie tegelijk, dus daar worden de moeilijke keuzes zichtbaar: wat hoort bij elkaar, wat
is bijzaak, wat mag weg. Wie op de telefoon begint, verstopt die keuzes achter schermwissels.

De telefoonweergave volgt daaruit en wordt geen tweede ontwerp. Dat is afgedwongen met drie
regels.

- **Dezelfde componenten, servicelaag en layoutdefinities.** Een tweede layout-implementatie is
  verboden. Wat op de laptop een regel is, is op de telefoon dezelfde regel in een andere vorm.
- **Precies drie soorten verschil zijn toegestaan:** de plaats van de navigatie, het aantal kolommen
  (drie wordt één) en of een paneel naast of over de inhoud staat.
- **Een functie mag op de telefoon ontbreken, maar nooit anders werken.**

Breekpunten: onder 640 pixels de telefoonweergave, van 640 tot 1023 dezelfde weergave met een
bredere kolom, vanaf 1024 de laptopweergave, ontworpen op 1280.

Omdat een documentatie op één apparaat leeft (B-01), is de telefoon een volwaardige werkplek en
geen halve. Het verschil tussen de apparaten komt uit de situatie, niet uit het scherm.

| Beter op de telefoon | Waarom |
|---|---|
| Gespreksmodus | Je staat er nog en de foto's zijn net gemaakt (B-03) |
| Foto's toevoegen | De camera zit erin; overzetten kost meer dan het oplevert |
| Snel iets in de agenda zetten | Een studiedag hoor je in de gang, niet aan je bureau |

| Beter op de laptop | Waarom |
|---|---|
| Schrijven en meeschrijven | Een echt toetsenbord; het voorstel past naast je tekst |
| Exporteren en layout kiezen | Vier miniaturen naast elkaar, niet onder elkaar |
| Mail | Bericht en concept naast elkaar; het mailprogramma staat toch al open |
| Jaarweergave | Een schooljaar past niet op een telefoonscherm (B-10, B-31) |
| Instellingen | Leerlingenlijst, schrijfstijl en back-up zijn zittend werk |

Gespreksmodus is de enige plek waar de telefoon een eigen inrichting krijgt, om één navertelbare
reden: de camera is daar. Op de laptop bestaat gespreksmodus wel, maar niet als standaard.

### 4.4 Zo min mogelijk klikken, maar niet ten koste van regie

"Zo min mogelijk klikken" is een goede vuistregel en een slecht principe: in zijn zuiverste vorm
eindigt hij bij een app die alles zelf doet. De rekenregel van EduFlow is scherper:

**Een handeling verwijderen mag. Een besluit wegnemen niet.**

Een handeling is een tik die geen informatie draagt: navigeren, openen, bevestigen wat je net al
zei, opslaan wat je toch wilde opslaan. Een besluit is een tik die informatie toevoegt die de app
niet kan weten: welke kinderen erbij horen, welke tekst naar ouders gaat, of dit beeld de school
uit mag. Handelingen zijn er om te schrappen; besluiten zijn de reden dat jij verantwoordelijk bent
en niet de app.

Wat daarom is geschrapt: geen opslaanknop, geen dialoog "nieuwe documentatie" (een documentatie
ontstaat bij de eerste inhoud, B-34), geen inloggen (B-21), geen bevestiging bij verwijderen, en de
deelbare afbeelding gaat in één tik het deelmenu in (B-09).

Wat er bewust blijft staan:

| Plek | Extra handeling | Waarom hij blijft |
|---|---|---|
| Overnemen | AI-tekst komt niet vanzelf in je tekst | De tekst is van jou (U-10, `AIW-1`) |
| Aanvullen of vervangen | Eén keuze bij **Overnemen** (B-39) | Het verschil is nergens uit af te leiden |
| Layoutkeuze | Vier miniaturen, geen automatische keuze (B-11) | De layout bepaalt wat ouders zien |
| Toestemming beeldgebruik | Eén bevestiging per documentatie (B-08) | De enige plek waar beeld de school verlaat |
| Lezing vóór de eerste export | Eén vinkje in het exportpaneel | Vangnet tegen verzinsels (§3.8) |
| Lege leerlingenlijst | Eenmalige bevestiging (T-08) | Anders werkt de afscherming stilzwijgend niet |
| Als concept in je mailprogramma | Versturen doe je zelf | Uitgaand is een menselijke handeling (B-19, B-20) |
| Groep verwijderen met lidmaatschappen | Bevestiging met het aantal | Het raakt twintig records tegelijk |

De norm hierbij is telbaar. Van zes foto's tot een geëxporteerde documentatie in schrijfmodus:
hoogstens twaalf handelingen, waarvan zes besluiten. In gespreksmodus hoogstens zes plus je
antwoorden. Die telling wordt gemeten in de schermtests (zie hoofdstuk 17), niet geschat.

### 4.5 Wachten, laden en tempo

Wachttijd is ontwerpmateriaal met vier drempels, elk met eigen gedrag.

| Duur | Wat de gebruiker ervaart | Wat de app doet |
|---|---|---|
| Onder 100 ms | Direct, alsof je het zelf deed | Niets tonen, behalve de ingedrukte staat |
| 100 ms tot 1 s | Merkbaar, aandacht blijft bij de taak | Ingedrukte staat, geen rondje |
| 1 s tot 10 s | Wachten | Zichtbare voortgang met tekst die zegt waarop je wacht; scherm blijft bedienbaar en de handeling is te annuleren |
| Boven 10 s | Te lang | Voortgang met stappen en een aantal, annuleren prominent, en bij AI streaming binnen 2 seconden |

De bijbehorende prestatienormen, meetbaar en met een nulmeting vóór sprint 1 (B-46):

| Handeling | Norm |
|---|---|
| Overzicht met 1.000 documentaties | Eerste rij binnen 150 ms |
| Zoeken, per toetsaanslag | Resultaat binnen 100 ms |
| Automatisch opslaan | Binnen 50 ms, nooit blokkerend |
| Print-PDF van één pagina | Binnen 1,5 s |
| Rasteren naar een deelbare afbeelding | Binnen 1 s per pagina |
| Eerste AI-teken | Binnen 2 s bij 90 procent van de aanroepen |

Streaming heeft één eigen regel: **er mag niets schuiven onder de cursor**. Het voorstel verschijnt
in een eigen blok onder je tekstveld, en dat blok krijgt vóór het streamen een gereserveerde
hoogte, berekend uit de lengte van je invoer maal 1,4 maal de regelhoogte. De tekst vult dus een
vak dat er al staat. Groeit het antwoord daarbuiten, dan krijgt het blok een eigen schuifbalk in
plaats van dat de pagina langer wordt.

De schuifpositie verandert nooit automatisch zolang de cursor in een tekstveld staat, en de cursor
wordt nooit verplaatst. Je kunt tijdens het streamen doortypen. Zo klopt het beeld uit §3.1: een
collega die meeschrijft pakt jouw pen niet af.

### 4.6 Lege toestanden

Elke lege toestand heeft dezelfde vorm: hoogstens twee zinnen en precies één knop, geen
illustratie. De eerste zin zegt wat er is, de tweede waarom het uitmaakt, en de knop is de enige
logische volgende stap.

| Scherm | Tekst | De knop |
|---|---|---|
| Dashboard, eerste keer | "Je hebt nog niets vastgelegd. Begin met een documentatie." | Nieuwe documentatie |
| Documentaties, leeg | "Hier komen je documentaties te staan." | Nieuwe documentatie |
| Documentaties, niets gevonden | "Geen documentatie gevonden voor 'regenworm'." | Wis de filters |
| Schrijfscherm, nieuw | "Schrijf op wat je zag. Losse zinnen zijn genoeg." | Laat AI meeschrijven, actief vanaf tien woorden |
| Gespreksmodus, geen foto's | "Kies de foto's die je net maakte. EduFlow stelt er vragen bij; ze blijven op dit apparaat." | Foto's kiezen |
| Foto's in een documentatie | "Nog geen foto's." | Foto's toevoegen |
| Reeksen, leeg | "Nog geen reeksen. Een reeks bundelt documentaties die bij elkaar horen, zoals Kunstwerk Dok." | Nieuwe reeks |
| Groepen, leeg | "Nog geen groepen. Een groep is bijvoorbeeld Groep 4 – De Regenboog." | Nieuwe groep |
| Leerlingen, leeg | "Er staan nog geen leerlingen in de lijst. Zonder namen kan EduFlow ze niet vervangen voordat tekst naar de AI gaat." | Leerlingen toevoegen |
| Agenda week, leeg | "Geen afspraken deze week." | Afspraak toevoegen |
| Agenda week, vakantie | "Herfstvakantie. Deze week zijn er geen schooldagen." | Afspraak toevoegen |
| Agenda jaar, geen schooljaar | "Er is nog geen schooljaar ingesteld, dus de vakanties staan niet op hun plek." | Schooljaar instellen |
| Postvak, niet gekoppeld | "Je postbus is nog niet gekoppeld. EduFlow leest mee en stelt op; versturen doe je zelf." | Postbus koppelen |
| Postvak, gekoppeld en leeg | "Geen ongelezen berichten." | Nieuw concept |
| Mailconcepten, leeg | "Nog geen concepten." | Nieuw concept |
| Schrijfstijl, niets geleerd | "EduFlow heeft nog niets van je schrijfstijl geleerd. Dat gebeurt zodra je een paar documentaties hebt overgenomen of geschreven." | Voorbeeld toevoegen |
| Back-up, nooit gemaakt | "Je hebt nog geen back-up gemaakt. Zonder back-up staat je werk op één apparaat." | Back-up maken |
| Prullenbak, leeg | "Niets verwijderd in de afgelopen dertig dagen." | Terug naar de documentaties |

Twee regels hierbij. Een leeg zoekresultaat is geen leeg scherm: daar is de knop niet "maak iets
nieuws" maar "haal de beperking weg". En een leegte die door een storing ontstaat is een fout en
hoort in §4.7.

### 4.7 Fouten en waarschuwingen

Er zijn drie zwaartes, en de keuze ertussen is een regel en geen smaak.

| Soort | Wanneer | Vorm | Kun je door |
|---|---|---|---|
| Blokkeren | Doorgaan vernietigt werk of doet persoonsgegevens onbedoeld de deur uit | Venster met titel, uitleg en twee knoppen; de veilige is gevuld | Nee |
| Waarschuwen | Doorgaan kan, met een gevolg dat je moet kennen | Strook boven de inhoud, tot het probleem weg is | Ja |
| Melden | Iets wat je moet weten maar niet hoeft op te lossen | Balk onderin, zes seconden, eventueel met **Ongedaan maken** | Ja |

Blokkeren mag in versie 1.0 op precies vier plekken: een AI-aanroep met een lege leerlingenlijst
(T-08), de toestemming voor beeldgebruik (B-08), de lezing vóór de eerste export (§3.8) en het
definitief wissen van alle gegevens. Wie een vijfde wil toevoegen, haalt er eerst een weg.

Vijf voorbeeldteksten, letterlijk zoals ze in het scherm staan.

| Situatie | Tekst | Knoppen | Soort |
|---|---|---|---|
| Opslag bijna vol | "Je opslag is voor 80 procent vol. Maak een back-up en ruim oude documentaties op, dan blijft er ruimte voor foto's." | Back-up maken · Later | Waarschuwen |
| Geen internet | "Er is nu geen internet. Schrijven, foto's en de agenda werken door. Meeschrijven en mail komen terug zodra je verbinding hebt." | Geen | Waarschuwen |
| AI onbereikbaar | "Meeschrijven lukt nu niet. De AI-dienst geeft geen antwoord. Je tekst staat er nog." | Opnieuw proberen · Verder schrijven | Melden |
| Foto te groot | "Deze foto is te groot om te verwerken. EduFlow verkleint foto's, maar deze past niet in het geheugen van je browser." | Andere foto kiezen | Melden |
| Leerlingenlijst leeg | "Er staan geen leerlingen in je lijst. EduFlow kan geen namen vervangen, dus je tekst gaat letterlijk naar de AI." | Leerlingen toevoegen · Toch doorgaan | Blokkeren |

De opbouw is altijd dezelfde drieslag: wat er gebeurde, wat het voor jouw werk betekent, wat de
volgende stap is. Hoogstens drie zinnen, hoogstens twintig woorden per zin, geen foutcode in de
tekst. Voor Maarten staat de technische code achter een uitklapregel **Technische details**, met
het tijdstip en de gebruikte adapter.

### 4.8 Bevestigen en ongedaan maken

Bevestigen kost aandacht en werkt maar één keer: bij de derde keer lees je hem niet meer. Ongedaan
maken kost niets vooraf en werkt elke keer. Daarom is ongedaan maken de standaard en bevestigen de
uitzondering.

Bevestigen mag alleen als aan minstens één van drie voorwaarden is voldaan: de handeling is
technisch niet terug te draaien, de handeling stuurt gegevens de school uit, of de handeling raakt
meer dan tien records tegelijk. In versie 1.0 zijn dat de vier blokkades uit §4.7 plus het
verwijderen van een groep met lopende lidmaatschappen.

Ongedaan maken is er na **Overnemen** (T-07), na **Weggooien**, na het verwijderen van een
documentatie, foto, reeks of afspraak, na het herordenen van foto's, na het verplaatsen van een
afspraak en na het aanzetten van een correctieregel.

**B-39 uitgewerkt.** Tik je op **Overnemen** en staat er al tekst in je veld, dan verschijnt onder
het voorstel één regel met twee knoppen: **Onder mijn tekst plakken** (gevuld, de standaard) en
**Mijn tekst vervangen**. Is je veld leeg, dan komt die vraag niet: een vraag met één zinnig
antwoord is geen vraag. Vóór de wijziging schrijft `DocumentationService` de vorige inhoud weg als
`ChangeLogEntry`, zodat automatisch opslaan hem niet overschrijft. Daarna staat er zes seconden
**Overgenomen. Ongedaan maken** in de onderbalk, en de sneltoets blijft werken zolang het scherm
open is.

Verwijderen is markeren (T-11). Een verwijderde documentatie staat dertig dagen in de prullenbak,
met datum. Daarna ruimt de app hem op, samen met de foto's die alleen aan hem hingen. De enige
onomkeerbare handeling is **alles wissen** in Instellingen, en die vraagt om het intypen van het
woord "wissen".

### 4.9 Toegankelijkheid als ontwerpeis

WCAG 2.2 AA is de vloer en een eis vooraf, geen controle achteraf. Een scherm dat pas na oplevering
toetsenbordbedienbaar wordt gemaakt, heeft een focusvolgorde die een reparatie is in plaats van een
ontwerp.

| Onderwerp | Eis in EduFlow |
|---|---|
| Toetsenbordroute | Elke handeling bereikbaar met Tab, Enter, spatie, Escape en pijltoetsen; geen val waar je niet uit komt |
| Focusvolgorde | Volgt de leesvolgorde; een paneel zet de focus op zijn titel en geeft hem bij sluiten terug |
| Focus zichtbaar | Omlijning van 2 px met ten minste 3:1 contrast, ook op gekleurde knoppen |
| Contrast | Tekst 4,5:1, grote tekst en bedieningselementen 3:1. Kleur is nooit de enige drager: concept en gedeeld krijgen een woord |
| Doelgrootte | Vloer 24 × 24 px; EduFlow houdt 44 × 44 px op de telefoon en 32 × 32 px op de laptop |
| Tekstvergroting | Tot 200 procent zonder functieverlies en zonder horizontaal schuiven bij 320 px |
| Bewegingsvoorkeur | Bij `prefers-reduced-motion` geen overgangen; AI-tekst verschijnt per zin |
| Voorlezen | Streamende tekst in een beleefd meldgebied, één keer voorgelezen als hij compleet is |

**B-38 uitgewerkt: slepen is nooit de enige manier.** Elke foto heeft een knop omhoog en een knop
omlaag, altijd zichtbaar en niet pas bij het aanwijzen met de muis, want aanwijzen bestaat niet op
een telefoon. De toegankelijke naam is volledig: "Verplaats foto 2 naar voren". Na het verplaatsen
blijft de focus op de knop en meldt het meldgebied "foto 2 staat nu op plaats 1 van 6". Hetzelfde
geldt in de agenda, waar je een afspraak ook met **Verplaatsen** in de knop met drie punten verzet,
en overal waar iets van plaats kan wisselen. Slepen is een versnelling, nooit de deur.

Toegankelijkheid is een poort in de Definition of Done: per scherm één doorloop met alleen het
toetsenbord, één met een schermlezer, plus een geautomatiseerde controle bij elke bouw (zie
hoofdstuk 17).

### 4.10 Taal en woordkeuze in de schermen

De schermtaal ligt vast: Documentatie, Pagina, Reeks, Groep, Leerling, Citaat, Schrijfmodus,
Gespreksmodus, Laat AI meeschrijven, Overnemen, Opnieuw, Weggooien, Bekijk wat er verstuurd wordt,
Print-PDF, Deelbare afbeelding, Toegangscode, Back-up maken, Terugzetten, Postvak, Als concept in
je mailprogramma, Kopieer. Deze woorden worden nergens gevarieerd. "Overnemen" is niet ergens
anders "Toepassen", en "Weggooien" is niet ergens anders "Verwijderen".

Het woord Leerling is in Instellingen om te zetten naar Kind, voor Fatima en haar collega's in de
opvang. Eén instelling zet alle schermteksten om, ook samenstellingen, via één woordenlijstje:
leerling wordt kind, leerlingen wordt kinderen, leerlingenlijst wordt kinderlijst, leerlingnaam
wordt kindnaam. Schermteksten worden zo geschreven dat de omzetting een lopende zin oplevert.

Vier regels gelden overal. Geen systeemtaal: geen record, geen cache, geen token, geen server. Geen
schuldtoewijzing: het onderwerp van een foutzin is nooit "je". Geen "sorry". En altijd de volgende
stap, ook als die "wacht even" is.

| Niet dit | Maar dit |
|---|---|
| "Er is een onbekende fout opgetreden." | "Meeschrijven lukt nu niet. Je tekst staat er nog. Probeer het zo opnieuw." |
| "Sorry, er ging iets mis." | "Deze foto is te groot. Kies een andere foto." |
| "Ongeldige invoer." | "Vul een datum in tussen 1 augustus 2026 en 31 juli 2027." |
| "Weet je het zeker?" | "Deze groep heeft twintig leerlingen. Verwijderen sluit hun lidmaatschappen af." |
| "Je hebt geen internetverbinding." | "Er is nu geen internet." |
| "Bezig met synchroniseren..." | "Bezig met verkleinen, foto 3 van 6." |
| "Oeps, dat ging niet goed." | "Er kwam geen tekst terug. Probeer het opnieuw." |
| "QuotaExceededError bij opslaan." | "Er is te weinig ruimte. Maak een back-up en ruim op." |
| "Uw documentatie is succesvol opgeslagen." | "Opgeslagen." |
| "Klik hier om verder te gaan." | De handeling op de knop zelf: "Documentatie exporteren" |

Knoplabels zijn werkwoorden die de uitkomst benoemen, niet "OK" of "Ja". En nergens staat "deze
functie is nog niet beschikbaar", want een module die niet af is staat uit en is onzichtbaar
(T-20).

### 4.11 Meten of het werkt

Er zijn twee manieren om te weten of dit product werkt: kijken hoe lang iets duurt en kijken wat er
met de voorstellen gebeurt. Beide kan lokaal. EduFlow houdt daarom een kleine set signalen bij op
het apparaat, en verstuurt er nul.

| Wat wordt bijgehouden | Waarvoor |
|---|---|
| Duur van schrijfscherm tot eerste export | Vaststellen of documenteren sneller gaat |
| Aantal handelingen tot export | Toetsen van de norm uit §4.4 |
| Uitkomst per AI-aanroep en de eindtekstafstand | Voeden van de correctieregels (§3.5, §3.6) |
| Duur en foutcategorie per AI-aanroep | Kiezen en bewaken van een provider (§3.10) |
| Aantal keren dat het controlescherm is geopend | Aantonen dat de controle wordt gebruikt |
| Gekozen layouts en aantal pagina's per export | Weten welke layouts kunnen vervallen |
| Leerlingenlijst gevuld bij een AI-aanroep | Bewaken van de afscherming |
| Opslaggebruik en datum laatste back-up | Op tijd waarschuwen |
| Gebruikte weergave en breedteklasse | Toetsen van de aannames uit §4.3 |

Uitdrukkelijk niet: geen toetsaanslagen, geen muisbewegingen, geen schermopnames, geen inhoud van
documentaties, geen leerlingnamen, geen mailadressen, geen locatie, geen meetdienst van derden en
geen enkel adres waar deze gegevens naartoe kunnen. Dat laatste is de technische garantie, net als
het ontbreken van verzendrechten bij mail (B-20): wat geen bestemming heeft, kan niet weglekken.

Drie regels houden dit binnen de privacybelofte. Duurmetingen worden opgeslagen als duur en niet
als begin- en eindtijd, zodat er geen tijdlijn ontstaat van wat je wanneer deed. Meetgegevens
blijven negentig dagen en worden daarna weektotalen. En één knop in Instellingen → Privacy wist
alles, waarna de app doorwerkt en alleen opnieuw begint met leren.

De laatste regel is de strengste: **een meting mag alleen bestaan als er een besluit aan hangt.**
Twee besluiten zijn belegd. Duurt een documentatie over twintig metingen gemiddeld langer dan
twaalf minuten, dan is dat een ontwerpprobleem en geen gebruikersprobleem. Wordt over twintig
aanroepen meer dan dertig procent van de voorstellen weggegooid, dan deugt de opdracht of het model
niet. Metingen die geen besluit dienen, worden uit de code verwijderd.

---
