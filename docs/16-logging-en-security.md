<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 16. Logging en security

### 16.1 Drie soorten registratie, drie doelen

Ze worden vaak op één hoop gegooid en dat is precies waardoor logboeken vollopen met dingen die niemand leest en tegelijk missen wat iemand nodig heeft.

| Soort | Doel | Waar | Bevat persoonsgegevens |
|---|---|---|---|
| **Verantwoording** (`auditEvents`) | kunnen laten zien wat er is gebeurd met gegevensstromen | IndexedDB, 5 jaar | nee |
| **Kwaliteit** (`aiInteractions`) | meten of AI goed werkt | IndexedDB, 1 jaar | nee |
| **Diagnose** (console en serverlog) | een fout kunnen begrijpen | vluchtig | nee, afgedwongen |

De gemene deler: **geen van de drie bevat persoonsgegevens.** Dat is geen toevalligheid maar een ontwerpeis, en er is een lintregel die hem afdwingt (DR-44): het is verboden om een `Documentation`, `Student`, `Page`, `Block`, `MailMessage` of `MailDraft` als geheel aan een logfunctie mee te geven.

### 16.2 Het verantwoordingslogboek

Wat erin komt, is precies datgene waarvan je een jaar later wilt kunnen zeggen dat het gebeurd is, en wanneer.

| Gebeurtenis | Waarom vastgelegd |
|---|---|
| Postbus gekoppeld of ontkoppeld, met provider en de verleende rechten | de rechten zijn de kern van B-20 |
| AI-provider gewijzigd, met de oude en de nieuwe regio | een wisseling naar een aanbieder buiten de EU moet zichtbaar zijn |
| Doorgegaan met een lege leerlingenlijst (T-08) | dit is de bewuste afwijking van de eigen afscherming |
| Detector uitgezet (FR-INS-24) | idem |
| Controlescherm uitgezet voor documentatie (FR-INS-21) | idem |
| Toestemming beeldgebruik bevestigd, per documentatie | §15.8 |
| Export uitgevoerd, met soort en aantal pagina's | materiaal dat de school verlaat |
| Back-up gemaakt of teruggezet | grote gegevensbewegingen |
| Leerlingen samengevoegd | onomkeerbaar |
| Alles gewist | onomkeerbaar |
| Toegangscode gewijzigd of apparaat ingetrokken | toegangsbeheer |
| Migratie uitgevoerd, met versies | herleidbaarheid bij gegevensverlies |

Elke regel bevat: soort, tijdstip, apparaatnaam, en een feitelijke beschrijving zonder namen. Dus "Export: deelbare afbeelding, 3 pagina's, initialen aan" en niet "Export van 'Kjeld bouwt een brug'".

**Inzien en uitvoeren.** Het logboek is te openen in Instellingen → Over → Logboek, is doorzoekbaar op soort en periode, en is te exporteren als CSV. Dat laatste is het bestand dat een functionaris meeneemt.

**Niet te wissen, wel te exporteren.** Er is geen knop om het logboek leeg te maken; een verantwoordingslogboek dat de gebruiker kan wissen, is geen verantwoording. Alleen "Alles wissen" (FR-INS-39) verwijdert het, samen met alle andere gegevens, en dat is dan zelf de laatste regel in de export.

### 16.3 Diagnoseregistratie

Op de client: in ontwikkeling naar de console, in productie uit. Er is geen foutrapportagedienst van een derde partij. De reden is streng maar juist: elke dienst die stapeltraces ontvangt, ontvangt vroeg of laat een variabele met de tekst van een documentatie erin, en dat is een gegevensstroom die niemand heeft goedgekeurd.

In plaats daarvan houdt de app een ringbuffer van de laatste 200 gebeurtenissen in het geheugen, met tijdstip, soort en foutcode. Loopt de gebruiker tegen een probleem aan, dan kan zij in het scherm Over op "Maak een probleemrapport" klikken; dat levert een tekstbestand met die 200 regels, de versienummers, de opslagcijfers en de laatste tien foutcodes. Zij ziet het bestand vóór ze het deelt, en er staat geen inhoud in.

Op de server: één regel per aanroep met tijdstip, route, statuscode, duur, provider en de gehashte apparaat-id. Geen opdracht, geen antwoord, geen IP-adres na verwerking van de snelheidslimiet. Bewaartermijn dertig dagen.

### 16.4 Wat er nooit in een logboek komt

| Verboden | Waarom |
|---|---|
| Tekst uit een documentatie of mail | dat is de inhoud zelf |
| Namen van leerlingen of ouders | persoonsgegevens |
| De opdracht die naar de AI ging | bevat gepseudonimiseerde maar herleidbare tekst |
| Het antwoord van de AI | idem |
| De `PseudonymMap` | de sleutel (T-23) |
| Tokens, koppen met autorisatie, cookies | toegangsmiddelen |
| Volledige bestandspaden van foto's | kunnen een naam bevatten |
| IP-adressen na verwerking | niet nodig voor het doel |

