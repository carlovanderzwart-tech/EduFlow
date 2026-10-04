# Besluiten sinds de Product Bible

> ## Laatst uitgegeven nummers: **B-146** · **T-46** · **INV-54** · **FR-AGE-35** · **FR-DOC-128** · **FR-INS-47**
>
> **Lees deze regel vóór je een nummer uitgeeft, en werk hem bij zodra je er een uitgeeft.**
> Dit is de enige plek waar nieuwe nummers vandaan komen. Hoofdstuk 19 is gesloten (B-114).

Hoofdstuk 19 van het handboek bevat alle besluiten tot en met 7 augustus 2026 en is
daarmee historisch: er komt niets meer bij. Dit bestand is het vervolg — elke keuze die
daarna de documenten verandert, met datum en reden. Nieuwste bovenaan, nummering loopt
door op hoofdstuk 19.

---

# 5 oktober 2026 — de basisweek

## B-146 — De basisweek is gebouwd, en de twee tabellen zijn weg

**Correctie vooraf.** Bij het opleveren van B-145 is gemeld dat blok 1 af was. Dat
klopte niet. `FR-AGE-29` t/m `FR-AGE-31` — de basisweek — stonden niet gebouwd.

Hoe dat kon: **B-115 gaf ze aan werkopdracht D09b, en de eisentabel van D09b is nooit
bijgewerkt.** Het besluit is van 13 augustus, de opdracht is ouder, en niemand heeft
de twee naast elkaar gelegd. De eisen staan ook niet in §6.2 — ze bestaan alleen in
B-115 zelf. Daardoor kwamen ze in geen enkele controle voor: niet in de opdracht, niet
in het hoofdstuk, niet in een toets.

Dit is het soort gat dat een register hoort te vangen en hier niet ving. De
tegenmaatregel staat onderaan dit besluit.

### Wat er is gebouwd

Je vult bij **Instellingen → Basisweek** je vaste week in — gym, muziek, de
bouwvergadering — met dag, begintijd, eindtijd en naam. De app maakt er een wekelijks
herhalend agenda-item van dat loopt tot de laatste schooldag.

- `FR-AGE-29`: één onderdeel wordt één wekelijkse reeks, met `until` op de laatste
  schooldag. `until` en niet `count`, want een schooljaar heeft een einddatum en geen
  aantal weken, en B-123 staat er precies één van de twee toe.
- `FR-AGE-30`: het resultaat is een gewoon agenda-item. Verplaatsen, wijzigen met
  "alleen deze of alle volgende", ICS-export — alles werkt omdat er niets bijzonders
  aan is.
- `FR-AGE-31`: het detailvenster zegt *"Uit je basisweek"*.

### Geen tweede gegevensmodel, ook niet een kleintje

B-115 zegt: *"De basisweek is een invoerscherm, geen tweede gegevensmodel."* Dat is
hier letterlijk genomen. **Er wordt niets opgeslagen wat de agenda niet al weet.** Wat
het scherm toont is een vraag aan de agenda: de wekelijkse items met herkomst
`derived`. Daarmee bestáát er geen tweede waarheid die uit de eerste kan lopen.

De verleiding was een voorkeur in `settings` met de ingevulde week erin. Dat zou
hetzelfde probleem terugbrengen in een kleinere verpakking: twee plekken die hetzelfde
beweren, en één ervan heeft ongelijk zodra je in de agenda iets verschuift.

### Herkomst, geen eigenaar — en wat dat in de praktijk betekent

`source: "derived"` zegt waar een item vandaan komt en verder niets. Het veld stond al
in §8.3.8 en werd nergens gebruikt; dit is de eerste schrijver.

Twee gevolgen die het de moeite waard maken dit op te schrijven:

**Een losgemaakte keer blijft staan.** Verplaats je één gymles met "alleen deze" en
haal je daarna het hele onderdeel uit je basisweek, dan blijft die ene verzette les in
je agenda. Dat is wat `FR-AGE-31` met *"raakt de reeds gewijzigde items niet"* bedoelt,
en er is een toets die precies dat doet.

**"Alle volgende" geeft het item aan jou terug.** De agenda maakt dan een nieuwe reeks
met `source: "own"`, en die staat niet meer in het basisweekscherm. Dat is geen
verlies: vanaf het moment dat je hem zelf hebt bijgesteld is hij van jou.

### De fout die de toets eerst niet ving

`uitBasisweek` keek eerst óók naar de herhaling: `source === "derived" && recurrence`.
In de opslag klopt dat, en de toetsen waren groen.

In de agenda niet. `RecurrenceService` haalt `recurrence` bewust van een verschijning
af — *"dit ís een verschijning"* — dus alleen de állereerste gymles van het jaar zei
waar hij vandaan kwam, en de veertig daarna niet. **Dat kwam niet uit een toets maar
uit het scherm zelf**, bij het nalopen in de browser.

De controle is gesplitst: `uitBasisweek` kijkt alleen naar de herkomst, en
`isBasisweekreeks` kijkt daarnaast naar de herhaling voor het scherm dat de reeksen
beheert. Er is een toets bij die op een verschijning verderop in het jaar kijkt en niet
alleen op de eerste.

### De twee tabellen zijn weg — `DB_VERSIE` gaat naar 2

B-131 vond `weekPatterns` en `weekPatternOverrides` nog in de database staan, met hun
typen, schema's en toetsgegevens, en zonder dat één service of scherm ze aanraakte. Het
besluit was toen: ze gaan eruit, maar in een eigen wijziging met een eigen controle.

Dit is die wijziging, en dit is het juiste moment: de tabellen zijn het oude model van
precies datgene wat hierboven is gebouwd.

**Uit de lijst halen is niet genoeg.** Een tabel die uit `TABELLEN` verdwijnt blijft in
een bestaande browser gewoon staan; Dexie ruimt hem pas op als je hem bij een hogere
versie op `null` zet. Dat staat daarom uitgeschreven in `db.ts`, met de twee namen in
een eigen constante — zodat de volgende die zoiets doet ziet hoe het hoort.

**Het risico is nagelopen en niet aangenomen.** In de database van de opdrachtgever
stonden nul records in beide tabellen, gemeten en niet geschat. De andere tweeëntwintig
tabellen blijven ongemoeid.

§8.3 somt zesentwintig tabellen op; het zijn er nu vierentwintig. Twee toetsen die dat
aantal vastpinden zijn bijgewerkt, en er is een derde bij: dat de twee namen ná het
openen van de database ook werkelijk weg zijn.

### Eén vondst onderweg: de vervolgstap van een foutmelding was te licht

Poort 7 (axe-core) viel over het nieuwe scherm. Het bleek niet aan het scherm te liggen
maar aan `ErrorMessage`: de regel met de vervolgstap stond in `text-muted-foreground`
op het getinte vlak van `bg-destructive/5`, en haalde de 4,5:1 van §5.3 niet.

Die fout stond er al, en kwam pas nu boven water omdat dit het eerste scherm in de
toegankelijkheidsronde is dat bij een schone database een foutmelding tóónt — de andere
laten er alleen een zien als er iets misgaat, en in een schone proefrit gaat er niets
mis.

De vervolgstap is nu `text-foreground`. Dat is geen kleurkeuze maar een inhoudelijke:
het is de helft van de melding die zegt wat je moet dóén, en die hoort niet de
lichtste tekst op het scherm te zijn. De rangorde komt van `font-medium` op de regel
erboven.

### Tegenmaatregel tegen hoe dit gat ontstond

`FR-AGE-29` t/m `FR-AGE-31` bestonden alleen in B-115 en in geen enkele eisentabel.
Elke eis die in een besluit wordt geboren, hoort dezelfde dag in het hoofdstuk te
komen waar hij thuishoort — hier §6.2 — of in de eisentabel van de werkopdracht die
hem bouwt.

**Dat is hier niet gedaan**, want buiten `BESLUITEN.md` wordt er niet in `docs/`
geschreven zonder toestemming per geval. Het staat daarom hier, bij de andere twee
dingen die op diezelfde toestemming wachten: de hoofdstukken die van B-145 de
aantekening *vervallen* horen te krijgen, en deze drie eisen die juist in §6.2 horen te
stáán.

### Nog niet gedaan

**Wijzigen kan alleen in de agenda.** Het basisweekscherm voegt toe en haalt weg; een
typefout in "Gym" verbeter je door het item in de agenda aan te klikken. Dat is een
bewuste keuze — een wijzigknop hier zou het scherm een eigenaar maken, en dat is
precies wat B-115 verbiedt — maar het is wel een extra klik, en het is het soort ding
waarvan pas bij het gebruik blijkt of het stoort.

**Vakanties zitten er gewoon in.** Een wekelijkse reeks loopt door de herfstvakantie
heen; er staat dan een gymles in een week waarin je vrij bent. §6.2.5 kent daar geen
regel voor en B-115 noemt het niet, dus er is niets gebouwd (DR-01). Wie het stoort kan
die ene keer verwijderen met "alleen deze". Dit is een kandidaat voor een besluit, geen
vergeten werk.

---

# 4 oktober 2026 — geen AI

## B-145 — Blok 2 wordt niet gebouwd

**Besluit van de opdrachtgever**, niet van de bouw: *"het AI-deel gaan we NIET meer
maken, dit betekent dat we blok 2 helemaal niet gaan uitvoeren."* Dat raakt `D04`
(`/api/ai`, `AIService`, `PromptService`), `D06` (laat AI meeschrijven en het
controlescherm) en `D10` (mail), plus het kwartier dashboardwerk dat op `D10` wachtte.

Dit besluit legt niet vast waaróm — dat is niet aan de bouw. Het legt vast wat het
kost en wat er daarom is weggehaald.

### Wat de app de gebruiker vertelde en niet waar kon maken

Dit was het dringendste, want het stond op het scherm. Zeven plekken beloofden AI:

| Waar | Stond er | Staat er nu |
|---|---|---|
| Instellingen → Leerlingen | "om ze af te schermen voordat er tekst naar AI gaat" | wat de namen echt doen: koppelen, filteren, en de initiaal bij export |
| Instellingen → Reeksen | "De beschrijving helpt de AI bij een vervolgdeel" | wat een reeks echt doet: bundelen en filteren |
| Leerlingen, lege staat | idem als boven | idem |
| Nieuwe reeks (2×) | "Deze zin helpt de AI bij een vervolgdeel" | "Deze zin is voor jezelf" — want de beschrijving wordt niet eens doorzocht |
| Schrijfscherm, notitie | "gaat nooit mee naar de AI" | "wordt niet doorzocht (FR-DOC-22)" — dezelfde belofte, en deze is getoetst |
| Instellingen | schakelaar "Laat zien wat er naar AI gaat" | weg |

De laatste twee zijn de leerzaamste. De notitie voor jezelf had **twee** beloftes en
de app noemde alleen de AI-belofte — terwijl de andere, dat zoeken hem overslaat, de
enige van de twee is die een toets heeft (`FR-DOC-22`). En de schakelaar liet iets
zien wat nooit zou vertrekken.

### Mail uit de navigatie

`/mail` toonde een lege staat met *"wordt in een volgende sprint gebouwd"*. Die
sprint komt niet. De herschreven §6.3 is volledig AI; zonder AI blijft er geen module
over — dat stond al zo in de opdrachtenlijst, als reden om mail naar blok 2 te
verplaatsen.

Vier tabbladen in plaats van vijf. Een tabblad dat een ingetrokken belofte doet is
erger dan geen tabblad, en je ziet het elke dag.

### Wat er weg is: ongeveer 1.600 regels

| Wat | Regels |
|---|---|
| `src/services/ai/` — `AIService`, `PromptService`, de provider-adapter | 670 |
| dezelfde map: 594 regels toetsen | 594 |
| `src/app/api/ai/route.ts` | 132 |
| `src/domain/schemas/aiRequest.ts` — de vorm van een uitgaande aanroep | 87 |
| `MailPage.tsx` en `app/mail/page.tsx` | 24 |

**Die 594 regels toetsen zijn de reden om dit nú te doen en niet te laten staan.**
Ze zouden eeuwig groen blijven terwijl ze iets toetsen wat niemand ooit draait. Een
toets die niets kan betrappen is geen toets maar ruis in het signaal, en bij elke
volgende wijziging zou iemand zich afvragen of hij hem stuk heeft gemaakt.

### Wat er blijft, en waarom dat geen inconsequentie is

**`PrivacyService` blijft** (315 regels, 477 regels toetsen), en daarmee poort 9.
Na het weghalen van `AIService` heeft hij geen enkele aanroeper meer — precies het
argument dat hierboven de AI-code weghaalt. Het verschil is echt: `AIService` roept
een HTTP-route aan die er niet meer is, en dat is een val waar iemand over een jaar
in trapt. `PrivacyService` is een zuivere functiebibliotheek met een volledige
toetsset die een eigenschap bewijst; die kost niets zolang niemand hem aanroept, hij
is wat hoofdstuk 15 als bewijs gebruikt, en hij maakt een eventuele ommezwaai een
week werk in plaats van een maand.

**Het hele domein blijft.** `src/domain/` spiegelt het handboek, en het handboek
beschrijft de AI nog steeds. De schema's van `aiInteractions`, `styleExamples`,
`mailDrafts` en de rest dragen bovendien tabellen die bestaan; die weghalen kost een
database-migratie en levert niets op. `src/domain/events/` is de catalogus van de
negenendertig gebeurtenissen uit §9.6 en heeft geen enkele gebruiker — half
leeghalen zou hem laten afwijken van het hoofdstuk dat hij beschrijft.

`aiProvider`, `showOutgoingRequest` en `disabledDetectors` blijven om dezelfde reden
in de opslag staan. `showOutgoingRequest` is wel uit het instellingenformulier
gehaald: dat blok zegt in zijn eigen toelichting dat elk veld dat een scherm heeft er
staat, en dit veld heeft er geen meer.

### De toegangspoort hoort niet bij de AI

`/api/toegang` (T-05, `FR-INS-37`, §8.2.3) leunde op `limiet.ts` en `toegang.ts` uit
de AI-map, omdat beide uit `D04` kwamen. Ze zijn verhuisd naar `src/app/api/toegang/`
(de tweede als `ticket.ts`).

De snelheidslimiet van T-17 had altijd twee redenen. §12.6 noemt de eerste: een open
`/api/ai` is een gratis AI-dienst op rekening van de maker. De tweede stond er niet
en was altijd de zwaarste: **zonder slot is een toegangscode te raden door hem vaak
genoeg te proberen.** Die reden blijft staan, en daarmee de teller.

### Twee poorten vervallen, zeven blijven er negen

Poort 10 (gouden testset zonder netwerk) bewaakte of de samengestelde opdracht de
vijf dingen uit §12.9 droeg. Er wordt geen opdracht meer samengesteld.

Poort 11 (gouden testset met netwerk) stond op `wacht` met een `voorwaarde()` die hem
zou laten falen zodra er een provider kwam. Die komt niet.

**Ze zijn niet verwijderd maar op `vervallen` gezet**, met hun nummer en hun reden.
Dat is dezelfde afspraak die §6.0 voor een vervallen eis maakt: het nummer blijft
leegstaan met de aantekening, en wordt nooit hergebruikt. De bouwstraat heeft daarmee
een derde stand gekregen naast `actief` en `wacht`, en meldt negen actief en twee
vervallen.

De wekelijkse ronde in CI houdt alleen poort 6 over.

### Wat hiermee ook vervalt

- **`O-01` — de stijlvoorbeelden.** Dat was de enige openstaande post die alleen de
  opdrachtgever kon invullen. Hij was nodig om te kunnen meten of de AI goed
  schreef; er valt niets meer te meten.
