<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 2. Productfilosofie

### 2.1 De tien uitgangspunten

Deze tien staan vast. Ze zijn geen richtlijn en geen streven, maar de toets waarlangs elk voorstel gaat: een idee dat er niet doorheen komt, wordt niet beschreven en dus niet gebouwd (zie §2.3).

| # | Uitgangspunt | Wat het in de praktijk betekent |
|---|---|---|
| U-01 | AI ondersteunt, en verstuurt nooit zelfstandig informatie naar derden | Elke uitgaande handeling is een menselijke handeling. De app vraagt technisch geen verzendrechten aan. |
| U-02 | Eén bron van waarheid | Elk gegeven staat op precies één plek. Afgeleide waarden worden berekend, niet gekopieerd. |
| U-03 | Geen dubbele businesslogica | Regels staan in de servicelaag, nooit in een scherm, nooit twee keer, nooit ook in een renderer. |
| U-04 | Desktop first | Het ontwerp begint bij 1280 px breed. De telefoon is een volwaardige, maar afgeleide weergave. |
| U-05 | Eenvoud boven complexiteit | Bij twijfel: de kleinere oplossing. Een functie die uitleg nodig heeft, is verkeerd ontworpen. |
| U-06 | Documentaties bestaan uit pagina's | `Page` is een eerste-klas entiteit met een eigen opslagrecord, geen opmaakgevolg. |
| U-07 | Meerdere groepen per leerling en per documentatie | Lidmaatschap is een eigen entiteit met een looptijd. Geen `groupId` op een leerling. |
| U-08 | Agenda, Documentaties en Mail vormen versie 1.0 | Plus Dashboard en Instellingen als dienende modules. Meer niet. |
| U-09 | AI leert van feedback en schrijfstijl | Lokaal, zonder modeltraining, zichtbaar en bewerkbaar voor de gebruiker. |
| U-10 | De gebruiker houdt altijd de regie | Elk AI-resultaat is een voorstel. Overnemen is een handeling. Alles is terug te draaien. |

#### 2.1.1 U-01 — AI ondersteunt en verstuurt nooit zelfstandig

**Betekenis.** Niets verlaat het apparaat zonder dat een mens op dat moment een knop indrukt. Geen instelling, geen belofte in een verklaring: het verzendrecht wordt technisch niet aangevraagd.

**Dwingt af.** De mailmodule vraagt alleen het recht om berichten te lezen en een concept in je eigen postbus te schrijven; `Mail.Send` en `gmail.send` staan niet in de aanvraag en dus ook niet in het toestemmingsscherm dat de gebruiker ziet. Er is geen verzendknop, en ook geen uitgestelde variant met een annuleerknop — dat is versturen met een pauze.

**Doet pijn.** Je hebt een concept af en moet dan naar Outlook, het openen en zelf verzenden: drie handelingen waar er één had gekund.

**Toets.** Kan dit idee informatie buiten het apparaat brengen zonder menselijke handeling op dat moment, of staat er een recht in de aanvraaglijst dat de app niet strikt nodig heeft? Eén keer ja is genoeg om af te wijzen.

#### 2.1.2 U-02 — Eén bron van waarheid

**Betekenis.** Elk gegeven staat op precies één plek. Wat je kunt afleiden, leid je af en sla je niet op.

**Dwingt af.** De status van een documentatie is geen veld dat iemand zet: concept en gedeeld volgen uit het bestaan van een geslaagde export. De reeksnaam is een verwijzing en geen voorvoegsel in de opgeslagen titel, zodat het hernoemen van een reeks negen documentaties tegelijk bijwerkt. Wat uit de lidmaatschappen volgt, wordt getoond als suggestie en niet weggeschreven.

**Doet pijn.** Het overzicht moet bij elk laden de afgeleide koppelingen uitrekenen; bij 1.000 documentaties is dat werk dat één gekopieerd veld had voorkomen. Dat los je op met een index in het geheugen, niet met een tweede opslagplek.

**Toets.** Als ik dit gegeven op twee plekken wijzig, kunnen ze dan uit elkaar lopen? Zo ja: welke is de waarheid, en waarom bestaat de andere nog?

#### 2.1.3 U-03 — Geen dubbele businesslogica

