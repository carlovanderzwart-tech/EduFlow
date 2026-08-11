# D00 — Inventarisatie van de bestaande repo

**Stap 1 van [`D00-bestaande-repo.md`](D00-bestaande-repo.md).** Opgemaakt op 11 augustus 2026,
op commit `41d8e3c`. Er is geen bestand verplaatst, hernoemd of gewijzigd; er is één bestand
toegevoegd, namelijk dit.

Gemeten met een importgraaf over alle 138 bestanden in `src/`, met `@/*` opgelost naar `src/*`
volgens `tsconfig.json`. De kolom "importeurs" telt andere bestanden die het bestand
rechtstreeks importeren — niet het aantal importregels, want één bestand importeert soms vier
dingen uit hetzelfde bestand.

> Toetsing gebeurt tegen [`docs/10-service-architectuur.md`](../10-service-architectuur.md)
> §10.2 en de importtabel daar, plus DR-11 t/m DR-18 uit
> [`docs/20-ontwikkelregels.md`](../20-ontwikkelregels.md).

---

## 0. De nulmeting: wat er nú rood staat

D00 §"Stap 2 en verder" eist dat je vóór een verplaatsing vastlegt wat er al rood was. Dat is
hier geen formaliteit: **twee van de drie poorten stonden al rood vóórdat D00 begon.**

| Commando | Uitkomst | |
|---|---|---|
| `pnpm typecheck` | exit 0 | schoon |
| `pnpm test` | **exit 1** | 3 van 298 toetsen rood, alle drie in `src/domain/dr-44.test.ts` |
| `pnpm lint` | **exit 1** | 48 fouten, 8 waarschuwingen |

`pnpm` staat niet in het PATH van deze omgeving; alles is gedraaid via `corepack pnpm`, dat de
vastgezette `pnpm@11.21.0` uit `package.json` gebruikt.

### 0.1 Waarom die drie toetsen rood staan

`eslint.config.mjs` is in commit `41d8e3c` volledig vervangen (341 regels gewijzigd). De nieuwe
versie **noemt de eigen lintregel achter DR-44 niet meer.** Het regelbestand
`eslint-rules/dr-44-geen-record-in-logregel.mjs` bestaat nog, maar is nergens geregistreerd, dus
`eduflow/dr-44-geen-record-in-logregel` levert nul meldingen op. De drie toetsen verwachten er
zeven en falen alle drie.

Dat is precies wat de toets zelf in zijn kopcommentaar als gevaar benoemt: een lintregel die
niets tegenhoudt wekt de indruk dat er iets bewaakt wordt. Op dit moment is **DR-44 — poort 1
van §16.9 — onbewaakt.**

Niet hier gerepareerd, conform D00 §"Wat je bewust niet doet". Dit is het eerste punt dat een
besluit vraagt.

### 0.2 De 56 lintmeldingen, per regel

| Aantal | Regel | Soort |
|---:|---|---|
| 25 | `@typescript-eslint/no-unnecessary-type-assertion` | fout |
| 13 | `@typescript-eslint/require-await` | fout |
| 8 | `max-lines-per-function` | waarschuwing (DR-53, bewust `warn`) |
| 5 | *(geen regel-id)* — parseerfout | fout |
| 4 | `@typescript-eslint/consistent-type-assertions` | fout |
| 1 | `@typescript-eslint/no-base-to-string` | fout |

Per zone: `services/` 27 · `lib/` 8 · `hooks/` 7 · `modules/` 5 · `components/` 2 · `domain/` 2.

De vijf parseerfouten zijn geen codefouten maar een configuratiegat: `eslint.config.mjs` zelf,
`postcss.config.mjs`, `scripts/gates/*.mjs` en het DR-44-regelbestand vallen buiten de
`projectService` van `tsconfig.json` en kunnen daarom niet getypeerd worden gelint.

