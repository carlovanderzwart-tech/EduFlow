<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     HERSCHREVEN op 11 augustus 2026 door besluit B-106 en B-109.
     De oorspronkelijke §6.3 beschreef een module met een gekoppelde postbus. Die
     koppeling komt er niet; de aanvraag voor beheerdersgoedkeuring op Microsoft 365
     is afgewezen. De oude tekst staat nog in docs/product-bible-volledig.md.
     Wijzigingen lopen via docs/BESLUITEN.md -->

# Hoofdstuk 6.3 — Mail

## 6.3.1 Wat deze module wel en niet is

De module Mail schrijft mails. Hij leest je postbus niet, hij koppelt met niets, en hij
verstuurt niets.

Je geeft een opdracht in gewone taal — *"antwoord op deze mail van de moeder van Kjeld,
zij vraagt naar het gedrag in de kring, ik wil warm maar duidelijk zijn en zeggen dat we
het bij het oudergesprek van 14 oktober verder bespreken"* — en de app levert een mail met
onderwerp en tekst. Je leest hem na, past aan, kopieert hem, en plakt hem in je eigen
mailprogramma.

Dat is de helft van het probleem uit §1.1.4. De andere helft — het terugvinden en lezen
van de mail waar je op antwoordt — blijft in Outlook, en dat is niet erg: dat kan Outlook
prima. Wat Outlook niet kan is de toon kiezen, en dat was toch al het zware deel.

**Wat er vervalt ten opzichte van de oorspronkelijke §6.3:** het postvak, de berichtcache,
zoeken via de aanbieder, samenvatten van een ontvangen bericht, het terugschrijven van een
concept in je eigen postbus, OAuth, tokens en beide adapters. De bijbehorende eisen zijn
ingetrokken; zie de tabel in §6.3.7.

**Wat blijft:** er is geen verzendknop, en er komt er geen (U-01, B-20). De reden is nu
zelfs sterker dan eerst: er is niets om mee te versturen. DR-42 blijft gelden.

## 6.3.2 Het scherm

Eén scherm, drie velden onder elkaar, in de leeskolom.

| Veld | Verplicht | Waarvoor |
|---|---|---|
| **Waar gaat het over** | ja | Je opdracht in gewone taal. Minimaal 20 tekens, anders is de knop uit |
| **De mail waarop je antwoordt** | nee | Plakveld. Zie §6.3.4 — dit is de gevaarlijkste plek van de hele app |
| **Toon** | nee | Zakelijk · warm · kort · uitgebreid. Standaard uit Instellingen |

Daaronder de knop **"Schrijf de mail"**, en na afloop het resultaat met een onderwerp en
een tekst, beide te bewerken.

**FR-MAI-30 — De opdracht is het enige verplichte veld.**
*Gegeven* het mailscherm, *wanneer* het opdrachtveld minder dan 20 tekens bevat, *dan* is
de knop uit. *Gegeven* dat alleen de opdracht is ingevuld, *dan* werkt de module volledig.

**FR-MAI-31 — De uitkomst is een onderwerp plus een tekst.**
*Gegeven* een geslaagde aanroep, *dan* levert de app een onderwerp van ten hoogste tien
woorden en een tekst, allebei in een bewerkbaar veld. Het onderwerp wordt nooit stilzwijgend
overgenomen in een opgeslagen concept zonder dat je het hebt gezien (vergelijk FR-DOC-92).

**FR-MAI-32 — Een tweede versie vervangt de eerste niet ongevraagd.**
*Gegeven* een resultaat, *wanneer* je "Opnieuw" kiest, *dan* geldt hetzelfde als bij
documentatie: hoogstens drie pogingen (FR-DOC-82), en overnemen vraagt of je de vorige
versie vervangt. Ongedaan maken overleeft een herlading (T-07).

## 6.3.3 De sjablonen

**FR-MAI-16 — Sjablonen zijn te wijzigen en toe te voegen.** *(ongewijzigd)*
Zeven meegeleverde sjablonen vullen het opdrachtveld voor: uitnodiging oudergesprek,
bevestiging afspraak, terugkoppeling na een gesprek, melding van een activiteit,
antwoord op een vraag, verzoek om materiaal, en een lege. Een sjabloon is een tekstskelet
voor jouw opdracht — geen prompt en geen AI-instructie. Dat onderscheid is er zodat je
kunt zien wat je verstuurt.

