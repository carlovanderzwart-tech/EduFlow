<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 15. Privacy en AVG

Dit is het hoofdstuk waarop het project kan stranden, en dat is geen reden om het kort te houden maar om het scherp te maken. Alles wat hier staat is bedoeld om één gesprek te kunnen voeren: dat met de functionaris gegevensbescherming van het schoolbestuur, vóórdat er gegevens van echte kinderen in de app komen.

### 15.1 Wie is waarvoor verantwoordelijk

**De verwerkingsverantwoordelijke is het schoolbestuur.** Niet de leerkracht, ook niet als zij de app zelf heeft gebouwd. Het bestuur bepaalt doel en middelen van de verwerking van leerlinggegevens; een leerkracht die daar een instrument bij kiest, handelt binnen die verantwoordelijkheid.

Dat heeft twee harde gevolgen:

1. **Een leerkracht kan niet zelf een verwerkersovereenkomst sluiten met een AI-aanbieder.** Dat moet via het bestuur. Zolang die er niet is, mogen er geen gegevens van echte kinderen naar een provider.
2. **De maker is in deze opzet verwerker**, ook al is hij dezelfde persoon als de gebruiker. Zodra EduFlow buiten de eigen klas wordt gebruikt, hoort daar een verwerkersovereenkomst bij met het bestuur, met de AI-aanbieder als subverwerker.

| Partij | Rol onder de AVG |
|---|---|
| Schoolbestuur | verwerkingsverantwoordelijke |
| EduFlow (de maker of de uitgevende organisatie) | verwerker |
| AI-aanbieder | subverwerker |
| Microsoft of Google (mail) | verwerker van het bestuur, op basis van de bestaande overeenkomst |

Die laatste regel is gunstig en het is de moeite waard hem te benoemen: de postbus die EduFlow leest, valt al onder een overeenkomst die het bestuur heeft. EduFlow voegt daar geen nieuwe partij aan toe; het leest wat er al is, via de bestaande omgeving.

### 15.2 Welke persoonsgegevens er verwerkt worden

| Gegeven | Van wie | Waar | Grondslag | Bewaartermijn |
|---|---|---|---|---|
| Roepnaam, achternaam-initiaal | leerling | apparaat | gerechtvaardigd belang van het bestuur, uitvoering onderwijstaak | tot de gebruiker verwijdert |
| Geboortedag en -maand (optioneel) | leerling | apparaat | idem | idem |
| Foto's | leerling | apparaat | toestemming beeldgebruik, geregeld door de school | idem |
| Beschrijvingen van gedrag en uitspraken | leerling | apparaat | idem als de naam | idem |
| Citaten | leerling | apparaat | idem | idem |
| Groepslidmaatschap met looptijd | leerling | apparaat | idem | idem |
| Naam, adres, telefoonnummer in een ontvangen mail | ouder | apparaat, cache 7 dagen | uitvoering van de onderwijstaak | 7 dagen |
| E-mailadres van de gebruiker | professional | cookie op de server | uitvoering | tot ontkoppelen |
| Gepseudonimiseerde tekst | leerling | onderweg naar de AI-provider | zie §15.4 | zie §15.4 |

**Wat er niet verwerkt wordt.** Geen BSN, geen ECK iD, geen adresgegevens van leerlingen, geen medische gegevens, geen cijfers, geen niveaus, geen aanwezigheid, geen gedragsincidenten als categorie. Wat een leerkracht in vrije tekst schrijft kan uiteraard gevoelig zijn; daarover gaat §15.7.

### 15.3 Dataminimalisatie in het ontwerp

De AVG vraagt niet om zo min mogelijk gegevens in het algemeen, maar om niet meer dan nodig voor het doel. In EduFlow zijn dat concrete ontwerpkeuzes, geen intenties:

| Keuze | Effect |
|---|---|
| Geen achternaam, alleen een initiaal | een lek levert geen herleidbare namenlijst op |
| Geboortedatum mag zonder jaar (T-21) | leeftijd wordt niet vastgelegd als hij niet nodig is |
| Verjaardagen uit te zetten (FR-AGE-23) | wie ze niet gebruikt, slaat ze niet op |
| De `PseudonymMap` wordt nooit opgeslagen (T-23) | de sleutel die codes weer namen maakt, bestaat alleen in het geheugen |
| Het AI-logboek bevat geen tekst (FR-PRV-08) | verantwoording zonder een tweede kopie van de inhoud |
| Bijlagen van mail worden niet opgehaald (FR-MAI-11) | de gevoeligste bestanden komen de app niet in |
| Mailcache vervalt na zeven dagen (FR-MAI-10) | geen schaduwarchief van de postbus |
| Het origineel van een foto wordt niet bewaard | minder gegevens en minder ruimte, tegelijk |
| EXIF-locatie wordt verwijderd bij het toevoegen | een foto zegt niet meer waar een kind was |