**Deze 48 fouten zijn nieuw sinds `41d8e3c`.** Op de vorige commit (`deebd80`) gaf `pnpm lint`
exit 0. De oorzaak is dezelfde configuratiewissel: de nieuwe config zet
`recommendedTypeChecked` aan en laat `eslint-config-next` vallen.

### 0.3 Drie afhankelijkheden staan niet in `package.json`

`eslint.config.mjs` importeert `@eslint/js`, `typescript-eslint` en `eslint-plugin-import`. Alle
drie staan **niet** in `package.json`, maar wel in `node_modules` — meegelift via een andere
afhankelijkheid. Lint werkt daarmee bij toeval. Een `pnpm install --frozen-lockfile` op een
andere machine of in de bouwstraat kan ze wegnemen. Dat is een DR-18-punt: elke afhankelijkheid
is een besluit dat je opschrijft.

---

## 1. De huidige boom

138 bestanden, 11.709 regels. Twee niveaus diep, met het totaal van alles daaronder.

| Map | Bestanden | Regels | Waarvan |
|---|---:|---:|---|
| `src/app/` | 9 | 254 | 7 routebestanden, `layout.tsx`, `globals.css` |
| `src/components/` | 35 | 2.298 | `ui/` 19 · `common/` 11 · `layout/` 5 |
| `src/data/` | 1 | 0 | alleen `.gitkeep` |
| `src/domain/` | 56 | 4.259 | `schemas/` 28 · `types/` 17 · `events/` 8 · los 3 |
| `src/hooks/` | 4 | 445 | `useAutosave` + toets, `useDienst`, `.gitkeep` |
| `src/lib/` | 10 | 642 | 5 modules + 4 toetsen + `utils.ts` |
| `src/modules/` | 7 | 1.001 | 5 modules, elk met een extra `components/`-niveau |
| `src/services/` | 14 | 2.303 | `storage/` 6 · `settings/` 2 · `agenda/` 1 · `documentation/` 1 · `students/` 1 · los 3 |
| `src/test/` | 1 | 228 | `fixtures/testgegevens.ts` |
| `src/ui/` | 1 | 279 | alleen `tokens.css` |

Buiten `src/`: `e2e/` (1 bestand), `scripts/gates/` (2), `eslint-rules/` (1), plus de
configuratie in de wortel.

**Vijf van de tien mappen uit §10.2 bestaan al onder de juiste naam** (`app`, `domain`, `lib`,
`modules`, `services`, en `data` leeg). `ui/` bestaat sinds `41d8e3c` maar bevat alleen
`tokens.css`. `components/`, `hooks/` en `test/` komen in §10.2 niet voor.

---

## 2. Waar staat het nu, waar hoort het

"Straks" is de plek volgens §10.2. Waar §10.2 geen uitspraak doet, staat er **besluit** en volgt
de vraag in §4.

