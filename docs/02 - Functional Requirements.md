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
- leerlingen (een groepsaanduiding, zoals "groep geel")
- datum (de dag waarop het gebeurde; kan afwijken van de dag waarop je het opschrijft)
- tekst (één doorlopend veld)
- citaten van kinderen (optioneel, los toe te voegen)
- foto's (nul tot ongeveer zes)
- opmaaktemplate
- status (concept of afgerond)

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

**Zoeken** doorzoekt titel, tekst en citaten. **Filteren** kan op reeks, op leerlingen en op periode, waarbij periode een vrij te kiezen datumbereik is met het lopende schooljaar als standaard.

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

- Voordat tekst naar AI gaat worden voornamen uit de namenlijst vervangen door codes.
- Wat terugkomt wordt teruggezet naar de echte namen.
- Foto's worden nooit verstuurd.
- De gebruiker kan altijd inzien wat er precies verstuurd wordt: de eigen tekst, het stijlvoorbeeld, de instructie aan de AI en eventuele eerdere documentaties uit dezelfde reeks.
- Bij de deelbare afbeelding kan de gebruiker voornamen laten vervangen door initialen. Die vervanging gebruikt dezelfde namenlijst als de afscherming richting AI, en het voorbeeld toont het resultaat vóór het exporteren.
- Voordat een deelbare afbeelding wordt gemaakt bevestigt de gebruiker eenmalig per documentatie dat de kinderen op de foto's toestemming hebben voor beeldgebruik.
- Is de namenlijst leeg, dan waarschuwt EduFlow vóór de eerste AI-aanroep dat er niets wordt afgeschermd, en vraagt om een eenmalige bevestiging.

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

- de voornamen van de groep beheren (voor het afschermen richting AI);
- reeksen hernoemen en opruimen;
- een standaardwaarde voor het veld leerlingen instellen;
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
- geen persoonsgegevens in localStorage zetten. Documentaties, foto's, mailconcepten, de namenlijst en het stijlvoorbeeld staan in IndexedDB;
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

Instellingen worden gebouwd op het moment dat een module ze nodig heeft, niet als apart project. In de praktijk betekent dat: de namenlijst, het stijlvoorbeeld en de standaardwaarde voor leerlingen komen mét documentatie, want zonder die drie werkt documentatie niet.

---

# Ontwerpregel

Iedere functionaliteit moet bijdragen aan minimaal één van deze doelen:

- tijd besparen;
- minder klikken;
- betere of consistentere documenten;
- terugkerend werk automatiseren.

Draagt iets aan geen van deze doelen bij, dan wordt het niet gebouwd.
