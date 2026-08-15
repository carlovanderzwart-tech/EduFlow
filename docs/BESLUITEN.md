# Besluiten sinds de Product Bible

> ## Laatst uitgegeven nummers: **B-123** · **T-46** · **INV-54** · **FR-AGE-31**
>
> **Lees deze regel vóór je een nummer uitgeeft, en werk hem bij zodra je er een uitgeeft.**
> Dit is de enige plek waar nieuwe nummers vandaan komen. Hoofdstuk 19 is gesloten (B-114).

Hoofdstuk 19 van het handboek bevat alle besluiten tot en met 7 augustus 2026 en is
daarmee historisch: er komt niets meer bij. Dit bestand is het vervolg — elke keuze die
daarna de documenten verandert, met datum en reden. Nieuwste bovenaan, nummering loopt
door op hoofdstuk 19.

---

# 16 augustus 2026 — tijdens D09b

## B-123 — `recurrence` komt terug; `B-101` heeft nooit bestaan

**Probleem.** `calendar.ts` schrijft: *"Er is geen `recurrence` (B-101). Een agenda-item
herhaalt niet; wat zich herhaalt is de basisweek."* Het schema laat het veld niet toe en
een toets bewaakt dat actief.

`B-101` staat nergens. Niet in hoofdstuk 19, niet in dit bestand, niet in het volledige
handboek. Het is hetzelfde soort spooknummer als de zes uit B-117, alleen viel deze buiten
de grep van dat besluit — die zocht op `T-4[5-9]`, `T-50` en `INV-5[4-9]`.

En dit spooknummer is niet alleen een losse verwijzing: het heeft **het model veranderd**.
Wat er werkelijk staat:

| Bron | Wat er staat |
|---|---|
| §6.2.2, veldtabel | `recurrence` \| regel \| nee \| geen \| zie 6.2.5 |
| §6.2.5 | "Alleen drie regels: elke week, elke twee weken, elke maand op dezelfde weekdag. Met een einddatum of een aantal keren." |
| `FR-AGE-15` | "Een herhaling wijzigen vraagt om reikwijdte" |
| B-115 | de basisweek "maakt daar gewone **herhalende agenda-items** van" |
| §9.5 | geen enkele invariant die herhaling verbiedt |

B-115 zegt dus het tegenovergestelde van wat het commentaar hem toeschrijft: de basisweek
bestaat júist bij de gratie van herhalende items. Zonder `recurrence` is B-115 niet te
bouwen, en werkopdracht D09b begint met "Herhalen".

**Besluit.** `recurrence` komt terug, precies zoals §6.2.5 hem beschrijft en niet ruimer:
drie frequenties, en een einde dat óf een datum óf een aantal is. Geen `RRULE`.

De vorm:

```ts
interface Recurrence {
  frequency: "wekelijks" | "tweewekelijks" | "maandelijks";
  until: IsoDate | null;   // precies één van deze twee is gevuld
  count: number | null;
  excludedDates: IsoDate[]; // de gaten van §6.2.5
}
```

**Waarom precies één van `until` en `count`.** §6.2.5 zegt "met een einddatum of een aantal
keren"; allebei leeg zou een reeks zonder einde opleveren, en die is in geen enkele weergave
te tellen en nooit klaar met uitrekenen. Allebei gevuld zou twee einden geven waarvan de
app er één moet kiezen — en welke, dat staat nergens.

**Waarom niet het spooknummer alsnog betekenis geven.** Dat is wat B-117 verbiedt en het is
hier extra verleidelijk, want het commentaar klínkt als een besluit. Maar er is nooit iemand
geweest die dit heeft afgewogen; er is een regel geschreven en er is een nummer bij gezet.

**Gevolg.** `Recurrence` staat in `domain/types/calendar.ts` en in het schema. De toets die
een herhaalregel weigerde, toetst nu dat een geldige regel wordt aanvaard en een ongeldige
niet. `RecurrenceService` rekent de instanties uit; de opslag draagt één record per reeks,
niet per instantie (U-02: wat af te leiden is, wordt niet opgeslagen).

**Herziening.** Vraagt iemand om een uitdrukking die deze drie regels niet aankunnen, dan
is dat een nieuw besluit met een eigen afweging — niet een uitbreiding van dit.

---

# 14 augustus 2026 — vier nummers die de code al gebruikte, en één uit D08

> Dit blok sluit B-117 af. De grep uit dat besluit gaf vier treffers in de code die naar een
> nummer wezen dat in dit register niet staat: `T-46`, `B-120`, `B-121` en `INV-57`. B-117
> schrijft voor wat er dan gebeurt — **óf een echt nummer uit dit register, óf de verwijzing
> gaat eruit** — en dat is hier gedaan. Drie kregen een nummer, één verwijzing ging eruit.

## T-46 — De importregel voor `app/providers/`

**Probleem.** `eslint.config.mjs` verbiedt `modules/` om uit `app/` te importeren (DR-11,
§10.2). Maar `useDienst` — de enige weg van scherm naar service — woont in
`app/providers/`, en elk scherm heeft hem nodig. Zonder uitzondering faalt de bouwstraat op
werkende code.

**Besluit.** Een module mag uit `app/` **alleen** `app/providers/` importeren. De schil en
de routes blijven van `app/` zelf.

**Waarom.** `providers/` draagt geen scherm en geen route; het is de aansluiting waar §10.10
om vraagt. De rest van `app/` is Next.js-bedrading en gaat een module niets aan. De regel
staat als zone in `eslint.config.mjs` en faalt de bouwstraat bij overtreding, zodat dit geen
afspraak op papier blijft.

**Gevolg.** Geen. De regel stond al in de configuratie en werd alleen niet gedragen door een
nummer uit dit register.

## B-120 — De toegangscode-cookie leeft negentig dagen, niet een jaar

**Probleem.** Twee hoofdstukken geven de cookie `eduflow_access` een andere looptijd.
FR-INS-37 (§6.5.11) zegt "een looptijd van **een jaar**"; §8.2.3 zegt in de tabelrij
`Max-Age` "**90 dagen** — lang genoeg om niet te irriteren, kort genoeg om een vergeten
apparaat te laten verlopen". `/api/toegang` zet die cookie en kan er maar één kiezen.

**Besluit.** **Negentig dagen.** FR-INS-37 wordt hierop gewijzigd; §8.2.3 blijft zoals hij is.

**Waarom.** §8.2.3 is de plek waar de cookie technisch is vastgelegd — naam, `httpOnly`,
`Secure`, `SameSite`, `Path` — en is de enige van de twee die een **reden** bij de looptijd
geeft. FR-INS-37 noemt het jaar terloops, in een zin die over gemak gaat.

