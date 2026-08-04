# Development Standards

## Doel

Dit document beschrijft de ontwikkelstandaarden voor EduFlow.

Alle code, architectuur en Pull Requests moeten aan deze standaarden voldoen.

Bij conflicten tussen code en documentatie is de documentatie altijd leidend.

---

# Algemene principes

- De documentatie is de bron van waarheid.
- Functionaliteit wordt uitsluitend gebouwd wanneer deze is beschreven in de documentatie.
- Bij twijfel wordt eerst om verduidelijking gevraagd.
- Architectuurwijzigingen worden eerst besproken voordat ze worden geïmplementeerd.
- Iedere wijziging moet passen binnen de bestaande architectuur.

---

# Codekwaliteit

- TypeScript Strict Mode is verplicht.
- Gebruik geen `any` tenzij hiervoor expliciete toestemming is gegeven.
- Code moet leesbaar, eenvoudig en onderhoudbaar zijn.
- Voorkom complexe oplossingen wanneer een eenvoudige oplossing mogelijk is.
- Verwijder ongebruikte code direct.
- Los alle ESLint-waarschuwingen op.
- De applicatie moet zonder fouten bouwen.

Voor iedere Pull Request voert Claude minimaal uit:

- npm run build
- npm run lint
- npx tsc --noEmit

---

# Componenten

- Iedere component heeft één verantwoordelijkheid.
- Componenten bevatten geen businesslogica.
- Businesslogica wordt ondergebracht in services.
- Componenten zijn herbruikbaar.
- Controleer altijd eerst of een component al bestaat.
- Dubbele componenten zijn niet toegestaan.
- Props worden volledig getypeerd.

---

# Styling

- Gebruik uitsluitend Tailwind CSS.
- Gebruik uitsluitend shadcn/ui als basis voor UI-componenten.
- Gebruik geen inline styles.
- Gebruik geen hardcoded kleuren.
- Gebruik consistente spacing.
- Gebruik design tokens wanneer beschikbaar.

---

# Mappenstructuur

- Nieuwe hoofdmappen mogen alleen worden toegevoegd na goedkeuring.
- Gebruik bestaande mappen wanneer mogelijk.
- Lege verplichte mappen bevatten uitsluitend een `.gitkeep`.
- README-bestanden worden alleen toegevoegd wanneer ze daadwerkelijk documentatie bevatten.

---

# Git Workflow

Iedere wijziging volgt deze workflow:

1. GitHub Issue
2. Feature Branch
3. Implementatie
4. Zelfcontrole
5. Pull Request
6. Review
7. Merge

Directe commits naar `main` zijn niet toegestaan.

---

# Claude Code

Voordat Claude begint met programmeren:

1. Lees de volledige documentatie.
2. Analyseer de huidige codebase.
3. Controleer of vergelijkbare componenten al bestaan.
4. Gebruik bestaande componenten waar mogelijk.

Claude mag niet:

- dubbele componenten maken;
- ongebruikte bestanden achterlaten;
- tijdelijke debugcode committen;
- functionaliteit toevoegen buiten de scope van de huidige Issue.

Wanneer Claude een architectuurprobleem ontdekt:

- eerst rapporteren;
- daarna een voorstel doen;
- pas na goedkeuring wijzigen.

---

# Performance

- Gebruik Server Components waar mogelijk.
- Gebruik Client Components alleen wanneer noodzakelijk.
- Voeg zo min mogelijk dependencies toe.
- Vermijd onnodige renders.
- Houd componenten klein.

---

# Accessibility

- Gebruik semantische HTML.
- Alle interactieve elementen moeten met het toetsenbord bereikbaar zijn.
- Gebruik correcte aria-attributen.
- Voldoe minimaal aan WCAG AA.

---

# Refactoring

Refactoring gebeurt uitsluitend binnen de scope van de huidige Issue.

Grootschalige refactors zijn niet toegestaan zonder voorafgaande goedkeuring.

---

# Pull Request Checklist

Voor iedere Pull Request controleert Claude:

- Build succesvol
- TypeScript succesvol
- ESLint succesvol
- Responsive gedrag gecontroleerd
- Accessibility gecontroleerd
- Geen dubbele componenten
- Geen ongebruikte bestanden
- Geen overbodige dependencies

---

# Definition of Done

Een Issue is afgerond wanneer:

- de functionaliteit voldoet aan de documentatie;
- de code voldoet aan deze Development Standards;
- build, lint en typecheck succesvol zijn;
- de Pull Request is goedgekeurd;
- noodzakelijke documentatie is bijgewerkt.

---

# Belangrijkste regel

Wanneer code, documentatie of Development Standards elkaar tegenspreken, wordt eerst de documentatie aangepast voordat de code wordt gewijzigd.

De documentatie blijft altijd de bron van waarheid.
