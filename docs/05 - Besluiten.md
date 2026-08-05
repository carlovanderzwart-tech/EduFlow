# Besluiten

Elke keuze die de documenten verandert, met datum en reden. Nieuwste bovenaan.

Doc 00 zegt onder *Documentatie* dat alle belangrijke beslissingen in `docs` worden vastgelegd. Dit is die plek.

Verwijzingen hieronder gaan naar hoofdstukken, niet naar regelnummers — die verschuiven bij elke bewerking.

---

# 5 augustus 2026 — leerlingen en groepen als eigen gegevens

Aanleiding: bij het testen van sprint 2A bleek de namenlijst niet te volstaan. Hij kent geen kinderen die van school gaan, kan twee kinderen met dezelfde voornaam niet uit elkaar houden en kan geen achternamen afschermen. Onderstaande besluiten vervangen de namenlijst door een leerlingenregister.

## B-13 — Een documentatie heeft één groep en optioneel gekoppelde leerlingen

**Probleem.** Het veld leerlingen was één regel vrije tekst ("groep geel"), en doc 04 stelde uitdrukkelijk dat het géén lijst met kinderen was. Met een leerlingenregister moest opnieuw worden bepaald wat dat veld betekent.

**Besluit.** Beide. Een documentatie krijgt **één groep**, die zoals nu in de opmaak verschijnt, en daarnaast **optioneel nul of meer gekoppelde leerlingen**.

**Waarom.** De groep alleen zou de koppeling onmogelijk maken die je bij een documentatie over twee specifieke kinderen wilt. Alleen leerlingen zou van elke documentatie een aanvinkoefening maken, terwijl het merendeel over de hele groep gaat. Optioneel koppelen kost niets wanneer je het niet gebruikt.

**Gevolg.** De koppeling is geen vervanging van de afscherming. Die blijft op de **tekst** werken, want daar staan de namen — zie doc 04, *Namen van kinderen*. Wie je koppelt hoeft dus niet te kloppen met wie er in de tekst wordt genoemd.

## B-14 — Groepen worden een eigen entiteit

**Besluit.** Een groep is een eigen gegeven met een eigen `GroupService`, geen tekstveld op een leerling of documentatie.

**Waarom.** Een groep heeft nu alleen een naam, dus een tekstveld zou vandaag volstaan. Verwacht worden kleur, locatie, schooljaar en mentor, en die kunnen nergens heen als een groep alleen als tekst bestaat. Daarbij raakt hernoemen dan één record in plaats van elke leerling en elke documentatie met die naam erin.

**Gevolg.** Een extra store in IndexedDB. Een opgeruimde groep laat leerlingen en documentaties intact; die raken hun groepsverwijzing kwijt en blijven zichtbaar.

## B-15 — Wat er per leerling wordt vastgelegd

**Besluit.** Voornaam, achternaam, geboortedatum (volledig), groep, en actief of inactief. Voornaam en groep zijn verplicht; de rest mag leeg blijven.

**Waarom niet minder.** Achternaam is nodig om twee kinderen met dezelfde voornaam uit elkaar te houden en om achternamen te kunnen afschermen. De volledige geboortedatum is nodig voor verjaardagen in de agenda; alleen jaar en maand zou genoeg zijn voor de leeftijd, maar niet voor de dag.

**Waarom niet meer.** Er komen geen observaties, resultaten of bijzonderheden bij. Dat is de grens tussen dit register en een leerlingvolgsysteem, en die grens staat nu expliciet in doc 01 onder *Buiten scope*.

**Gevolg.** Dit is een verzwaring van de gegevens die EduFlow bewaart: van losse voornamen zonder context naar een set die een kind direct identificeert. De voorwaarde uit doc 00 verandert niet, maar wat er aan de functionaris gegevensbescherming wordt voorgelegd wél.

## B-16 — Leerlingenbeheer hangt onder Instellingen

**Besluit.** Leerlingen en groepen krijgen een eigen scherm, bereikbaar via Instellingen. De hoofdnavigatie blijft vijf items.

**Waarom.** Doc 04 legt de navigatie vast op vijf, en op de telefoon vijf iconen onderaan. Een zesde maakt die balk krap en geeft een dagelijkse plek aan iets wat je een paar keer per jaar doet.

