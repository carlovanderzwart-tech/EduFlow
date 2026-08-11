# D10 — Mail met een nepmap, en het dashboard

**Fase:** doorloop v0.1 · **Duur:** 2 dagdelen · **Blokkeert:** — · **Sluit de doorloop af**

## Doel

Je loopt van dashboard → documentatie → export → mail zonder één dood spoor. Dat is v0.1.

## Lees dit, en niet meer

- `docs/06-3-modules-mail.md` — §6.3, **niet** de OAuth-delen
- `docs/06-4-modules-dashboard.md` — §6.4 volledig, het is kort
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-MAI-02` | Er is **geen** verzendknop |
| `FR-MAI-12` | Het controlescherm is bij mail niet over te slaan |
| `FR-MAI-13` | Je kunt zelf tekst afschermen |
| `FR-MAI-14` | De samenvatting levert punten op, geen proza (max vijf) |
| `FR-MAI-15` | De AI voegt niets toe |
| `FR-MAI-18` | De deelbare afbeelding gaat via het klembord de mail in |
| `FR-MAI-20` | Zonder onderwerp geen concept |
| `FR-MAI-23` | Kopiëren werkt altijd |
| `FR-MAI-24` | De vier gevoeligste detectoren zijn niet uit te zetten |
| `FR-DAS-01` t/m `-08` | De vijf blokken, de datumregel, de back-uprand, vakantie en studiedag, Aandacht, en laden binnen 500 ms |
| `DR-42` | Nergens een verwijzing naar een verzendeindpunt |

## Bestanden die je mag aanraken

```
src/modules/mail/{Inbox,MessageView,DraftEditor}.tsx
src/modules/dashboard/{Dashboard,Block}.tsx
src/services/mail/MailService.ts
src/services/mail/adapters/nepmap.ts
src/services/privacy/detectors.ts
src/data/nepmap.json
src/app/(app)/{mail,dashboard}/page.tsx
```

## Wat je bouwt

### Mail

1. **Adapter `nepmap`**: leest `src/data/nepmap.json` — acht verzonnen oudermails, elk met
   iets wat een detector moet vinden: een achternaam, een telefoonnummer, een IBAN, een
   handtekeningblok, de naam van een behandelaar. `MailService` krijgt dezelfde signatuur
   als de Graph- en Gmail-adapters in sprint 5 gaan krijgen, zodat die er dan naast komen
   in plaats van dit vervangen.
2. **De vier detectoren die niet uit te zetten zijn** (`FR-MAI-24`): e-mailadres,
   telefoonnummer, IBAN, BSN. Zonder AI, met reguliere expressies, in
   `services/privacy/detectors.ts` naast `PrivacyService`.
3. Samenvatten met het **niet-overslaanbare** controlescherm (`FR-MAI-12`). Dit is een
   ander scherm dan bij documentatie: daar kun je hem uitzetten, hier niet
   (`FR-INS-21`). De uitkomst is maximaal vijf punten, geen proza.
4. Een concept met een verplicht onderwerp, geen ontvanger, en de knop **"Kopieer"**.
   Er is geen verzendknop en er komt er geen (`FR-MAI-02`, B-20, U-01).

### Dashboard

5. De vijf blokken uit §6.4, elk met een kop, maximaal vijf regels en één knop: Deze week,
   Verder werken aan, Postvak, Aandacht, Back-up. Geen grafieken, geen tellers.
6. **Aandacht** krijgt de verplichte regel *"Dit gaat over jouw documentatie, niet over dit
   kind"* (`FR-DAS-06`) en is uit te zetten. Die zin is geen toelichting maar een grens:
   zonder hem is dit blok een signaleringsfunctie en valt het onder §1.4.2.

## Wat je bewust niet bouwt

OAuth met Microsoft Graph en Gmail (sprint 5). De cache met vervaltermijn
(`FR-MAI-09`, `-10`). Zoeken via de aanbieder. De zeven sjablonen (`FR-MAI-16`).
Toonkeuze. De overige vijf detectoren. Het blok Postvak toont in de doorloop de nepmap.

## Klaar als

- [ ] Acht nepmails staan in het postvak; er is nergens een verzendknop te vinden
- [ ] Samenvatten kan niet zonder eerst het controlescherm te zien
- [ ] Telefoonnummer, IBAN en e-mailadres zijn afgeschermd vóór verzending — controleer
      dat in het controlescherm, niet in de code
- [ ] Een concept zonder onderwerp kan niet worden opgeslagen
- [ ] Een deelbare afbeelding uit D08 plakt in een concept
- [ ] Het dashboard toont vijf blokken en is binnen 500 ms gevuld (`FR-DAS-08`)
- [ ] Het blok Aandacht bevat de verplichte regel woordelijk
- [ ] **De hele doorloop**: dashboard → nieuwe documentatie → AI → export → mail, zonder
      een scherm dat "nog niet af" zegt

## Val niet in deze kuil

**Een verzendknop "voor later".** DR-42 laat de bouwstraat falen op `sendMail` en
`messages/send`. Dat is geen strengheid: het is het enige wat de belofte uit §1.4.3
controleerbaar maakt zonder de code te lezen.

**Het blok Aandacht als signalering.** Een teller per kind, een kleur, een sortering op
"langst geleden" — alle drie maken er een oordeel van, en dat is precies wat §1.4.2
verbiedt. Het is een geheugensteun over jouw documentatie.

---

## Na D10

De doorloop staat. Wat er dan gebeurt, in deze volgorde:

1. **Zelf een week gebruiken** met de verzonnen groep. Noteer wat er misgaat, wijzig niets.
2. **De middag met Karin plannen** (`O-04`). Laat het controlescherm zien, de rechtenlijst
   waarin het verzendrecht ontbreekt, en de knop waarmee alles gewist wordt.
3. **Sprint 1 beginnen** volgens §18.3 — op een fundament dat je hebt zien werken.