**Betekenis.** Een regel bestaat één keer, in een service. Niet in een scherm, niet in een component, niet ook nog in de renderlaag.

**Dwingt af.** Layout is data: één set layoutdefinities in millimeters op een A4-liggend canvas van 297 × 210 mm voedt zowel het scherm als de PDF, en de deelbare afbeelding wordt uit die PDF gerasterd. Daarmee bestaat de vraag "past dit blok nog op deze pagina" op precies één plek — `PageService` beslist, `RenderService` tekent.

**Doet pijn.** Het scherm mag de opmaak niet "even mooier" maken. Millimeters op een liggend A4 zien er op een breed scherm anders uit dan een ontwerper zou kiezen, en dat blijft zo.

**Toets.** Bestaat deze regel al ergens? Roep die aan. Zo niet: in welke service hoort hij thuis? Een regel in een React-component is per definitie fout, want modules bevatten alleen schermen en schermcomponenten.

#### 2.1.4 U-04 — Desktop first

**Betekenis.** Elk scherm wordt eerst ontworpen op 1280 px breed. De telefoon is volwaardig maar afgeleid: dezelfde gegevens, dezelfde services, één layout-implementatie.

**Dwingt af.** De jaarweergave bestaat alleen op de laptop en is daar tussen 1 juli en 15 september de standaardweergave. Rij-acties zitten achter een zichtbare knop met drie punten en niet achter lang indrukken, want lang indrukken bestaat niet op een laptop.

**Doet pijn.** Voor Fatima is het afgeleide scherm het enige scherm dat zij ooit ziet: haar belangrijkste route wordt ontworpen vanaf een apparaat dat zij niet gebruikt. Tegenmaatregel: vrijgeven na een test op een telefoon, nooit in een versmald venster.

**Toets.** Is dit scherm eerst op 1280 px ontworpen, en werkt het daarna op 390 px zonder een tweede layout-implementatie? Een tweede implementatie is verboden, ook als hij mooier is.

#### 2.1.5 U-05 — Eenvoud boven complexiteit

**Betekenis.** Bij twijfel de kleinere oplossing. Een functie die uitleg nodig heeft is verkeerd ontworpen, en een instelling is meestal een beslissing die iemand niet durfde te nemen.

**Dwingt af.** Geen automatische opmaakkeuze: je kiest zelf uit vier miniaturen. Geen naamherkenning: de leerlingenlijst houd je zelf bij. Beide waren goede ideeën die een uitlegtekst nodig hadden om vertrouwd te worden, en dat is precies het signaal.

**Doet pijn.** Zelf de lijst bijhouden kost werk in september en wordt in maart vergeten, en een naam die er niet in staat wordt niet vervangen. De prijs is dat het controlescherm het enige vangnet is en daarom compleet moet zijn: systeeminstructie, stijlprofiel, voorbeelden, reekscontext en je eigen tekst.

**Toets.** Kun je de functie in één zin uitleggen aan iemand die de app niet kent, zonder "en dan moet je"? Heeft hij een eigen instelling nodig om acceptabel te zijn? Dan is hij niet af.

#### 2.1.6 U-06 — Documentaties bestaan uit pagina's

**Betekenis.** `Page` is een eerste-klas entiteit met een eigen opslagrecord, een volgnummer en een `layoutId` — geen gevolg van opmaak, maar een ding dat je kunt toevoegen, verplaatsen en verwijderen.

**Dwingt af.** Kies je de layout met alleen beeld bij een documentatie die tekst bevat, dan verdwijnt die tekst niet maar krijgt hij een vervolgpagina, en dat kan alleen als een pagina een record is. De titel wordt op elke vervolgpagina herhaald: een eigenschap van de pagina, niet van de tekst.

**Doet pijn.** Het schrijfscherm is geen doorlopend tekstvak: je schrijft blokken die aan genummerde sloten worden toegewezen. Dit is de plek waar dit uitgangspunt het hardst tegen U-05 aan schuurt.

**Toets.** Kan de gebruiker dit terugvinden als "pagina 2 van 3"? Verandert het aantal pagina's als de opmaak verandert, en blijft de inhoud dan volledig?

