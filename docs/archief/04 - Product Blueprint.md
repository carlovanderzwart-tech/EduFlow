> **HISTORISCH — NIET MEER LEIDEND**
>
> Dit document beschrijft de architectuur van vóór 8 augustus 2026 en is bewaard voor
> historische context. Het mag niet meer als normatieve bron worden gebruikt.
>
> `docs/EduFlow - Product Bible v1.0.md` blijft de actuele bron van waarheid.
>
> Let op bij het teruglezen: de besluitnummers in dit document (`B-…`, `T-…`) hebben
> een andere betekenis dan dezelfde nummers in hoofdstuk 19 van de Product Bible.
> Zie §19.2 van de Bible voor de nummerbotsingen.

---

# Product Blueprint

Dit document beschrijft hoe EduFlow eruitziet en werkt. Geen techniek — dat staat in document 03.

Wat hier niet in staat, wordt niet gebouwd.

---

## Scope versie 1

Vier schermen plus instellingen:

- Dashboard
- Documentatie
- Mail
- Agenda
- Instellingen, met daaronder Leerlingen en groepen

Kennisbank, AI Chat en Momento vallen buiten versie 1.

---

## Uitgangspunten

**Mobiel eerst.** EduFlow wordt evenveel op de telefoon als op de laptop gebruikt. Ieder scherm wordt ontworpen voor een smal scherm en groeit mee naar breed. Nooit andersom.

Concreet betekent dat: geen twee kolommen naast elkaar, geen tabellen met veel kolommen, geen zwevende panelen. Op de telefoon staat alles onder elkaar.

**Privacy zichtbaar.** Overal waar AI wordt gebruikt ziet de gebruiker wat er wordt verstuurd. Namen van kinderen en foto's gaan nooit mee.

**Alles blijft lokaal.** Versie 1 heeft geen account en geen server-opslag. Werk gaat niet verloren bij het sluiten van het tabblad.

---

## Navigatie

**Laptop:** vaste zijbalk links met vijf items en een naamlabel.

**Telefoon:** balk onderaan met vijf iconen. Geen hamburgermenu — dat kost een extra tik en verbergt waar je heen kunt.

De navigatie is overal gelijk en verandert nooit van plek.

**Het blijven vijf items.** Schermen die je zelden opent — zoals Leerlingen en groepen — hangen onder Instellingen. Een zesde icoon maakt de balk op een telefoon te krap en zou een dagelijkse plek geven aan iets wat je een paar keer per jaar doet.

---

## Scherm 1 — Dashboard

Wat je ziet als je EduFlow opent.

**Bovenaan:** begroeting met de dag en datum.

**Daaronder, onder elkaar:**

1. **Vandaag** — wat er vandaag en morgen in je agenda staat. Staat er niets: "Geen afspraken vandaag."
2. **Snel beginnen** — drie grote knoppen: Nieuwe documentatie, Nieuwe mail, Afspraak toevoegen.
3. **Recent** — de laatste vijf documentaties en mailconcepten, met datum. Aantikken opent ze.

**Lege toestand (eerste gebruik):** in plaats van drie lege blokken één uitnodiging: "Nog niets gemaakt. Begin met je eerste documentatie." met één knop.

**Niet op het dashboard:** statistieken, grafieken, tellers. Die kosten ruimte en zeggen niets.

---

## Scherm 2 — Documentatie (overzicht)

**Bovenaan:** zoekveld en een knop "Nieuwe documentatie".

**Daaronder:** lijst met documentaties, nieuwste eerst. Per regel:

- titel
- reeks (indien van toepassing)
- datum
- groep
- of er foto's bij zitten
- status: concept of afgerond

### Reeksen

Documentaties horen vaak bij een doorlopend project. "Kunstwerk Dok" is vier documentaties, "ONDERZOEK Natuur" is er drie, "Bezoek aan het lichtatelier" twee.

Er is daarom een tweede weergave: **gegroepeerd per reeks**, met de losse documentaties in tijdsvolgorde eronder. Zo zie je een project van begin tot eind.

Wisselen tussen "Alles" en "Per reeks" gebeurt met twee tabbladen bovenaan.

**Filteren op:** reeks, groep, leerling en periode. Meer niet.

