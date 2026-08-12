<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 3. AI-filosofie

### 3.1 AI als collega die meeschrijft, niet als schrijver

Er zit een collega naast je. Je hebt zes foto's gemaakt en drie regels getypt, en die collega
leest mee. Ze zegt niet: ik doe het wel. Ze zegt: zal ik er dit van maken. Dan schuift ze een vel
papier naar je toe. Jij leest het, streept door wat er niet klopt en typt het laatste stuk zelf.
Het vel papier is nooit vanzelf jouw tekst geworden.

Dat beeld bepaalt de vorm van elke AI-interactie in EduFlow, tot in de knoplabels. De knop heet
**Laat AI meeschrijven**, niet "Schrijf voor mij". Het resultaat heet een voorstel, niet een tekst
en niet een verbetering, en het komt in een eigen blok onder je eigen tekst, nooit erin.

Uit die houding volgen zes regels voor de toon van elk AI-onderdeel.

- **Geen persoon.** Geen naam, geen gezicht, geen gespreksbubbels, nooit "ik". Een persona nodigt
  uit tot vertrouwen dat de uitvoer niet heeft verdiend en maakt onduidelijk wie verantwoordelijk
  is voor wat er naar ouders gaat. Dat ben jij.
- **Geen voldongen feit.** Nergens staat "AI heeft je tekst verbeterd". Er staat "Voorstel", met
  eronder **Overnemen**, **Opnieuw** en **Weggooien**.
- **Geen complimenten en geen overbodige vragen.** Geen "goed bezig". De AI vraagt alleen wat hij
  voor de taak nodig heeft; in Gespreksmodus is dat één vraag per foto (B-03).
- **Geen zekerheidstaal.** Geen "dit is een sterke documentatie", geen "ik weet zeker". Dat is een
  fout in de uitvoer, geen stijl.
- **Altijd zichtbaar dat het AI is.** Elk voorstel is in het scherm zelf gemarkeerd. Zo vult
  EduFlow de transparantieverplichting in: in de handeling, niet in een kleine letter onderaan
  (zie hoofdstuk 15).

De vergelijking is begrensd. Een collega die meekijkt bij documentatie over kinderen heeft een
geheimhoudingsplicht en een oordeel over wat opgeschreven hoort te worden; een taalmodel heeft dat
niet. De AI mag daarom meeschrijven, maar niet meedenken over het kind (§3.3 en §3.4). Hoe dat
technisch is dichtgezet staat in hoofdstuk 12.

### 3.2 De vijf AI-wetten van EduFlow

Deze vijf wetten gaan boven elke andere AI-keuze. Een functie die ermee botst wordt niet gebouwd,
ook niet als hij handig is. Ze heten `AIW-1` tot en met `AIW-5`.

| Wet | Regel in één zin |
|---|---|
| `AIW-1` | AI stelt voor en voert niet uit. |
| `AIW-2` | AI is transparant over wat het verstuurt. |
| `AIW-3` | AI verstuurt nooit naar derden. |
| `AIW-4` | AI beoordeelt geen kinderen. |
| `AIW-5` | AI die stil faalt is erger dan AI die niet werkt. |

#### 3.2.1 AIW-1 — AI stelt voor en voert niet uit

Elk AI-resultaat is een voorstel dat pas tekst wordt door een menselijke handeling. Er bestaat
in EduFlow geen situatie waarin je documentatie verandert zonder dat jij daarop hebt geklikt of
getikt. Dit is de dagelijkse invulling van U-10.

Ontwerpgevolgen:

- Het voorstel verschijnt in een eigen blok onder je tekst; je tekstveld en je cursor blijven
  onaangeroerd (zie §4.5).
- **Overnemen** is de enige route van het voorstel naar je tekst. Er is geen instelling "altijd
  overnemen" en die komt er ook niet.
- Alleen een knop start een aanroep: niet het openen van een scherm, niet opslaan, niet
  exporteren. Een lopende aanroep is altijd te annuleren en laat dan niets achter.
- Correctie tijdens het typen bestaat niet. Geen woord dat onder je handen verandert, geen
  achtergrondtaak die je tekst bijwerkt.
- Na **Overnemen** volgt altijd ongedaan maken (T-07, zie §4.8).

#### 3.2.2 AIW-2 — AI is transparant over wat het verstuurt

Vóór elke aanroep kun je de volledige opdracht lezen: de systeeminstructie, het stijlprofiel, de
gekozen voorbeelden, de reekscontext en je eigen tekst. Niet samengevat, maar letterlijk, met de
codes uit `PrivacyService` erin. Dat is wat **Bekijk wat er verstuurd wordt** laat zien.

Ontwerpgevolgen:

- De link staat naast elke AI-knop, in beeld, niet in een menu.
- Paneel en aanroep komen uit dezelfde bron: `PromptService.build()` levert één object, het paneel
  toont het en `AIService.run()` verstuurt het. Wat niet in het paneel staat, gaat niet mee; een
  toevoeging op een andere plek is een fout die de bouw blokkeert. Dit is U-03 op de AI-laag.
- Het paneel toont ook provider, model, regio van verwerking en bewaartermijn. Karin, de
  functionaris gegevensbescherming, moet dit scherm kunnen openen en niets hoeven vragen.
- Het paneel is te kopiëren met **Kopieer**.

#### 3.2.3 AIW-3 — AI verstuurt nooit naar derden

De AI in EduFlow heeft precies één route naar buiten: van de eigen server naar de gekozen provider,
met één opdracht, en terug met tekst. Verder niets: geen mail, geen deelactie, geen opslag bij een
derde, geen aanroep van een andere dienst.

Ontwerpgevolgen:

