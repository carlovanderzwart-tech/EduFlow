# D07 — Overzicht met zoeken en filters

**Fase:** doorloop v0.1 · **Duur:** 1 dagdeel · **Blokkeert:** —

## Doel

Joost vindt in twintig minuten alles wat er dit jaar over Kjeld is vastgelegd, uit drie
groepen en twee reeksen.

## Lees dit, en niet meer

- `docs/06-1-modules-documentaties.md` — alleen het overzicht en zoeken
  (`FR-DOC-11` t/m `FR-DOC-28`)
- `docs/08-datamodel.md` — §8.5 indexen en zoekstrategie
- `docs/07-gebruikersflows.md` — `F-15` een documentatie terugvinden over drie maanden
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-DOC-11` | Standaardsortering op **inhoudelijke** datum, niet op laatst bewerkt |
| `FR-DOC-12` | Schakelaar naar "Laatst bewerkt", onthouden in `localStorage` (T-01) |
| `FR-DOC-13` | Stabiele volgorde bij gelijke datum |
| `FR-DOC-14` | Doorlopend laden in blokken van 50 |
| `FR-DOC-21` | Zoeken doorzoekt titel, tekst, citaten, reeksnaam en gekoppelde namen |
| `FR-DOC-22` | De notitie voor jezelf wordt **niet** doorzocht |
| `FR-DOC-23` | Een treffer toont één fragment |
| `FR-DOC-25` | Binnen een filter geldt *of*, tussen filters geldt *en* |
| `FR-DOC-26` | Periode is een vrije datumrange met drie snelkeuzes |
| `FR-DOC-28` | Alles wissen |
| `T-09` | Zoeken via een index in het geheugen, gevuld bij het opstarten |
| `NFR-06` | Zoeken bij 1.000 documentaties ≤150 ms |

## Bestanden die je mag aanraken

```
src/modules/documentaties/DocumentationList.tsx
src/modules/documentaties/FilterBar.tsx
src/services/search/SearchService.ts
src/services/search/SearchService.test.ts
src/app/(app)/documentaties/page.tsx
src/ui/{ListRow,SearchField,Chip,DatePicker,EmptyState}.tsx
```

## Wat je bouwt

1. De lijst: op de laptop een tabel met Datum, Titel, Reeks, Betrokkenen, Inhoud, Status;
   op de telefoon rijen van 88px met een miniatuur. Laden in blokken van 50 met een knop
   "Meer laden" — geen oneindig scrollen.
2. `SearchService` met een index in het geheugen (`T-09`), gevuld bij het opstarten.
   IndexedDB kan niet in tekst zoeken; een externe bibliotheek is hier niet nodig en zou
   een `T-`besluit vragen (DR-18).
3. **De notitie voor jezelf staat niet in de index.** Dat is geen optimalisatie maar een
   belofte (`FR-DOC-08`, `FR-DOC-22`).
4. Vijf filters — Reeks, Groep, Leerling, Periode, Status — met de regel uit `FR-DOC-25`:
   twee reeksen aanvinken betekent *of*, een reeks plus een periode betekent *en*.
5. Een lege toestand die zegt wat je nu kunt doen (§4.6), niet "geen resultaten".

## Wat je bewust niet bouwt

De trigram-terugval bij nul treffers ("Bedoelde je: …", `FR-DOC-24`). Archief en
prullenbak als zichtbare weergaven (`FR-DOC-27`, sprint 2). Het rij-menu met dupliceren,
archiveren en verwijderen (`FR-DOC-15` t/m `-20`, sprint 2). Sneltoetsen
(`FR-DOC-124`, sprint 6).

## Klaar als

- [ ] Zoeken op "Kjeld" vindt de documentaties waar hij als leerling aan hangt **én** die
      waar zijn naam in de tekst staat
- [ ] Een woord dat alleen in de notitie voor jezelf staat, geeft nul treffers
- [ ] Reeks "Kunstwerk Dok" + periode "Dit schooljaar" geeft de doorsnede, niet de som
- [ ] Twee reeksen aanvinken geeft de som
- [ ] "Alles wissen" zet de lijst terug op de standaardsortering
- [ ] Toets `NFR-06`: met 1.000 opgewekte documentaties blijft zoeken onder 150 ms

## Val niet in deze kuil

**Zoeken direct op IndexedDB.** Dat werkt tot ongeveer honderd documentaties en wordt
daarna traag op een manier die je pas in maart merkt. `T-09` staat er niet voor niets.

**Sorteren op `updatedAt` als standaard.** De inhoudelijke datum is wat de gebruiker
bedoelt met "wanneer was dat" — `updatedAt` verspringt zodra je een typefout herstelt.
