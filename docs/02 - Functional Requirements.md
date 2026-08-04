# Functional Requirements

Wat EduFlow moet kunnen. Hoe het eruitziet staat in document 04.

Versie 1 bestaat uit vijf onderdelen: dashboard, documentatie, mail, agenda en instellingen.

---

# Dashboard

De gebruiker kan:

- zien wat er vandaag en morgen in de agenda staat;
- direct een documentatie, mail of afspraak beginnen;
- de laatste vijf documentaties en mailconcepten openen;
- naar iedere module navigeren.

Geen statistieken, geen tellers.

---

# Documentatie

Het belangrijkste onderdeel.

## Een documentatie bevat

- reeks (optioneel — een doorlopend project waar deze documentatie bij hoort)
- titel
- leerlingen (een groepsaanduiding, zoals "groep geel")
- datum
- tekst (één doorlopend veld)
- citaten van kinderen (optioneel, los toe te voegen)
- foto's

Er moet tekst zijn, of foto's, of allebei. Al het andere is optioneel. Een documentatie met alleen foto's moet gewoon kunnen opslaan.

## De gebruiker kan

- een documentatie maken in schrijfmodus (zelf typen, AI verbetert achteraf);
- een documentatie maken in gespreksmodus (AI stelt één vraag tegelijk);
- halverwege wisselen tussen die twee zonder werk te verliezen;
- foto's toevoegen en van volgorde wisselen;
- een opmaaktemplate kiezen en later wijzigen;
- documentaties groeperen in een reeks;
- bestaande documentaties zoeken, openen, aanpassen, dupliceren en verwijderen;
- exporteren naar PDF en naar Word.

## AI ondersteunt

- een losse observatie tot een lopende tekst maken;
- spelling corrigeren;
- een titel voorstellen;
- een vervolgzin voorstellen op basis van eerdere documentaties in dezelfde reeks.

## Eisen aan wat AI produceert

- **Twee tot vier zinnen.** De bestaande documentaties zijn kort. Langere teksten zijn fout, ook als ze goed geschreven zijn.
- **De eigen toon blijft.** Informeel, wij-vorm, uitroeptekens waar dat past. Geen pedagogisch jargon, geen beleidstaal, geen samenvattende slotzin.
- **Spelling mag worden gecorrigeerd, stijl niet herschreven.**
- Als richtlijn gebruikt AI een bestaande documentatie die de gebruiker in de instellingen heeft opgegeven.

## Eisen aan gegevensverwerking

- Voordat tekst naar AI gaat worden voornamen uit de namenlijst vervangen door codes.
- Wat terugkomt wordt teruggezet naar de echte namen.
- Foto's worden nooit verstuurd.
- De gebruiker kan altijd inzien wat er precies verstuurd wordt.

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

Sjablonen in versie 1: oudermail, collega, uitnodiging, verslag.

AI ondersteunt: schrijven, inkorten, uitbreiden, toon aanpassen, samenvatten, spelling.

Bij het plakveld staat een waarschuwing om geen gegevens van kinderen of ouders te plakken.

**Niet in versie 1:** een inbox, een verzendknop, ontvangers, bijlagen.

---

# Agenda

Twee soorten items.

## Schoolvakanties

- Komen uit een databestand gebaseerd op open data van de Rijksoverheid.
- Worden getoond per gekozen regio: noord, midden of zuid.
- Zijn zichtbaar anders opgemaakt dan eigen afspraken.

Alleen de kerst- en zomervakantie liggen landelijk vast. Voor de herfst-, voorjaars- en meivakantie geeft het ministerie adviesdata waarvan scholen mogen afwijken.

**Daarom moet de gebruiker de datums van een adviesvakantie kunnen aanpassen, en blijft die aanpassing staan.** Eigen invoer gaat altijd boven de landelijke data.

## Eigen afspraken

De gebruiker kan:

- een afspraak toevoegen met titel, datum, tijd of hele dag, en een notitie;
- afspraken wijzigen en verwijderen;
- studiedagen en margedagen toevoegen (die staan niet in de landelijke data);
- de komende weken als lijst bekijken;
- op een breed scherm ook een maandweergave bekijken.

**Niet in versie 1:** deelnemers, locaties, herhalende afspraken, herinneringen, synchronisatie.

---

# Instellingen

De gebruiker kan:

- de voornamen van de groep beheren (voor het afschermen richting AI);
- reeksen hernoemen en opruimen;
- een standaardwaarde voor het veld leerlingen instellen;
- de vakantieregio kiezen;
- een voorbeelddocumentatie opgeven die AI als stijlrichtlijn gebruikt;
- een standaardtoon voor mail kiezen;
- een AI-provider kiezen;
- alle gegevens exporteren;
- alle gegevens wissen.

---

# Algemene eisen

Alle onderdelen ondersteunen waar dat zinvol is: zoeken, kopiëren, opslaan en verwijderen met bevestiging.

- Werk wordt automatisch opgeslagen tijdens het typen.
- Foutmeldingen zijn in gewone taal en noemen altijd een vervolgstap.
- Alles wat langer dan een seconde duurt toont zichtbare voortgang.
- Lege schermen tonen altijd één zin uitleg en één knop.

---

# Niet-functionele eisen

De software moet:

- even goed werken op telefoon als op laptop;
- werken in moderne browsers, zonder installatie;
- modulair zijn opgebouwd, met alle logica in services;
- alle AI-aanroepen via één centrale service laten lopen;
- geen persoonsgegevens in de browseropslag zetten;
- geen sleutels of geheimen in de frontend hebben;
- snel reageren.

---

# Prioriteiten

## Prioriteit 1

Documentatie

## Prioriteit 2

Mail

## Prioriteit 3

Dashboard en agenda

Instellingen worden gebouwd op het moment dat een module ze nodig heeft, niet als apart project.

---

# Ontwerpregel

Iedere functionaliteit moet bijdragen aan minimaal één van deze doelen:

- tijd besparen;
- minder klikken;
- betere of consistentere documenten;
- terugkerend werk automatiseren.

Draagt iets aan geen van deze doelen bij, dan wordt het niet gebouwd.