**Per documentatie (via lang indrukken of een menu-icoon):** openen, dupliceren, exporteren, verwijderen.

Verwijderen vraagt om bevestiging.

---

## Scherm 3 — Documentatie (maken en bewerken)

Het belangrijkste scherm van EduFlow. Twee manieren om te werken, dezelfde uitkomst.

### Bovenaan: keuze tussen twee modi

**Schrijfmodus** — je typt zelf, AI verbetert en structureert achteraf.
**Gespreksmodus** — AI stelt één vraag tegelijk, jij antwoordt, AI bouwt de documentatie op.

De keuze staat als twee tabbladen bovenaan. Je kunt halverwege wisselen zonder je werk kwijt te raken.

Gespreksmodus is bedoeld voor de telefoon, direct na een activiteit. Schrijfmodus voor de laptop, achteraf. Maar allebei werken op allebei.

### Velden

Afgeleid uit de bestaande documentaties van maart en mei.

- **Reeks** (optioneel) — kiezen uit bestaande reeksen of een nieuwe aanmaken. Wordt als voorvoegsel voor de titel gebruikt.
- **Titel**
- **Groep** — één groep, gekozen uit je eigen groepen. Staat standaard ingevuld met je standaardgroep.
- **Leerlingen** (optioneel) — nul of meer kinderen uit die groep aanvinken. Voor een documentatie die echt over een paar specifieke kinderen gaat. Leeg laten is de normale situatie en kost geen handeling.
- **Datum**
- **Tekst** — één doorlopend tekstveld, geen aparte kopjes.
- **Citaten** (optioneel) — losse uitspraken van kinderen, apart toe te voegen omdat ze in de opmaak een eigen plek krijgen.
- **Foto's** — één tot ongeveer zes per documentatie.

**Alles is optioneel behalve dit: er moet tekst zijn, of foto's, of allebei.** Sommige documentaties bestaan alleen uit foto's. Dat moet gewoon kunnen opslaan.

**Eén tekstveld, geen drie.** De bestaande documentaties zijn twee tot vier korte zinnen in lopende alinea's — aanleiding, wat er gebeurde, en hoe het verdergaat. Dat is een schrijfpatroon, geen formulier. Opdelen in "observatie", "betekenis" en "vervolg" maakt het invullen langzamer en het resultaat stijver.

### Namen van kinderen

Dit werkt anders dan eerder in dit document stond, omdat de praktijk anders is.

Namen staan **in de lopende tekst**, niet in een apart veld: *"Na een aantal keer proberen zei Kjeld: Laten we een huis maken!"* Er is dus geen veld dat je kunt afschermen.

Daarom:

1. In de instellingen houd je je leerlingen bij, met hun voornaam en achternaam.
2. Voordat er tekst naar AI gaat, vervangt EduFlow die namen door Kind A, Kind B, enzovoort.
3. Wat terugkomt wordt teruggezet naar de echte namen.
4. Op je scherm zie je altijd de echte namen.

**En omdat een leerlingenregister nooit compleet is:** een broertje, een kind uit een andere groep of een collega staat er niet in. Naast de AI-knop staat daarom een link "Bekijk wat er verstuurd wordt". Daar zie je de tekst zoals AI hem krijgt. Één tik, geen verplichte stap, maar wel altijd controleerbaar.

Foto's gaan nooit mee. Ook niet als de gebruiker daarom vraagt.

### AI-hulp

Onder de velden staat een knop **"Laat AI meeschrijven"**.

Daarboven, altijd zichtbaar: *"AI ontvangt je tekst met namen vervangen. Foto's gaan nooit mee."* met daarnaast de controlelink.

**AI schrijft kort.** Twee tot vier zinnen, in de stijl van de bestaande documentaties: informeel, in de wij-vorm, met uitroeptekens waar dat past. Geen beleidstaal, geen pedagogisch jargon, geen samenvattende slotzin. Een AI die hier zes zinnen van maakt heeft het fout gedaan.

**AI corrigeert spelling, maar herschrijft geen stijl.** De eigen toon is het punt van deze documentaties.

Het AI-resultaat verschijnt **onder** je eigen tekst, niet ernaast en niet in plaats van. Met drie knoppen: Overnemen, Opnieuw, Weggooien.

Je eigen tekst wordt nooit overschreven zonder dat je erop tikt.