- **Het verbruiksoverzicht** (`FR-INS-24`, §12.12) telde tekens per maand tegen een
  budget. Er is geen verbruik.

### De gunstige kant

Zonder AI én zonder mail **verlaat er geen enkel persoonsgegeven het apparaat.** Geen
verwerker, geen subverwerker, geen verwerkersovereenkomst met het bestuur. Hoofdstuk
15 kent drie uitgaande stromen en alle drie waren ze AI of mail.

Daarmee wordt `O-03` — het gesprek met de functionaris gegevensbescherming, dat
volgens B-104 de zwaarste niet-technische blokkade was vóór het eerste echte kind —
een heel ander en veel korter gesprek. Er is geen gegevensstroom om te bespreken.

### Nog niet gedaan: het handboek

§12 volledig, §6.3 volledig, §6.1.8 t/m §6.1.10 en §15.4 beschrijven nu iets wat niet
gebouwd wordt — samen ongeveer 65 van de 233 `FR`-nummers. Die horen de aantekening
*vervallen per B-145* te krijgen, bovenaan het hoofdstuk en niet door ze weg te
gooien, zoals §6.0 dat voorschrijft.

**Dat is hier bewust niet gedaan.** Buiten `BESLUITEN.md` wordt er niet in `docs/`
geschreven zonder toestemming per geval, en die is voor deze hoofdstukken niet
gegeven. Tot die tijd staat de tegenstrijdigheid hier opgetekend in plaats van dat ze
stilzwijgend blijft bestaan.

Twee kleine gevolgen daarvan: `docs/20-ontwikkelregels.md` noemt `pnpm test:golden`
in de lijst met commando's, en die poort is vervallen. Het commando blijft daarom
bestaan en meldt nu waaróm hij vervallen is — dat is beter dan een ontbrekend script
onder een regel die zegt dat je het moet draaien. En de twee spookverwijzingen naar
§6.3.10 in `docs/07` en `docs/12` lossen zichzelf op zodra die hoofdstukken de
aantekening krijgen.

---

# 4 oktober 2026 — de back-up

## B-143 — Je werk kan het apparaat uit

**Probleem.** Alles staat in IndexedDB van één browser op één apparaat. Er was geen
enkele manier om het eruit te krijgen. Het dashboard toonde wél een blok "Back-up
maken" (`FR-DAS-03`, B-02) met een knop die naar Instellingen stuurde, en daar stond
niets — `SettingsPage` zei het zelf in zijn kop: *"de back-up en wissen staan in §6.5
en komen later."*

**Hoe stil dat gat was.** Tijdens deze doorloop is de opslag twee keer spontaan leeg
geweest tussen twee sessies door. Beide keren opnieuw ingericht en doorgewerkt, want
het waren verzonnen namen. Met een schooljaar echt werk erin was dat het einde
geweest.

§6.5.9 beschrijft het al sinds het handboek, met vijf eisen, en §8.7 geeft het
bestandsformaat tot op het aantal PBKDF2-rondes. Dit besluit lost dat in; er is
weinig nieuws bedacht.

### Wat er gebouwd is

- **Back-up maken** (`FR-INS-28`): één zip met `manifest.json`, `data/<tabel>.json`
  per tabel en `blobs/<hash>.<variant>.jpg` voor het beeld.
- **Versleutelen** (`FR-INS-29`): PBKDF2-SHA256 met 600.000 rondes en AES-GCM per
  bestand, precies de getallen uit §8.7. Zonder wachtwoord mag ook; dan staat
  `onversleuteld` in de bestandsnaam.
- **Terugzetten** (`FR-INS-30`): eerst tonen wat erin zit, dan pas kiezen tussen
  samenvoegen en alles vervangen, met een tweede bevestiging waarin het huidige
  aantal documentaties staat.
- **Samenvoegen** (`FR-INS-31`): per record wint de hoogste `updatedAt`.
- **De herinnering** (`FR-INS-32`): `lastBackupAt` werd alleen gelézen en nooit
  geschreven. Nu wel, dus het dashboardblok klopt.

### Geen pakket voor de zip, en waarom dat hier verdedigbaar is

§16 vraagt bij elke afhankelijkheid een reden die niet "handig" is. Een **opgeslagen**
zip is een kop per bestand, de bytes, en een inhoudsopgave achteraan — te overzien in
één bestand, en de enige rekenkunde is CRC-32.

Niet ingepakt, want het leeuwendeel van een back-up is JPEG; die nog eens door
deflate halen levert procenten op en kost seconden per foto. Twee methodes in één
schrijver is twee keer zoveel dat stuk kan.

**En het is nagelopen met iets anders dan de eigen lezer.** Een zip die alleen de
eigen code begrijpt is geen zip. De schrijver heeft een bestand gemaakt dat Windows
met `Expand-Archive` uitpakt, met de mappen `data/` en `blobs/` erin en de inhoud
ongeschonden.

**De grens van 4 GB wordt geweigerd en niet overschreden.** §8.7 rekent bij 212
documentaties op circa 4 GB, en daarboven is zip64 nodig — een tweede formaat met
eigen velden. Een zip die over de rand gaat is geen foutmelding maar een bestand dat
niemand meer open krijgt, en dat merk je pas als je het nodig hebt. Er komt dus een
melding met wat je kunt doen.

### Het manifest blijft leesbaar, ook bij een versleutelde back-up

`FR-INS-30` eist dat de app vóór het terugzetten toont wat erin zit. Dat kan alleen
als het manifest buiten de versleuteling blijft. Dat is geen lek: een aantal en een
apparaatnaam zeggen niets over een kind; de namen, de teksten en de foto's zitten in
de versleutelde bestanden ernaast. Zou het manifest ook dicht zijn, dan moest je je
wachtwoord intypen voordat de app je kon vertellen wélk bestand je in handen hebt —
en dat is precies de situatie waarin mensen hun laatste goede back-up overschrijven.

### De verwijderde records gaan mee

Ze staan dertig dagen in de prullenbak (§8.8, B-138). Wie zijn apparaat kwijtraakt op
dag negenentwintig hoort ze terug te kunnen halen.

### Eén nieuwe schrijfweg in de opslaglaag

`storage.zetTerug(tabel, record)` schrijft een record precies zoals het was, zonder de
zes basisvelden in te vullen of bij te werken. Dat is de enige plek waar dat mag, en
het is nodig: zou `updatedAt` bij het terugzetten op "nu" komen te staan, dan is de
botsingsregel van `FR-INS-31` niet uit te voeren en lijkt elk teruggezet record het
nieuwste. Het schema controleert nog steeds (DR-23).

### Wat lint vond en ik zelf niet

Het terugzetscherm had **geen eigen wachtwoordveld**. De uitleg wees naar "hierboven",
maar dat veld hoort bij het *maken* van een back-up. Een versleutelde back-up was dus
onmogelijk terug te zetten. Lint zag het aan een ongebruikte `setWachtwoord`; zonder
die waarschuwing was het pas opgevallen bij iemand die zijn gegevens kwijt was.

### Nog niet gedaan

§8.7 geeft zeven tabelspecifieke botsingsregels. Gebouwd is de algemene — hoogste
`updatedAt` wint — plus het uitzonderen van `settings` bij samenvoegen. **Niet**
gebouwd: de kopie met de aantekening *"uit back-up van 3 juli"*, het samenvoegen van
lidmaatschappen op de langste periode, en de melding bij een gelijke naam met een
ander id. Die drie komen pas in beeld bij twee apparaten, en tot die tijd zou het
gedrag zijn zonder dat iemand het kan narekenen.



## B-144 — Archiveren is geen derde status

**Probleem.** `FR-DOC-120` staat sinds het handboek in §6.1.13 en was niet gebouwd.
Het was het laatste gat in dat hoofdstuk: `FR-DOC-121` t/m `FR-DOC-123` — de
prullenbak — kwamen bij B-135, archiveren bleef liggen.

Het verschil met verwijderen is niet technisch maar menselijk. **Verwijderen zegt:
dit had er niet moeten staan.** Dat gaat naar de prullenbak en is na dertig dagen
weg. **Archiveren zegt: dit is af.** Het project is klaar, de reeks is afgerond, en
het hoeft niet meer tussen je lopende werk te staan — maar het blijft bestaan en het
blijft vindbaar. Zonder die tweede knop is de enige manier om je overzicht
overzichtelijk te houden het weggooien van werk dat je wilt houden.

### Het veld stond er al

`archivedAt` staat in §8.3.5, in `Documentation` en in het schema, en werd nergens
gezet of gelezen. Dit besluit lost dat in; er is geen veld bij gekomen.

### Geen status erbij, en dat is de kern

De verleiding is `status: "gearchiveerd"`. Dat kan niet: **B-13 zegt dat de statussen
concept en gedeeld heten**, en meer zijn het er niet. Een gearchiveerde documentatie
is nog steeds een concept of nog steeds gedeeld — hij is alleen uit beeld. Zou
archiveren een status zijn, dan verliest de app bij het archiveren van een gedeelde
documentatie de informatie dát hij gedeeld is, en dan klopt `FR-DOC-118` niet meer.

Daarom draagt `archivedAt` het, net zoals `deletedAt` het verwijderen draagt
(§8.1.6). Twee velden die los van elkaar staan, en één `status` die blijft zeggen wat
hij zei.

### Waar het verschil zit: bladeren tegenover zoeken

`FR-DOC-120` maakt dat onderscheid zelf, in één zin: *"wanneer je het overzicht
bekijkt, dan staat hij er niet bij tenzij je het filter aanzet"*, en meteen daarna
*"wel in zoeken, met een aanduiding"*.

Dat is geen slordigheid maar precies goed. **Bladeren is zien waar je mee bezig bent**
— daar hoort afgesloten werk niet tussen. **Zoeken is iets terugvinden** — en dan is
"ik heb het vorig jaar gearchiveerd" de slechtst denkbare reden om het niet te tonen.
In beide gevallen draagt de treffer zijn aanduiding, zodat je niet hoeft te raden
waarom iets niet in je overzicht stond.

De regel staat in `SearchService` en niet in het scherm: of iets getoond wordt is een
regel, en regels staan in services (DR-15).

### Het dashboard telt het niet mee, de aandacht wél

`FR-DOC-120` zegt dat gearchiveerd werk niet meetelt in het dashboard. Dat geldt voor
het blok **Verder werken aan**: dat gaat over waar je gebleven was.

Het geldt **niet** voor het blok **Aandacht**. Dat blok rekent uit hoeveel schooldagen
geleden een kind voor het laatst in je documentatie voorkwam, en dat is gebeurd — of
je het werk daarna hebt afgesloten verandert daar niets aan. Zou archiveren daar
meetellen, dan zou het afsluiten van één afgerond project ineens vijf kinderen als
verwaarloosd aanwijzen, en dat is het tegenovergestelde van wat §6.4.4 bedoelt.

### Geen bevestiging

Archiveren gooit niets weg en de knop ernaast draait het in één klik terug.
Verwijderen vraagt die bevestiging wél, want dat heeft een termijn.

### De keuze van het scherm

`DocumentEditor` ging over de vierhonderd regels (DR-53). De balk erboven is er
daarom uit gehaald als `Werkbalk`: het schrijfscherm gaat over de inhoud, die balk
over wat er met het geheel gebeurt.

In hetzelfde spoor is het blok Verder werken aan uit `useDashboard` getrokken als de
zuivere functie `verderWerkenAan`. Niet om de regels, maar omdat de regel anders niet
te toetsen was zonder het hele dashboard te laten tekenen.

### Nog niet gedaan

**Groepen en reeksen kun je niet archiveren.** Het handboek vraagt dat ook niet — er
is geen `FR-` voor, en `archivedAt` staat alleen op `Documentation`. Een afgelopen
groep hoort bij het schooljaar en niet bij het archief; dat is een ander gesprek
(DR-01).

**De prullenbak laat niet zien dat iets gearchiveerd wás.** Zet je een verwijderde
documentatie terug, dan komt hij terug zoals hij was, archief en al. Dat klopt, maar
het overzicht zegt het niet; wie hem daarna niet ziet staan moet het filter aanzetten.

---

# 2 oktober 2026 — derde feedbackronde

Drie punten: de leeftijd achter de naam, kiezen waar de tekst komt, en de andere
layouts kunnen gebruiken.

## B-139 — De leeftijd achter de naam, als jaar en maanden

**Probleem.** *"Leeftijd van de kinderen achter de naam in de documentatie genoteerd
als jaar en datum. Dus iemand geboren op 2-9-2020 zou genoteerd moeten worden als 6,1
(jaar, aantal maanden)."*

**En het kon nog nergens vandaan komen.** `Student` heeft sinds het begin
`birthDay`, `birthMonth` en `birthYear`, maar het leerlingscherm had geen veld om ze
in te vullen — het stond er zelfs bij: *"Wat er nog niet is: geboortedatum, notitie,
samenvoegen."* Er is dus eerst een geboortedatum te geven voordat er een leeftijd te
tonen valt.

**Besluit.** Drie dingen:

1. **Een geboortedatum op het leerlingscherm**, als drie losse velden. Geen
   `<input type="date">`, want die eist een heel jaar en `FR-AGE-24` laat juist toe
   dat het jaar ontbreekt: *"dan wordt dat opgeslagen zonder jaar en verschijnt de
   verjaardag zonder leeftijd. Dat is dataminimalisatie in de praktijk."* De leeftijd
   staat er meteen naast, want dát is waarvoor je het jaar invult.
2. **`jaren,maanden`**, met een komma. In het Nederlands is de punt een duizendtal en
   leest `6.1` als zes komma één jaar — iets anders dan zes jaar en één maand.
3. **Achter de naam, op drie plekken**: de kop van het leerlingscherm, de
   leerlingenlijst in het schrijfscherm, en de voettekst van de export.

**De maand telt pas als de dag voorbij is.** Wie op 2 september jarig is, is op
1 oktober nog geen maand ouder en op 2 oktober wel. Zonder die regel springt de
leeftijd op de eerste van de maand, en dat klopt voor niemand.

**Geen leeftijd bij een datum in de toekomst.** Dat is geen randgeval maar een
typefout in het jaartal, en die hoort als "geen leeftijd" te verschijnen en niet als
een negatief getal.

### De peildatum is de datum van de documentatie

Niet vandaag. Je legt vast hoe oud het kind **wás** toen dit gebeurde, en die
leeftijd hoort niet te veranderen omdat je de documentatie in maart nog eens
exporteert. In het schrijfscherm en op het leerlingscherm staat wél de leeftijd van
vandaag: daar kies je wie erbij hoort, en dan is de leeftijd van nu het antwoord op
"wie is dit".

### De initialenschakelaar werkt er overheen

`FR-DOC-114` vervangt namen door initialen. Die vervanging gaat over deze namen
net zo goed: `Kjeld 6,1` wordt `K. 6,1`. De leeftijd blijft staan, want hij is niet
herleidbaar tot één kind en hij is juist wat de documentatie leesbaar maakt.

### Nieuwe eis

**FR-DOC-127 — De leeftijd staat achter de naam.** *Gegeven* een leerling met een
volledige geboortedatum, *wanneer* hij aan een documentatie hangt, *dan* staat zijn
naam met de leeftijd erachter in de voettekst van de export, als `jaren,maanden` op
de datum van de documentatie. Zonder geboortejaar staat er alleen de naam
(`FR-AGE-24`). Volgt uit B-139.

## B-140 — De vier layouts uit §5.10 bestaan nu echt

**Probleem.** *"Ook wil ik de andere layouts kunnen gebruiken."* Het exportpaneel
toonde ze alle vijf, vier ervan uit, met eronder: *"In deze versie is alleen
Fotoraster gevuld."*

