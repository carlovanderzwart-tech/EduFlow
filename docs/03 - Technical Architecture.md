# Product Blueprint

Dit document beschrijft hoe EduFlow eruitziet en werkt. Geen techniek — dat staat in document 03.

Wat hier niet in staat, wordt niet gebouwd.

---

## Scope versie 1

Vijf onderdelen, verdeeld over zes schermen en één paneel:

| Onderdeel | Schermen |
|---|---|
| Dashboard | Scherm 1 |
| Documentatie | Scherm 2 (overzicht), scherm 3 (maken en bewerken), exportpaneel |
| Mail | Scherm 4 |
| Agenda | Scherm 5 |
| Instellingen | Scherm 6 |

Kennisbank, AI Chat en Momento vallen buiten versie 1.

---

## Uitgangspunten

**Mobiel eerst.** EduFlow wordt evenveel op de telefoon als op de laptop gebruikt. Ieder scherm wordt ontworpen voor een smal scherm en groeit mee naar breed. Nooit andersom.

Concreet betekent dat: geen twee kolommen naast elkaar, geen tabellen met veel kolommen, geen zwevende panelen. Op de telefoon staat alles onder elkaar.

Twee uitzonderingen. Het exportpaneel schuift over het scherm heen in plaats van ernaast te staan — dat is de enige manier om op een smal scherm een voorbeeld te tonen zonder van je werk weg te navigeren. En het voorbeeld van de documentatiepagina zelf is een afbeelding van een A4: die schaalt mee als geheel en klapt niet om, want dan klopt het voorbeeld niet meer met wat je krijgt.

**Privacy zichtbaar.** Overal waar AI wordt gebruikt ziet de gebruiker wat er wordt verstuurd — op scherm 3 én op scherm 4.

**Foto's gaan nooit mee.** Dat is absoluut. Namen uit de namenlijst worden vervangen; namen die niet in die lijst staan gaan wél mee, en daarom staat de controlelink er altijd naast. Zie doc 01.

**Alles wat je maakt blijft lokaal.** Versie 1 heeft geen account en geen server-opslag; documentaties en foto's staan alleen op je eigen apparaat. Wat het apparaat wél verlaat is de tekst die naar de AI-provider gaat, en precies dat laat de controlelink zien.

Werk gaat niet verloren bij het sluiten van het tabblad.

**Eén apparaat per documentatie.** Gegevens staan op het apparaat waar je ze invoert. Apparaten synchroniseren niet. Overzetten kan met een exportbestand uit de instellingen.

---

## Eerste gebruik

Drie stappen, in deze volgorde. Daarna komt hier niets meer terug, op één na: sla je stap 2 over, dan wordt die vraag na een week nog één keer gesteld.

1. **Toegangscode.** Eén veld. Je voert hem één keer per apparaat in; daarna onthoudt de app hem. Geen account, geen wachtwoord om te onthouden.
2. **Op het beginscherm zetten** — alleen op een telefoon. Eén scherm dat uitlegt waarom: *"Zet EduFlow op je beginscherm. Anders wist je telefoon je documentaties als je een week niet kijkt."* Met de handeling erbij in beeld. Overslaan kan, maar dan komt de vraag na een week terug.
3. **Je groep.** Vraagt om de vakantieregio (noord staat al aangevinkt), de standaardwaarde voor leerlingen, en de voornamen van je groep. Bij de namenlijst staat waarom: *"Deze namen worden vervangen voordat er tekst naar AI gaat."*

Sla je stap 3 over, dan werkt de app gewoon — maar de eerste keer dat je AI gebruikt met een lege namenlijst verschijnt: *"Je namenlijst is leeg. Er wordt niets afgeschermd. Doorgaan?"* met een knop naar de instellingen ernaast. Die vraag komt één keer.

---

## Navigatie

**Laptop:** vaste zijbalk links met vijf items en een naamlabel.

**Telefoon:** balk onderaan met vijf iconen. Geen hamburgermenu — dat kost een extra tik en verbergt waar je heen kunt.

De navigatie is overal gelijk en verandert nooit van plek.

---

## Scherm 1 — Dashboard

Wat je ziet als je EduFlow opent.

**Bovenaan:** begroeting met de dag en datum.

**Daaronder, onder elkaar:**

