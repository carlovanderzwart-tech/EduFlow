<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 11. UI-architectuur

### 11.1 Renderstrategie

EduFlow is een clienttoepassing met een dunne serverschil. Concreet:

- De routes onder `app/(app)/` zijn serveronderdelen die niets doen behalve de schil en de metagegevens leveren.
- Alles wat gegevens toont, is een cliëntonderdeel. Dat kan niet anders: de gegevens staan in IndexedDB en die bestaat alleen in de browser.
- Er is geen serverweergave van gebruikersgegevens, geen serveractie die gegevens schrijft, en geen datalaag op de server. De route handlers uit §10.6 zijn de enige serverlogica.

Dat is een bewuste beperking van het framework: Next.js wordt hier gebruikt voor de routering, de bundeling en de route handlers, niet voor het weergeven op de server. Wie later toch serverweergave wil, moet eerst de server een bron van waarheid maken, en dat is fase 2 (§8.10).

### 11.2 Toestand: vier soorten, vier plekken

De veelgemaakte fout is alles in één store stoppen. Er zijn vier soorten toestand en ze horen niet bij elkaar.

| Soort | Voorbeeld | Waar hij hoort | Waarom |
|---|---|---|---|
| Servergegevens | documentaties, agenda-items | `useLiveQuery` op Dexie via de service | de opslag is de bron; een kopie in een store is een tweede waarheid (U-02) |
| Schermtoestand | geopende panelen, geselecteerde pagina, filters | Zustand, per module | verdwijnt bij herladen en dat is goed |
| Formuliertoestand | het tekstvlak terwijl je typt | lokale component-toestand | moet zo dicht mogelijk bij de toetsaanslag zitten |
| URL-toestand | welke documentatie, welke weergave, welke datum | de route | deelbaar, terug-knop werkt |

`useLiveQuery` van Dexie is hier het gereedschap dat het meeste werk uit handen neemt: een component dat een documentatie toont, wordt automatisch opnieuw getekend als die documentatie in IndexedDB verandert, ook als de wijziging uit een ander tabblad kwam. Er is geen handmatige ongeldigverklaring en geen cache die kan verlopen.

**De regel:** een component vraagt gegevens op via een hook die een service aanroept. Nooit rechtstreeks via Dexie (DR-13).

```typescript
export function useDocumentation(id: Uuid) {
  const svc = useServices().documentation;
  return useLiveQuery(() => svc.get(id), [id]);
}
```

### 11.3 De schil

| Breekpunt | Navigatie | Inhoud |
|---|---|---|
| ≥ 1280 px | vaste zijbalk 240 px met vijf bestemmingen en labels | tot 1200 px inhoudsbreedte, gecentreerd |
| 1024-1279 px | zijbalk 64 px, alleen iconen met toegankelijke naam | volle breedte min zijbalk |
| 768-1023 px | zijbalk ingeklapt, uitschuifbaar | volle breedte |
| < 768 px | onderbalk met vijf bestemmingen | volle breedte |

Er is geen hamburgermenu, op geen enkel breekpunt. Dat is de UX-regel uit §4.2 en het is de reden dat er precies vijf bestemmingen zijn: meer past niet in een onderbalk, en dat is een gezonde beperking.

De onderbalk op de telefoon is 56 px hoog plus de veilige zone van het apparaat. Hij verdwijnt niet bij het schuiven; verdwijnende navigatie kost meer aandacht dan hij ruimte oplevert.

### 11.4 Schermenregister