De weging zelf: deze cookie is de enige sleutel tot documentaties over kinderen. Er zijn
geen accounts (B-21), dus er is geen manier om op afstand toegang in te trekken — FR-INS-38
laat je een apparaat intrekken, maar dat werkt alleen zolang je eraan denkt. Een laptop die
kwijtraakt en een jaar lang binnenkomt weegt niet op tegen één keer per kwartaal een code
overtikken.

**Gevolg.** `COOKIE_MAX_AGE_S` staat op 7.776.000 seconden, als benoemde constante (DR-54).

**Herziening.** Zodra toegang op afstand ingetrokken kan worden zonder dat het van het
geheugen van de gebruiker afhangt.

## B-121 — De rondgang krijgt `INV-54`; `INV-30` blijft van de agenda

**Probleem.** `INV-30` draagt twee dingen. In §9.5 (`09-domeinmodel.md`) is het "een
agenda-item heeft een begin en een einde"; in §12.5, §16.4 en NFR-25 is het
`restore(pseudonymise(t)) === t`. Dat is een botsing in het handboek zelf, geen leesfout.

Eerdere sessies gaven de rondgang `INV-57`. Dat nummer staat in de code, in poort 9 en in
gemergede commits, maar het is nooit in dít register uitgegeven — B-117 telt de `INV-`reeks
tot `INV-53` en verklaart alles daarboven tot spooknummer.

**Besluit.** De rondgang krijgt **`INV-54`**, het eerste vrije nummer. `INV-30` blijft van
de agendaregel in §9.5; die staat in het domeinmodel en is daar getoetst.

**Waarom niet `INV-57` alsnog uitgeven.** Dan zou dit register een nummer bekrachtigen dat
buiten het register is ontstaan, en drie nummers overslaan om een gok te sparen. Dat is de
onderbouwing naar de code toe schrijven — precies wat B-117 verbiedt. Eén keer omnummeren,
met de reden erbij, is goedkoper dan een reeks met een gat waar niemand de reden van kent.

**Gevolg.** `INV-57` komt in `src/` niet meer voor. Poort 9 en de toetsen in
`PrivacyService.test.ts` en `AIService.test.ts` dragen nu `INV-54`. Geen enkele regel of
drempel is gewijzigd — alleen het nummer.

**En de vierde treffer.** `weekPattern.ts` beriep zich op `B-121` voor "de basisweek heeft
geen invariantnummer, en dat is geen omissie". Die zin staat al in **B-115**: de basisweek
bestaat door een besluit en niet door een invariant. Daar wijst het commentaar nu naar, en
er is geen nieuw nummer voor nodig.

## B-122 — De tekst blijft in de doorloop op pagina 1 van layout A

**Probleem.** §5.10.2 laat bij zes foto's de lopende tekst verhuizen naar een vervolgpagina
in `E-vervolg`. Werkopdracht D08 zegt even uitdrukkelijk: `LayoutService` met **alleen**
`A-fotoraster`, en de andere vier layouts bouw je niet. Bij zes foto's plus tekst spreken
die twee elkaar tegen.

**Besluit.** In de doorloop **blijft de tekst op pagina 1**, in slot A6. Foto's die niet in
A1 t/m A5 passen schuiven door naar een volgende pagina in dezelfde layout — dat is §5.10.7
regel 2 en het vraagt geen nieuwe layout. Past de tekst niet in A6, dan meldt het
exportpaneel hoeveel er overblijft; er wordt niets stil afgekapt.

**Waarom.** De twee alternatieven zijn slechter. `E-vervolg` half bouwen levert een layout
op die niemand heeft getoetst en die D08 niet vraagt. De tekst laten vallen is de ene fout
die dit product zich niet kan permitteren: dan verstuur je een documentatie waarvan je denkt
dat je hem geschreven hebt. Doorschuiven van foto's is zichtbaar, telbaar en staat vooraf in
het paneel (`FR-DOC-112`, B-07).

**Gevolg.** Zes foto's plus tekst leveren twee pagina's en dus twee JPEG's, en het paneel
zegt dat vóórdat je exporteert. De DoD van D08 noemt één JPEG; dat punt is met §5.10.2 niet
te verenigen en het handboek wint (DR-01).

**Herziening.** Vervalt zodra `E-vervolg` er is (sprint 2, `FR-DOC-61` t/m `-70`). Dan geldt
§5.10.7 regel 4 weer onverkort.

---

# 13 augustus 2026 — de AI gaat naar achteren

## B-119 — De doorloop bouwt eerst alles zonder AI

**Probleem.** Vier dagen zijn opgegaan aan AI-randvoorwaarden: EU-residentie bij OpenAI die
niet bestaat voor dit account, tegoed, residentie bij Anthropic die er helemaal niet is,
providerkeuze, de grendel uit T-45. Er is in die dagen geen scherm bij gekomen. Ondertussen
zijn `O-01` — de stijlvoorbeelden — nog steeds niet geleverd, en **zonder die voorbeelden is
niet vast te stellen of de AI goed schrijft** (§12.9, bijlage A.4). We bouwen dus aan iets
dat we niet kunnen beoordelen, terwijl zeven werkopdrachten die niets met AI te maken hebben
staan te wachten.

**Besluit.** De doorloop wordt in twee blokken geknipt.

**Blok 1 — zonder AI.** D00, D01, D02, **D03**, D05, D07, D08, D09a, D09b, D11. Dit levert
een werkend documentatiegereedschap: foto's erin, tekst erbij, opmaak, export naar een
deelbare afbeelding, agenda met vier weergaven, overzicht met zoeken, dashboard.

**Blok 2 — de AI, ná de stijlvoorbeelden.** D04 (de route), D06 (laat AI meeschrijven),
D10 (mail). Deze drie beginnen pas als `O-01` er is.

**De uitzondering: D03 blijft in blok 1.** `PrivacyService` is geen AI-functie maar de
fundering eronder, hij is volledig te toetsen zonder één netwerkaanroep (`INV-30` is tekst
in, tekst uit), en het is precies wat Karin in september wil zien. Later inbouwen betekent
elke route naar de AI opnieuw langslopen — fout 1 uit §20.6.

**Waarom dit geen uitstel van het echte werk is.** §1.1.1 verdeelt de keten van 35 tot 50
minuten over vijf fasen. Drie daarvan — overzetten, opmaken en uitleveren, samen 18 tot 28
minuten — hebben niets met schrijven te maken, en dat is precies wat blok 1 wegneemt. Alleen
de schrijffase van 15 tot 25 minuten raakt AI. **Blok 1 levert dus ongeveer twee derde van de
tijdwinst op, zonder één AI-aanroep.**