- De aanroep gebruikt geen gereedschappen en geen functieaanroepen; het model kan alleen tekst
  teruggeven.
- De server heeft één toegestane uitgaande bestemming: het adres van de actieve adapter. Al het
  andere uitgaande verkeer is geblokkeerd, en dat is te controleren.
- De app vraagt bij Microsoft of Google geen enkel verzendrecht aan (B-20). De eindhandeling in
  Mail is **Als concept in je mailprogramma** of **Kopieer**. Er is geen verzendknop.
- Foto's, blobs en bestandsnamen gaan nooit mee (zie §3.11).
- Er staan geen scripts van derden in de app en geen meetdienst van buiten (T-18).

#### 3.2.4 AIW-4 — AI beoordeelt geen kinderen

EduFlow beschrijft wat er gebeurde. Hij zegt niet wat een kind kan, is, wordt of nodig heeft.
Geen cijfers, geen niveaus, geen vergelijkingen tussen kinderen, geen voorspellingen, geen
signalen in de trant van "let op dit kind", geen ontwikkelingsconclusies (B-25).

Ontwerpgevolgen:

- De interpretatiegrendel uit §3.3 is een harde controle op de uitvoer, geen verzoek in de
  instructie.
- Er bestaat geen veld waarin een niveau, een score of een vinkje "beheerst" past.
- De reekscontext levert eerdere tekst, geen voortgang: de documentaties uit **Kunstwerk Dok**,
  niet een lijn "hoe gaat het met Kjeld".
- De gouden testset bevat invoer die uitnodigt tot een oordeel, met als verwachte uitkomst dat het
  oordeel er niet komt (zie hoofdstuk 17 en 20).
- Dit is ook de reden dat EduFlow buiten de hoog-risicocategorie blijft (zie hoofdstuk 15).

#### 3.2.5 AIW-5 — AI die stil faalt is erger dan AI die niet werkt

Een assistent die niet werkt kost je een handeling: je schrijft het zelf. Een assistent die
stilletjes iets verkeerds doet, kost je vertrouwen in alles wat hij eerder deed. Stil falen heeft
hier vijf vormen: een leeg antwoord dat als voorstel wordt getoond, een afgekapt antwoord dat er af
uitziet, een naam die niet vervangen bleek, een onopgemerkte terugval naar een ander model, en een
vermijdregel die maar half is toegepast.

Ontwerpgevolgen:

- Elke aanroep krijgt een zichtbare uitkomst. Er bestaat geen knop die niets doet.
- Een antwoord dat een grendel uit §3.3 niet haalt, wordt niet als voorstel getoond maar als
  melding met de reden en met de knop **Opnieuw**.
- Een code in het antwoord die niet in de `PseudonymMap` van deze aanroep voorkomt, blokkeert
  **Overnemen**. Zo'n code betekent dat het model iets heeft verzonnen dat op een naam lijkt.
- Terugval naar een kleiner model wordt boven het voorstel gemeld (zie §3.9).
- Elke aanroep komt met uitkomst en duur in het logboek (`AuditEvent`), lokaal en leesbaar.

### 3.3 Wat AI wel en niet mag herschrijven

Dit is het inhoudelijke hart van EduFlow. Twee eisen die allebei waar moeten zijn spreken elkaar op
het eerste gezicht tegen: de AI maakt van een losse observatie een lopende tekst, én de AI
herschrijft je stijl niet. Structureren ís herschrijven. Zonder toetsbare grens is elke uitspraak
over kwaliteit een mening.

De spanning wordt niet weggepraat maar opgeknipt. Er zijn zes bewerkingen die je op een tekst kunt
uitvoeren: drie mogen altijd, één mag begrensd, twee mogen nooit.

| # | Bewerking | Wat het is | Mag |
|---|---|---|---|
| 1 | Ordenen | Volgorde herstellen, losse regels in alinea's zetten, chronologie rechttrekken | Ja |
| 2 | Verbinden | Voegwoorden, lidwoorden en verwijswoorden toevoegen zodat er zinnen ontstaan | Ja |
| 3 | Corrigeren | Spelling, interpunctie, verbuiging, dubbele woorden | Ja |
| 4 | Herformuleren | Andere woordkeuze of zinsbouw voor hetzelfde feit | Begrensd |
| 5 | Toevoegen | Feiten, oordelen, emoties of conclusies die er niet stonden | Nee |
| 6 | Weglaten | Feiten, citaten, namen of getallen die er wel stonden | Nee |

Bewerking 4 is de enige waar oordeelsvorming bij komt kijken, en dus de enige die een getal
nodig heeft. Dat getal komt uit de grendels hieronder.

#### 3.3.1 De vijf grendels

Elke AI-uitvoer die als voorstel in beeld mag komen, haalt vijf grendels. Ze worden in de
servicelaag op de uitvoer gecontroleerd voordat er iets zichtbaar wordt. Faalt er één, dan zie je
een melding met de reden en niet het voorstel (`AIW-5`).

| Grendel | Regel | Meetbaar als |
|---|---|---|
| `G1` Feitengrendel | Geen inhoudswoord dat niet in de invoer of de reekscontext stond | Nieuwe inhoudswoorden buiten de verbindingslijst: 0 |
| `G2` Behoudsgrendel | De uitvoer laat niets weg | Ten minste 70 procent van de inhoudswoorden komt letterlijk of verbogen terug |
| `G3` Citaatgrendel | Wat tussen aanhalingstekens staat blijft letterlijk | Tekens binnen citaten 100 procent gelijk |
| `G4` Lengtegrendel | De uitvoer blaast niet op en knipt niet in | Woordaantal tussen 0,8 en 1,4 keer de invoer |
| `G5` Interpretatiegrendel | Geen oordeel over een kind | 0 treffers op de interpretatielijst, tenzij het woord in de invoer stond |