### Opmaak

Een documentatie krijgt een layout. Vier templates, afgeleid uit de bestaande pagina's van maart en mei. Ze dekken vrijwel elke pagina.

**Template A — tekst links, fotoraster rechts.**
Tekstkolom links op ongeveer een derde, daarnaast vier tot zes foto's in een raster. De meest gebruikte indeling.

**Template B — tekst boven, fotorij onder.**
Tekst over de volle breedte bovenaan, daaronder een rij van drie of vier foto's. Voor langere teksten.

**Template C — tekst links, één grote foto.**
Tekst links, één dominante foto rechts, eventueel één kleinere eronder. Voor als één beeld de pagina draagt.

**Template D — alleen foto's.**
Raster van vier tot zes foto's, geen tekst. Voor een fotoserie zonder verhaal.

De keuze staat als vier miniaturen bovenaan het exportscherm. Wisselen kan altijd; de inhoud verandert niet mee.

**Regels voor alle templates:**

- Titel bovenaan, met de reeks als voorvoegsel wanneer die is ingevuld.
- Daaronder in kleiner grijs: `Leerling(en): [groep]`. Zijn er leerlingen gekoppeld, dan komen hun voornamen erachter: `Leerling(en): groep geel — Kjeld, Roos`. De groep staat er altijd, de namen alleen als je ze zelf hebt gekoppeld.
- Citaten krijgen een eigen plek in de opmaak, tussen aanhalingstekens, los van de lopende tekst.
- Bij minder foto's dan het template aankan schuift de rest op. Geen lege vakken.

Later kunnen templates worden toegevoegd of vervangen. Ze staan los van de inhoud, dus dat raakt bestaande documentaties niet.

### Exporteren

Twee bestemmingen, twee formaten. Als twee knoppen: **Print-PDF** en **Deelbare afbeelding**.

**Printen (klas of gang)** — PDF, A4 liggend, foto's op 300 dpi. Rondom 10 mm veilige marge, zodat een kantoorprinter niets van de rand afsnijdt.

**Digitaal delen met ouders** — JPG per pagina, ongeveer 1600 pixels breed.

Bewust geen PDF voor de tweede: een afbeelding is meteen zichtbaar in een mail of ouderapp, een PDF moet eerst gedownload en geopend worden. En bewust JPG in plaats van PNG, omdat deze pagina's vol foto's staan en PNG bestanden oplevert die te groot zijn om te versturen.

**Voor de deelbare afbeelding** verschijnt eenmalig een bevestiging:

> *"Deze documentatie wordt buiten school gedeeld. Controleer of alle kinderen op de foto's toestemming hebben voor beeldgebruik."*

Eén vinkje, geen automatische controle. EduFlow weet niet wie er op een foto staat en gaat dat ook niet proberen te bepalen.

**Namen blijven standaard staan** in beide exports, zoals in de huidige documentaties. Bij de deelbare afbeelding zit een schakelaar om ze te vervangen door initialen — die gebruikt hetzelfde leerlingenregister als de AI-afscherming.

Die schakelaar geldt voor de **hele pagina**: de namen in de lopende tekst, in de citaten, én de voornamen van gekoppelde leerlingen op de `Leerling(en)`-regel. Zou die regel buiten de schakelaar vallen, dan zet je hem aan in de veronderstelling dat er geen namen meer op staan terwijl ze bovenaan de pagina blijven staan.

### Onderaan

Opslaan · Print-PDF · Deelbare afbeelding

Opslaan gebeurt ook automatisch tijdens het typen. De knop is er voor de zekerheid.

---

## Scherm 4 — Mail

Geen koppeling met Outlook. EduFlow schrijft, jij verstuurt.

**Drie tabbladen:**

### Nieuw

1. Kies een sjabloon of begin blanco. Sjablonen: oudermail, collega, uitnodiging, verslag.
2. Beschrijf in een paar zinnen wat de mail moet zeggen.
3. Kies een toon: zakelijk, vriendelijk, kort.
4. AI schrijft.
5. Je past aan.
6. **Kopieerknop** — grote knop, bovenaan bij het resultaat. Dit is de belangrijkste knop van het scherm.

### Beantwoorden

Plak een ontvangen mail in het veld. Geef aan wat je wilt antwoorden. AI stelt een antwoord op. Kopiëren.

