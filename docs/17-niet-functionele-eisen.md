<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 17. Niet-functionele eisen

De review wees erop dat "snel reageren" de enige prestatie-eis was en dat "een documentatie sneller klaar is dan nu" geen nulmeting had (B11t). Zonder getal is de Definition of Done op dit punt niet vast te stellen. Dit hoofdstuk vervangt die formuleringen door eisen die je kunt meten en die de bouwstraat kan afdwingen (B-46).

### 17.1 De referentieapparaten

Meten zonder referentie levert getallen op die niets betekenen. Alle eisen in dit hoofdstuk gelden op deze twee apparaten, en de bouwstraat meet op de eerste.

| | Referentielaptop | Referentietelefoon |
|---|---|---|
| Toestel | vier kernen, 8 GB geheugen, SSD | middenklassetoestel van drie jaar oud |
| Browser | Chrome, laatste versie | Safari op iOS, laatste versie |
| Scherm | 1440 × 900 | 390 × 844 |
| Netwerk | 20 Mbit, 40 ms vertraging | 4G, 80 ms vertraging |
| Gegevens | 500 documentaties, 3.000 foto's, 1.500 agenda-items | idem |

De gegevensomvang is bewust groot: eisen die alleen halen op een lege database, halen ze in maart niet meer.

### 17.2 Snelheid

| ID | Eis | Grens | Gemeten als |
|---|---|---|---|
| NFR-01 | De app start tot een bruikbaar dashboard | ≤ 1,5 s laptop, ≤ 2,5 s telefoon | van navigatie tot het moment dat het blok Deze week gevuld is en de invoer reageert |
| NFR-02 | Wisselen tussen modules | ≤ 300 ms | van klik tot eerste inhoud |
| NFR-03 | Invoervertraging in het tekstvlak bij 20.000 tekens | ≤ 50 ms, 99e percentiel | van toetsaanslag tot teken op het scherm |
| NFR-04 | Dashboard vult alle blokken behalve Postvak | ≤ 500 ms | zie §6.4.5 |
| NFR-05 | Zoeken bij 1.000 documentaties | ≤ 150 ms | van laatste toetsaanslag tot getoonde treffers |
| NFR-06 | Eerste teken van een AI-antwoord | ≤ 2 s, 90e percentiel | van bevestiging in het controlescherm tot eerste teken |
| NFR-07 | Volledig AI-antwoord van 1.100 tekens | ≤ 12 s, 95e percentiel | idem tot laatste teken |
| NFR-08 | Foto toevoegen tot zichtbaar als miniatuur | ≤ 1,5 s per foto van 12 megapixel, 95e percentiel | van keuze tot getoonde miniatuur |
| NFR-09 | Zes foto's tegelijk toevoegen blokkeert het typen niet | invoervertraging blijft binnen NFR-03 | gemeten tijdens de verwerking |
| NFR-10 | PDF van vier pagina's met 20 foto's | ≤ 4 s | van klik tot aangeboden bestand |
| NFR-11 | Deelbare afbeelding, één pagina | ≤ 2,5 s | idem |
| NFR-12 | Opbouw van de zoekindex bij 1.000 documentaties | ≤ 800 ms, na het eerste schilderen | §8.5 |
| NFR-13 | Agenda-weergave wisselen | ≤ 200 ms | van klik tot getekende weergave |
| NFR-14 | Jaarweergave opbouwen | ≤ 400 ms | idem |
| NFR-15 | Back-up van 200 documentaties | ≤ 3 min | van klik tot aangeboden bestand |
| NFR-16 | Terugzetten van datzelfde bestand | ≤ 5 min | tot bruikbare app |
| NFR-17 | Postvak laden, 50 koppen | ≤ 2 s bij een normaal werkende aanbieder | van openen tot lijst |

### 17.3 Betrouwbaarheid