1. **Vandaag en morgen** — wat er in die twee dagen in je agenda staat, vakanties meegerekend. Staat er niets: "Geen afspraken vandaag of morgen." Val je middenin een vakantie, dan staat daar de vakantie met de einddatum.
2. **Snel beginnen** — drie grote knoppen: Nieuwe documentatie, Nieuwe mail, Afspraak toevoegen.
3. **Recent** — de laatste vijf documentaties en de laatste vijf mailconcepten, met datum. Gesorteerd op wanneer je ze voor het laatst hebt gewijzigd. Aantikken opent ze.

**Lege toestand (eerste gebruik):** in plaats van drie lege blokken één uitnodiging: "Nog niets gemaakt. Begin met je eerste documentatie." met één knop.

**Niet op het dashboard:** statistieken, grafieken, tellers. Die kosten ruimte en zeggen niets.

---

## Scherm 2 — Documentatie (overzicht)

**Bovenaan:** zoekveld en een knop "Nieuwe documentatie".

Zoeken kijkt in de titel, de tekst en de citaten.

**Daaronder:** lijst met documentaties, nieuwste eerst op de datum die jij hebt ingevuld. Per regel:

- titel — of, als die leeg is, de eerste regel van de tekst
- reeks (indien van toepassing)
- datum
- leerlingen
- of er foto's bij zitten
- status: concept of afgerond

**Status zet je niet zelf.** Een documentatie staat op afgerond zodra je hem één keer hebt geëxporteerd. Zo laat de lijst zien wat je daadwerkelijk hebt opgeleverd.

### Reeksen

Documentaties horen vaak bij een doorlopend project. "Kunstwerk Dok" is vier documentaties, "ONDERZOEK Natuur" is er drie, "Bezoek aan het lichtatelier" twee.

Er is daarom een tweede weergave: **gegroepeerd per reeks**, met de losse documentaties in tijdsvolgorde eronder. Zo zie je een project van begin tot eind.

Wisselen tussen "Alles" en "Per reeks" gebeurt met twee tabbladen bovenaan.

**Filteren op:** reeks, leerlingen en periode. Periode is een vrij datumbereik, met het lopende schooljaar als standaard. Meer niet.

**Per documentatie:** een menu-icoon aan het eind van de regel met openen, dupliceren, exporteren en verwijderen. Op een telefoon werkt lang indrukken ook, maar het icoon staat er altijd — anders is de actie onvindbaar op een laptop.

"Exporteren" opent de documentatie met het exportpaneel er al overheen. Er is dus één plek waar geëxporteerd wordt, en die zit op scherm 3.

Verwijderen vraagt om bevestiging en zegt wat er verdwijnt, inclusief het aantal foto's.

---

## Scherm 3 — Documentatie (maken en bewerken)

Het belangrijkste scherm van EduFlow. Twee manieren om te werken, dezelfde uitkomst.

### Bovenaan: keuze tussen twee modi

**Schrijfmodus** — je typt zelf, AI schrijft je aantekeningen aan elkaar en corrigeert spelling.
**Gespreksmodus** — je kiest je foto's, AI stelt er vragen bij, jij antwoordt.

De keuze staat als twee tabbladen bovenaan. Je kunt halverwege wisselen zonder je werk kwijt te raken: wat je in gespreksmodus hebt geantwoord staat in schrijfmodus gewoon in het tekstveld.

Gespreksmodus is bedoeld voor de telefoon, direct na een activiteit. Schrijfmodus voor de laptop, achteraf. Allebei werken op allebei — maar een documentatie maak je af op het apparaat waar je hem bent begonnen.

### Velden

Afgeleid uit de bestaande documentaties van maart en mei.

- **Reeks** (optioneel) — kiezen uit bestaande reeksen of een nieuwe aanmaken. De reeks is een apart veld en staat niet in de titel; in de opmaak verschijnt hij als voorvoegsel boven de titel.
- **Titel**
- **Leerlingen** — één regel, zoals "groep geel", "groep 1/2", "groep 3 & 4". Suggesties uit eerder gebruikte waarden. Dit is een groepsaanduiding, geen lijst met kinderen.
- **Datum**
- **Tekst** — één doorlopend tekstveld, geen aparte kopjes.
- **Citaten** (optioneel) — losse uitspraken van kinderen, apart toe te voegen omdat ze in de opmaak een eigen plek krijgen. Nul tot drie per documentatie. Een citaat is één regel tekst; de naam van het kind staat er in de tekst zelf in, net als in de lopende tekst.
- **Foto's** — nul tot ongeveer zes per documentatie. Toevoegen, verwijderen en van volgorde wisselen door te slepen; op een telefoon staan er ook pijltjes bij, want slepen in een lijst die scrollt is onhandig.