**En de tabellen stonden er al.** §5.10.3 tot en met §5.10.6 geven voor B, C, D en E
de slotmaten tot op de halve millimeter. D08 heeft ze niet gebouwd en dat ook zo
opgeschreven. Dit besluit lost dat in; er is niets nieuws bedacht.

**Besluit.** Alle vier de slottabellen zijn overgenomen zoals ze er staan. Wat
daarvoor aan de planner moest veranderen:

- **Meer dan één tekstvak.** B en E hebben twee kolommen; de tekst loopt van de ene
  naar de andere. De oude planner pakte met `.find` alleen de eerste.
- **Geen tekstvak.** D heeft er geen, en dat liet de oude planner struikelen.
- **De vervolgpagina.** §5.10.7 regel 4 vraagt er een in `E-vervolg`; die bestond
  niet, dus B-122 hield de tekst noodgedwongen op pagina 1. Dat is nu niet meer nodig.
- **De herhaalde titel is 14 pt.** §5.10.6 zegt het met zoveel woorden. Met de 24 pt
  van de eerste pagina past hij niet in de 14 mm van `E0`, en dan komt de
  vervolgpagina zonder kop uit de machine — precies het losse blad dat B-07 wil
  voorkomen. Gevonden doordat de toets erop viel.

`E-vervolg` staat niet in de kiezer. Dat is §5.10.6: *"Hij bestaat niet in de
miniaturenkiezer."* Je kiest hem niet; hij komt eraan omdat je tekst niet paste.

## B-141 — Waar de tekst komt te staan

**Probleem.** *"Ook wil ik kunnen kiezen waar de tekst komt in de layout van de
documentatie."*

**Besluit.** In layout A zijn de zes vakken van het raster onderling verwisselbaar:
de tekst staat standaard rechtsonder (§5.10.2) en kan naar elk ander vak. Het vak dat
je kiest wordt het tekstvak; waar de tekst stond komt een foto. Zo blijft het raster
vol en veranderen de maten uit §5.10.2 niet.

**Alleen waar de keuze iets betekent.** In B liggen de twee kolommen vast, in C is er
één tekstvak en in D geen. Daar verschijnt de keuze niet, want een keuzelijst met één
optie is geen keuze.

**In gewone taal.** De lijst zegt "Linksboven" en niet "A1". `A1` is de naam van een
slot in een tabel in hoofdstuk 5; een leerkracht leest "linksboven".

### Nieuwe eis

**FR-DOC-128 — De tekst staat waar je hem zet.** *Gegeven* layout A, *wanneer* je in
het exportpaneel een ander vak kiest, *dan* staat de tekst daar en wordt het vak waar
hij stond een fotovak. De standaard is het vak uit §5.10.2. Volgt uit B-141.

## B-142 — De tekst van layout D gaat naar `E-vervolg`, niet naar `B-verhaal`

**De tegenspraak.** B-28 zegt over layout D: *"dan verdwijnt die tekst niet. Het
exportpaneel meldt: «Layout D toont geen lopende tekst. Je tekst komt op een tweede
pagina.» en voegt automatisch een pagina in layout `B-verhaal` toe met de titel
herhaald."* §5.10.7 regel 4 zegt over overloop iets anders: *"Blijft er tekst over,
dan komt er een vervolgpagina in `E-vervolg`."*

**Besluit: `E-vervolg`.** Drie redenen. `E` ís de vervolglayout — §5.10.6 noemt hem zo
en geeft hem twee tekstkolommen en niets anders. Hij herhaalt de titel met
"(vervolg)", en dat is precies de reden die B-28 zelf geeft. En `B-verhaal` heeft twee
fotovakken die op een pagina met alleen tekst leeg zouden blijven staan.

Wat van B-28 overeind blijft, blijft overeind: de melding staat er woordelijk, en de
schakelaar **"Laat de tekst weg"** is er, want B-28 noemt die uitdrukkelijk *"een
bewuste handeling met een zichtbaar gevolg, geen stille weglating"*.

> **Dit raakt B-122 niet.** Die hield de tekst op pagina 1 omdat `E-vervolg` niet
> bestond. Nu hij er is, doet §5.10.7 regel 4 zijn werk en is de uitwijk van B-122
> niet meer nodig.

### Vijf functies opgesplitst

Deze ronde maakte er vijf die over de zestig regels van DR-53 gingen. B-131 stelde
vast dat die grens blijft staan en dat de 28 bestaande overschrijdingen eigen werk
zijn; er vijf bij maken zou dat besluit niet serieus nemen. Ze zijn uit elkaar
gehaald, en de teller staat onveranderd op 33 waarschuwingen.


---

# 1 oktober 2026 — de prullenbak geldt overal

## B-138 — Eén prullenbak voor documentaties, groepen en reeksen

**Probleem.** B-135 gaf documentaties een prullenbak met dertig dagen en een knop
Terugzetten. Groepen (B-136) en reeksen (`FR-INS-12`) konden wél weg, maar niet
terug. Dat is een gat waar je één klik voor nodig hebt: een groep met dertig
lidmaatschappen verwijderen en er is geen weg terug. Gemeld bij het klaarzetten van
de tweede testronde, en de opdrachtgever zei "doen".

**Besluit.** Alle drie gaan naar dezelfde prullenbak, met dezelfde dertig dagen uit
§8.8, dezelfde drie handelingen — terugzetten, legen, en de opruimronde bij elke
start — en dezelfde vorm op het scherm.

**Het werk staat één keer.** `services/prullenbak.ts` kent de rekenkant en een
`maakPrullenbak(storage, clock, tabel, kinderen)`. Wat per soort verschilt is alleen
**welke kinderen meegaan**: pagina's bij een documentatie, lidmaatschappen bij een
groep, niets bij een reeks. De schermkant staat in `ui/TrashPanel`, die geen enkel
record kent en dus in `ui/` mag staan (§10.2).

### De verwijzing blijft staan, en dat is de kern

Tot nu toe maakte het verwijderen van een reeks `documentations.seriesId` leeg, en
het verwijderen van een groep haalde het id uit `groupIds`. **Dat gebeurt niet meer.**

Zolang er geen weg terug was, was wissen verdedigbaar. Met een prullenbak erbij is
het dat niet: je zet de reeks terug en je documentaties hangen er niet meer aan. Een
halve herstelling is erger dan geen, want je denkt dat het goed is gekomen.

§8.1.6 noemt dit zelf als tweede reden om te markeren in plaats van te wissen:
*"Verwijzingen blijven geldig. Met markeren blijft het record vindbaar."*

**Voor de gebruiker verandert er niets aan wat `FR-INS-12` belooft.** `list()` laat
verwijderde records weg, dus:

- de documentatie toont de reeks niet meer;
- het reeksfilter en het groepsfilter kennen hem niet meer;
- de zoekindex vindt zijn naam niet meer;
- de export zet hem niet op de pagina.

De documentatie *blijft bestaan* — dat is wat `FR-INS-12` en INV-20 beschermen, en
dat is onveranderd. Alleen het id blijft in de rij staan, zodat terugzetten heel is.

### Wat de bevestigingen nu zeggen

Ze meldden allebei een onomkeerbare handeling. Dat klopt niet meer, dus beide zeggen
nu dat het naar de prullenbak gaat en dertig dagen terug te zetten is, en de knop
heet *Naar de prullenbak* in plaats van *Verwijderen*. De rode knop is weg: rood is
voor wat niet terugkomt, en dat is alleen nog het legen van de prullenbak zelf.

### Nieuwe eis

**FR-INS-47 — Een verwijderde groep of reeks is dertig dagen terug te halen.**
*Gegeven* een verwijderde groep of reeks, *wanneer* je de prullenbak onder het
bijbehorende scherm opent, *dan* staat hij er met de resterende dagen en is hij terug
te zetten; bij een groep komen de lidmaatschappen mee. *Wanneer* de dertig dagen
voorbij zijn, *dan* wist de opruimronde bij de eerstvolgende start het record
definitief. Volgt uit B-138 en §8.8.

### Twee kleinere dingen in dezelfde ronde

**De PDF-toets viel om onder een volle toetsset.** `pdf-lib` wordt pas bij de eerste
aanroep geladen — precies wat het scherm ook doet (§17.2) — en die ene import duurde
meer dan de standaard vijf seconden. Dat is wachten op een module en niet op gedrag,
dus het blok krijgt er ruimte voor. De bewering is niet aangeraakt.

**`maakPrullenbak` ging over de zestig regels van DR-53.** B-131 stelde vast dat die
grens blijft staan en dat de 28 bestaande overschrijdingen eigen werk zijn. Er eentje
bij maken terwijl de inkt van dat besluit nog nat is, is het besluit niet serieus
nemen: de functie is uit elkaar gehaald in `kindsleutels`, `verzet` en `wis`, met een
`Opzet` die ze delen.


---

# 29 september 2026 — tweede feedbackronde

De opdrachtgever heeft de doorloop een tweede keer gelopen. Vijf punten. Drie ervan
gaan over de agenda en de export en staan hieronder; twee gaan over verwijderen en
volgen in B-135 en B-136.

## B-132 — Het snelveld leest een kale tijd als schooldag

**Probleem.** *"donderdag half 4 bouwvergadering"* leverde een afspraak om **03:30 's
nachts** op. Dat is letterlijk wat er staat, maar niet wat er bedoeld wordt.

**De grens komt van de opdrachtgever zelf:** *"schooldagen zijn eigenlijk altijd vanaf
7 uur 's ochtends tot 16.00 middag."*

**Besluit.** Een tijd die vóór 07:00 uitkomt krijgt er twaalf uur bij. `half 4` wordt
15:30, `kwart voor 4` wordt 15:45, `6u` wordt 18:00, `half 1` wordt 12:30. Vanaf 07:00
verandert er niets: `half 8` blijft 07:30 en `14u` blijft 14:00.

**De uitweg is de voorloopnul.** Wie écht om half zeven 's ochtends begint typt
`06:30`, en dat blijft staan — twee cijfers met een dubbele punt is de 24-uurs notatie
en die is niet dubbelzinnig. `6:30` is dat wél, en wordt 18:30.

**Waarom dit veilig is.** `FR-AGE-14` toont het concept-item vóór de bevestiging. Je
ziet dus altijd welke tijd het geworden is voordat er iets wordt opgeslagen, en je kunt
hem in hetzelfde veld corrigeren.

### Nieuwe eis

**FR-AGE-34 — Een kale tijd vóór zevenen wordt de middag.** *Gegeven* invoer in het
snelveld waarvan de tijd vóór 07:00 uitkomt, *wanneer* de app die ontleedt, *dan* komt
er twaalf uur bij, tenzij het uur met een voorloopnul in 24-uurs notatie is getypt.
Volgt uit B-132.

## B-133 — Een agenda-item mag een eigen kleur krijgen

**Probleem.** *"Ook wil ik graag kleuren van afspraken in de agenda kunnen aanpassen."*
De kleurkolom van §6.2.2 legt de kleur vast per soort, en er was geen manier om ervan af
te wijken.

**Besluit.** `calendarEvents` krijgt een veld `colour`: één van de acht uit §5.5, of
`null`. `null` is de normale toestand en betekent: de kleur van de soort. De tabel van
§6.2.2 blijft dus de regel; dit is de uitzondering die je zelf zet, bijvoorbeeld om alle
gymlessen in één oogopslag terug te vinden.

**Hetzelfde palet als reeksen en groepen.** §5.5 somt precies één verzameling op, en een
negende kleur herkent niemand. Het scherm toont negen knoppen: "Zoals de soort" vooraan,
daarna de acht.

**Contrast.** De acht zijn getoetst als vlak op wit (4,75 tot 7,08), dus wit erop haalt
overal de 4,5:1 van §5.3; zwart haalt dat bij `series-4` net niet. De letterkleur ligt
daarom vast op wit, en hoeft niet met het thema mee te draaien omdat de vulling dat ook
niet doet.

**Eén valkuil, met opzet vermeden.** Het schema krijgt `.nullable().default(null)` en
niet alleen `.nullable()`. De items die er al staan hebben dit veld niet; zonder
standaardwaarde valt elk bestaand agenda-item bij het lezen door de controle, en
`list()` laat ongeldige rijen weg. Dan is je agenda leeg zonder dat er iets kapot lijkt
— precies wat er bij `settings.showAttention` gebeurde (B-125). Er is een toets die een
rij zonder `colour` door het schema haalt.

### Nieuwe eis

**FR-AGE-35 — Een agenda-item heeft een eigen kleur of die van zijn soort.** *Gegeven*
de itemdialoog, *wanneer* je een van de acht kleuren van §5.5 kiest, *dan* toont het item
die kleur in dag-, week- en maandweergave; *wanneer* je "Zoals de soort" kiest, *dan*
geldt de kleur uit de tabel van §6.2.2. Volgt uit B-133.

## B-134 — Exporteren downloadt; het deelmenu vervalt

**Probleem.** *"De deelbare pdf/afbeelding opent nu een deelscherm, dit wil ik niet. Ik
wil dat de gebruiker het bestand 'download', waardoor het in de download map staat, dit
maakt het makkelijker te vinden."* En over de PDF: *"ziet er wel goed uit, alleen dus nog
onvindbaar op pc."*

**Dit draait B-09 om.** B-09 zette het deelmenu voorop met het klembord erachter, met als
redenering: *"downloaden, terugzoeken in je fotorol en dan pas versturen zijn vier
handelingen voor iets wat er één kan zijn."* Die redenering ging over de telefoon. Op de
laptop levert hij het omgekeerde op: een venster dat je niet wilde, en daarna een bestand
dat nergens staat.

**Besluit.** Beide knoppen downloaden. Eén voorspelbare plek — de map Downloads — wint
het van een menu waarvan je per apparaat niet weet wat erin staat. `navigator.share`
wordt niet meer aangeroepen; `deelwijze`, `deelBestand` en `kanDelen` zijn verdwenen.

**Kopiëren blijft, als tweede knop.** Dat is ook wat `FR-DOC-117` letterlijk zegt: *"Op
de laptop verschijnt daarnaast «Kopieer afbeelding»"* — daarnaast, niet in plaats van.
De knop staat er alleen waar het klembord bestaat, want een knop die op dit apparaat
niets kan doen is erger dan een knop die er niet is. Kopiëren telt niet als export in de
zin van `FR-DOC-118`: het is een tussenstap, geen aflevering, en de status blijft op
concept.

**Wat dit op de telefoon kost.** Daar wás het deelmenu de betere weg, en die valt nu weg.
De opdrachtgever heeft het punt na eigen gebruik gemaakt en B-14 zet de laptop voorop;
komt het op de telefoon terug als bezwaar, dan is een keuze per apparaat de volgende
stap. Dat is niet vooruit gebouwd.

**Eén detail dat anders stilletjes misgaat.** Het adres van het gedownloade bestand wordt
pas na een minuut ingetrokken en niet op dezelfde tik. Bij een blad van enkele megabytes
leest de browser er nog uit terwijl de regel eronder al draait; meteen intrekken levert
dan een lege download op.

**Gewijzigd in het handboek.** `FR-DOC-117` in §6.1 beschreef het deelmenu als de eerste
weg. Die eis is herschreven naar wat er nu gebeurt, in plaats van hem te laten staan als
tegenspraak.


## B-135 — Documentaties verwijderen, met een prullenbak van dertig dagen

**Probleem.** *"Er is geen manier om documentatie te verwijderen."* Dat klopte
letterlijk: er was geen knop, geen menu-item, geen sneltoets. Wat je maakte bleef.

