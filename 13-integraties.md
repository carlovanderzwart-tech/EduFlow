<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 13. Integraties

### 13.1 De houding tegenover koppelingen

Elke koppeling is een belofte die je jarenlang moet nakomen: aan de leverancier aan de andere kant, aan de gebruiker die erop gaat leunen, en aan de functionaris gegevensbescherming die wil weten welke gegevens waarheen gaan. Een koppeling die je bouwt omdat het kan, is een koppeling die je onderhoudt omdat het moet.

Daarom drie toelatingseisen. Een koppeling komt er alleen als alle drie waar zijn:

1. **Er is een officiële, gedocumenteerde programmeerkoppeling.** Geen scraping, geen browserautomatisering, geen ongedocumenteerde eindpunten. Dat is een absolute grens (§13.1).
2. **Hij neemt werk weg dat de gebruiker anders elke week doet.** Een koppeling die één keer per jaar tijd bespaart, verliest het van een export.
3. **De gegevensstroom is uit te leggen in twee zinnen.** Kan dat niet, dan is de koppeling te ingewikkeld voor een product dat op eenvoud is gebouwd (U-05).

### 13.2 Integraties in versie 1.0

| Integratie | Richting | Waarvoor | Toestemming |
|---|---|---|---|
| ~~Microsoft Graph (Microsoft 365)~~ | — | **Vervallen op 11 augustus 2026, zie B-84** | de beheerdersgoedkeuring is afgewezen |
| ~~Gmail API (Google Workspace)~~ | — | **Vervallen op 11 augustus 2026, zie B-84** | volgt Microsoft: één mailroute of geen |
| `schoolvakanties.json` | lezen, meegeleverd bestand | de agenda (§6.2.4) | geen |
| ICS-bestand | in- en uitvoer, handmatig | agenda overzetten (B-30) | geen |
| CSV-bestand | invoer, handmatig | leerlingen invoeren (FR-INS-03) | geen |
| Klembord en deelmenu van het apparaat | uitvoer | delen (B-09) | de gebruiker per handeling |
| AI-provider | uitgaand, via de eigen server | hoofdstuk 12 | verwerkersovereenkomst via het bestuur |

Meer niet. Dat is een korte lijst voor een product met drie modules, en dat is de bedoeling.

### 13.3 Microsoft Graph en Gmail — vervallen op 11 augustus 2026

**Deze paragraaf beschrijft een koppeling die er niet komt.** Hij blijft staan omdat de
afweging bewaard moet blijven voor het moment dat de vraag terugkeert (§13.6).

De aanleiding: de aanvraag voor beheerdersgoedkeuring op Microsoft 365 is afgewezen. Dat
is geen tegenslag die je met een betere aanvraag oplost — het is de organisatie die zegt
dat een externe toepassing geen toegang tot de postbus krijgt, en dat is een verdedigbaar
standpunt waar één leerkracht niets tegenover te stellen heeft. Gmail volgt hetzelfde
besluit: één mailroute of geen, want twee adapters onderhouden voor een module die in
beide gevallen op dezelfde muur stuit, is werk zonder uitkomst.

**Wat het betekent.** De module Mail is opnieuw ontworpen: geen postbus, geen koppeling,
geen OAuth, geen tokens. Zie de herschreven §6.3 en besluit B-84. Wat overblijft is de
helft van het probleem uit §1.1.4 waar de app wél iets aan kan doen: het schrijven van de
mail, niet het lezen ervan.

**Wat er vervalt.** De drie sloten uit T-30, DR-42 en de scopelijst blijven staan — niet
omdat er nog iets te beschermen valt, maar omdat DR-42 nu triviaal te handhaven is en
het schrappen van een controle een besluit met een nummer vereist (DR-04). De
tokenopslag uit T-15 vervalt wel: er zijn geen tokens meer.

**Wanneer dit terugkomt.** Zoals §13.6 het stelt: bij meer dan tien gebruikers binnen één
bestuur, met een bestaande verwerkersovereenkomst en een ICT-coördinator die de
goedkeuring namens de organisatie aanvraagt in plaats van namens een leerkracht. Dat is
fase 2, niet eerder.

**Rechten.** De tabel staat in §6.3.2. De kern van het ontwerp is wat er níét in staat: `Mail.Send` en `gmail.send` worden niet aangevraagd (B-20). De afdwinging zit op drie plekken:

