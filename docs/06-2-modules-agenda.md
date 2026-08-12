<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

# Hoofdstuk 6.2 — Agenda

### 6.2 Agenda

#### 6.2.1 Wat de agenda is en niet is

De agenda van EduFlow is het schooljaar van één professional. Hij vervangt de bestuursagenda niet, hij synchroniseert niet met Exchange, en hij is geen roostersysteem. Wat hij wel doet: het schooljaar zichtbaar maken op de vier schaalniveaus waarop een leerkracht erover nadenkt — vandaag, deze week, deze maand, dit jaar — en het aanhaken van agenda-items aan het werk dat eruit voortkomt: een documentatie, een oudergesprek, een mail.

De reden dat de agenda in versie 1.0 zit en niet later, is dat de andere twee modules erop leunen. Een documentatie heeft een datum en die datum betekent iets: het was de dinsdag vóór de herfstvakantie, het was de dag van het schoolreisje. Een oudergesprek is een agenda-item dat een mail veroorzaakt. Zonder agenda zijn documentatie en mail twee losse gereedschappen; met agenda zijn ze één werkweek.

De agenda is bewust arm aan functies. Er zijn geen genodigden, geen beschikbaarheid, geen locatieboekingen, geen terugkerende reeksen met uitzonderingen, geen tijdzones anders dan Europe/Amsterdam. Elk van die dingen is een bekende bron van complexiteit die niets oplevert voor iemand die op één school werkt (U-05).

**FR-AGE-01 — De agenda toont het schooljaar op vier niveaus.**
*Gegeven* een gebruiker met een ingesteld schooljaar, *wanneer* zij de agenda opent, *dan* kan zij zonder herladen wisselen tussen dag, week, maand en jaar, en blijft de geselecteerde datum bij elke wisseling het middelpunt.

**FR-AGE-02 — De agenda synchroniseert met niets.**
*Gegeven* een gekoppelde postbus in de module Mail, *wanneer* die postbus een agenda bevat, *dan* leest EduFlow die niet en toont hij die niet. Volgt uit B-30.

#### 6.2.2 Itemsoorten

Er zijn acht soorten. Meer soorten maken de agenda niet rijker maar rommeliger; minder soorten dwingen de gebruiker om betekenis in de titel te stoppen, waar hij niet doorzoekbaar is.

| Soort | Hele dag | Herhaalt | Koppelingen | Kleur | Bron |
|---|---|---|---|---|---|
| `afspraak` | nee | ja | groep, leerlingen | accent | eigen |
| `oudergesprek` | nee | nee | leerling (1, verplicht), mailconcept | accent-donker | eigen |
| `studiedag` | ja | nee | — | neutraal-700 | eigen of import |
| `margedag` | ja | nee | — | neutraal-500 | eigen of import |
| `vakantie` | ja | nee | — | neutraal-200 | vakantiebestand |
| `verjaardag` | ja | jaarlijks | leerling (1) | zacht | afgeleid uit leerlingen |
| `herinnering` | nee | ja | documentatie, mailconcept | neutraal-400 | eigen |
| `documentatiemoment` | nee | nee | groep, leerlingen, documentatie | accent-zacht | eigen |

Gemeenschappelijke velden van een `CalendarEvent`:

| Veld | Type | Verplicht | Standaard | Validatie |
|---|---|---|---|---|
| `title` | tekst | ja | — | 1-120 tekens |
| `kind` | opsomming | ja | `afspraak` | een van de acht |
| `start` | datumtijd | ja | eerstvolgend half uur | — |
| `end` | datumtijd | ja bij niet-hele-dag | start + 30 min | niet vóór `start` |
| `allDay` | ja/nee | ja | volgt uit soort | — |
| `note` | tekst | nee | leeg | ≤ 2.000 tekens |
| `location` | tekst | nee | leeg | ≤ 120 tekens |
| `groupIds` | lijst | nee | leeg | bestaande groepen |
| `studentIds` | lijst | nee | leeg | bestaande leerlingen |
| `documentationId` | verwijzing | nee | leeg | bestaande documentatie |
| `mailDraftId` | verwijzing | nee | leeg | bestaand concept |
| `recurrence` | regel | nee | geen | zie 6.2.5 |
| `source` | opsomming | ja | `own` | `own`, `holidayFile`, `imported`, `derived` |

**FR-AGE-03 — Een item eindigt niet vóór het begint.**
*Gegeven* een item met een eindtijd, *wanneer* je de eindtijd vóór de begintijd zet, *dan* schuift de eindtijd mee naar begintijd plus de oorspronkelijke duur, en verschijnt de melding "De eindtijd is meeverschoven."