| ID | Eis |
|---|---|
| NFR-18 | Verlies bij een onverwacht afsluiten is hoogstens één seconde werk. Autosave schrijft binnen 1.000 ms na de laatste toetsaanslag en onmiddellijk bij `visibilitychange` en `pagehide` (§10.7). |
| NFR-19 | Een mislukte schrijfactie gooit geen werk weg. De toestand blijft in het geheugen, het scherm blijft bewerkbaar, en de app probeert elke tien seconden opnieuw. |
| NFR-20 | Een fout in één schermgebied laat de rest van het scherm werken (§11.7). |
| NFR-21 | Een fout in een gebeurtenisabonnee laat de publicerende handeling slagen (§10.5). |
| NFR-22 | Terugzetten van een back-up op een leeg apparaat levert een werkende installatie op met alle foto's zichtbaar. Wordt bij elke release getoetst. |
| NFR-23 | De app opent niet op een database met een hogere schemaversie, en wijzigt daarbij niets (T-24). |
| NFR-24 | Er gaat nooit een AI-aanroep uit zonder dat `PrivacyService` heeft gedraaid. Afgedwongen in `AIService` en getoetst. |
| NFR-25 | `restore(pseudonymise(t)) === t` voor elke tekst in de toetsset (INV-30). |

### 17.4 Beschikbaarheid

| ID | Eis |
|---|---|
| NFR-26 | De app werkt volledig offline behalve AI en mail (B-47), en toont dat zichtbaar. |
| NFR-27 | De AI-route is beschikbaar op 99,5 procent van de schooldagen tussen 07:00 en 18:00, gemeten per maand. Buiten die uren geldt geen norm. |
| NFR-28 | Bij het uitvallen van de AI-route blijft alles werken behalve de AI-knoppen. Er verschijnt geen foutscherm. |
| NFR-29 | Bij het uitvallen van de mailaanbieder blijven bestaande concepten bewerkbaar en werkt "Kopieer". |

De 99,5 procent is bewust bescheiden. Een hogere norm zou vragen om een tweede omgeving, en de gevolgen van een half uur uitval zijn hier: je schrijft die documentatie zelf. Dat is te overzien.

### 17.5 Toegankelijkheid

| ID | Eis |
|---|---|
| NFR-30 | WCAG 2.2 niveau AA op elk scherm, gemeten met `axe-core` in de bouwstraat en handmatig gecontroleerd op de punten die een automatische controle niet vangt. |
| NFR-31 | Elke handeling is uitvoerbaar met alleen het toetsenbord (§6.1.14). |
| NFR-32 | Contrast van tekst minimaal 4,5 op 1; van interface-elementen en focusrand minimaal 3 op 1. |
| NFR-33 | Doelgrootte minimaal 24 × 24 CSS-px, op aanraakschermen 44 × 44. |
| NFR-34 | De app blijft bruikbaar bij 200 procent tekstvergroting en bij 400 procent inzoomen zonder horizontaal schuiven. |
| NFR-35 | Slepen is nooit de enige manier om iets te doen (B-38). |
| NFR-36 | `prefers-reduced-motion` schakelt alle overgangen uit behalve focus. |
| NFR-37 | Wijzigingen buiten de focuspositie worden gemeld in een `aria-live`-gebied (§11.6). |
| NFR-38 | Kleur draagt nooit als enige betekenis; er staat altijd tekst of een vorm bij. |

### 17.6 Compatibiliteit

| ID | Eis |
|---|---|
| NFR-39 | De laatste twee versies van Chrome, Edge, Safari en Firefox op de laptop. |
| NFR-40 | Safari op iOS 17 en hoger; Chrome op Android 13 en hoger. |
| NFR-41 | Op de telefoon vraagt de app zichzelf op het beginscherm te zetten (B-02), met uitleg, en herhaalt die vraag als hij is overgeslagen. |
| NFR-42 | Bij een niet-ondersteunde browser verschijnt één scherm met de reden en de ondersteunde browsers, in plaats van een app die half werkt. |
| NFR-43 | Schermbreedtes van 320 px tot 3840 px worden ondersteund, met de breekpunten uit §11.3. |

### 17.7 Onderhoudbaarheid

| ID | Eis |
|---|---|
| NFR-44 | Geen bestand boven 400 regels; geen functie boven 60 regels. Overschrijding is een lintwaarschuwing, niet een fout, maar wel een verplichte overweging. |
| NFR-45 | Geen `any` in de broncode; geen `@ts-ignore` zonder een regel toelichting. |
| NFR-46 | Elke service is te toetsen zonder browser, netwerk of scherm (§10.10). |
| NFR-47 | Dekking van de servicelaag minimaal 80 procent op regels en 90 procent op vertakkingen in `PrivacyService`, `LayoutService` en `PromptService`. |
| NFR-48 | Elke functionele eis uit hoofdstuk 6 met een `FR-`nummer heeft minstens één geautomatiseerde toets die naar dat nummer verwijst. |
| NFR-49 | De volledige toetsset draait binnen 5 minuten; de eenheidstoetsen binnen 30 seconden. |
| NFR-50 | Een nieuwe ontwikkelaar heeft de app draaiend binnen 15 minuten na het klonen, met alleen de stappen uit het leesmij-bestand. |