| Nu | Straks | Laag | Importeurs |
|---|---|---|---:|
| `app/page.tsx` | `app/(app)/dashboard/page.tsx` | `app` | 0 |
| `app/documentation/page.tsx` | `app/(app)/documentaties/page.tsx` | `app` | 0 |
| `app/documentation/[id]/page.tsx` | `app/(app)/documentaties/[id]/page.tsx` | `app` | 0 |
| `app/agenda/page.tsx` | `app/(app)/agenda/page.tsx` | `app` | 0 |
| `app/mail/page.tsx` | `app/(app)/mail/page.tsx` | `app` | 0 |
| `app/settings/page.tsx` | `app/(app)/instellingen/page.tsx` | `app` | 0 |
| `app/settings/students/page.tsx` | `app/(app)/instellingen/leerlingen/page.tsx` | `app` | 0 |
| `app/layout.tsx` | blijft | `app` | 0 |
| `app/globals.css` | **besluit** — naast `ui/tokens.css` | — | 1 |
| *(bestaat niet)* | `app/api/ai/route.ts` | `app` | — |
| *(bestaat niet)* | `app/api/mail/[...path]/route.ts` | `app` | — |
| *(bestaat niet)* | `app/api/health/route.ts` | `app` | — |
| `modules/documentation/components/DocumentationPage.tsx` | `modules/documentaties/DocumentationList.tsx` | `modules` | 1 |
| `modules/documentation/components/DocumentEditor.tsx` | `modules/documentaties/DocumentationEditor.tsx` | `modules` | 1 |
| `modules/agenda/components/AgendaPage.tsx` | `modules/agenda/AgendaPage.tsx` | `modules` | 1 |
| `modules/mail/components/MailPage.tsx` | `modules/mail/MailPage.tsx` | `modules` | 1 |
| `modules/dashboard/components/DashboardPage.tsx` | `modules/dashboard/DashboardPage.tsx` | `modules` | 1 |
| `modules/settings/components/SettingsPage.tsx` | `modules/instellingen/SettingsPage.tsx` | `modules` | 1 |
| `modules/settings/components/StudentsPage.tsx` | `modules/instellingen/StudentsPage.tsx` | `modules` | 1 |
| `components/ui/` (19 bestanden) | `ui/` | `ui` | 15 bestanden, samen 32 importregels |
| ├ `button.tsx` | `ui/button.tsx` | `ui` | 10 |
| ├ `input.tsx` · `skeleton.tsx` | `ui/` | `ui` | 5 · 5 |
| ├ `field.tsx` · `item.tsx` · `label.tsx` | `ui/` | `ui` | 4 · 4 · 4 |
| ├ `native-select.tsx` · `separator.tsx` · `switch.tsx` | `ui/` | `ui` | 2 · 2 · 2 |
| ├ `alert-dialog` · `checkbox` · `empty` · `sonner` · `spinner` · `textarea` | `ui/` | `ui` | 1 elk |
| └ `badge.tsx` · `dropdown-menu.tsx` · `sheet.tsx` · `tabs.tsx` | `ui/` | `ui` | **0** |
| `components/common/ErrorMessage.tsx` | `ui/ErrorMessage.tsx` | `ui` | 7 |
| `components/common/EmptyState.tsx` | `ui/EmptyState.tsx` | `ui` | 6 |
| `components/common/SaveStatus.tsx` | `ui/SaveStatus.tsx` | `ui` | 4 |
| `components/common/ConfirmDialog.tsx` | `ui/ConfirmDialog.tsx` | `ui` | 1 |
| `components/common/SearchField.tsx` | `ui/SearchField.tsx` | `ui` | 1 |
| `components/common/StorageWarning.tsx` | **besluit** — kan niet naar `ui/` | — | **0** |
| `components/common/*.test.tsx` (5) | mee met hun component | `ui` | 0 |
| *(`common/` als geheel: 11 bestanden)* | `ui/` | `ui` | 8 bestanden, samen 13 importregels |
| `components/layout/` (5 bestanden) | **besluit** — `ui/` of `app/` | — | 3 |
| `hooks/useAutosave.ts` + toets | `modules/documentaties/hooks/` | `modules` | 1 |
| `hooks/useDienst.ts` | **besluit** — generiek, 4 modules gebruiken hem | — | 5 |
| `services/storage/` (6) | blijft | `services` | `StorageService` 9 · `db` 4 |
| `services/documentation/DocumentationService.ts` | blijft | `services` | 2 |
| `services/agenda/AgendaService.ts` | blijft | `services` | 3 |
| `services/settings/` (2) | blijft | `services` | 2 · 3 |
| `services/students/StudentService.ts` | **besluit** — §10.2 kent geen `student/`-map | `services` | 4 |
| `services/diensten.ts` + toets | **besluit** — staat niet in §10.4 | `services` | 6 |
| `domain/types/` (17) · `schemas/` (28) · `events/` (8) | blijft | `domain` | `types/index` 15 · `schemas/base` 17 |
| `domain/toetsgegevens.ts` | **besluit** — testgegevens in `domain/` | — | 8 |
| `domain/__fixtures__/` · `domain/dr-44.test.ts` | **besluit** | — | 0 |
| `lib/` (uuid, dates, text, result, weergave) | blijft | `lib` | `uuid` 17 · `result` 7 · `dates` 6 |
| `lib/utils.ts` | blijft | `lib` | 22 — het meest geïmporteerde bestand van de repo |
| `test/fixtures/testgegevens.ts` | **besluit** — komt niet in §10.2 voor | — | **0** |
| `ui/tokens.css` | blijft | `ui` | **0** |
| `data/.gitkeep` | `data/schoolvakanties.json` | — | 0 |