**FR-AGE-04 — Een oudergesprek heeft precies één leerling.**
*Gegeven* een item van de soort `oudergesprek`, *wanneer* je het opslaat zonder leerling of met twee leerlingen, *dan* blokkeert de app het opslaan en wijst zij het veld aan. De reden: het gesprek gaat over één kind, en de koppeling stuurt de mail en de voorbereiding.

**FR-AGE-05 — Verjaardagen worden afgeleid, niet opgeslagen.**
*Gegeven* leerlingen met een geboortedatum, *wanneer* de agenda een periode toont, *dan* berekent `AgendaService` de verjaardagen van die periode uit de leerlingenlijst. Er staat geen verjaardagsitem in de opslag (U-02).

#### 6.2.3 Weergaven

**Dag.** Alleen op de telefoon de standaard. Een verticale tijdlijn van 07:00 tot 18:00, met hele-dag-items als strook bovenaan. Buiten dat venster liggende items schuiven het venster op. Bij meer dan acht items op één dag wordt de tijdlijn scrollbaar met vaste hoogte per half uur.

**Week.** De standaard op de laptop buiten de zomerperiode. Zeven kolommen, met zaterdag en zondag smaller (een kwart breedte) omdat daar zelden iets staat maar het weekend wel zichtbaar moet blijven. Hele-dag-items staan als balken onder de dagnamen; een vakantie loopt als één doorlopende balk over de dagen heen. De huidige dag heeft een gemarkeerde kolomkop, niet een gekleurde achtergrond — dat laatste vecht met de items.

**Maand.** Zes rijen van zeven cellen, altijd zes rijen zodat de hoogte niet springt bij het bladeren. Per cel maximaal drie items plus "+n meer". Vakanties kleuren de celachtergrond neutraal-200 in plaats van als item te verschijnen; anders is een vakantieweek vol met vijf identieke regels.

**Jaar.** De weergave die B-10 vraagt en die tussen 1 juli en 15 september de standaard is (B-31). Twaalf maandkolommen naast elkaar, elke kolom een verticale strook van 31 dagcellen. Schooldagen zijn wit, weekenden lichtgrijs, vakanties gekleurd per soort, studiedagen en margedagen met een markering. Rechts een legenda met per vakantie de naam en de datums. Onderaan een regel met de tellingen: aantal schooldagen, aantal studiedagen, aantal margedagen, aantal vakantiedagen. Klikken op een dag opent de dag.

**FR-AGE-06 — De jaarweergave past op één scherm.**
*Gegeven* een laptop van 1280 px breed, *wanneer* de jaarweergave opent, *dan* is het hele schooljaar zichtbaar zonder horizontaal of verticaal te schuiven.

**FR-AGE-07 — De jaarweergave is de standaard in de zomer.**
*Gegeven* een datum tussen 1 juli en 15 september, *wanneer* de gebruiker de agenda voor het eerst in die sessie opent op een scherm breder dan 1024 px, *dan* start hij in de jaarweergave. Daarbuiten start hij in de week. Handmatig wisselen wordt onthouden voor de rest van de sessie. Volgt uit B-31.

**FR-AGE-08 — De jaarweergave bestaat niet op de telefoon.**
*Gegeven* een scherm smaller dan 768 px, *wanneer* de gebruiker de weergavekiezer opent, *dan* staat "Jaar" er niet bij. In plaats daarvan staat er "Vakanties", een lijst van alle vakanties van het schooljaar met datums en aantal dagen.

#### 6.2.4 Schoolvakanties

Vakanties komen uit `schoolvakanties.json`, een meegeleverd bestand met een versienummer, een geldigheidsbereik en de gegevens per schooljaar en per regio (Noord, Midden, Zuid).

```json
{
  "schemaVersion": 2,
  "publishedAt": "2026-06-01",
  "validUntil": "2029-08-31",
  "source": "Rijksoverheid, vastgestelde en geadviseerde data",
  "years": [
    {
      "schoolYear": "2026-2027",
      "regions": {
        "midden": [
          { "key": "herfst",     "name": "Herfstvakantie",    "from": "2026-10-17", "to": "2026-10-25", "fixed": false },
          { "key": "kerst",      "name": "Kerstvakantie",     "from": "2026-12-19", "to": "2027-01-03", "fixed": true  },
          { "key": "voorjaar",   "name": "Voorjaarsvakantie", "from": "2027-02-20", "to": "2027-02-28", "fixed": false },
          { "key": "mei",        "name": "Meivakantie",       "from": "2027-04-24", "to": "2027-05-09", "fixed": false },
          { "key": "zomer",      "name": "Zomervakantie",     "from": "2027-07-10", "to": "2027-08-22", "fixed": true  }
        ]
      }
    }
  ]
}
```

