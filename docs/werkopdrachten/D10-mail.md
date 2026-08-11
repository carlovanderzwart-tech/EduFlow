# D10 — Mail: opdracht in, mail uit

**Fase:** doorloop v0.1 · **Duur:** 1½ dagdeel · **Blokkeert:** —

> **Herschreven op 11 augustus 2026 door B-84 en B-87.** De oorspronkelijke D10 bouwde een
> postvak met een nepmap. Die koppeling komt er niet; de goedkeuring op Microsoft 365 is
> afgewezen. Lees `docs/06-3-modules-mail.md` — dat hoofdstuk is óók herschreven.

## Doel

Je typt een opdracht in gewone taal en krijgt een mail met onderwerp en tekst die je in
één handeling naar Outlook kopieert.

## Lees dit, en niet meer

- `docs/06-3-modules-mail.md` — de herschreven versie, hij is kort
- `docs/BESLUITEN.md` — B-84 en B-87
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-MAI-30` | De opdracht is het enige verplichte veld, minimaal 20 tekens |
| `FR-MAI-31` | De uitkomst is een onderwerp plus een tekst, allebei bewerkbaar |
| `FR-MAI-32` | Opnieuw is beperkt tot drie; overnemen vraagt of het de vorige vervangt |
| `FR-MAI-33` | Het plakveld draait de detectoren vóór alles |
| `FR-MAI-24` | E-mailadres, telefoonnummer, IBAN en BSN zijn **niet** uit te zetten |
| `FR-MAI-34` | Wat de detectoren vinden wordt vervangen en teruggezet |
| `FR-MAI-35` | Het plakveld wordt niet bewaard |
| `FR-MAI-13` | Je kunt zelf tekst afschermen |
| `FR-MAI-12` | Het controlescherm is bij mail **niet over te slaan** |
| `FR-MAI-15` | De AI voegt niets toe — geen datum die er niet stond |
| `FR-MAI-16` | Zeven sjablonen die het opdrachtveld voorvullen |
| `FR-MAI-20` t/m `-23` | Zonder onderwerp geen concept; geen ontvanger; kopiëren werkt altijd |
| `FR-MAI-36` | Inkorten, uitbreiden, toon, samenvatten, spelling — op je eigen tekst |
| `DR-42` | Nergens een verwijzing naar een verzendeindpunt |

## Bestanden die je mag aanraken

```
src/modules/mail/{MailComposer,PasteField,DraftList}.tsx
src/services/mail/MailService.ts
src/services/privacy/detectors.ts
src/services/privacy/detectors.test.ts
src/data/mailsjablonen.json
src/app/(app)/mail/page.tsx
```

## Wat je bouwt

1. **Eén scherm, drie velden**: de opdracht (verplicht, ≥20 tekens), het plakveld
   *"De mail waarop je antwoordt"* (optioneel), en de toon. Daaronder één knop.
2. **`detectors.ts`** — de negen detectoren uit `FR-MAI-24`, zonder AI, met reguliere
   expressies. De eerste vier zijn niet uit te zetten. Ze draaien **zodra je plakt**, niet
   pas bij verzenden, en tonen onder het veld wat ze hebben gevonden en van welke soort.
   Dit bestand hoort naast `PrivacyService` en gebruikt dezelfde `PseudonymMap`, zodat
   terugvertalen op de code gebeurt (`FR-MAI-26`).
3. **Het controlescherm**, hier niet over te slaan. Zelfde component als bij documentatie
   (D06), zelfde vijf blokken, met de afschermingen zichtbaar in de tekst.
4. **Het resultaat**: onderwerp (max tien woorden) plus tekst, beide bewerkbaar, met
   Overnemen / Opnieuw / Weggooien zoals bij documentatie.
5. **Concepten**: onderwerp verplicht, geen ontvangerveld, en de knop **"Kopieer"** — de
   belangrijkste knop van het scherm, die altijd werkt.
6. **Zeven sjablonen** in `mailsjablonen.json` die het opdrachtveld voorvullen. Een
   sjabloon is een tekstskelet voor jouw opdracht, geen prompt — dat onderscheid is er
   zodat je kunt zien wat je verstuurt.

## Wat je bewust niet bouwt

Een postvak, een berichtcache, OAuth, tokens, adapters, `nepmap.json` — allemaal vervallen
(B-84, T-34). Er is geen verzendknop en er komt er geen.

## Klaar als

- [ ] Een opdracht van twee zinnen levert een bruikbare mail met een passend onderwerp
- [ ] Een geplakte oudermail met een telefoonnummer, een IBAN en een e-mailadres erin
      toont drie vondsten onder het veld, vóórdat je op de knop drukt
- [ ] In het controlescherm zie je `[AFGESCHERMD-1]` staan waar het telefoonnummer stond
- [ ] Het controlescherm is niet weg te klikken zonder erdoorheen te gaan
- [ ] Een stuk tekst selecteren en "Scherm dit af" kiezen werkt
- [ ] Het scherm verlaten en terugkomen: het plakveld is leeg, het concept staat er nog
- [ ] Geen enkel zoekresultaat op `sendMail` of `messages/send` in de hele repo
- [ ] Toetsen voor alle negen detectoren, met een Nederlandse oudermail als invoer

## Val niet in deze kuil

**De detectoren pas bij verzenden draaien.** Dan ziet de gebruiker pas in het
controlescherm wat er stond, en het punt van `FR-MAI-33` is juist dat hij het ziet op het
moment dat hij plakt — dat is het moment waarop hij nog kan besluiten iets niet te sturen.

**Het plakveld opslaan "voor het gemak".** `FR-MAI-35` is het enige veld in de app dat
bewust niets onthoudt. Het bevat de gegevens van een ouder waar geen grondslag voor is.

**Een ontvangerveld toevoegen.** Het lijkt onschuldig en het betekent e-mailadressen van
ouders in IndexedDB (`FR-MAI-22`).

**De AI een datum laten verzinnen.** Staat er geen datum in je opdracht, dan komt er geen
datum in de mail — ook geen "binnenkort". Een mail aan een ouder is een toezegging
(`FR-MAI-15`, §3.8).
