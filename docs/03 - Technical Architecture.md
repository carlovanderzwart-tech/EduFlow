# Technical Architecture

## Doel

EduFlow is een modulaire webapplicatie voor één gebruiker, die op telefoon en laptop gelijk werkt.

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

Niet aanwezig. EduFlow is voor één gebruiker.

---

# Opslag

Dit is de belangrijkste technische keuze van versie 1, want documentatie bestaat voor een groot deel uit foto's.

## IndexedDB voor alles van formaat

Documentaties, foto's en mailconcepten gaan in IndexedDB.

**Niet localStorage.** Die heeft een limiet van ongeveer 5 MB en slaat alleen tekst op. Eén documentatie met zes telefoonfoto's zit daar al overheen. localStorage wordt uitsluitend gebruikt voor kleine instellingen: gekozen regio, standaardtoon, gekozen AI-provider.

## Foto's

- Foto's worden als Blob opgeslagen, niet als base64-tekst. Base64 maakt bestanden een derde groter en is trager.
- Bij het toevoegen wordt een foto verkleind naar maximaal 2400 pixels op de lange zijde, als JPEG. Dat is ruim genoeg voor 300 dpi op een A4 en scheelt een factor tien in opslag ten opzichte van een onbewerkte telefoonfoto.
- Weergeven gebeurt via object-URL's, die na gebruik worden vrijgegeven.
- Bij het benaderen van de opslaglimiet krijgt de gebruiker een waarschuwing met de mogelijkheid om te exporteren en op te ruimen.

## Geen server-opslag

Er gaat niets naar een server, behalve tekst richting de AI-provider. Foto's verlaten het apparaat nooit.

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
  services/     Alle logica
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

Kennisbank komt in versie 2. Momento staat niet op de planning.

---

# Services

Alle logica zit in services. Componenten bevatten geen businesslogica.

| Service | Verantwoordelijkheid |
|---|---|
| `AIService` | Enige toegang tot AI. Roept altijd eerst `PrivacyService` aan. |
| `PrivacyService` | Namen vervangen door codes en weer terugzetten. |
| `DocumentService` | Documentaties en foto's opslaan, ophalen, verwijderen. |
| `ExportService` | Print-PDF en deelbare afbeelding genereren. |
| `MailService` | Sjablonen en concepten. |
| `AgendaService` | Vakantiedata, eigen afspraken, aangepaste vakantiedatums. |
| `SettingsService` | Instellingen, namenlijst, reeksen. |

Services mogen elkaar gebruiken.

---

# AI-architectuur

Alle AI-functionaliteit loopt via `AIService`. Modules praten nooit rechtstreeks met een AI-provider.

Zo kan later gewisseld worden tussen Claude, ChatGPT, Gemini of een lokaal model zonder de modules aan te passen.

## Afscherming is niet optioneel

`AIService` is de enige plek die de API-route aanroept, en die roept altijd eerst `PrivacyService` aan. Er is geen weg om AI te bereiken die daaromheen gaat.

Dat is een architectuurkeuze, geen instelling. Een module die zelf `fetch` naar de AI-route doet is een fout die bij review wordt afgekeurd.

Foto's worden nooit meegestuurd. `AIService` accepteert geen binaire data.

---

# Export

Twee formaten, één renderlaag: de documentatiepagina wordt als HTML opgebouwd volgens het gekozen template, en daarna omgezet.

- **Print-PDF** — via een print-stylesheet en de printfunctie van de browser. Die levert vectortekst en scherpe foto's op zonder externe bibliotheek.
- **Deelbare afbeelding** — de pagina wordt naar canvas gerasterd op een verhoogde schaalfactor en als JPEG weggeschreven.

De keuze van bibliotheek voor het rasteren wordt gemaakt op het moment dat dit gebouwd wordt, niet nu.

Templates zijn losse componenten met dezelfde props. Een template toevoegen raakt geen bestaande documentaties.

---

# UI

## Layout

Mobiel eerst. Ieder scherm wordt ontworpen voor een smal scherm en groeit mee.

- **Telefoon** — header, content, navigatiebalk onderaan met vijf iconen.
- **Laptop** — header, vaste zijbalk links, content.

Geen apart AI-paneel. AI-resultaat verschijnt in de contentkolom, onder de eigen tekst van de gebruiker.

## Styling

Tailwind CSS, shadcn/ui, Lucide Icons.

**Donkere modus komt in versie 2.** De export is altijd licht, dus donkere modus zou alleen voor de invoerschermen gelden.

---

# Bestandsstructuur

Iedere component heeft één verantwoordelijkheid. Geen component groter dan ongeveer 300 regels.

Voorbeelden: `Button.tsx`, `BottomNav.tsx`, `DocumentCard.tsx`, `PhotoGrid.tsx`, `TemplateA.tsx`.

---

# State Management

React Context in versie 1. Zustand later, als het nodig blijkt.

---

# API

Alle routes onder `/api/`:

```
/api/ai
```

Meer niet in versie 1. Mail, agenda, documentatie en instellingen draaien volledig in de browser en hebben geen server nodig.

---

# Error Handling

Iedere service geeft gestandaardiseerde fouten terug.

De frontend toont altijd een melding in gewone taal met een vervolgstap. Technische details gaan naar de console.

Werk gaat nooit verloren door een fout. Bij een mislukte AI-aanroep blijft de eigen tekst staan.

---

# Logging

Versie 1: browserconsole. Versie 2: centrale logging.

Er wordt nooit inhoud van documentaties gelogd.

---

# Performance

Code splitting, lazy loading, beeldoptimalisatie, caching waar zinvol.

Foto's worden verkleind bij het toevoegen, niet bij het tonen.

---

# Security

- Geen secrets in de frontend. API-sleutels uitsluitend via environment variables op de server.
- Geen persoonsgegevens in localStorage. Documentaties staan in IndexedDB op het eigen apparaat.
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