## 6.3.4 Het plakveld, en waarom het de gevaarlijkste plek van de app is

Een ontvangen oudermail bevat de achternaam van het kind, de naam en het adres van de
ouder, een telefoonnummer in de ondertekening, soms de naam van een arts of behandelaar.
Dat is precies de opsomming uit §1.1.4, en het is de reden dat §1.4.4 een chatbot afwijst:
*een leeg invoerveld nodigt uit tot plakken.*

Hier is dat invoerveld er dus tóch. Bewust — want de leerkracht die op een oudermail wil
antwoorden, plakt hem hoe dan ook ergens in. De keuze is niet óf het gebeurt, maar of het
in een veld gebeurt dat erop voorbereid is of in een veld dat er niets mee doet.

**FR-MAI-33 — Het plakveld draait de detectoren vóór alles.**
*Gegeven* tekst in het plakveld, *wanneer* je die plakt of typt, *dan* draait
`detectors.ts` direct — vóór de knop, vóór de aanroep, vóór het controlescherm — en toont
de app onder het veld hoeveel gegevens hij heeft gevonden en van welke soort.

**FR-MAI-24 — De vier gevoeligste detectoren zijn niet uit te zetten.** *(ongewijzigd)*
E-mailadres, telefoonnummer, IBAN en BSN. Daarnaast, wel uit te zetten:
postcode met huisnummer, naam na de aanhef, ondertekening, handtekeningblok, en de
achternaam van een kind uit de leerlingenlijst.

**FR-MAI-34 — Wat de detectoren vinden, wordt vervangen en teruggezet.**
*Gegeven* een gevonden gegeven, *dan* wordt het vervangen door `[AFGESCHERMD-n]` vóór
verzending en teruggezet in de uitkomst. Terugvertalen gebeurt op de code, niet op de
inhoud (FR-MAI-26).

**FR-MAI-13 — Je kunt zelf tekst afschermen.** *(ongewijzigd)*
Selecteer een stuk tekst en kies "Scherm dit af". Dat is het vangnet voor alles wat een
detector niet kent, en dat is meer dan je denkt.

**FR-MAI-12 — Het controlescherm is bij mail niet over te slaan.** *(ongewijzigd)*
Bij documentatie mag je het uitzetten (FR-INS-21); hier niet, en die uitzondering blijft
staan nu het plakveld de enige ingang is. Het toont de volledige opdracht met de
afschermingen zichtbaar erin.

**FR-MAI-35 — Het plakveld wordt niet bewaard.**
*Gegeven* een geplakte mail, *wanneer* je het scherm verlaat of de mail is geschreven,
*dan* wordt de geplakte tekst niet opgeslagen — niet in IndexedDB, niet in een concept,
niet in het logboek. Het concept bevat alleen jouw eigen resultaat. Dit is het enige veld
in de app dat bewust niets onthoudt, en dat staat er ook bij.

## 6.3.5 Concepten

**FR-MAI-20 — Zonder onderwerp geen concept.** *(ongewijzigd)*
Het enige verplichte veld in de hele app, en het is verplicht omdat een concept zonder
onderwerp niets is om in een lijst te tonen.

**FR-MAI-21 — Concepten staan in de lijst met een leesbare regel.** *(ongewijzigd)*

**FR-MAI-22 — Het concept heeft geen ontvanger.** *(ongewijzigd)*
Er is geen veld "aan". Dat is geen vergetelheid: een ontvanger opslaan betekent
e-mailadressen van ouders opslaan, en daar is geen grondslag voor en geen noodzaak toe.

**FR-MAI-23 — Kopiëren werkt altijd.** *(ongewijzigd)*
De belangrijkste knop van het scherm. Kopieert onderwerp en tekst naar het klembord in één
handeling, ook als er verder niets werkt.

