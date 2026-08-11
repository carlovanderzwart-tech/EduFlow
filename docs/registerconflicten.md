# De nummering van het besluitenregister is gebroken

Opgemaakt op 11 augustus 2026, op commit `41d8e3c` plus de D00-verplaatsingen uit PR #37.
Bron voor de vergelijking: `git show '9cfd900^:docs/EduFlow - Product Bible v1.0.md'` — de
laatste versie van de Bible waarin T-39 t/m T-50 en B-98 t/m B-102 nog stonden.

**Er is in dit document geen besluit hersteld, herschreven of hernummerd.** Elk herstel vraagt
eerst één keuze die niet van mij kan komen: welk register de nummering bezit. Zolang die
keuze niet is gemaakt, maakt elke reparatie het probleem groter.

---

## 1. Er zijn twee registers, en ze overlappen volledig

| Bestand | B-nummers | T-nummers |
|---|---|---|
| `docs/19-besluitenregister.md` | **B-01 t/m B-97** (100 definities) | **T-01 t/m T-38** (32 definities) |
| `docs/BESLUITEN.md` | **B-84 t/m B-87** (7 definities) | **T-32 t/m T-34** (3 definities) |
| oude Bible (`9cfd900^`) | tot **B-102** | tot **T-50** |

`BESLUITEN.md` opent met: *"Hoofdstuk 19 van het handboek bevat alle besluiten tot en met
7 augustus 2026. Dit bestand is het vervolg. Nummering loopt door op hoofdstuk 19."*

Die aanname klopt niet. Hoofdstuk 19 loopt door tot B-97 en T-38, niet tot B-83 en T-31.
`BESLUITEN.md` begint veertien nummers te laag voor `B-` en zeven te laag voor `T-`, waardoor
**alle tien zijn besluiten botsen** met een besluit dat al bestond.

### De tien botsingen

| # | In `19-besluitenregister.md` | In `BESLUITEN.md` |
|---|---|---|
| B-81 | De beheerder ziet nooit inhoud; de functionaris ook niet | De nulmeting blokkeert de bouw niet |
| B-82 | Delen is lezen plus opmerkingen | Een doorloop vóór de sprints |
| B-83 | Delen heeft altijd een einddatum | Twee Definitions of Done |
| B-84 | De school kan systeeminstructies niet wijzigen | De mailmodule krijgt geen postbus |
| B-85 | Geen externe foutrapportagedienst | De agenda wordt een volwaardige agenda |
| B-86 | Het verantwoordingslogboek is niet te wissen | Meldingen alleen terwijl de app open is |
| B-87 | Ontvangen mail nooit als HTML | Het plakveld voor een ontvangen mail |
| T-32 | De app vraagt taak en kwaliteitsniveau | De hoofdstukken zijn de bron, de monoliet de archiefkopie |
| T-33 | Nooit meer dan één automatische nieuwe poging | De ontwerptekens komen vóór de componenten |
| T-34 | Bij het maandbudget blijven taken op `snel` werken | De mailadapters vervallen |

Dit is geen schrijffout maar een breuk in de belangrijkste regel van het register (§19.1
regel 1: *een nummer wordt nooit hergebruikt*). `docs/werkopdrachten/README.md` verwijst naar
"besluit B-82 in `docs/BESLUITEN.md`" — dat is de doorloop. Wie B-82 in hoofdstuk 19 opzoekt,
leest iets over delen.

---

## 2. Tweeëndertig genummerde items zijn verdwenen

In de oude Bible, niet meer in de gesplitste hoofdstukken, en ook niet in de archiefkopie
`docs/product-bible-volledig.md`:

| Soort | Weg | Wat het was |
|---|---|---|
| `T-` | **T-39 t/m T-50** (12) | de architectuurreview van 8 augustus, plus T-46 t/m T-50 |
| `B-` | **B-98 t/m B-102** (5) | de basisweek |
| `INV-` | INV-54, INV-55, INV-56 (3) | invarianten van de basisweek |
| `FR-AGE` | FR-AGE-29 t/m FR-AGE-34 (6) | eisen van de basisweek |
| `FR-INS` | FR-INS-46, FR-INS-47 (2) | het basisweek-instellingenscherm |
| `O-` | O-10 t/m O-13 (4) | openstaande punten, beslecht met T-47 t/m T-50 |

Bewust toegevoegd sinds de oude Bible, en te behouden: **FR-MAI-30 t/m FR-MAI-36** (7), uit
B-84 *"De mailmodule krijgt geen postbus"*.