Waarschuwing bij dit veld: *"Plak geen gegevens van kinderen of ouders."*

### Concepten

Opgeslagen mails, nieuwste eerst. Openen, aanpassen, kopiëren, verwijderen.

**Niet in dit scherm:** een inbox, een verzendknop, ontvangers, bijlagen.

---

## Scherm 5 — Agenda

Twee soorten items, duidelijk uit elkaar te houden.

**Schoolvakanties** komen uit een databestand op basis van open data van de Rijksoverheid. Lichtgrijs, niet te bewerken.

**Eigen afspraken** voer je zelf in. In kleur, wel te bewerken.

### Belangrijk

Alleen de kerst- en zomervakantie liggen landelijk vast. Voor de herfst-, voorjaars- en meivakantie geeft het ministerie alleen adviesdata; scholen mogen daarvan afwijken.

Daarom: **eigen invoer gaat altijd boven de landelijke data.** Bij een adviesvakantie staat een klein potloodje waarmee je de datums voor jouw school aanpast. Die aanpassing blijft staan.

Studiedagen en margedagen staan niet in de landelijke data en voer je zelf in.

### Weergave

**Telefoon:** lijst met komende weken. Scrollen.
**Laptop:** maandweergave, met daaronder dezelfde lijst.

### Afspraak toevoegen

Titel, datum, tijd (of hele dag), notitie. Meer niet. Geen deelnemers, geen locatie, geen herhaling in versie 1.

### Instellen

**Standaard: regio noord.** Bij het eerste gebruik wordt die keuze één keer bevestigd, met noord al aangevinkt. Aanpasbaar in de instellingen.

---

## Scherm 6 — Instellingen

- **Leerlingen en groepen** — opent scherm 7. De namen hieruit schermt EduFlow af voordat tekst naar AI gaat. Blijft lokaal.
- **Reeksen** — bestaande reeksen hernoemen of opruimen.
- **Standaardgroep** — bijvoorbeeld "groep geel", zodat dat veld bij een nieuwe documentatie vast staat ingevuld.
- Vakantieregio
- Schrijfstijl voor documentaties (voorbeeldtekst die AI als richtlijn gebruikt — vul hier een bestaande documentatie in)
- Standaardtoon voor mail
- AI-provider
- Alle gegevens exporteren
- Alle gegevens wissen

---

## Scherm 7 — Leerlingen en groepen

Bereikbaar via Instellingen. **Geen zesde icoon in de navigatie:** dit beheer je een paar keer per jaar, niet dagelijks, en de balk onderaan blijft op vijf.

**Twee tabbladen:** Leerlingen en Groepen.

### Leerlingen

**Bovenaan:** zoekveld op naam, een keuzelijst voor de groep, en een knop "Leerling toevoegen".

**Daaronder:** de lijst, per regel een selectievakje, voornaam en achternaam, de groep, en de leeftijd. Inactieve leerlingen staan er niet tussen tot je ze aanzet met een schakelaar "Toon inactieve leerlingen"; ze zijn dan zichtbaar grijs.

**Zodra je iets aanvinkt** verschijnt er een balk met het aantal geselecteerde leerlingen en drie acties: verplaatsen naar een andere groep, op inactief zetten, weer op actief zetten. Geen verwijderknop — leerlingen worden nooit hard verwijderd. Elke actie vraagt bevestiging en noemt het aantal: "23 leerlingen verplaatsen naar groep blauw".

**Een leerling toevoegen of aanpassen** gebeurt in een paneel dat over het scherm schuift, met: voornaam, roepnaam, achternaam, geboortedatum, groep, en actief of inactief. Voornaam en groep zijn verplicht, de rest mag leeg.

Bij roepnaam staat waarom hij er is: *"Alleen invullen als je een andere naam gebruikt dan de voornaam. Zo wordt ook die naam afgeschermd voordat er tekst naar AI gaat."*

Onder de geboortedatum staat de leeftijd zodra die is ingevuld: "4 jaar en 1 maand". Is hij leeg, dan staat er niets — geen streepje en geen schatting.

**Op inactief zetten in plaats van verwijderen.** In het paneel staat een schakelaar, geen verwijderknop. Daarnaast in gewone taal waarom: *"Een leerling die van school gaat zet je op inactief. De naam blijft dan afgeschermd in documentaties van eerder dit jaar."*