#### 2.1.7 U-07 — Meerdere groepen per leerling en per documentatie

**Betekenis.** Lidmaatschap is een eigen entiteit met een begin- en een einddatum; een leerling heeft geen `groupId`. Een documentatie kan aan meerdere groepen hangen, en een expliciete koppeling wint van een afgeleide.

**Dwingt af.** Bij de jaarovergang worden lidmaatschappen afgesloten met een einddatum en niet verwijderd. Daardoor kan Joost in maart 2027 nog terugvinden wat er in september 2026 over Kjeld is vastgelegd; zonder looptijd is die vraag alleen te beantwoorden door de geschiedenis te vervalsen.

**Doet pijn.** Elk scherm dat "de groep van deze leerling" toont, moet een peildatum kiezen, en soms zijn er twee antwoorden. Ook de invoer is duurder: iemand aan een groep toevoegen is een lidmaatschap maken met een datum.

**Toets.** Gaat dit scherm uit van één groep per leerling? Dan is het fout. Welke peildatum hanteert het, en staat die zichtbaar op het scherm?

#### 2.1.8 U-08 — Agenda, Documentaties en Mail vormen versie 1.0

**Betekenis.** Drie kernmodules plus Dashboard en Instellingen als dienende modules. Wat in geen van de vijf past, is geen versie-1.0-functie.

**Dwingt af.** Geen koppeling met Momento zolang er geen officiële programmeerkoppeling is, want de enige alternatieve route zou browserautomatisering zijn en die is verboden. Geen synchronisatie met een externe agenda; wel ICS-import en ICS-export, want dat is een bestand en geen koppeling.

**Doet pijn.** De meest gevraagde functies liggen vrijwel altijd net buiten de lijn. Delen met een duo-collega valt onder `SyncService` en dus onder fase 2: Bram krijgt in versie 1.0 alleen wat op zijn eigen apparaat staat, en dat wordt niet weggeschreven als "later beter".

**Toets.** In welke van de vijf modules valt dit? In geen enkele: buiten versie 1.0. In twee of meer: dan is het waarschijnlijk een doorsnijdend onderdeel en hoort het bij Privacy, AI, Zoeken, Back-up of de eerste-keer-ervaring.

#### 2.1.9 U-09 — AI leert van feedback en schrijfstijl

**Betekenis.** Drie mechanismen, alle drie lokaal en zichtbaar: gemeten stijlkenmerken, selectie van gelijkende eerdere teksten als voorbeeld, en correctieregels. Er wordt geen model getraind en ook niet bijgesteld.

**Dwingt af.** Het stijlprofiel is een leesbaar bestand in Instellingen dat je kunt lezen, wijzigen en wissen. Een correctieregel ontstaat pas nadat jij hem bevestigt: haal je hetzelfde woord drie keer weg, dan stelt de app voor het op de vermijdlijst te zetten. De app zet er zelf niets op.

**Doet pijn.** Leren gaat traag: de eerste twintig documentaties leveren een dun profiel op, en juist dan moet je het meeste herschrijven. Bovendien maakt elk geleerd kenmerk het controlescherm langer.

**Toets.** Kan de gebruiker zien wat de app geleerd heeft, en het wijzigen en wissen? Gaat er iets naar een provider met het doel te trainen? Dan is het fout, ongeacht wat die provider belooft.

#### 2.1.10 U-10 — De gebruiker houdt altijd de regie

**Betekenis.** Elk AI-resultaat is een voorstel, overnemen is een handeling, en alles is terug te draaien.

**Dwingt af.** "Overnemen" vraagt aanvullen of vervangen en zet een herstelpunt vóór de wijziging; autosave met vertraging mag dat herstelpunt niet overschrijven. Verwijderen is markeren en nooit wissen. Het controlescherm toont de volledige opdracht en geen samenvatting, want een samenvatting is een oordeel van de app over wat jij mag zien.

**Doet pijn.** Regie kost handelingen, en handelingen kosten seconden die tegen de belofte uit §1.6 in werken. Het controlescherm lezen kost tijd die in de nulmeting niet bestond, en die tijd wordt meegeteld in de nameting.