**Gevolg.** Een eigen module `students/` in de code, maar geen eigen plek in de navigatie. Dat zijn twee verschillende dingen.

## B-17 — Technische besluiten (geen goedkeuring nodig)

| | Besluit | Vervangt |
|---|---|---|
| T-11 | `StudentService` kent geen bestandsformaten. CSV en Excel worden gelezen en geschreven door aparte adapters die records in en uit de service brengen. De service verwerkt records in bulk, kan droog draaien en geeft een rapport terug | Zonder deze scheiding zit CSV-kennis in de service en levert Excel erbij een tweede route door dezelfde logica op |
| T-12 | Naamvervanging werkt op het **volledige** register, inclusief inactieve leerlingen. Codes hangen aan het leerling-id, niet aan de plek in een lijst | Afschermen op alleen actieve leerlingen maakt oudere documentaties stilzwijgend onbeschermd |
| T-13 | Achternamen vallen ook onder de afscherming. Tussenvoegsels horen bij de achternaam en worden als geheel behandeld. Achternamen van één of twee letters worden overgeslagen | T-04 beschreef alleen voornamen |
| T-14 | Leerlingen worden op inactief gezet, nooit hard verwijderd. Echt verwijderen kan alleen via *alle gegevens wissen* | Volgt uit T-12 |

**T-04 blijft gelden**, met T-12 en T-13 als uitbreiding: de bron is het register in plaats van een losse lijst, en achternamen doen mee.

## B-18 — Import en export van leerlingen komen in versie 1

**Probleem.** Deze functionaliteit stond eerst gepland maar buiten versie 1. Bij het uitwerken bleek dat onhoudbaar: een groep van dertig leerlingen met achternaam en geboortedatum overtypen is een half uur werk waar niemand aan begint, en dan blijft het register leeg. Een leeg register betekent geen afscherming.

**Besluit.** Importeren uit CSV en Excel, en exporteren naar diezelfde formaten, horen bij versie 1.

**Waarom ook export.** Zolang `BackupService` niet bestaat is een leerlingexport het enige vangnet voor het register. Export is bovendien eenvoudiger dan import — geen kolomtoewijzing, geen voorbeeld — en dus eerder bruikbaar.

## B-19 — Archiveren is een handeling, geen derde status

**Probleem.** Aan het eind van een schooljaar moet een groep uit beeld, maar de leerlingen moeten bewaard blijven voor de afscherming. De verleiding is een status "gearchiveerd" naast actief en inactief.

**Besluit.** Archiveren is een handeling die twee bestaande velden zet: de groep krijgt `archived`, en alle leerlingen erin gaan op inactief.

**Waarom.** Een derde status betekent dat bij elke keuzelijst en elke afschermaanroep opnieuw de vraag is wat hij betekent. Met twee velden die er al zijn blijft dat eenduidig.

**Gevolg.** Gearchiveerde groepen en hun leerlingen tellen onverkort mee bij de naamvervanging. Dearchiveren haalt de groep terug maar laat de leerlingen inactief — massaal activeren zou een vertrokken kind terugzetten in de keuzelijsten.

## B-20 — Bestandsformaat en bronsysteem worden gescheiden

**Besluit.** De importpijplijn scheidt **formaatlezers** (CSV, Excel) van **bronprofielen** (EduFlow, ParnasSys, ESIS). Alle imports lopen langs één `StudentImporter`.

**Waarom.** Een leerlingadministratie levert doorgaans beide formaten. Zou de systeemkennis in de formaatlezer zitten, dan ontstaat er per combinatie een eigen route met eigen fouten. Nu is een nieuw systeem ondersteunen een profiel toevoegen, zonder bestaande logica aan te raken.

**Gevolg.** Bronprofielen zijn declaratieve tabellen, geen code met logica. Handmatige kolomtoewijzing is het vangnet voor onbekende bronnen en dus geen randgeval.

## B-21 — Bestanden dragen hun eigen schemaversie

**Besluit.** Elk bestand dat EduFlow maakt bevat `schemaVersion`, `createdAt`, `source`, `createdBy` en ruimte voor `metadata`. Bij import wordt de versie gelezen en de bijbehorende lezing gekozen.