1. De aanvraaglijst in de omgevingsvariabelen van de server bevat ze niet.
2. De route handler `/api/mail/[...path]` werkt met een lijst toegestane paden waarop geen verzendpad staat (T-30).
3. De bouwstraat faalt bij een verwijzing naar een verzendeindpunt in de broncode (DR-42).

Drie sloten voor één belofte lijkt overdreven. Het is de belofte waarop dit hele product staat of valt bij de functionaris gegevensbescherming, en een belofte met één slot is een belofte die iemand per ongeluk opent.

**Token-omgang** (T-15). De autorisatiecode wordt op de server ingewisseld tegen een toegangs- en een vernieuwingstoken. Beide worden versleuteld met een sleutel uit de omgeving en in één `httpOnly`-cookie gezet met `Secure`, `SameSite=Lax` en een looptijd van 90 dagen. Ze staan niet in `localStorage`, niet in IndexedDB, en niet in de opslag van de server. Bij ontkoppelen wordt het vernieuwingstoken bij de aanbieder ingetrokken en de cookie gewist (FR-MAI-05).

**Snelheidsgrenzen.** Beide aanbieders begrenzen het aantal aanroepen. EduFlow houdt daar rekening mee door koppen te bundelen (één aanroep voor 50 koppen), berichten alleen op te halen als je ze opent (FR-MAI-09), en bij een `429` de aangegeven wachttijd te respecteren zonder opnieuw te proberen binnen dat venster.

**Wat er misgaat en hoe vaak.** De meest voorkomende storing is niet technisch maar organisatorisch: een schoolbestuur dat toestemming door gebruikers heeft uitgeschakeld. Daarom is FR-MAI-04 er, met een kant-en-klaar blok gegevens voor de ICT-beheerder.

### 13.4 Het vakantiebestand

Een meegeleverd JSON-bestand met een versienummer, drie regio's en meerdere schooljaren (§6.2.4). Het is geen koppeling maar een gegevensbron, en dat is een bewuste keuze: een koppeling met een externe dienst voor gegevens die één keer per jaar veranderen, is een afhankelijkheid zonder opbrengst.

De verversing loopt via een app-update. Bij het openen vergelijkt `HolidayService` de versie in het bestand met die in de opslag; is hij nieuwer, dan wordt `holidayPeriods` opnieuw gevuld en blijven `holidayOverrides` staan (FR-AGE-11). Loopt `validUntil` af, dan meldt de app dat (FR-AGE-12, B-50).

### 13.5 Integraties die overwogen en afgewezen zijn

| Integratie | Waarom overwogen | Waarom niet |
|---|---|---|
| **ParnasSys** (leerlingadministratie) | leerlingen en groepen zouden niet handmatig hoeven | Een leerlingenlijst invoeren kost tien minuten per jaar. De koppeling vereist een overeenkomst per bestuur, doorlopend onderhoud en een uitbreiding van de verwerkingsgrondslag. De verhouding klopt niet (eis 2 uit §13.1). Zie §13.6 voor wanneer dit verandert. |
| **Momento** | genoemd in de oorspronkelijke documenten als toekomstige koppeling | Er is geen officiële programmeerkoppeling. De enige route zou browserautomatisering zijn, en die is verboden (B-43, eis 1). |
| **Agenda-synchronisatie via Graph of Google Calendar** | de agenda zou vanzelf kloppen | Tweerichtingssynchronisatie vraagt conflictafhandeling, verwijderdetectie en een tweede toestemmingsstroom, voor een agenda die één persoon bijhoudt. ICS-import lost 90 procent op tegen 5 procent van de kosten (B-30). |
| **Basispoort of Entree Federatie** (eenmalig aanmelden) | leerkrachten kennen het | EduFlow kent geen accounts (B-21). Eenmalig aanmelden zou accounts introduceren om een toegangscode te vervangen die één keer per jaar wordt ingevoerd. |
| **Teams of Parro** (oudercommunicatie) | de documentatie moet daar toch heen | Zou betekenen dat EduFlow zelf naar ouders verstuurt, en dat is precies wat U-01 verbiedt. Delen via het deelmenu van het apparaat levert hetzelfde resultaat met de gebruiker aan de knop (B-09). |
| **Cloudopslag** (OneDrive, Google Drive) voor back-ups | een back-up in de cloud gaat niet verloren | De back-up bevat alle foto's van alle kinderen. Die in een cloudmap zetten is een verwerking die om een eigen grondslag en een eigen overeenkomst vraagt. De gebruiker mag het bestand zelf ergens neerzetten; de app doet het niet voor haar. |
| **Spraakherkenning** | dicteren in gespreksmodus | Het toetsenbord van het apparaat doet dit al, gratis en in elke taal. Zelf bouwen zou audio naar een dienst sturen — een nieuwe gegevensstroom voor iets wat al werkt (§3.11, D3 uit de review). |