**Toets.** Kan de gebruiker deze handeling terugdraaien, en zo nee, is dat vooraf expliciet gemaakt? Gebeurt er iets zonder dat de gebruiker het heeft aangeraakt? Dan is het fout, ook als het handig is.

### 2.2 De hiërarchie van uitgangspunten

Uitgangspunten botsen. Zonder rangorde wint bij elke botsing het uitgangspunt waar de bouwer op dat moment het meest voor voelt, en dan is er geen kader maar een stemming. De rangorde staat daarom vast.

| Rang | Uitgangspunten | Waarom hier |
|---|---|---|
| 1 | U-01, U-10 | Onomkeerbare schade. Een verkeerd verstuurde tekst haal je niet terug. |
| 2 | U-02, U-03 | Gegevens en regels die uit elkaar lopen leveren fouten op die je maanden later ontdekt. |
| 3 | U-06, U-07 | Het datamodel is het duurst om achteraf te veranderen. |
| 4 | U-08 | Scope beschermt de oplevering tegen goede ideeën. |
| 5 | U-09 | Waardevol, maar de app werkt zonder. |
| 6 | U-04 | Een startpunt voor het ontwerp, geen belofte aan de gebruiker. |
| 7 | U-05 | De scheidsrechter als niets hierboven beslist. |

U-05 staat onderaan, en dat betekent niet dat eenvoud onbelangrijk is. Het betekent dat eenvoud bijna nooit als enige in het geding is. Beslist geen enkel hoger uitgangspunt, dan beslist U-05, en dan is hij absoluut.

#### 2.2.1 Desktop first tegen gespreksmodus op de telefoon

U-04 zegt dat het ontwerp begint op 1280 px, maar gespreksmodus bestaat alleen op 390 px, in de hand van iemand die buiten staat. Ontwerp je die vanaf de laptop, dan krijg je een gespreksvenster in een kolom — precies het patroon dat met één hand niet werkt.

U-04 wint voor de plaats in de navigatie, de gegevensstructuur en de layout-implementatie. De interactie wint voor de telefoon: één foto tegelijk, groot, met het antwoordveld eronder, en op de laptop dezelfde opbouw gecentreerd in een kolom van 640 px. De acceptatietest draait op een telefoon, want U-04 beschermt tegen twee layout-implementaties en niet tegen een interactie die van één apparaat komt. **De regel is: een telefoonspecifieke interactie mag, een tweede layout-implementatie nooit.**

#### 2.2.2 Eenvoud tegen AI die van feedback leert

U-09 brengt vier begrippen mee die de gebruiker in principe moet snappen: stijlprofiel, vermijdlijst, voorbeeldselectie en correctievoorstel. U-05 zegt dat een functie die uitleg nodig heeft verkeerd ontworpen is. U-09 wint op het bestaan, U-05 op de vorm. Het profiel bestaat, maar niemand hoeft ervan te weten om de app te gebruiken: het staat op één scherm in gewone zinnen — "Je schrijft gemiddeld 14 woorden per zin" — met drie knoppen, en met één schakelaar voor alle drie de mechanismen samen. Dat kost fijnregeling, want voorbeeldselectie is niet apart uit te zetten. **De regel is: heeft een lerend mechanisme een eigen instelling nodig om acceptabel te zijn, dan is het mechanisme niet goed genoeg.**

#### 2.2.3 Eén bron van waarheid tegen lokaal-eerst

Lokaal-eerst betekent dat dezelfde documentatie via export en import op twee apparaten kan staan. Dan zijn er twee exemplaren, en U-02 zegt dat elk gegeven op precies één plek staat. U-02 wint, maar op recordniveau en niet op apparaatniveau. Elk record heeft een sleutel als UUIDv7 plus `rev`, `origin`, `updatedAt` en `deletedAt`, en een geïmporteerd record met dezelfde sleutel is hetzelfde record en geen kopie. Bij import beslist één vaste regel welke versie wint: de hoogste `rev`, bij gelijke `rev` de hoogste `updatedAt`, bij gelijke `updatedAt` het record met het `origin` van het importerende apparaat. De verliezer wordt zichtbaar bewaard als conflictkopie. Dat kost iets: importeren is nooit "gewoon toevoegen" maar altijd een samenvoeging met een zichtbare uitkomst. **De regel is: twee apparaten mogen dezelfde gegevens hebben; twee records met verschillende sleutels mogen nooit hetzelfde ding beschrijven.**

