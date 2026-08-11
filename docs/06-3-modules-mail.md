<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

# Hoofdstuk 6.3 — Mail

### 6.3 Mail

#### 6.3.1 Wat de module is, en de belofte die eronder ligt

De module Mail leest je werkpostbus, vat berichten samen, helpt antwoorden opstellen, en levert het resultaat af als concept in je eigen mailprogramma of op je klembord. Versturen doe jij (B-19).

Het uitgangspunt "AI verstuurt nooit zelfstandig informatie naar derden" (U-01) is in deze module geen belofte maar een technische eigenschap. EduFlow vraagt bij Microsoft en Google **geen enkel verzendrecht** aan (B-20). Er zit geen verzendcode in de app; als iemand de code zou aanpassen om te versturen, zou de toestemming ontbreken en zou de aanroep worden geweigerd door de identiteitsaanbieder, niet door EduFlow.

Dat is controleerbaar en dat is het punt. In Instellingen → Mail staat de exacte lijst aangevraagde rechten, met de zin: "EduFlow heeft geen recht om mail te versturen. Je kunt dit controleren in je Microsoft-account onder Toepassingen." Voor de functionaris gegevensbescherming is dit het verschil tussen een leverancierbelofte en een aantoonbare grens (zie hoofdstuk 15).

**FR-MAI-01 — De app vraagt geen verzendrecht aan.**
*Gegeven* de koppelstroom, *wanneer* de toestemmingspagina van de aanbieder verschijnt, *dan* staat "Mail verzenden" er niet bij en bevat de aanvraag uitsluitend de rechten uit 6.3.2.

**FR-MAI-02 — Er is geen verzendknop.**
*Gegeven* een afgerond mailconcept, *wanneer* je de onderbalk bekijkt, *dan* staan er twee knoppen: "Als concept in je mailprogramma" en "Kopieer". Er is geen derde.

#### 6.3.2 Een postbus koppelen

Twee aanbieders in versie 1.0: Microsoft 365 (Microsoft Graph) en Google Workspace (Gmail API). Beide via OAuth 2.0 met PKCE (T-15). De autorisatiecode wordt op de server ingewisseld; de tokens komen nooit in de browser.

| Aanbieder | Aangevraagde rechten | Waarvoor |
|---|---|---|
| Microsoft | `offline_access` | vernieuwen zonder opnieuw inloggen |
| Microsoft | `User.Read` | je naam en adres tonen |
| Microsoft | `Mail.Read` | berichten lezen |
| Microsoft | `Mail.ReadWrite` | een concept in je eigen postbus schrijven |
| Google | `openid`, `email`, `profile` | je naam en adres tonen |
| Google | `gmail.readonly` | berichten lezen |
| Google | `gmail.compose` | een concept in je eigen postbus schrijven |

`Mail.ReadWrite` en `gmail.compose` geven schrijfrecht op je eigen postbus, niet het recht om te versturen. Dat onderscheid is in beide platformen expliciet: versturen vraagt `Mail.Send` respectievelijk `gmail.send`, en die staan er niet bij.

**FR-MAI-03 — De rechten staan in gewone taal vóór de koppeling.**
*Gegeven* de knop "Koppel postbus", *wanneer* je erop tikt, *dan* verschijnt eerst een scherm met per recht één zin in gewone taal en de zin over het ontbrekende verzendrecht, en pas daarna de aanbieder.

**FR-MAI-04 — Een beheerder kan nodig zijn.**
*Gegeven* een organisatie die toestemming door de gebruiker heeft uitgeschakeld, *wanneer* de koppeling daarop stukloopt, *dan* toont de app de foutmelding in gewone taal plus de gegevens die de ICT-beheerder nodig heeft: toepassingsnaam, toepassings-id, de vier rechten en het antwoordadres, met een kopieerknop.

**FR-MAI-05 — Ontkoppelen wist alles.**
*Gegeven* een gekoppelde postbus, *wanneer* je "Ontkoppel" kiest, *dan* worden het vernieuwingstoken ingetrokken bij de aanbieder, de cookie gewist, en alle records in `mailMessages` en `mailAccounts` verwijderd. Mailconcepten blijven, want die zijn van jou. De app bevestigt met een telling: "12 gecachte berichten verwijderd."

**FR-MAI-06 — Tokens staan niet in de browseropslag.**
*Gegeven* een geldige koppeling, *wanneer* je `localStorage`, `sessionStorage` en IndexedDB bekijkt, *dan* staat er geen toegangs- of vernieuwingstoken. Ze staan versleuteld in een `httpOnly`-cookie met `SameSite=Lax` en `Secure`. Volgt uit T-15 en T-01.

