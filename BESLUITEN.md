# Besluiten sinds de Product Bible

Hoofdstuk 19 van het handboek bevat alle besluiten tot en met 7 augustus 2026. Dit
bestand is het vervolg: elke keuze die daarna de documenten verandert, met datum en
reden. Nieuwste bovenaan. Nummering loopt door op hoofdstuk 19.

---

# 11 augustus 2026 — na de afwijzing van Microsoft 365

## B-84 — De mailmodule krijgt geen postbus

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

## B-85 — De agenda wordt een volwaardige agenda

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

## B-86 — Meldingen alleen terwijl de app open is

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

## B-87 — Het plakveld voor een ontvangen mail, met verplichte detectoren

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

## T-34 — De mailadapters vervallen, de servicevorm blijft

**Besluit.** `services/mail/adapters/` vervalt; `MailService` houdt zijn plek in de
lagenstructuur maar heeft geen poort meer naar buiten. De nepmap uit werkopdracht D10 is
niet meer nodig en `src/data/nepmap.json` komt er niet.

**Waarom.** De service blijft bestaan omdat de regels (sjablonen, concepten, de
detectoren aanroepen, het controlepad) ergens moeten wonen en niet in een scherm horen
(DR-15). Alleen de buitenkant valt weg.

---

# 11 augustus 2026 — de doorloop

## B-81 — De nulmeting blokkeert de bouw niet

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

## B-82 — Een doorloop vóór de sprints

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

## B-83 — Twee Definitions of Done

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

## T-32 — De hoofdstukken zijn de bron, de monoliet is de archiefkopie

**Besluit.** Het handboek staat als losse hoofdstukken in `docs/`. `product-bible-volledig.md`
blijft bestaan voor menselijke lezers en voor de functionaris gegevensbescherming, maar
wordt tijdens een fase niet bijgewerkt; hij wordt aan het eind van elke fase opnieuw
samengesteld.

**Waarom.** Een AI-programmeur die 9.115 regels moet doorzoeken, leest in de praktijk een
willekeurige selectie. Verwijzen naar één hoofdstuk van 300 regels is het verschil tussen
raden en lezen.

**Gevolg.** DR-01 blijft gelden op hoofdstukniveau. `CLAUDE.md` verbiedt expliciet het
lezen van de monoliet.

## T-33 — De ontwerptekens komen vóór de componenten

**Besluit.** `src/ui/tokens.css` wordt in week 0 volledig ingevuld uit §5.3 t/m §5.6 —
alle kleuren, ruimtes, letters, stralen, schaduwen, maten, lagen en duren, licht en
donker. Componenten worden pas daarna gebouwd, en uitsluitend met tokens (DR-55).

**Waarom.** Vaste waarden die eenmaal in twintig componenten staan, komen er niet meer uit.
De donkere modus uit §18.4 is dan een tweede verbouwing in plaats van één regel.

---

# Openstaand

- **O-01 — Stijlvoorbeelden.** Drie of vier paren van een ruwe notitie, de gewenste
  documentatie en een doorgeschoten versie, met verzonnen namen (§12.9, FR-INS-16).
  **Dit is de enige openstaande post die alleen de opdrachtgever kan invullen, en zonder
  deze voorbeelden is de Definition of Done op het punt AI-kwaliteit niet in te vullen.**
- **O-02 — `schoolvakanties.json`.** Drie regio's, schooljaren 2026-2027 en 2027-2028,
  met versienummer en `validUntil` (§13.4). Nodig vóór werkopdracht D09.
- ~~**O-03 — Beheerdersgoedkeuring Microsoft 365.**~~ **Afgesloten op 11 augustus 2026:
  afgewezen.** Zie B-84. Dit staat er doorgestreept en niet verwijderd, omdat een
  openstaand punt dat verdwijnt zonder uitkomst er over een jaar uitziet als vergeten
  werk.
- **O-04 — Gesprek functionaris gegevensbescherming.** Voorwaarde vóór het eerste echte
  kind. Plannen zodra de doorloop staat, niet later (§1.5.5, §15.6).