**FR-MAI-18 — De deelbare afbeelding gaat via het klembord de mail in.** *(ongewijzigd)*
**FR-MAI-19 — De toestemmingsbevestiging beeldgebruik geldt ook hier.** *(ongewijzigd)*

## 6.3.6 AI-gedrag

**FR-MAI-15 — De AI voegt niets toe.** *(ongewijzigd)*
Geen feiten, geen data, geen toezeggingen die niet in je opdracht stonden. Staat er in je
opdracht geen datum, dan komt er geen datum in de mail — ook geen "binnenkort" of "deze
week". Dit is §3.8 (hallucinatie) toegepast op de plek waar het de meeste schade doet: een
mail aan een ouder is een toezegging.

**FR-MAI-17 — Elke AI-bewerking gaat door hetzelfde controlepad.** *(ongewijzigd)*
Er is geen tweede route naar `/api/ai` (DR-16, DR-31).

**FR-MAI-25 — De teller is zichtbaar.** *(ongewijzigd)*

**FR-MAI-36 — Vijf bewerkingen, en ze gaan alle vijf door hetzelfde pad.**
Inkorten, uitbreiden, toon aanpassen, samenvatten van je eigen concept, en spelling. Deze
vijf stonden door B-04 in versie 1.1 omdat de module toen groter was; nu de postbus vervalt,
is dit wat er van de module overblijft en horen ze erbij. Ze werken op je eigen tekst en
nooit op het plakveld.

## 6.3.7 Ingetrokken eisen

| Nummer | Was | Reden |
|---|---|---|
| `FR-MAI-01` | De app vraagt geen verzendrecht aan | Er is geen koppeling meer om een recht bij aan te vragen. De grens blijft, de eis niet |
| `FR-MAI-03` | De rechten staan in gewone taal vóór de koppeling | idem |
| `FR-MAI-04` | Een beheerder kan nodig zijn | idem — en dit is precies wat er gebeurde |
| `FR-MAI-05` | Ontkoppelen wist alles | Er is niets om te ontkoppelen |
| `FR-MAI-06` | Tokens staan niet in de browseropslag | Er zijn geen tokens (T-15 vervalt) |
| `FR-MAI-07` | EduFlow wijzigt niets aan je berichten | Er zijn geen berichten |
| `FR-MAI-08` | Zoeken gaat naar de aanbieder | idem |
| `FR-MAI-09` | Alleen wat je opent wordt bewaard | idem |
| `FR-MAI-10` | De cache vervalt na zeven dagen | Er is geen cache |
| `FR-MAI-11` | Bijlagen worden nooit opgehaald | Er wordt niets opgehaald |
| `FR-MAI-14` | De samenvatting levert punten op, geen proza | Samenvatten van een ontvangen bericht bestaat niet meer; §6.3.6 FR-MAI-36 dekt het samenvatten van je eigen concept |

**`FR-MAI-02` — Er is geen verzendknop — blijft staan**, ook al is er niets om mee te
versturen. Hij beschrijft nu een ontwerpgrens in plaats van een technische keuze, en hij
is de eis waaraan DR-42 hangt.

## 6.3.8 Wat dit betekent voor de rest van het handboek

- **§13.2 en §13.3**: Microsoft Graph en Gmail vervallen als integratie (B-106).
- **§6.4 Dashboard**: het blok *Postvak* vervalt. Het dashboard heeft vier blokken:
  Deze week, Verder werken aan, Aandacht, Back-up. `FR-DAS-08` (laden binnen 500 ms) wordt
  daarmee eenvoudiger te halen, want het blok dat apart laadde is weg.
- **§17 Beschikbaarheid**: `NFR-26` en `NFR-29` gaan alleen nog over de AI-route. De app is
  volledig offline bruikbaar behalve AI.
- **§15 Privacy**: er is één gegevensstroom minder naar buiten, en één risico erbij — het
  plakveld. Dat is een gunstige ruil, maar hij hoort wél expliciet in het gesprek met de
  functionaris: *"wij lezen geen postbus; wij hebben één veld waar de gebruiker zelf een
  mail in kan plakken, en dit is wat daar gebeurt."* Dat is een uitleg van twee zinnen, en
  dat was de oude opzet niet.