#### 6.3.3 Het postvak

Het postvak is bewust smal. Eén map tegelijk (Postvak IN standaard, met een kiezer voor andere mappen), de laatste dertig dagen, maximaal 200 berichten, met "meer laden". Kolommen: afzender, onderwerp, eerste regel, datum, markering. Geen conversatieweergave, geen labels, geen slepen, geen verwijderen, geen markeren als gelezen — dat laatste zou de postbus veranderen zonder dat je dat in EduFlow verwacht.

**FR-MAI-07 — EduFlow wijzigt niets aan je berichten.**
*Gegeven* een bericht dat je in EduFlow opent, *wanneer* je terugkijkt in Outlook, *dan* staat het nog steeds als ongelezen als het dat was. EduFlow schrijft alleen concepten.

**FR-MAI-08 — Zoeken gaat naar de aanbieder.**
*Gegeven* een zoekopdracht in het postvak, *wanneer* je hem uitvoert, *dan* wordt hij via de server doorgegeven aan Graph of Gmail en worden alleen de resultaatkoppen getoond. De zoekterm wordt niet opgeslagen.

#### 6.3.4 De cache

**FR-MAI-09 — Alleen wat je opent wordt bewaard.**
*Gegeven* een lijst met 200 koppen, *wanneer* je er drie opent, *dan* staan alleen die drie volledig in `mailMessages`. Koppen worden in het geheugen gehouden en niet weggeschreven.

**FR-MAI-10 — De cache vervalt na zeven dagen.**
*Gegeven* een gecacht bericht van acht dagen oud, *wanneer* de app start, *dan* is het verwijderd. De opruiming draait bij elke start en elk uur.

**FR-MAI-11 — Bijlagen worden nooit opgehaald.**
*Gegeven* een bericht met bijlagen, *wanneer* je het opent, *dan* worden alleen de namen en formaten getoond. De inhoud wordt niet opgehaald, niet opgeslagen en niet naar de AI gestuurd.

#### 6.3.5 Een bericht samenvatten

Dit is de gevaarlijkste handeling van de hele app en hij krijgt daarom de zwaarste beveiliging. Een ontvangen oudermail bevat vrijwel altijd gegevens die niet in je leerlingenlijst staan: de achternaam van het kind, de naam van de ouder, een telefoonnummer, soms een adres of een medische opmerking.

De volgorde is vast:

1. Je opent het bericht. Er gaat nog niets weg.
2. Je tikt op "Vat samen".
3. `PrivacyService` haalt de tekst door de leerlingenlijst **en** door de extra detectoren uit 6.3.10, inclusief de aanhef, de ondertekening en de handtekeningblokken.
4. Het controlescherm "Bekijk wat er verstuurd wordt" opent **verplicht** — hier is het niet overslaanbaar zoals bij documentatie. Je ziet de vervangen tekst met de codes gemarkeerd, en een teller: "7 gegevens afgeschermd."
5. Je bevestigt, of je markeert extra stukken als af te schermen, of je annuleert.
6. Pas dan gaat de tekst weg.

**FR-MAI-12 — Het controlescherm is bij mail niet overslaanbaar.**
*Gegeven* een samenvatverzoek, *wanneer* je op "Vat samen" tikt, *dan* verschijnt het controlescherm altijd, ook als je bij documentatie hebt gekozen het over te slaan. Er is geen instelling die dit uitzet.

**FR-MAI-13 — Je kunt zelf tekst afschermen.**
*Gegeven* het controlescherm, *wanneer* je een stuk tekst selecteert en op "Scherm af" tikt, *dan* wordt het vervangen door `[AFGESCHERMD-n]` en blijft die keuze gelden voor dit bericht.

**FR-MAI-14 — De samenvatting levert punten op, geen proza.**
*Gegeven* een oudermail van 400 woorden, *wanneer* de samenvatting terugkomt, *dan* bestaat hij uit maximaal vijf punten: waar het over gaat, wat er gevraagd wordt, welke datum of termijn erin staat, welke toon de afzender heeft, en wat een antwoord zou moeten bevatten. Namen zijn teruggezet naar de echte namen.

**FR-MAI-15 — De AI voegt niets toe.**
*Gegeven* een samenvatting, *wanneer* die een feit bevat dat niet in het bericht staat, *dan* is dat een fout die de gouden testset moet vangen (zie §12.9). De systeeminstructie verbiedt het toevoegen van feiten expliciet.

#### 6.3.6 Een antwoord opstellen

**Sjablonen.** Een sjabloon is drie dingen bij elkaar: een naam, een set vaste instructies voor de AI (bijvoorbeeld "houd het onder 150 woorden, noem altijd een concreet vervolgmoment, sluit af met een uitnodiging om te reageren"), en een optioneel tekstskelet met invulplekken. Dat is de definitie die de review miste (B11l).