### 17.8 Opslag

| ID | Eis |
|---|---|
| NFR-51 | Waarschuwing bij 80 procent van de geschatte opslagruimte, eenmalig per sessie (T-09). |
| NFR-52 | Waarschuwing bij elke start boven 90 procent, met een voorstel tot opruimen. |
| NFR-53 | Boven 95 procent worden nieuwe foto's geweigerd; tekst opslaan blijft werken. |
| NFR-54 | Een documentatie met zes foto's neemt hoogstens 15 MB in beslag (§8.9). |
| NFR-55 | De zoekindex neemt bij 1.000 documentaties hoogstens 25 MB geheugen in. |

### 17.9 Bundelomvang

De grenzen staan in §11.8 en worden hier als eis vastgelegd: NFR-56 tot en met NFR-61, één per bundel. De bouwstraat faalt bij overschrijding van meer dan 10 procent (T-31).

### 17.10 De nulmeting

Dit is het antwoord op B11t en de basis onder de belofte uit §1.6.

**Wat er gemeten wordt.** Twaalf documentaties, gemaakt zoals de maker ze nu maakt: foto's van de telefoon halen, in een tekstverwerker schrijven, opmaken, exporteren, versturen. Per documentatie wordt met een stopwatch bijgehouden: totale tijd, aantal keren wisselen tussen programma's, en of hij dezelfde dag af kwam.

**Wanneer.** Vóór sprint 1, in de eerste twee weken van het schooljaar 2026-2027. Niet erna, want dan weet je al hoe het beter kan en meet je jezelf te snel.

**Waarmee vergeleken wordt.** Twaalf documentaties in EduFlow, gemaakt in dezelfde periode van het volgende trimester, met dezelfde stopwatch.

**Het doel.** Veertig procent minder tijd per documentatie, en het aandeel dat dezelfde dag af komt van minder dan de helft naar meer dan driekwart.

**De eerlijkheidsmaatregel.** De metingen worden vastgelegd vóór het bouwen en niet achteraf gereconstrueerd, en de nulmeting wordt niet bijgesteld. Een nulmeting die je aanpast nadat je het resultaat kent, is geen meting.

**Wat het niet meet.** Kwaliteit. Of een documentatie beter is geworden, is geen kwestie van tijd en wordt apart beoordeeld: door de maker zelf op de gouden testset (§12.9), en door drie collega's die na een half jaar drie documentaties van vóór en drie van na krijgen voorgelegd zonder te weten welke welke is.

### 17.11 Meten in de praktijk

| Wat | Hoe | Hoe vaak |
|---|---|---|
| NFR-01 t/m NFR-17 | Playwright-scenario's met een vaste gegevensset op de referentielaptop | elke wijziging |
| NFR-06 en NFR-07 | uit `aiInteractions` (§8.3.12), percentielen over de laatste 100 aanroepen | doorlopend, zichtbaar in Instellingen |
| NFR-18 t/m NFR-25 | eenheidstoetsen en scenario's met opzettelijke fouten | elke wijziging |
| NFR-27 | een controleaanroep op `/api/health` elke vijf minuten tijdens schooluren | doorlopend |
| NFR-30 t/m NFR-38 | `axe-core` plus een handmatige controlelijst per scherm | elke wijziging, handmatig per release |
| NFR-44 t/m NFR-49 | lintregels en dekkingsrapport | elke wijziging |
| NFR-51 t/m NFR-55 | scenario's met een gevulde opslag | wekelijks |
| Nulmeting | stopwatch, met de hand | twee keer, zie §17.10 |

**Geen telemetrie.** Er wordt niets naar buiten gemeten. Alle prestatiecijfers komen uit de bouwstraat of uit de lokale opslag, en de gebruiker ziet ze in Instellingen. Een product dat zichzelf meet door gegevens te versturen, ondermijnt precies datgene waarop het gebouwd is (§4.11).

---