### Groepen

Lijst met de naam van elke groep, het schooljaar en hoeveel leerlingen erin zitten. Toevoegen, hernoemen, opruimen en archiveren. Gearchiveerde groepen staan onderaan, gedempt, met een knop om ze terug te halen.

Opruimen vraagt om bevestiging en zegt wat er gebeurt: de leerlingen en documentaties blijven bestaan en raken hun groep kwijt. Er verdwijnt dus niets, en dat staat er ook zo.

**Archiveren** vraagt ook om bevestiging, en zegt wat er gebeurt: *"Groep geel wordt gearchiveerd en de 23 leerlingen erin gaan op inactief. Hun namen blijven afgeschermd in bestaande documentaties."* Dat laatste is geen bijzin — het is de reden dat archiveren geen verwijderen is.

### Exporteren

Knop "Exporteren", met de keuze tussen CSV en Excel. Exporteert wat er op dat moment in de lijst staat, inclusief je filters, zodat je ook één groep kunt exporteren.

### Importeren

Knop "Leerlingen importeren", en dan drie stappen op één scherm.

**1. Bestand kiezen.** CSV of Excel. EduFlow leest de koprij en probeert te herkennen uit welk systeem het komt.

**2. Kolommen controleren.** Herkent EduFlow de bron, dan staat de toewijzing al goed en hoef je alleen te kijken of het klopt. Herkent hij hem niet, dan wijs je zelf aan welke kolom de voornaam is, welke de geboortedatum, enzovoort. Naast elke keuze staat een voorbeeldwaarde uit het bestand, zodat je ziet dat je de goede kolom te pakken hebt.

**3. Voorbeeld en bevestigen.** Een tabel met per regel wat ermee gaat gebeuren:

| | |
|---|---|
| **Nieuw** | Wordt toegevoegd |
| **Bijgewerkt** | Bestaat al; je ziet welke velden veranderen |
| **Ongewijzigd** | Bestaat al en is identiek |
| **Overgeslagen** | Met de reden erbij |

Bovenaan de aantallen, onderaan de knop. Wat je ziet is precies wat er gebeurt — er is niets geschreven tot je bevestigt.

Nieuwe groepen die uit het bestand komen staan apart vermeld, zodat een typefout in de bron je geen vijf groepen oplevert zonder dat je het merkt.

### Lege toestand

"Nog geen leerlingen. Voeg ze toe zodat EduFlow hun namen kan afschermen voordat er tekst naar AI gaat." met één knop.

---

## Gedeelde patronen

**Opslaan.** Automatisch tijdens het typen. Kort bericht in beeld: "Opgeslagen."

**Fouten.** Altijd in gewone taal, altijd met een vervolgstap. Niet: "Error 500." Wel: "Het lukte niet om AI te bereiken. Je tekst is bewaard. Probeer het zo nog eens."

**Wachten.** Alles wat langer dan een seconde duurt krijgt zichtbare voortgang. Nooit een bevroren scherm.

**Verwijderen.** Vraagt altijd om bevestiging en zegt wat er verdwijnt.

**Lege schermen.** Nooit alleen leegte. Altijd één zin die uitlegt wat hier komt te staan, plus één knop.

---

## Buiten versie 1

- Inbox, mail versturen, Outlook
- Agenda synchroniseren met Microsoft
- Kennisbank
- Losse AI Chat
- Momento en browserautomatisering
- Inloggen en accounts
- Delen met collega's
- Donkere modus — de export moet hoe dan ook licht blijven, dus donkere modus levert een tweede stylinglaag op die alleen voor de invoerschermen geldt. Komt in versie 2.

---

## Besluiten

Alle openstaande punten uit de eerste versie van dit document zijn afgehandeld.

- **Velden documentatie** — afgeleid uit de bestaande documentaties van maart en mei.
- **Opmaak** — vier templates, uitbreidbaar zonder dat bestaande documentaties veranderen.
- **Export** — PDF voor printen, JPG voor delen.
- **Vakantieregio** — standaard noord, te bevestigen bij het eerste gebruik.
- **Donkere modus** — versie 2.

Dit document is klaar om op te bouwen.