Zeventien van de tweeëntwintig services uit §10.4 bestaan nog niet. Die komen met D01 t/m D11
en staan hier niet als rij, want er is niets te verplaatsen.

---

## 3. De overtredingen van de importtabel

### 3.1 Wat de graaf vindt

| # | Overgang | Aantal | Regel | Verdwijnt door |
|---|---|---:|---|---|
| 1 | `modules/` → `components/` | **43** | DR-11 — `components/` is geen zone in §10.2 | de verplaatsing zelf: `modules → ui` is toegestaan |
| 2 | `modules/` → `hooks/` | **5** | DR-11 — `hooks/` is geen zone in §10.2 | de verplaatsing, mits `useDienst` een plek krijgt |
| 3 | `hooks/` → `components/` | 1 | idem (`useAutosave` → `SaveStatus`) | de verplaatsing |
| 4 | `components/` → `services/` | **2** | wordt `ui → services`, en dat is verboden | **niet** — vraagt een besluit |
| 5 | `services/diensten.test.ts` → `services/storage/db.ts` | 1 | DR-13 naar de letter | **niet** — vraagt een besluit |

Overgang 4 is de enige die door verplaatsen erger wordt in plaats van beter.
`components/common/StorageWarning.tsx` importeert `services/storage/StorageService` en
`services/storage/start`. Zolang het bestand in `components/` staat, valt het buiten elke zone.
Zodra het `ui/` heet, overtreedt het "`ui/` mag alleen uit `lib/` importeren" — §10.2 zegt daar
letterlijk: *een component haalt geen gegevens op.*

Overgang 5: DR-13 zegt "niemand buiten `services/storage/`". `services/diensten.test.ts:23`
importeert `maakDatabase` uit `./storage/db` om een echte database voor de samenstellingstoets te
bouwen. Verdedigbaar, maar het staat buiten de map en de regel kent geen uitzondering voor
toetsen.

### 3.2 Wat schoon is

| Regel | Bevinding |
|---|---|
| DR-13 (Dexie) | **Schoon.** Exact één bestand importeert `dexie`: `services/storage/db.ts`. |
| DR-16 (`/api/ai`, `/api/mail`) | **Niets te overtreden.** Er is geen enkele `fetch` naar `/api` en `app/api/` bestaat niet. |
| DR-17 (service kent React) | **Schoon.** Geen enkel bestand in `services/` importeert `react`, `next` of iets uit `modules/`. |
| DR-33 (`localStorage`) | **Schoon.** Alleen `services/settings/voorkeuren.ts`, voor de zes apparaatvoorkeuren uit §8.2.2, en geïnjecteerd via `diensten.ts` in plaats van rechtstreeks. Geen persoonsgegeven. |
| `modules → modules` | **Schoon.** Nul gevallen. |
| `domain → services` · `lib → wat dan ook` | **Schoon.** Nul gevallen. |

### 3.3 DR-15 — regels die in een scherm staan

Vier harde domeingrenzen staan zowel in een schema als in een scherm. Dat is één waarde op twee
plekken, en dus U-03:

| Scherm | Waarde | Staat ook in |
|---|---|---|
| `modules/documentation/…/DocumentEditor.tsx:186` | `maxLength={120}` | `domain/schemas/documentation.ts:37` — `title: z.string().max(120)` |
| `modules/agenda/…/AgendaPage.tsx:210` | `maxLength={120}` | `domain/schemas/calendar.ts:38` — `title: z.string().min(1).max(120)` |
| `modules/settings/…/SettingsPage.tsx:175-176` | `min={1} max={365}` | `domain/schemas/settings.ts:37` — `attentionThresholdDays … min(1).max(365)` |
| `modules/settings/…/StudentsPage.tsx:88` | `maxLength={3}` | `domain/schemas/student.ts:27` — `lastNameInitial: z.string().max(3)` |

