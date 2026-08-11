<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 19. Besluitenregister

### 19.1 Hoe dit register werkt

Elk besluit dat het product of de bouw verandert, staat hier met een nummer, een datum en een reden. Nieuwste onderwerp bovenaan, oplopend nummer binnen een onderwerp.

**Vier soorten nummers:**

| Voorvoegsel | Waarvoor | Wie beslist |
|---|---|---|
| `B-` | productbesluit: raakt wat de gebruiker ziet of kan | producteigenaar |
| `T-` | technisch besluit: raakt hoe het gebouwd is, niet wat het doet | architect |
| `DR-` | ontwikkelregel: bindend voor iedereen die code schrijft (hoofdstuk 20) | architect |
| `INV-` | invariant: een regel die altijd waar is (hoofdstuk 9) | architect |

**Vier regels voor het register:**

1. **Een nummer wordt nooit hergebruikt.** Vervalt een besluit, dan blijft het staan met de aantekening *vervallen* en een verwijzing naar wat ervoor in de plaats kwam.
2. **Een fout besluit wordt vervangen, niet verwijderd.** Het oude blijft leesbaar met de reden waarom het verviel. Wie over twee jaar wil begrijpen waarom iets is zoals het is, heeft meer aan een spoor dan aan een schone lijst.
3. **Elk besluit onder onzekerheid krijgt een herzieningsmoment**, in de vorm van een datum of een gebeurtenis. Nooit "later". Een herziening vereist nieuwe informatie, geen nieuwe stemming.
4. **Verwijzingen gaan naar hoofdstukken en secties, nooit naar regelnummers.** Regelnummers verschuiven bij elke bewerking.

### 19.2 Nummerbotsingen, opgelost op 7 augustus 2026

Tijdens het schrijven van dit handboek zijn enkele nummers dubbel toegekend doordat hoofdstukken naast elkaar zijn opgesteld. Dat is hier eenmalig rechtgezet. De hertoekenning staat erbij zodat een verwijzing in een eerder concept terug te vinden is.

| Oorspronkelijk | Onderwerp | Definitief |
|---|---|---|
| B-51 (hoofdstuk 9) | status `gedeeld` is onomkeerbaar | **B-94** |
| B-52 (hoofdstuk 9) | toegangscode is geen entiteit in het domein | **B-95** |
| B-53 (hoofdstuk 9) | export is een waarde binnen het aggregaat | **B-96** |
| B-54 (hoofdstuk 9) | een overgedragen mailconcept blijft overgedragen | **B-97** |
| T-21 (hoofdstuk 9) | samenvoegregel bij import | **T-36** |
| T-21 (hoofdstuk 9, tweede) | domeingebeurtenissen synchroon | **T-37** |
| T-22 (hoofdstuk 9) | opruimen van verweesde foto's | **T-38** |

Daarnaast krijgen domeingebeurtenissen het voorvoegsel `DE-`, omdat `E-` binnen een flow al in gebruik is voor foutpaden (`F-07.E2`).

### 19.3 Besluiten van 4 augustus 2026 — review voor sprint 1

Deze twaalf zijn overgenomen uit `05 - Besluiten.md` en blijven ongewijzigd geldig, met de aanvullingen die in §19.4 staan.

| ID | Besluit | Reden in het kort | Herziening |
|---|---|---|---|
| B-01 | Een documentatie leeft op één apparaat; overzetten via een exportbestand | IndexedDB is per apparaat; serveropslag breekt de fotobelofte en kan pas na akkoord van de functionaris | vervalt bij fase 2 (§18.4) |
| B-02 | Op de telefoon vraagt de app zichzelf op het beginscherm te zetten, plus een back-upherinnering na een maand | Safari wist opslag na zeven dagen zonder gebruik | bij een wijziging in WebKit |
| B-03 | Gespreksmodus: de foto's stellen de vragen; de foto blijft op het apparaat | maakt van een beperking een ontwerp | geen |
| B-04 | De vervolgzin op basis van de reeks komt in versie 1; vijf andere AI-functies later | dit is het enige dat een losse chatbot niet kan | de vijf komen in 1.1 (§18.4) |
| B-05 | Status volgt uit export | nul extra handelingen | label vervangen door B-13 |
| B-06 | Het exportscherm is een paneel over het schrijfscherm | geen extra scherm, werkt op een smal scherm | geen |
| B-07 | Wat niet past loopt door naar een volgende pagina, met de titel herhaald | anders is een los tweede blad niet thuis te brengen | verruimd door B-15 |
| B-08 | Toestemming beeldgebruik: één keer per documentatie | elke keer vragen leidt tot wegklikken; één keer ooit is waardeloos | geen |
| B-09 | Delen in één tik via het deelmenu; op de laptop ook kopiëren | vier handelingen worden er één | geen |
| B-10 | Jaarweergave in de agenda op de laptop | anders is het succescriterium onhaalbaar | uitgewerkt in B-31 |
| B-11 | Geen automatische templatekeuze en geen naamherkenning | het controlescherm is het vangnet en moet compleet zijn | bij vijftig gebruikers opnieuw wegen |
| T-01 t/m T-10 | technische besluiten uit de review | zie `05 - Besluiten.md` | T-02 uitgewerkt in §5.11 |

