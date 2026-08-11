# Besluiten sinds de Product Bible

Hoofdstuk 19 van het handboek bevat alle besluiten tot en met 7 augustus 2026. Dit
bestand is het vervolg: elke keuze die daarna de documenten verandert, met datum en
reden. Nieuwste bovenaan. Nummering loopt door op hoofdstuk 19.

---

# 11 augustus 2026 — de doorloop

## B-81 — De nulmeting blokkeert de bouw niet

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

## B-82 — Een doorloop vóór de sprints

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

## B-83 — Twee Definitions of Done

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

## T-32 — De hoofdstukken zijn de bron, de monoliet is de archiefkopie

**Besluit.** Het handboek staat als losse hoofdstukken in `docs/`. `product-bible-volledig.md`
blijft bestaan voor menselijke lezers en voor de functionaris gegevensbescherming, maar
wordt tijdens een fase niet bijgewerkt; hij wordt aan het eind van elke fase opnieuw
samengesteld.

**Waarom.** Een AI-programmeur die 9.115 regels moet doorzoeken, leest in de praktijk een
willekeurige selectie. Verwijzen naar één hoofdstuk van 300 regels is het verschil tussen
raden en lezen.

**Gevolg.** DR-01 blijft gelden op hoofdstukniveau. `CLAUDE.md` verbiedt expliciet het
lezen van de monoliet.

## T-33 — De ontwerptekens komen vóór de componenten

**Besluit.** `src/ui/tokens.css` wordt in week 0 volledig ingevuld uit §5.3 t/m §5.6 —
alle kleuren, ruimtes, letters, stralen, schaduwen, maten, lagen en duren, licht en
donker. Componenten worden pas daarna gebouwd, en uitsluitend met tokens (DR-55).

**Waarom.** Vaste waarden die eenmaal in twintig componenten staan, komen er niet meer uit.
De donkere modus uit §18.4 is dan een tweede verbouwing in plaats van één regel.

---

# Openstaand

- **O-01 — Stijlvoorbeelden.** Drie of vier paren van een ruwe notitie, de gewenste
  documentatie en een doorgeschoten versie, met verzonnen namen (§12.9, FR-INS-16).
  **Dit is de enige openstaande post die alleen de opdrachtgever kan invullen, en zonder
  deze voorbeelden is de Definition of Done op het punt AI-kwaliteit niet in te vullen.**
- **O-02 — `schoolvakanties.json`.** Drie regio's, schooljaren 2026-2027 en 2027-2028,
  met versienummer en `validUntil` (§13.4). Nodig vóór werkopdracht D09.
- **O-03 — Beheerdersgoedkeuring Microsoft 365.** Aanvragen in week 0, want de doorlooptijd
  ligt buiten je invloed (§13.3). De nepmap uit D10 overbrugt de wachttijd.
- **O-04 — Gesprek functionaris gegevensbescherming.** Voorwaarde vóór het eerste echte
  kind. Plannen zodra de doorloop staat, niet later (§1.5.5, §15.6).