De verbindingslijst bij `G1` is een vaste, leesbare lijst met functiewoorden en tijdsaanduidingen
die de AI mag toevoegen: lidwoorden, voorzetsels, voegwoorden, verwijswoorden en woorden als
daarna, vervolgens, terwijl, eerst, samen. Die lijst staat in de broncode als data en is te lezen
in **Bekijk wat er verstuurd wordt**.

De interpretatielijst bij `G5` bevat de formuleringen die van beschrijven interpreteren maken: kan,
beheerst, begrijpt, is goed in, heeft moeite met, ontwikkelt zich, niveau, sterk, zwak, typisch,
altijd, nooit, trots, verlegen, zelfstandig, sociaal, creatief, plus waarderende bijwoorden als
prachtig, knap en maar liefst. De lijst is uitbreidbaar in Instellingen en groeit ook via de
correctieregels (§3.5).

Niet alle grendels gelden voor alle taken. De taken van versie 1.0 en hun grendels:

| Taak | `G1` | `G2` | `G3` | `G4` | `G5` |
|---|---|---|---|---|---|
| Losse observatie tot lopende tekst | Ja | Ja | Ja | Ja | Ja |
| Spelling en interpunctie | Ja | 95 procent | Ja | 0,95 tot 1,05 | Ja |
| Gespreksmodus tot documentatie | Ja | Ja | Ja | Tot 1,5 | Ja |
| Vervolgzin uit de reeks | Ja | Nee | Ja | Hoogstens 40 woorden | Ja |
| Ontvangen bericht samenvatten | Ja | Nee | Ja | Hoogstens 0,4 | Ja |
| Antwoordconcept opstellen | Nee | Nee | Ja | Nee | Ja |

Bij het antwoordconcept staat `G1` uit, want een antwoord bevat per definitie zinnen die niet in de
invoer stonden. Daar geldt een andere bescherming: geen feiten over het kind die niet in het
ontvangen bericht of in je aanwijzing stonden, en het concept gaat pas weg als jij het zelf
verstuurt (B-19).

#### 3.3.2 Beschrijven of interpreteren, de kernregel

De vijf grendels zijn de meting. De regel eronder is één zin: **EduFlow beschrijft wat er gebeurde
en wat een kind zei, en interpreteert niet wat een kind kan of is.**

De toets is simpel. Een zin is een beschrijving als een tweede volwassene die erbij stond het had
kunnen zien of horen; een interpretatie als je er kennis of een oordeel voor nodig hebt. "Guus
probeerde de toren zes keer opnieuw" had je kunnen tellen, "Guus is een doorzetter" niet.

| Interpretatie | Beschrijving |
|---|---|
| Kjeld kan goed samenwerken | Kjeld en Aya verdeelden de plaat in tweeën |
| Noa V. is verlegen | Noa V. keek van een afstand toe en zei niets |
| Aya begrijpt drijven en zinken | Aya zei: "de steen gaat naar beneden want hij is zwaar" |
| Mees was trots | Mees liet zijn bouwwerk aan drie kinderen zien |
| Fenna heeft moeite met de schaar | Fenna knipte langs de lijn en week twee keer af |
| Guus is een doorzetter | Guus probeerde de toren zes keer opnieuw |
| De groep genoot zichtbaar | Er werd gelachen; acht kinderen bleven tot het einde |
| Pippa ontwikkelt zich in taal | Pippa vertelde in vier zinnen wat ze had gebouwd |

De rechterkolom is niet zwakker dan de linker, hij is bruikbaarder. Een ouder die leest dat Fenna
twee keer van de lijn afweek, weet iets. Een ouder die leest dat Fenna moeite heeft met de schaar,
weet alleen wat jij ervan vond. En Joost, die over een half jaar terugleest, heeft aan de
beschrijving iets en aan het oordeel niets, want hij weet niet meer waar het op stoelde.

Deze regel bindt de AI, niet jou. Jij mag opschrijven wat je wilt, ook een oordeel of een zorg.
EduFlow markeert je eigen zinnen niet en verbetert ze niet. De app corrigeert alleen wat de app
zelf produceert; dezelfde lijn als bij de zinslengte-eis (§3.4).

#### 3.3.3 Drie voorbeeldparen

De grendels zijn de norm; deze drie paren zijn de uitleg. Ze staan ook in de gouden testset, met
dezelfde namen (zie hoofdstuk 20).

**Paar 1 — losse notitie tot lopende tekst, reeks Kunstwerk Dok.**

Invoer, zoals Ilse het op donderdagmiddag typt:

```
dok. Kjeld en Aya samen aan de grote plaat. Kjeld wilde blauw, Aya geel.
eerst ruzie. daarna afgesproken: helft-helft. Kjeld zei "dan is het de zee
en de zon". 40 min doorgewerkt.
```

Goede uitkomst:

```
Kjeld en Aya werkten samen aan de grote plaat. Kjeld wilde blauw gebruiken,
Aya geel. Eerst kregen ze ruzie. Daarna spraken ze af om de plaat in tweeën
te delen. Kjeld zei: "dan is het de zee en de zon". Ze werkten veertig
minuten door.
```

Te ver doorgeschoten:

```
Kjeld en Aya lieten prachtig zien hoe goed ze inmiddels kunnen samenwerken.
Waar het in het begin nog wat stroef verliep, vonden ze al snel een creatieve
oplossing: de een nam de zee, de ander de zon. Kjeld toonde zich hierbij een
echte onderhandelaar. Met veel plezier en concentratie werkten ze maar liefst
veertig minuten door aan hun kunstwerk.
```