**Waarom.** Een export van vandaag moet over jaren nog te importeren zijn. Zonder versie in het bestand is er geen manier om een oude indeling te herkennen, en wordt de nieuwe erop gewrongen.

**Eerlijk over de grens.** CSV is één platte tabel en kan die kenmerken niet dragen. Daar staat de versie in de bestandsnaam en wordt de indeling herkend aan de kolommen. Excel krijgt een apart tabblad. `createdBy` blijft leeg in versie 1, want er zijn geen accounts.

## B-22 — Technische besluiten (geen goedkeuring nodig)

| | Besluit | Vervangt |
|---|---|---|
| T-15 | Batchbewerkingen kennen geen verwijderen: alleen verplaatsen, op inactief en op actief zetten | Volgt uit T-14 |
| T-16 | De Excel-bibliotheek wordt pas geladen wanneer iemand een Excel-bestand kiest | Anders wordt de app zwaarder voor iedereen die hem nooit gebruikt |
| T-17 | Tekstcodering van een CSV wordt vastgesteld, niet aangenomen | Een verminkte naam breekt stilzwijgend de afscherming |
| T-18 | Datumnormalisatie hoort in het bronprofiel, niet in de validatie | Anders moet de validatie alle vormen van alle bronnen kennen |
| T-19 | Import verwijdert nooit; wie niet in het bestand staat blijft ongemoeid | Een onvolledige bronexport mag het register niet legen |

---

## Hoe je oudere besluiten leest

Besluiten van vóór vandaag spreken over de **namenlijst**. Die tekst blijft staan zoals hij is — dit document is een verslag van wat wanneer is besloten, en dat herschrijf je niet achteraf.

Lees daar **leerlingenregister** waar *namenlijst* staat. De onderliggende afspraak verandert niet: T-01 (persoonsgegevens horen in IndexedDB), T-08 (geen AI-aanroep zonder afscherming, tenzij eenmalig bevestigd) en B-11 (de app raadt geen namen, je houdt ze zelf bij) gelden onverkort. Alleen de vorm van de bron is veranderd.

---

# 4 augustus 2026 — review voor sprint 1

Aanleiding: doorloop van doc 00 t/m 04 op conflicten, gaten en gemiste kansen. 53 punten gevonden, waarvan 7 blokkerend. Onderstaande besluiten heffen die blokkers op.

## B-01 — Een documentatie leeft op één apparaat

**Probleem.** Doc 04 beschreef invoeren op de telefoon en afmaken op de laptop. IndexedDB staat per browser en per apparaat, dus die twee delen niets. De beschreven kernwerkwijze kon niet werken.

**Besluit.** Je begint en eindigt een documentatie op hetzelfde apparaat. Overzetten kan via een exportbestand met alle gegevens erin, dat je op een ander apparaat importeert.

**Waarom.** De alternatieven waren duurder. Server-opslag breekt het principe dat foto's het apparaat nooit verlaten en kan pas na akkoord van de functionaris gegevensbescherming. Niets doen laat een belofte in de documenten staan die niet waar te maken is.

**Gevolg.** Doc 04 (*scherm 3, keuze tussen twee modi*) is herschreven. Export én import komen in versie 1, niet in versie 2 — ze zijn ook de back-up (zie B-02).

## B-02 — De app moet op de iPhone op het beginscherm

**Probleem.** Safari verwijdert IndexedDB na zeven dagen zonder gebruik van de site. Twee weken vakantie en je documentaties zijn weg. `navigator.storage.persist()` dekt dat niet af: de bijbehorende WebKit-bug staat sinds 2020 open.

**Besluit.** Op de telefoon vraagt EduFlow bij het eerste gebruik om zichzelf op het beginscherm te zetten, met uitleg waarom. Webapps op het beginscherm zijn expliciet vrijgesteld van die zeven dagen. Daarnaast een herinnering om te exporteren als er een maand geen back-up is gemaakt.

**Waarom.** Zonder dit is de belofte "werk gaat niet verloren" onwaar op precies het apparaat dat het meest gebruikt wordt.

**Gevolg.** De eis "zonder installatie" in doc 02 (*niet-functionele eisen*) is genuanceerd: geen app store, geen installatiebestand, wel de vraag om het één keer op het beginscherm te zetten. Overslaan kan; de vraag komt dan terug.