#### 2.2.4 De gebruiker houdt de regie tegen zo min mogelijk klikken

"Zo min mogelijk klikken" is geen uitgangspunt, maar wel de belofte uit §1.6, en elke bevestiging kost een handeling. U-10 wint altijd, maar met een grens aan hoe vaak hij zich laat gelden. **De regel is: bevestig alleen wat onomkeerbaar is of wat informatie naar buiten brengt; al het andere draai je terug in plaats van het vooraf te bevestigen.**

Toegepast: "Overnemen" houdt de vraag aanvullen of vervangen, want dat is een inhoudelijke keuze en geen bevestiging. Weggooien krijgt géén bevestigingsvenster, want verwijderen is markeren. De toestemming voor beeldgebruik komt één keer per documentatie bij de eerste deelbare afbeelding en niet nog eens bij de tweede, want die voegt geen afweging toe. Autosave vraagt nooit iets.

#### 2.2.5 AI ondersteunt tegen de postbus lezen

Dit is de scherpste botsing in het product. U-01 zegt dat de app geen informatie naar derden brengt, maar om een oudermail samen te vatten gaat de inhoud van een bericht naar een AI-provider — geschreven door iemand die nooit met EduFlow heeft ingestemd en die niet weet dat het gebeurt. U-01 wint, en dat maakt het lezen duur. Een bericht wordt alleen opgehaald als je het opent, nooit vooruit en nooit in de achtergrond, en de cache vervalt na 7 dagen. Elke ontvangen mail gaat door `PrivacyService` vóór het samenvatten, inclusief afzendergegevens en handtekening, en het controlescherm toont de gepseudonimiseerde tekst voordat er iets weggaat. Samenvatten start nooit vanzelf bij het openen; het is een knop die je indrukt, per bericht. Dat kost het overzicht: je kunt niet je hele postvak laten samenvatten en je krijgt geen dagelijkse samenvatting. **De regel is: gegevens van iemand die niet je gebruiker is, gaan alleen naar een derde na een handeling van je gebruiker, op één bericht tegelijk, gepseudonimiseerd en zichtbaar.**

### 2.3 Scope-discipline

Wat niet beschreven staat, wordt niet gebouwd. Die regel geldt ook omgekeerd: wat beschreven staat, wordt gebouwd, anders is de beschrijving een wenslijst en verliest de eerste regel zijn kracht.

De reden dat deze regel hier zwaarder weegt: één persoon draagt drie petten. Er is geen product owner die nee zegt tegen de ontwikkelaar, want dat is dezelfde persoon op een andere dag. De beschrijving ís de nee.

Een goed idee dat buiten scope valt, doorloopt vijf stappen.

1. Het gaat in één zin naar het ideeënregister, met datum en aanleiding.
2. Het wordt niet gebouwd. Ook niet "even", ook niet als het tien regels code lijkt: tien regels zijn nooit tien regels, maar tien regels plus een test, plus een schermtekst, plus een regel in de privacyverantwoording, plus onderhoud tot het einde van het product (zie §2.4).
3. Het register wordt op één moment gelezen: bij het vaststellen van de volgende versie-afbakening. Niet tussendoor, en niet op een avond waarop het bouwen tegenzit.
4. Een idee dat drie keer uit de praktijk terugkomt, is geen idee meer maar een gemis, en krijgt voorrang bij de volgende afbakening.
5. Een idee dat een uitgangspunt schendt, gaat naar het besluitenregister met de reden waarom het niet kan (zie hoofdstuk 19). Anders komt het elk halfjaar opnieuw langs.

De uitzondering die geen uitzondering is: een fout in iets dat beschreven staat, repareer je meteen, want een fout is geen nieuwe functie. Het onderscheid is scherp genoeg om alleen te hanteren: staat het gedrag beschreven en doet de app het anders, dan is het een fout; doet de app precies wat er staat en bevalt dat niet, dan is het een gemis en gaat het naar het register.

### 2.4 De kostenkant van een functie

Een functie kost niet wat hij kost om te bouwen. Hij kost vijf dingen, en de bouw is meestal de kleinste.