Dat is ook geen nieuw idee: §1.7.2 beschrijft deze uitkomst al als de vooraf vastgelegde
uitweg — *"wat overblijft is een documentatiegereedschap met opmaak, pagina's, export, agenda
en zoeken, en dat bespaart nog steeds de achttien tot achtentwintig minuten"* — en §1.7.3
eist dat AI een functieschakelaar per module is. **Blok 1 maakt die schakelaar echt in
plaats van beloofd.** Als het gesprek met het bestuur ooit vastloopt op AI, is de uitwijk
dan geen noodplan maar de versie die er al staat.

**Wat je wél later beantwoordt.** De vraag waar het project op staat of valt — schrijft de
AI zoals jij? — blijft langer open. Dat is een echte prijs en hij staat hier eerlijk. Maar
hij was al niet te beantwoorden zonder `O-01`, dus dit besluit stelt niets uit dat vandaag
mogelijk was; het stopt alleen met de rest gijzelen.

**Gevolg voor mail.** De herschreven §6.3 is volledig AI: opdracht erin, mail eruit. Zonder
AI blijft er geen module over — een concept dat je zelf typt met een kopieerknop is een
kladblok. **D10 verhuist dus in zijn geheel naar blok 2**, inclusief de detectoren, want die
bestaan om iets af te schermen dat vervolgens verstuurd wordt. Het dashboard (D11) toont in
blok 1 daarom **drie** blokken: Deze week, Verder werken aan (alleen documentaties), en
Back-up. Aandacht en de mailconcepten komen erbij in blok 2.

**Niet besloten:** dat EduFlow permanent zonder AI verder gaat. Dat blijft een geldige versie
van dit product volgens §1.7.2, maar er is vandaag geen reden om dat te kiezen, en die keuze
hoeft pas gemaakt te worden als de meting uit §1.7.1 criterium 4 er ligt.

---

# 12 augustus 2026 — de EU-provider

## B-118 — EU-verwerking geldt vanaf de eerste echte gegevens, niet vanaf de eerste aanroep

**Probleem.** D04 strandde op het EU-eindpunt van OpenAI. De gestelde oplossing — "zet
EU data residency aan op het project" — bestaat niet als knop voor dit account.
Volgens OpenAI's eigen documentatie is regionale dataresidentie voorbehouden aan
**Enterprise-klanten die zijn goedgekeurd voor geavanceerde gegevenscontroles**, wordt hij
alleen ingesteld bij het **aanmaken van een nieuw project**, en vereist hij een aanvraag
via sales plus een aanvullende overeenkomst over bewaartermijnen. Een leerkracht met een
persoonlijk API-account komt daar niet doorheen, hoeveel tegoed hij ook opwaardeert.

Dat raakt T-06 (standaardprovider met verwerking binnen de EU) rechtstreeks, en het is
precies het punt waar §1.7.3 waarschuwt dat dit project kan vastlopen.

**Besluit.** Twee delen, en het onderscheid ertussen is het hele besluit.

1. **Tijdens de doorloop mag het wereldwijde eindpunt.** In de doorloop bestaat de app
   uitsluitend uit de verzonnen groep uit bijlage A. Twintig bedachte namen in een bedachte
   groep zijn geen persoonsgegeven; er is dus geen gegevensstroom die een EU-eis oproept.
   Dit is geen versoepeling van T-06 maar een verduidelijking van waar hij op slaat.
2. **Vóór het eerste echte kind draait de app op een EU-provider.** T-06 blijft onverkort
   gelden en is een voorwaarde in de Definition of Done, naast het gesprek met de
   functionaris (O-03).

**De grens is hard en zichtbaar.** De app weigert een AI-aanroep zodra de leerlingenlijst
iets anders bevat dan de verzonnen groep, tenzij de ingestelde provider EU-verwerking doet.
Zie T-45. Zonder die grendel is dit besluit een voornemen, en voornemens overleven een
drukke woensdag niet.

**Waarom niet stilzwijgend terugvallen.** Claude Code weigerde terecht om zonder besluit
naar het wereldwijde eindpunt te wijken. Dat is DR-04 in de praktijk. De juiste uitkomst is
niet doorbouwen zonder AI en ook niet stil omzeilen, maar dit: een besluit met een nummer,
een grens in code, en een datum waarop de echte oplossing er moet staan.

**Gevolg voor de providerkeuze.** De standaard uit T-06 kan geen OpenAI-project met
EU-residentie zijn. De twee zelfbedienbare routes die overblijven, allebei al genoemd in
§12.7:

| Route | Waarom | Wat het kost aan werk |
|---|---|---|
| **Google Vertex AI, regio `europe-west4` (Nederland)** | Zelf aan te zetten met een gewoon betaald account, geen verkoopgesprek. Verwerking in Nederland — de kortste zin in het gesprek met de functionaris | Een Google Cloud-project, Vertex AI aanzetten, een dienstaccount. Adapter `vertex-eu` staat al in §12.7 |
| **AWS Bedrock, `eu-central-1` (Frankfurt)** | Idem zelfbedienbaar, en de route naar Claude binnen de EU | Vergelijkbaar. Adapter `bedrock-eu` staat al in §12.7. Welke modellen daar beschikbaar zijn, wordt geverifieerd in de werkopdracht — niet aangenomen |
| ~~**Anthropic rechtstreeks**~~ | **Geen route.** Anthropic's eigen documentatie geeft voor de verwerkingsregio alleen `"global"` en `"us"`, en voor de opslagregio alleen `"us"` — die laatste is bovendien niet te wijzigen na het aanmaken van de werkruimte. Er is geen EU-optie, op geen enkel abonnement | — |

**Een derde route die de moeite van het meten waard is: een model op het apparaat zelf.**
Een lokaal model (bijvoorbeeld via Ollama op de laptop) is gratis en er gaat *niets* de
deur uit — geen EU-vraag, geen verwerkersovereenkomst, geen provider. Dat zou de sterkste
uitkomst zijn die dit product kan hebben: §12.13 wordt dan triviaal waar. Twee eerlijke
bezwaren: de schrijfkwaliteit in het Nederlands voor déze taak is vermoedelijk lager dan
criterium 4 uit §1.7.1 vraagt, en het vraagt een laptop die het aankan — wat de belofte
"werkt op telefoon en laptop" raakt. **Niet afwijzen op gevoel: meenemen in dezelfde
meting met de gouden testset.** Haalt het lokale model twee van de drie voorstellen
bruikbaar, dan vervalt het hele providervraagstuk.