Daarnaast tweemaal een geldigheidsregel als knopvoorwaarde: `disabled={… || !title.trim()}`
(`AgendaPage.tsx:281`) en `!voornaam.trim()` (`StudentsPage.tsx:93`). Beide spiegelen de `min(1)`
uit het schema.

Wat géén DR-15-overtreding is, en dat expliciet: de datumhulptekst "Hoogstens een week vooruit"
in `DocumentEditor.tsx:195` beschríjft B-70 maar dwingt niets af — de service doet dat. Zo hoort
het. De `.length > 0`-vragen in de vier overzichten gaan over zichtbaarheid, en die mag een
scherm stellen.

### 3.4 De lintregels bewaken dit vandaag níét

`eslint.config.mjs` zet `import/no-restricted-paths` op `error` met veertien zones. Toch levert
`pnpm lint` **nul** laagmeldingen op. Reden: de zones benoemen alleen mappen die §10.2 kent, en de
overtredingen van §3.1 zitten juist in de drie mappen die §10.2 niet kent.

In dit lintregel is `target` de importerende kant en `from` de kant die niet geïmporteerd mag
worden. `{ target: "./ui", from: "./services" }` betekent dus: *`ui/` mag niet uit `services/`
importeren.*

- **Er is geen enkele zone die `components/` of `hooks/` noemt.** Daarmee zijn de 43 imports
  `modules → components`, de 5 `modules → hooks` en de 1 `hooks → components` voor de regel
  onzichtbaar — niet omdat de richting verkeerd staat, maar omdat de map in geen enkele zone
  voorkomt.
- De zone die de echte overtreding zou vangen, `{ target: "./ui", from: "./services" }`, wijst
  naar `./ui` — en die map bevatte tot D00 stap 2 alleen `tokens.css`. Er was dus niets te vangen.
  Zodra `StorageWarning.tsx` in `ui/` staat, grijpt deze zone wél aan; dat is overgang 4 uit §3.1.
- `{ target: "./modules/documentaties", … }` en `./modules/instellingen` bestaan niet; de mappen
  heten `documentation` en `settings`. Het verbod op onderling importeren tussen modules dekt nu
  dus alleen `agenda`, `mail` en `dashboard`.
- `{ target: "./modules", from: "./services/storage/db.ts" }` staat er, maar er is geen scherm
  dat `db` aanraakt — de overtreding die er wél is, staat in `services/` en valt buiten deze zone.

**Dit corrigeert de aanname in D00 stap 3.** Die stap gaat ervan uit dat de regels op `error`
honderden meldingen geven en daarom eerst op `warn` moeten. Dat gebeurt niet: het getal is nu nul
en blijft nul tot `components/` en `hooks/` niet meer bestaan. De regels zijn geen muur om af te
breken maar een muur die nog niet staat. Zet ze dus niet op `warn` — laat ze op `error` en
verwacht dat de verplaatsingen uit §5 het getal tijdelijk laten oplopen. Dat oplopen is het bewijs
dat de zone eindelijk aangrijpt.

*Nagemeten na D00 stap 1 en 2: nog steeds nul laagmeldingen, en lint nog steeds 48 fouten en 8
waarschuwingen. Dat is het verwachte gedrag — `ui/` bevat na stap 2 alleen bladcomponenten die
niets uit `services/` halen.*

---

## 4. Wat er in de repo staat en niet in §10.2

Niet om te schrappen — om te benoemen (DR-04).

### 4.1 Drie mappen die §10.2 niet kent

**`src/components/` — 35 bestanden, 2.298 regels.** §10.2 heeft `ui/` voor "het ontwerpsysteem
uit hoofdstuk 5". Drie duidelijk verschillende dingen zitten hier bij elkaar:

- `ui/` (19) — primitieven op Base UI. Horen één-op-één in `ui/`.
- `common/` (11) — vijf gedeelde patronen met toets, plus `StorageWarning`. Horen in `ui/`, op
  één na.
- `layout/` (5) — `AppShell`, `Sidebar`, `Topbar`, `BottomNav`, `nav-items.ts`. **Hoort dit in
  `ui/` of in `app/`?** §10.2 noemt geen schil. Ze importeren `next/link` en `next/navigation`;
  in `ui/` betekent dat het ontwerpsysteem Next kent. `nav-items.ts` is bovendien geen component
  maar data. Dit is een besluit waard.

**`src/hooks/` — 4 bestanden, 445 regels.** §10.2 zet hooks onder `modules/<module>/hooks/`.
Dat werkt voor `useAutosave` (dat is het autosave-mechanisme uit §10.7 en hoort bij
documentaties), maar niet voor `useDienst`: vijf importeurs uit vier verschillende modules. Een
generieke hook heeft in §10.2 geen plek. Besluit waard — kandidaten zijn `ui/`, een nieuwe
`modules/gedeeld/`, of `lib/` (maar `lib/` mag React niet kennen).

**`src/test/` — 1 bestand, 228 regels.** `fixtures/testgegevens.ts`, de verzonnen groep uit
bijlage A. Komt niet in §10.2 voor, en wordt door **nul** bestanden geïmporteerd.

### 4.2 Vijf dingen die bestaan maar nergens op aangesloten zijn

Alle vijf zijn echte code die niets doet. Dat is geen fout, maar het is wel de moeite waard te
weten vóór je iets verplaatst:

| Wat | Regels | Toestand |
|---|---:|---|
| `src/ui/tokens.css` | 279 | Nul importeurs. `app/layout.tsx:7` importeert `./globals.css`. §10.2 schrijft `ui/tokens.css` voor en noemt `globals.css` niet. Twee stijlingangen, één ongebruikt. |
| `src/test/fixtures/testgegevens.ts` | 228 | Nul importeurs. |
| `src/domain/events/` | 667 | De gebeurtenissenbus en zes gebeurtenisfamilies. **Niets buiten `domain/events/` importeert ze**; geen service publiceert, geen abonnee luistert. Verwacht — de publicerende services komen met D01 t/m D11 — maar wel goed om te weten. |
| `components/ui/badge · dropdown-menu · sheet · tabs` | 540 | Vier primitieven, nul importeurs. |
| `components/common/StorageWarning.tsx` | 48 | Nul importeurs, en tegelijk de enige echte laagovertreding uit §3.1. Verplaatsen zonder gebruiker is een besluit over dood hout. |

### 4.3 Bestanden die §10.2 niet benoemt maar die ergens thuishoren

| Wat | Regels | Beoordeling |
|---|---:|---|
| `services/diensten.ts` | 64 | De samenstellingswortel uit §10.3: hier krijgt elke service zijn echte afhankelijkheden. §10.4 noemt hem niet, terwijl §10.3 hem vereist. Hij hoort in `services/`; het is een besluit waard of §10.4 een rij mist. |
| `services/storage/{db,gebruik,start,tabellen}.ts` | 290 | Hulpmodules binnen de service die §10.2 wél noemt. Blijven staan. |
| `services/settings/voorkeuren.ts` | 145 | Idem, en de enige plek met `localStorage`. Blijft staan. |
| `lib/utils.ts` | 6 | De `cn`-functie. 22 importeurs — het meest geïmporteerde bestand van de repo. Gereedschap zonder domeinkennis, dus `lib/` is juist. |
| `lib/weergave.ts` | 96 | Weergavehulp (`vandaag()` en verwanten). Grenst aan `ui/`, maar kent geen React en geen domein. `lib/` is verdedigbaar. |
| `domain/toetsgegevens.ts` | 418 | Testgegevens in `domain/`, met 8 importeurs. Naast `src/test/fixtures/testgegevens.ts`, dat 0 importeurs heeft. **Twee bestanden met testgegevens op twee plekken** — dat vraagt één besluit voor beide. |
| `domain/__fixtures__/` + `domain/dr-44.test.ts` | 108 | Het bewijs voor de DR-44-lintregel. Hoort bij de regel, niet bij het domein. Zie §0.1: de regel is nu uitgeschakeld. |
| `eslint-rules/` | 1 bestand | Buiten `src/`, dus buiten §10.2. Nu niet geregistreerd. |