| ID | Scherm | Route | Module |
|---|---|---|---|
| S-01 | Dashboard | `/` | DAS |
| S-02 | Overzicht documentaties | `/documentaties` | DOC |
| S-03 | Schrijfscherm | `/documentaties/[id]` | DOC |
| S-04 | Gespreksmodus | `/documentaties/[id]/gesprek` | DOC |
| S-05 | Reeksweergave | `/documentaties/reeks/[id]` | DOC |
| S-06 | Prullenbak | `/documentaties/prullenbak` | DOC |
| S-07 | Agenda | `/agenda` | AGE |
| S-08 | Postvak | `/mail` | MAI |
| S-09 | Bericht | `/mail/[id]` | MAI |
| S-10 | Mailconcept | `/mail/concept/[id]` | MAI |
| S-11 | Instellingen | `/instellingen/[sectie]` | INS |
| S-12 | Eerste keer | `/welkom` | INS |
| S-13 | Toegangscode | `/toegang` | — |

Panelen zijn geen schermen en hebben geen route, met één uitzondering: het exportpaneel krijgt `?export=1` in de URL zodat de terug-knop hem sluit in plaats van het scherm te verlaten. Dat geldt ook voor het controlescherm (`?controle=1`).

| Paneel | Waar | Sluit met |
|---|---|---|
| Exportpaneel | S-03 | Esc, terug-knop, kruisje |
| Controlescherm | S-03, S-04, S-09, S-10 | Esc, terug-knop, Annuleren |
| Paginanavigator | S-03 | Esc |
| Filters | S-02, S-07 | Esc, buiten klikken |
| Fotobijsnijder | S-03 | Esc, Annuleren |

### 11.5 Componenthiërarchie van het schrijfscherm

Het schrijfscherm is het zwaarste scherm van de app en de plek waar prestatieproblemen het eerst zichtbaar worden.

```
DocumentationEditor
├─ EditorHeader          titel, datum, reeks, koppelingen, status
├─ EditorBody
│  ├─ TextArea           ongecontroleerd, met eigen toestand
│  ├─ QuoteList
│  ├─ PhotoGrid
│  │  └─ PhotoTile ×n    miniatuur uit de thumb-variant
│  └─ AiSuggestion       verschijnt onder de tekst, niet in een paneel
├─ PageNavigator         strook met paginaminiaturen
├─ EditorFooter          opslagindicator, Print-PDF, Deelbare afbeelding
├─ ExportPanel           lui geladen
└─ ReviewPanel           lui geladen
```

**Vier prestatieregels voor dit scherm:**

1. `TextArea` is een ongecontroleerd veld met eigen toestand. Elke toetsaanslag door een store laten lopen kost bij 20.000 tekens meer dan de 50 ms uit NFR-03.
2. `PhotoTile` toont uitsluitend de `thumb`-variant. De `screen`-variant wordt pas geladen bij het bijsnijden, de `print`-variant alleen bij het exporteren.
3. `ExportPanel` en `ReviewPanel` worden lui geladen. Ze bevatten `pdf-lib` en `pdf.js`, samen ruim 400 kB; die horen niet in de eerste lading van een scherm waarin je begint met typen.
4. Streamende AI-tekst wordt in een eigen component getekend, zodat elke binnenkomende brok alleen dat component opnieuw tekent en niet het tekstvlak waarin je aan het werk bent. Tekst mag nooit onder de cursor wegschuiven (§4.5).

### 11.6 Toegankelijkheid in de bouw

WCAG 2.2 AA is de vloer (§4.9). Wat dat in de bouw betekent:

- Elk interactief element is een echt element: `button`, `a`, `input`. Geen `div` met een klikafhandelaar.
- Panelen en dialoogvensters komen uit Radix, met focusopsluiting, `aria-modal`, Esc en het herstellen van de focus op het element dat het paneel opende. Zelf bouwen is hier een bekende bron van fouten.
- Focus is altijd zichtbaar: een omtrek van 2 px in de accentkleur met 2 px afstand, ook op donkere achtergronden.
- Elke wijziging die niet op de plek van de focus zichtbaar is, wordt gemeld in een `aria-live="polite"`-gebied: "Opgeslagen", "Voorstel klaar", "Foto toegevoegd", "3 van 11 treffers".
- Iconen zonder tekst hebben een `aria-label` in het Nederlands.
- Doelgrootte minimaal 24 × 24 CSS-px, op aanraakschermen 44 × 44.
- Slepen heeft altijd een toetsenbordtegenhanger (B-38).
- `prefers-reduced-motion` schakelt alle overgangen uit behalve het verschijnen en verdwijnen van focus.

