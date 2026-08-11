<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 18. Roadmap

### 18.1 Uitgangspunten van de planning

Er is één persoon die dit naast een baan bouwt. Dat is de belangrijkste planningsvariabele en het is eerlijker om daarop te plannen dan om een tempo te veronderstellen dat niet gehaald wordt.

Drie regels:

1. **Elke fase eindigt met iets bruikbaars.** Niet met een laag, niet met een fundament, maar met iets waarmee de maker de dag erna kan werken. Dat is de enige manier om vroeg te merken of het idee klopt.
2. **De volgorde volgt de afhankelijkheid, niet het enthousiasme.** Instellingen vóór documentatie (A7 uit de review), back-up vóór de eerste echte gegevens (C6), en `PrivacyService` vóór de eerste AI-aanroep.
3. **De privacytoets staat vóór de eerste echte gegevens, niet vóór de eerste code** (B-45, §15.6). Bouwen met verzonnen kinderen mag meteen.

### 18.2 Fasen

| Fase | Versie | Periode | Resultaat |
|---|---|---|---|
| Sprint 0 | — | afgerond 4 augustus 2026 | besluiten genomen, documenten bijgewerkt, dit handboek |
| Sprint 1 | 0.1 | 11 augustus - 14 september 2026 | fundament plus schrijfmodus |
| Sprint 2 | 0.2 | 15 september - 19 oktober 2026 | pagina's, layouts, export |
| Sprint 3 | 0.9 | 20 oktober - 30 november 2026 | gespreksmodus, reeksen, stijlleren |
| **Poort** | — | 1 - 14 december 2026 | gesprek met de functionaris gegevensbescherming, DPIA en FRIA |
| Sprint 4 | 0.95 | 15 december 2026 - 25 januari 2027 | agenda |
| Sprint 5 | 0.98 | 26 januari - 15 maart 2027 | mail |
| Sprint 6 | **1.0** | 16 maart - 26 april 2027 | dashboard, eerste-keer-ervaring, toegankelijkheid, afwerking |
| — | 1.1 | zomer 2027 | donkere modus, de vijf uitgestelde AI-functies, verfijning |
| Fase 2 | 2.0 | schooljaar 2027-2028 | server, meerdere gebruikers, delen binnen een team |
| Fase 3 | 3.0 | 2028-2029 | bestuursbrede uitrol, koppeling met leerlingadministratie, meertaligheid |

### 18.3 Wat er in elke sprint zit

**Sprint 1 — fundament plus schrijfmodus.**
Next.js-project met de mappenstructuur uit §10.2 en de navigatie uit §11.3. `StorageService` en `DocumentationService` op IndexedDB met `BaseRecord` (T-11), foto's als blob met de drie varianten. Instellingen, maar alleen wat documentatie nodig heeft: leerlingen, groepen met lidmaatschappen, stijlvoorbeelden, standaardleerlingen. `PrivacyService` met de regels uit §12.5 en de volledige toetsset. `AIService`, `PromptService` en `/api/ai` met de beveiliging uit §12.6, met één EU-provider. Documentatie maken in schrijfmodus met autosave, foto's, citaten, "Laat AI meeschrijven" met Overnemen / Opnieuw / Weggooien, en het volledige controlescherm. Het overzicht met zoeken. Back-up maken en terugzetten.

**Wat er bewust niet in zit:** gespreksmodus, pagina's, layouts, PDF, agenda, mail, dashboard.

**Waarom in deze volgorde.** Na sprint 1 kan de maker met verzonnen namen uitproberen of AI schrijft zoals hij schrijft. Dat is de vraag waar het hele project op staat of valt, en die wil je beantwoord hebben voordat er vijf modules omheen staan.

**Sprint 2 — pagina's, layouts, export.**
`PageService` en `LayoutService` met de vijf layouts uit §5.10 en de overloopregels. `RenderService` met `pdf-lib` en het rasteren met `pdf.js`. Het exportpaneel met miniaturen, voorbeeld, paginatelling, initialen met legenda, en de toestemmingsbevestiging. Print-PDF en deelbare afbeelding, delen via het deelmenu. De statusovergang naar gedeeld. Prullenbak en archiveren.

**Sprint 3 — gespreksmodus, reeksen, stijlleren.**
Gespreksmodus op telefoon en laptop met de fotovragen. Reeksen met de reeksweergave en de vervolgzin op basis van eerdere delen. `StyleService` met de drie leermechanismen, en Instellingen → Schrijfstijl. `FeedbackService` met de redenen bij afwijzen en de correctieregels. De gouden testset, volledig, met netwerk.

**De poort in december.** Aan het eind van sprint 3 is er een werkende app met alles wat de gegevensstromen bepaalt. Dat is het moment voor het gesprek met de functionaris: met het controlescherm erbij, met het logboek, met de verzonnen groep. Niet eerder, want dan is er alleen een plan; niet later, want dan staat er een agenda en een mailmodule omheen die opnieuw beoordeeld moeten worden.

**Sprint 4 — agenda.**
`AgendaService` en `HolidayService`, het vakantiebestand met versienummer en overrides, de vier weergaven inclusief de jaarweergave, itemsoorten, het snelveld met lokale ontleding, koppelingen naar documentaties, ICS-import en -export.

**Sprint 5 — mail.**
`MailService` met de twee adapters, OAuth met PKCE en de tokenafhandeling, het postvak met cache en vervaltermijn, de extra detectoren, het verplichte controlescherm, samenvatten, sjablonen, concepten, en de overdracht naar de eigen postbus.