**Gratis niveaus van cloudproviders zijn géén route.** Google zegt het zelf het duidelijkst:
op het gratis niveau wordt de inhoud gebruikt om hun producten te verbeteren, op het betaalde
niveau niet. Voor de verzonnen groep is dat onschadelijk, maar het betekent dat het gratis
niveau een doodlopende weg is die je vóór echte gegevens toch moet verlaten — en dan doe je
de verhuizing twee keer. Bovendien kost het hele doorloop-traject aan echte aanroepen
minder dan tien euro; geld is hier de schaarste niet.

**Let op — een abonnement is geen API-toegang.** Een account op claude.ai of chatgpt.com,
inclusief een onderwijs- of teacheraccount, geeft geen sleutel voor `/api/ai`. Dat is een
apart account met eigen tegoed. Dit is een veelgemaakte aanname en hij kost een avond.

**Hoe de keuze straks gemaakt wordt.** Niet op voorkeur maar met de gouden testset uit
§12.9: dezelfde ruwe notities door beide providers halen en tellen hoeveel voorstellen
bruikbaar zijn zonder herschrijven. Dat is criterium 4 uit §1.7.1 en precies waarvoor die
testset bestaat. Daarmee is de providerkeuze een meting en geen mening — en dat is ook het
antwoord als het bestuur later vraagt waarom deze en niet die.

Beide leveren een verwerkersovereenkomst die het bestuur kan tekenen — het punt waarop
§1.7.3 zegt dat het gesprek doorgaat of stopt. De keuze tussen de twee is een `T-`besluit
bij werkopdracht D04b en hoeft nu niet gemaakt te worden.

## T-45 — De grendel op de leerlingenlijst

**Besluit.** `PrivacyService.gate()` krijgt er één controle bij, náást de bestaande poort op
een lege lijst (FR-INS-20): staat de ingestelde provider niet op EU-verwerking, dan is een
AI-aanroep alleen toegestaan als de leerlingenlijst exact de verzonnen groep uit
`src/test/fixtures/testgegevens.ts` is. Wijkt hij af, dan blokkeert de app met de tekst
*"Deze provider verwerkt buiten de EU. Kies in Instellingen een EU-provider voordat je met
echte namen werkt."*

**Waarom in `PrivacyService` en niet in een scherm.** Omdat het een regel is en geen
zichtbaarheid (DR-15), en omdat elke route naar de AI door deze functie gaat (DR-31). Een
controle in het scherm is een controle die je omzeilt zodra er een tweede scherm komt.

**Toets.** Een toets met de naam `T-45` die faalt zodra er één naam buiten de verzonnen
groep in de lijst staat bij een niet-EU-provider. Die toets is het bewijs dat je aan Karin
laat zien.

---

# 11 augustus 2026 — spooknummers

## B-117 — `T-45` t/m `T-50` en `INV-54` t/m `INV-56` hebben nooit bestaan; O-11 vervalt

**Probleem.** Er stond een openstaand punt `O-11`: uitzoeken wat er achter `T-47` t/m
`T-50` en `INV-54` t/m `INV-56` zat.

**Bevinding.** Niets. Nagekeken in `product-bible-volledig.md`, alle 9.115 regels:

| Reeks | Loopt in het handboek tot | Uitgegeven daarna | Dus vrij vanaf |
|---|---|---|---|
| `T-` technische besluiten | `T-38` (§19.4) | `T-39` t/m `T-44` (B-114) | `T-45` |
| `INV-` invarianten | `INV-53` (§9.5) | geen | `INV-54` |

`T-45` t/m `T-50` en `INV-54` t/m `INV-56` komen in geen enkel hoofdstuk voor, ook niet als
verwijzing. Ze zijn nooit uitgegeven en er is dus ook niets verloren gegaan.

**Besluit.** `O-11` vervalt; er valt niets uit te zoeken. Elke plek in de repo die naar een
van deze nummers verwijst, is een verwijzing naar iets dat niet bestaat en wordt zo
behandeld: **òf hij krijgt een echt nummer uit dit register, òf de verwijzing gaat eruit.**
Niet: het nummer alsnog een betekenis geven die erbij past — dan schrijf je de
onderbouwing achteraf naar de code toe, en dat is precies omgekeerd (DR-01).

**Waarom dit gebeurde.** Dezelfde oorzaak als de drie eerdere nummerbotsingen en als de
verzonnen verwijzing naar §19.5: er was geen plek waar stond welk nummer als laatste was
uitgegeven, dus werd er geraden. Sinds B-114 staat dat bovenaan dit bestand. Dit is het
laatste spoor van de oude werkwijze, geen nieuw probleem.

**Vind ze zo:**

```
git grep -nE "\b(T-4[5-9]|T-50|INV-5[4-9]|INV-6[0-9])\b"
```

---

# 11 augustus 2026 — vier keuzes uit de tweede D00-ronde

## B-114 — Eén register geeft nummers uit, en hoofdstuk 19 is gesloten

**Probleem.** Voor de derde keer in een week botsen besluitnummers. §19.2 loste dit op
7 augustus al een keer op, en het gebeurde opnieuw: de eerste versie van dit bestand gaf
`B-81` t/m `B-91` en `T-32` t/m `T-37` uit, terwijl hoofdstuk 19 tot en met `B-97` en
`T-38` loopt. Alle zeventien botsten.

**Besluit.** Drie dingen, en het derde is het enige dat het echt oplost.

1. **Hoofdstuk 19 is gesloten** per 7 augustus 2026. Het is de historische lijst. Er komt
   nooit meer een nummer bij.
2. **Dit bestand is de enige uitgifteplek.** De nummering loopt door: `B-103` en verder,
   `T-39` en verder. De genoemde nummers zijn hernummerd; er is niets aan de bestaande
   besluiten van vóór 8 augustus veranderd, want daar wordt in code, commits en toetsen
   naar verwezen (DR-57).
3. **Bovenaan dit bestand staat het laatst uitgegeven nummer.** Wie een nummer nodig heeft,
   leest die regel, neemt de volgende, en werkt de regel bij. Eén regel, één handeling.

**Waarom niet hernummeren of samenvoegen.** Hernummeren van bestaande besluiten breekt elke
verwijzing in commit-boodschappen, codecommentaar en toetsnamen — DR-57 vraagt juist om die
verwijzingen. Samenvoegen tot één bestand maakt een document van 300 besluiten dat niemand
meer opent. Een gesloten archief plus een lopend register is de kleinste oplossing die het
probleem echt wegneemt (U-05).

**Gevolg.** `B-81`→`B-103`, `B-82`→`B-104`, `B-83`→`B-105`, `B-84`→`B-106`, `B-85`→`B-107`,
`B-86`→`B-108`, `B-87`→`B-109`, `B-88`→`B-110`, `B-89`→`B-111`, `B-90`→`B-112`,
`B-91`→`B-113`. `T-32`→`T-39` tot en met `T-37`→`T-44`. Alle verwijzingen in `docs/` zijn
meegewijzigd.