| As | Wat het is | Hoe je het schat |
|---|---|---|
| Bouw | Ontwerp, code en de eerste tests | Uren, eenmalig |
| Onderhoud | Meebewegen met alles wat verandert zolang het product bestaat | Percentage van de bouwtijd per jaar; reken met 25% |
| Uitleg | Schermtekst, plek in de eerste-keer-ervaring, de vraag van een collega | Aantal zinnen dat iemand moet lezen om de functie te begrijpen |
| Testwerk | Eenheidstests, schermtests, gouden testset, foutpaden | Aantal nieuwe testgevallen, inclusief de gevallen waarin het misgaat |
| Privacyverantwoording | Wat gaat er extra de deur uit en wat moet Karin daarvan kunnen zien | Aantal nieuwe gegevenssoorten richting een derde |

Een functie komt pas in scope als alle vijf de assen zijn ingevuld. Een lege as is geen nul; een lege as betekent dat er niet over nagedacht is. En als één as een uitgangspunt schendt, hoef je de andere vier niet meer in te vullen.

#### 2.4.1 Automatische opmaakkeuze — afgewezen

Het idee: de app kiest de layout uit de inhoud. Veel foto's en weinig tekst wordt een fotoraster, veel tekst wordt de verhaallayout, één foto wordt groot beeld, geen tekst wordt alleen beeld. De miniaturen blijven staan om te overrulen.

Bouw: laag, ongeveer een dagdeel. Onderhoud: hoog, want de regel moet meebewegen met elke wijziging aan een layout en met de vervolgpagina bij alleen beeld. Uitleg: hoog, want als de app kiest en jij kiest anders, moet je begrijpen waarom hij koos, anders vertrouw je hem niet. Testwerk: hoog — vier layouts maal fotoaantal maal tekstlengte maal wel of geen citaten, plus het geval waarin je overrulet en daarna nog een foto toevoegt. Privacy: nul.

Uitkomst: de functie bespaart één tik op een miniatuur die je toch al bekijkt, en daar staan een uitlegtekst, een regel die met elke layoutwijziging meemoet en een testmatrix tegenover. Afgewezen.

#### 2.4.2 Naamherkenning — afgewezen

Het idee: hoofdletters midden in een zin die niet in de leerlingenlijst staan en die geen gewoon Nederlands woord zijn, worden aangeboden met de vraag "Is dit een naam?". Zeg je ja, dan staat hij er voortaan in.

Bouw: middel. Onderhoud: hoog, want je hebt een onderhouden lijst van gewone Nederlandse woorden nodig. Uitleg: hoog, want de gebruiker moet begrijpen dat "nee" niet betekent dat de vraag nooit meer komt. Testwerk: hoog en principieel niet af te ronden, want je kunt niet aantonen dat er geen naam gemist wordt.

De privacy-as is hier de duurste, en dat is contra-intuïtief bij een functie die privacy zegt te verbeteren. Een functie die aankondigt namen te herkennen, verschuift de verantwoordelijkheid van de gebruiker naar de app terwijl de app het niet kan garanderen. Karin vraagt dan terecht naar de foutmarge, en die is niet te geven: Roos en Sam zijn gewone Nederlandse woorden en komen als naam in dezelfde groep voor. Het resultaat is een vangnet dat je niet mag beloven en waar mensen wel op gaan leunen. Afgewezen: de lijst blijft handwerk en het controlescherm blijft het vangnet.

#### 2.4.3 Volledige mailclient — afgewezen

Het idee: als je toch de postbus leest, kun je net zo goed mappen tonen, zoeken, markeren als gelezen, archiveren en versturen.

De privacy-as is meteen fataal: versturen betekent het verzendrecht aanvragen, en dat breekt U-01 en de technische garantie eronder in één beweging. Daarmee is de afweging klaar en hoeven de andere vier assen niet meer geschat te worden — al zouden ze alle vier zeer hoog uitvallen, met twee aanbieders die elk een eigen koppeling hebben die jaarlijks wijzigt. Afgewezen op de eerste as.

### 2.5 Bouwvolgorde als filosofie