### 15.4 De AI-verwerking

Dit is de stroom waar het gesprek over gaat.

**Wat er weggaat.** Tekst die de gebruiker heeft geschreven of gedicteerd, waarin de namen uit de leerlingenlijst en de extra termen zijn vervangen door codes, samen met de systeeminstructie, het stijlprofiel en gekozen voorbeelden (§12.3). Bij de vervolgzin gaan er ook eerdere documentaties uit dezelfde reeks mee (B-04), en dat is meer tekst over kinderen dan bij gewoon meeschrijven. Dat staat expliciet in het controlescherm (FR-DOC-95).

**Wat er niet weggaat.** De lijst uit §12.13, met bovenaan: foto's, in geen enkele vorm.

**Waarom pseudonimiseren niet genoeg is.** Het Hof van Justitie heeft in september 2025 (EDPS/SRB, C-413/23 P) bevestigd wat de AVG al zei: gepseudonimiseerde gegevens blijven persoonsgegevens voor de partij die over de sleutel beschikt. Voor EduFlow, waar de gebruiker de sleutel is, blijft `[LEERLING-1]` dus een persoonsgegeven. Dat is geen reden om niet te pseudonimiseren — het verkleint het risico aanzienlijk — maar wel om het niet als vrijbrief te presenteren.

**De belofte die daarom eerlijk moet worden gemaakt.** De oorspronkelijke documenten zeiden "er wordt niets opgeslagen buiten het eigen apparaat" en "alles blijft lokaal". Dat is onwaar zodra er tekst naar een provider gaat, en de review wees daar terecht op (B8). De formulering die in de app en in de privacyverklaring staat:

> Je documentaties, foto's en leerlinggegevens staan op dit apparaat. Als je AI gebruikt, gaat de tekst waarin namen zijn vervangen door codes naar de AI-aanbieder. Foto's gaan nooit weg. Wat er precies weggaat, zie je vóór elke aanroep.

**Eisen aan de aanbieder.** Een aanbieder mag pas standaard zijn als hij aan alle vier voldoet (§12.7):

1. Verwerking binnen de EU, aantoonbaar en contractueel.
2. Geen training op verstuurde gegevens.
3. Een bewaartermijn van hoogstens dertig dagen voor misbruikdetectie, en bij voorkeur nul.
4. Een verwerkersovereenkomst die het schoolbestuur kan sluiten.

De situatie per augustus 2026, zoals vastgelegd in de review en hier overgenomen als uitgangspunt voor het gesprek:

| | Traint op je gegevens | Nul-bewaring | Verwerking binnen de EU |
|---|---|---|---|
| OpenAI (programmeerkoppeling) | nee | op aanvraag | ja, eigen EU-eindpunt |
| Google (betaald) | nee | op aanvraag | ja, via Vertex AI, waaronder een regio in Nederland |
| Anthropic | nee | op aanvraag, via verkoop | niet rechtstreeks; wel via Google of AWS in een EU-regio |

### 15.5 De AI-verordening

**EduFlow is geen hoog-risicosysteem, en dat is een ontwerpbesluit.** Bijlage III van de AI-verordening noemt vier toepassingen in het onderwijs als hoog risico: toelating en plaatsing, het beoordelen van leerresultaten, het bepalen van het passende onderwijsniveau, en het bewaken van leerlingen tijdens toetsen. Het SIVON-toetsingskader voor het funderend onderwijs (versie 1.0, 1 april 2026) leidt schoolbesturen langs precies die vier.

EduFlow doet geen van de vier. Sterker: hij kan ze niet doen, en dat is met opzet zo gebouwd (B-25). Er is geen veld voor een cijfer, geen berekening die een niveau afleidt, geen voorspelling en geen bewaking. De systeeminstructie verbiedt oordelende taal (§12.3), de gouden testset toetst daarop (§12.9), en zelfs het dashboardblok Aandacht draagt de zin "Dit gaat over jouw documentatie, niet over dit kind" (FR-DAS-06).

Die grens is daarmee niet alleen een juridisch standpunt maar een toetsbare producteigenschap. Dat is precies wat een functionaris nodig heeft: niet de bewering dat er niet beoordeeld wordt, maar de plek in het systeem waar dat wordt afgedwongen.

