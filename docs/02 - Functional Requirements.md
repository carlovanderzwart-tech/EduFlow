# Functional Requirements

Wat EduFlow moet kunnen. Hoe het eruitziet staat in document 04.

Versie 1 bestaat uit vijf onderdelen: dashboard, documentatie, mail, agenda en instellingen. Documentatie beslaat twee schermen (een overzicht en een bewerkscherm) plus een exportpaneel.

---

# Dashboard

De gebruiker kan:

- zien wat er vandaag en morgen in de agenda staat;
- direct een documentatie, mail of afspraak beginnen;
- de laatste vijf documentaties én de laatste vijf mailconcepten openen, gesorteerd op wanneer ze voor het laatst zijn gewijzigd;
- naar iedere module navigeren.

Geen statistieken, geen tellers.

---

# Documentatie

Het belangrijkste onderdeel.

## Een documentatie bevat

- reeks (optioneel — een doorlopend project waar deze documentatie bij hoort)
- titel
- groep (één, gekozen uit de eigen groepen)
- gekoppelde leerlingen (optioneel, nul of meer uit de gekozen groep)
- datum (de dag waarop het gebeurde; kan afwijken van de dag waarop je het opschrijft)
- tekst (één doorlopend veld)
- citaten van kinderen (optioneel, los toe te voegen)
- foto's (nul tot ongeveer zes)
- opmaaktemplate
- status (concept of afgerond)

**Groep en gekoppelde leerlingen doen verschillend werk.** De groep vertelt over wie het gaat en verschijnt in de opmaak; die kies je altijd. Leerlingen koppelen is optioneel en bedoeld voor het geval een documentatie echt over een paar specifieke kinderen gaat. Wie je koppelt hoeft niet te kloppen met wie er in de tekst wordt genoemd — de tekst blijft leidend, en de afscherming werkt op de tekst en niet op de koppeling.

**Koppelen is nooit verplicht.** Een documentatie over de hele groep koppelt niemand, en dat is de normale situatie.

Er moet tekst zijn, of foto's, of allebei. Al het andere is optioneel. Een documentatie met alleen foto's moet gewoon kunnen opslaan.

Een documentatie zonder tekst én zonder foto's wordt niet bewaard. Verlaat de gebruiker zo'n scherm, dan verdwijnt hij zonder melding.

**Status wordt niet met de hand gezet.** Een documentatie staat op afgerond zodra hij één keer is geëxporteerd. Daarvoor is hij concept.

## De gebruiker kan