**En ook dit stond er al.** §6.1.13 kent `FR-DOC-120` t/m `FR-DOC-123` sinds het
handboek: archiveren, verwijderen als markeren, de prullenbak van dertig dagen, en
het legen ervan. Alleen `FR-DOC-120` — archiveren — blijft nog liggen; dat is een
ander gebaar dan weggooien en de opdrachtgever vroeg om het tweede.

**Besluit.** Verwijderen is markeren, zoals §8.1.6 en T-11 het al voorschrijven. Er
komt geen `delete()` bij. Wat er bij komt:

- een knop **Verwijderen** in het schrijfscherm, met een bevestiging die zegt dat
  het naar de prullenbak gaat en dertig dagen terug te halen is;
- een **prullenbak** onderaan het overzicht, met per regel het aantal resterende
  dagen en een knop Terugzetten;
- **Leeg de prullenbak** met één bevestiging die het aantal noemt (`FR-DOC-123`);
- een **opruimronde bij elke start** die wist wat over de dertig dagen heen is
  (`FR-DOC-122`, §8.8).

**Een documentatie en haar pagina's gaan samen.** Beide handelingen lopen via
`schrijfAggregaat`: één transactie, één journaalregel op de wortel (§9.4 regel A).
Zou het halverwege stoppen, dan stond er een documentatie in de prullenbak waarvan
de pagina's nog leefden — of erger, een levende documentatie zonder tekst. Daarvoor
heeft `Aggregaatschrijver` er twee handelingen bij gekregen, `verwijder` en
`herstel`, want `deletedAt` staat niet in `Nieuw<>` en is dus niet met `wijzig` te
zetten. Dat is geen omissie maar §8.1.6: verwijderen is geen veld dat je invult.

**De opruimronde wordt niet afgewacht.** Hij mag de eerste render niet ophouden, en
de uitkomst gaat nergens heen: staat er nog iets in de prullenbak dat er weg had
gemogen, dan is dat geen bericht waar de gebruiker iets mee kan (§4.6). Bij elke
start en niet op een tijdklok — een app die je één keer per week opent hoort geen
achtergrondtaak te hebben die draait terwijl niemand kijkt.

**Waar het staat.** De prullenbak staat in `services/documentation/prullenbak.ts` en
`verwijderen.ts` en niet in `DocumentationService`: dat bestand zat al tegen de 400
regels van DR-53 aan, en dit is een eigen onderwerp met een eigen bewaartermijn uit
§8.8. `DocumentationService` geeft ze door, zodat een scherm maar één plek hoeft te
kennen.

**Nog niet gedaan:** `FR-DOC-120`, archiveren. Uit beeld halen zonder weg te gooien
is een derde toestand naast concept en gedeeld, met een filter in het overzicht en
een uitzondering in het dashboard. Dat is een eigen stuk werk en niet wat er gevraagd
werd.

## B-136 — Een groep verwijderen haalt lidmaatschappen weg, geen leerlingen

**Probleem.** *"Er is geen manier om groepen te verwijderen."* §6.5.2 kent er ook
geen eis voor: `FR-INS-06` t/m `FR-INS-10` gaan over lidmaatschappen, de jaarovergang
en het overzicht per kind, maar niet over het weghalen van een groep. Reeksen hebben
die eis wél (`FR-INS-12`).

**Besluit.** Een groep is te verwijderen, en dat werkt zoals bij een reeks: **de
groep is een ordening en geen eigenaar** (B-35, INV-20). Een leerling raakt zijn
lidmaatschap kwijt, niet zichzelf. Documentaties die naar de groep verwijzen blijven
bestaan en raken alleen de verwijzing kwijt. De app zegt vooraf hoeveel leerlingen
het betreft, net als `FR-INS-12` dat voor reeksen doet.

**De volgorde is niet willekeurig.** Eerst de lidmaatschappen, dan de verwijzingen in
documentaties, dan de groep zelf. Zou de groep als eerste verdwijnen en daarna iets
misgaan, dan wijzen er lidmaatschappen en documentaties naar een groep die niet meer
bestaat — precies de toestand die geen enkel scherm kan tekenen.

De lidmaatschappen gaan mee naar de prullenbak en worden niet gewist: een lidmaatschap
zonder groep is een rij die niets meer betekent en die je niet kunt terugzetten.

### Nieuwe eis

**FR-INS-46 — Een groep verwijderen laat de leerlingen en hun documentaties staan.**
*Gegeven* een groep met lidmaatschappen, *wanneer* je hem verwijdert, *dan* noemt de
app vooraf hoeveel leerlingen erin zitten; *daarna* verdwijnt de groep uit de lijst,
blijven de leerlingen bestaan zonder dit lidmaatschap, en blijven documentaties die
naar deze groep verwezen bestaan zonder die verwijzing. Volgt uit B-136.

## B-137 — `accent` betekende twee dingen, en het onleesbare won

**Probleem.** Gevonden doordat de schermtoets op de agenda faalde, en dat was geen
gevolg van deze ronde: de jaarweergave is tussen 1 juli en 15 september de standaard
(B-31), dus vóór 16 september tekende de toets een ander scherm. Vanaf eind september
komt de weekweergave in beeld, en daar stond de kop van *vandaag* in `text-accent` op
de paginakleur — contrast onder de 4,5:1, en axe noemde het terecht *serious*.

**Oorzaak.** `@theme inline` in `globals.css` zet Tailwinds `accent` op `var(--accent)`,
en `inline` betekent dat die waarde op de gebruiksplek wordt ingevuld. De
`--color-accent` uit `tokens.css` — het blauw van §5.5 — wordt dus overgeslagen. Wat
`text-accent` oplevert is shadcns `--accent`: `oklch(0.97 0 0)`, bijna wit. De
toelichting bovenaan `globals.css` beweert het tegendeel en klopt op dit punt niet.

**Besluit.** `accent` als **paar** — `bg-accent` mét `text-accent-foreground` — blijft
van shadcn: bijna wit met bijna zwart erop is leesbaar en het is het gebaar dat
dropdowns en tabbladen nodig hebben. `accent` als **letter of rand op de paginakleur**
wijst voortaan rechtstreeks naar het teken: `text-(--color-accent)`,
`border-(--color-accent)`, `bg-(--color-accent-quiet)`.

Vier plekken: de kop van vandaag in de weekweergave, de hoverkleur in een
dashboardblok, de hoverrand van een jaarcel, en de gekozen layout in het exportpaneel.
De laatste drie waren onzichtbaar in plaats van onleesbaar, en waren daarom nooit
opgevallen.

**Wat hier níet gebeurt.** `accent` globaal op §5.5 zetten. Dan wordt shadcns paar
blauw-op-bijna-zwart, en dat is onleesbaar in elke dropdown. Twee betekenissen die je
uit elkaar houdt is hier goedkoper dan één betekenis die de helft van de componenten
breekt.


---

# 9 september 2026 — na de eerste eigen test

De opdrachtgever heeft de doorloop voor het eerst zelf gelopen. Vijf punten kwamen
terug, en twee openstaande adviezen zijn met "ga volledig mee in jouw advies"
afgehandeld. Wat daaruit volgt staat hieronder.

## B-127 — Een reeks maak je waar je hem nodig hebt

**Probleem.** *"In de documentatie kan ik wel een reeks selecteren maar niet
aanmaken."* Reeksen bestonden alleen in Instellingen. Wie tijdens het schrijven merkt
dat deze documentatie bij een nieuwe reeks hoort, moest opslaan, wegnavigeren, de
reeks maken, terugkomen en hopen dat zijn concept er nog stond.

**En het stond er al.** §6.1 schrijft voor: *"Reeks is een keuzeveld met zoeken, met
onderaan altijd de regel «Nieuwe reeks maken…»"*. Die regel was nooit gebouwd. Dit
besluit is dus voor de helft geen besluit maar een omissie die wordt ingelost.

**Besluit.** Een reeks is te maken op twee plekken buiten Instellingen: onderaan de
reekskeuze in het schrijfscherm, en met een knop op het overzicht. Beide gebruiken
hetzelfde blok, dat **inline** verschijnt en geen venster is — een overlay boven een
formulier waarin je net typte legt je eigen tekst weg achter een tweede laag.

**Waarom niet alleen in het schrijfscherm.** Het overzicht is waar je op reeks
filtert. Merk je daar dat een reeks ontbreekt, dan is de omweg via Instellingen
hetzelfde probleem in een ander scherm.

**Grens.** Alleen aanmaken. Wijzigen en verwijderen blijven in Instellingen, want
§6.5.3 kent die twee daar en een reeks verwijderen raakt documentaties (INV-20,
`FR-INS-12`). De regels blijven van `SeriesService`; er wordt niets nagerekend wat
daar al staat (U-03).

### Nieuwe eisen

**FR-DOC-125 — De reekskeuze eindigt op "Nieuwe reeks maken…".** *Gegeven* het
schrijfscherm, *wanneer* je de reekskeuze opent, *dan* staat onderaan de lijst de
regel "Nieuwe reeks maken…"; *wanneer* je hem kiest, *dan* komt er een invulblok op
de plaats van het keuzeveld, en na het toevoegen staat de nieuwe reeks in de lijst
én is hij gekozen. Volgt uit §6.1 en B-127.

**FR-DOC-126 — Een reeks is te maken vanuit het overzicht.** *Gegeven* het overzicht
van documentaties, *wanneer* je "Nieuwe reeks" kiest, *dan* verschijnt hetzelfde
invulblok, en na het toevoegen staat de reeks in het reeksfilter. Volgt uit B-127.

## B-128 — Print-PDF komt uit de app, niet uit de browser

**Probleem.** *"In de bijlage heb ik het printbare pdf opgenomen, dit is nog steeds
niet goed. Ik wil alleen de documentatie printen, al die andere dingen niet."* De
bijgeleverde PDF telde dertien pagina's met het schrijfformulier, de leerlingenlijst,
de navigatie en het exportpaneel erop. De documentatie zelf stond er niet als pagina
in.

**Oorzaak.** De knop riep `window.print()` aan. Dat drukt het scherm af. Er was geen
`@media print` in de hele codebase, dus "het scherm" betekende letterlijk alles.

**Dit was al beslist.** `FR-DOC-116` staat er sinds het handboek: *"één PDF met drie
A4-liggende pagina's, gegenereerd in de app en niet via de printfunctie van de
browser"*. D08 heeft die eis niet ingelost en er een eerlijk bijschrift onder gezet —
*"Print-PDF gebruikt in deze versie de printfunctie van je browser"* — maar een
eerlijk bijschrift onder iets wat niet werkt, blijft iets wat niet werkt.

**Besluit.** De PDF wordt in de app gemaakt met `pdf-lib` (T-14, §16), en het blad is
**de al gerenderde JPEG**. Er wordt niets opnieuw getekend en niets opnieuw gemeten:
`RenderService` heeft de pagina al op 2480 × 1754 gezet en die afbeelding gaat als
geheel op een A4 liggend van 297 × 210 mm.

**Waarom het beeld en niet opnieuw tekenen.** Dan kan de PDF per definitie niet
afwijken van de deelbare afbeelding — hetzelfde beeld, een andere verpakking. Dat is
`FR-DOC-113` ("het voorbeeld ís het bestand") doorgetrokken naar papier. Een tweede
tekenpad naar de printer is precies waar B-27 al voor waarschuwde.

**Gevolg.** `window.print()` is weg. `pdf-lib` wordt pas geladen als je op de knop
drukt: 400 kB in het eerste scherm van een app die op een schoollaptop moet starten,
voor een knop die de meeste sessies niet wordt aangeraakt, is de verkeerde ruil
(§17.2). Print-PDF telt als export in de zin van `FR-DOC-118`, net als de afbeelding.

## B-129 — De jaarcel toont zijn dagnummer en een stip

**Probleem.** Twee punten uit dezelfde weergave. *"In het jaaroverzicht van de agenda
staan nu geen datums."* En: *"Ook kan ik niet zien of er iets gepland is op een dag."*

Zonder nummer is "welke dag is dit" alleen te beantwoorden door rijen te tellen vanaf
de bovenkant van de kolom. Zonder stip is de jaarweergave een vakantiekalender: hij
toont wat de school besloot en niet wat jij hebt afgesproken.

**Besluit.** Elke cel draagt links zijn dagnummer en rechts een stip zodra er die dag
iets in de agenda staat. De cel groeit van 14 naar 16 px hoog; de letter is `2xs`
(11 px), de laagste trap van §5.4.

**Wat de stip telt.** Alle agenda-items van die dag, **behalve** studiedagen en
margedagen. Die kleuren de cel al, en een stip bovenop hun eigen kleur zegt niets
nieuws. Een vakantie is geen agenda-item en komt er vanzelf niet in voor.

**`FR-AGE-06` blijft staan.** Nagemeten op 1280 × 800: geen horizontaal en geen
verticaal schuiven. 31 rijen van 16 px met 1 px ertussen is 526 px.

**Kleur is nooit de enige drager** (NFR-38). De stip staat in de legenda, en het
`aria-label` van de cel zegt het voluit: "15 september — schooldag — 1 afspraak".

**Contrast.** Het dagnummer komt op vijf ondergronden te staan en §5.3 vraagt overal
4,5:1. Nagemeten in beide thema's; alles haalt het. Eén regel is daarvoor aangepast:
de weekendcel krijgt de gewone letterkleur en niet de gedempte, want die haalde op
`bg-muted` maar 4,34. Dat de weekendkolom terugtreedt doet de vulling al.

### Nieuwe eisen

**FR-AGE-32 — Elke cel in de jaarweergave draagt zijn dagnummer.** *Gegeven* de
jaarweergave, *dan* staat in elke cel het nummer van die dag, ook bij dagen buiten
het schooljaar. Volgt uit B-129.

**FR-AGE-33 — Een stip zegt dat er die dag iets staat.** *Gegeven* een dag met
minstens één agenda-item dat geen studiedag of margedag is, *dan* draagt de cel een
stip en noemt zijn toegankelijke naam het aantal afspraken. Volgt uit B-129.

## B-130 — Geen toestemmingsvraag bij een documentatie zonder foto's

**Probleem.** Gevonden bij het narekenen van B-128. Een documentatie zónder foto's
kreeg bij het exporteren de vraag: *"Op deze foto's staan kinderen. Heb je voor deze
kinderen toestemming voor beeldgebruik?"*

**Waarom dat erger is dan het lijkt.** B-08 kiest voor één keer vragen per
documentatie met de reden: *"elke keer vragen leidt tot wegklikken"*. Een vraag die
niet klopt doet precies dat, en sneller: hij leert je hem wegklikken vóórdat je hem
leest. Dan staat de vraag er nog wel bij de documentatie waar wél twintig foto's van
kinderen in zitten, maar leest niemand hem meer.

**Besluit.** De vraag komt alleen bij een documentatie met minstens één foto.
`FR-DOC-115` verandert niet van tekst — hij zegt "waarvan je voor het eerst een
deelbare afbeelding maakt" en niets over nul foto's — maar de regel staat nu apart in
`services/documentation/toestemming.ts` en niet in de klikafhandeling, zodat hij
toetsbaar is zonder browser (DR-12) en op één plek staat (DR-15).

## B-131 — De registeraudit van de `B`-reeks, en wat hij vond

B-117 legde de `T-` en `INV-`reeksen langs het register. De `B-`reeks zelf was nooit
gecontroleerd. Dat is nu gedaan, met dezelfde regel als B-117: **óf een echt nummer,
óf de verwijzing gaat eruit.** De controle is uitgebreid naar paragraafverwijzingen,
want een `§8.3.15` die niet bestaat is net zo misleidend als een `B-98` die niet
bestaat.