Wat er misgaat: "kunnen samenwerken" en "een echte onderhandelaar" zijn oordelen over Kjeld (`G5`),
"prachtig" en "maar liefst" zijn waardering (`G5`), "met veel plezier en concentratie" is een niet
waargenomen emotie (`G1` en `G5`), het citaat is verdwenen (`G3`) en de tekst is 1,8 keer zo lang
(`G4`). Dit voorstel komt niet in beeld.

**Paar 2 — Gespreksmodus tot documentatie, reeks ONDERZOEK Natuur.**

Invoer, drie antwoorden van Fatima op drie fotovragen:

```
1. regenwormen gezocht in de moestuin. Hanae vond er 6 onder de plank.
2. Noa V. wilde ze niet aanraken, keek van dichtbij mee met het vergrootglas.
3. Mees vroeg waarom ze zo glad zijn. we hebben het opgezocht in het boek.
```

Goede uitkomst:

```
In de moestuin zochten we naar regenwormen. Hanae vond er zes onder een plank.
Noa V. wilde de wormen niet aanraken en keek van dichtbij mee door het
vergrootglas. Mees vroeg waarom regenwormen zo glad zijn. Dat hebben we samen
opgezocht in het boek.
```

Te ver doorgeschoten:

```
Wat een ontdekkingstocht was het vandaag. De kinderen gingen als echte
onderzoekers op zoek naar regenwormen. Hanae was het meest fanatiek en vond
er maar liefst zes. Noa durfde de wormen nog niet aan te raken, maar keek wel
nieuwsgierig mee, een mooie stap in haar ontwikkeling. Mees stelde een echte
onderzoeksvraag. Samen zochten we het antwoord op, want nieuwsgierigheid mag
hier groeien.
```

Hier zit de gevaarlijkste fout van allemaal: "Noa" in plaats van "Noa V.". In Groep 4 – De
Regenboog zitten twee kinderen die Noa heten. Een AI die de letter erachter weglaat, schrijft een
documentatie over het verkeerde kind, en dat is de tekst die naar een ouder gaat. Daarom is `G2`
geen luxe. Verder: "een mooie stap in haar ontwikkeling" botst frontaal met `AIW-4`, en "durfde nog
niet" maakt van "wilde niet" een uitspraak over angst die Fatima niet deed.

**Paar 3 — vervolgzin uit de reeks, Kunstwerk Dok, documentatie 4.**

Invoer: de drie eerdere documentaties uit de reeks, waarin de kinderen de kade bouwden en de
boten schilderden, plus de nieuwe notitie:

```
vandaag het dok afgemaakt. Roos en Sam hebben de kraan geverfd.
```

Goede uitkomst:

```
In de eerdere documentaties van Kunstwerk Dok bouwden de kinderen de kade en
schilderden ze de boten. Vandaag maakten Roos en Sam de kraan af.
```

Te ver doorgeschoten:

```
Zo komt Kunstwerk Dok tot een mooi einde. In vier weken hebben de kinderen
laten zien dat ze steeds zelfstandiger kunnen samenwerken en dat hun fijne
motoriek zichtbaar vooruit is gegaan.
```

De vervolgzin heeft één taak: de nieuwe documentatie verbinden met wat er al staat. Geen lijn
trekken, geen ontwikkeling vaststellen, geen project afsluiten. De tweede uitkomst laat zien wat de
reeksfunctie aantrekkelijk en gevaarlijk maakt: zodra een AI meerdere momenten naast elkaar ziet,
trekt hij conclusies. `G5`, `AIW-4` en de grens van veertig woorden houden die deur dicht.

Roos en Sam zijn bovendien gewone Nederlandse woorden. Wat dat betekent voor het vervangen van
namen staat in hoofdstuk 12; hier telt alleen dat het model deze twee kinderen als code te zien
krijgt.

### 3.4 De zinslengte-eis en waarom die alleen voor AI geldt

Lange zinnen zijn in dit domein geen stijlkwestie maar de plek waar interpretatie zich verstopt.
"Kjeld, die zichtbaar genoot van het samenwerken, kwam met een oplossing waar Aya ook blij mee was"
is één zin met drie oordelen erin. Kort je hem in, dan vallen die oordelen eruit. Daarom is de
zinslengte-eis een AI-eis en geen schrijfadvies.

De norm voor AI-uitvoer:

| Maat | Waarde |
|---|---|
| Doel voor de gemiddelde zinslengte | Het gemeten gemiddelde uit je stijlprofiel |
| Band waarbinnen dat doel valt | 8 tot 18 woorden |
| Absoluut plafond per zin | 25 woorden |
| Zinnen boven de 20 woorden | Hoogstens één per alinea |
| Alinealengte | Hoogstens 5 zinnen |

Het doel is niet een vast getal maar jouw getal. Schrijft Fatima in zinnen van elf woorden, dan
mikt de AI op elf. Schrijft Bram op negentien, dan mikt de AI op achttien, want daar houdt de band
op. Het plafond van 25 woorden geldt altijd, ook als jouw eigen zinnen langer zijn; een zin
daarboven is een grendelfout en dus een melding, geen voorstel.

B-41 zegt dat deze eis alleen voor AI-uitvoer geldt. Daar zijn drie redenen voor, en ze zijn alle
drie ontwerpredenen, geen beleefdheid.

- **Jouw tekst is auteurschap, niet uitvoer.** Een assistent die je eigen zinnen gaat tellen wordt
  een schoolmeester, en dat is niet de collega uit §3.1.
- **De eis is alleen toetsbaar op uitvoer.** Bij AI is er een invoer en dus een vergelijking. Bij
  jouw tekst is er geen invoer, dus geen norm, alleen een mening.
