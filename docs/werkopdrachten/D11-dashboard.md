# D11 — Dashboard

**Fase:** doorloop v0.1 · **Duur:** ½ dagdeel · **Sluit de doorloop af**

## Doel

Je loopt van dashboard → documentatie → export → mail zonder één dood spoor. Dat is v0.1.

## Lees dit, en niet meer

- `docs/06-4-modules-dashboard.md` — §6.4 volledig, het is kort
- `docs/BESLUITEN.md` — B-106, want het blok Postvak vervalt
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-DAS-01` | Verder werken aan: vijf documentaties en drie mailconcepten |
| `FR-DAS-02` | In de lijsten geldt de inhoudelijke datum |
| `FR-DAS-03` | Het blok Back-up wordt dringend na dertig dagen |
| `FR-DAS-04` | In een vakantie toont het blok de eerstvolgende schooldag |
| `FR-DAS-05` | Op een studiedag staat dat er als eerste regel |
| `FR-DAS-06` | Aandacht is een geheugensteun, geen signaal over een kind |
| `FR-DAS-07` | Aandacht is uit te zetten |
| `FR-DAS-08` | Het dashboard laadt binnen 500 ms |

## Bestanden die je mag aanraken

```
src/modules/dashboard/{Dashboard,Block}.tsx
src/app/(app)/dashboard/page.tsx
```

Alle gegevens komen uit bestaande services. Het dashboard heeft geen eigen service en geen
eigen gegevens — weghalen kost tijd, geen informatie.

## Wat je bouwt

**Vier blokken**, niet vijf. Het blok *Postvak* vervalt met B-106; er is geen postbus meer.
Elk blok heeft een kop, maximaal vijf regels en één knop:

1. **Deze week** — agenda, maximaal acht items. In een vakantie toont hij de vakantie plus
   de eerstvolgende schooldag; een studiedag staat als eerste regel.
2. **Verder werken aan** — vijf documentaties en drie mailconcepten, op `updatedAt`.
3. **Aandacht** — leerlingen zonder recente documentatiekoppeling, drempel 21 schooldagen,
   vakantiedagen tellen niet mee. **Met de verplichte regel, woordelijk:**
   *"Dit gaat over jouw documentatie, niet over dit kind."* Uit te zetten, geen geschiedenis.
4. **Back-up** — waarschuwingsrand na dertig dagen.

Twee kolommen op de laptop, één op de telefoon. Geen grafieken, geen tellers, geen
prestatie-indicatoren.

## Klaar als

- [ ] Vier blokken, gevuld binnen 500 ms
- [ ] Het blok Aandacht bevat de verplichte regel woordelijk
- [ ] Aandacht uitzetten laat het blok verdwijnen, niet leeglopen
- [ ] Tijdens een vakantie toont Deze week de eerstvolgende schooldag
- [ ] **De hele doorloop**: dashboard → nieuwe documentatie → AI meeschrijven → export →
      mail opstellen → kopiëren, zonder een scherm dat "nog niet af" zegt

## Val niet in deze kuil

**Het blok Aandacht als signalering.** Een teller per kind, een kleur, een sortering op
"langst geleden" — alle drie maken er een oordeel van, en dat is wat §1.4.2 verbiedt: een
signaal is een oordeel met een ander lettertype. Het is een geheugensteun over jouw
documentatie.

**Een `DashboardService`.** Het dashboard heeft geen eigen gegevens (§6.4). Wat het toont
komt uit `DocumentationService`, `AgendaService` en `MailService`. Een eigen service is een
tweede plek waar een regel staat — fout 2 uit §20.6.

---

## Na D11

De doorloop staat. Wat er dan gebeurt, in deze volgorde:

1. **Zelf een week gebruiken** met de verzonnen groep. Noteer wat er misgaat, wijzig niets.
2. **De middag met Karin plannen** (`O-04`). Laat het controlescherm zien, het plakveld met
   de detectoren erop, en de knop waarmee alles gewist wordt. Vertel er meteen bij dat er
   géén postbuskoppeling is — dat maakt het gesprek korter dan het geweest zou zijn.
3. **Sprint 1 beginnen** volgens §18.3 — op een fundament dat je hebt zien werken.
