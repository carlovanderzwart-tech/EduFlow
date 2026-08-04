# Technical Architecture

## Doel

EduFlow is een modulaire webapplicatie voor één gebruiker, die op telefoon en laptop even goed werkt.

Even goed is niet identiek. De maand- en jaarweergave van de agenda bestaan alleen op een breed scherm, en gespreksmodus is op de telefoon ontworpen. En omdat de opslag op het apparaat zelf zit, staat je werk op het apparaat waar je het hebt gemaakt — overzetten gaat via een back-upbestand, niet vanzelf.

De architectuur moet uitbreidbaar zijn zodat modules en AI-providers toegevoegd kunnen worden zonder bestaande onderdelen te wijzigen.

---

# Technologie Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## Backend

Next.js API Routes. Geen aparte backend in versie 1.

De API-routes doen precies één ding: AI-aanroepen doorsturen, zodat de API-sleutel op de server blijft. Alle overige logica draait in de browser.

## Authenticatie

Geen accounts, geen wachtwoorden, geen rollen. EduFlow is voor één gebruiker.

Wel een slot op de deur: zie *Hosting en afscherming*.

---

# Hosting en afscherming

Deze keuze stond niet in de eerste versie van dit document en is nodig, want zonder hosting werkt de telefoon niet en zonder afscherming is de AI-route van iedereen.

**De app draait op een eigen webadres.** Niet op de laptop van de gebruiker: dan werkt de telefoon alleen als die laptop aanstaat en op hetzelfde netwerk zit, en dat maakt de belofte "telefoon en laptop zijn even belangrijk" onwaar.

Daaruit volgt een probleem. `/api/ai` heeft de API-sleutel en er is geen authenticatie. Wie het adres kent, gebruikt de AI-dienst op kosten van de eigenaar. Daarom:

- de app is afgeschermd met een toegangscode, die per apparaat één keer wordt ingevoerd en daarna wordt onthouden;
- `/api/ai` weigert aanroepen zonder geldige code;
- er geldt een limiet op het aantal aanroepen per uur, ook mét geldige code, zodat een fout in de app geen rekening oplevert;
- de app wordt niet geïndexeerd door zoekmachines.

Dat is geen accountsysteem en het wordt er ook geen. Eén code, één keer invoeren.

---

# Opslag

Dit is de belangrijkste technische keuze van versie 1, want documentatie bestaat voor een groot deel uit foto's.

## IndexedDB voor alles van formaat en alles gevoeligs

In IndexedDB:

- documentaties, inclusief tekst, citaten, foto's, gekozen template en de vlag of de toestemmingsvraag voor deze documentatie al is beantwoord;
- mailconcepten;
- **de namenlijst** — de voornamen van de groep;
- **het stijlvoorbeeld** — dat is zelf een documentatie;
- reeksen, standaardwaarde leerlingen, eerder gebruikte waarden voor leerlingen;
- eigen afspraken en aangepaste vakantiedatums.

In localStorage alleen wat over niemand gaat: gekozen regio, standaardtoon, gekozen AI-provider, laatst gekozen weergave, datum van de laatste back-up, en of de eenmalige vragen al zijn beantwoord (lege namenlijst, beginscherm).

De toegangscode staat niet in localStorage maar in een cookie die de server zet, want die code moet bij elke aanroep van `/api/ai` mee.

**Niet localStorage voor de rest.** Die heeft een limiet van ongeveer 5 MB en slaat alleen tekst op — één documentatie met zes telefoonfoto's zit daar al overheen. En belangrijker: de namenlijst is het gevoeligste bestand in de app, en persoonsgegevens horen niet in localStorage.