- **De aanleiding zit in de uitvoer.** Taalmodellen zijn getraind op teksten waarin lange,
  waarderende zinnen als goed schrijven gelden. Dat is precies de stijl die hier fout is.

In het schrijfscherm staat dus nooit een teller, nooit een gekleurde rand om een lange zin, nooit
een tip. Typ je zelf een zin van veertig woorden, dan gebeurt er niets. Vraag je daarna om mee te
schrijven, dan komt het voorstel binnen de norm terug: de AI knipt je zin in twee of drie zinnen
met dezelfde inhoud, en `G4` zorgt dat er niets uit verdwijnt. Dat is ordenen, en dat mag.

### 3.5 Leren zonder trainen

EduFlow leert van jou. Na twintig documentaties schrijft hij merkbaar meer zoals jij schrijft dan
op dag één. Er wordt daarbij geen model getraind, bijgesteld of verfijnd, en er gaat niets naar een
provider om van te leren (B-22). Wat er wél gebeurt zijn drie mechanismen: alle drie lokaal, alle
drie leesbaar, alle drie terug te draaien (U-09, B-23).

#### 3.5.1 Mechanisme 1 — stijlkenmerken

Het `StyleProfile` is een leesbaar bestand met gemeten eigenschappen van jouw teksten. Gemeten
wordt uit twee bronnen: tekst die je zelf hebt geschreven en tekst die je hebt overgenomen en
daarna hebt laten staan.

| Kenmerk | Wat er gemeten wordt | Hoe het in de opdracht terechtkomt |
|---|---|---|
| Gemiddelde zinslengte | Woorden per zin | Doelwaarde binnen de band uit §3.4 |
| Alinealengte | Zinnen per alinea | Doelwaarde |
| Aanspreekvorm | Verhouding wij, ik, de kinderen, losse namen | Voorschrift |
| Werkwoordstijd | Verleden tegenover tegenwoordige tijd | Voorschrift |
| Beschrijving tegenover interpretatie | Aandeel zinnen zonder woord uit de interpretatielijst | Alleen meting |
| Citaatgebruik | Citaten per honderd woorden | Voorschrift, maximaal jouw waarde |
| Vaktaalniveau | Aandeel woorden buiten de 2.000 gangbaarste | Voorschrift |
| Veelgebruikte woorden | De 25 inhoudswoorden die jij vaker gebruikt | Voorkeurslijst |
| Vermeden woorden | De vermijdlijst uit mechanisme 3 | Verbodslijst |

Bijwerken gebeurt op twee momenten en alleen daar: bij de eerste geslaagde export, het moment
waarop de status van concept naar gedeeld gaat (B-13), en bij het verlaten van een tekstveld waarin
sinds de vorige meting veertig woorden of meer zijn bijgekomen. Het profiel rekent over een
voortschrijdend venster van dertig teksten en hoogstens twaalf maanden, zodat het meebeweegt als
jouw schrijven verandert.

Je ziet het profiel in Instellingen → Schrijfstijl: een lijst met kenmerken, gemeten waarden, de
datum van meting en het aantal teksten waarop de meting stoelt. Elk kenmerk heeft drie handelingen:
**vastzetten**, **wijzigen** en **terugzetten**. Eén knop wist het hele profiel. Elke wijziging
komt met datum in de wijzigingsgeschiedenis, zodat je kunt zien waarom je uitvoer sinds vorige week
anders klinkt.


#### 3.5.2 Mechanisme 2 — voorbeeldselectie

Bij elke aanroep gaan er hoogstens drie eerdere documentaties mee als voorbeeld. Ze worden per
aanroep opnieuw gekozen op gelijkenis met je huidige invoer:

| Deel van de score | Gewicht | Wat het meet |
|---|---|---|
| Overlap in inhoudswoorden | 0,5 | Dezelfde zelfstandige naamwoorden en werkwoorden |
| Zelfde reeks | 0,3 | Of de documentatie in dezelfde `Series` zit |
| Recentheid | 0,2 | Halveringstijd van negentig dagen |

De drie hoogste scores gaan mee, samen hoogstens 1.200 woorden. Is er nog niets om uit te kiezen,
dan gaat het voorbeeld mee dat je zelf in Instellingen hebt gezet, en anders geen. Een aanroep
zonder voorbeelden is geen fout, alleen een minder op jou lijkend voorstel.

Je ziet de selectie in **Bekijk wat er verstuurd wordt**, met de titels en de volledige tekst zoals
die meegaat. Daar kun je een voorbeeld voor deze aanroep uitzetten; in Instellingen → Schrijfstijl
markeer je een documentatie als **altijd meesturen** of **nooit meesturen**. Terugdraaien is het
weghalen van die markering.

Eén regel is niet onderhandelbaar. Voorbeelden worden opgeslagen in de vorm waarin ze verstuurd
worden: gepseudonimiseerd, met codes in plaats van namen, en zonder bewaarde `PseudonymMap`. Een
voorbeeld uit de groep van vorig jaar bevat dus geen naam meer die vandaag niet in je
leerlingenlijst staat. Dit sluit het gat dat ontstaat als de leerlingenlijst en het stijlvoorbeeld
uit verschillende jaren komen.

#### 3.5.3 Mechanisme 3 — correctieregels

Dit mechanisme kijkt naar het verschil tussen wat de AI gaf en wat er uiteindelijk stond. Haal je
een woord of een wending drie keer binnen negentig dagen uit een voorstel weg, dan stelt de app
voor het op de vermijdlijst te zetten. Jij bevestigt. Zonder bevestiging gebeurt er niets, ook
niet na de tiende keer.