### 4.4 Wat §10.2 voorschrijft en nog niet bestaat

- `app/api/ai/route.ts`, `app/api/mail/[...path]/route.ts`, `app/api/health/route.ts` — geen van
  de drie route handlers uit §10.6.
- De `(app)`-routegroep, en Nederlandse routenamen (`documentaties`, `instellingen`).
- `data/schoolvakanties.json` — de map bestaat met alleen een `.gitkeep`.
- Zeventien van de tweeëntwintig services uit §10.4.

---

## 5. Voorgestelde volgorde van verplaatsen

Van minst naar meest riskant. "Geraakt" = bestanden die van plek gaan plus bestanden waarvan een
importregel moet veranderen. Elke stap is één sessie en één commit met `infra:` als gebied
(§20.3), met `pnpm typecheck` en de toetsen ervóór en erná.

Draai eerst de nulmeting uit §0 opnieuw, zodat je weet dat je met dezelfde 48 fouten en 3 rode
toetsen begint als hier vastgelegd.

| Stap | Wat | Geraakt | Risico |
|---:|---|---:|---|
| **1** | Het extra `components/`-niveau uit `modules/` halen: `modules/<m>/components/X.tsx` → `modules/<m>/X.tsx` | 7 + 7 | Laagst. Blijft binnen één zone, geen regel gaat aan of uit, geen importpad buiten `app/` verandert. |
| **2** | `components/ui/` → `ui/` | 19 + 15 | Laag. Zuiver mechanisch, 19 bladbestanden zonder eigen afhankelijkheden behalve `lib/utils`. Maakt `modules → ui` legaal en laat de `ui`-zone voor het eerst aangrijpen. |
| **3** | `components/common/` → `ui/`, met de vijf toetsen mee | 11 + 8 | Laag, **maar geblokkeerd**: `StorageWarning.tsx` kan niet mee (§3.1 overgang 4). Neem eerst het besluit uit §4.2, dan verhuist de rest zonder nadenken. |
| **4** | `components/layout/` naar zijn plek | 5 + 3 | Middel. Vraagt eerst het besluit `ui/` of `app/` uit §4.1. Raakt de schil die op elk scherm staat, dus een fout is meteen overal zichtbaar. |
| **5** | `hooks/` opheffen: `useAutosave` → `modules/documentaties/hooks/`, `useDienst` volgens besluit | 4 + 6 | Middel. Moet ná stap 3, want `useAutosave` importeert `SaveStatus`. `useDienst` heeft vijf importeurs uit vier modules en kan niet verhuizen zonder besluit. |
| **6** | Routes naar §10.2: `(app)`-groep plus Nederlandse namen | 12 bestanden, ±18 padteksten | **Hoogst.** Zie hieronder. |

### Waarom stap 6 apart staat

Dit is de enige stap die iets kan breken dat een gebruiker merkt, want elk adres in de app
verandert. De paden staan op vier plekken en `git mv` verplaatst er maar één:

- 7 routebestanden in `src/app/`
- `components/layout/nav-items.ts` — vijf `href`-waarden
- drie schermen met vijf harde paden: `DocumentationPage.tsx:37` en `:58`
  (`/documentation/nieuw`), `DocumentEditor.tsx:140` (een `window.history.replaceState` met een
  samengesteld pad, dus niet door een hernoeming gevonden) en `:167`, `SettingsPage.tsx:101`