### 19.4 Besluiten van 7 augustus 2026 — de Product Bible

Aanleiding: het vastleggen van het volledige product in één handboek, op basis van tien vaste uitgangspunten waarvan er vier nieuw zijn ten opzichte van augustus 2026 (desktop first, documentaties bestaan uit pagina's, meerdere groepen per leerling, AI leert van feedback), en twee keuzes die in dit traject zijn gemaakt: lokaal-eerst met een server-klaar datamodel, en een mailmodule die de postbus leest maar nooit verstuurt.

#### Fundament en scope

| ID | Besluit | Reden | Herziening |
|---|---|---|---|
| B-13 | De statussen heten **concept** en **gedeeld**; de overgang is de eerste geslaagde export | "gedeeld" zegt wat er feitelijk gebeurd is; "afgerond" zegt iets over intentie | geen |
| B-14 | **Desktop first**: het ontwerp begint op 1280 px, de telefoon is afgeleid | vervangt "telefoon en laptop even belangrijk"; schrijven, exporteren, mail en jaarweergave zijn laptoptaken | na een half jaar gebruik meten welk apparaat werkelijk gebruikt wordt |
| B-15 | Een documentatie **bestaat uit pagina's**; `Page` is een eigen record | autosave per pagina, en later synchronisatie per pagina in plaats van per documentatie | geen |
| B-16 | Een leerling zit in **meerdere groepen** via `GroupMembership` met een looptijd | een kind zit in een stamgroep én een projectgroep; en oude documentaties moeten kloppen blijven | geen |
| B-17 | Een documentatie hangt aan **meerdere groepen**; expliciet gaat boven afgeleid | afgeleide koppeling verandert mee met lidmaatschappen en zou oude documentaties laten verschuiven | geen |
| B-18 | Versie 1.0 = Documentaties + Agenda + Mail, met Dashboard en Instellingen dienend | vervangt de sprintafbakening uit de review | geen |
| B-52 | Bij botsende uitgangspunten geldt de rangorde U-01/U-10 > U-02/U-03 > U-06/U-07 > U-08 > U-09 > U-04 > U-05 | zonder rangorde wint bij elke botsing het uitgangspunt waar de bouwer op dat moment het meest voor voelt | geen |
| B-53 | Een idee buiten scope gaat met datum naar het ideeënregister en wordt niet gebouwd; drie keer terugkomen uit de praktijk geeft voorrang | "wat niet beschreven staat wordt niet gebouwd" heeft een uitgang nodig, anders wordt de regel omzeild | bij elke versie-afbakening |
| B-54 | Een functie komt pas in scope als vijf kostenassen zijn ingevuld: bouw, onderhoud (25 procent van de bouwtijd per jaar), uitleg, testwerk, privacyverantwoording | zonder model is elke afwijzing een mening | geen |
| B-57 | Elk besluit krijgt een herzieningsmoment als datum of gebeurtenis, nooit "later" | zonder herzieningsmoment wordt een besluit onder onzekerheid stilzwijgend permanent | geen |

#### Mail

| ID | Besluit | Reden |
|---|---|---|
| B-19 | Mail **leest** de postbus en stelt op; versturen doet de gebruiker | het uitgangspunt dat AI nooit zelfstandig naar derden verstuurt |
| B-20 | EduFlow vraagt **geen enkel verzendrecht** aan bij Microsoft of Google | maakt van een belofte een controleerbare technische eigenschap; afgedwongen op drie plekken (§13.3) |
| B-56 | Samenvatten start nooit automatisch; het is een handeling per bericht | de afzender van een oudermail is geen gebruiker van EduFlow en heeft nergens mee ingestemd |
| B-59 | Het concept in de postbus heeft **geen ontvanger** ingevuld | het invullen van de ontvanger is de laatste menselijke controle vóór verzending |
| B-60 | Het controlescherm is bij mail **niet overslaanbaar** | een ontvangen oudermail zit vol gegevens die niet in de leerlingenlijst staan |
| B-61 | BSN, IBAN, e-mailadres en telefoonnummer zijn **niet uit te zetten** als detector | dit zijn de gegevens waarvan één keer weglekken al te veel is |
| B-87 | Ontvangen mail wordt nooit als HTML weergegeven; beelden worden niet geladen | voorkomt scriptrisico en het meten van leesgedrag door de afzender |
| B-97 | Een overgedragen mailconcept blijft `overgedragen`, ook na verdere bewerking | anders suggereert de lijst dat er niets in de postbus staat terwijl er wel iets staat |

#### AI

| ID | Besluit | Reden |
|---|---|---|
| B-21 | Geen eigen accounts in versie 1.0; toegangscode per apparaat | een account toevoegen om een code te vervangen die je één keer per jaar invoert, is complexiteit zonder opbrengst |
| B-22 | AI leert **lokaal en zonder modeltraining**: kenmerken, voorbeelden, correctieregels | maakt "AI leert van feedback" waar zonder een nieuwe gegevensstroom te openen |
| B-23 | Het stijlprofiel is **zichtbaar en bewerkbaar** | wat een systeem over je geleerd heeft en je niet kunt lezen, is geen hulp maar een black box |
| B-25 | EduFlow **beoordeelt niet**: geen cijfers, niveaus, voorspellingen of toetsbewaking | houdt het product buiten de hoog-risicocategorie van de AI-verordening, en houdt het instrument onschuldig in de klas |
| B-68 | Hoogstens drie eerdere reeksdelen als context, elk afgekapt op 1.500 tekens | meer context maakt het antwoord niet beter en verstuurt wel meer tekst over kinderen |
| B-69 | De vragen in gespreksmodus komen uit een vaste lokale set | er is niets te versturen om een vraag te bedenken, want de foto gaat nooit weg |
| B-71 | Boven 20.000 tekens krijgt de AI alleen het eerste deel, zichtbaar gemeld | stil afkappen is de ergste variant |
| B-72 | Drie afwijzingen achtereen leidt tot een voorstel het stijlprofiel te bekijken | dan is er iets mis met het profiel, niet met het model |
| B-73 | De reden bij "Opnieuw" komt uit drie vaste keuzes plus een vrij veld | dit is het signaal waaruit correctieregels groeien |
| B-76 | Twee gelijknamige kinderen aan één documentatie leidt tot `[LEERLING-AMBIGU-n]` plus melding | raden welk kind bedoeld is, is erger dan het niet weten |
| B-77 | Een correctieregel wordt voorgesteld na drie verwijderingen in drie documentaties, en altijd bevestigd | de app besluit nooit zelf iets over hoe jij schrijft |
| B-78 | Het controlescherm toont ook expliciet **wat er niet meegaat** | anders blijft de belangrijkste eigenschap van het product onbenoemd |

#### Vormgeving, opmaak en export

| ID | Besluit | Reden |
|---|---|---|
| B-26 | **Layout is data, geen code**: één set definities in millimeters voedt scherm en PDF | de enige manier om U-03 in de renderlaag waar te maken |
| B-27 | De deelbare afbeelding wordt **uit de PDF gerasterd** | garandeert dat papier en scherm identiek zijn |
| B-28 | Layout D met tekst levert een **vervolgpagina** in plaats van tekstverlies | stil weglaten van tekst is de fout die je pas ontdekt als de ouder hem al heeft |
| B-38 | Foto's herorden je met **pijlknoppen én slepen** | slepen mag nooit de enige weg zijn |
| B-40 | Botsende initialen krijgen een oplopende letter, met een legenda | twee K's zonder uitleg maken een documentatie onleesbaar |
| B-64 | Opruimen kan door alleen de **afdrukvariant** van foto's weg te gooien | bespaart 84 procent en houdt de documentatie leesbaar |
| B-65 | Het bijsnijdvenster hoort bij het `PhotoBlock`, niet bij de `Photo` | dezelfde foto kan in twee documentaties anders bijgesneden zijn |
| B-66 | "Gemaakt met EduFlow" staat standaard wel op de PDF, niet op de deelbare afbeelding, en is uit te zetten | een documentatie gaat over hun kind; daar hoort geen leverancierslogo op |
| B-67 | De legenda bij initialen verschijnt alleen bij een botsing | anders is het ruis |
| B-42 | Donkere modus komt in versie 1.1 | de tokens liggen klaar; twee schema's testen is werk zonder nieuwe functionaliteit |

#### Interactie

| ID | Besluit | Reden |
|---|---|---|
| B-33 | Rij-acties zitten achter een zichtbare **knop met drie punten** | lang indrukken bestaat niet op een laptop |
| B-34 | Een documentatie ontstaat **pas bij de eerste inhoud** | anders staan er lege regels in de lijst met niets om te tonen |
| B-35 | De reeks is een **verwijzing**, geen voorvoegsel in de titel | anders staat de reeks dubbel in de lijst |
| B-36 | Een mailconcept heeft een **verplicht onderwerp** | anders is er niets om in twee lijsten te tonen |
| B-37 | Citaten zijn **blokken** met een optionele leerlingverwijzing, en gaan door `PrivacyService` | citaten zijn het krachtigste en tegelijk het meest herkenbare onderdeel |
| B-39 | "Overnemen" vraagt **aanvullen of vervangen** en is ongedaan te maken | één tik mag nooit je tekst wissen |
| B-41 | De zinslengte-eis geldt **alleen voor AI-uitvoer** | wat de gebruiker zelf schrijft is haar tekst |
| B-49 | Eén samenhangende **eerste-keer-ervaring** | zonder leerlingenlijst werkt de bescherming stilzwijgend niet |
| B-55 | Bevestigingen bestaan alleen bij onomkeerbare handelingen of bij informatie die het apparaat verlaat | zonder regel groeit het aantal bevestigingen vanzelf |
| B-62 | Geen pushmeldingen in versie 1.0; het dashboard is de meldingsplek | pushmeldingen vragen een servicewerker, sleutels en een beginschermafhankelijkheid, voor iets wat de agenda van het apparaat al doet |
| B-75 | Panelen krijgen een URL-parameter zodat de terug-knop ze sluit | anders verlaat de terug-knop het hele scherm |
| B-88 | Automatische vergrendeling na dertig minuten, instelbaar | een openstaande laptop in een lerarenkamer |

#### Agenda, leerlingen en groepen

| ID | Besluit | Reden |
|---|---|---|
| B-29 | Kerst- en zomervakantie liggen vast; herfst, voorjaar en mei zijn adviesdata en aanpasbaar | dit was het onderscheid dat nergens als regel stond |
| B-30 | Geen externe agendasynchronisatie in 1.0; wel ICS-import en -export | tweerichtingssynchronisatie kost tienmaal zoveel als het oplevert voor één persoon |
| B-31 | De jaarweergave is standaard tussen 1 juli en 15 september | dat is precies het moment waarop je hem nodig hebt |
| B-32 | Zoeken doorzoekt titel, tekst, citaten, reeksnaam en namen; vijf filters | zoeken en filteren waren niet gedefinieerd |
| B-50 | Het vakantiebestand heeft een versienummer en een einddatum, en meldt zichzelf | een statisch bestand zonder actualisatiepad loopt stilzwijgend af |
| B-58 | Het snelveld ontleedt lokaal, zonder AI | de invoer bevat vrijwel altijd een naam, en een agendaregel heeft geen stijl nodig |
| B-63 | Er bestaat **geen hoofdgroep**; alle lidmaatschappen zijn gelijkwaardig | een hoofdgroep is een aanname die na één projectgroep niet meer klopt |
| B-70 | Een datum meer dan zeven dagen in de toekomst wordt geweigerd | het is bijna altijd een typefout |
| B-74 | Een handmatige pagina blijft bestaan als hij leeg is; een automatische vervolgpagina niet | de gebruiker heeft hem met een reden gemaakt |

#### Proces, rollen en verantwoording

| ID | Besluit | Reden |
|---|---|---|
| B-24 | **Lokaal-eerst, server-klaar**: het datamodel is vanaf 1.0 synchronisatiebestendig | drie eigenschappen nu toevoegen is goedkoop; ze later inbouwen is een verbouwing |
| B-44 | Eén persoon, drie petten, met expliciete gedateerde zelfcontroles | alle kwaliteitspoorten zijn zelfgoedkeuring; dat mag, mits het expliciet is |
| B-45 | De privacytoets door de functionaris staat **in** de Definition of Done | anders kan "af" betekenen "af behalve de privacy" |
| B-46 | Prestatie-eisen zijn meetbaar, met een nulmeting vóór sprint 1 | "snel reageren" is niet vast te stellen |
| B-47 | De app werkt volledig offline behalve AI en mail, en toont dat | de oorspronkelijke formulering leidde tot verkeerde aannames |
| B-48 | **Services op topniveau**, modules bevatten alleen schermen | er was geen regel voor services die twee modules nodig hebben |
| B-51 | De nulmeting: twaalf handmatig getimede documentaties over vijf fasen, 24 augustus tot 18 september 2026; doel is een mediaan van hoogstens 60 procent | B-46 eiste een nulmeting maar legde protocol, periode en doelwaarde niet vast |
| B-79 | De roadmap is een **productbesluit**; de architect bepaalt alleen technische voorwaardelijkheid | dit was één beslissing met twee eigenaren |
| B-80 | Zelfreview minimaal 24 uur na het bouwen | de goedkoopste manier om een tweede paar ogen te benaderen als je er één hebt |
| B-81 | De beheerder ziet nooit inhoud; de functionaris ook niet, ook niet op verzoek | een beheerder die kan meelezen breekt de vertrouwelijkheid van het instrument |
| B-82 | Delen is lezen plus opmerkingen; niemand schrijft aan andermans documentatie | sluit de hele klasse van samenwerkingsproblemen uit |
| B-83 | Delen heeft altijd een einddatum, standaard einde schooljaar | een toegang zonder einde trekt niemand ooit in |
| B-84 | De school kan systeeminstructies, model en veiligheidsgrenzen niet wijzigen | anders wordt de school ongemerkt aanbieder onder de AI-verordening |
| B-85 | Geen externe foutrapportagedienst; een probleemrapport dat de gebruiker vóór het delen ziet | elke dienst die stapeltraces ontvangt, ontvangt vroeg of laat een documentatie |
| B-86 | Het verantwoordingslogboek is niet te wissen, alleen te exporteren | een logboek dat de gebruiker kan wissen is geen verantwoording |
| B-89 | Elk incident levert minstens één geautomatiseerde toets op | een incident zonder nieuwe toets komt terug |
| B-90 | De privacypoort staat aan het eind van sprint 3, met een werkende app | een gesprek over een werkend controlescherm verloopt anders dan een gesprek over een idee |
| B-91 | Geen telemetrie; alle cijfers uit de bouwstraat of de lokale opslag | een product dat zichzelf meet door te versturen, ondermijnt waar het op gebouwd is |
| B-92 | Bij uitloop schuift functionaliteit; de Definition of Done wordt nooit versoepeld | de enige knop die je bij tijdsdruk niet mag indrukken |
| B-93 | Terugvalpad bij een vastgelopen privacygesprek: AI uit, lokale functies blijven | het product blijft dan bruikbaar en dat maakt het gesprek minder gespannen |
| B-94 | De status `gedeeld` is **onomkeerbaar**; verdere wijzigingen tonen "gedeeld op <datum>, sindsdien gewijzigd" | de status beschrijft een feit over het verleden, niet de bewerkingstoestand |
| B-95 | De toegangscode is geen entiteit in het lokale domein en staat niet in de back-up | hij hoort bij het apparaat en de serverroute, niet bij de gegevens van de gebruiker |
| B-96 | Een geslaagde export is een waarde binnen het `Documentation`-aggregaat, geen eigen entiteit | een eigen entiteit zou een tweede plek zijn waar de status kan wonen |
| B-43 | Geen koppeling met Momento zolang er geen officiële programmeerkoppeling is | de enige route zou browserautomatisering zijn, en die is verboden |

#### Technische besluiten

| ID | Besluit |
|---|---|
| T-11 | UUIDv7 als sleutel; elk record met `createdAt`, `updatedAt`, `deletedAt`, `rev`, `origin`, `schemaVersion`; verwijderen is markeren |
| T-12 | Dexie als IndexedDB-laag, met Zod-validatie bij lezen en schrijven |
| T-13 | Layoutdefinities in millimeters op A4 liggend, 297 × 210 mm, 10 mm marge |
| T-14 | `pdf-lib` genereert, `pdf.js` rastert |
| T-15 | OAuth 2.0 met PKCE; tokens uitsluitend in versleutelde `httpOnly`-cookies |
| T-16 | Zoekindex in het geheugen, met trigram-terugval voor typefouten |
| T-17 | Snelheidslimiet per toegangscode én per IP-adres, met een dagbudget |
| T-18 | Content Security Policy zonder `unsafe-inline`; geen scripts van derden |
| T-19 | Vitest, Playwright en een gouden testset voor AI-kwaliteit |
| T-20 | Functieschakelaars per module |
| T-21 | Geboortedatum mag als dag-maand zonder jaar worden opgeslagen |
| T-22 | De deelbare afbeelding is 2480 × 1754 px JPEG op kwaliteit 88, gerasterd uit de PDF |
| T-23 | De `PseudonymMap` wordt nooit opgeslagen |
| T-24 | De app weigert te openen op een database met een hogere schemaversie |
| T-25 | Back-upversleuteling: PBKDF2-SHA256, 600.000 rondes, AES-GCM per bestand; geen herstel |
| T-26 | Bij gelijke `rev` beslist `origin` alfabetisch, niet de klok |
| T-27 | Fouten zijn waarden (`Result`), geen uitzonderingen; de Nederlandse tekst ontstaat in de service |
| T-28 | De `EventBus` is synchroon en in het geheugen; een falende abonnee raakt de publicerende service niet |
| T-29 | De server weigert elk AI-verzoek met een beeldgegeven |
| T-30 | `/api/mail` werkt met een lijst toegestane paden; verzendpaden staan er niet op |
| T-31 | Harde grenzen aan bundelomvang, afgedwongen in de bouwstraat |
| T-32 | De app vraagt om een taak en een kwaliteitsniveau; de adapter kiest het model |
| T-33 | Nooit meer dan één automatische nieuwe poging |
| T-34 | Bij het bereiken van het maandbudget blijven de taken op niveau `snel` werken |
| T-35 | Geen automatische bijwerking van afhankelijkheden; `lockfile` in het versiebeheer |
| T-36 | Samenvoegregel bij import: hoogste `rev`, dan hoogste `updatedAt`, dan het `origin` van het importerende apparaat; de verliezer blijft als conflictkopie |
| T-37 | Domeingebeurtenissen worden synchroon afgehandeld na de transactie en zelf niet opgeslagen |
| T-38 | Verweesde foto's worden opgeruimd bij het verwijderen van het laatste verwijzende blok, met een opruimronde bij elke start als vangnet |

### 19.5 Openstaand

Deze punten zijn bekend, niet vergeten, en hebben een eigenaar en een moment.

| # | Onderwerp | Wat er nodig is | Wanneer |
|---|---|---|---|
| O-01 | Stijlvoorbeelden | Drie of vier paren van "zo maak ik de notitie" en "zo hoort de documentatie te worden", met verzonnen namen, plus per paar een te ver doorgeschoten versie | vóór sprint 1 |
| O-02 | De verzonnen groep | Vastgelegd in bijlage A; de twintig namen staan, de drie reeksen staan | gereed |
| O-03 | Gesprek met de functionaris gegevensbescherming | DPIA-opzet, FRIA-opzet, demonstratie met werkende app | 1-14 december 2026 (§18.2) |
| O-04 | Verwerkersovereenkomst met de AI-aanbieder, via het bestuur | Bestuur aan zet; de maker levert de gegevensstroomtabel uit §15.2 | vóór de eerste echte gegevens |
| O-05 | Nulmeting | Twaalf documentaties handmatig geklokt volgens B-51 | 24 augustus - 18 september 2026 |
| O-06 | Vakantiebestand vullen | Schooljaren 2026-2027 tot en met 2028-2029, drie regio's | vóór sprint 4 |
| O-07 | Beoordeling door collega's | Drie collega's, drie documentaties van vóór en drie van na, blind | juni 2027 |

---