### 16.5 Dreigingsmodel

Wie zou wat kunnen willen, en wat is de maatregel.

| # | Dreiging | Kans | Gevolg | Maatregel |
|---|---|---|---|---|
| R-01 | Iemand vindt het webadres en gebruikt de AI-route | hoog zonder maatregel | kosten, misbruik | toegangscode (T-05), snelheidslimiet en dagbudget (T-17), adres niet indexeerbaar |
| R-02 | Laptop wordt gestolen | laag | alle documentaties | schijfversleuteling en schermvergrendeling door het bestuur; toegangscode als drempel; eerlijk benoemd in §15.9 |
| R-03 | Kwaadaardig script in de app (XSS) leest IndexedDB | laag | alle gegevens | Content Security Policy zonder `unsafe-inline` (T-18), geen scripts van derden, geen `dangerouslySetInnerHTML`, HTML uit mail wordt ontdaan van opmaak vóór weergave |
| R-04 | Tokens gestolen uit de browser | zeer laag | toegang tot de postbus | tokens uitsluitend in `httpOnly`-cookies (T-15), niet leesbaar voor scripts |
| R-05 | Provider bewaart of traint op verstuurde tekst | middel | gegevens bij een derde | eisen uit §15.4, keuze op regio en contract, aantoonbaar in het logboek |
| R-06 | Verkeerde naam blijft staan en gaat naar de AI | middel | gegeven over een kind bij een derde | pseudonimisatieregels (§12.5), extra termen, controlescherm als vangnet (B-11) |
| R-07 | Onbedoeld versturen van een mail door de app | zeer laag | bericht naar ouders zonder controle | geen verzendrecht aangevraagd, lijst met toegestane paden, bouwcontrole (drie sloten, §13.3) |
| R-08 | Back-upbestand raakt zoek | middel | alle gegevens bij een derde | versleuteling met wachtwoord (T-25), waarschuwing bij het aanmaken |
| R-09 | Opslag loopt vol en werk gaat verloren | middel | verlies van een documentatie | drempels bij 80, 90 en 95 procent, tekst blijft altijd opslaanbaar, herstel uit `sessionStorage` (§11.7) |
| R-10 | Safari wist de opslag na zeven dagen | hoog zonder maatregel | verlies van alles op de telefoon | app op het beginscherm (B-02), back-upherinnering na dertig dagen |
| R-11 | Afhankelijkheid met een achterdeur | laag | alles | vaste versies, `lockfile` in het versiebeheer, geen automatische bijwerking, wekelijkse controle op bekende kwetsbaarheden |
| R-12 | Iemand met toegang tot het apparaat leest mee | middel | documentaties | toegangscode, automatische vergrendeling na dertig minuten inactiviteit |

### 16.6 Maatregelen op de client

**Content Security Policy** (T-18). Geen `unsafe-inline`, geen `unsafe-eval`, `default-src 'self'`, `img-src 'self' blob: data:`, `connect-src 'self'`, `frame-ancestors 'none'`. Er zijn geen scripts van derden, geen lettertypen van een netwerk (ze worden meegeleverd), geen analysecode en geen advertentiecode. Dat is meteen de reden dat de lijst kort kan zijn.

**HTML uit mail.** Een ontvangen bericht wordt nooit als HTML weergegeven. `MailService` haalt de tekst eruit en toont die als platte tekst met behoud van alinea's. Beelden worden niet geladen, ook niet als verwijzing; dat voorkomt zowel scriptrisico als het meten van leesgedrag door de afzender.

**Automatische vergrendeling.** Na dertig minuten zonder handeling wordt het scherm afgedekt en is de toegangscode opnieuw nodig. De gegevens blijven in de opslag; er wordt niets gewist. In te stellen tussen vijf minuten en nooit.

**Geen gegevens in de URL.** Geen documentatie-inhoud, geen namen, geen zoektermen in een route die in de geschiedenis van de browser belandt. Alleen id's.

### 16.7 Maatregelen op de server

