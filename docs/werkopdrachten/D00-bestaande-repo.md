# D00 — De bestaande repo naar §10.2

**Fase:** doorloop v0.1 · **Duur:** 1 dagdeel voor de inventarisatie, daarna per stap ½ dagdeel
**Blokkeert:** D01 · **Vervangt:** de opzet-opdracht uit `SETUP.md` §2

> **Waarom deze opdracht er is.** De opzet-opdracht in `SETUP.md` ging uit van een leeg
> project. Dat klopt niet: de repository is 35 pull requests diep. Een structuurwijziging
> over bestaande code is een ander soort werk dan een project opzetten, en het verdient een
> eigen werkopdracht met een eigen volgorde. Deze.

## Doel

De bestaande code staat in de mappenstructuur van §10.2, met de git-historie intact en
zonder dat er onderweg iets kapot is gegaan.

## Lees dit, en niet meer

- `docs/10-service-architectuur.md` — §10.2 mappenstructuur en de importtabel
- `docs/20-ontwikkelregels.md` — DR-11 t/m DR-18
- `docs/werkopdrachten/README.md`

## Stap 1 — Inventariseren, zonder één regel te wijzigen

**Dit is de hele eerste sessie.** Geen `git mv`, geen hernoemingen, geen nieuwe mappen.

Lever één bestand op: `docs/werkopdrachten/D00-inventarisatie.md`, met:

1. **De huidige boom**, twee niveaus diep, met per map het aantal bestanden en regels.
2. **Een tabel: waar staat het nu, waar hoort het volgens §10.2.** Eén rij per bestand of
   groep bestanden. Kolommen: nu · straks · laag (`modules`/`services`/`domain`/`ui`/`lib`/`app`) · hoeveel andere bestanden importeren dit.
3. **De overtredingen van de importtabel** die er nu al zijn, geteld per soort. Verwacht:
   schermen die de database aanraken (DR-13), regels die in een component staan (DR-15),
   services die React importeren (DR-17).
4. **Wat er in de repo staat dat in §10.2 niet voorkomt.** Niet om te schrappen — om te
   benoemen. Voor elk daarvan: hoort dit ergens thuis, of is het een besluit waard?
5. **Een voorgestelde volgorde van verplaatsen**, van minst naar meest riskant, met per
   stap het aantal geraakte bestanden.

Daarna stopt de sessie. De opdrachtgever leest het en bepaalt de volgorde.

## Stap 2 en verder — verplaatsen, één laag per sessie

Per sessie één stap uit de volgorde van stap 1. Elke stap:

- **`git mv`, nooit kopiëren en verwijderen.** Anders is de historie van dat bestand weg en
  is `git blame` over een half jaar waardeloos.
- **Alleen verplaatsen en imports bijwerken.** Geen herschrijven, geen opschonen, geen
  "meteen even netter". Een verplaatsing die ook een wijziging is, is niet meer terug te
  draaien zonder na te denken.
- **Eén commit per stap**, in het formaat uit §20.3, met `infra:` als gebied.
- **Draaien vóór en ná**: `pnpm typecheck` en de bestaande toetsen. Waren ze rood vóór de
  stap, dan noteer je dat — anders weet je na afloop niet wat jij hebt gedaan.

## Stap 3 — De lintregels aanzetten, in twee ronden

`eslint.config.mjs` zet de importregels meteen op `error`. Op een codebase van 35 PR's
levert dat honderden meldingen op, en dan zet iemand hem uit. Doe het zo:

1. **Ronde 1** — zet in `eslint.config.mjs` de regel `import/no-restricted-paths` tijdelijk
   op `"warn"`. Draai `pnpm lint`, tel de meldingen per zone, zet het aantal in
   `D00-inventarisatie.md`. Nu is er een getal dat kleiner moet worden.
2. **Ronde 2** — zodra een zone op nul staat, gaat díé zone op `error`. Zo kan hij niet
   terugvallen terwijl de rest nog loopt.
3. Pas als alle zones op nul staan, gaat de hele regel op `error` en verdwijnt de
   uitzondering. **Zet nooit een regel uit om een melding kwijt te raken** (DR-04, DR-45).

## Wat je bewust niet doet

- **Geen nieuwe map naast de bestaande.** 35 pull requests zijn echt werk; opnieuw beginnen
  gooit dat weg en levert een tweede repo die uit elkaar loopt.
- **Geen functionaliteit toevoegen of wijzigen.** D00 is puur verplaatsen. Kom je iets tegen
  dat kapot is, dan noteer je dat in de inventarisatie en repareer je het niet hier.
- **Niets verwijderen.** Code die nergens in §10.2 past, blijft staan tot er een besluit
  over is genomen (DR-04).

## Klaar als

- [ ] `docs/werkopdrachten/D00-inventarisatie.md` bestaat en is door de opdrachtgever gelezen
- [ ] Elke map uit §10.2 bestaat en bevat wat er hoort
- [ ] `git log --follow` op een verplaatst bestand toont nog steeds zijn geschiedenis
- [ ] `pnpm typecheck` is niet slechter dan vóór D00
- [ ] `pnpm lint` draait, alle zones staan op `error`, en er is geen uitgezette regel
- [ ] Je kunt `docs/werkopdrachten/D01-storage.md` beginnen zonder eerst iets te verplaatsen

## Val niet in deze kuil

**Alles in één commit verplaatsen.** Het lijkt efficiënt en het is de reden dat je bij de
eerste rode toets niet meer weet welke van de veertig verplaatsingen het deed.

**De lintregels aanzetten vóór het verplaatsen.** Dan werk je een uur lang tegen een muur
van meldingen die vanzelf verdwijnen zodra de bestanden op hun plek staan.

**Van deze opdracht een opschoonactie maken.** Er komt van alles voorbij dat beter kan. Zet
het in de inventarisatie onder "opgevallen", en raak het niet aan. D00 is verplaatsen.
