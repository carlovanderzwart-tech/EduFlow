# D09b — Agenda: herhalen, verplaatsen, snelveld en meldingen

**Fase:** doorloop v0.1 · **Duur:** 2 dagdelen · **Blokkeert:** — · **Vereist:** D09a

## Doel

De agenda voelt als de agenda-app die je al kent (B-107).

## Lees dit, en niet meer

- `docs/06-2-modules-agenda.md` — §6.2.5 t/m §6.2.9 (snelveld, herhalen, verplaatsen,
  ICS, meldingen). Let op: §6.2.9 is op 11 augustus herschreven door B-108
- `docs/BESLUITEN.md` — B-107 en B-108
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-AGE-13` | Het snelveld gebruikt **geen AI** |
| `FR-AGE-14` | Het concept-item is zichtbaar vóór bevestiging |
| `FR-AGE-15` | Een herhaling wijzigen vraagt: alleen deze, of alle volgende? |
| `FR-AGE-20` | Export naar ICS met stabiele `UID` |
| `FR-AGE-25` | **Meldingen werken alleen terwijl EduFlow open is** (B-108) |
| `FR-AGE-27` | De ICS-export is de route naar echte herinneringen |
| `FR-AGE-28` | Toestemming voor meldingen wordt niet ongevraagd opgevraagd |
| `NFR-35` | Slepen is nooit de enige manier (B-38) |

## Bestanden die je mag aanraken

```
src/modules/agenda/{QuickAdd,RecurrenceDialog,ExportDialog}.tsx
src/modules/agenda/hooks/useDragToMove.ts
src/services/agenda/{AgendaService,RecurrenceService,IcsService}.ts
src/services/agenda/NotificationService.ts
src/lib/dates.ts
```

## Wat je bouwt

1. **Herhalen** — wekelijks, tweewekelijks, maandelijks op dezelfde weekdag. Meer niet:
   §6.2 kiest dat bewust en een volledige `RRULE` is een week werk die niemand vroeg
   (DR-03). Wijzigen vraagt "alleen deze, of alle volgende?" (`FR-AGE-15`).
2. **Verplaatsen met slepen** — naar een andere dag of tijd. **En met het toetsenbord**:
   pijl is een kwartier, Shift een dag, Ctrl een week. Dat toetsenbordpad is niet
   optioneel en niet "voor later": B-38 en `NFR-35` zeggen dat slepen nooit de enige
   manier is.
3. **Snelveld** — "dinsdag 14u oudergesprek Noa V." wordt **lokaal ontleed**, zonder AI
   (`FR-AGE-13`). Toon het resultaat als zichtbaar concept-item vóór bevestiging
   (`FR-AGE-14`), zodat een verkeerde gok jou niet verrast maar jij hem corrigeert.
4. **ICS-export** met stabiele `UID` per item, plus de teller uit `FR-AGE-27`: hoeveel
   items zijn er gewijzigd sinds de laatste export, en een knop om opnieuw te exporteren.
5. **`NotificationService`** — meldingen via de Notification API, **alleen terwijl de app
   open staat**. Toestemming pas vragen na een handeling in Instellingen (`FR-AGE-28`),
   nooit uit zichzelf. In het instellingenscherm staat letterlijk: *"EduFlow stuurt geen
   meldingen als de app dicht is. Wil je een herinnering op je telefoon, exporteer de
   agenda dan naar je eigen agenda-app — die doet het wel."*

## Wat je bewust niet bouwt

**Web Push, een servicewerker met pushabonnement, VAPID-sleutels of een pushserver.** Dat
is B-108 en het is geen bezuiniging maar een grens: het zou een derde server en een derde
gegevensstroom betekenen. Verder: ICS-import (`FR-AGE-21`), verjaardagen, de koppelingen
naar documentatie en mail (`FR-AGE-17`, `-18`).

## Klaar als

- [ ] Een wekelijkse afspraak aanmaken, één instantie verplaatsen, de rest staat er nog
- [ ] Een afspraak verslepen naar volgende dinsdag — en hetzelfde met alleen het toetsenbord
- [ ] "dinsdag 14u oudergesprek Noa V." levert het juiste concept-item, zichtbaar vóór
      bevestiging, en er is geen AI-aanroep gedaan (controleer de teller)
- [ ] De ICS-export importeert schoon in je eigen agenda-app, en een tweede import maakt
      geen dubbelen
- [ ] Meldingen aanzetten vraagt pas toestemming ná je klik, en de tekst over "alleen als
      de app open is" staat er woordelijk
- [ ] Een melding komt binnen met de app op een achtergrondtabblad

## Val niet in deze kuil

**Het snelveld door de AI halen.** Het is verleidelijk en het is `FR-AGE-13` in één klap:
een agenda-item aanmaken hoort nooit een netwerkaanroep, een wachttijd en een gegevensstroom
te zijn. Ontleden doe je met een handvol reguliere expressies en `lib/dates.ts`.

**Meldingstoestemming vragen bij het eerste bezoek.** Dat is de snelste manier om een
permanente weigering te krijgen, en die is op iOS lastig terug te draaien.

**Beloven wat je niet waarmaakt.** Als het instellingenscherm alleen "Meldingen aan" zegt,
denkt de gebruiker dat hij een herinnering krijgt bij het oudergesprek. Dat krijgt hij niet.
De uitleg is onderdeel van de functie, niet een voetnoot erbij.