**Alles is optioneel behalve dit: er moet tekst zijn, of foto's, of allebei.** Sommige documentaties bestaan alleen uit foto's. Dat moet gewoon kunnen opslaan. Een documentatie zonder allebei wordt niet bewaard en verdwijnt als je weggaat.

**Eén tekstveld, geen drie.** De bestaande documentaties zijn twee tot vier korte zinnen in lopende alinea's — aanleiding, wat er gebeurde, en hoe het verdergaat. Dat is een schrijfpatroon, geen formulier. Opdelen in "observatie", "betekenis" en "vervolg" maakt het invullen langzamer en het resultaat stijver.

Het tekstveld is een gewoon tekstveld, zodat de dicteerknop van je toetsenbord werkt.

### Gespreksmodus

Bedoeld voor het moment direct na een activiteit, op de telefoon, met je handen nog vol.

1. **Je kiest je foto's.** Uit je fotorollen, de foto's die je net hebt gemaakt. De datum wordt uit de foto's overgenomen.
2. **De app toont ze één voor één, met een vraag eronder.** De eerste is altijd open: *"Wat gebeurde hier?"* Daarna stelt AI de vraag op basis van wat je al hebt geantwoord.
3. **Jij typt of dicteert een paar regels.** Doorgaan of overslaan.
4. **Na de laatste foto** vraagt de app of er nog iets bij moet — een citaat van een kind, of hoe het verderging.
5. **AI maakt er een documentatie van.** Die verschijnt in het tekstveld, met dezelfde drie knoppen als in schrijfmodus.

**De foto blijft op je telefoon.** AI ziet hem niet en krijgt hem niet. Wat er weggaat is alleen wat jij typt — en de vraag die AI stelt is dus altijd een vraag over iets wat AI niet kan zien. Dat is precies de bedoeling: jij kijkt, jij vertelt.

Je kunt op elk moment naar schrijfmodus. Je antwoorden staan dan onder elkaar in het tekstveld.

### Namen van kinderen

Namen staan **in de lopende tekst**, niet in een apart veld: *"Na een aantal keer proberen zei Kjeld: Laten we een huis maken!"* Er is dus geen veld dat je kunt afschermen.

Daarom:

1. In de instellingen houd je een lijst bij met de voornamen van je groep.
2. Voordat er tekst naar AI gaat, vervangt EduFlow die namen door Kind A, Kind B, enzovoort.
3. Wat terugkomt wordt teruggezet naar de echte namen.
4. Op je scherm zie je altijd de echte namen.

**En omdat een namenlijst nooit compleet is:** naast de AI-knop staat een link "Bekijk wat er verstuurd wordt". Daar zie je precies wat AI krijgt: je eigen tekst, het stijlvoorbeeld uit de instellingen, de instructie, en bij een vervolgzin de eerdere documentaties uit dezelfde reeks. Alles met de namen al vervangen. Eén tik, geen verplichte stap, maar wel altijd controleerbaar.

De lijst groeit niet vanzelf. Komt er een kind bij, dan voeg je hem in de instellingen toe.

Foto's gaan nooit mee. Ook niet als de gebruiker daarom vraagt.

### AI-hulp

Onder de velden staat een knop **"Laat AI meeschrijven"**.

Daarboven, altijd zichtbaar: *"AI ontvangt je tekst met namen vervangen. Foto's gaan nooit mee."* met daarnaast de controlelink.

Hoort deze documentatie bij een reeks, dan staat er een tweede knop: **"Schrijf verder op de reeks"**. Die gebruikt je eerdere documentaties uit dezelfde reeks als context, zodat het vervolg aansluit op wat er eerder gebeurde. Bij die knop staat het er expliciet bij: *"Ook je eerdere documentaties uit deze reeks gaan mee."*

**AI schrijft kort.** Twee tot vier zinnen, in de stijl van de bestaande documentaties: informeel, in de wij-vorm, met uitroeptekens waar dat past. Geen beleidstaal, geen pedagogisch jargon, geen samenvattende slotzin. Een AI die hier zes zinnen van maakt heeft het fout gedaan.

**AI corrigeert spelling en schrijft losse aantekeningen aan elkaar. Verder niets.** Een zin die al loopt wordt niet anders geformuleerd. De eigen toon is het punt van deze documentaties.

Het AI-resultaat verschijnt **onder** je eigen tekst, niet ernaast en niet in plaats van. Met drie knoppen: Overnemen, Opnieuw, Weggooien.