Het veld `fixed` maakt het onderscheid dat de review miste (B1, opgelost door B-29): kerst- en zomervakantie zijn wettelijk vastgesteld en niet te bewerken; herfst-, voorjaars- en meivakantie zijn adviesdata die per school afwijken en die je aanpast.

**FR-AGE-09 — Vaste vakanties zijn niet te bewerken.**
*Gegeven* een vakantie met `fixed: true`, *wanneer* je hem opent, *dan* staat er geen potlood en zijn de datumvelden uitgeschakeld, met de uitleg "Kerst- en zomervakantie liggen landelijk vast."

**FR-AGE-10 — Adviesvakanties zijn per school aan te passen.**
*Gegeven* een vakantie met `fixed: false`, *wanneer* je op het potlood tikt en nieuwe datums opgeeft, *dan* wordt een `HolidayOverride` opgeslagen met de sleutel van de vakantie, het schooljaar en de regio. Het bronbestand wordt niet gewijzigd.

**FR-AGE-11 — Aanpassingen overleven een update van het bestand.**
*Gegeven* een `HolidayOverride` voor de herfstvakantie 2026-2027, *wanneer* het vakantiebestand naar een nieuwere versie gaat, *dan* blijft de aanpassing gelden en toont de app eenmalig "De landelijke data voor Herfstvakantie zijn gewijzigd. Jouw aanpassing blijft staan. Bekijken." Volgt uit B-50 en T-11.

**FR-AGE-12 — Een aflopend vakantiebestand meldt zichzelf.**
*Gegeven* een `validUntil` die minder dan 120 dagen in de toekomst ligt, *wanneer* de agenda opent, *dan* verschijnt eenmalig per schooljaar een melding met de tekst "De vakantiegegevens lopen af op 31 augustus 2029. Vanaf dan voer je vakanties zelf in." Daarna blijft de agenda gewoon werken; ontbrekende vakanties zijn lege dagen, geen fout.

#### 6.2.5 Items maken, wijzigen en verwijderen

Een item maak je op vier manieren: de knop "Nieuw", klikken op een lege plek in week of dag, slepen over een tijdvak, of typen in het snelveld.

**Het snelveld.** Eén regel bovenaan de agenda. Je typt "dinsdag 14u oudergesprek Noa V." en de app maakt daar een concept-item van dat je met Enter bevestigt. De ontleding gebeurt lokaal met vaste regels, niet met AI: datumwoorden (vandaag, morgen, overmorgen, weekdagen, `d-m`, `d-m-jjjj`), tijdwoorden (`14u`, `14:00`, `half 3`, `kwart voor 4`), duurwoorden (`30 min`, `1 uur`), soortwoorden (de acht soortnamen en hun gangbare synoniemen), en namen uit de leerlingenlijst. Wat niet herkend wordt, wordt de titel.

**FR-AGE-13 — Het snelveld gebruikt geen AI.**
*Gegeven* invoer in het snelveld, *wanneer* de app die ontleedt, *dan* gebeurt dat volledig lokaal en gaat er niets naar een provider. De reden: de invoer bevat vrijwel altijd een naam, de winst van AI is klein, en een agendaregel is geen tekst die stijl nodig heeft.

**FR-AGE-14 — Het concept-item is zichtbaar vóór bevestiging.**
*Gegeven* herkende invoer, *wanneer* de ontleding klaar is, *dan* toont de app onder het veld het item zoals het wordt: "Oudergesprek · dinsdag 13 oktober 14:00-14:30 · Noa V.", met de niet-herkende woorden gemarkeerd als titel.

**Verplaatsen.** Op de laptop sleep je een item naar een andere dag of tijd. De toegankelijke tegenhanger is verplicht (B-38, 4.9): met het item geselecteerd verschuiven de pijltoetsen hem met een kwartier, `Shift` plus pijl met een dag, en `Ctrl` plus pijl met een week. Dat wordt bij het selecteren als hint getoond.

**Herhalen.** Alleen drie regels: elke week, elke twee weken, elke maand op dezelfde weekdag. Met een einddatum of een aantal keren. Een uitzondering op één datum wordt een losgemaakt item; de reeks krijgt op die datum een gat. Er is bewust geen `RRULE`-ondersteuning met volledige uitdrukkingskracht.