**Uitkomst: 128 `B-`nummers genoemd, 120 gedefinieerd, drie spoken.** `B-98`, `B-99`
en `B-100` in `domain/types/weekPattern.ts` en `domain/schemas/weekPattern.ts`. Ze
vallen in het gat tussen `B-97` en `B-103` dat bij de nummercorrectie van 11 augustus
is ontstaan. `B-101` staat er ook nog, maar die is in orde: B-123 heeft hem
uitdrukkelijk als niet-bestaand vastgelegd en de code zegt dat er zo bij.

**Vijf paragrafen die niet bestaan.** `§6.2.11`, `§6.3.9`, `§6.3.10`, `§8.3.15` en
`§8.3.16` werden op elf plekken aangehaald. Hoofdstuk 6.2 loopt tot §6.2.10,
hoofdstuk 6.3 tot §6.3.8 en §8.3 tot §8.3.14. In `src/` zijn ze vervangen door de
paragraaf die het wél zegt (§8.1.4 voor de wandkloktijd, §9.6 voor de
domeingebeurtenis) of door het besluit dat erachter zit (B-115). Twee staan nog in
`docs/07-gebruikersflows.md` en `docs/12-ai-architectuur.md`; die hoofdstukken raak
ik niet zonder toestemming.

**En de grootste vondst: de basisweek heeft nog een eigen gegevensmodel.** B-115
besliste dat de basisweek *een invoerscherm is en geen tweede gegevensmodel*, en
schreef erbij: *"Bestaande code die een eigen basisweek-record schrijft, wordt in
D09b omgezet naar het genereren van herhalende items."* Dat is in D09b niet gebeurd.
Er staan nog twee Dexie-tabellen — `weekPatterns` en `weekPatternOverrides` — met
hun typen, schema's en toetsgegevens. Geen enkele service en geen enkel scherm raakt
ze aan.

**Besluit.** De tabellen en hun typen gaan eruit, maar **niet in deze wijziging**.
Een tabel verwijderen vraagt een verhoging van `DB_VERSIE` en daarmee een migratie op
een database waar de opdrachtgever nu zijn proefgegevens in heeft staan. Dat hoort
een eigen wijziging te zijn met een eigen controle, niet een bijrijder van een
feedbackronde. Tot die tijd staat er bovenaan beide bestanden waaróm ze er nog zijn.

## DR-53 — de nuance van NFR-44 hoort er wél bij

**Ik had dit eerder verkeerd voorgesteld.** Bij het opleveren van blok 1 meldde ik dat
DR-53 niet met de code klopte omdat de lintregel op *waarschuwing* stond en de
bouwstraat 28 te lange functies doorliet, en ik adviseerde §20 te splitsen: een
ruimere grens voor schermen dan voor services. Dat advies was gebaseerd op een
onvolledige lezing.

**NFR-44 zegt het zelf al:** *"Geen bestand boven 400 regels; geen functie boven 60
regels. Overschrijding is een lintwaarschuwing, niet een fout, maar wel een
verplichte overweging."* Het niveau `warn` is dus geen gat in de bouwstraat maar de
bedoelde instelling. Daar hoefde niets aan te veranderen.

**En het splitsen deugt niet.** Van de 28 overschrijdingen zitten er negen in
`services/`, met `createStorageService` op 221 regels en `DocumentationService` op
149. Daar gaat het argument "een JSX-boom is nu eenmaal lang" niet op. De grootste
overschrijding is bovendien `DocumentEditor.tsx` met 236 regels in één functie, en
dat is geen natuurlijk lange boom maar werk dat blijft liggen. Een grens verruimen
zodat de code er weer onder past, is dezelfde beweging als een toets versoepelen tot
hij groen wordt (DR-45).

**Besluit.** DR-53 wordt niet gesplitst. Hij krijgt wél de tweede helft van NFR-44
erbij, want die stond er niet en het is precies de helft die zegt wat je moet doen
als je eroverheen gaat. De 28 overschrijdingen worden opgeruimd als eigen werk, met
de negen in `services/` eerst.

> **Correctie op de bouwstraat.** Bij dezelfde ronde bleek dat twee van de vijf
> DR-11-zones in `eslint.config.mjs` naar mappen wezen die niet bestaan:
> `modules/documentaties` en `modules/instellingen`, terwijl de mappen
> `modules/documentation` en `modules/settings` heten. Een zone die nergens op
> aangrijpt zwijgt; hij faalt niet. Daardoor gold "een module importeert nooit uit
> een andere module" voor die twee modules feitelijk niet, terwijl de regel op
> `error` stond. Namen gecorrigeerd. Er bleken geen overtredingen te zijn — de deur
> stond open, er is niemand doorheen gelopen.


---

# 17 augustus 2026 — tijdens D11

## B-126 — De ondergrens van INV-16 weigert vandaag nooit

**Probleem.** Gevonden door de doorloop te lopen die D11 voorschrijft, op 17 augustus met
een schooljaar dat op 24 augustus begint:

> "Deze datum ligt vóór het oudste schooljaar in je opslag. Kies een latere datum."

Een documentatie van **vandaag** werd geweigerd. Daarmee stond de doorloop stil: vanaf een
verse installatie in augustus is er geen documentatie te maken, en dat is precies de week
waarin `F-16` zegt dat je je schooljaar klaarzet.

**De oorzaak is een letterlijke lezing.** INV-16 zegt: *"niet vóór het begin van het oudste
schooljaar in de opslag"*, en dat is wat de code doet. Maar de reden die INV-16 zelf
meegeeft, gaat over de andere kant: *"Je documenteert wat gebeurd is. Een datum in de
toekomst breekt sortering, filters en de reeksvolgorde."* De ondergrens is er om te
voorkomen dat je iets wegschrijft in een jaar dat je niet in je opslag hebt — niet om
vandaag te verbieden.

Daar komt bij dat §6.1.1 de ondergrens in zijn veldtabel heel anders neerzet: *"niet vóór
2015-08-01"*. Twee bronnen, twee ondergrenzen, en de code voerde ze beide uit.

**Besluit.** De ondergrens is het **vroegste van tweeën**: het begin van het oudste
schooljaar, óf vandaag. Een datum van vandaag of later dan vandaag-min-een-week wordt nooit
op deze grond geweigerd. De absolute ondergrens van 2015-08-01 blijft in het schema staan.

**Waarom niet het schooljaar eerder laten beginnen.** Dat zou de gebruiker vragen om een
onwaarheid in te vullen om de app te laten werken. 24 augustus is een normale eerste
schooldag en 17 augustus een normale dag om te werken.

**Waarom niet de grens weghalen.** Hij doet wél werk: een documentatie van 2019 in een
opslag die in 2026 begint hoort niet stil te slagen, want dan staat hij in geen enkel filter
en in geen enkele reeks.

**Gevolg.** `DocumentationService.datumbezwaar` vergelijkt met `min(eersteSchooldag,
vandaag)`. De bovengrens uit B-70 — zeven dagen vooruit — blijft ongewijzigd.

## B-125 — `settings.showAttention`: het blok Aandacht is uit te zetten

**Probleem.** `FR-DAS-07` zegt: *"Gegeven Instellingen → Dashboard, wanneer je het blok
uitzet, dan verdwijnt het en wordt de berekening niet meer uitgevoerd."* Er is geen veld
waarin dat kan staan. §8.3.14 noemt de dréempel (`attentionThresholdDays`) maar geen
aan-of-uit.

De drempel misbruiken door hem op nul te zetten is geen optie: §6.4.4 legt hem vast tussen
10 en 60, en een waarde buiten dat bereik als geheime uit-stand is precies het soort
verborgen betekenis waar niemand later nog op komt.

**Besluit.** `settings.showAttention: boolean`, standaard `true`. §8.3.14 wordt daarvoor
aangevuld.

**Waarom in `settings` en niet in `localStorage`.** Het is geen apparaatvoorkeur maar een
keuze over een **berekening op persoonsgegevens**: welke kinderen lang niet in een
documentatie voorkwamen. Zo'n keuze hoort bij de andere instelling over diezelfde
berekening, en hij hoort mee te gaan in een back-up — zet je hem uit omdat het blok je in de
weg zit, dan wil je niet dat hij op een nieuwe laptop weer aanstaat.

**Waarom dit meer is dan een schakelaar.** `FR-DAS-06` staat erboven: *"Aandacht is een
geheugensteun, geen signaal over een kind."* De berekening niet uitvoeren is de sterkste
vorm van die belofte — geen score, geen geschiedenis, en desgewenst geen berekening. B-25 en
hoofdstuk 15 wijzen dezelfde kant op.

**Gevolg.** Het veld staat in `domain/types/settings.ts` en in het schema. Staat hij op
`false`, dan wordt het blok niet getekend **en** wordt er niets uitgerekend; dat laatste is
wat `FR-DAS-07` letterlijk vraagt en het is met een `if` rond de berekening afgedwongen, niet
met een `display: none`.

---

# 16 augustus 2026 — tijdens D09b

## B-124 — Een zevende sleutel in `localStorage`: `eduflow.lastIcsExportAt`

**Probleem.** `FR-AGE-27` wil dat het agendascherm toont *"hoeveel items er zijn gewijzigd
sinds de laatste export"* en een nieuwe export aanbiedt. Daarvoor moet ergens staan wannéér
er voor het laatst is geëxporteerd, en die plek bestaat niet.

§8.2.2 is er stellig over: zes sleutels, *"en er komt er geen zevende bij zonder dat dit
hoofdstuk wordt gewijzigd"*. `eduflow.onboardingFlags` heeft de goede vórm — een tijdstip
per vlag — maar is in diezelfde tabel toegewezen aan drie met name genoemde eenmalige
vragen. Er iets anders in stoppen zou de tabel laten liegen.

**Besluit.** Er komt een zevende sleutel, en §8.2.2 wordt daarvoor gewijzigd:

| Sleutel | Type | Standaard |
|---|---|---|
| `eduflow.lastIcsExportAt` | `IsoDateTime \| null` | `null` |

**Waarom `localStorage` en niet de opslag.** Hij is het spiegelbeeld van
`eduflow.lastBackupAt`, die er al staat: een apparaatvoorkeur, geen persoonsgegeven, en
niet iets dat mee hoort te gaan in een back-up of een synchronisatie. Exporteer je op je
laptop, dan hoort je telefoon niet te denken dat híj geëxporteerd heeft — precies de
redenering waarmee §8.2.2 de andere zes verantwoordt.

**Waarom niet in `settings`.** Dat record gaat wél mee in de back-up, en dan zou het
terugzetten van een back-up de teller op nul zetten voor een export die op dat apparaat
nooit heeft plaatsgevonden.

**Gevolg.** §8.2.2 telt zeven sleutels. `SettingsService` leest en schrijft hem via
dezelfde smalle omhulling als de andere zes; het agendascherm telt de items met een
`updatedAt` ná dat tijdstip.

**Herziening.** Komt er ooit synchronisatie tussen apparaten, dan hoort deze sleutel per
apparaat te blijven en niet mee te reizen.

## B-123 — `recurrence` komt terug; `B-101` heeft nooit bestaan

**Probleem.** `calendar.ts` schrijft: *"Er is geen `recurrence` (B-101). Een agenda-item
herhaalt niet; wat zich herhaalt is de basisweek."* Het schema laat het veld niet toe en
een toets bewaakt dat actief.

`B-101` staat nergens. Niet in hoofdstuk 19, niet in dit bestand, niet in het volledige
handboek. Het is hetzelfde soort spooknummer als de zes uit B-117, alleen viel deze buiten
de grep van dat besluit — die zocht op `T-4[5-9]`, `T-50` en `INV-5[4-9]`.

En dit spooknummer is niet alleen een losse verwijzing: het heeft **het model veranderd**.
Wat er werkelijk staat:

| Bron | Wat er staat |
|---|---|
| §6.2.2, veldtabel | `recurrence` \| regel \| nee \| geen \| zie 6.2.5 |
| §6.2.5 | "Alleen drie regels: elke week, elke twee weken, elke maand op dezelfde weekdag. Met een einddatum of een aantal keren." |
| `FR-AGE-15` | "Een herhaling wijzigen vraagt om reikwijdte" |
| B-115 | de basisweek "maakt daar gewone **herhalende agenda-items** van" |
| §9.5 | geen enkele invariant die herhaling verbiedt |

B-115 zegt dus het tegenovergestelde van wat het commentaar hem toeschrijft: de basisweek
bestaat júist bij de gratie van herhalende items. Zonder `recurrence` is B-115 niet te
bouwen, en werkopdracht D09b begint met "Herhalen".

**Besluit.** `recurrence` komt terug, precies zoals §6.2.5 hem beschrijft en niet ruimer:
drie frequenties, en een einde dat óf een datum óf een aantal is. Geen `RRULE`.

De vorm:

```ts
interface Recurrence {
  frequency: "wekelijks" | "tweewekelijks" | "maandelijks";
  until: IsoDate | null;   // precies één van deze twee is gevuld
  count: number | null;
  excludedDates: IsoDate[]; // de gaten van §6.2.5
}
```

**Waarom precies één van `until` en `count`.** §6.2.5 zegt "met een einddatum of een aantal
keren"; allebei leeg zou een reeks zonder einde opleveren, en die is in geen enkele weergave
te tellen en nooit klaar met uitrekenen. Allebei gevuld zou twee einden geven waarvan de
app er één moet kiezen — en welke, dat staat nergens.

**Waarom niet het spooknummer alsnog betekenis geven.** Dat is wat B-117 verbiedt en het is
hier extra verleidelijk, want het commentaar klínkt als een besluit. Maar er is nooit iemand
geweest die dit heeft afgewogen; er is een regel geschreven en er is een nummer bij gezet.

**Gevolg.** `Recurrence` staat in `domain/types/calendar.ts` en in het schema. De toets die
een herhaalregel weigerde, toetst nu dat een geldige regel wordt aanvaard en een ongeldige
niet. `RecurrenceService` rekent de instanties uit; de opslag draagt één record per reeks,
niet per instantie (U-02: wat af te leiden is, wordt niet opgeslagen).

**Herziening.** Vraagt iemand om een uitdrukking die deze drie regels niet aankunnen, dan
is dat een nieuw besluit met een eigen afweging — niet een uitbreiding van dit.

---

# 14 augustus 2026 — vier nummers die de code al gebruikte, en één uit D08

> Dit blok sluit B-117 af. De grep uit dat besluit gaf vier treffers in de code die naar een
> nummer wezen dat in dit register niet staat: `T-46`, `B-120`, `B-121` en `INV-57`. B-117
> schrijft voor wat er dan gebeurt — **óf een echt nummer uit dit register, óf de verwijzing
> gaat eruit** — en dat is hier gedaan. Drie kregen een nummer, één verwijzing ging eruit.

## T-46 — De importregel voor `app/providers/`

**Probleem.** `eslint.config.mjs` verbiedt `modules/` om uit `app/` te importeren (DR-11,
§10.2). Maar `useDienst` — de enige weg van scherm naar service — woont in
`app/providers/`, en elk scherm heeft hem nodig. Zonder uitzondering faalt de bouwstraat op
werkende code.

**Besluit.** Een module mag uit `app/` **alleen** `app/providers/` importeren. De schil en
de routes blijven van `app/` zelf.

**Waarom.** `providers/` draagt geen scherm en geen route; het is de aansluiting waar §10.10
om vraagt. De rest van `app/` is Next.js-bedrading en gaat een module niets aan. De regel
staat als zone in `eslint.config.mjs` en faalt de bouwstraat bij overtreding, zodat dit geen
afspraak op papier blijft.

**Gevolg.** Geen. De regel stond al in de configuratie en werd alleen niet gedragen door een
nummer uit dit register.