## B-115 — De basisweek blijft, maar wordt geen tweede mechanisme

**Probleem.** De repo kent een basisweek: het vaste weekrooster van de groep. B-107 zet
daarnaast herhalende afspraken in de agenda. Twee mechanismen voor één probleem is precies
wat U-05 en DR-03 verbieden, maar de basisweek weggooien haalt het handigste stuk eruit —
je vult je gymles, je muziekles en je bouwvergadering één keer in en niet twintig keer.

**Besluit.** **De basisweek is een invoerscherm, geen tweede gegevensmodel.** Je vult er je
vaste week in, en de app maakt daar gewone herhalende agenda-items van. Daarna gedragen ze
zich als elk ander item: verplaatsbaar, te wijzigen met "alleen deze of alle volgende"
(`FR-AGE-15`), en ze gaan mee in de ICS-export.

**Waarom.** Eén mechanisme onder de motorkap, één snelle route erboven. Een basisweek die
zijn eigen records heeft, betekent dat elke functie — verplaatsen, exporteren, meldingen,
zoeken — twee keer gebouwd en twee keer getoetst moet worden, en dat de twee stilletjes uit
elkaar lopen.

**Gevolg.** De basisweek krijgt `FR-AGE-29` t/m `FR-AGE-31` (zie hieronder) en hoort bij
werkopdracht D09b, niet bij D09a. Bestaande code die een eigen basisweek-record schrijft,
wordt in D09b omgezet naar het genereren van herhalende items.

> **Als "basisweek" in jouw repo iets anders betekent dan het vaste weekrooster van de
> groep, zeg dat dan — dan herzie ik dit besluit.** De rest van de redenering blijft
> staan: één mechanisme, en het handige scherm erboven.

### Nieuwe eisen

**FR-AGE-29 — De basisweek is een invoerscherm.** *Gegeven* Instellingen → Agenda →
Basisweek, *wanneer* je een vast onderdeel invult met dag, tijd en naam, *dan* maakt de app
een wekelijks herhalend agenda-item voor de duur van het schooljaar.

**FR-AGE-30 — Een gegenereerd item is een gewoon item.** *Gegeven* een item uit de
basisweek, *dan* is het te verplaatsen, te wijzigen en te verwijderen zoals elk ander item,
met dezelfde vraag "alleen deze, of alle volgende?" (`FR-AGE-15`).

**FR-AGE-31 — De basisweek is zichtbaar als herkomst, niet als eigenaar.** *Gegeven* een
gegenereerd item, *dan* toont het detailvenster "uit je basisweek" als herkomst. Wijzig je
de basisweek daarna, *dan* raakt dat de reeds gewijzigde items niet.

## B-116 — Radix blijft; er komt geen tweede componentbibliotheek

**Probleem.** `components/ui/` bevat negentien primitieven in shadcn-vorm, gebouwd op
Radix. De vraag is of `ui/` daarop verder gaat of overstapt naar Base UI.

**Besluit.** **Radix blijft.** Er komt geen tweede bibliotheek en geen migratie.

**Waarom.** De bewijslast ligt bij het wisselen, niet bij het houden. DR-18 vraagt een
`T-`besluit met een reden voor een nieuwe afhankelijkheid, en "nieuwer" is geen reden.
Negentien primitieven omzetten is een week werk waarvan geen enkele eis in hoofdstuk 6 of
17 beter wordt, en het zou midden in de doorloop gebeuren, terwijl de mappen ook al
verhuizen. Twee verbouwingen tegelijk in dezelfde bestanden is hoe je een weekend verliest
zonder te weten waaraan.

**Gevolg.** `claude-design/BRIEF.md` krijgt de regel dat componenten op de bestaande
Radix-primitieven gebouwd worden en niet vanaf nul. Anders levert Claude Design straks een
bibliotheek die niet past op wat er al staat — en dan is het alsnog een migratie, maar dan
per ongeluk.

## Over de hergebruikte FR-nummers

Volgt uit B-115. Elk `FR-`nummer dat in de repo is verzonnen en niet in hoofdstuk 6 staat,
verhuist naar de vrije ruimte van zijn eigen module — voor de agenda is dat `FR-AGE-29` en
verder, want `FR-AGE-01` t/m `-28` zijn vergeven. Dezelfde regel als bij de besluiten:
**hoofdstuk 6 is de bron, en een nummer dat daar niet staat, bestaat niet.** Claude Code
levert de omzettabel als onderdeel van D09b.

---

# 11 augustus 2026 — naar aanleiding van de D00-inventarisatie (PR #36)

## T-42 — Getypte lintcontrole komt in sprint 6, niet nu

**Probleem.** De meegeleverde `eslint.config.mjs` zette `recommendedTypeChecked` aan en
liet `eslint-config-next` vallen. Gevolg: `pnpm lint` ging van exit 0 naar 48 fouten en 8
waarschuwingen. Die 48 zijn geen nieuwe fouten — het zijn bestaande plekken die een
strengere controle nu ziet. Ze repareren is een opschoonactie, en D00 verbiedt die
expliciet.

**Besluit.** `recommendedTypeChecked` wordt teruggezet naar `recommended`.
`eslint-config-next` komt terug. De regels die geen typeinformatie nodig hebben blijven
wél op `error`: `no-explicit-any` (DR-21), `ban-ts-comment` (DR-22), de zones van DR-11,
en `no-restricted-syntax` voor DR-32, DR-37 en DR-42. Getypte controle komt in sprint 6,
samen met NFR-47.

**Waarom.** Een codebase van 35 pull requests voor het eerst getypt linten is een eigen
project. Met 48 rode meldingen als vertrekpunt is "lint is groen" geen poort meer, en dan
is elke verplaatsing in D00 blind.

## T-43 — Drie ontbrekende afhankelijkheden vastleggen

**Probleem.** `@eslint/js`, `typescript-eslint` en `eslint-plugin-import` staan alleen in
`node_modules` en niet in `package.json`. Lint werkt bij toeval; `pnpm install
--frozen-lockfile` op een andere machine breekt.

**Besluit.** Alle drie als `devDependencies` vastleggen, plus
`eslint-import-resolver-typescript`. Dit is de `T-`goedkeuring die DR-18 vraagt.

## T-44 — `tokens.css` wordt ingelezen door `globals.css`

**Probleem.** `src/ui/tokens.css` heeft nul importeurs; `globals.css` draait actief met
eigen vaste waarden. Twee bronnen voor dezelfde waarden is fout 2 uit §20.6.