---

## 3. Drie nummers betekenen nu iets anders

Deze zijn hergebruikt, wat §19.1 regel 1 verbiedt:

| # | In de oude Bible | Nu |
|---|---|---|
| FR-AGE-25 | Er zijn geen pushmeldingen in versie 1.0 | Meldingen werken alleen terwijl EduFlow open is |
| FR-AGE-27 | **De basisweek vult je schooldagen** | De ICS-export is de route naar echte herinneringen |
| FR-AGE-28 | **Een wijziging aan de basisweek geldt vanaf een datum** | Toestemming voor meldingen wordt niet ongevraagd opgevraagd |

Daarnaast twee betekeniswijzigingen die eruitzien als een bewuste correctie, niet als een
botsing — maar wel als een wijziging zonder zichtbaar besluit:

- **INV-49.** Oud: *"Er is precies één `Settings`-record. Een `User`-record bestaat in versie
  1.0 niet."* Nu: *"precies één `Settings`-record en precies één `User`-record."* Dat is
  precies de uitkomst van het verdwenen **T-50**. De uitkomst is dus meegegaan bij het
  splitsen, het besluit dat hem droeg niet.
- **B-70.** Oud: geldt voor de documentatiedatum, met een aparte regel voor een agenda-item.
  Nu: *"Een datum meer dan zeven dagen in de toekomst wordt geweigerd"* — zonder dat
  onderscheid.

---

## 4. Het scherpste conflict: de basisweek tegen B-85

Dit is het punt waarop herstel géén optie is zonder jouw besluit.

**De oude Bible (10 augustus, B-98 t/m B-102 en T-46)** besloot: de leerkracht vult zijn
normale week één keer in, de app zet die door naar zijn schooldagen, en **`recurrence` op een
agenda-item vervalt** — B-101 zegt letterlijk dat de basisweek "de enige echte toepassing
overneemt", omdat twee mechanismen voor "dit keer anders" de dubbele logica is die U-03
verbiedt.

**`BESLUITEN.md` B-85 (11 augustus)** besluit het omgekeerde: *"Alle vier de weergaven,
**herhalende afspraken**, slepen om te verplaatsen en de snelinvoer in gewone taal komen in de
doorloop."* Werkopdracht D09b heet dan ook "Herhalen, slepen, snelveld, meldingen, ICS".

Die twee kunnen niet allebei waar zijn. En de huidige documentatie staat op de oude kant van
B-101: `docs/06-2-modules-agenda.md:53` heeft `recurrence` nog gewoon als veld in de
veldtabel.

**De code staat op de andere kant.** `src/services/storage/tabellen.ts:90-91` declareert
`weekPatterns` en `weekPatternOverrides` als echte stores, en
`src/domain/schemas/weekPattern.ts` (69 regels) plus `weekPattern.test.ts` (112 regels)
bestaan. In `docs/08-datamodel.md` en `docs/09-domeinmodel.md` komt `weekPattern` **nul keer**
voor.

Antwoord op de vraag of `weekPattern.ts` weer door de Bible gedekt wordt: **nee, en dat kan
ook niet zonder te kiezen.** De basisweek terugzetten betekent B-85 terugdraaien. B-85 laten
staan betekent dat `weekPattern.ts`, zijn toets en twee Dexie-stores onder DR-01 verweesd
zijn en verwijderd horen te worden.

---

## 5. Het handboek schrijft een componentbibliotheek voor die er niet is

Het verdwenen **T-39** besloot: *de componentlaag is Base UI; Radix wordt niet geïnstalleerd.*
Zonder dat besluit staat het handboek weer op Radix:

| Waar | Wat er staat |
|---|---|
| `docs/16-logging-en-security.md:118` | `Radix UI` in de afhankelijkhedentabel van §16.8 |
| `docs/16-logging-en-security.md:124` | "geen componentbibliotheek buiten Radix" |
| `docs/11-ui-architectuur.md:111` | "Panelen en dialoogvensters komen uit Radix" |
| `docs/05-ontwerpfilosofie.md` | vier componentrijen die Radix Select, Switch, Checkbox, Tabs en Dialog voorschrijven |

In de code staat **nul** Radix. Elf bestanden importeren `@base-ui/react`, en dat pakket komt
in geen enkel hoofdstuk voor.