**Wat er wel geldt.**

| Verplichting | Sinds | Wat EduFlow doet |
|---|---|---|
| AI-geletterdheid (artikel 4) | februari 2025 | de eerste-keer-ervaring legt in vier schermen uit wat AI doet, wat weggaat en wat blijft (§14.6, B-49) |
| Transparantie bij interactie met AI (artikel 50) | 2 augustus 2026 | elke AI-uitvoer is als voorstel gemarkeerd, nooit als eigen tekst gepresenteerd; het controlescherm toont de hele opdracht |
| Markering van door AI gegenereerde uitvoer | uitgesteld tot 2 december 2026 | de tekst die de gebruiker overneemt is haar tekst, door haar goedgekeurd; EduFlow markeert het voorstel in de app en niet het eindresultaat |
| Verplichtingen voor hoog-risicosystemen (bijlage III) | uitgesteld tot 2 december 2027 | niet van toepassing, zolang B-25 geldt |

De uitstelregeling volgt uit de digitale omnibus over AI, verordening (EU) 2026/1744. Voor EduFlow verandert dat weinig, juist omdat het product bewust buiten de hoog-risicocategorie is ontworpen: het uitstel is geen ademruimte waarop het ontwerp leunt.

**De valkuil van het aanbiederschap.** Het SIVON-kader wijst erop dat een school die een AI-toepassing wezenlijk aanpast, zelf aanbieder wordt. Daarom kan de school in EduFlow geen systeeminstructies bewerken, geen eigen model aansluiten en geen veiligheidsgrenzen verzetten (B-84). Wat zij wel instelt — provider, toon, stijlprofiel, sjablonen — is invoer binnen een vastgesteld systeem.

### 15.6 DPIA en FRIA

**Wanneer een DPIA verplicht is.** Bij grootschalige verwerking van gegevens van kwetsbare personen, en leerlingen zijn kwetsbare personen. Voor één leerkracht met twintig kinderen is "grootschalig" discutabel; zodra EduFlow bestuursbreed wordt gebruikt, is het dat niet meer. De praktische lijn: **er komt een DPIA vóór de eerste gebruiker buiten de eigen klas**, en de opzet ervan wordt nu al gemaakt zodat het gesprek met de functionaris erop kan steunen.

**FRIA.** Het SIVON-kader legt bovenop de DPIA een toets op grondrechten. Ook die is opgezet vanuit de vier vragen die er in dit geval toe doen:

| Grondrecht | Risico | Maatregel |
|---|---|---|
| Bescherming van persoonsgegevens | tekst over kinderen gaat naar een derde partij | pseudonimisatie, controlescherm, EU-verwerking, geen training, foto's blijven |
| Recht op onderwijs zonder ongelijke behandeling | een AI die kinderen verschillend beschrijft op grond van naam of achtergrond | geen beoordeling (B-25); de gouden testset toetst op oordelende taal; namen zijn vervangen op het moment dat de AI schrijft |
| Recht van het kind om gehoord te worden | de documentatie gaat over het kind maar wordt zonder het kind gemaakt | citaten zijn eerste-klas onderdelen (B-37); de app moedigt letterlijke uitspraken aan boven interpretaties |
| Menselijke autonomie van de professional | de AI bepaalt hoe er over kinderen geschreven wordt | elk resultaat is een voorstel (U-10); het stijlprofiel is van de gebruiker en te wissen (B-23) |

**De volgorde waarin dit gebeurt** — dit is het advies uit sectie E van de review, hier vastgelegd als werkwijze:

1. **Bouwen en toetsen met verzonnen kinderen.** De groep uit bijlage A en de stijlvoorbeelden zijn testmateriaal én demonstratiemateriaal. Er gaat geen enkel echt kind de deur uit tot het geregeld is.
2. **De functionaris een werkende app laten zien in plaats van een plan.** Met het controlescherm erbij: dit is precies wat er weggaat, dit blijft op het apparaat. Dat gesprek verloopt anders dan een gesprek over een idee.
3. **Provider kiezen op wat er kan, niet op wat het beste schrijft.**
4. **DPIA en FRIA afronden, verwerkersovereenkomst via het bestuur, akkoord van de functionaris.**
5. **Pas dan echte gegevens.**

**Dit staat in de Definition of Done** (B-45). Het is geen aparte voorwaarde naast het proces maar een criterium erin, zodat "af" niet kan betekenen "af behalve de privacy".

### 15.7 Rechten van betrokkenen