**Besluit.** `globals.css` begint met `@import "../ui/tokens.css";`. De vaste waarden erin
worden vervangen door tokens tijdens stap 2 van D00, wanneer `components/ui/` toch naar
`ui/` verhuist. Niet eerder, want dan is het een wijziging vermomd als verplaatsing.

## B-110 — `StorageWarning.tsx` wordt verwijderd

**Probleem.** Nul importeurs, en het enige echte laagconflict in de repo: het haalt
gegevens op uit `services/storage/` terwijl het in `ui/` thuishoort, waar dat niet mag.

**Besluit.** Verwijderen, in de stap waarin `components/common/` verhuist.

**Waarom.** Dood hout dat bovendien de enige blokkade voor stap 3 is. **Dit verwijdert de
eis niet:** `FR-INS-34` (waarschuwing bij 80% opslaggebruik) staat in sprint 6 en wordt
daar opnieuw gebouwd, dan wel goed — het scherm toont, de service meet.

## B-111 — De schil hoort bij `app/`, niet bij `ui/`

**Probleem.** `components/layout/` (AppShell, Sidebar, Topbar, BottomNav, navigatiedata)
importeert de navigatie van Next. §10.2 wijst geen plek aan. In `ui/` zetten maakt het
ontwerpsysteem raamwerkbewust.

**Besluit.** `src/app/(app)/_shell/`. Daarmee blijft `ui/` los te bekijken en te bouwen —
precies wat Claude Design nodig heeft om componenten te tonen zonder de app te starten.

**Aanvulling op §10.2:** er komt één map bij, `src/app/providers/`, voor React-context die
diensten in de boom hangt. Daar gaat `useDienst` heen. `services/` blijft daarmee vrij van
React (DR-17) en de composition root `services/diensten.ts` blijft waar hij is.
`useAutosave` gaat naar `modules/documentaties/hooks/`, zoals §10.2 al voorschrijft.

## B-112 — Eén plek voor testgegevens, samengevoegd in D01

**Probleem.** `domain/toetsgegevens.ts` (418 regels, 8 importeurs) en
`test/fixtures/testgegevens.ts` (228 regels, 0 importeurs) bevatten allebei testgegevens.
`domain/` is voor typen, schema's en invarianten — niet voor gegevens.

**Besluit.** De blijvende plek is `src/test/fixtures/`. **Bijlage A is normatief voor de
inhoud:** de twintig namen van Groep 4 — De Regenboog, de drie reeksen en de drie groepen
staan vast omdat elke naam een geval dekt dat `PrivacyService` moet aankunnen. Samenvoegen
gebeurt in D01, niet in D00 — daar worden de domeintypen toch aangeraakt. Tot die tijd komt
er geen nieuwe importeur bij op `domain/toetsgegevens.ts`.

## B-113 — De routewijziging gaat naar een eigen werkopdracht, ná D01

**Probleem.** Stap 6 van de inventarisatie (de `(app)`-groep en Nederlandse routenamen, 12
routes en ±18 padteksten) is de enige stap die zichtbaar kapot kan gaan. `DocumentEditor`
bouwt zijn pad op met een sjabloontekenreeks; geen zoek-en-vervang vindt die heel, en als
hij breekt maakt een tweede keer opslaan een tweede documentatie aan.

**Besluit.** Stap 6 wordt werkopdracht `D00b-routes.md` en gebeurt **ná D01**.

**Waarom.** Na D01 is `FR-DOC-01` ("een documentatie ontstaat bij de eerste inhoud")
afgedwongen in `DocumentationService` en niet meer in een scherm. Een verkeerd pad kan dan
hoogstens een navigatiefout geven en geen dubbel record. Dezelfde stap, hetzelfde werk,
maar het ergste gevolg is weg.

## Correctie op D00 stap 3 — de aanname klopte niet

D00 stap 3 voorspelde honderden laagmeldingen die je eerst op `warn` zou zetten. De teller
staat op nul: de veertien zones wijzen naar `./ui`, `./modules/documentaties` en
`./modules/instellingen`, en die mappen heten vandaag `components`, `documentation` en
`settings`. De regels grijpen dus nergens aan.

**De inventarisatie heeft gelijk en D00 stap 3 had ongelijk.** De zones blijven op
`error`. Verwacht dat het getal tijdens elke verplaatsing tijdelijk oploopt — dat is het
bewijs dat de zone eindelijk aangrijpt — en aan het eind van die stap weer op nul staat.
Stap 3 van D00 is hierop herschreven.

---

# 11 augustus 2026 — na de afwijzing van Microsoft 365

## B-106 — De mailmodule krijgt geen postbus

**Probleem.** De aanvraag voor beheerdersgoedkeuring op Microsoft 365 is afgewezen. §6.3
stond volledig op een gekoppelde postbus: lezen, samenvatten, een concept terugschrijven.
Zonder goedkeuring bestaat die module niet, en een tweede aanvraag lost niets op — het is
de organisatie die zegt dat een externe toepassing geen postbustoegang krijgt.

**Besluit.** De module Mail wordt herschreven tot wat hij zonder koppeling kan zijn: **je
geeft een opdracht in gewone taal, de AI levert een mail met onderwerp en tekst, jij
kopieert hem naar je eigen mailprogramma.** Geen postvak, geen OAuth, geen tokens, geen
adapters. Gmail vervalt in hetzelfde besluit: één mailroute of geen — twee adapters
onderhouden voor een module die in beide gevallen op dezelfde muur stuit, is werk zonder
uitkomst.

**Waarom.** Dit is de helft van §1.1.4 waar de app wél iets aan kan doen. Het terugvinden
en lezen van de mail waar je op antwoordt, kan Outlook prima; wat Outlook niet kan is de
toon kiezen, en dat was toch al het zware deel — twaalf tot twintig minuten per mail, en
het zwaarste deel is niet het typen.

**Gevolg.** §6.3 is herschreven. Elf eisen zijn ingetrokken (`FR-MAI-01`, `-03` t/m `-11`,
`-14`); zie de tabel in §6.3.7. `T-15` (tokenopslag) vervalt. `T-30` en `DR-42` blijven
staan: het schrappen van een controle vereist een besluit, en DR-42 is nu triviaal te
handhaven. Het blok *Postvak* verdwijnt uit het dashboard, dat daarmee vier blokken heeft.
De vijf AI-bewerkingen die door B-04 naar versie 1.1 waren geschoven, komen terug in 1.0
(`FR-MAI-36`) — de module is nu klein genoeg om ze te dragen.

**Wanneer dit terugkomt.** §13.6: bij meer dan tien gebruikers binnen één bestuur, met een
bestaande verwerkersovereenkomst, en met een ICT-coördinator die de goedkeuring namens de
organisatie aanvraagt in plaats van namens een leerkracht. Dat is fase 2.