## B-03 — Gespreksmodus: de foto's stellen de vragen

**Probleem.** Gespreksmodus is de helft van het belangrijkste scherm en had één zin beschrijving. Niet te bouwen.

**Besluit.** Op de telefoon kies je de foto's die je net gemaakt hebt. De app toont ze één voor één met een vraag erbij. Jij typt of dicteert een paar regels. De foto blijft op het apparaat; alleen je antwoord gaat naar de AI. Aan het eind bouwt AI daar een documentatie van.

**Waarom.** Dit maakt van een beperking een ontwerp. De AI krijgt context zonder dat er een foto de deur uit gaat, en het volgt de volgorde waarin je toch al werkt: fotograferen, terugkijken, opschrijven.

**Gevolg.** Datum en groepering kunnen uit de foto's komen. Wisselen naar schrijfmodus halverwege blijft mogelijk: de antwoorden staan al in het tekstveld.

## B-04 — Van de ontbrekende AI-functies gaat er één mee naar versie 1

**Probleem.** Doc 02 eiste AI-functies die niet in doc 04 stonden: bij documentatie een titelvoorstel en een vervolgzin op basis van de reeks, bij mail inkorten, uitbreiden, samenvatten en achteraf van toon wisselen. Doc 04 opent met de regel dat wat er niet in staat niet gebouwd wordt.

**Besluit.** De vervolgzin op basis van eerdere documentaties in dezelfde reeks komt in versie 1. De andere vijf gaan naar versie 2.

**Waarom.** De reeks-functie is het enige in de app dat een losse chatbot niet kan nadoen, want die kent je vorige documentaties niet.

**Gevolg.** Er gaat méér tekst over kinderen naar de AI dan eerst gedacht. Dit hoort expliciet in het gesprek met de functionaris gegevensbescherming, en de eerdere documentaties moeten zichtbaar zijn in het controlescherm.

## B-05 — Status volgt uit export

**Probleem.** Doc 04 toonde een status "concept of afgerond" die niemand kon zetten.

**Besluit.** Een documentatie staat op afgerond zodra je hem één keer hebt geëxporteerd naar PDF of afbeelding.

**Waarom.** Nul extra handelingen, en de lijst laat zien wat je daadwerkelijk hebt opgeleverd in plaats van wat je hebt aangeklikt.

## B-06 — Het exportscherm wordt een paneel

**Probleem.** Doc 04 verwees naar een "exportscherm" dat nergens beschreven stond.

**Besluit.** Tik op Print-PDF of Deelbare afbeelding en er schuift een paneel over het schrijfscherm met de vier miniaturen, een voorbeeld en de exportknop.

**Waarom.** Geen extra scherm om heen en weer te navigeren, en het werkt op een smal scherm.

## B-07 — Wat niet past loopt door naar een volgende pagina

**Probleem.** Templates hebben verschillende fotoaantallen; je mag er zes toevoegen. Doc 04 regelde alleen de situatie met te weinig foto's.

**Besluit.** Past de inhoud niet op één pagina, dan loopt de documentatie door naar een volgende, met de titel erboven herhaald. De deelbare afbeelding wordt één JPG per pagina. Hoeveel pagina's het worden hangt af van de template: zes foto's zijn één pagina in template A en drie in template C. Het exportpaneel toont het aantal vooraf.

**Gevolg.** De renderlaag moet paginabreuken aankunnen. Dat raakt ook Print-PDF.

## B-08 — Toestemming beeldgebruik: één keer per documentatie

**Probleem.** Doc 04 zei "eenmalig" zonder te zeggen eenmalig wat.

**Besluit.** De bevestiging verschijnt de eerste keer dat je van een documentatie een deelbare afbeelding maakt. Daarna niet meer voor diezelfde documentatie.

**Waarom.** De vraag gaat over de foto's, en die verschillen per documentatie. Elke keer vragen leidt tot wegklikken zonder lezen; één keer ooit is als controle waardeloos.

## B-09 — Delen in één tik

**Besluit.** De deelbare afbeelding gaat direct het deelmenu van de telefoon in. Op de laptop komt er "kopieer afbeelding" bij, zodat je hem in een mail plakt.

