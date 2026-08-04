# Technical Architecture

## Doel

EduFlow wordt ontwikkeld als een modulair, schaalbaar en AI-first platform.

De architectuur moet eenvoudig uitbreidbaar zijn zodat nieuwe modules en AI-providers toegevoegd kunnen worden zonder bestaande functionaliteit te wijzigen.

---

# Technologie Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend

- Next.js API Routes

Versie 1 gebruikt de ingebouwde API-functionaliteit van Next.js.

Hierdoor is geen aparte backend nodig.

Wanneer EduFlow groter wordt kan de backend worden losgekoppeld.

---

## Database

Nog niet aanwezig.

Versie 1 gebruikt lokale opslag waar mogelijk.

Wanneer gebruikersaccounts worden toegevoegd zal PostgreSQL worden gebruikt.

---

## Authenticatie

Nog niet aanwezig.

EduFlow wordt in eerste instantie ontwikkeld voor één gebruiker.

Authenticatie wordt later toegevoegd.

---

# Architectuur

EduFlow bestaat uit losse modules.

Iedere module is zelfstandig.

Modules communiceren uitsluitend via gedeelde services.

Modules communiceren nooit direct met elkaar.

---

# Mappenstructuur

frontend/

app/

components/

modules/

services/

hooks/

types/

utils/

styles/

---

# Modules

Iedere module krijgt dezelfde structuur.

modules/

dashboard/

documentation/

mail/

agenda/

momento/

knowledge/

settings/

Iedere module bevat:

- components
- hooks
- services
- types

---

# Services

Alle logica komt in services.

Voorbeelden:

AIService

MailService

AgendaService

MomentoService

KnowledgeService

DocumentService

Services mogen elkaar gebruiken.

Componenten bevatten geen bedrijfslogica.

---

# AI Architectuur

Alle AI-functionaliteit loopt via één centrale AIService.

Modules communiceren nooit rechtstreeks met Claude of andere AI-modellen.

Hierdoor kan later eenvoudig gewisseld worden tussen:

- Claude
- ChatGPT
- Gemini
- Lokaal model

zonder wijzigingen aan de modules.

---

# UI

Iedere pagina bestaat uit:

Header

Sidebar

Content

AI Panel

Footer (optioneel)

Navigatie blijft overal gelijk.

---

# Styling

Tailwind CSS

shadcn/ui

Lucide Icons

Dark Mode ondersteuning vanaf versie 1.

---

# Bestandsstructuur

Iedere component krijgt één verantwoordelijkheid.

Voorbeeld:

Button.tsx

Sidebar.tsx

DocumentCard.tsx

MailCard.tsx

Geen component groter dan ongeveer 300 regels.

---

# State Management

Versie 1 gebruikt React Context.

Wanneer nodig kan later Zustand worden toegevoegd.

---

# API

Alle API-routes bevinden zich onder:

/api/

Voorbeelden:

/api/ai

/api/mail

/api/documentation

/api/momento

/api/settings

---

# Error Handling

Iedere service retourneert gestandaardiseerde fouten.

Frontend toont altijd een gebruikersvriendelijke melding.

Technische fouten worden gelogd.

---

# Logging

Versie 1:

Browser Console

Versie 2:

Centrale logging

---

# Performance

Code splitting

Lazy loading

Image optimization

Caching waar mogelijk

---

# Security

Geen secrets in de frontend.

API keys uitsluitend via environment variables.

Geen gevoelige gegevens in Local Storage.

---

# Architectuurprincipes

- Modules zijn onafhankelijk.
- Componenten bevatten geen businesslogica.
- Services bevatten alle logica.
- AI loopt altijd via AIService.
- Herbruikbare code gaat naar shared components.
- Iedere nieuwe module volgt dezelfde structuur.
