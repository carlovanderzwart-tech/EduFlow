<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

# Hoofdstuk 6.4 — Dashboard

### 6.4 Dashboard

#### 6.4.1 De rol van het startscherm

Het dashboard brengt de drie modules samen en is zelf geen module: er staat geen enkel gegeven dat alleen hier bestaat. Alles is een verwijzing. De toets: als je het dashboard weghaalt, verlies je geen informatie, alleen tijd.

Het bestaat uit vijf blokken die alle vijf dezelfde vorm hebben: een kop, hoogstens vijf regels, en één knop. Er zijn geen grafieken, geen tellers en geen prestatie-indicatoren. Een leerkracht die om kwart voor acht inlogt wil weten wat er vandaag gebeurt en waar zij gebleven was.

#### 6.4.2 De blokken

| Blok | Inhoud | Sortering | Max | Lege tekst | Enige knop |
|---|---|---|---|---|---|
| Deze week | agenda-items van maandag tot en met zondag, vandaag gemarkeerd | tijd oplopend | 8 | "Deze week staat er niets in je agenda." | Open agenda |
| Verder werken aan | documentaties met status concept | `updatedAt` aflopend | 5 | "Je hebt geen documentaties in bewerking." | Nieuwe documentatie |
| Postvak | ongelezen berichten | datum aflopend | 3 | "Geen nieuwe berichten." of, zonder koppeling, "Koppel je postbus om hier je mail te zien." | Open postvak |
| Aandacht | leerlingen die lang niet voorkwamen | dagen aflopend | 5 | "Alle leerlingen komen recent voor." | Open leerlingen |
| Back-up | datum van de laatste back-up | — | 1 | "Je hebt nog geen back-up gemaakt." | Back-up maken |

**FR-DAS-01 — Verder werken aan toont vijf documentaties en drie mailconcepten.**
*Gegeven* het dashboard, *wanneer* het blok Verder werken aan opbouwt, *dan* toont het vijf documentaties én, als er concepten zijn, daaronder drie mailconcepten onder een tussenkopje. Sortering op `updatedAt`, dus op het moment van bewerken en niet op het datumveld. Dit is de beslissing die B11h openliet.

**FR-DAS-02 — In de lijsten geldt de inhoudelijke datum.**
*Gegeven* het overzicht van documentaties (§6.1.2), *wanneer* het sorteert op "nieuwste eerst", *dan* is dat de door jou ingevulde datum, met een schakelaar naar "laatst bewerkt". Op het dashboard is het altijd `updatedAt`. De reden: het dashboard beantwoordt "waar was ik", de lijst beantwoordt "wanneer gebeurde het".

**FR-DAS-03 — Het blok Back-up wordt dringend na dertig dagen.**
*Gegeven* een laatste back-up van meer dan dertig dagen geleden, *wanneer* het dashboard opent, *dan* krijgt het blok een waarschuwingsrand en de tekst "Je laatste back-up is van 3 juli. Op dit apparaat is dat je enige beveiliging tegen verlies." Volgt uit B-02.

#### 6.4.3 Deze week in een vakantie en op een studiedag

**FR-DAS-04 — In een vakantie toont het blok de vakantie en de eerstvolgende schooldag.**
*Gegeven* een datum binnen een vakantie, *wanneer* het dashboard opent, *dan* toont het blok één regel "Herfstvakantie, tot en met zondag 25 oktober" en daaronder "Eerste schooldag: maandag 26 oktober", plus eventuele eigen items in die periode. Dit is het antwoord op B11g.

**FR-DAS-05 — Op een studiedag staat dat er als eerste regel.**
*Gegeven* een studiedag vandaag, *wanneer* het dashboard opent, *dan* is de eerste regel de studiedag, gemarkeerd, gevolgd door de overige items van de dag.

#### 6.4.4 Het blok Aandacht

De berekening: voor elke leerling met een lopend groepslidmaatschap wordt het aantal dagen bepaald sinds hij voor het laatst aan een documentatie gekoppeld was. Leerlingen boven de drempel (standaard 21 schooldagen, instelbaar tussen 10 en 60) komen in het blok, aflopend gesorteerd. Vakantiedagen tellen niet mee.

**FR-DAS-06 — Aandacht is een geheugensteun, geen signaal over een kind.**
*Gegeven* het blok Aandacht, *wanneer* het getoond wordt, *dan* staat eronder de regel "Dit gaat over jouw documentatie, niet over dit kind." De app trekt geen conclusie, geeft geen score, en bewaart geen geschiedenis van deze berekening. Volgt uit B-25 en hoofdstuk 15.

**FR-DAS-07 — Aandacht is uit te zetten.**
*Gegeven* Instellingen → Dashboard, *wanneer* je het blok uitzet, *dan* verdwijnt het en wordt de berekening niet meer uitgevoerd.

#### 6.4.5 Indeling

Op de laptop: twee kolommen. Links Deze week (dubbele hoogte) en Postvak; rechts Verder werken aan, Aandacht en Back-up. Boven de kolommen één regel met de datum in woorden en de begroeting zonder naam ("Vrijdag 7 augustus") — geen "Goedemorgen Ilse", want dat verouderd slecht en voegt niets toe.

Op de telefoon: één kolom in de volgorde Deze week, Verder werken aan, Postvak, Aandacht, Back-up. Blokken zonder inhoud vallen weg in plaats van een lege toestand te tonen, behalve Back-up.

**FR-DAS-08 — Het dashboard laadt binnen een halve seconde.**
*Gegeven* 1.000 documentaties en 2.000 agenda-items, *wanneer* het dashboard opent, *dan* staan alle vijf de blokken binnen 500 ms gevuld, met uitzondering van Postvak dat apart laadt en zolang een skelet toont. Zie NFR-04.

---