- een documentatie maken in schrijfmodus (zelf typen, AI verbetert achteraf);
- een documentatie maken in gespreksmodus (foto's kiezen, AI stelt er vragen bij);
- halverwege wisselen tussen die twee zonder werk te verliezen;
- foto's toevoegen, verwijderen en van volgorde wisselen;
- een opmaaktemplate kiezen en later wijzigen;
- documentaties groeperen in een reeks;
- bestaande documentaties zoeken, openen, aanpassen, dupliceren en verwijderen;
- exporteren als print-PDF (A4 liggend, foto's op 300 dpi) en als deelbare afbeelding (JPG, één per pagina);
- een deelbare afbeelding direct doorsturen via het deelmenu van het apparaat, of kopiëren naar het klembord.

**Zoeken** doorzoekt titel, tekst en citaten. **Filteren** kan op reeks, op groep, op leerling en op periode, waarbij periode een vrij te kiezen datumbereik is met het lopende schooljaar als standaard. Filteren op leerling toont de documentaties waaraan die leerling is gekoppeld; documentaties die het kind alleen in de lopende tekst noemen vallen daar buiten, want die koppeling bestaat niet.

## AI ondersteunt

- een losse observatie tot een lopende tekst maken;
- spelling corrigeren;
- in gespreksmodus per foto een vraag stellen en van de antwoorden een documentatie maken;
- een vervolgzin voorstellen op basis van eerdere documentaties in dezelfde reeks.

Titel laten voorstellen komt in versie 2.

## Eisen aan wat AI produceert

- **Twee tot vier zinnen.** De bestaande documentaties zijn kort. Langere teksten zijn fout, ook als ze goed geschreven zijn. Deze eis geldt voor wat AI oplevert, niet voor wat de gebruiker zelf typt.
- **De eigen toon blijft.** Informeel, wij-vorm, uitroeptekens waar dat past. Geen pedagogisch jargon, geen beleidstaal, geen samenvattende slotzin.
- **Spelling mag worden gecorrigeerd, stijl niet herschreven.** De grens ligt bij de zinsbouw: losse aantekeningen aan elkaar schrijven mag, een goedlopende zin anders formuleren niet.
- Als richtlijn gebruikt AI een bestaande documentatie die de gebruiker in de instellingen heeft opgegeven.

Deze eisen zijn niet alleen een instructie aan de AI. Ze worden vastgelegd in een set voorbeelden — invoer met de bijbehorende gewenste uitkomst — die bij elke wijziging aan de AI-laag wordt nagelopen.

## Eisen aan gegevensverwerking

- Voordat tekst naar AI gaat worden namen uit het leerlingenregister vervangen door codes. Dat geldt voor voornamen én achternamen, en voor **alle** leerlingen in het register — ook wie op inactief staat, want die komt voor in oudere documentaties.
- Wat terugkomt wordt teruggezet naar de echte namen.
- Foto's worden nooit verstuurd.
- De gebruiker kan altijd inzien wat er precies verstuurd wordt: de eigen tekst, het stijlvoorbeeld, de instructie aan de AI en eventuele eerdere documentaties uit dezelfde reeks.
- Bij de deelbare afbeelding kan de gebruiker voornamen laten vervangen door initialen. Die vervanging gebruikt hetzelfde leerlingenregister als de afscherming richting AI, en het voorbeeld toont het resultaat vóór het exporteren.
- Voordat een deelbare afbeelding wordt gemaakt bevestigt de gebruiker eenmalig per documentatie dat de kinderen op de foto's toestemming hebben voor beeldgebruik.
- Is het leerlingenregister leeg, dan waarschuwt EduFlow vóór de eerste AI-aanroep dat er niets wordt afgeschermd, en vraagt om een eenmalige bevestiging.

---

# Leerlingen en groepen

Het fundament onder de afscherming richting AI, en de plek waar je vastlegt wie er in je groep zit. Bereikbaar via Instellingen; geen eigen plek in de hoofdnavigatie.

## Een leerling bevat

- voornaam
- achternaam
- geboortedatum
- groep (één)
- actief of inactief

Voornaam en groep zijn verplicht. De rest mag leeg blijven — een register met gaten is bruikbaarder dan een register dat je pas mag opslaan als je alles weet.

## Een groep bevat

- naam
- schooljaar
- gearchiveerd of niet

Een groep is een eigen gegeven en geen los tekstje, zodat er later eigenschappen bij kunnen zonder dat elke documentatie en elke leerling opnieuw moet worden aangeraakt. Verwachte uitbreidingen die er nu nog niet in zitten: kleur, locatie en mentor.

## De gebruiker kan

- leerlingen toevoegen, aanpassen en op inactief zetten;
- leerlingen filteren op groep en op actief of inactief;
- zoeken op naam;
- meerdere leerlingen tegelijk selecteren en in één keer verplaatsen naar een andere groep, op inactief zetten of weer op actief zetten;
- groepen toevoegen, hernoemen en opruimen;
- een groep archiveren aan het eind van een schooljaar;
- zien hoeveel leerlingen er in een groep zitten.

## Batchbewerkingen

Een jaarovergang is dertig keer dezelfde handeling. Daarom kun je leerlingen aanvinken en in één keer verplaatsen, op inactief zetten of weer activeren.

**Verwijderen zit er niet bij.** Leerlingen worden nooit hard verwijderd, en een massale verwijdering is precies de handeling waarmee je de afscherming stukmaakt.

Elke batchbewerking vraagt om bevestiging en noemt het aantal: "23 leerlingen verplaatsen naar groep blauw".

## Archiveren

Aan het eind van een schooljaar archiveer je een groep. Dat doet twee dingen: de groep verdwijnt uit keuzelijsten, en alle leerlingen erin gaan op inactief.

**Archiveren verwijdert niets en schermt niets minder af.** Een gearchiveerde groep en haar leerlingen tellen onverkort mee bij het vervangen van namen richting AI. Ze zijn alleen uit het zicht.

Terugdraaien kan: een groep dearchiveren haalt hem terug in de lijsten. De leerlingen blijven inactief tot je ze zelf weer aanzet — massaal inactief zetten is veilig, massaal activeren zou een vertrokken kind terugzetten in je keuzelijsten.

**Leerlingen worden niet verwijderd, maar op inactief gezet.** Een kind dat van school gaat komt nog voor in documentaties van eerder dit jaar. Zou het record verdwijnen, dan gaat die naam vanaf dat moment onafgeschermd naar de AI-provider. Inactieve leerlingen tellen dus gewoon mee bij de afscherming, maar verschijnen niet meer in keuzelijsten.

Echt verwijderen kan alleen via *alle gegevens wissen*.

**Een groep opruimen laat leerlingen en documentaties intact.** Ze raken hun groepsverwijzing kwijt en blijven zichtbaar. Opruimen mag nooit werk weggooien.

## Leeftijd

Uit de geboortedatum volgt de leeftijd, getoond in jaren en maanden ("4 jaar en 1 maand"). Staat er geen geboortedatum, dan toont EduFlow niets — geen streepje, geen schatting.

## Import en export

Een groep overtypen is werk dat niemand wil doen, en de gegevens staan al ergens. Leerlingen zijn daarom te importeren uit **CSV** en **Excel**, en te exporteren naar diezelfde twee formaten.

Handmatig toevoegen blijft altijd mogelijk en is de standaardweg voor één nieuw kind.

### Importeren

De import leest een bestand uit een ander systeem. EduFlow herkent de indeling van bekende bronnen en laat je bij een onbekende bron zelf aanwijzen welke kolom welk veld is.

- **Eerst zien, dan doen.** De import toont een overzicht per regel — nieuw, bijgewerkt, ongewijzigd of overgeslagen met reden — en schrijft pas na bevestiging. Wat je bevestigt is exact wat er gebeurt.
- **Importeren verwijdert nooit.** Leerlingen die niet in het bestand staan blijven ongemoeid. Een onvolledige export uit een ander systeem mag nooit je register legen.
- **Eén mislukte regel stopt de rest niet**, en wordt benoemd.
- **Een tweede import maakt geen dubbelen.** EduFlow herkent leerlingen die al bestaan.
- **Onleesbare geboortedatum blokkeert niet.** De leerling wordt aangemaakt zonder datum, met vermelding.

### Exporteren

Exporteren levert een bestand dat je ongewijzigd weer kunt importeren. Zolang er nog geen volledige back-up bestaat, is dit ook het enige vangnet voor het register.

### Uitwisselbaar blijven op termijn

Exportbestanden moeten over jaren nog te lezen zijn. Daarom draagt elk bestand dat EduFlow maakt zijn eigen **schemaversie** met zich mee, plus wanneer en waaruit het is gemaakt. Bij het importeren wordt die versie gelezen, zodat een bestand van vandaag over drie jaar nog werkt.

Zie doc 03 voor hoe dit is opgebouwd.

---

# Mail

Geen koppeling met een mailprogramma. EduFlow schrijft, de gebruiker verstuurt zelf.

De gebruiker kan:

- een nieuwe mail laten opstellen vanuit een sjabloon of vanaf niets;
- een toon kiezen (zakelijk, vriendelijk, kort);
- een ontvangen mail plakken en daar een antwoord op laten opstellen;
- het resultaat aanpassen;
- het resultaat met één knop kopiëren;
- concepten bewaren, terugvinden, aanpassen en verwijderen.

Een mailconcept heeft een onderwerpregel. Die is het eerste veld en wordt in lijsten getoond. Is hij leeg, dan wordt de eerste regel van de mail gebruikt.

Sjablonen in versie 1: oudermail, collega, uitnodiging, verslag. Een sjabloon is een instructie aan de AI plus een vaste opzet, geen kant-en-klare tekst.

AI ondersteunt in versie 1: schrijven in een vooraf gekozen toon, en spelling nakijken van het resultaat. Inkorten, uitbreiden, samenvatten en achteraf van toon wisselen komen in versie 2.

Bij het plakveld staat een waarschuwing om geen gegevens van kinderen of ouders te plakken. Ook hier staat de controlelink "Bekijk wat er verstuurd wordt" — dit is de plek waar in de praktijk de meeste persoonsgegevens langskomen.

**Niet in versie 1:** een inbox, een verzendknop, ontvangers, bijlagen.

---

# Agenda

Twee soorten items.

## Schoolvakanties

- Komen uit een databestand gebaseerd op open data van de Rijksoverheid.
- Worden getoond per gekozen regio: noord, midden of zuid.
- Zijn zichtbaar anders opgemaakt dan eigen afspraken.

Alleen de kerst- en zomervakantie liggen landelijk vast. Voor de herfst-, voorjaars- en meivakantie geeft het ministerie adviesdata waarvan scholen mogen afwijken.

**Daarom:** kerst- en zomervakantie zijn niet te bewerken. De drie adviesvakanties wel. Een aanpassing blijft staan, ook als het databestand later wordt bijgewerkt. Eigen invoer gaat altijd boven de landelijke data.

## Eigen afspraken

De gebruiker kan:

- een afspraak toevoegen met titel, datum, tijd of hele dag, en een notitie;
- afspraken wijzigen en verwijderen;
- studiedagen en margedagen toevoegen (die staan niet in de landelijke data);
- de komende weken als lijst bekijken, en terugbladeren naar eerdere weken;
- op een breed scherm ook een maandweergave bekijken;
- op een breed scherm een jaarweergave bekijken met alle vakanties, studiedagen en margedagen van het schooljaar.

Studiedagen en margedagen zijn hele-dag-afspraken met een eigen kleur, zodat ze in de jaarweergave opvallen.

**Niet in versie 1:** deelnemers, locaties, herhalende afspraken, herinneringen, meldingen, synchronisatie.

---

# Instellingen

De gebruiker kan:

- leerlingen en groepen beheren (zie *Leerlingen en groepen*);
- reeksen hernoemen en opruimen;
- een standaardgroep instellen, die bij een nieuwe documentatie vast staat ingevuld;
- de vakantieregio kiezen;
- een voorbeelddocumentatie opgeven die AI als stijlrichtlijn gebruikt;
- een standaardtoon voor mail kiezen;
- een AI-provider kiezen uit de providers die op de server zijn ingesteld;
- alle gegevens exporteren naar één bestand;
- dat bestand terugzetten op hetzelfde of een ander apparaat;
- alle gegevens wissen.

Export en import zijn de back-up én de manier om werk tussen apparaten te verplaatsen. Ze zijn geen bijzaak.

---

# Algemene eisen

Alle onderdelen ondersteunen waar dat zinvol is: zoeken, kopiëren, opslaan en verwijderen met bevestiging. Zoeken geldt voor documentaties en voor mailconcepten.

- Werk wordt automatisch opgeslagen tijdens het typen.
- Foutmeldingen zijn in gewone taal en noemen altijd een vervolgstap.
- Alles wat langer dan een seconde duurt toont zichtbare voortgang.
- Lege schermen tonen altijd één zin uitleg en één knop.
- De gebruiker wordt gewaarschuwd als de opslag voor 80% vol zit, met een knop naar exporteren en opruimen.
- Is er een maand geen back-up gemaakt, dan herinnert EduFlow daaraan.

---

# Niet-functionele eisen

De software moet:

- even goed werken op telefoon als op laptop;
- werken in moderne browsers, zonder app store en zonder installatiebestand. Op de telefoon vraagt de app wel om zichzelf op het beginscherm te zetten — dat is nodig om te voorkomen dat de browser opgeslagen werk na een week wist. Overslaan kan; de vraag komt dan terug;
- modulair zijn opgebouwd, met alle logica in services;
- alle AI-aanroepen via één centrale service laten lopen;
- geen persoonsgegevens in localStorage zetten. Documentaties, foto's, mailconcepten, het leerlingenregister, de groepen en het stijlvoorbeeld staan in IndexedDB;
- geen sleutels of geheimen in de frontend hebben;
- de AI-route afschermen, zodat die niet door willekeurige bezoekers gebruikt kan worden.

Snelheid, meetbaar:

- een documentatie openen uit het overzicht: binnen 1 seconde;
- een foto toevoegen en verkleinen: binnen 2 seconden, met voortgang;
- een AI-antwoord: binnen 10 seconden, met voortgang vanaf de eerste seconde;
- een export genereren: binnen 5 seconden, met voortgang.

Zonder netwerk werkt alles behalve AI. Bij een mislukte AI-aanroep blijft de eigen tekst staan.

---

# Prioriteiten

## Prioriteit 1

Documentatie

## Prioriteit 2

Mail

## Prioriteit 3

Dashboard en agenda

Instellingen worden gebouwd op het moment dat een module ze nodig heeft, niet als apart project. In de praktijk betekent dat: het leerlingenregister, de groepen en het stijlvoorbeeld komen mét documentatie, want zonder die drie werkt documentatie niet.

---

# Ontwerpregel

Iedere functionaliteit moet bijdragen aan minimaal één van deze doelen:

- tijd besparen;
- minder klikken;
- betere of consistentere documenten;
- terugkerend werk automatiseren.

Draagt iets aan geen van deze doelen bij, dan wordt het niet gebouwd.