## B-120 — De toegangscode-cookie leeft negentig dagen, niet een jaar

**Probleem.** Twee hoofdstukken geven de cookie `eduflow_access` een andere looptijd.
FR-INS-37 (§6.5.11) zegt "een looptijd van **een jaar**"; §8.2.3 zegt in de tabelrij
`Max-Age` "**90 dagen** — lang genoeg om niet te irriteren, kort genoeg om een vergeten
apparaat te laten verlopen". `/api/toegang` zet die cookie en kan er maar één kiezen.

**Besluit.** **Negentig dagen.** FR-INS-37 wordt hierop gewijzigd; §8.2.3 blijft zoals hij is.

**Waarom.** §8.2.3 is de plek waar de cookie technisch is vastgelegd — naam, `httpOnly`,
`Secure`, `SameSite`, `Path` — en is de enige van de twee die een **reden** bij de looptijd
geeft. FR-INS-37 noemt het jaar terloops, in een zin die over gemak gaat.

De weging zelf: deze cookie is de enige sleutel tot documentaties over kinderen. Er zijn
geen accounts (B-21), dus er is geen manier om op afstand toegang in te trekken — FR-INS-38
laat je een apparaat intrekken, maar dat werkt alleen zolang je eraan denkt. Een laptop die
kwijtraakt en een jaar lang binnenkomt weegt niet op tegen één keer per kwartaal een code
overtikken.

**Gevolg.** `COOKIE_MAX_AGE_S` staat op 7.776.000 seconden, als benoemde constante (DR-54).

**Herziening.** Zodra toegang op afstand ingetrokken kan worden zonder dat het van het
geheugen van de gebruiker afhangt.

## B-121 — De rondgang krijgt `INV-54`; `INV-30` blijft van de agenda

**Probleem.** `INV-30` draagt twee dingen. In §9.5 (`09-domeinmodel.md`) is het "een
agenda-item heeft een begin en een einde"; in §12.5, §16.4 en NFR-25 is het
`restore(pseudonymise(t)) === t`. Dat is een botsing in het handboek zelf, geen leesfout.

Eerdere sessies gaven de rondgang `INV-57`. Dat nummer staat in de code, in poort 9 en in
gemergede commits, maar het is nooit in dít register uitgegeven — B-117 telt de `INV-`reeks
tot `INV-53` en verklaart alles daarboven tot spooknummer.

**Besluit.** De rondgang krijgt **`INV-54`**, het eerste vrije nummer. `INV-30` blijft van
de agendaregel in §9.5; die staat in het domeinmodel en is daar getoetst.

**Waarom niet `INV-57` alsnog uitgeven.** Dan zou dit register een nummer bekrachtigen dat
buiten het register is ontstaan, en drie nummers overslaan om een gok te sparen. Dat is de
onderbouwing naar de code toe schrijven — precies wat B-117 verbiedt. Eén keer omnummeren,
met de reden erbij, is goedkoper dan een reeks met een gat waar niemand de reden van kent.

**Gevolg.** `INV-57` komt in `src/` niet meer voor. Poort 9 en de toetsen in
`PrivacyService.test.ts` en `AIService.test.ts` dragen nu `INV-54`. Geen enkele regel of
drempel is gewijzigd — alleen het nummer.

**En de vierde treffer.** `weekPattern.ts` beriep zich op `B-121` voor "de basisweek heeft
geen invariantnummer, en dat is geen omissie". Die zin staat al in **B-115**: de basisweek
bestaat door een besluit en niet door een invariant. Daar wijst het commentaar nu naar, en
er is geen nieuw nummer voor nodig.

## B-122 — De tekst blijft in de doorloop op pagina 1 van layout A

**Probleem.** §5.10.2 laat bij zes foto's de lopende tekst verhuizen naar een vervolgpagina
in `E-vervolg`. Werkopdracht D08 zegt even uitdrukkelijk: `LayoutService` met **alleen**
`A-fotoraster`, en de andere vier layouts bouw je niet. Bij zes foto's plus tekst spreken
die twee elkaar tegen.

**Besluit.** In de doorloop **blijft de tekst op pagina 1**, in slot A6. Foto's die niet in
A1 t/m A5 passen schuiven door naar een volgende pagina in dezelfde layout — dat is §5.10.7
regel 2 en het vraagt geen nieuwe layout. Past de tekst niet in A6, dan meldt het
exportpaneel hoeveel er overblijft; er wordt niets stil afgekapt.

**Waarom.** De twee alternatieven zijn slechter. `E-vervolg` half bouwen levert een layout
op die niemand heeft getoetst en die D08 niet vraagt. De tekst laten vallen is de ene fout
die dit product zich niet kan permitteren: dan verstuur je een documentatie waarvan je denkt
dat je hem geschreven hebt. Doorschuiven van foto's is zichtbaar, telbaar en staat vooraf in
het paneel (`FR-DOC-112`, B-07).

**Gevolg.** Zes foto's plus tekst leveren twee pagina's en dus twee JPEG's, en het paneel
zegt dat vóórdat je exporteert. De DoD van D08 noemt één JPEG; dat punt is met §5.10.2 niet
te verenigen en het handboek wint (DR-01).

**Herziening.** Vervalt zodra `E-vervolg` er is (sprint 2, `FR-DOC-61` t/m `-70`). Dan geldt
§5.10.7 regel 4 weer onverkort.

---

# 13 augustus 2026 — de AI gaat naar achteren

## B-119 — De doorloop bouwt eerst alles zonder AI

**Probleem.** Vier dagen zijn opgegaan aan AI-randvoorwaarden: EU-residentie bij OpenAI die
niet bestaat voor dit account, tegoed, residentie bij Anthropic die er helemaal niet is,
providerkeuze, de grendel uit T-45. Er is in die dagen geen scherm bij gekomen. Ondertussen
zijn `O-01` — de stijlvoorbeelden — nog steeds niet geleverd, en **zonder die voorbeelden is
niet vast te stellen of de AI goed schrijft** (§12.9, bijlage A.4). We bouwen dus aan iets
dat we niet kunnen beoordelen, terwijl zeven werkopdrachten die niets met AI te maken hebben
staan te wachten.

**Besluit.** De doorloop wordt in twee blokken geknipt.

**Blok 1 — zonder AI.** D00, D01, D02, **D03**, D05, D07, D08, D09a, D09b, D11. Dit levert
een werkend documentatiegereedschap: foto's erin, tekst erbij, opmaak, export naar een
deelbare afbeelding, agenda met vier weergaven, overzicht met zoeken, dashboard.

**Blok 2 — de AI, ná de stijlvoorbeelden.** D04 (de route), D06 (laat AI meeschrijven),
D10 (mail). Deze drie beginnen pas als `O-01` er is.

**De uitzondering: D03 blijft in blok 1.** `PrivacyService` is geen AI-functie maar de
fundering eronder, hij is volledig te toetsen zonder één netwerkaanroep (`INV-30` is tekst
in, tekst uit), en het is precies wat Karin in september wil zien. Later inbouwen betekent
elke route naar de AI opnieuw langslopen — fout 1 uit §20.6.

**Waarom dit geen uitstel van het echte werk is.** §1.1.1 verdeelt de keten van 35 tot 50
minuten over vijf fasen. Drie daarvan — overzetten, opmaken en uitleveren, samen 18 tot 28
minuten — hebben niets met schrijven te maken, en dat is precies wat blok 1 wegneemt. Alleen
de schrijffase van 15 tot 25 minuten raakt AI. **Blok 1 levert dus ongeveer twee derde van de
tijdwinst op, zonder één AI-aanroep.**

Dat is ook geen nieuw idee: §1.7.2 beschrijft deze uitkomst al als de vooraf vastgelegde
uitweg — *"wat overblijft is een documentatiegereedschap met opmaak, pagina's, export, agenda
en zoeken, en dat bespaart nog steeds de achttien tot achtentwintig minuten"* — en §1.7.3
eist dat AI een functieschakelaar per module is. **Blok 1 maakt die schakelaar echt in
plaats van beloofd.** Als het gesprek met het bestuur ooit vastloopt op AI, is de uitwijk
dan geen noodplan maar de versie die er al staat.

**Wat je wél later beantwoordt.** De vraag waar het project op staat of valt — schrijft de
AI zoals jij? — blijft langer open. Dat is een echte prijs en hij staat hier eerlijk. Maar
hij was al niet te beantwoorden zonder `O-01`, dus dit besluit stelt niets uit dat vandaag
mogelijk was; het stopt alleen met de rest gijzelen.

**Gevolg voor mail.** De herschreven §6.3 is volledig AI: opdracht erin, mail eruit. Zonder
AI blijft er geen module over — een concept dat je zelf typt met een kopieerknop is een
kladblok. **D10 verhuist dus in zijn geheel naar blok 2**, inclusief de detectoren, want die
bestaan om iets af te schermen dat vervolgens verstuurd wordt. Het dashboard (D11) toont in
blok 1 daarom **drie** blokken: Deze week, Verder werken aan (alleen documentaties), en
Back-up. Aandacht en de mailconcepten komen erbij in blok 2.

**Niet besloten:** dat EduFlow permanent zonder AI verder gaat. Dat blijft een geldige versie
van dit product volgens §1.7.2, maar er is vandaag geen reden om dat te kiezen, en die keuze
hoeft pas gemaakt te worden als de meting uit §1.7.1 criterium 4 er ligt.

---

# 12 augustus 2026 — de EU-provider

## B-118 — EU-verwerking geldt vanaf de eerste echte gegevens, niet vanaf de eerste aanroep

**Probleem.** D04 strandde op het EU-eindpunt van OpenAI. De gestelde oplossing — "zet
EU data residency aan op het project" — bestaat niet als knop voor dit account.
Volgens OpenAI's eigen documentatie is regionale dataresidentie voorbehouden aan
**Enterprise-klanten die zijn goedgekeurd voor geavanceerde gegevenscontroles**, wordt hij
alleen ingesteld bij het **aanmaken van een nieuw project**, en vereist hij een aanvraag
via sales plus een aanvullende overeenkomst over bewaartermijnen. Een leerkracht met een
persoonlijk API-account komt daar niet doorheen, hoeveel tegoed hij ook opwaardeert.

Dat raakt T-06 (standaardprovider met verwerking binnen de EU) rechtstreeks, en het is
precies het punt waar §1.7.3 waarschuwt dat dit project kan vastlopen.

**Besluit.** Twee delen, en het onderscheid ertussen is het hele besluit.

1. **Tijdens de doorloop mag het wereldwijde eindpunt.** In de doorloop bestaat de app
   uitsluitend uit de verzonnen groep uit bijlage A. Twintig bedachte namen in een bedachte
   groep zijn geen persoonsgegeven; er is dus geen gegevensstroom die een EU-eis oproept.
   Dit is geen versoepeling van T-06 maar een verduidelijking van waar hij op slaat.
2. **Vóór het eerste echte kind draait de app op een EU-provider.** T-06 blijft onverkort
   gelden en is een voorwaarde in de Definition of Done, naast het gesprek met de
   functionaris (O-03).

**De grens is hard en zichtbaar.** De app weigert een AI-aanroep zodra de leerlingenlijst
iets anders bevat dan de verzonnen groep, tenzij de ingestelde provider EU-verwerking doet.
Zie T-45. Zonder die grendel is dit besluit een voornemen, en voornemens overleven een
drukke woensdag niet.

**Waarom niet stilzwijgend terugvallen.** Claude Code weigerde terecht om zonder besluit
naar het wereldwijde eindpunt te wijken. Dat is DR-04 in de praktijk. De juiste uitkomst is
niet doorbouwen zonder AI en ook niet stil omzeilen, maar dit: een besluit met een nummer,
een grens in code, en een datum waarop de echte oplossing er moet staan.

**Gevolg voor de providerkeuze.** De standaard uit T-06 kan geen OpenAI-project met
EU-residentie zijn. De twee zelfbedienbare routes die overblijven, allebei al genoemd in
§12.7:

| Route | Waarom | Wat het kost aan werk |
|---|---|---|
| **Google Vertex AI, regio `europe-west4` (Nederland)** | Zelf aan te zetten met een gewoon betaald account, geen verkoopgesprek. Verwerking in Nederland — de kortste zin in het gesprek met de functionaris | Een Google Cloud-project, Vertex AI aanzetten, een dienstaccount. Adapter `vertex-eu` staat al in §12.7 |
| **AWS Bedrock, `eu-central-1` (Frankfurt)** | Idem zelfbedienbaar, en de route naar Claude binnen de EU | Vergelijkbaar. Adapter `bedrock-eu` staat al in §12.7. Welke modellen daar beschikbaar zijn, wordt geverifieerd in de werkopdracht — niet aangenomen |
| ~~**Anthropic rechtstreeks**~~ | **Geen route.** Anthropic's eigen documentatie geeft voor de verwerkingsregio alleen `"global"` en `"us"`, en voor de opslagregio alleen `"us"` — die laatste is bovendien niet te wijzigen na het aanmaken van de werkruimte. Er is geen EU-optie, op geen enkel abonnement | — |

**Een derde route die de moeite van het meten waard is: een model op het apparaat zelf.**
Een lokaal model (bijvoorbeeld via Ollama op de laptop) is gratis en er gaat *niets* de
deur uit — geen EU-vraag, geen verwerkersovereenkomst, geen provider. Dat zou de sterkste
uitkomst zijn die dit product kan hebben: §12.13 wordt dan triviaal waar. Twee eerlijke
bezwaren: de schrijfkwaliteit in het Nederlands voor déze taak is vermoedelijk lager dan
criterium 4 uit §1.7.1 vraagt, en het vraagt een laptop die het aankan — wat de belofte
"werkt op telefoon en laptop" raakt. **Niet afwijzen op gevoel: meenemen in dezelfde
meting met de gouden testset.** Haalt het lokale model twee van de drie voorstellen
bruikbaar, dan vervalt het hele providervraagstuk.

**Gratis niveaus van cloudproviders zijn géén route.** Google zegt het zelf het duidelijkst:
op het gratis niveau wordt de inhoud gebruikt om hun producten te verbeteren, op het betaalde
niveau niet. Voor de verzonnen groep is dat onschadelijk, maar het betekent dat het gratis
niveau een doodlopende weg is die je vóór echte gegevens toch moet verlaten — en dan doe je
de verhuizing twee keer. Bovendien kost het hele doorloop-traject aan echte aanroepen
minder dan tien euro; geld is hier de schaarste niet.

**Let op — een abonnement is geen API-toegang.** Een account op claude.ai of chatgpt.com,
inclusief een onderwijs- of teacheraccount, geeft geen sleutel voor `/api/ai`. Dat is een
apart account met eigen tegoed. Dit is een veelgemaakte aanname en hij kost een avond.

**Hoe de keuze straks gemaakt wordt.** Niet op voorkeur maar met de gouden testset uit
§12.9: dezelfde ruwe notities door beide providers halen en tellen hoeveel voorstellen
bruikbaar zijn zonder herschrijven. Dat is criterium 4 uit §1.7.1 en precies waarvoor die
testset bestaat. Daarmee is de providerkeuze een meting en geen mening — en dat is ook het
antwoord als het bestuur later vraagt waarom deze en niet die.

Beide leveren een verwerkersovereenkomst die het bestuur kan tekenen — het punt waarop
§1.7.3 zegt dat het gesprek doorgaat of stopt. De keuze tussen de twee is een `T-`besluit
bij werkopdracht D04b en hoeft nu niet gemaakt te worden.

## T-45 — De grendel op de leerlingenlijst