## B-107 — De agenda wordt een volwaardige agenda

**Probleem.** §18.3 verdeelde de agenda over sprint 4 en liet dag- en weekweergave,
herhalingen, slepen en het snelveld daar staan. Met de agenda als volwaardig onderdeel van
het programma is een maandweergave zonder herhalingen geen agenda maar een overzicht.

**Besluit.** Alle vier de weergaven (dag, week, maand, jaar), herhalende afspraken, slepen
om te verplaatsen en de snelinvoer in gewone taal komen in de doorloop. De agenda moet
aanvoelen als de agenda-app die de gebruiker al kent.

**Waarom.** Een agenda die je naast je echte agenda moet gebruiken, gebruik je niet. Dat
is faalscenario drie uit §1.7.4 in zijn zuiverste vorm: een tweede plek om iets in te
vullen.

**Gevolg.** Werkopdracht D09 valt uiteen in D09a (weergaven en vakanties) en D09b
(afspraken, herhalen, verplaatsen, snelveld). De doorloop groeit van ±15 naar ±18
dagdelen. Sprint 4 uit §18.3 wordt daarmee grotendeels leeg en verschuift naar afwerken:
ICS, verjaardagen, en de koppelingen naar documentatie en mail.

## B-108 — Meldingen alleen terwijl de app open is

**Probleem.** "Misschien via het web meldingen kunnen geven?" Het antwoord is
ongemakkelijker dan het lijkt. De **Notification Triggers API** — de enige manier om een
melding lokaal in te plannen die afgaat terwijl de app dicht is — is door Chrome
definitief gestaakt; de reden die het Chrome-team zelf geeft, is dat een geannuleerde
afspraak niet betrouwbaar uit de wachtrij te halen was. **Web Push** werkt wel, ook op
iOS sinds 16.4 en alleen voor een webapp op het beginscherm — wat B-02 toch al eist —
maar loopt altijd via een pushdienst. Dat betekent een server die weet *wanneer* jouw
afspraak is.

**Besluit.** EduFlow toont meldingen via de Notification API, maar **alleen terwijl de app
in een tabblad open staat**, ook op de achtergrond. Er komt geen pushserver en dus geen
melding als de app dicht is. In Instellingen → Agenda staat dat er letterlijk bij, met de
verwijzing naar de ICS-export.

**Waarom.** De variant met een pushserver was verdedigbaar — een server die alleen een
tijdstip en een apparaat-abonnement bewaart en een melding zonder inhoud stuurt, leert
niets over een kind. Maar het is een derde server, een derde gegevensstroom, een extra
gesprek met de functionaris en een afhankelijkheid die kapot kan op een moment dat je het
niet merkt. Voor een eenmansproject in de doorloopfase weegt dat niet op tegen de winst,
zeker niet omdat er een betere route is die niets kost.

**Gevolg.** `FR-AGE-25` is herschreven, `FR-AGE-27` en `FR-AGE-28` zijn toegevoegd. De
eerlijke tekst in Instellingen is onderdeel van het besluit, niet een toelichting erop: een
gemiste herinnering waarvan je dacht dat hij zou komen, is erger dan een herinnering die je
nooit verwachtte.

**De route die wél werkt.** De ICS-export (`FR-AGE-20`) zet je schooljaar in de agenda-app
van je telefoon, en díé geeft meldingen — beter dan een webapp ooit gaat doen, en zonder
dat er iets naar een server gaat. `FR-AGE-27` maakt dat expliciet: na een wijziging toont
het agendascherm hoeveel items er zijn veranderd en biedt een nieuwe export aan. De
stabiele `UID` uit `FR-AGE-20` zorgt dat de tweede import geen dubbelen maakt.
**EduFlow bezit het schooljaar; de telefoon doet het klokwerk.**

## B-109 — Het plakveld voor een ontvangen mail, met verplichte detectoren

**Probleem.** Zonder postbus zal de leerkracht die op een oudermail wil antwoorden, die
mail ergens in de app plakken. §1.4.4 wijst een chatbot af met precies dit argument: *een
leeg invoerveld nodigt uit tot plakken, en wat er geplakt wordt is een oudermail met een
achternaam, een telefoonnummer en de naam van een behandelaar.*

**Besluit.** Er komt een apart veld **"De mail waarop je antwoordt"**, met de detectoren
uit `FR-MAI-24` die dráíen zodra je plakt — vóór de knop, vóór de aanroep, vóór het
controlescherm — en die tonen wat ze hebben gevonden. Het controlescherm blijft hier niet
over te slaan (`FR-MAI-12`). Het plakveld wordt niet opgeslagen (`FR-MAI-35`).

**Waarom.** De keuze is niet óf het gebeurt, maar of het gebeurt in een veld dat erop
voorbereid is of in een veld dat er niets mee doet. Een bekend risico met een vangnet is
beter dan hetzelfde risico verstopt in een opdrachtveld.

**Gevolg.** `FR-MAI-33` t/m `FR-MAI-35` toegevoegd. `services/privacy/detectors.ts` komt in
de doorloop en niet in sprint 5. In het gesprek met de functionaris is dit één regel:
*"wij lezen geen postbus; wij hebben één veld waar de gebruiker zelf een mail in kan
plakken, en dit is wat daar gebeurt."*

## T-41 — De mailadapters vervallen, de servicevorm blijft

**Besluit.** `services/mail/adapters/` vervalt; `MailService` houdt zijn plek in de
lagenstructuur maar heeft geen poort meer naar buiten. De nepmap uit werkopdracht D10 is
niet meer nodig en `src/data/nepmap.json` komt er niet.

**Waarom.** De service blijft bestaan omdat de regels (sjablonen, concepten, de
detectoren aanroepen, het controlepad) ergens moeten wonen en niet in een scherm horen
(DR-15). Alleen de buitenkant valt weg.

---

# 11 augustus 2026 — de doorloop

## B-103 — De nulmeting blokkeert de bouw niet

**Probleem.** §1.6.1 zegt: *"Pas als die twaalf metingen compleet zijn, begint sprint 1"* —
en de nulmeting loopt van 24 augustus tot en met 18 september 2026. §18.2 zet sprint 1 op
11 augustus tot 14 september. Die twee kunnen niet allebei waar zijn, en de strengste
lezing kost vijf weken bouwtijd.

**Besluit.** De bouw start op 11 augustus. De nulmeting loopt van 24 augustus tot 18
september volgens hetzelfde protocol, maar hij meet de *huidige* werkwijze en heeft de
app dus niet nodig. Voorwaarde: de twaalf gemeten documentaties worden op de oude manier
gemaakt, niet in EduFlow, ook niet gedeeltelijk.