| Wat er gemeten wordt | Drempel | Wat de app voorstelt |
|---|---|---|
| Woord uit het voorstel dat je verwijderde | 3 keer in 90 dagen | Op de vermijdlijst |
| Woord dat je toevoegde waar de AI iets anders koos | 3 keer in 90 dagen | Op de voorkeurslijst |
| Vaste wending die je verving | 3 keer in 90 dagen | Vervang A voortaan door B |

De voorstellen verschijnen niet als venster midden in je werk. Ze verzamelen zich in Instellingen →
Schrijfstijl onder **Voorstellen**, met het aantal erbij: "je haalde 'maar liefst' drie keer weg".
Aan en uit kost één tik. In het schrijfscherm verschijnt hoogstens een melding in de onderbalk.

Opgeslagen wordt het woord en de teller, niet de zin waar het in stond. Die tekst staat al in je
documentatie; hem tweemaal bewaren levert niets op en kost privacy.

#### 3.5.4 Waarom dit geen modeltraining is, en waarom dat uitmaakt

Een AI-systeem kan zich op drie manieren aan een gebruiker aanpassen: de gewichten veranderen
(trainen of verfijnen), een meegetrainde laag erbovenop leggen, of de opdracht veranderen die je
aan een onveranderd model stelt. EduFlow doet uitsluitend het derde.

Het `StyleProfile`, de voorbeelden en de vermijdlijst zijn tekst die in de opdracht wordt gezet.
Het model dat op maandag antwoordt is bit voor bit hetzelfde model als het model dat op vrijdag
antwoordt. Zet je het profiel terug op de standaard, dan gedraagt het systeem zich weer precies
zoals op dag één. Dat is de toets: wat je terug kunt zetten met één knop, is geen training.

Dat onderscheid is niet academisch. Het heeft drie gevolgen die alle drie in het gesprek met
Karin en met het bestuur terugkomen (zie hoofdstuk 15).

- **Je blijft gebruiker en wordt geen aanbieder.** Wie een AI-systeem wezenlijk aanpast, krijgt de
  verplichtingen van een aanbieder. Een school die verfijnt op leerlingtekst komt daar terecht; een
  school die een leesbaar stijlprofiel meestuurt niet.
- **Er verdwijnt geen persoonsgegeven in een model.** Getrainde gewichten zijn niet te inspecteren,
  corrigeren of wissen. Een leesbaar profiel is dat wel, dus inzage, rectificatie en verwijdering
  zijn uitvoerbaar.
- **De bewaarvraag wordt hanteerbaar.** Wat er bij de provider terechtkomt is één opdracht per
  aanroep. Er is geen tweede stroom van leergegevens.

### 3.6 Feedback als eerste-klas handeling

Een duim omhoog of omlaag is te grof. Hij vertelt dat iemand ontevreden was, niet waarover, en hij
wordt alleen ingevuld door wie toch al iets wilde zeggen. Het echte signaal ligt in wat je met het
voorstel dóét. Dat is gratis, eerlijk en altijd aanwezig.

EduFlow houdt daarom zes handelingssignalen bij per AI-aanroep, opgeslagen in `AIInteraction` en
`Feedback`.

| Signaal | Wanneer het ontstaat | Wat het zegt |
|---|---|---|
| `overgenomen` | Je tikt op **Overnemen** | Het voorstel was bruikbaar |
| `bewerkt` | Je verandert de tekst vóór de eerste export | Het voorstel was bijna goed |
| `weggegooid` | Je tikt op **Weggooien** | Het voorstel was onbruikbaar |
| `opnieuw` | Je tikt op **Opnieuw**, met het aantal keren | De taak lukte niet in één poging |
| `genegeerd` | Het voorstel staat er nog bij de eerste export | Niet eens het weggooien waard |
| `hersteld` | Je maakt **Overnemen** ongedaan | Het leek goed en was het niet |

Het sterkste signaal is geen van deze zes, maar het verschil tussen wat de AI gaf en wat er
uiteindelijk stond: de **eindtekstafstand**. Die wordt precies één keer bepaald, bij de eerste
geslaagde export (B-13), want dan pas is de tekst af.

De afstand is een woordvergelijking tussen voorstel en eindtekst en levert vier getallen plus twee
woordenlijsten op: aandeel behouden woorden, aantal verwijderde en toegevoegde woorden, aantal
verplaatste zinnen, en de inhoudswoorden die je weghaalde of toevoegde. Die lijsten voeden
mechanisme 3 uit §3.5. Meer wordt er niet bewaard: niet de zinnen, niet de context.

Vier regels houden dit eerlijk.

- **Nul extra handelingen.** Geen duim, geen sterren, geen "was dit nuttig". Alles komt uit
  handelingen die je toch al doet.
- **Eén uitzondering, en die is over te slaan.** Gooi je binnen één documentatie drie voorstellen
  achter elkaar weg, dan staat onder het vierde één regel met twee knoppen: **te ver
  doorgeschoten** en **miste iets**. Niet aanraken kost niets. Dit is de enige plek in het product
  waar EduFlow om een mening vraagt.
- **Meten mag nooit vertragen.** De berekening loopt na de export, nooit in de weg van een
  handeling.
- **Alles is in te zien en te wissen.** Instellingen → Schrijfstijl → **Wat de app geleerd heeft**
  toont de tellingen en de woordenlijsten. Eén knop wist ze; de app begint dan opnieuw met leren.

### 3.7 Falen met stijl

Drie regels gelden bij elke storing: **nooit stil falen**, **nooit werk verliezen**, **altijd een
uitweg met de hand**. De derde is de belangrijkste. Geen enkele taak in EduFlow kan alleen met AI.
Valt de AI weg, dan is er werk bij, geen werk onmogelijk.