**FR-AGE-15 — Een herhaling wijzigen vraagt om reikwijdte.**
*Gegeven* een item uit een herhaling, *wanneer* je het wijzigt, *dan* vraagt de app "Alleen deze, of alle volgende?" met "Alleen deze" als voorselectie.

**FR-AGE-16 — Verwijderen is markeren.**
*Gegeven* een verwijderd item, *wanneer* je binnen dertig dagen naar de prullenbak gaat, *dan* staat het er en is het te herstellen met zijn koppelingen. Volgt uit T-11.

#### 6.2.6 Koppelingen

Een agenda-item kan aan een groep hangen, aan leerlingen, aan een documentatie en aan een mailconcept. De koppelingen zijn eenrichtingsverwijzingen vanuit het item; de documentatie weet niet dat er een agenda-item naar wijst, hij vindt dat op door te zoeken (U-02).

**FR-AGE-17 — Vanuit een agenda-item start je een documentatie.**
*Gegeven* een item van de soort `documentatiemoment` of `afspraak` met een groep, *wanneer* je op "Maak documentatie" tikt, *dan* opent het schrijfscherm met de datum van het item, de groep en de leerlingen al ingevuld, en met de titel van het item als voorstel voor de titel. Het item krijgt de verwijzing naar de nieuwe documentatie.

**FR-AGE-18 — Vanuit een oudergesprek start je een mail.**
*Gegeven* een `oudergesprek` met een leerling, *wanneer* je op "Stel mail op" tikt, *dan* opent de module Mail met een nieuw concept, ontvangertype `ouder`, de leerling gekoppeld en het onderwerp voorgesteld als "Gesprek over [roepnaam] — dinsdag 13 oktober".

**FR-AGE-19 — Een verwijderde documentatie laat het item bestaan.**
*Gegeven* een item met een verwijzing naar een verwijderde documentatie, *wanneer* je het item opent, *dan* staat er "De gekoppelde documentatie is verwijderd" met een knop om de verwijzing weg te halen. Het item blijft gewoon bestaan.

#### 6.2.7 ICS-import en ICS-export

**FR-AGE-20 — De agenda exporteert naar ICS.**
*Gegeven* een schooljaar, *wanneer* je "Exporteer agenda" kiest, *dan* levert de app één `.ics`-bestand met alle eigen items en de vakanties, zonder de afgeleide verjaardagen en zonder de koppelingen. Elk item krijgt een stabiele `UID` op basis van zijn `id`, zodat een tweede export in dezelfde agenda geen dubbelen maakt.

**FR-AGE-21 — De agenda importeert ICS eenmalig.**
*Gegeven* een `.ics`-bestand, *wanneer* je het importeert, *dan* toont de app eerst een overzicht: aantal items, periode, en hoeveel er al bestaan volgens `UID` of volgens de combinatie titel plus begintijd. Je kiest per groep overslaan of toevoegen. Geïmporteerde items krijgen `source: "imported"` en zijn daarna gewone eigen items.

**FR-AGE-22 — Er is geen doorlopende synchronisatie.**
Volgt uit B-30. De reden staat in 6.2.1: tweerichtingssynchronisatie vraagt om conflictafhandeling, tokenbeheer en een verwerkersafspraak per agenda, voor een probleem dat een eenmalige import oplost.

#### 6.2.8 Verjaardagen en de afweging daarbij

Geboortedatums zijn persoonsgegevens die je voor de agenda niet strikt nodig hebt. Daarom:

**FR-AGE-23 — Verjaardagen zijn uit te zetten.**
*Gegeven* Instellingen → Agenda, *wanneer* je "Toon verjaardagen" uitzet, *dan* verdwijnen ze uit alle weergaven en berekent `AgendaService` ze niet meer. De standaard is aan als er geboortedatums zijn ingevuld, en de app vraagt er nooit zelf om.

**FR-AGE-24 — Een geboortedatum is optioneel en mag een dag en maand zijn.**
*Gegeven* het leerlingformulier, *wanneer* je alleen dag en maand invult, *dan* wordt dat opgeslagen zonder jaar en verschijnt de verjaardag zonder leeftijd. Dat is dataminimalisatie in de praktijk (zie hoofdstuk 15).

#### 6.2.9 Herinneringen en meldingen

> **Gewijzigd op 11 augustus 2026 door B-108.** De oorspronkelijke tekst van FR-AGE-25
> ("Er zijn geen pushmeldingen in versie 1.0") is vervangen. De onderbouwing daarvan is
> inmiddels scherper te maken: pushmeldingen zijn niet *lastig*, ze zijn op het web
> onmogelijk zonder server. De Notification Triggers API — de enige manier om een melding
> lokaal in te plannen die afgaat terwijl de app dicht is — is door Chrome definitief
> gestaakt. Web Push werkt wel, maar loopt altijd via een pushdienst en vereist dus een
> server die weet *wanneer* jouw afspraak is.