**Besluit.** `PrivacyService.gate()` krijgt er één controle bij, náást de bestaande poort op
een lege lijst (FR-INS-20): staat de ingestelde provider niet op EU-verwerking, dan is een
AI-aanroep alleen toegestaan als de leerlingenlijst exact de verzonnen groep uit
`src/test/fixtures/testgegevens.ts` is. Wijkt hij af, dan blokkeert de app met de tekst
*"Deze provider verwerkt buiten de EU. Kies in Instellingen een EU-provider voordat je met
echte namen werkt."*

**Waarom in `PrivacyService` en niet in een scherm.** Omdat het een regel is en geen
zichtbaarheid (DR-15), en omdat elke route naar de AI door deze functie gaat (DR-31). Een
controle in het scherm is een controle die je omzeilt zodra er een tweede scherm komt.

**Toets.** Een toets met de naam `T-45` die faalt zodra er één naam buiten de verzonnen
groep in de lijst staat bij een niet-EU-provider. Die toets is het bewijs dat je aan Karin
laat zien.

---

# 11 augustus 2026 — spooknummers

## B-117 — `T-45` t/m `T-50` en `INV-54` t/m `INV-56` hebben nooit bestaan; O-11 vervalt

**Probleem.** Er stond een openstaand punt `O-11`: uitzoeken wat er achter `T-47` t/m
`T-50` en `INV-54` t/m `INV-56` zat.

**Bevinding.** Niets. Nagekeken in `product-bible-volledig.md`, alle 9.115 regels:

| Reeks | Loopt in het handboek tot | Uitgegeven daarna | Dus vrij vanaf |
|---|---|---|---|
| `T-` technische besluiten | `T-38` (§19.4) | `T-39` t/m `T-44` (B-114) | `T-45` |
| `INV-` invarianten | `INV-53` (§9.5) | geen | `INV-54` |

`T-45` t/m `T-50` en `INV-54` t/m `INV-56` komen in geen enkel hoofdstuk voor, ook niet als
verwijzing. Ze zijn nooit uitgegeven en er is dus ook niets verloren gegaan.

**Besluit.** `O-11` vervalt; er valt niets uit te zoeken. Elke plek in de repo die naar een
van deze nummers verwijst, is een verwijzing naar iets dat niet bestaat en wordt zo
behandeld: **òf hij krijgt een echt nummer uit dit register, òf de verwijzing gaat eruit.**
Niet: het nummer alsnog een betekenis geven die erbij past — dan schrijf je de
onderbouwing achteraf naar de code toe, en dat is precies omgekeerd (DR-01).

**Waarom dit gebeurde.** Dezelfde oorzaak als de drie eerdere nummerbotsingen en als de
verzonnen verwijzing naar §19.5: er was geen plek waar stond welk nummer als laatste was
uitgegeven, dus werd er geraden. Sinds B-114 staat dat bovenaan dit bestand. Dit is het
laatste spoor van de oude werkwijze, geen nieuw probleem.

**Vind ze zo:**

```
git grep -nE "\b(T-4[5-9]|T-50|INV-5[4-9]|INV-6[0-9])\b"
```

---

# 11 augustus 2026 — vier keuzes uit de tweede D00-ronde

## B-114 — Eén register geeft nummers uit, en hoofdstuk 19 is gesloten

**Probleem.** Voor de derde keer in een week botsen besluitnummers. §19.2 loste dit op
7 augustus al een keer op, en het gebeurde opnieuw: de eerste versie van dit bestand gaf
`B-81` t/m `B-91` en `T-32` t/m `T-37` uit, terwijl hoofdstuk 19 tot en met `B-97` en
`T-38` loopt. Alle zeventien botsten.

**Besluit.** Drie dingen, en het derde is het enige dat het echt oplost.

1. **Hoofdstuk 19 is gesloten** per 7 augustus 2026. Het is de historische lijst. Er komt
   nooit meer een nummer bij.
2. **Dit bestand is de enige uitgifteplek.** De nummering loopt door: `B-103` en verder,
   `T-39` en verder. De genoemde nummers zijn hernummerd; er is niets aan de bestaande
   besluiten van vóór 8 augustus veranderd, want daar wordt in code, commits en toetsen
   naar verwezen (DR-57).
3. **Bovenaan dit bestand staat het laatst uitgegeven nummer.** Wie een nummer nodig heeft,
   leest die regel, neemt de volgende, en werkt de regel bij. Eén regel, één handeling.

**Waarom niet hernummeren of samenvoegen.** Hernummeren van bestaande besluiten breekt elke
verwijzing in commit-boodschappen, codecommentaar en toetsnamen — DR-57 vraagt juist om die
verwijzingen. Samenvoegen tot één bestand maakt een document van 300 besluiten dat niemand
meer opent. Een gesloten archief plus een lopend register is de kleinste oplossing die het
probleem echt wegneemt (U-05).

**Gevolg.** `B-81`→`B-103`, `B-82`→`B-104`, `B-83`→`B-105`, `B-84`→`B-106`, `B-85`→`B-107`,
`B-86`→`B-108`, `B-87`→`B-109`, `B-88`→`B-110`, `B-89`→`B-111`, `B-90`→`B-112`,
`B-91`→`B-113`. `T-32`→`T-39` tot en met `T-37`→`T-44`. Alle verwijzingen in `docs/` zijn
meegewijzigd.

## B-115 — De basisweek blijft, maar wordt geen tweede mechanisme

**Probleem.** De repo kent een basisweek: het vaste weekrooster van de groep. B-107 zet
daarnaast herhalende afspraken in de agenda. Twee mechanismen voor één probleem is precies
wat U-05 en DR-03 verbieden, maar de basisweek weggooien haalt het handigste stuk eruit —
je vult je gymles, je muziekles en je bouwvergadering één keer in en niet twintig keer.

**Besluit.** **De basisweek is een invoerscherm, geen tweede gegevensmodel.** Je vult er je
vaste week in, en de app maakt daar gewone herhalende agenda-items van. Daarna gedragen ze
zich als elk ander item: verplaatsbaar, te wijzigen met "alleen deze of alle volgende"
(`FR-AGE-15`), en ze gaan mee in de ICS-export.

**Waarom.** Eén mechanisme onder de motorkap, één snelle route erboven. Een basisweek die
zijn eigen records heeft, betekent dat elke functie — verplaatsen, exporteren, meldingen,
zoeken — twee keer gebouwd en twee keer getoetst moet worden, en dat de twee stilletjes uit
elkaar lopen.

**Gevolg.** De basisweek krijgt `FR-AGE-29` t/m `FR-AGE-31` (zie hieronder) en hoort bij
werkopdracht D09b, niet bij D09a. Bestaande code die een eigen basisweek-record schrijft,
wordt in D09b omgezet naar het genereren van herhalende items.

> **Als "basisweek" in jouw repo iets anders betekent dan het vaste weekrooster van de
> groep, zeg dat dan — dan herzie ik dit besluit.** De rest van de redenering blijft
> staan: één mechanisme, en het handige scherm erboven.

### Nieuwe eisen

**FR-AGE-29 — De basisweek is een invoerscherm.** *Gegeven* Instellingen → Agenda →
Basisweek, *wanneer* je een vast onderdeel invult met dag, tijd en naam, *dan* maakt de app
een wekelijks herhalend agenda-item voor de duur van het schooljaar.

**FR-AGE-30 — Een gegenereerd item is een gewoon item.** *Gegeven* een item uit de
basisweek, *dan* is het te verplaatsen, te wijzigen en te verwijderen zoals elk ander item,
met dezelfde vraag "alleen deze, of alle volgende?" (`FR-AGE-15`).

**FR-AGE-31 — De basisweek is zichtbaar als herkomst, niet als eigenaar.** *Gegeven* een
gegenereerd item, *dan* toont het detailvenster "uit je basisweek" als herkomst. Wijzig je
de basisweek daarna, *dan* raakt dat de reeds gewijzigde items niet.

## B-116 — Radix blijft; er komt geen tweede componentbibliotheek

**Probleem.** `components/ui/` bevat negentien primitieven in shadcn-vorm, gebouwd op
Radix. De vraag is of `ui/` daarop verder gaat of overstapt naar Base UI.

**Besluit.** **Radix blijft.** Er komt geen tweede bibliotheek en geen migratie.

**Waarom.** De bewijslast ligt bij het wisselen, niet bij het houden. DR-18 vraagt een
`T-`besluit met een reden voor een nieuwe afhankelijkheid, en "nieuwer" is geen reden.
Negentien primitieven omzetten is een week werk waarvan geen enkele eis in hoofdstuk 6 of
17 beter wordt, en het zou midden in de doorloop gebeuren, terwijl de mappen ook al
verhuizen. Twee verbouwingen tegelijk in dezelfde bestanden is hoe je een weekend verliest
zonder te weten waaraan.

**Gevolg.** `claude-design/BRIEF.md` krijgt de regel dat componenten op de bestaande
Radix-primitieven gebouwd worden en niet vanaf nul. Anders levert Claude Design straks een
bibliotheek die niet past op wat er al staat — en dan is het alsnog een migratie, maar dan
per ongeluk.

## Over de hergebruikte FR-nummers

Volgt uit B-115. Elk `FR-`nummer dat in de repo is verzonnen en niet in hoofdstuk 6 staat,
verhuist naar de vrije ruimte van zijn eigen module — voor de agenda is dat `FR-AGE-29` en
verder, want `FR-AGE-01` t/m `-28` zijn vergeven. Dezelfde regel als bij de besluiten:
**hoofdstuk 6 is de bron, en een nummer dat daar niet staat, bestaat niet.** Claude Code
levert de omzettabel als onderdeel van D09b.

---

# 11 augustus 2026 — naar aanleiding van de D00-inventarisatie (PR #36)

## T-42 — Getypte lintcontrole komt in sprint 6, niet nu

**Probleem.** De meegeleverde `eslint.config.mjs` zette `recommendedTypeChecked` aan en
liet `eslint-config-next` vallen. Gevolg: `pnpm lint` ging van exit 0 naar 48 fouten en 8
waarschuwingen. Die 48 zijn geen nieuwe fouten — het zijn bestaande plekken die een
strengere controle nu ziet. Ze repareren is een opschoonactie, en D00 verbiedt die
expliciet.

**Besluit.** `recommendedTypeChecked` wordt teruggezet naar `recommended`.
`eslint-config-next` komt terug. De regels die geen typeinformatie nodig hebben blijven
wél op `error`: `no-explicit-any` (DR-21), `ban-ts-comment` (DR-22), de zones van DR-11,
en `no-restricted-syntax` voor DR-32, DR-37 en DR-42. Getypte controle komt in sprint 6,
samen met NFR-47.

**Waarom.** Een codebase van 35 pull requests voor het eerst getypt linten is een eigen
project. Met 48 rode meldingen als vertrekpunt is "lint is groen" geen poort meer, en dan
is elke verplaatsing in D00 blind.

## T-43 — Drie ontbrekende afhankelijkheden vastleggen

**Probleem.** `@eslint/js`, `typescript-eslint` en `eslint-plugin-import` staan alleen in
`node_modules` en niet in `package.json`. Lint werkt bij toeval; `pnpm install
--frozen-lockfile` op een andere machine breekt.

**Besluit.** Alle drie als `devDependencies` vastleggen, plus
`eslint-import-resolver-typescript`. Dit is de `T-`goedkeuring die DR-18 vraagt.

## T-44 — `tokens.css` wordt ingelezen door `globals.css`

**Probleem.** `src/ui/tokens.css` heeft nul importeurs; `globals.css` draait actief met
eigen vaste waarden. Twee bronnen voor dezelfde waarden is fout 2 uit §20.6.

**Besluit.** `globals.css` begint met `@import "../ui/tokens.css";`. De vaste waarden erin
worden vervangen door tokens tijdens stap 2 van D00, wanneer `components/ui/` toch naar
`ui/` verhuist. Niet eerder, want dan is het een wijziging vermomd als verplaatsing.

## B-110 — `StorageWarning.tsx` wordt verwijderd

**Probleem.** Nul importeurs, en het enige echte laagconflict in de repo: het haalt
gegevens op uit `services/storage/` terwijl het in `ui/` thuishoort, waar dat niet mag.

**Besluit.** Verwijderen, in de stap waarin `components/common/` verhuist.

**Waarom.** Dood hout dat bovendien de enige blokkade voor stap 3 is. **Dit verwijdert de
eis niet:** `FR-INS-34` (waarschuwing bij 80% opslaggebruik) staat in sprint 6 en wordt
daar opnieuw gebouwd, dan wel goed — het scherm toont, de service meet.

## B-111 — De schil hoort bij `app/`, niet bij `ui/`

**Probleem.** `components/layout/` (AppShell, Sidebar, Topbar, BottomNav, navigatiedata)
importeert de navigatie van Next. §10.2 wijst geen plek aan. In `ui/` zetten maakt het
ontwerpsysteem raamwerkbewust.

**Besluit.** `src/app/(app)/_shell/`. Daarmee blijft `ui/` los te bekijken en te bouwen —
precies wat Claude Design nodig heeft om componenten te tonen zonder de app te starten.

**Aanvulling op §10.2:** er komt één map bij, `src/app/providers/`, voor React-context die
diensten in de boom hangt. Daar gaat `useDienst` heen. `services/` blijft daarmee vrij van
React (DR-17) en de composition root `services/diensten.ts` blijft waar hij is.
`useAutosave` gaat naar `modules/documentaties/hooks/`, zoals §10.2 al voorschrijft.

## B-112 — Eén plek voor testgegevens, samengevoegd in D01

**Probleem.** `domain/toetsgegevens.ts` (418 regels, 8 importeurs) en
`test/fixtures/testgegevens.ts` (228 regels, 0 importeurs) bevatten allebei testgegevens.
`domain/` is voor typen, schema's en invarianten — niet voor gegevens.

**Besluit.** De blijvende plek is `src/test/fixtures/`. **Bijlage A is normatief voor de
inhoud:** de twintig namen van Groep 4 — De Regenboog, de drie reeksen en de drie groepen
staan vast omdat elke naam een geval dekt dat `PrivacyService` moet aankunnen. Samenvoegen
gebeurt in D01, niet in D00 — daar worden de domeintypen toch aangeraakt. Tot die tijd komt
er geen nieuwe importeur bij op `domain/toetsgegevens.ts`.

## B-113 — De routewijziging gaat naar een eigen werkopdracht, ná D01

**Probleem.** Stap 6 van de inventarisatie (de `(app)`-groep en Nederlandse routenamen, 12
routes en ±18 padteksten) is de enige stap die zichtbaar kapot kan gaan. `DocumentEditor`
bouwt zijn pad op met een sjabloontekenreeks; geen zoek-en-vervang vindt die heel, en als
hij breekt maakt een tweede keer opslaan een tweede documentatie aan.

**Besluit.** Stap 6 wordt werkopdracht `D00b-routes.md` en gebeurt **ná D01**.

**Waarom.** Na D01 is `FR-DOC-01` ("een documentatie ontstaat bij de eerste inhoud")
afgedwongen in `DocumentationService` en niet meer in een scherm. Een verkeerd pad kan dan
hoogstens een navigatiefout geven en geen dubbel record. Dezelfde stap, hetzelfde werk,
maar het ergste gevolg is weg.

## Correctie op D00 stap 3 — de aanname klopte niet

D00 stap 3 voorspelde honderden laagmeldingen die je eerst op `warn` zou zetten. De teller
staat op nul: de veertien zones wijzen naar `./ui`, `./modules/documentaties` en
`./modules/instellingen`, en die mappen heten vandaag `components`, `documentation` en
`settings`. De regels grijpen dus nergens aan.