Meegeleverde sjablonen in versie 1.0:

| Sjabloon | Ontvanger | Kern |
|---|---|---|
| Antwoord op een zorgvraag | ouder | erken, geef feiten, bied gesprek aan |
| Uitnodiging oudergesprek | ouder | doel, twee datumopties, duur |
| Verslag van een oudergesprek | ouder | wat besproken, wat afgesproken, wanneer terugkijken |
| Deel een documentatie | ouder | context, wat je ziet, uitnodiging om thuis door te praten |
| Groepsbericht activiteit | ouder | wat, wanneer, wat mee, wie contact |
| Vraag aan een collega | collega | kort, één vraag, deadline |
| Melding aan directie | directie | feit, wat je gedaan hebt, wat je nodig hebt |

**FR-MAI-16 — Sjablonen zijn te wijzigen en toe te voegen.**
*Gegeven* Instellingen → Mail → Sjablonen, *wanneer* je een sjabloon opent, *dan* zie je de naam, de instructies en het skelet als bewerkbare tekst, met "Herstel origineel".

**AI-bewerkingen.** In versie 1.0: schrijven vanaf sjabloon, spelling. In versie 1.1: inkorten, uitbreiden, toon aanpassen, samenvatten van je eigen concept (B-04 zette deze vijf naar later; ze komen terug in 1.1, zie hoofdstuk 18). De toonkeuze bij het schrijven zelf zit wél in 1.0, want dat is een parameter van de opdracht en geen extra bewerking: zakelijk, warm, kort, uitgebreid.

**FR-MAI-17 — Elke AI-bewerking gaat door hetzelfde controlepad.**
*Gegeven* een bewerking op een concept dat namen bevat, *wanneer* je hem start, *dan* geldt dezelfde volgorde als in 6.3.5, met het controlescherm.

#### 6.3.7 Een documentatie in een mail

**FR-MAI-18 — Een deelbare afbeelding gaat via het klembord de mail in.**
*Gegeven* een documentatie met de status gedeeld, *wanneer* je in de mailmodule "Voeg documentatie toe" kiest en er een selecteert, *dan* genereert `RenderService` de deelbare afbeelding, komt hij op het klembord (B-09), en verschijnt de instructie "Plak in je mail met Ctrl+V". De afbeelding gaat niet als bestand mee, want EduFlow schrijft alleen platte tekst in het concept.

**FR-MAI-19 — De toestemmingsbevestiging geldt ook hier.**
*Gegeven* een documentatie waarvoor je nog geen toestemming beeldgebruik hebt bevestigd, *wanneer* je hem in een mail wilt gebruiken, *dan* verschijnt dezelfde bevestiging als bij export (B-08).

#### 6.3.8 Het mailconcept als entiteit

| Veld | Type | Verplicht | Opmerking |
|---|---|---|---|
| `subject` | tekst | ja | 1-150 tekens; volgt uit B-36 |
| `body` | tekst | ja | ≤ 20.000 tekens |
| `recipientKind` | opsomming | ja | `ouder`, `collega`, `directie`, `extern` |
| `tone` | opsomming | ja | `zakelijk`, `warm`, `kort`, `uitgebreid` |
| `studentIds` | lijst | nee | voor terugvinden |
| `groupIds` | lijst | nee | voor terugvinden |
| `sourceMessageId` | verwijzing | nee | het bericht waarop dit een antwoord is |
| `templateId` | verwijzing | nee | het gebruikte sjabloon |
| `status` | opsomming | ja | `concept`, `overgedragen` |

**FR-MAI-20 — Zonder onderwerp geen concept.**
*Gegeven* een leeg onderwerp, *wanneer* je probeert over te dragen of het concept te verlaten, *dan* stelt de app een onderwerp voor op basis van de eerste regel en vraagt om bevestiging. Opslaan zonder onderwerp kan niet. Volgt uit B-36.

**FR-MAI-21 — Concepten staan in de lijst met een leesbare regel.**
*Gegeven* de conceptenlijst, *wanneer* je hem opent, *dan* toont elke regel het onderwerp, het ontvangertype, de gekoppelde leerling of groep en de datum van laatste bewerking.

#### 6.3.9 De overdracht

**"Als concept in je mailprogramma."** De server schrijft via Graph of Gmail een concept in je eigen postbus met het onderwerp, de tekst als platte tekst met regelafbrekingen, en het `In-Reply-To`-veld als het een antwoord is. Geen ontvanger ingevuld — die zet jij erin, bewust. De app zet de status op `overgedragen` en toont "Het concept staat in je Concepten-map. Open Outlook om het af te maken en te versturen."