| Situatie | Wat de app doet | Wat je ziet |
|---|---|---|
| Time-out: geen eerste teken binnen 20 seconden, of langer dan 60 seconden totaal | Afbreken, deeltekst weggooien, geen herhaling | "Meeschrijven duurt te lang. Je tekst staat er nog precies zo. Probeer het opnieuw of schrijf zelf verder." Knop **Opnieuw** |
| Netwerkfout | Eén herhaling na 2 seconden, zichtbaar gemeld | "Er ging iets mis met de verbinding. EduFlow probeert het nog één keer." Daarna de gewone foutmelding |
| Provider onbereikbaar of serverfout | Geen herhaling, storing melden | "Meeschrijven lukt nu niet. De AI-dienst geeft geen antwoord. Probeer het over een paar minuten opnieuw." |
| Quotum of dagbudget op (T-17) | Blokkeren tot middernacht | "Het AI-budget voor vandaag is op. Schrijven, exporteren en de agenda werken door. Morgen kun je weer meeschrijven." Knop **Verder schrijven** |
| Leeg antwoord | Behandelen als mislukte aanroep | "Er kwam geen tekst terug. Probeer het opnieuw." Knop **Opnieuw** |
| Antwoord haalt een grendel niet | Voorstel niet tonen, reden noemen | "Het voorstel klopte niet met wat je schreef. Reden: er stonden feiten in die niet in je tekst staan." Knop **Opnieuw** |
| Onbekende code in het antwoord | **Overnemen** blokkeren | "Er staat een naamcode in het antwoord die EduFlow niet kent. Overnemen is uitgezet, zodat er geen verkeerde naam in je tekst komt." Knop **Opnieuw** |
| Geen internet (B-47) | AI-knoppen uitzetten, rest laten werken | Strook bovenin: "Er is nu geen internet. Schrijven, foto's en de agenda werken door. Meeschrijven en mail komen terug zodra je verbinding hebt." |
| Toegangscode verlopen | Aanroep tegenhouden, code opnieuw vragen | "Voer je toegangscode opnieuw in om meeschrijven te gebruiken." Je tekst blijft onaangeroerd |

Achter elke melding zit dezelfde toezegging: je tekstveld is tijdens de hele aanroep niet
aangeraakt. Dat is geen belofte maar een bouwwijze, want de AI schrijft in een eigen blok en pas
**Overnemen** verplaatst tekst.

Automatische herhaling gebeurt precies één keer en alleen bij een netwerkfout. Een serverfout, een
weigering en een grendelfout worden nooit herhaald: dat kost tijd en geld aan iets wat opnieuw fout
gaat, zonder dat jij het weet.

### 3.8 Hallucinatie en verzinsels

Een taalmodel dat een detail verzint is in de meeste toepassingen vervelend. Hier is het schadelijk
op een manier die niet met een correctie is op te lossen.

De tekst gaat over echte kinderen en hij gaat naar hun ouders. Staat er in de documentatie over
Kunstwerk Dok dat Hanae met de zaag werkte terwijl ze dat niet deed, dan leest een ouder iets dat
niet is gebeurd. Zij weet dat, jij niet meer, en de documentatie blijft jaren staan. Eén verzonnen
detail maakt bovendien elke andere zin verdacht. En de professional is aanspreekbaar, niet de app:
bij Fatima komt de ouder aan de deur, niet bij de leverancier.

Daarom is de maatregel niet "wees voorzichtig met AI", maar een keten van vier grendels waar een
verzinsel niet doorheen komt.

- **De AI mag alleen herschrijven wat er staat.** `G1` uit §3.3 laat geen inhoudswoord toe dat
  niet in de invoer of de reekscontext stond. Een verzonnen zaag is een nieuw inhoudswoord en valt
  daarop, ongeacht hoe aannemelijk hij klinkt.
- **De vergelijkingsweergave.** De schakelaar **Vergelijk met mijn tekst** toont het voorstel met
  toegevoegde woorden gemarkeerd en weggelaten woorden doorgestreept. Je hoeft niet te zoeken naar
  wat er veranderde. Op de telefoon schuift die weergave onder het voorstel in plaats van ernaast.
- **De verplichte lezing vóór export.** Vóór de eerste export toont het exportpaneel de volledige
  tekst nog één keer, met de delen uit een AI-voorstel gemarkeerd, en één vinkje: **Ik heb dit
  gelezen**. Pas daarna worden **Print-PDF** en **Deelbare afbeelding** actief. Dit is dezelfde
  stap als de bevestiging voor beeldgebruik (B-08): één paneel, één moment. Bij volgende exports
  komt de stap niet terug.
- **Geen naam kan worden verzonnen.** De AI ziet codes, geen namen. Zet hij er een code bij die
  niet bestaat, dan blijft die code zichtbaar staan en blokkeert `AIService` het overnemen
  (§3.2.5). Een verzonnen kind kan de tekst dus niet in.

Wat de AI nooit mag toevoegen, ook niet als het klopt: data, tijden, aantallen, namen van
materialen of methodes, bronvermeldingen en verwijzingen naar leerdoelen. De datum van een
documentatie komt uit het veld of uit de foto's, nooit uit het model.

### 3.9 Kosten en tempo als ontwerpvraagstuk

Snelheid en kosten zijn hier geen bedrijfsvoering maar ontwerp. Een voorstel dat na acht seconden
in één keer verschijnt voelt trager dan een voorstel dat na anderhalve seconde begint te lopen en
na tien seconden klaar is. Daarom streamt EduFlow altijd: het eerste teken staat binnen 2 seconden
op het scherm bij ten minste 90 procent van de aanroepen. Lukt dat niet, dan zegt de wachtweergave
waarop je wacht (zie §4.5).

