# D09 — Agenda: maand, jaar en het vakantiebestand

**Fase:** doorloop v0.1 · **Duur:** 1½ dagdeel · **Blokkeert:** —
**Vereist:** `O-02` — `src/data/schoolvakanties.json` moet er zijn (zie `docs/BESLUITEN.md`)

## Doel

Bram weet in dertig seconden wanneer de studiedag valt, en het schooljaar past op één scherm.

## Lees dit, en niet meer

- `docs/06-2-modules-agenda.md` — §6.2, alleen de weergaven en de vakanties
- `docs/13-integraties.md` — §13.4 het vakantiebestand
- `docs/07-gebruikersflows.md` — `F-16` het schooljaar klaarzetten in augustus
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-AGE-01` | Vier weergaven; in de doorloop bouwen we maand en jaar |
| `FR-AGE-02` | De agenda synchroniseert met niets (B-30) |
| `FR-AGE-03` | Een item eindigt niet vóór het begint |
| `FR-AGE-04` | Een oudergesprek heeft precies één leerling |
| `FR-AGE-06` | De jaarweergave past op één scherm |
| `FR-AGE-07` | De jaarweergave is de standaard in de zomer |
| `FR-AGE-08` | De jaarweergave bestaat niet op de telefoon |
| `FR-AGE-09` | Kerst en zomer zijn niet te bewerken |
| `FR-AGE-10` | Adviesvakanties zijn per school aan te passen |
| `FR-AGE-11` | Aanpassingen overleven een update van het vakantiebestand |
| `FR-AGE-12` | Een aflopend vakantiebestand meldt zichzelf (B-50) |
| `FR-AGE-16` | Verwijderen is markeren |
| `NFR-14` | Jaarweergave binnen 400 ms |

## Bestanden die je mag aanraken

```
src/modules/agenda/{MonthView,YearView,ItemDialog}.tsx
src/services/agenda/AgendaService.ts
src/services/agenda/HolidayService.ts
src/app/(app)/agenda/page.tsx
src/data/schoolvakanties.json
src/domain/types/{agendaItem,holidayPeriod,holidayOverride}.ts
```

## Wat je bouwt

1. **De jaarweergave eerst.** Twaalf maandkolommen met alle vakanties, studiedagen en
   margedagen, een legenda en tellingen. Dit is het scherm dat het succescriterium
   *"het schooljaar past in één overzicht"* waarmaakt (B-10, review B10) en het is wat je
   in augustus daadwerkelijk wilt zien. Op de telefoon bestaat hij niet, en dat is goed.
2. De maandweergave: altijd zes rijen zodat het raster niet verspringt, maximaal drie
   items per dag plus "+n meer".
3. `HolidayService` leest `schoolvakanties.json` per regio. `fixed: true` (kerst, zomer)
   is niet te bewerken; de drie adviesvakanties zijn aan te passen via een
   `HolidayOverride` die **apart wordt opgeslagen**, zodat een update van het bestand hem
   niet overschrijft (`FR-AGE-11`, `T-11`/`C11`).
4. Een melding als `validUntil` van het bestand nadert (`FR-AGE-12`).
5. Items toevoegen via een dialoog: afspraak, oudergesprek, studiedag, margedag,
   herinnering. Een oudergesprek verplicht precies één leerling (`FR-AGE-04`).

## Wat je bewust niet bouwt

Dag- en weekweergave (sprint 4). Het snelveld met lokale ontleding (`FR-AGE-13`, `-14`).
Herhalingen (`FR-AGE-15`). Verplaatsen met slepen. ICS-import en -export
(`FR-AGE-20`, `-21`). Verjaardagen (`FR-AGE-05`, `-23`, `-24`). De koppelingen naar
documentatie en mail (`FR-AGE-17`, `-18`) — die komen in sprint 4.

## Klaar als

- [ ] Het hele schooljaar 2026-2027 staat op één laptopscherm, met alle vakanties
- [ ] De kerstvakantie is niet te bewerken; een adviesvakantie wel
- [ ] Een aangepaste adviesvakantie overleeft het vervangen van `schoolvakanties.json`
- [ ] Op de telefoon is de jaarweergave afwezig, niet kapot
- [ ] Een oudergesprek zonder leerling kan niet worden opgeslagen
- [ ] Toets `NFR-14`: de jaarweergave staat binnen 400 ms

## Val niet in deze kuil

**De overrides in hetzelfde bestand opslaan als de vakanties.** Dan is de eerste update
van het bestand ook het moment waarop de school haar eigen data kwijt is (`FR-AGE-11`).

**Een volledige `RRULE`-implementatie.** §6.2 kiest bewust voor drie herhaalpatronen. Wie
hier iCalendar-volledig begint, bouwt een week aan iets wat niemand vroeg (DR-03).