**Waarom.** Downloaden, terugzoeken in je fotorollen en dan pas versturen zijn vier handelingen voor iets wat er één kan zijn. Bij mail is de kopieerknop al de belangrijkste knop van het scherm; dit is dezelfde knop.

## B-10 — Jaarweergave in de agenda

**Besluit.** Op de laptop komt er een jaarweergave met alle vakanties, studiedagen en margedagen van het schooljaar.

**Waarom.** Zonder dit is het succescriterium "het schooljaar past in één overzicht" niet haalbaar met de gespecificeerde schermen.

## B-11 — Automatische templatekeuze en naamherkenning: niet doen

**Besluit.** De opmaak kies je zelf uit vier miniaturen. De namenlijst houd je zelf bij; de app raadt geen namen.

**Gevolg.** De controlelink "Bekijk wat er verstuurd wordt" is daarmee het enige vangnet voor namen die niet in de lijst staan. Die link moet dus compleet zijn: inclusief het stijlvoorbeeld, de systeeminstructie en eerdere documentaties uit de reeks.

## B-12 — Technische besluiten (geen goedkeuring nodig)

| | Besluit | Vervangt |
|---|---|---|
| T-01 | Alles met persoonsgegevens naar IndexedDB, inclusief de namenlijst en het stijlvoorbeeld. localStorage alleen voor regio, standaardtoon, provider, laatst gekozen weergave, back-updatum en de eenmalige vragen. De toegangscode in een cookie. | De oude opslagindeling dekte zes van de negen instellingen niet |
| T-02 | Foto's verkleinen naar 3300 px in plaats van 2400 px | 2400 px haalt 300 dpi tot 203 mm; een A4 liggend is 297 mm breed |
| T-03 | Print-PDF wordt in de app gegenereerd, niet via de printfunctie van de browser | Safari negeert `@page { size: A4 landscape }` op desktop én iOS |
| T-04 | Namen vervangen met woordgrenzen, hoofdletterherstel, langste naam eerst, Nederlandse verbuigingen en unieke codes bij dubbele voornamen | Doc 01 stelde het als garantie zonder regels |
| T-05 | De app draait op een eigen webadres met snelheidslimiet en een toegangscode per apparaat | Zonder slot is `/api/ai` een gratis AI-dienst op eigen rekening |
| T-06 | Standaardprovider met verwerking binnen de EU | Zie doc 01, randvoorwaarden |
| T-07 | Ongedaan maken na "Overnemen" | Autosave overschrijft de vorige versie direct |
| T-08 | Geen AI-aanroep bij een lege namenlijst zonder eenmalige bevestiging | Anders werkt de afscherming stilzwijgend niet |
| T-09 | Zoeken via een index in het geheugen; foto's opruimen bij verwijderen; autosave met vertraging; waarschuwing bij 80% van de opslaglimiet | Niet eerder belegd |
| T-10 | `04 - product blueprint` hernoemd naar `04 - Product Blueprint.md` | Werd op GitHub niet als document weergegeven |

---

# Openstaand

- **Stijlvoorbeelden.** Drie of vier paren van "zo maak ik de notitie" en "zo hoort de documentatie eruit te zien", met verzonnen namen. Dit is testmateriaal én de richtlijn voor de AI. Zonder dit is niet vast te stellen of AI het goed doet.
- **Verzonnen groep.** Twintig leerlingen, nu met voornaam, achternaam en geboortedatum, verdeeld over twee groepen. Om mee te bouwen en te testen zonder dat er een echt kind de deur uit gaat. Met daarin bewust een paar lastige gevallen: twee kinderen met dezelfde voornaam, een naam met een tussenvoegsel, een naam met een diakriet, en een inactieve leerling.
- **Gesprek met de functionaris gegevensbescherming.** Voorwaarde voordat er echte gegevens in gaan. Zie doc 00, *Voorwaarde voor gebruik met echte gegevens* — die staat bewust naast de Definition of Done en niet erin, want hij geldt voor de app als geheel en niet per functionaliteit. Sinds B-15 gaat dit gesprek over meer dan voornamen; het register is onderdeel van wat er wordt voorgelegd.
- **Migratie van de bestaande namenlijst** naar het leerlingenregister. De oude lijst kent alleen voornamen, dus groep en geboortedatum kunnen niet worden afgeleid. Uitwerken in de Issue die dit bouwt, niet hier.
