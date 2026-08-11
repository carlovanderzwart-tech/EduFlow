# D03 — PrivacyService en de toetsset

**Fase:** doorloop v0.1 · **Duur:** 1½ dagdeel · **Blokkeert:** D04

## Doel

Tekst met namen erin gaat er gepseudonimiseerd uit en komt er ongeschonden terug in.

> Dit is de belangrijkste opdracht van de hele doorloop. Fout 1 uit §20.6 is een
> AI-aanroep die deze service overslaat: de tekst is dan weg en komt niet terug.

## Lees dit, en niet meer

- `docs/12-ai-architectuur.md` — §12.5 pseudonimisatie in detail, §12.13 wat er nooit heen gaat
- `docs/09-domeinmodel.md` — `INV-30`
- `docs/A-testgegevens.md`
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `T-04` | Woordgrenzen, hoofdletterherstel, langste naam eerst, Nederlandse verbuigingen, unieke codes bij dubbele voornamen |
| `INV-30` | `restore(pseudonymise(t)) === t` — voor elk geval in de toetsset |
| `FR-INS-18` | De leerlingenlijst is de kern van de afscherming |
| `FR-INS-19` | Extra termen vangen wat de lijst niet dekt |
| `FR-INS-20` | Zonder leerlingen geen AI, tenzij eenmalig bevestigd |
| `T-08` | Die poort werkt niet stilzwijgend: hij blokkeert zichtbaar |
| `DR-31` | Geen AI-aanroep die hier niet doorheen ging. Geen uitzondering, ook niet in een test |
| `DR-41` | Wijzig je deze service, dan draai je de volledige toetsset vóór je oplevert |

## Bestanden die je mag aanraken

```
src/services/privacy/PrivacyService.ts
src/services/privacy/PrivacyService.test.ts
src/domain/types/pseudonym.ts
src/lib/text.ts
```

## Wat je bouwt

1. `pseudonymise(tekst, lijst) → { tekst, map }` en `restore(tekst, map) → tekst`.
   **Terugvertalen gebeurt op de code, niet op de naam** — dan blijft het kloppen ook als
   de AI de zin heeft omgezet.
2. De vervangingsregels uit `T-04`, in deze volgorde: langste naam eerst (zodat
   "Jan-Peter" niet als "Jan" wordt gepakt), woordgrenzen, hoofdletterongevoelig matchen
   met hoofdletterherstel, diakrieten normaliseren, Nederlandse bezitsvormen en
   verkleinvormen.
3. `gate(lijst)`: geeft `geblokkeerd` bij een lege leerlingenlijst, tenzij de eenmalige
   bevestiging is gegeven (`FR-INS-20`, `T-08`). Deze functie is de enige toegang tot de
   AI-keten; D04 roept hem aan vóór alles.
4. **De toetsset uit `src/test/fixtures/testgegevens.ts`.** Alle vijftien gevallen uit
   `PRIVACY_GEVALLEN` plus `INV-30` op elk daarvan. Schrijf de toets vóór of tegelijk met
   de code (DR-40) — niet erna.

## Wat je bewust niet bouwt

De extra detectoren voor mail (e-mail, telefoon, IBAN, BSN, postcode — `FR-MAI-24`,
sprint 5). Het aanwijzen van namen die niet in de lijst staan (D7 uit de review, niet
besloten). Het controlescherm zelf (D06).

## Klaar als

- [ ] Alle vijftien gevallen uit `PRIVACY_GEVALLEN` doen wat de kolom `vervangt` zegt
- [ ] `restore(pseudonymise(t)) === t` voor alle vijftien (`INV-30`)
- [ ] "De rozen in de schooltuin" blijft ongemoeid, "Roos legde" niet
- [ ] "samenwerken" blijft heel
- [ ] Noa B. en Noa V. krijgen elk een eigen code en komen goed terug
- [ ] `gate()` blokkeert bij een lege lijst en zegt waarom
- [ ] De toetsset draait zonder browser en zonder netwerk (DR-12)

## Val niet in deze kuil

**Een reguliere expressie zonder woordgrenzen.** Dat is de directe route naar
"de rozen" → "de Kind Rn". Begin bij de toetsset, niet bij de expressie.

**Terugvertalen op de naam.** Als de AI "Kind A" naar het begin van de zin verplaatst en
je zoekt op de naam, vind je niets. Zoek op de code.

**Een toets versoepelen omdat een geval lastig blijkt.** Dat is DR-45 en het is fout 5
uit §20.6. Blijkt een geval echt niet oplosbaar, dan is dat een besluit met een nummer,
geen stillere toets.