| Maatregel | Uitwerking |
|---|---|
| Toegangscode | Argon2id-hash in de omgeving; vergelijking in constante tijd; 5 pogingen per uur per IP-adres |
| Snelheidslimiet | per apparaat-id én per IP-adres, vier vensters (§12.6) |
| Invoervalidatie | Zod op elk verzoek; onbekende velden geweigerd, niet genegeerd |
| Beeldcontrole | elk AI-verzoek met een beeldgegeven wordt geweigerd met `422` (T-29) |
| Lijst toegestane paden voor mail | verzendpaden ontbreken en kunnen niet worden toegevoegd zonder codewijziging (T-30) |
| Geheimen | uitsluitend uit de omgeving; nooit in de broncode; een bouwcontrole faalt bij een patroon dat op een sleutel lijkt |
| Kopregels | `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy` met alles uit |
| Geen opslag | de server heeft geen database en geen bestandsopslag |
| Uitgaand verkeer | alleen naar de geconfigureerde providereindpunten |

### 16.8 Afhankelijkheden

De regel: **elke afhankelijkheid is een besluit dat je opschrijft.** Voor versie 1.0 is de lijst kort en elk onderdeel heeft een reden die niet "handig" is.

| Pakket | Waarvoor | Waarom niet zelf |
|---|---|---|
| `next`, `react` | framework en weergave | — |
| `dexie` | IndexedDB | de ruwe koppeling is foutgevoelig bij transacties en migraties |
| `zod` | validatie | één schema voor typen en controle |
| `zustand` | schermtoestand | 3 kB, geen aanbieder om de app heen |
| Radix UI | dialoogvensters, panelen, keuzelijsten | toegankelijkheid die je zelf niet betrouwbaar bouwt (§11.6) |
| `pdf-lib` | PDF genereren | T-14 |
| `pdfjs-dist` | rasteren naar JPEG | B-27 |
| `tailwindcss` | opmaak | tokens uit hoofdstuk 5 |
| `vitest`, `@playwright/test`, `axe-core` | toetsen | T-19 |

Er is geen pakket voor datums (de standaardfuncties van de browser volstaan voor één tijdzone), geen pakket voor toestandsmachines, geen pakket voor formulieren en geen componentbibliotheek buiten Radix.

**Beleid.** Versies staan vast in het `lockfile`, dat in het versiebeheer staat. Er is geen automatische bijwerking. Eén keer per week draait een controle op bekende kwetsbaarheden; een kritieke melding wordt binnen 48 uur behandeld, een hoge binnen twee weken. Een nieuwe afhankelijkheid komt er alleen met een regel in het besluitenregister.

### 16.9 Beveiligingstoetsen in de bouwstraat

| Toets | Wanneer | Faalt bij |
|---|---|---|
| Lintregel: geen persoonsgegevens naar een logfunctie | elke wijziging | een verboden type als argument (DR-44) |
| Lintregel: geen rechtstreekse toegang tot Dexie buiten `StorageService` | elke wijziging | elke import van `db` buiten die map (DR-13) |
| Lintregel: geen import uit een andere `modules/`-map | elke wijziging | overtreding van §10.2 |
| Zoekopdracht naar verzendeindpunten | elke wijziging | een verwijzing naar `sendMail` of `messages/send` (DR-42) |
| Zoekopdracht naar geheimpatronen | elke wijziging | een tekenreeks die op een sleutel lijkt |
| Controle op afhankelijkheden | wekelijks en bij elke wijziging | een kwetsbaarheid met status kritiek |
| `axe-core` op elk scherm | elke wijziging | een overtreding van WCAG 2.2 AA |
| Controle op bundelomvang | elke wijziging | overschrijding van meer dan 10 procent (T-31) |
| Rondgangtoets pseudonimisatie | elke wijziging | `restore(pseudonymise(t)) !== t` voor enige tekst in de set (INV-30) |
| Gouden testset zonder netwerk | elke wijziging | een afwijking in de samengestelde opdracht |
| Gouden testset met netwerk | wekelijks en vóór elke release | onder de drempels uit §12.9 |

### 16.10 Wat te doen bij een incident

Er is één persoon, dus het draaiboek is kort en daarom uitvoerbaar.

1. **Vaststellen wat er is gebeurd** uit het verantwoordingslogboek en het serverlog. Niet raden.
2. **De stroom stoppen.** Bij een verdenking op de AI-route: de toegangscode wijzigen, wat alle apparaten uitsluit. Bij een verdenking op mail: ontkoppelen, wat het vernieuwingstoken intrekt.
3. **Beoordelen of er persoonsgegevens betrokken zijn.** Zo ja, dan is het schoolbestuur aan zet, want dat is de verwerkingsverantwoordelijke: melding aan de Autoriteit Persoonsgegevens binnen 72 uur is hun plicht, en de maker levert de feiten.
4. **Vastleggen** in het besluitenregister met datum, oorzaak en maatregel.
5. **De maatregel toetsbaar maken.** Elk incident levert minstens één geautomatiseerde toets op die hetzelfde geval de volgende keer vangt. Een incident zonder nieuwe toets is een incident dat terugkomt.

---