**Waarom.** De nulmeting bestaat om de belofte breekbaar te maken. Dat doel wordt gehaald
zolang de twaalf metingen zuiver zijn; het wordt niet beter door er ook nog de bouw op te
laten wachten. Wachten kost daarentegen wél de enige meetperiode van dit schooljaar
(§1.8.1) en schuift het gesprek met de functionaris gegevensbescherming van september
naar december.

**Gevolg.** §1.6.1 wordt aangepast: "Pas als die twaalf metingen compleet zijn, begint
sprint 1" vervalt en wordt "De twaalf metingen worden op de oude manier gemaakt, ook als
de bouw al is begonnen." §18.2 blijft ongewijzigd.

## B-104 — Een doorloop vóór de sprints

**Probleem.** De sprintvolgorde uit §18.3 bouwt module voor module diep uit. Het product
als geheel is daarmee pas in sprint 6 (april 2027) voor het eerst te zien of te tonen.
Twee dingen breken daarop: de motivatie van een eenmansproject, en §1.5.5, dat Karins
moment op *één middag in september 2026* zet — met een werkende app op het scherm.

**Besluit.** Vóór sprint 1 komt een **doorloop** (v0.1): alle vijf de modules dun maar
echt werkend, in tien werkopdrachten. Daarna gaan de sprints uit §18.3 door in dezelfde
volgorde, maar op een fundament dat al is gezien.

**Waarom.** De architectuur uit hoofdstuk 10 blijkt pas te kloppen als er vijf modules op
staan; dat in sprint 5 ontdekken is duur. En het FG-gesprek verschuift van december naar
september, wat de poort met drie maanden vervroegt.

**Gevolg.** §18.2 krijgt een fase vóór sprint 1. De werkopdrachten staan in
`docs/werkopdrachten/`. Wat in de doorloop bewust dun blijft, staat in werkopdracht
`README.md` en komt terug in de sprint waar het hoort.

## B-105 — Twee Definitions of Done

**Probleem.** De acht punten uit §18.6 bevatten een zelfreview van minstens 24 uur later
(B-80) en één werkdag echt gebruiken. Toegepast op elke stap van de doorloop kost elke
werkopdracht minimaal twee kalenderdagen, ongeacht zijn omvang.

**Besluit.** De doorloop kent een eigen Definition of Done met drie punten: het draait
zonder fouten in de console, de geautomatiseerde toetsen zijn groen, en de opdrachtgever
heeft het één keer zelf gedaan met de verzonnen groep. De acht punten uit §18.6 gelden
onverkort vanaf v0.9 en zijn hoe dan ook verplicht vóór het eerste echte kind.

**Waarom.** De acht punten zijn niet te streng, ze zijn te streng voor deze fase. Punt 5
(nieuwe gegevensstroom besproken met de functionaris) blijft ook in de doorloop gelden,
want dat is geen kwaliteitspoort maar een grens.

## T-39 — De hoofdstukken zijn de bron, de monoliet is de archiefkopie

**Besluit.** Het handboek staat als losse hoofdstukken in `docs/`. `product-bible-volledig.md`
blijft bestaan voor menselijke lezers en voor de functionaris gegevensbescherming, maar
wordt tijdens een fase niet bijgewerkt; hij wordt aan het eind van elke fase opnieuw
samengesteld.

**Waarom.** Een AI-programmeur die 9.115 regels moet doorzoeken, leest in de praktijk een
willekeurige selectie. Verwijzen naar één hoofdstuk van 300 regels is het verschil tussen
raden en lezen.

**Gevolg.** DR-01 blijft gelden op hoofdstukniveau. `CLAUDE.md` verbiedt expliciet het
lezen van de monoliet.

## T-40 — De ontwerptekens komen vóór de componenten

**Besluit.** `src/ui/tokens.css` wordt in week 0 volledig ingevuld uit §5.3 t/m §5.6 —
alle kleuren, ruimtes, letters, stralen, schaduwen, maten, lagen en duren, licht en
donker. Componenten worden pas daarna gebouwd, en uitsluitend met tokens (DR-55).

**Waarom.** Vaste waarden die eenmaal in twintig componenten staan, komen er niet meer uit.
De donkere modus uit §18.4 is dan een tweede verbouwing in plaats van één regel.

---

# Openstaand

> **Nummering gecorrigeerd op 11 augustus 2026.** Dit blok gebruikte eerst `O-01` t/m
> `O-04` opnieuw, terwijl §19.5 die nummers al vergeven heeft aan `O-01` t/m `O-07`. Dat
> is precies de botsing die §19.2 op 7 augustus heeft opgeruimd, en hij was hier per
> ongeluk teruggezet. Hieronder gelden de nummers uit §19.5; alleen wat écht nieuw is,
> krijgt een nieuw nummer vanaf `O-08`.

- **O-01 — Stijlvoorbeelden** *(§19.5, ongewijzigd)*. Drie of vier paren van een ruwe
  notitie, de gewenste documentatie en een doorgeschoten versie, met verzonnen namen
  (§12.9, FR-INS-16). **Dit is de enige openstaande post die alleen de opdrachtgever kan
  invullen, en zonder deze voorbeelden is de Definition of Done op het punt AI-kwaliteit
  niet in te vullen.**
- **O-03 — Gesprek functionaris gegevensbescherming** *(§19.5)*. Door B-104 verschuift het
  moment van december naar september 2026: zodra de doorloop staat, niet later
  (§1.5.5, §15.6).
- **O-05 — Nulmeting** *(§19.5)*. Twaalf documentaties handmatig geklokt, 24 augustus tot
  18 september 2026. Door B-103 blokkeert dit de bouw niet meer.
- **O-06 — Vakantiebestand vullen** *(§19.5)*. Drie regio's, met versienummer en
  `validUntil` (§13.4). §19.5 zegt "vóór sprint 4"; door B-107 is dat vervroegd naar
  **vóór werkopdracht D09a**. De schooljaren 2026-2027 en 2027-2028 volstaan voor nu.
- ~~**O-08 — Beheerdersgoedkeuring Microsoft 365.**~~ **Afgesloten op 11 augustus 2026:
  afgewezen.** Zie B-106. Dit staat er doorgestreept en niet verwijderd, omdat een
  openstaand punt dat verdwijnt zonder uitkomst er over een jaar uitziet als vergeten werk.
- **O-09 — De bestaande repository naar §10.2.** De repository is 35 pull requests diep;
  de opzet-opdracht in `SETUP.md` ging uit van een leeg project. Zie werkopdracht
  `D00-bestaande-repo.md`, die die opdracht vervangt.