### 13.6 Wanneer een afgewezen integratie terugkomt

De afwijzingen hierboven zijn niet definitief; ze horen bij versie 1.0 en bij één gebruiker. De voorwaarden waaronder ze opnieuw op tafel komen:

| Integratie | Voorwaarde |
|---|---|
| ParnasSys of een ander leerlingadministratiesysteem | Meer dan tien gebruikers binnen één bestuur, én een verwerkersovereenkomst die het bestuur toch al heeft. Dan verandert de rekensom: tien keer tien minuten per jaar plus foutgevoeligheid weegt op tegen het onderhoud. |
| Agenda-synchronisatie | Gebruikers melden dat de ICS-import in de praktijk te vaak herhaald moet worden. |
| Momento | Er komt een officiële programmeerkoppeling. |
| Eenmalig aanmelden | Fase 2 introduceert accounts; dan wordt Entree Federatie de logische keuze in plaats van een eigen wachtwoord. |

### 13.7 Standaarden in het Nederlandse funderend onderwijs

Voor de volledigheid, en omdat het gesprek met een bestuur hier vroeg of laat op komt: het onderwijsveld kent afspraken die op termijn relevant worden.

| Standaard | Waarvoor | Relevantie voor EduFlow |
|---|---|---|
| **ECK iD** | een pseudonieme identificatie van een leerling over leveranciers heen | Zou in fase 3 de sleutel kunnen zijn waarmee een leerling herkenbaar is zonder naam. Nu niet: EduFlow deelt met niemand. |
| **UWLR** | uitwisseling van leerlinggegevens en resultaten tussen administratie en leermiddelen | Alleen relevant als er ooit een koppeling met een leerlingadministratiesysteem komt. Resultaten zijn buiten scope (B-25). |
| **OSO** | overdracht van een leerlingdossier bij schoolwissel | Niet relevant: EduFlow is geen dossier. |
| **Edukoppeling** | de transportafspraak voor uitwisseling in de sector | Relevant zodra er systeem-tot-systeemverkeer komt, dus in fase 3. |
| **Edu-V** | het nieuwere afsprakenstelsel voor het funderend onderwijs | Het kader waarbinnen een leverancier zich in dit veld beweegt. Aansluiting wordt beoordeeld op het moment dat EduFlow buiten één bestuur wordt aangeboden. |
| **Normenkader IBP funderend onderwijs** | informatiebeveiliging en privacy | Nu al het kader waaraan de maatregelen in hoofdstuk 16 gespiegeld worden. |

De conclusie voor versie 1.0: EduFlow sluit op geen van deze standaarden aan, en dat is juist, omdat hij met geen enkel ander systeem gegevens uitwisselt. Zodra dat verandert, verandert dit hoofdstuk mee — en dan vóór de bouw, niet erna.

### 13.8 De koppelvlakken die er wél zijn: bestanden

Bestanden zijn de onderschatte integratie. Ze vragen geen overeenkomst, geen token en geen onderhoud, en de gebruiker houdt de regie omdat zij het bestand zelf verplaatst.

| Bestand | Formaat | Richting | Beschreven in |
|---|---|---|---|
| Back-up | zip met JSON en JPEG's, optioneel versleuteld | beide | §8.7 |
| Print-PDF | PDF/A-compatibel, A4 liggend | uit | §6.1.12 |
| Deelbare afbeelding | JPEG 2480 × 1754 | uit | §5.12 |
| Agenda | ICS | beide | §6.2.7 |
| Leerlingen | CSV met kopregel | in | §6.5.1 |
| Inzageoverzicht | Markdown of JSON | uit | FR-INS-41 |

Elk van deze formaten is open, leesbaar en niet aan EduFlow gebonden. Dat is de uitweg als de gebruiker ooit met dit product stopt, en die uitweg hoort er vanaf versie 1.0 te zijn (C6 uit de review).

---