De modelkeuze hoort bij de taak, niet bij de gebruiker.

| Taak | Model | Waarom |
|---|---|---|
| Spelling en interpunctie | Klein | Mechanisch werk met een eenduidig antwoord |
| Vervolgzin uit de reeks | Klein | Eén zin, strak begrensd, weinig vrijheid |
| Ontvangen bericht samenvatten | Klein | Inkorten is de makkelijkste taalkundige taak |
| Losse observatie tot lopende tekst | Groot | De grendels vragen precisie; hier faalt een klein model |
| Gespreksmodus tot documentatie | Groot | Losse antwoorden tot één geheel, met behoud van elk feit |
| Antwoordconcept op een oudermail | Groot | Toon, register en zorgvuldigheid tegelijk |

De gebruiker kiest niet. Er is geen schakelaar tussen snel en goed, en nergens staat welk model er
draaide, behalve bij terugval. Drie redenen: een keuze die je niet kunt beoordelen is een last
(U-05); de kwaliteit wordt geborgd door de gouden testset en niet door een gok over modelnamen; en
modelnamen veranderen elk kwartaal terwijl de taken hetzelfde blijven.

Terugvallen mag, stilzwijgend terugvallen niet. Is het grote model niet beschikbaar, dan draait de
taak op het kleine model en staat er boven het voorstel één regel: "Dit voorstel komt van het
kleine model, omdat het grote model niet bereikbaar was." De grendels blijven identiek.

Kosten worden per aanroep gemeten en per documentatie opgeteld, zichtbaar in Instellingen →
Privacy. De norm: een volledige documentatie in schrijfmodus, inclusief één keer **Opnieuw**,
blijft onder vijf eurocent. Het dagbudget per toegangscode (T-17) staat op honderd aanroepen:
genoeg voor een zware donderdag, te weinig voor misbruik.

### 3.10 Providerneutraliteit

Er zit nooit één provider ingebakken. `AIService` praat met een adapter, en er zijn er drie:
`OpenAiEuAdapter`, `VertexEuAdapter` en `BedrockEuAdapter`. De opdracht van `PromptService` is
gewone tekst zonder providereigen constructies. Wat verschilt staat in de adapter: adres,
authenticatie, modelnaam en de vertaling van foutcodes naar de categorieën uit §3.7.

Dat is geen technische netheid maar een machtsvraag. Een bestuur dat over twee jaar wil overstappen
moet dat binnen een dag kunnen zonder dat er een regel schermcode verandert. Zolang dat waar is, is
de providerkeuze een besluit van het bestuur en niet van de leverancier.

Voordat een provider **standaard** mag worden, geldt onderstaande lijst. Alle negen punten moeten
groen zijn; er is geen weging en er is geen uitzondering.

| # | Voorwaarde | Hoe het is aangetoond |
|---|---|---|
| 1 | Verwerking binnen de EU | Contractueel vastgelegde regio, geen doorgifte buiten de EU (T-06) |
| 2 | Geen training op invoer | Schriftelijk, standaard, niet op aanvraag |
| 3 | Aantoonbaar bewaarbeleid | Nul bewaring, of hoogstens dertig dagen met een reden |
| 4 | Verwerkersovereenkomst via het bestuur | Getekend, niet in behandeling |
| 5 | Score op de gouden testset | Gelijk aan of hoger dan de huidige standaardprovider |
| 6 | Streaming ondersteund | Eerste teken binnen 2 seconden bij 90 procent van de aanroepen |
| 7 | Kosten per duizend documentaties | Gemeten, niet geschat |
| 8 | Uitvalpercentage over dertig dagen | Onder 1 procent |
| 9 | Vervangbaar binnen één dag | Aangetoond door de overstap in een testomgeving te doen |

Voldoet een provider aan zeven van de negen, dan mag hij als keuze in Instellingen staan maar niet
als standaard. Voldoet hij niet aan punt 1 of punt 4, dan staat hij er helemaal niet in.

### 3.11 De grens die niet verschuift

Op één plek is er geen afweging, geen instelling en geen uitzondering.

- **Geen foto's naar de AI.** Niet het origineel, niet de verkleinde versie, geen uitsnede, geen
  afgeleide beschrijving, niet de bestandsnaam. Ook niet als een provider belooft er niets mee te
  doen. In Gespreksmodus blijft de foto op het apparaat; alleen jouw antwoord gaat weg (B-03).
- **Geen beeldherkenning door EduFlow.** Ook niet lokaal, ook niet om behulpzame dingen te doen
  zoals gezichten groeperen. Een model dat kinderen op hun gezicht onderscheidt hoort niet in een
  onderwijsproduct, ongeacht waar het draait.
- **Geen stemherkenning door EduFlow.** Dicteren doet de microfoonknop van je eigen toetsenbord.
  EduFlow neemt geen geluid op en verstuurt geen geluid. De verplichting die daaruit volgt: de
  tekstvelden blijven saai, zonder slimme invoer die dictaat onderbreekt en zonder automatische
  opmaak tijdens het typen.
- **Geen emotieherkenning, in welke vorm dan ook.** Niet uit beeld, niet uit geluid, niet uit
  tekst. "Hoe voelde deze middag" is geen functie en wordt er geen.

Bij het toevoegen van een foto worden de locatiegegevens uit de bestandsgegevens verwijderd; de
opnamedatum blijft, want daar komt de datum van de documentatie uit.

Deze grens verschuift niet in versie 1.1 en niet in fase 2. Komt hij ooit ter discussie, dan is dat
een nieuw product met een nieuwe beoordeling, geen instelling in dit product.