Je eigen tekst wordt nooit overschreven zonder dat je erop tikt. En na "Overnemen" staat er even een knop "Ongedaan maken" — één tik terug, want er wordt direct opgeslagen.

Titel laten voorstellen komt in versie 2.

### Opmaak

Een documentatie krijgt een layout. Vier templates, afgeleid uit de bestaande pagina's van maart en mei. Ze dekken vrijwel elke pagina.

**Template A — tekst links, fotoraster rechts.** Vier tot zes foto's. De meest gebruikte indeling.

**Template B — tekst boven, fotorij onder.** Drie tot vier foto's. Voor als er meer tekst is dan gebruikelijk — dat mag, de zinlengte-eis geldt voor wat AI oplevert, niet voor wat jij zelf schrijft.

**Template C — tekst links, één grote foto.** Eén of twee foto's. Voor als één beeld de pagina draagt.

**Template D — alleen foto's.** Vier tot zes foto's, geen tekst. Voor een fotoserie zonder verhaal. Heeft de documentatie wél tekst of citaten, dan is D niet te kiezen — anders verdwijnt je tekst uit de export zonder dat je het ziet.

**Zonder foto's:** een documentatie die alleen uit tekst bestaat gebruikt template B, waarbij de tekst de hele pagina vult. A en C werken ook, met de fotokolom weggelaten. D niet.

De genoemde aantallen zijn wat er per pagina in past, geen ondergrens: drie foto's in template A is prima, die schuiven dan op.

**Regels voor alle templates:**

- Titel bovenaan, met de reeks erboven wanneer die is ingevuld.
- Daaronder in kleiner grijs: `Leerling(en): [waarde]`.
- Citaten krijgen een eigen plek in de opmaak, tussen aanhalingstekens, los van de lopende tekst. Behalve in template D: die heeft geen tekstvlak, dus een documentatie met citaten kan D niet kiezen — net als een documentatie met tekst.
- Bij minder foto's dan het template aankan schuift de rest op. Geen lege vakken.
- **Bij meer foto's of meer tekst dan er past, loopt de documentatie door naar een volgende pagina**, met de titel erboven herhaald. De deelbare afbeelding wordt één JPG per pagina. Hoeveel pagina's het worden hangt af van de template: zes foto's in template A is één pagina, in template C zijn het er drie. Het exportpaneel toont het aantal voordat je exporteert.

Later kunnen templates worden toegevoegd of vervangen; meer opmaaktemplates staan op de lijst voor versie 2. Ze staan los van de inhoud, dus dat raakt bestaande documentaties niet.

### Exportpaneel

Onderaan scherm 3 staan drie knoppen: **Opslaan · Print-PDF · Deelbare afbeelding**.

Opslaan gebeurt ook automatisch tijdens het typen. De knop is er voor de zekerheid.

Tik je op Print-PDF of Deelbare afbeelding, dan schuift er een paneel over het scherm heen. Geen nieuw scherm, geen navigatie weg van je werk. In dat paneel:

- **de vier templates als miniaturen** bovenaan, de huidige aangevinkt;
- **een voorbeeld** van de pagina zoals hij eruit komt te zien, over de volle breedte;
- **de exportknop** onderaan, met de indeling erbij: het aantal pagina's.

Wisselen van template kan altijd; de inhoud verandert niet mee. Een template die niet bij deze documentatie past staat er grijs bij, met de reden eronder — bijvoorbeeld: *"D is voor documentaties zonder tekst."*

### Exporteren

Twee bestemmingen, twee formaten.

**Printen (klas of gang)** — PDF, A4 liggend, foto's op 300 dpi. Rondom 10 mm veilige marge, zodat een kantoorprinter niets van de rand afsnijdt.

**Digitaal delen met ouders** — JPG per pagina, ongeveer 1600 pixels breed.

Bewust geen PDF voor de tweede: een afbeelding is meteen zichtbaar in een mail of ouderapp, een PDF moet eerst gedownload en geopend worden. En bewust JPG in plaats van PNG, omdat deze pagina's vol foto's staan en PNG bestanden oplevert die te groot zijn om te versturen.

**Delen gaat in één tik.** Naast de exportknop staat **Delen**. Op de telefoon opent dat het deelmenu van het toestel met het bestand er al in: Teams, mail, WhatsApp, waar je hem ook heen wilt. Op de laptop staat er in plaats daarvan **Kopieer afbeelding**, zodat je hem direct in een mail plakt.

Downloaden, terugzoeken in je fotorollen en dan pas versturen zijn vier handelingen voor iets wat er één kan zijn.