- `e2e/accessibility.spec.ts` — zes paden in de schermenlijst

`DocumentEditor.tsx:140` is het gemene geval: het pad wordt daar met een template-tekenreeks
opgebouwd, dus geen zoek-en-vervang op `/documentation` vindt hem heel. Werkt hij niet, dan
maakt een tweede keer opslaan een tweede documentatie aan.

Doe deze stap daarom als laatste en apart, en draai `pnpm e2e` erná — dat is de enige poort die
een kapot adres aantoont.

### Wat géén verplaatsing is en dus niet in deze volgorde staat

Vijf besluiten, en het eerste blokkeert een poort die nu open staat:

1. **DR-44 weer aanzetten** (§0.1). De lintregel bestaat, is niet geregistreerd, en drie toetsen
   staan daardoor rood. Poort 1 van §16.9 is onbewaakt. Dit staat los van D00 en verdient
   voorrang boven elke verplaatsing.
2. **De 48 lintfouten en de drie ontbrekende afhankelijkheden** (§0.2, §0.3). Vóór of ná D00,
   maar met een eigen commit — anders weet je bij de eerste rode stap niet wat jij deed.
3. **`StorageWarning.tsx`** (§4.2): weg, naar `modules/`, of de opslagdata via een prop.
4. **`layout/`, `useDienst`, `globals.css` naast `tokens.css`** (§4.1, §4.2): drie plaatsen waar
   §10.2 geen antwoord geeft.
5. **Twee bestanden met testgegevens** (§4.3): `domain/toetsgegevens.ts` (8 importeurs) en
   `test/fixtures/testgegevens.ts` (0 importeurs). Eén besluit voor beide.

---

## Opgevallen, en niet aangeraakt

D00 §"Val niet in deze kuil": hier staat wat beter kan, zodat niemand het onderweg gaat repareren.

- **`components/layout/nav-items.ts:13`** verwijst naar `docs/04 - Product Blueprint.md`. Dat
  bestand staat sinds `deebd80` in `docs/archief/` en is niet meer normatief. Het commentaar
  wijst dus naar een document dat zichzelf niet meer geldig verklaart.
- **`app/globals.css` en `ui/tokens.css` bestaan naast elkaar**, 130 en 279 regels, en alleen de
  eerste wordt geïmporteerd. Wie de tweede aansluit zonder de eerste te bekijken, krijgt twee
  keer dezelfde variabele met misschien een andere waarde.
- **`modules/documentation/` heet enkelvoud**, §10.2 schrijft `documentaties` (meervoud). Ook
  `settings` → `instellingen`. §10.2 gebruikt Nederlandse mapnamen terwijl `CLAUDE.md`
  "Nederlandse schermtaal, Engelse code" voorschrijft. De lintzones in `eslint.config.mjs`
  gaan al uit van Nederlands, dus §10.2 en de configuratie zijn het eens; de spanning met
  `CLAUDE.md` blijft. Volgens de rangorde wint het handboek.
- **De boom in §10.2 en de tabel in §10.4 zijn niet volledig hetzelfde.** De boom noemt negentien
  servicebestanden en heeft geen map voor `StudentService`, `GroupService` en `SeriesService` —
  drie services die §10.4 wél als rij heeft. `services/students/` bestaat dus al zonder dat §10.2
  er een plek voor geeft. Zolang dat niet beslecht is, kan die map niet naar §10.2 verplaatst
  worden: er is geen doel.
- **`DocumentEditor.tsx` slaat op met een knop en niet met autosave**, terwijl `useAutosave.ts`
  (144 regels, met toets) klaarstaat en niet gebruikt wordt. Het bestand legt in zijn eigen
  commentaar uit waarom. §10.7 schrijft autosave voor. Dat is werk voor D05, niet voor D00.
- **`max-lines-per-function` waarschuwt acht keer**, waaronder `createStorageService` met 221
  regels tegen een maximum van 60. Staat bewust op `warn` tot de doorloop staat (DR-53).
