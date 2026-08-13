# Opdracht voor Claude Design — het ontwerpsysteem van EduFlow

Plak dit als eerste bericht in je Claude Design-project, samen met `tokens.css` uit deze
map. Claude Design bouwt de componentbibliotheek los van de app; die synchroniseer je
daarna naar `src/ui/`.

Doe dit vóór of naast werkopdracht D05 — niet erna, want vanaf D05 komen er componenten
in de app en dan wordt dit een verbouwing in plaats van een levering.

---

## De opdracht

Bouw de componentbibliotheek van EduFlow volgens de bijgevoegde `tokens.css`. Elke
component gebruikt uitsluitend ontwerptekens: geen enkele vaste kleur, ruimte, straal of
duur in een component. Dat is regel DR-55 uit het handboek en het is de reden dat de
donkere modus later één regel is en geen tweede stylesheet.

**Bouw op Radix, niet vanaf nul** (besluit B-116). In de repo staan al negentien
primitieven in shadcn-vorm op Radix. Wat jij maakt, komt daar bovenop of ernaast — het
vervangt ze niet. Voeg geen tweede componentbibliotheek toe: dat zou een migratie zijn, en
die is bewust niet besloten. Voor toestanden, toegankelijkheid en toetsenbordgedrag gebruik
je wat Radix al levert; jouw werk is de vorm, de tokens en de Nederlandse tekst.

**Taal:** alle zichtbare tekst is Nederlands, alle code Engels. Nooit half.

**Toon van de schermteksten:** gewone taal, geen jargon, geen uitroeptekens. Een fout
zegt wat er aan de hand is én wat de volgende stap is. Voorbeeld van goed:
*"De opslag is bijna vol. Exporteer een back-up en ruim oude foto's op."* Voorbeeld van
fout: *"Er is een fout opgetreden."*

## De componenten, in deze volgorde

**Eerste ronde — nodig voor D05 t/m D08:**

1. **Knop** — hoofd, tweede, rustig, gevaarlijk, alleen-pictogram. Drie maten: klein 32px
   met 12px binnenruimte, standaard 40px met 16px, groot 48px met 20px. Straal `radius-md`.
2. **Invoerveld** — tekst, e-mail, getal, met voorvoegsel, met pictogram rechts. Hoogte 40px,
   rand `--color-border-input`.
3. **Tekstvlak** — vast, groeiend, en het **schrijfveld**. Het schrijfveld groeit van 3 naar
   20 regels en is `--measure-read` breed. Het heeft geen opmaakbalk en geen automatisch
   aanvullen: dat sloopt dicteren, en dicteren is hoe de helft van de gebruikers werkt.
4. **Kaart** — rustig, aanklikbaar, met kop. Straal `radius-lg`, binnenruimte 24px op de
   laptop en 16px op de telefoon.
5. **Lijstrij** — enkelregelig 56px, tweeregelig 72px, met een staaf van 3px links voor de
   reekskleur.
6. **Inschuifpaneel** — 400px op de laptop, schermvullend onder 768px, onderblad op de
   telefoon. In 240ms met `--easing-enter`, uit in 180ms met `--easing-exit`, waas van 0
   naar 45%. Kop 56px. Dit is het exportpaneel én het controlescherm.
7. **Chip/label** — statisch, verwijderbaar, aanklikbaar, status. Hoogte 24px.
8. **Fotoraster** — strook 96px, raster 160px, verhouding 3:2 met `object-fit: cover`,
   selectierand 2px.
9. **Lege toestand** — maximaal 400px breed, 64px lucht boven en onder, pictogram 32px. De
   tekst zegt wat je nu kunt doen, niet dat er niets is.

**Tweede ronde:** keuzelijst, schakelaar, selectievakje, tabblad, dialoogvenster, melding,
voortgangsbalk, zoekveld, datumkiezer, avatar, foutblok, hulptekst.

## Regels die voor elke component gelden

- **Zeven toestanden**: rust, zweven, focus, actief, uitgeschakeld, laden, fout. Toon ze
  alle zeven naast elkaar in de preview — dat is waar dit gereedschap voor bedoeld is.
- **Focus is overal hetzelfde**: 2px in `--color-focus`, 2px offset, via `:focus-visible`.
  Nooit `outline: none` zonder vervanging.
- **Klikvlak** minstens 24×24px met de muis, 44×44px op aanraking.
- **Kleur is nooit de enige betekenisdrager.** Een foutveld heeft een rand én een tekst.
  Een reeks heeft een kleur én zijn naam.
- **Iconen**: Lucide, lijnstijl, raster 24px, lijndikte **1,5px** op elke maat (niet 2),
  kleur `currentColor`.
- **Bruikbaar bij 200% tekstvergroting en 400% zoom** zonder horizontaal schuiven.
- **Geen lettertype van een netwerk.** Inter en Source Sans 3 worden meegeleverd.

## Wat je niet ontwerpt

Geen illustraties, geen mascotte, geen kleurverlopen, geen glasachtige effecten. Geen
component die er niet in de lijst staat — komt er een nodig, dan is dat eerst een besluit.

De donkere modus staat al in `tokens.css` maar wordt in versie 1.0 niet aangeboden. Bouw
componenten wel zo dat `[data-theme="dark"]` ze correct omzet; dat kost nu niets en later
een week.

## Als het klaar is

Synchroniseer de bibliotheek naar `src/ui/` in de repo, met `tokens.css` als enige bron
van waarden. Draai daarna in Claude Code:

```
pnpm lint && pnpm typecheck
```

De lintregel `no-restricted-paths` bewaakt dat `ui/` alleen uit `lib/` importeert — een
component die gegevens ophaalt of een service aanroept, faalt de bouwstraat. Dat is met
opzet: het ontwerpsysteem moet los van de app te bekijken zijn, anders verliest het zijn
nut.
