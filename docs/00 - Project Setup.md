# Project Setup

## Projectnaam

EduFlow

## Doel

EduFlow is een AI-gestuurd workflowplatform voor het onderwijs dat administratieve werkzaamheden centraliseert en automatiseert. De focus ligt op tijdsbesparing, gebruiksgemak en een natuurlijke integratie van AI in de dagelijkse werkzaamheden van onderwijsprofessionals.

---

# Rollen

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

Alle belangrijke beslissingen worden vastgelegd in de map `docs`.

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
