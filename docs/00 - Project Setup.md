# Project Setup

## Projectnaam

EduFlow

## Doel

EduFlow is een werkplatform dat een leerkracht in het basisonderwijs helpt bij het administratieve deel van het werk: documentatie schrijven, mails opstellen en het schooljaar overzien.

De focus ligt op tijdsbesparing, gebruiksgemak en AI die meeschrijft op de plek waar het werk gebeurt. EduFlow koppelt niet met andere systemen en vervangt er ook geen — het staat ernaast.

---

# Rollen

Deze drie rollen liggen in fase 1 bij één persoon, met Claude als uitvoerend engineer en meedenkend architect. Dat betekent dat een aantal kwaliteitspoorten anders werkt dan bij een team:

- **Code review** is Claude die het werk van Claude tegenspreekt, plus een expliciete reviewronde per functionaliteit waarin fouten worden opgezocht in plaats van goedgekeurd.
- **Testen** doet de Product Owner zelf, en dat is de enige poort die niet te automatiseren is. Die blijft.
- **Prioriteiten en roadmap** zijn in de praktijk dezelfde beslissing. De Product Owner beslist wat er gebouwd wordt, de architect zegt in welke volgorde dat technisch verstandig is.

## Product Owner

Verantwoordelijk voor:

- Visie
- Functionaliteit
- Prioriteiten
- Testen
- Feedback

## Software Architect

Verantwoordelijk voor:

- Architectuur
- Technische keuzes
- Code reviews
- Kwaliteitsbewaking
- Roadmap

## Software Engineer

Verantwoordelijk voor:

- Implementatie
- Refactoring
- Unit tests
- Documentatie van de code

---

# Ontwikkelmethode

Iedere nieuwe functionaliteit doorloopt dezelfde stappen.

1. Idee
2. Functioneel ontwerp
3. Technisch ontwerp
4. Implementatie
5. Code review
6. Testen
7. Opleveren

Er wordt geen code geschreven zonder een goedgekeurd ontwerp.

---

# Ontwerpprincipes

- AI First
- Workflow boven losse functies
- Zo min mogelijk klikken
- Modulair ontwerp
- Privacy by Design
- Uitbreidbaar zonder grote wijzigingen

---

# Documentatie

Alle belangrijke beslissingen worden vastgelegd in de map `docs`, in `05 - Besluiten.md`, met datum en reden.

Leesvolgorde:

| | Document | Beantwoordt |
|---|---|---|
| 00 | Project Setup | Hoe werken we |
| 01 | Vision & Scope | Waarom bestaat dit |
| 02 | Functional Requirements | Wat moet het kunnen |
| 04 | Product Blueprint | Hoe ziet het eruit |
| 03 | Technical Architecture | Hoe is het gebouwd |
| 05 | Besluiten | Wat is er beslist en waarom |
| 99 | Development Standards | Waar code aan moet voldoen |

Doc 04 is leidend voor wat er gebouwd wordt: staat een functionaliteit er niet in, dan komt hij er niet. Doc 03 is leidend voor hoe. Wijkt de code af van de architectuur, dan is de code fout.

Architectuur is leidend. De code volgt de architectuur, nooit andersom.

---

# Branch strategie

main

Bevat uitsluitend stabiele code.

feature/...

Nieuwe functionaliteiten worden altijd ontwikkeld in een aparte feature branch.

---

# Definition of Done

Een functionaliteit is pas afgerond wanneer:

- deze voldoet aan de functionele eisen;
- de code is gereviewd;
- de documentatie is bijgewerkt;
- de Product Owner heeft getest;
- de functionaliteit klaar is voor gebruik.

---

# Voorwaarde voor gebruik met echte gegevens

Los van de Definition of Done per functionaliteit geldt één voorwaarde voor de app als geheel.

**Er gaan geen gegevens van echte kinderen in EduFlow voordat de opzet is voorgelegd aan de functionaris gegevensbescherming van het schoolbestuur.**

Dat betekent tijdens het bouwen:

- ontwikkelen en testen gebeurt met een verzonnen groep en verzonnen documentaties. Sinds besluit B-15 gaat het om verzonnen leerlingen mét achternaam en geboortedatum, niet om losse voornamen;
- het stijlvoorbeeld in de instellingen is een gefictionaliseerde versie van een echte documentatie, geen echte;
- de FG krijgt een werkende app te zien met het controlescherm erbij, niet een plan op papier. Daar hoort nu ook het leerlingenregister bij: welke velden er staan, waarom elk veld er staat, en dat het het apparaat niet verlaat.

Deze voorwaarde heeft een eigenaar: de Product Owner. Zie doc 01, Randvoorwaarden.