De betrokkenen zijn de kinderen, vertegenwoordigd door hun ouders. Hun rechten worden uitgeoefend bij het schoolbestuur; EduFlow moet het bestuur in staat stellen ze na te komen.

| Recht | Hoe EduFlow het bedient |
|---|---|
| Inzage | FR-INS-41 levert een leesbaar overzicht van alles wat er over een leerling is vastgelegd, met een filter per kind |
| Rectificatie | elke documentatie is te wijzigen; er is geen bevroren versie |
| Wissen | een leerling verwijderen en de documentaties waarin hij voorkomt verwijderen; de app toont vooraf welke dat zijn |
| Beperking | archiveren haalt uit beeld zonder te verwijderen (FR-DOC-120) |
| Overdraagbaarheid | de back-up en het inzageoverzicht zijn open formaten (§13.8) |
| Bezwaar tegen geautomatiseerde besluitvorming | niet van toepassing: er worden geen besluiten genomen (B-25) |

**Het praktische geval dat het vaakst voorkomt.** Een ouder vraagt of zijn kind van de foto's af kan. De app moet dan kunnen tonen in welke documentaties dat kind voorkomt, en die documentaties moeten te wijzigen of te verwijderen zijn zonder dat de rest sneuvelt. Dat is precies waarom `studentIds` een geïndexeerde meerwaardige koppeling is (§8.5) en waarom foto's een `refCount` hebben (§8.3.7).

### 15.8 Toestemming voor beeldgebruik

Toestemming voor het gebruik van beeldmateriaal regelt de school, niet EduFlow. Wat EduFlow doet, is de gebruiker eraan herinneren op het enige moment waarop het ertoe doet: als er materiaal met foto's de school verlaat.

De bevestiging verschijnt bij de eerste deelbare afbeelding van een documentatie, en daarna niet meer voor diezelfde documentatie (B-08). Dat is een bewuste tussenweg: elke keer vragen leidt tot wegklikken zonder lezen, en één keer ooit is als controle waardeloos. De vraag gaat over deze fotoset, en fotosets verschillen per documentatie.

Het moment van bevestigen wordt vastgelegd in `imageConsentAt` (§8.3.5) en is zichtbaar in het logboek. Dat is geen bewijs van toestemming van de ouders — dat ligt bij de school — maar wel een aantoonbaar moment van bewuste afweging door de professional.

### 15.9 Beveiliging als privacymaatregel

De maatregelen staan in hoofdstuk 16. Wat hier telt, is welke ervan een privacyfunctie hebben:

| Maatregel | Privacyfunctie |
|---|---|
| Gegevens verlaten het apparaat niet | het aanvalsoppervlak is één laptop, niet een server met duizenden kinderen |
| Geen accounts, geen centrale opslag | er valt centraal niets te lekken |
| Versleutelde back-up | het enige bestand dat het apparaat verlaat, is beschermd |
| Tokens in `httpOnly`-cookies | geen postbustoegang via een script in de browser |
| Toegangscode | een openstaande laptop toont niet meteen documentaties |
| Snelheidslimiet | voorkomt dat een gestolen adres een gegevensstroom wordt |
| Geen inhoud in het logboek | verantwoording zonder tweede kopie |

En de eerlijke keerzijde, die ook in het gesprek hoort: **op één apparaat staan alle gegevens onversleuteld in IndexedDB.** Wie de laptop in handen heeft en hem ontgrendeld krijgt, heeft de documentaties. De maatregel daartegen is niet in de app te bouwen; hij heet schijfversleuteling en een schermvergrendeling, en die horen in het beleid van het bestuur. De app zegt dat in het scherm Over.

### 15.10 De privacyverklaring in de app

Eén scherm, geschreven voor een leerkracht en niet voor een jurist. Zes koppen:

1. **Wat er van kinderen wordt vastgelegd** — met de tabel uit §15.2 in gewone taal.
2. **Waar het staat** — op dit apparaat, in de opslag van je browser.
3. **Wat er weggaat als je AI gebruikt** — met de zin uit §15.4 en de verwijzing naar het controlescherm.
4. **Wat er nooit weggaat** — foto's, bijlagen, notities.
5. **Wat je zelf kunt doen** — inzien, wijzigen, wissen, back-up maken, alles wissen.
6. **Wie waarvoor verantwoordelijk is** — de tabel uit §15.1, in twee zinnen.

Deze tekst is onderdeel van het product en wordt bijgewerkt in dezelfde beweging als de code die de stromen verandert. Een privacyverklaring die achterloopt op de app is erger dan geen.

---