Alle opslag loopt via services, nooit rechtstreeks vanuit een component. Zodra er meerdere gebruikers komen (PostgreSQL, objectopslag voor foto's) is dat één vervanging in plaats van een verbouwing.

## Foto's

- Foto's worden als Blob opgeslagen, niet als base64-tekst. Base64 maakt bestanden een derde groter en is trager.
- Bij het toevoegen wordt een foto verkleind naar maximaal **3300 pixels** op de lange zijde, als JPEG.
- Weergeven gebeurt via object-URL's, die na gebruik worden vrijgegeven.

**Waarom 3300 en niet 2400.** Bij 300 dpi is 1 inch 300 pixels, dus 2400 pixels is 300 dpi tot een afdrukbreedte van 203 mm. Een A4 in liggende oriëntatie is 297 mm breed; met 10 mm marge blijft 277 mm over. Een foto die die volle breedte beslaat haalt met 2400 pixels maar 220 dpi. 3300 pixels dekt 279 mm op 300 dpi en dus elke plek in elke template. De opslag wordt daarmee ongeveer 1,9 keer zo groot, en dat past ruim.

Het origineel wordt niet bewaard. Verkleinen gebeurt bij het toevoegen, niet bij het tonen.

## Persistentie: het probleem van de zeven dagen

Safari verwijdert IndexedDB, localStorage en alle andere opslag die een script kan schrijven **na zeven dagen zonder gebruik van de site**. Twee weken vakantie en het werk is weg. `navigator.storage.persist()` lost dat niet betrouwbaar op: de bijbehorende WebKit-bug staat sinds 2020 open, met meldingen dat Safari persistentie toekent en de data alsnog wist.

Wat wél helpt: **een webapp die op het beginscherm staat is expliciet vrijgesteld.** Daarom:

- EduFlow heeft een web app manifest en werkt als installeerbare webapp;
- bij het eerste gebruik op een telefoon legt de app uit waarom hij op het beginscherm moet, en hoe;
- `navigator.storage.persist()` wordt alsnog aangevraagd — het helpt op Chrome en Firefox tegen opruimen bij ruimtegebrek;
- de app herinnert aan een back-up als er een maand geen export is gemaakt.

## Opslaglimiet

Browsers geven een origin tot ongeveer 60% van de schijf. Dat is niet de beperking; foto's van één klas komen daar niet in de buurt.

Wel: Safari toont sinds versie 17 geen melding meer als het vol raakt. Er komt een `QuotaExceededError` en verder niets. Daarom meet EduFlow het gebruik, waarschuwt bij 80% met een knop naar exporteren en opruimen, en zorgt dat een mislukte schrijfactie het werk in het scherm niet weggooit.

## Geen server-opslag

Er gaat niets naar een server, behalve tekst richting de AI-provider. Foto's verlaten het apparaat nooit.

Gevolg: **apparaten synchroniseren niet.** Een documentatie leeft op het apparaat waar hij is gemaakt. Overzetten gebeurt met een exportbestand. Zie doc 05, besluit B-01.

## Later

Zodra er meerdere gebruikers komen: PostgreSQL en objectopslag voor de foto's. Daarom loopt alle opslag via `DocumentService` en nooit rechtstreeks vanuit een component — dan is dat één vervanging in plaats van een verbouwing.

---

# Architectuur

EduFlow bestaat uit losse modules. Iedere module is zelfstandig.

Modules communiceren uitsluitend via gedeelde services, nooit direct met elkaar.

## Mappenstructuur

```
src/
  app/          Next.js routes en API-routes
  components/   Gedeelde UI
  modules/      De vijf modules
  services/     Logica die door meer dan één module wordt gebruikt
  hooks/
  types/
  utils/
  data/         schoolvakanties.json
  styles/
```

Geen aparte `frontend/`-map. Versie 1 is één Next.js-project.

## Modules

```
modules/
  dashboard/
  documentation/
  mail/
  agenda/
  settings/
```

Iedere module bevat `components/`, `hooks/`, `services/`, `types/`.

**Waar hoort een service.** Wordt hij door meer dan één module gebruikt, dan staat hij in `src/services/`. Alleen als hij echt van één module is, staat hij in die module. In de praktijk staan alle services uit de tabel hieronder in `src/services/`, want het dashboard gebruikt documentatie- én agendagegevens.

Kennisbank komt in versie 2. Momento staat niet op de planning.

---

# Services

Alle logica zit in services. Componenten bevatten geen businesslogica.

| Service | Verantwoordelijkheid |
|---|---|
| `AIService` | Enige toegang tot AI. Roept altijd eerst `PrivacyService` aan. |
| `PrivacyService` | Namen vervangen door codes en weer terugzetten. Levert ook de volledige inhoud van het controlescherm, en de omzetting naar initialen voor de export. |
| `StorageService` | De enige laag die IndexedDB en localStorage aanraakt. |
| `DocumentService` | Documentaties en foto's opslaan, ophalen, verwijderen, zoeken. |
| `RenderService` | Een documentatie omzetten naar pagina's volgens het gekozen template. |
| `ExportService` | Print-PDF en deelbare afbeelding genereren, delen en kopiëren. Roept `PrivacyService` aan als de initialenschakelaar aan staat. |
| `BackupService` | Alle gegevens exporteren naar één bestand en terugzetten. |
| `MailService` | Sjablonen, concepten en zoeken in concepten. |
| `AgendaService` | Vakantiedata, eigen afspraken, aangepaste vakantiedatums. |
| `SettingsService` | Instellingen, namenlijst, reeksen. |

Services mogen elkaar gebruiken.

---

# AI-architectuur

Alle AI-functionaliteit loopt via `AIService`. Modules praten nooit rechtstreeks met een AI-provider.

Zo kan gewisseld worden tussen providers zonder de modules aan te passen. Welke providers beschikbaar zijn hangt af van welke sleutels op de server staan; de instelling in de app kiest daaruit. Een provider met verwerking binnen de EU is de standaard.

## Afscherming is niet optioneel

`AIService` is de enige plek die de API-route aanroept, en die roept altijd eerst `PrivacyService` aan. Er is geen weg om AI te bereiken die daaromheen gaat.

Dat is een architectuurkeuze, geen instelling. Een module die zelf `fetch` naar de AI-route doet is een fout die bij review wordt afgekeurd.

Foto's worden nooit meegestuurd. `AIService` accepteert geen binaire data — dat is afgedwongen in het type, niet in een controle.

## Wat er precies wordt verstuurd

`PrivacyService` bouwt de volledige payload en levert die ook op aan het controlescherm. Alles wat de deur uit gaat is zichtbaar:

- de eigen tekst van de gebruiker;
- het stijlvoorbeeld uit de instellingen;
- de instructie aan de AI;
- bij een vervolgzin: de eerdere documentaties uit dezelfde reeks.

Alle vier gaan door de naamvervanging heen, ook het stijlvoorbeeld — dat is zelf een documentatie en bevat namen, mogelijk van kinderen die niet meer in de huidige namenlijst staan.

## Namen vervangen

De regels, want "voornamen vervangen door codes" is minder simpel dan het klinkt:

- alleen hele woorden, zodat een kind dat Roos heet geen rozen in de schooltuin omzet;
- hoofdletterongevoelig zoeken, maar de hoofdletters van het origineel herstellen bij het terugzetten;
- langste naam eerst, zodat "Jan-Peter" niet als "Jan" wordt gepakt;
- Nederlandse bezitsvormen en verkleinvormen ("Kjelds", "Kjeldje") horen bij dezelfde naam;
- diakrieten worden genormaliseerd;
- twee kinderen met dezelfde voornaam krijgen elk een eigen code, zodat terugzetten klopt;
- terugvertalen gebeurt op de code, nooit op de naam.

Hier hoort een testset bij die bij elke wijziging draait.

**Is de namenlijst leeg, dan wordt er niets afgeschermd.** `AIService` weigert in dat geval de aanroep tot de gebruiker dat één keer bewust heeft bevestigd.

---

# Export

Drie uitkomsten, één renderlaag. `RenderService` bouwt de documentatie op tot pagina's volgens het gekozen template; `ExportService` zet die om.

- **Print-PDF** — A4 liggend, 10 mm marge, foto's op 300 dpi.
- **Deelbare afbeelding** — JPG per pagina, ongeveer 1600 pixels breed.
- **Delen** — het bestand rechtstreeks het deelmenu van het apparaat in, of naar het klembord op een laptop.

## Waarom geen browserprint

De eerste versie van dit document koos voor een print-stylesheet en de printfunctie van de browser. Dat werkt niet.

Safari ondersteunt `@page { size: A4 landscape }` niet — niet op desktop en niet op iOS. De oriëntatie wordt genegeerd en de printdialoog opent staand. Marges worden ook niet betrouwbaar overgenomen, en papierformaat en schaal worden uiteindelijk door de gebruiker en het besturingssysteem bepaald.

Daarom wordt de PDF in de app zelf gegenereerd, op een vast canvas van A4 liggend met de marge erin gebakken. Uitkomst: op elk apparaat exact hetzelfde bestand. De deelbare JPG komt uit dezelfde renderlaag.

## Pagina's

Past de inhoud niet op één pagina, dan loopt de documentatie door naar een volgende, met de titel erboven herhaald. `RenderService` bepaalt de paginabreuk; templates beschrijven één pagina en worden herhaald. Het aantal pagina's volgt uit het aantal foto's dat de gekozen template per pagina aankan — zes foto's in template C zijn dus drie pagina's, geen twee.

Templates zijn losse componenten met dezelfde props. Een template toevoegen raakt geen bestaande documentaties.

---

# UI

## Layout

Mobiel eerst. Ieder scherm wordt ontworpen voor een smal scherm en groeit mee.

- **Telefoon** — header, content, navigatiebalk onderaan met vijf iconen.
- **Laptop** — header, vaste zijbalk links, content.

Geen apart AI-paneel. AI-resultaat verschijnt in de contentkolom, onder de eigen tekst van de gebruiker. In gespreksmodus geldt hetzelfde: de vraag staat boven het antwoordveld, in dezelfde kolom, niet in een chatvenster.

Het exportpaneel schuift over het bewerkscherm heen. Het is geen aparte route.

## Styling

Tailwind CSS, shadcn/ui, Lucide Icons.

**Donkere modus komt in versie 2.** De export is altijd licht, dus donkere modus zou alleen voor de invoerschermen gelden.

## Invoervelden blijven saai

Het tekstveld voor een documentatie is een gewoon tekstveld. Geen rich text, geen slimme invoer, geen eigen toetsenbordafhandeling.

Reden: de dicteerknop van het toetsenbord moet werken. Gespreksmodus is bedoeld voor direct na een activiteit, met je handen nog vol. Dat is gratis functionaliteit zolang er geen eigen invoerlaag overheen ligt.

---

# Bestandsstructuur

Iedere component heeft één verantwoordelijkheid. Geen component groter dan ongeveer 300 regels.

Voorbeelden: `Button.tsx`, `BottomNav.tsx`, `DocumentCard.tsx`, `PhotoGrid.tsx`, `TemplateA.tsx`.

---

# State Management

React Context in versie 1. Zustand later, als het nodig blijkt.

Foto-blobs gaan niet door Context heen — die worden per component opgehaald via `DocumentService` en als object-URL vastgehouden, anders herrendert het halve scherm bij elke wijziging.

---

# API

Alle routes onder `/api/`:

```
/api/ai
```

Meer niet in versie 1. Alles buiten AI draait in de browser: opslag, zoeken, agenda, export en instellingen hebben geen server nodig. Mail en documentatie hebben de server alleen nodig op het moment dat er AI aan te pas komt.

Zonder netwerk werkt de app dus volledig, behalve de AI-knoppen. Die tonen dan een melding in gewone taal en laten de eigen tekst staan.

---

# Error Handling

Iedere service geeft gestandaardiseerde fouten terug.

De frontend toont altijd een melding in gewone taal met een vervolgstap. Technische details gaan naar de console.

Werk gaat nooit verloren door een fout. Bij een mislukte AI-aanroep blijft de eigen tekst staan. Na "Overnemen" is er altijd één stap ongedaan te maken, want autosave overschrijft de vorige versie direct.

Bij een netwerkfout wordt één keer opnieuw geprobeerd. Daarna een melding, geen derde poging.

---

# Logging

Versie 1: browserconsole. Versie 2: centrale logging.

Er wordt nooit inhoud van documentaties gelogd.

---

# Performance

Code splitting, lazy loading, beeldoptimalisatie, caching waar zinvol.

Foto's worden verkleind bij het toevoegen, niet bij het tonen.

Zoeken gaat via een index in het geheugen die bij het opstarten wordt opgebouwd, voor documentaties én mailconcepten. IndexedDB kan niet in tekst zoeken, en bij een paar honderd items is een index in het geheugen direct.

Autosave schrijft niet bij elke toetsaanslag, maar na een seconde stilte en altijd bij het verlaten van het scherm.

Bij het verwijderen van een documentatie gaan de bijbehorende foto's mee, anders vult de opslag zich met blobs waar niets meer naar verwijst.

---

# Data

`data/schoolvakanties.json` bevat meerdere schooljaren en heeft een versienummer. Aanpassingen van de gebruiker aan adviesvakanties worden apart opgeslagen en overleven een update van het bestand.

Zijn de data op, dan toont de agenda dat en blijven eigen afspraken gewoon werken.

---

# Security

- Geen secrets in de frontend. API-sleutels uitsluitend via environment variables op de server.
- De AI-route is afgeschermd met een toegangscode en een snelheidslimiet.
- Geen persoonsgegevens in localStorage. Documentaties, foto's, mailconcepten, de namenlijst en het stijlvoorbeeld staan in IndexedDB op het eigen apparaat.
- Foto's verlaten het apparaat niet.
- Geen externe trackers of analytics.

---

# Architectuurprincipes

- Modules zijn onafhankelijk.
- Componenten bevatten geen businesslogica.
- Services bevatten alle logica.
- AI loopt altijd via `AIService`, en `AIService` loopt altijd via `PrivacyService`.
- Opslag loopt altijd via een service, nooit rechtstreeks.
- Iedere nieuwe module volgt dezelfde structuur.