Dezelfde tabel schrijft `zustand`, `pdf-lib` en `pdfjs-dist` voor. Geen van drieën staat in
`package.json`. Omgekeerd staan `@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`,
`class-variance-authority`, `sonner`, `tw-animate-css` en `shadcn` wél in `package.json` en in
geen enkel hoofdstuk. Het verdwenen **T-45** was precies de regel die dat rechttrok.

§16.8 zegt zelf: *"Een nieuwe afhankelijkheid komt er alleen met een regel in het
besluitenregister."* Die regel bestond en is weg. DR-18 is daarmee in beide richtingen open.

---

## 6. Wat de zes gecontroleerde besluiten nu waard zijn

| Besluit | Wat het vastlegde | Staat de uitkomst nog in de hoofdstukken? | Volgt de code hem? |
|---|---|---|---|
| **T-39** Base UI | Base UI in plaats van Radix | **Nee** — de hoofdstukken zeggen Radix | Ja, `@base-ui/react` |
| **T-40** database | begint op `eduflow-v1`, geen migratieketen | **Nee** — `eduflow-v1` komt nergens voor | te controleren bij D01 |
| **T-45** afhankelijkheden | de volledige toegestane lijst | **Nee** — de lijst is de oude | Nee, zie §5 |
| **T-46** `LocalTime` | derde scalair tijdtype | **Nee** — `LocalTime` komt nergens voor | te controleren |
| **T-47** schemaversie | waar de schemaversie begint | Deels — `schemaVersion` staat in 7 hoofdstukken | ja |
| **T-48** vorm agenda-item | de twee varianten | Deels — `holidayPeriods` staat in 3 hoofdstukken | ja |
| **T-49** `holidayPeriods` | veldtabel | Deels — zie T-48 | ja |
| **T-50** `settings` en `User` | veldtabel plus het ontbrekende `User` | **Ja** — via INV-49, zonder het besluit | ja |
| **B-98 t/m B-102** basisweek | de basisweek, `recurrence` vervalt | **Nee** — en B-85 besluit het omgekeerde | Ja, `weekPatterns` |

Het patroon: bij T-47 t/m T-50 is de **uitkomst** meegegaan bij het splitsen en het
**besluit** niet. Bij T-39, T-40, T-45, T-46 en B-98 t/m B-102 is allebei weg.

Daarom is "zet T-39 t/m T-50 terug" niet uniform juist. Voor vier ervan zou het de
hoofdstukken tegenspreken die hun uitkomst al bevatten.

---

## 7. Wat er moet gebeuren, en wie het beslist

Vier keuzes. Alle vier zijn van de architect, niet van de programmeur.

**Keuze 1 — welk register bezit de nummering?** Drie wegen: `BESLUITEN.md` hernummeren naar
B-103 en verder (tien besluiten krijgen een nieuw nummer, de werkopdrachten-verwijzing naar
B-82 moet mee); of hoofdstuk 19 als historisch sluiten en `BESLUITEN.md` doorlaten tellen
vanaf het echte maximum; of de twee samenvoegen tot één register. Zolang deze keuze openstaat,
kan geen enkel nummer betrouwbaar worden toegekend.

**Keuze 2 — de basisweek of B-85.** Zie §4. Dit bepaalt of `weekPattern.ts`, zijn toets en de
twee stores blijven of verdwijnen.

**Keuze 3 — Base UI of Radix.** Zie §5. De code is al Base UI; het handboek zegt Radix. Eén
van beide moet wijken, en het is goedkoper het handboek bij te werken dan negentien
componenten te herbouwen — maar dat is een besluit met een `T-`nummer, geen aanname.

**Keuze 4 — de hergebruikte FR-nummers.** FR-AGE-25, 27 en 28 betekenen nu iets anders dan
in de oude Bible. Volgt keuze 2 op "basisweek terug", dan botsen ze; volgt hij op "B-85
blijft", dan zijn de oude betekenissen vervallen en hoort dat als zodanig te worden
opgeschreven in plaats van stilzwijgend.

---

## 8. Wat wél veilig is, en al gedaan

Eén nummer is onder elke uitkomst van keuze 1 vrij: **elk nummer boven het hoogste dat ooit is
vergeven.** Dat is B-102 en T-50, uit de oude Bible. `T-51` botst dus met niets, ongeacht welk
register wint.

Op die grond is `T-51` toegekend aan de plek van `useDienst` — zie `docs/BESLUITEN.md`. Dat is
het enige besluit dat in deze ronde is opgeschreven, en het raakt geen enkel bestaand nummer.