De bouwvolgorde is geen planning maar een uitspraak over wat je durft te beloven. De regel eronder: bouw eerst wat een belofte waarmaakt, dan pas wat die belofte doet.

#### 2.5.1 Instellingen vóór documentatie

Instellingen is de saaiste module en hij komt eerst. Niet het geheel, maar precies het deel dat documentatie nodig heeft: leerlingen, groepen, reeksen, het stijlvoorbeeld en de standaardwaarden.

De reden is dat de bescherming zonder die gegevens stilzwijgend niets doet. Is de leerlingenlijst leeg, dan vindt `PrivacyService` niets om te vervangen, gaat de tekst integraal naar de provider, en komt er geen foutmelding. Een beveiliging die geruisloos niet werkt is erger dan geen beveiliging, want je vertrouwt erop. Daarom staat er een zichtbare grendel op: geen AI-aanroep bij een lege lijst zonder dat je dat één keer bewust hebt bevestigd.

Dezelfde redenering geldt voor het stijlvoorbeeld, de richtlijn waarop de AI stuurt. Zonder dat voorbeeld levert de AI generieke tekst, en die herschrijf je volledig — precies faalscenario 1 uit §1.7.2, veroorzaakt door een bouwvolgorde in plaats van door de techniek.

#### 2.5.2 Back-up vóór de eerste echte gebruiker

Export én import zitten in de eerste oplevering en niet in versie 2. Een export die je niet kunt terugzetten is geen back-up maar een afdruk.

De aanleiding is concreet. Een documentatie leeft op één apparaat, en op de iPhone wist de browser de opslag na zeven dagen zonder gebruik van de site tenzij de app op het beginscherm staat — twee weken vakantie is genoeg. De eerste echte gebruiker is de maker zelf, en die krijgt de app niet in handen zonder een geteste terugzetroute.

Dezelfde regel geldt voor de functieschakelaars per module: die komen vóór de tweede module. Zonder schakelaar wordt "het staat er al maar het werkt nog niet" de normale toestand van het product, en dan is er geen moment meer waarop iets af is.

### 2.6 Beslissen bij onzekerheid

De werkwijze bestaat uit drie handelingen die altijd samen gebeuren: neem het besluit, schrijf het op in het besluitenregister, en zet er een herzieningsmoment bij.

Wachten is ook een besluit, maar dan zonder datum en zonder eigenaar. Een open vraag in een specificatie kost bij elke lezing opnieuw aandacht en levert bij elke lezing een net iets ander antwoord, en na drie maanden weet niemand meer welk antwoord er gold toen er code omheen werd geschreven. Daarom staat er in dit document geen enkele open vraag en geen enkel "waarschijnlijk".

Een registratie is compleet als hij zes dingen bevat: het nummer, de datum, het besluit in één zin, het probleem dat eraan voorafging, de reden voor deze richting en niet de andere, en het gevolg voor de rest van het product (zie hoofdstuk 19).

Het herzieningsmoment is een datum of een gebeurtenis, nooit "later". Drie voorbeelden zoals ze in het register staan:

- De providerkeuze wordt herzien zodra een aanbieder rechtstreekse verwerking binnen de EU levert die het bestuur accepteert.
- Het besluit dat een documentatie op één apparaat leeft, wordt herzien bij het vaststellen van fase 2, uiterlijk 1 juli 2027.
- De doelwaarde van 40% wordt herzien na de nameting, uiterlijk 1 juli 2027.

Een herziening vraagt nieuwe informatie. Geen nieuwe informatie, geen herziening — ook niet als het besluit ongemakkelijk uitpakt. Ongemak is geen informatie.

Een besluit dat achteraf fout blijkt, wordt vervangen en niet verwijderd: het oude blijft leesbaar staan met de reden waarom het verviel, want een verwijderd besluit komt na een jaar terug als goed idee.

En omdat één persoon drie petten draagt, is de zelfcontrole een formele stap met een eigen datum. Een besluit dat je alleen neemt, controleer je met een checklijst op een latere dag dan je het nam. Dat is geen gebaar maar een eis: dezelfde dag betekent hetzelfde hoofd.

Elk besluit in dit document is definitief tot het herzien is. Twijfel hoort in het herzieningsmoment, niet in de zin.

---