**In de bouwstraat** draait `axe-core` op elk scherm in de Playwright-tests, en faalt de bouw bij een overtreding van niveau AA (DR-38).

### 11.7 Foutgrenzen en herstel

Er zijn drie niveaus van foutafhandeling:

| Niveau | Waar | Gedrag |
|---|---|---|
| Verwacht | een service geeft `Result` met `ok: false` | het scherm toont de melding uit `AppError.message` met de aangeboden actie; niets breekt |
| Onverwacht in een onderdeel | foutgrens rond elk hoofdgebied | dat gebied toont "Er ging hier iets mis" met "Opnieuw proberen"; de rest van het scherm blijft werken |
| Onverwacht in de schil | foutgrens op de wortel | volledig scherm met de melding, een knop "Herlaad", en de zin "Je werk staat op dit apparaat en is niet verdwenen" |

De foutgrens rond het schrijfscherm slaat vóór het tonen van de melding de huidige tekst weg in `sessionStorage` onder een sleutel met de documentatie-id, en biedt hem bij de volgende opening aan als herstelversie. Dat is de laatste vangrail onder "werk gaat nooit verloren".

### 11.8 Bundelomvang als eis

| Bundel | Grens | Inhoud |
|---|---|---|
| Eerste lading (schil plus dashboard) | 180 kB gecomprimeerd | React, router, ontwerpsysteem, Dexie, dashboardschermen |
| Documentaties | 90 kB | schrijfscherm, overzicht, gespreksmodus |
| Export | 420 kB | `pdf-lib`, `pdf.js`, layoutdefinities |
| Agenda | 60 kB | weergaven, ICS |
| Mail | 70 kB | postvak, concepten |
| Instellingen | 80 kB | dertien secties |

De bouwstraat faalt bij overschrijding van meer dan 10 procent (DR-39). De reden dat dit een harde eis is en geen streven: een leerkracht opent de app op een schoolnetwerk dat op een dinsdagochtend door dertig klassen wordt gedeeld.

### 11.9 De weg van een gegeven door de lagen

Ter afsluiting, één handeling helemaal uitgeschreven — een citaat toevoegen — omdat daaruit blijkt waar elke laag ophoudt.

1. **Scherm.** `QuoteList` toont een leeg veld; de gebruiker typt en kiest een leerling. Het component weet niets van opslag.
2. **Hook.** `useDocumentationEditor.addQuote(text, studentId)` roept de service aan. De hook weet niets van regels.
3. **Service.** `PageService.addBlock(pageId, { kind: "quote", text, studentId })` valideert met Zod, controleert INV-09 (hoogstens één leerling), bepaalt het slot via `LayoutService`, en schrijft in één transactie de pagina weg met een verhoogde `rev`.
4. **Opslag.** `StorageService` zet `updatedAt`, `rev` en `origin`, schrijft een regel in `changeLog`, en voert de transactie uit.
5. **Gebeurtenis.** `DocumentationContentChanged` gaat de bus op.
6. **Abonnees.** `SearchService` werkt de index bij, `StyleService` neemt de tekst mee in de volgende meting, `LayoutService` herberekent of er een vervolgpagina nodig is.
7. **Terug naar het scherm.** `useLiveQuery` merkt de wijziging in Dexie op en tekent `QuoteList` opnieuw. Het scherm heeft nooit iets teruggekregen van de service behalve `Result.ok`.

Op geen enkel punt in deze keten weet een component wat een citaat betekent, en op geen enkel punt weet een service hoe een citaat eruitziet. Dat is waar U-02 en U-03 samen op neerkomen.

---
