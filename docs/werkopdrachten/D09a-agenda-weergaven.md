# D09a — Agenda: de vier weergaven en het vakantiebestand

**Fase:** doorloop v0.1 · **Duur:** 2 dagdelen · **Blokkeert:** D09b
**Vereist:** `O-02` — `src/data/schoolvakanties.json` moet er zijn

## Doel

Bram weet in dertig seconden wanneer de studiedag valt, en het schooljaar past op één scherm.

## Lees dit, en niet meer

- `docs/06-2-modules-agenda.md` — §6.2 t/m §6.2.4 (weergaven, itemsoorten, vakanties)
- `docs/13-integraties.md` — §13.4 het vakantiebestand
- `docs/07-gebruikersflows.md` — `F-16` het schooljaar klaarzetten in augustus
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-AGE-01` | Vier weergaven: dag, week, maand, jaar |
| `FR-AGE-02` | De agenda synchroniseert met niets (B-30) |
| `FR-AGE-03` | Een item eindigt niet vóór het begint |
| `FR-AGE-04` | Een oudergesprek heeft precies één leerling |
| `FR-AGE-06` t/m `-08` | Jaarweergave op één scherm, standaard in de zomer, niet op de telefoon |
| `FR-AGE-09` t/m `-12` | Vaste vakanties vast, adviesvakanties aanpasbaar, aanpassingen overleven een update, aflopend bestand meldt zichzelf |
| `FR-AGE-16` | Verwijderen is markeren |
| `NFR-13` / `NFR-14` | Weergave wisselen ≤200 ms, jaarweergave ≤400 ms |

## Bestanden die je mag aanraken

```
src/modules/agenda/{DayView,WeekView,MonthView,YearView,ItemDialog}.tsx
src/services/agenda/AgendaService.ts
src/services/agenda/HolidayService.ts
src/app/(app)/agenda/page.tsx
src/data/schoolvakanties.json
src/domain/types/{agendaItem,holidayPeriod,holidayOverride}.ts
```

## Wat je bouwt

1. **De jaarweergave eerst.** Twaalf maandkolommen met alle vakanties, studiedagen en
   margedagen, een legenda en tellingen. Dit maakt het succescriterium *"het schooljaar
   past in één overzicht"* waar (B-10) en het is wat je in augustus daadwerkelijk wilt
   zien. Op de telefoon bestaat hij niet, en dat is goed.
2. **Maand**: altijd zes rijen zodat het raster niet verspringt, maximaal drie items per
   dag plus "+n meer".
3. **Week**: standaard op de laptop, weekend op een kwart breedte.
4. **Dag**: standaard op de telefoon, 07:00 tot 18:00.
5. `HolidayService` leest `schoolvakanties.json` per regio. `fixed: true` (kerst, zomer)
   is niet te bewerken; de drie adviesvakanties zijn aan te passen via een
   `HolidayOverride` die **apart wordt opgeslagen**, zodat een update van het bestand hem
   niet overschrijft (`FR-AGE-11`).
6. Items toevoegen via een dialoog: afspraak, oudergesprek, studiedag, margedag,
   herinnering, documentatiemoment. Een oudergesprek verplicht precies één leerling.

## Wat je bewust niet bouwt

Herhalen, slepen en het snelveld — dat is D09b. ICS-import en -export
(`FR-AGE-20`, `-21`, `-27`). Meldingen (`FR-AGE-25`, `-28`). Verjaardagen
(`FR-AGE-05`, `-23`, `-24`). De koppelingen naar documentatie en mail
(`FR-AGE-17`, `-18`).

## Klaar als

- [ ] Het hele schooljaar 2026-2027 staat op één laptopscherm, met alle vakanties
- [ ] Alle vier de weergaven werken en wisselen binnen 200 ms
- [ ] De kerstvakantie is niet te bewerken; een adviesvakantie wel
- [ ] Een aangepaste adviesvakantie overleeft het vervangen van `schoolvakanties.json`
- [ ] Op de telefoon is de jaarweergave afwezig, niet kapot
- [ ] Een oudergesprek zonder leerling kan niet worden opgeslagen

## Val niet in deze kuil

**De overrides in hetzelfde bestand opslaan als de vakanties.** Dan is de eerste update van
het bestand ook het moment waarop de school haar eigen data kwijt is (`FR-AGE-11`).

**Vier weergaven als vier componenten die elk hun eigen datumlogica hebben.** Alle
datumberekening hoort in `AgendaService` en in `lib/dates.ts`; de weergaven tekenen alleen
(DR-15). Anders staat "welke week is dit" straks op vier plekken.