**FR-MAI-22 — Het concept heeft geen ontvanger.**
*Gegeven* een antwoord op een oudermail, *wanneer* het concept wordt weggeschreven, *dan* is het veld Aan leeg, ook al is de afzender bekend. De reden: het invullen van een ontvanger is de laatste menselijke controle vóór verzending, en die neem je niet weg (U-10).

**FR-MAI-23 — Kopiëren werkt altijd.**
*Gegeven* geen gekoppelde postbus of een mislukte overdracht, *wanneer* je "Kopieer" kiest, *dan* staan onderwerp en tekst op het klembord in één blok, gescheiden door een lege regel.

#### 6.3.10 Privacy bij mail

De leerlingenlijst dekt hier weinig af. Daarom draaien er bij mail extra detectoren, allemaal met vaste regels en zonder AI:

| Detector | Werkwijze | Vervanging |
|---|---|---|
| E-mailadres | patroon met `@` en een geldig topniveaudomein | `[E-MAIL-n]` |
| Telefoonnummer | Nederlandse vaste en mobiele patronen, met en zonder landcode en scheidingstekens | `[TELEFOON-n]` |
| IBAN | landcode, controlegetal, modulus-97-toets | `[IBAN-n]` |
| BSN | negen cijfers met de elfproef | `[BSN-n]` |
| Postcode met huisnummer | `1234 AB 12` en varianten | `[ADRES-n]` |
| Naam na een aanhef | woord met hoofdletter na "Beste", "Hallo", "Geachte", "Hoi", "Dag" | `[OUDER-n]` |
| Ondertekening | woord met hoofdletter na "Groet", "Groeten", "Met vriendelijke groet", "Mvg", "Hartelijke groet" op een eigen regel | `[OUDER-n]` |
| Handtekeningblok | alles na een regel met alleen `--` of na twee lege regels gevolgd door een adrespatroon | verwijderd |
| Kind-achternaam | woord met hoofdletter direct na een roepnaam uit de lijst | `[LEERLING-n]` |

**FR-MAI-24 — De vier gevoeligste detectoren zijn niet uit te zetten.**
*Gegeven* Instellingen → Privacy, *wanneer* je de detectoren bekijkt, *dan* zijn BSN, IBAN, e-mailadres en telefoonnummer vast aan en grijs. De overige zijn uit te zetten met een waarschuwing.

**FR-MAI-25 — De teller is zichtbaar.**
*Gegeven* een verwerkt bericht, *wanneer* het controlescherm opent, *dan* staat er per detector hoeveel treffers er waren.

**FR-MAI-26 — Terugvertalen gaat op de code.**
*Gegeven* een antwoord met `[OUDER-1]`, *wanneer* het terugkomt, *dan* wordt de code vervangen door de oorspronkelijke tekst uit de `PseudonymMap`, niet door een naam die de AI verzint. Volgt uit C2 en §12.5.

#### 6.3.11 Foutgevallen

| # | Geval | Wat de app doet |
|---|---|---|
| 1 | Vernieuwingstoken verlopen | Eén stille poging tot vernieuwen; lukt dat niet, dan "Je postbus is losgeraakt. Opnieuw koppelen." zonder gegevensverlies |
| 2 | Beheerder trekt toestemming in | Zelfde melding, plus de tekst die de beheerder nodig heeft |
| 3 | Postbus leeg | Lege toestand: "Geen berichten in de laatste dertig dagen." met een knop om een andere map te kiezen |
| 4 | Bericht verwijderd terwijl je het bewerkt | Je concept blijft; de bronverwijzing wordt losgemaakt met een melding |
| 5 | HTML-mail met beelden | Beelden worden niet geladen (geen verzoeken naar derden); de tekst wordt uit de HTML gehaald |
| 6 | Mail in een andere taal | De samenvatting komt in het Nederlands, tenzij je in Instellingen anders kiest |
| 7 | Zeer lange draad | Alleen het bovenste bericht wordt verwerkt; de rest staat samengevouwen met "Neem ook de eerdere berichten mee" |
| 8 | Bericht groter dan 200.000 tekens | Wordt geweigerd voor AI met "Dit bericht is te lang om samen te vatten. Selecteer het deel dat je wilt samenvatten." |
| 9 | Aanbieder trager dan 20 seconden | Afbreken met "Je postbus reageert niet. Probeer het opnieuw." |
| 10 | Twee tabbladen met hetzelfde concept | Laatste schrijver wint per veld; de andere tab toont "Dit concept is elders gewijzigd. Vernieuwen." |

---