**FR-AGE-25 — Meldingen werken alleen terwijl EduFlow open is.**
*Gegeven* een agenda-item of herinnering met een tijd, *wanneer* EduFlow op dat moment in
een tabblad open staat — ook op de achtergrond — *dan* toont de app een melding via de
Notification API, mits de gebruiker daar één keer toestemming voor heeft gegeven na een
eigen handeling. *Gegeven* dat EduFlow gesloten is, *dan* komt er geen melding, en dat
zegt het instellingenscherm er letterlijk bij.

De prijs van dit besluit staat er eerlijk in Instellingen → Agenda: *"EduFlow stuurt geen
meldingen als de app dicht is. Wil je een herinnering op je telefoon, exporteer de agenda
dan naar je eigen agenda-app — die doet het wel."* Een halve belofte is hier schadelijker
dan geen belofte: een gemiste herinnering waarvan je dacht dat hij zou komen, is erger
dan een herinnering die je nooit verwachtte.

**FR-AGE-26 — Het dashboard is de meldingsplek.**
*Gegeven* een herinnering met een tijd binnen 24 uur, *wanneer* het dashboard opent, *dan*
staat hij bovenaan in het blok Deze week met een markering.

**FR-AGE-27 — De ICS-export is de route naar echte herinneringen.**
*Gegeven* de agenda, *wanneer* je "Exporteer agenda" kiest, *dan* wijst de app erop dat de
agenda-app van je telefoon of laptop de meldingen overneemt zodra je het bestand daar
importeert. *Gegeven* dat je na de export items hebt gewijzigd, *dan* toont het
agendascherm hoeveel dat er zijn en biedt het een nieuwe export aan; de stabiele `UID` uit
FR-AGE-20 zorgt dat de tweede import geen dubbelen maakt.

Dit is geen omweg maar het eerlijke antwoord op "de agenda moet werken zoals op mijn
telefoon": de agenda-app op je telefoon is daar beter in dan een webapp ooit wordt, en hij
mag het ook. EduFlow bezit het schooljaar; de telefoon doet het klokwerk.

**FR-AGE-28 — Toestemming voor meldingen wordt niet ongevraagd opgevraagd.**
*Gegeven* het eerste bezoek, *dan* vraagt de app nooit uit zichzelf om
meldingstoestemming. *Gegeven* dat je in Instellingen → Agenda "Meldingen aanzetten"
kiest, *dan* verschijnt de browservraag, na uitleg van wat hij wel en niet doet. Een
weigering is definitief te herstellen via de browser en de app legt uit hoe.

#### 6.2.10 Foutgevallen en randgevallen

| # | Geval | Wat de app doet |
|---|---|---|
| 1 | Zomertijd begint in de nacht van een item | Items worden opgeslagen als lokale tijd met tijdzone `Europe/Amsterdam`; de duur wordt herrekend, de begintijd blijft staan zoals ingevoerd |
| 2 | Item loopt over middernacht | Toegestaan; verschijnt in beide dagen met een pijl aan de rand |
| 3 | Item loopt over een vakantiegrens | Toegestaan; de app toont een niet-blokkerende opmerking "Dit valt deels in de Herfstvakantie" |
| 4 | Twee items op exact hetzelfde moment | Naast elkaar, elk halve breedte; bij meer dan drie gestapeld met "+n" |
| 5 | Schooljaar zonder vakantiegegevens | De agenda werkt; het jaaroverzicht toont een lege legenda met "Geen vakantiegegevens voor dit schooljaar" |
| 6 | Klok van het apparaat staat verkeerd | Bij een verschil van meer dan 24 uur met de servertijd bij een AI- of mailaanroep verschijnt eenmalig "De klok van dit apparaat lijkt niet te kloppen" |
| 7 | Regio gewijzigd halverwege het jaar | Vakanties worden herberekend; bestaande overrides op dezelfde sleutel blijven en krijgen de melding uit FR-AGE-11 |
| 8 | Item van vóór het schooljaar | Zichtbaar bij bladeren, niet in het jaaroverzicht van het huidige schooljaar |
| 9 | Herhaling zonder einde | Maximaal 200 herhalingen worden berekend; daarna stopt de reeks met een aantekening |
| 10 | Import van 5.000 items | De app importeert in stappen van 200 met voortgang en een afbreekknop |

---