**De inventarisatie heeft gelijk en D00 stap 3 had ongelijk.** De zones blijven op
`error`. Verwacht dat het getal tijdens elke verplaatsing tijdelijk oploopt — dat is het
bewijs dat de zone eindelijk aangrijpt — en aan het eind van die stap weer op nul staat.
Stap 3 van D00 is hierop herschreven.

---

# 11 augustus 2026 — na de afwijzing van Microsoft 365

## B-106 — De mailmodule krijgt geen postbus

**Probleem.** De aanvraag voor beheerdersgoedkeuring op Microsoft 365 is afgewezen. §6.3
stond volledig op een gekoppelde postbus: lezen, samenvatten, een concept terugschrijven.
Zonder goedkeuring bestaat die module niet, en een tweede aanvraag lost niets op — het is
de organisatie die zegt dat een externe toepassing geen postbustoegang krijgt.

**Besluit.** De module Mail wordt herschreven tot wat hij zonder koppeling kan zijn: **je
geeft een opdracht in gewone taal, de AI levert een mail met onderwerp en tekst, jij
kopieert hem naar je eigen mailprogramma.** Geen postvak, geen OAuth, geen tokens, geen
adapters. Gmail vervalt in hetzelfde besluit: één mailroute of geen — twee adapters
onderhouden voor een module die in beide gevallen op dezelfde muur stuit, is werk zonder
uitkomst.

**Waarom.** Dit is de helft van §1.1.4 waar de app wél iets aan kan doen. Het terugvinden
en lezen van de mail waar je op antwoordt, kan Outlook prima; wat Outlook niet kan is de
toon kiezen, en dat was toch al het zware deel — twaalf tot twintig minuten per mail, en
het zwaarste deel is niet het typen.

**Gevolg.** §6.3 is herschreven. Elf eisen zijn ingetrokken (`FR-MAI-01`, `-03` t/m `-11`,
`-14`); zie de tabel in §6.3.7. `T-15` (tokenopslag) vervalt. `T-30` en `DR-42` blijven
staan: het schrappen van een controle vereist een besluit, en DR-42 is nu triviaal te
handhaven. Het blok *Postvak* verdwijnt uit het dashboard, dat daarmee vier blokken heeft.
De vijf AI-bewerkingen die door B-04 naar versie 1.1 waren geschoven, komen terug in 1.0
(`FR-MAI-36`) — de module is nu klein genoeg om ze te dragen.

**Wanneer dit terugkomt.** §13.6: bij meer dan tien gebruikers binnen één bestuur, met een
bestaande verwerkersovereenkomst, en met een ICT-coördinator die de goedkeuring namens de
organisatie aanvraagt in plaats van namens een leerkracht. Dat is fase 2.

## B-107 — De agenda wordt een volwaardige agenda

**Probleem.** §18.3 verdeelde de agenda over sprint 4 en liet dag- en weekweergave,
herhalingen, slepen en het snelveld daar staan. Met de agenda als volwaardig onderdeel van
het programma is een maandweergave zonder herhalingen geen agenda maar een overzicht.

**Besluit.** Alle vier de weergaven (dag, week, maand, jaar), herhalende afspraken, slepen
om te verplaatsen en de snelinvoer in gewone taal komen in de doorloop. De agenda moet
aanvoelen als de agenda-app die de gebruiker al kent.

**Waarom.** Een agenda die je naast je echte agenda moet gebruiken, gebruik je niet. Dat
is faalscenario drie uit §1.7.4 in zijn zuiverste vorm: een tweede plek om iets in te
vullen.

**Gevolg.** Werkopdracht D09 valt uiteen in D09a (weergaven en vakanties) en D09b
(afspraken, herhalen, verplaatsen, snelveld). De doorloop groeit van ±15 naar ±18
dagdelen. Sprint 4 uit §18.3 wordt daarmee grotendeels leeg en verschuift naar afwerken:
ICS, verjaardagen, en de koppelingen naar documentatie en mail.

## B-108 — Meldingen alleen terwijl de app open is

**Probleem.** "Misschien via het web meldingen kunnen geven?" Het antwoord is
ongemakkelijker dan het lijkt. De **Notification Triggers API** — de enige manier om een
melding lokaal in te plannen die afgaat terwijl de app dicht is — is door Chrome
definitief gestaakt; de reden die het Chrome-team zelf geeft, is dat een geannuleerde
afspraak niet betrouwbaar uit de wachtrij te halen was. **Web Push** werkt wel, ook op
iOS sinds 16.4 en alleen voor een webapp op het beginscherm — wat B-02 toch al eist —
maar loopt altijd via een pushdienst. Dat betekent een server die weet *wanneer* jouw
afspraak is.

**Besluit.** EduFlow toont meldingen via de Notification API, maar **alleen terwijl de app
in een tabblad open staat**, ook op de achtergrond. Er komt geen pushserver en dus geen
melding als de app dicht is. In Instellingen → Agenda staat dat er letterlijk bij, met de
verwijzing naar de ICS-export.

**Waarom.** De variant met een pushserver was verdedigbaar — een server die alleen een
tijdstip en een apparaat-abonnement bewaart en een melding zonder inhoud stuurt, leert
niets over een kind. Maar het is een derde server, een derde gegevensstroom, een extra
gesprek met de functionaris en een afhankelijkheid die kapot kan op een moment dat je het
niet merkt. Voor een eenmansproject in de doorloopfase weegt dat niet op tegen de winst,
zeker niet omdat er een betere route is die niets kost.

**Gevolg.** `FR-AGE-25` is herschreven, `FR-AGE-27` en `FR-AGE-28` zijn toegevoegd. De
eerlijke tekst in Instellingen is onderdeel van het besluit, niet een toelichting erop: een
gemiste herinnering waarvan je dacht dat hij zou komen, is erger dan een herinnering die je
nooit verwachtte.

**De route die wél werkt.** De ICS-export (`FR-AGE-20`) zet je schooljaar in de agenda-app
van je telefoon, en díé geeft meldingen — beter dan een webapp ooit gaat doen, en zonder
dat er iets naar een server gaat. `FR-AGE-27` maakt dat expliciet: na een wijziging toont
het agendascherm hoeveel items er zijn veranderd en biedt een nieuwe export aan. De
stabiele `UID` uit `FR-AGE-20` zorgt dat de tweede import geen dubbelen maakt.
**EduFlow bezit het schooljaar; de telefoon doet het klokwerk.**

## B-109 — Het plakveld voor een ontvangen mail, met verplichte detectoren

**Probleem.** Zonder postbus zal de leerkracht die op een oudermail wil antwoorden, die
mail ergens in de app plakken. §1.4.4 wijst een chatbot af met precies dit argument: *een
leeg invoerveld nodigt uit tot plakken, en wat er geplakt wordt is een oudermail met een
achternaam, een telefoonnummer en de naam van een behandelaar.*

**Besluit.** Er komt een apart veld **"De mail waarop je antwoordt"**, met de detectoren
uit `FR-MAI-24` die dráíen zodra je plakt — vóór de knop, vóór de aanroep, vóór het
controlescherm — en die tonen wat ze hebben gevonden. Het controlescherm blijft hier niet
over te slaan (`FR-MAI-12`). Het plakveld wordt niet opgeslagen (`FR-MAI-35`).

**Waarom.** De keuze is niet óf het gebeurt, maar of het gebeurt in een veld dat erop
voorbereid is of in een veld dat er niets mee doet. Een bekend risico met een vangnet is
beter dan hetzelfde risico verstopt in een opdrachtveld.

**Gevolg.** `FR-MAI-33` t/m `FR-MAI-35` toegevoegd. `services/privacy/detectors.ts` komt in
de doorloop en niet in sprint 5. In het gesprek met de functionaris is dit één regel:
*"wij lezen geen postbus; wij hebben één veld waar de gebruiker zelf een mail in kan
plakken, en dit is wat daar gebeurt."*

## T-41 — De mailadapters vervallen, de servicevorm blijft

**Besluit.** `services/mail/adapters/` vervalt; `MailService` houdt zijn plek in de
lagenstructuur maar heeft geen poort meer naar buiten. De nepmap uit werkopdracht D10 is
niet meer nodig en `src/data/nepmap.json` komt er niet.

**Waarom.** De service blijft bestaan omdat de regels (sjablonen, concepten, de
detectoren aanroepen, het controlepad) ergens moeten wonen en niet in een scherm horen
(DR-15). Alleen de buitenkant valt weg.

---

# 11 augustus 2026 — de doorloop

## B-103 — De nulmeting blokkeert de bouw niet

**Probleem.** §1.6.1 zegt: *"Pas als die twaalf metingen compleet zijn, begint sprint 1"* —
en de nulmeting loopt van 24 augustus tot en met 18 september 2026. §18.2 zet sprint 1 op
11 augustus tot 14 september. Die twee kunnen niet allebei waar zijn, en de strengste
lezing kost vijf weken bouwtijd.

**Besluit.** De bouw start op 11 augustus. De nulmeting loopt van 24 augustus tot 18
september volgens hetzelfde protocol, maar hij meet de *huidige* werkwijze en heeft de
app dus niet nodig. Voorwaarde: de twaalf gemeten documentaties worden op de oude manier
gemaakt, niet in EduFlow, ook niet gedeeltelijk.

**Waarom.** De nulmeting bestaat om de belofte breekbaar te maken. Dat doel wordt gehaald
zolang de twaalf metingen zuiver zijn; het wordt niet beter door er ook nog de bouw op te
laten wachten. Wachten kost daarentegen wél de enige meetperiode van dit schooljaar
(§1.8.1) en schuift het gesprek met de functionaris gegevensbescherming van september
naar december.

**Gevolg.** §1.6.1 wordt aangepast: "Pas als die twaalf metingen compleet zijn, begint
sprint 1" vervalt en wordt "De twaalf metingen worden op de oude manier gemaakt, ook als
de bouw al is begonnen." §18.2 blijft ongewijzigd.

## B-104 — Een doorloop vóór de sprints

**Probleem.** De sprintvolgorde uit §18.3 bouwt module voor module diep uit. Het product
als geheel is daarmee pas in sprint 6 (april 2027) voor het eerst te zien of te tonen.
Twee dingen breken daarop: de motivatie van een eenmansproject, en §1.5.5, dat Karins
moment op *één middag in september 2026* zet — met een werkende app op het scherm.

**Besluit.** Vóór sprint 1 komt een **doorloop** (v0.1): alle vijf de modules dun maar
echt werkend, in tien werkopdrachten. Daarna gaan de sprints uit §18.3 door in dezelfde
volgorde, maar op een fundament dat al is gezien.

**Waarom.** De architectuur uit hoofdstuk 10 blijkt pas te kloppen als er vijf modules op
staan; dat in sprint 5 ontdekken is duur. En het FG-gesprek verschuift van december naar
september, wat de poort met drie maanden vervroegt.

**Gevolg.** §18.2 krijgt een fase vóór sprint 1. De werkopdrachten staan in
`docs/werkopdrachten/`. Wat in de doorloop bewust dun blijft, staat in werkopdracht
`README.md` en komt terug in de sprint waar het hoort.

## B-105 — Twee Definitions of Done

**Probleem.** De acht punten uit §18.6 bevatten een zelfreview van minstens 24 uur later
(B-80) en één werkdag echt gebruiken. Toegepast op elke stap van de doorloop kost elke
werkopdracht minimaal twee kalenderdagen, ongeacht zijn omvang.

**Besluit.** De doorloop kent een eigen Definition of Done met drie punten: het draait
zonder fouten in de console, de geautomatiseerde toetsen zijn groen, en de opdrachtgever
heeft het één keer zelf gedaan met de verzonnen groep. De acht punten uit §18.6 gelden
onverkort vanaf v0.9 en zijn hoe dan ook verplicht vóór het eerste echte kind.

**Waarom.** De acht punten zijn niet te streng, ze zijn te streng voor deze fase. Punt 5
(nieuwe gegevensstroom besproken met de functionaris) blijft ook in de doorloop gelden,
want dat is geen kwaliteitspoort maar een grens.

## T-39 — De hoofdstukken zijn de bron, de monoliet is de archiefkopie

**Besluit.** Het handboek staat als losse hoofdstukken in `docs/`. `product-bible-volledig.md`
blijft bestaan voor menselijke lezers en voor de functionaris gegevensbescherming, maar
wordt tijdens een fase niet bijgewerkt; hij wordt aan het eind van elke fase opnieuw
samengesteld.

**Waarom.** Een AI-programmeur die 9.115 regels moet doorzoeken, leest in de praktijk een
willekeurige selectie. Verwijzen naar één hoofdstuk van 300 regels is het verschil tussen
raden en lezen.

**Gevolg.** DR-01 blijft gelden op hoofdstukniveau. `CLAUDE.md` verbiedt expliciet het
lezen van de monoliet.

## T-40 — De ontwerptekens komen vóór de componenten

**Besluit.** `src/ui/tokens.css` wordt in week 0 volledig ingevuld uit §5.3 t/m §5.6 —
alle kleuren, ruimtes, letters, stralen, schaduwen, maten, lagen en duren, licht en
donker. Componenten worden pas daarna gebouwd, en uitsluitend met tokens (DR-55).

**Waarom.** Vaste waarden die eenmaal in twintig componenten staan, komen er niet meer uit.
De donkere modus uit §18.4 is dan een tweede verbouwing in plaats van één regel.

---

# Openstaand

> **Nummering gecorrigeerd op 11 augustus 2026.** Dit blok gebruikte eerst `O-01` t/m
> `O-04` opnieuw, terwijl §19.5 die nummers al vergeven heeft aan `O-01` t/m `O-07`. Dat
> is precies de botsing die §19.2 op 7 augustus heeft opgeruimd, en hij was hier per
> ongeluk teruggezet. Hieronder gelden de nummers uit §19.5; alleen wat écht nieuw is,
> krijgt een nieuw nummer vanaf `O-08`.

- **O-01 — Stijlvoorbeelden** *(§19.5, ongewijzigd)*. Drie of vier paren van een ruwe
  notitie, de gewenste documentatie en een doorgeschoten versie, met verzonnen namen
  (§12.9, FR-INS-16). **Dit is de enige openstaande post die alleen de opdrachtgever kan
  invullen, en zonder deze voorbeelden is de Definition of Done op het punt AI-kwaliteit
  niet in te vullen.**
- **O-03 — Gesprek functionaris gegevensbescherming** *(§19.5)*. Door B-104 verschuift het
  moment van december naar september 2026: zodra de doorloop staat, niet later
  (§1.5.5, §15.6).
- **O-05 — Nulmeting** *(§19.5)*. Twaalf documentaties handmatig geklokt, 24 augustus tot
  18 september 2026. Door B-103 blokkeert dit de bouw niet meer.
- **O-06 — Vakantiebestand vullen** *(§19.5)*. Drie regio's, met versienummer en
  `validUntil` (§13.4). §19.5 zegt "vóór sprint 4"; door B-107 is dat vervroegd naar
  **vóór werkopdracht D09a**. De schooljaren 2026-2027 en 2027-2028 volstaan voor nu.
- ~~**O-08 — Beheerdersgoedkeuring Microsoft 365.**~~ **Afgesloten op 11 augustus 2026:
  afgewezen.** Zie B-106. Dit staat er doorgestreept en niet verwijderd, omdat een
  openstaand punt dat verdwijnt zonder uitkomst er over een jaar uitziet als vergeten werk.
- **O-09 — De bestaande repository naar §10.2.** De repository is 35 pull requests diep;
  de opzet-opdracht in `SETUP.md` ging uit van een leeg project. Zie werkopdracht
  `D00-bestaande-repo.md`, die die opdracht vervangt.