**Sprint 6 — versie 1.0.**
Dashboard met de vijf blokken. De samenhangende eerste-keer-ervaring (B-49). Toegankelijkheidsronde over alle schermen met `axe-core` en handmatig. Opslagbeheer met drempels en opruimen. Het scherm Over met de gegevensstromen en het logboek. Prestatieronde tegen alle eisen uit hoofdstuk 17. De tweede meting tegen de nulmeting.

### 18.4 Wat er in versie 1.1 en later komt

**Versie 1.1 (zomer 2027).** Donkere modus (B-42). De vijf AI-functies die B-04 uitstelde: mail inkorten, uitbreiden, toon aanpassen achteraf, samenvatten van het eigen concept, en spelling als losse handeling. Verfijning op basis van een jaar gebruik.

**Fase 2 (schooljaar 2027-2028).** De server als bron van waarheid, met de migratie uit §8.10. Accounts, en daarmee eenmalig aanmelden via de federatie van het onderwijs in plaats van een toegangscode. Meerdere gebruikers per bestuur. Delen per documentatie met een einddatum (§14.4), lezen en opmerkingen, nooit meeschrijven. De rollen `meelezer`, `ib`, `beheerder` en `functionaris` uit §14.2. Synchronisatie tussen apparaten, waarmee B-01 vervalt.

**Fase 3 (2028-2029).** Koppeling met een leerlingadministratiesysteem, onder de voorwaarden uit §13.6. Aansluiting op de afsprakenstelsels uit §13.7 zodra er systeem-tot-systeemverkeer is. Meertaligheid, te beginnen met Engels voor internationale scholen.

### 18.5 Wat er nooit in komt

Deze lijst is even belangrijk als de rest van de roadmap, want een roadmap zonder grens groeit vanzelf.

| Nooit | Waarom |
|---|---|
| Beoordelen van kinderen: cijfers, niveaus, voorspellingen, signalering | B-25; het is de grens die EduFlow buiten de hoog-risicocategorie houdt en die het instrument onschuldig maakt in de klas |
| Versturen naar ouders vanuit EduFlow | U-01; de app vraagt technisch geen verzendrecht aan |
| Foto's naar een AI-dienst | B-03; het is de belofte waar het ontwerp van gespreksmodus op rust |
| Toetsbewaking of aanwezigheidsregistratie | hoog risico onder de AI-verordening, en het is een ander product |
| Browserautomatisering of scraping | §13.1; het is fragiel en het is oneigenlijk gebruik van andermans dienst |
| Advertenties of gegevensverkoop | vanzelfsprekend, en het staat er omdat het opschrijven ervan iets waard is |
| Een chatvenster met een algemene assistent | er zijn losse chatbots; wat EduFlow toevoegt is precies de context die een chatbot niet heeft |

### 18.6 Definition of Done

Een functionaliteit is af als alle acht waar zijn. De vijfde en de achtste zijn nieuw ten opzichte van de oorspronkelijke documenten en volgen uit B-45 en B-44.

1. De functionaliteit staat in dit handboek met een `FR-`nummer, en wat er gebouwd is komt daarmee overeen.
2. Alle geautomatiseerde toetsen slagen, inclusief de gouden testset zonder netwerk.
3. De toegankelijkheidscontrole op de betrokken schermen slaagt.
4. De prestatie-eisen uit hoofdstuk 17 die deze functionaliteit raken, zijn gehaald op de referentielaptop.
5. **Is er een nieuwe gegevensstroom, dan staat die in hoofdstuk 15 en is hij besproken met de functionaris gegevensbescherming** — en vóór de eerste echte gegevens is dat gesprek afgerond.
6. De zelfreview is gedaan, minstens 24 uur na het bouwen (B-80).
7. De functionaliteit is één werkdag echt gebruikt met de verzonnen groep.
8. **Nieuwe besluiten staan in het besluitenregister** (hoofdstuk 19), met datum en reden.

### 18.7 Risico's in de planning

| # | Risico | Vroeg signaal | Maatregel |
|---|---|---|---|
| R-13 | AI schrijft niet zoals de maker schrijft | na sprint 1 wordt minder dan de helft van de voorstellen overgenomen | dit is de reden dat sprint 1 eindigt bij schrijfmodus: het antwoord komt vóór er vijf modules staan. Blijft het slecht, dan verandert de scope: de app wordt een goede documentatiemaker zonder AI-schrijfhulp, en dat is nog steeds waardevol |
| R-14 | Het privacygesprek loopt vast | de functionaris vraagt om een verwerkersovereenkomst die het bestuur niet wil sluiten | de poort staat vóór sprint 4, dus vóór de helft van het werk. Terugvalpad: alleen lokale functies, AI uitgeschakeld, en het product blijft bruikbaar |
| R-15 | De sprints lopen uit | sprint 1 duurt meer dan zes weken | de sprints daarna worden ingekort door functionaliteit naar 1.1 te schuiven, nooit door de Definition of Done te versoepelen |
| R-16 | De app wordt een tweede administratielast | de maker gebruikt hem na een maand minder dan in week één | dat is het meetpunt uit §1.7; bij dat signaal wordt er geschrapt en niet toegevoegd |
| R-17 | Een aanbieder verandert zijn voorwaarden | een aankondiging over training of bewaring | de provider-abstractie (§12.7) maakt wisselen een instelling, geen verbouwing |
| R-18 | Er komt geen tweede gebruiker | niemand vraagt erom na de demonstratie | dat is geen mislukking: het product is voor één praktijk gebouwd en werkt daar. Fase 2 wordt dan niet gestart |

---