**Voor de deelbare afbeelding** verschijnt de eerste keer dat je van déze documentatie een afbeelding maakt een bevestiging:

> *"Deze documentatie wordt buiten school gedeeld. Controleer of alle kinderen op de foto's toestemming hebben voor beeldgebruik."*

Eén vinkje, geen automatische controle. EduFlow weet niet wie er op een foto staat en gaat dat ook niet proberen te bepalen. Bij een volgende export van dezelfde documentatie komt de vraag niet terug; bij een andere documentatie wel, want daar staan andere kinderen op.

**Namen blijven standaard staan** in beide exports, zoals in de huidige documentaties. Bij de deelbare afbeelding zit een schakelaar om ze te vervangen door initialen — die gebruikt dezelfde namenlijst als de AI-afscherming. Botsen twee initialen, dan wordt er een cijfer aan toegevoegd (K1, K2). Zet je die schakelaar aan, dan toont het voorbeeld direct wat er verandert, zodat je ziet wat er niet is vervangen.

---

## Scherm 4 — Mail

Geen koppeling met Outlook. EduFlow schrijft, jij verstuurt.

**Drie tabbladen:**

### Nieuw

1. **Onderwerp** — één regel. Dit is waarop je je concept later terugvindt. Laat je hem leeg, dan wordt de eerste regel van de mail gebruikt.
2. Kies een sjabloon of begin blanco. Sjablonen: oudermail, collega, uitnodiging, verslag. Een sjabloon is geen kant-en-klare tekst maar een vaste opzet plus een instructie aan de AI — daarom klinkt een oudermail anders dan een mail aan een collega, ook als je hetzelfde intikt. Meer sjablonen komen in versie 2.
3. Beschrijf in een paar zinnen wat de mail moet zeggen.
4. Kies een toon: zakelijk, vriendelijk, kort.
5. AI schrijft.
6. Je past aan. Onder het resultaat staat één knop: **Spelling nakijken**. Verder niets — inkorten, uitbreiden, samenvatten en achteraf van toon wisselen komen in versie 2.
7. **Kopieerknop** — grote knop, bovenaan bij het resultaat. Dit is de belangrijkste knop van het scherm.

### Beantwoorden

Plak een ontvangen mail in het veld. Geef aan wat je wilt antwoorden. AI stelt een antwoord op. Kopiëren.

Waarschuwing bij dit veld: *"Plak geen gegevens van kinderen of ouders."*

En daaronder dezelfde controlelink als op scherm 3: **"Bekijk wat er verstuurd wordt"**. Dit is in de praktijk de plek waar de meeste persoonsgegevens langskomen — een ontvangen oudermail staat er vol mee, en de namenlijst kent alleen de voornamen van je eigen groep. De waarschuwing alleen is niet genoeg.

### Concepten

Opgeslagen mails, nieuwste eerst, met het onderwerp als regel. Zoeken, openen, aanpassen, kopiëren, verwijderen.

Inkorten, uitbreiden, samenvatten en achteraf van toon wisselen komen in versie 2.

**Niet in dit scherm:** een inbox, een verzendknop, ontvangers, bijlagen.

---

## Scherm 5 — Agenda

Twee soorten items, duidelijk uit elkaar te houden.

**Schoolvakanties** komen uit een databestand op basis van open data van de Rijksoverheid. Lichtgrijs.

**Eigen afspraken** voer je zelf in. In kleur.

### Welke vakanties je mag aanpassen

Alleen de kerst- en zomervakantie liggen landelijk vast. Voor de herfst-, voorjaars- en meivakantie geeft het ministerie alleen adviesdata; scholen mogen daarvan afwijken.

Daarom:

- **kerst- en zomervakantie:** niet te bewerken;
- **herfst-, voorjaars- en meivakantie:** een klein potloodje waarmee je de datums voor jouw school aanpast. Die aanpassing blijft staan, ook als het databestand later wordt bijgewerkt.

Eigen invoer gaat altijd boven de landelijke data. Een aangepaste vakantie krijgt een klein merkteken, zodat je ziet dat het niet meer de landelijke datum is.

Studiedagen en margedagen staan niet in de landelijke data en voer je zelf in. Ze krijgen een eigen kleur, zodat ze in het jaaroverzicht opvallen.

### Weergave

**Telefoon:** lijst met komende weken. Scrollen. Terugbladeren naar eerdere weken kan.

**Laptop:** maandweergave, met daaronder dezelfde lijst. Plus een derde weergave:

**Jaar** — het hele schooljaar op één scherm, twaalf maanden naast elkaar, met de vakanties, studiedagen en margedagen ingekleurd. Dit is het scherm dat je in augustus openslaat om te zien hoe het jaar eruitziet.

### Afspraak toevoegen en wijzigen

Titel, datum, tijd (of hele dag), notitie. Meer niet.

Een bestaande afspraak open je door hem aan te tikken; hetzelfde formulier, met onderaan een knop om te verwijderen. Verwijderen vraagt om bevestiging.

Geen deelnemers, geen locatie, geen herhaling, geen herinneringen of meldingen in versie 1.

### Instellen

**Regio: noord, midden of zuid.** Standaard noord. Bij het eerste gebruik wordt die keuze één keer bevestigd, met noord al aangevinkt. Aanpasbaar in de instellingen.

---

## Scherm 6 — Instellingen

- **Namen van je groep** — de voornamen die EduFlow moet afschermen voordat tekst naar AI gaat. Blijft lokaal.
- **Reeksen** — bestaande reeksen hernoemen of opruimen.
- **Standaard leerlingen** — bijvoorbeeld "groep geel", zodat dat veld vast staat ingevuld.
- Vakantieregio
- Schrijfstijl voor documentaties (voorbeeldtekst die AI als richtlijn gebruikt — vul hier een bestaande documentatie in)
- Standaardtoon voor mail
- AI-provider
- **Back-up maken** — alles in één bestand: documentaties, foto's, mail, agenda, instellingen
- **Back-up terugzetten** — op dit apparaat of een ander
- Alle gegevens wissen

Bovenaan staat hoeveel ruimte er in gebruik is. Zit je boven de 80%, dan staat daar een waarschuwing met een knop naar back-up maken en opruimen.

Is er een maand geen back-up gemaakt, dan verschijnt daar een herinnering. Dit is de enige kopie van je werk.

---

## Gedeelde patronen

**Opslaan.** Automatisch tijdens het typen. Kort bericht in beeld: "Opgeslagen."

**Fouten.** Altijd in gewone taal, altijd met een vervolgstap. Niet: "Error 500." Wel: "Het lukte niet om AI te bereiken. Je tekst is bewaard. Probeer het zo nog eens."

**Wachten.** Alles wat langer dan een seconde duurt krijgt zichtbare voortgang. Nooit een bevroren scherm.

**Verwijderen.** Vraagt altijd om bevestiging en zegt wat er verdwijnt.

**Lege schermen.** Nooit alleen leegte. Altijd één zin die uitlegt wat hier komt te staan, plus één knop.

**Zonder internet.** Alles werkt, behalve de AI-knoppen. Die zeggen dat en laten je tekst staan.

---

## Buiten versie 1

**Komt in versie 2:**

- Kennisbank — eigen documenten als context voor AI
- Losse AI Chat
- Titel laten voorstellen door AI
- Mail inkorten, uitbreiden, samenvatten en achteraf van toon wisselen
- Meer mailsjablonen en meer opmaaktemplates
- Centrale logging in plaats van alleen de browserconsole
- Donkere modus — de export moet hoe dan ook licht blijven, dus donkere modus levert een tweede stylinglaag op die alleen voor de invoerschermen geldt

**Komt in versie 3:**

- Inloggen en accounts
- Delen met collega's
- Synchronisatie tussen je eigen apparaten

**Komt niet:**

- Inbox, mail versturen, Outlook
- Agenda synchroniseren met Microsoft
- Momento en browserautomatisering

---

## Besluiten

Alle openstaande punten uit de review van 4 augustus 2026 zijn afgehandeld. De onderbouwing staat in `05 - Besluiten.md`.

- **Velden documentatie** — afgeleid uit de bestaande documentaties van maart en mei.
- **Gespreksmodus** — de foto's stellen de vragen; de foto zelf blijft op het apparaat.
- **Opmaak** — vier templates, uitbreidbaar zonder dat bestaande documentaties veranderen. Past het niet, dan loopt het door naar een volgende pagina.
- **Export** — PDF voor printen, JPG voor delen, plus delen in één tik.
- **Status** — volgt uit export, niet uit een knop.
- **Toestemming beeldgebruik** — één keer per documentatie.
- **Apparaten** — geen synchronisatie; overzetten via een back-upbestand.
- **Vakantieregio** — standaard noord, te bevestigen bij het eerste gebruik.
- **Donkere modus** — versie 2.

Dit document is klaar om op te bouwen.
