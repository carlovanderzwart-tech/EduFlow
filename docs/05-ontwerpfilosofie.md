<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 5. Ontwerpfilosofie

### 5.1 De ontwerphouding

EduFlow ziet eruit als een werkblad, niet als een dashboard. Wie het scherm opent op donderdagmiddag om zes foto's om te zetten in een documentatie, hoeft niet eerst een overzicht te lezen om te weten waar hij moet beginnen. Er staat een leeskolom, er staat een tekst, en er staat één knop die verder helpt. Dat is de hele houding.

Die houding is geen smaak. Het product schrijft teksten die naar ouders gaan. Alles wat het oog wegtrekt van de zin die je aan het lezen bent, kost kwaliteit in het eindresultaat. Een tegelraster met gekleurde vlakken, een animatie bij het laden, een voortgangsring die ronddraait: elk daarvan is een uitnodiging om niet te lezen. In een schrijfgereedschap is dat duurder dan in een administratiesysteem.

Drie visuele hoofdregels leggen dat vast. Ze gelden voor elk scherm en voor elke component. Wijk je ervan af, dan is dat een fout, geen variant.

**Hoofdregel 1 — Tekst voert, beeld dient.** Elk scherm heeft precies één leeskolom van maximaal 66 tekens breed, en die kolom is het zwaartepunt van de bladspiegel. Foto's, lijsten en zijpanelen staan ernaast of eronder, nooit erboven. Het startscherm van EduFlow toont geen tegels met getallen; het toont drie leesbare regels: wat je gisteren schreef, wat er vandaag in de agenda staat, en wat er in het postvak wacht. De reden is dat de gebruiker geen cijfers over zijn werk nodig heeft, maar zijn werk zelf.

**Hoofdregel 2 — Eén accent per scherm.** Op elk scherm is precies één element gekleurd met de accentkleur: de handeling die je op dat moment waarschijnlijk wilt doen. Al het andere is wit, grijs of bijna zwart. Semantische kleur (bevestiging, waarschuwing, fout, informatie) telt niet mee als accent, want die is reactief: hij verschijnt als antwoord op iets wat je hebt gedaan. Deze regel is de goedkoopste manier om hiërarchie te maken die ook werkt voor iemand die kleur slecht onderscheidt, want de kleur is nooit de enige drager: de hoofdactie is óók de enige gevulde knop op het scherm.

**Hoofdregel 3 — Ruimte boven rand, rand boven schaduw.** Scheiding maak je eerst met witruimte. Lukt dat niet, dan met een lijn van 1 px. Pas als iets werkelijk boven de pagina zweeft, mag er een schaduw onder. Er zijn precies vier schaduwtekens en drie daarvan zijn gereserveerd voor lagen die over de pagina liggen: menu, inschuifpaneel, dialoogvenster. Een kaart in een lijst krijgt geen schaduw, een kaart onder de muisaanwijzer ook niet. Dit houdt het scherm plat, en plat is rustig.

Wat hieruit volgt en wat niet: dit deel gaat over vorm. Hoe schermen zich gedragen, wat er gebeurt bij een handeling en welke schermen er zijn, staat in hoofdstuk 4. Hoe de componenten technisch in elkaar zitten, waar ze in de mappenstructuur wonen en hoe Radix en Tailwind zich tot elkaar verhouden, staat in hoofdstuk 11. Hier staan de maten, de kleuren, de letters en de sloten.

### 5.2 Het raster

Het ontwerp begint op de laptop bij 1280 px breed (U-04, B-14). Dat betekent letterlijk: de basisstijl in de code is de stijl voor 1280 px. Smallere schermen krijgen aanpassingen via `max-`-varianten, bredere via `min-`-varianten. Er is geen tweede layout-implementatie en geen aparte telefoonschil; de telefoon is dezelfde boom met andere waarden.

De app heeft een vaste schil: een navigatiebalk links, een werkgebied, en soms een paneel dat van rechts inschuift (B-06). Het twaalfkoloms raster geldt binnen het werkgebied, niet over de hele vensterbreedte. De goot is vast per breekpunt, de kolom is vloeiend.

| Breekpunt | Vanaf (px) | Kolommen | Goot (px) | Zijruimte (px) | Navigatiebalk | Max. werkbreedte (px) | Kolombreedte (px) |
|---|---|---|---|---|---|---|---|
| `xs` | 0 | 4 | 16 | 16 | onderbalk | vloeiend | 77,5 bij 390 |
| `sm` | 480 | 4 | 16 | 20 | onderbalk | vloeiend | 100 bij 480 |
| `md` | 768 | 8 | 20 | 24 | lade achter menuknop | vloeiend | 72,5 bij 768 |
| `lg` | 1024 | 12 | 24 | 24 | pictogrambalk 64 px | 912 | 54,0 |
| `xl` | 1280 | 12 | 24 | 32 | balk 240 px met labels | 976 | 59,3 |
| `2xl` | 1440 | 12 | 24 | 40 | balk 240 px met labels | 1120 | 71,3 |
| `3xl` | 1920 | 12 | 32 | 64 | balk 280 px met labels | 1440 | 90,7 |

De kolombreedte volgt uit `(werkbreedte − 11 × goot) / 12`. Boven 1920 px groeit het werkgebied niet mee: het blijft 1440 px en gaat in het midden staan. Een tekstregel van twee meter breed helpt niemand.

Wat er per breekpunt verandert:

**1280 px — de referentie.** Navigatiebalk 240 px met pictogram en label. Werkgebied 1040 px, binnenruimte 32 px, dus 976 px raster. Het schrijfscherm zet de leeskolom van 528 px op kolom 1 tot 7 en de fotostrook op kolom 8 tot 12. De documentatielijst is een tabel met zes kolommen: titel, reeks, groep, datum, status, acties. De agenda toont de weekweergave met vijf dagkolommen; de jaarweergave (B-10) toont twaalf maanden in drie kolommen van vier. Het exportpaneel schuift over het werkgebied heen, breedte 400 px, en laat de leeskolom zichtbaar.

**1440 px.** Alleen ruimte verandert: zijruimte 40 px, werkbreedte 1120 px. De jaarweergave gaat naar vier kolommen van drie maanden. Het exportpaneel blijft 400 px en dekt daardoor relatief minder af.

**1920 px.** Navigatiebalk 280 px, goot 32 px, werkgebied gecentreerd op 1440 px. Het exportpaneel schuift niet meer óver het werkgebied maar ernaast: er is genoeg breedte om het voorbeeld en de leeskolom naast elkaar te zien. Dit is de enige plek waar een breekpunt gedrag verandert in plaats van maat, en het is de moeite waard omdat de gebruiker bij het exporteren juist wil vergelijken.

**1024 px.** De navigatiebalk klapt in tot een pictogrambalk van 64 px. Elk pictogram houdt een toegankelijke naam en toont het label in een tekstballon na 400 ms. De documentatietabel verliest twee kolommen: reeks en groep verhuizen naar een tweede regel onder de titel, in ondersteunende tekst. Het exportpaneel wordt een volledige overlay van 100% breed met een maximum van 560 px.

**768 px.** De navigatiebalk verdwijnt achter een menuknop linksboven en verschijnt als lade over de inhoud. Er komt een bovenbalk van 56 px met titel en hoofdactie. De tabel wordt een lijst van rijen: titel bovenaan, metagegevens eronder, driepuntsknop rechts (B-33). Het schrijfscherm wordt één kolom; de fotostrook schuift onder de leeskolom. De jaarweergave is niet beschikbaar; de agenda opent in de weekweergave (B-31).

**390 px — de referentietelefoon.** Vier kolommen, goot 16, zijruimte 16, kolombreedte 77,5 px. De navigatie wordt een onderbalk van 56 px met vijf items: Dashboard, Documentaties, Agenda, Mail, Instellingen. Panelen worden schermvullende bladen die van onder komen. Dialoogvensters worden onderbladen met een greep. Elk raakdoel is minstens 44 × 44 px. De leeskolom vult de volle breedte minus zijruimte; hij komt daarmee op ongeveer 46 tekens per regel, wat kort maar leesbaar is en op deze breedte de enige eerlijke keuze.

Tussen 391 en 767 px schaalt alles vloeiend mee zonder eigen ontwerp. Er is geen aparte layout voor een tablet in liggende stand: die valt op `lg` en werkt daar goed.

### 5.3 Ruimte

Alle afstanden komen uit één schaal met stappen van 4 px. De schaal heeft veertien treden en gebruikt de pixelwaarde als naam, zodat je bij het lezen van code niet hoeft te vertalen.

| Teken | Waarde (px) | Wanneer je hem gebruikt |
|---|---|---|
| `space-0` | 0 | Bewust geen ruimte, bijvoorbeeld tussen twee aaneengesloten knoppen in een groep |
| `space-2` | 2 | Alleen binnen een chip of badge, tussen pictogram en tekst |
| `space-4` | 4 | Tussen pictogram en label in een knop; tussen een selectievakje en zijn tekst |
| `space-8` | 8 | Tussen twee direct verwante elementen: label en veld, veld en hulptekst |
| `space-12` | 12 | Binnen een kaart tussen kop en inhoud; verticale binnenruimte van een lijstrij |
| `space-16` | 16 | Tussen twee velden in een formulier; binnenruimte van een kaart op de telefoon |
| `space-20` | 20 | Horizontale binnenruimte van een lijstrij; binnenruimte van een grote knop |
| `space-24` | 24 | Binnenruimte van een kaart op de laptop; afstand tussen twee kaarten; goot van het raster |
| `space-32` | 32 | Tussen twee secties binnen één scherm |
| `space-40` | 40 | Onder een schermkop, boven de eerste inhoud |
| `space-48` | 48 | Tussen twee zware blokken die niets met elkaar te maken hebben |
| `space-64` | 64 | Boven- en ondermarge van een lege toestand |
| `space-80` | 80 | Alleen in de eerste-keer-ervaring, rond een enkele boodschap |
| `space-96` | 96 | Alleen op het welkomstscherm |

De regel voor welke je kiest: **de afstand tussen twee dingen is klein als ze bij elkaar horen en groot als ze dat niet doen, en er zit altijd minstens één trede verschil tussen die twee.** Staat een label 8 px boven zijn veld, dan staan twee velden minstens 16 px uit elkaar. Dat verschil is wat de groepering leesbaar maakt, niet de absolute maat.

Verticaal ritme werkt met een regelvak van 24 px. Broodtekst is 16 px op 24 px regelhoogte, dus een alinea beslaat altijd een geheel aantal van 24 px. Alle verticale marges zijn veelvouden van 4 px en in de leeskolom veelvouden van 8 px, zodat tekstblokken naast elkaar op één lijn blijven. Koppen krijgen een boven- en ondermarge die samen met hun eigen regelhoogte optellen tot een veelvoud van 24 px: een sectiekop van 32 px op 32 px regelhoogte krijgt 40 px boven en 12 px onder, samen 84 px, wat niet klopt met 24 — daarom is de ondermarge 16 px en de bovenmarge 32 px, samen 80 px. Waar het ritme niet uitkomt, wint de leesbaarheid van de kop en niet het raster; het ritme is een hulpmiddel, geen wet.

Randen tellen mee in de afstand. Een lijn van 1 px tussen twee lijstrijen zit binnen de 12 px binnenruimte, niet erbovenop, zodat een lijst met en zonder scheidingslijnen even hoog is.

### 5.4 Typografie

Er zijn twee letters. Eén voor het scherm, één voor de export. Ze zijn allebei schreefloos en ze zijn met opzet verschillend.

**Scherm: Inter.** Variabele versie, gewichten 400, 500 en 600. Inter is getekend voor beeldschermen: grote x-hoogte, open letteropeningen, en cijfers die je in tabelstand kunt zetten. In de agenda staat `font-variant-numeric: tabular-nums` aan, zodat datums en tijden onder elkaar uitlijnen.

**Export: Source Sans 3.** Gewichten 400 en 600, plus een echte cursief. Source Sans 3 is smaller dan Inter en heeft meer modellering in de stokken, wat op 300 dpi rustiger oogt en waardoor er meer tekens in een kolom van 112 mm passen. Beide letters staan onder de SIL Open Font License en worden als OTF ingesloten in de PDF; de WOFF2-versies die de browser gebruikt kun je niet insluiten.

**Codes: de systeemmonospace.** Op het controlescherm "Bekijk wat er verstuurd wordt" staan de pseudonimiseringscodes `[LEERLING-1]` en `[E-MAIL-1]` in de monospace-stapel van het besturingssysteem. Dat is geen derde webletter, want er wordt niets gedownload, en het maakt in één oogopslag zichtbaar wat code is en wat tekst.

De schermschaal:

| Teken | Naam | Grootte | Regelhoogte | Gewicht | Letterspatiëring | Gebruik |
|---|---|---|---|---|---|---|
| `text-3xl` | Paginakop | 32 px | 40 px | 600 | −0,02 em | Titel van een scherm. Precies één per scherm. |
| `text-2xl` | Sectiekop | 24 px | 32 px | 600 | −0,015 em | Kop boven een sectie of boven een paneel |
| `text-xl` | Blokkop | 20 px | 28 px | 600 | −0,01 em | Kop in een kaart, een dialoogvenster of een lege toestand |
| `text-lg` | Leidende tekst | 18 px | 28 px | 400 | 0 | Inleidende zin, uitleg in een lege toestand |
| `text-md` | Broodtekst | 16 px | 24 px | 400 | 0 | Standaard. Het schrijfveld, elk AI-voorstel, elke maildraft. |
| `text-sm` | Ondersteunend | 14 px | 20 px | 400 | 0 | Labels, tabelinhoud, hulptekst, metagegevens |
| `text-xs` | Klein | 12 px | 16 px | 500 | 0,01 em | Chips, tellers, bijschriften onder foto's |
| `text-2xs` | Zeer klein | 11 px | 14 px | 600 | 0,04 em | Uitsluitend de statusbadge, in kleinkapitaalstand |

Gewicht 700 bestaat niet in de schaal. Wil je nadruk, dan gebruik je 600 of een grotere trede, niet zwarter. Cursief op het scherm is voorbehouden aan citaten.

**De regel van 66 tekens.** Een regel broodtekst is nooit breder dan 66 tekens. Op 16 px Inter is de gemiddelde tekenbreedte ongeveer 8 px, dus de leeskolom is 528 px, vastgelegd als `--measure-read: 33rem`. Die maat groeit niet mee met het venster: op 1920 px is de leeskolom nog steeds 528 px en staat de rest van de breedte leeg of gaat naar de fotostrook.

Waarom dat in juist deze app doorslaggevend is. Ten eerste: de gebruiker leest hier niet, hij herleest. Hij vergelijkt zijn eigen zin met het AI-voorstel, verandert een woord, leest terug. Bij elke regelovergang moet het oog terugspringen naar links; hoe langer de regel, hoe vaker die sprong mislukt en hoe vaker je dezelfde regel twee keer leest. Bij een sessie van twintig minuten telt dat op. Ten tweede, en dat is de doorslag: het eindproduct is een gedrukte A4 met tekstkolommen van 112 mm, waarin ongeveer 61 tekens per regel passen. Als het schrijfscherm regels van 120 tekens toont, schrijft de gebruiker in een ritme dat de printer niet kan waarmaken, en valt de alinea-indeling bij het exporteren uit elkaar. De 66 tekens op het scherm zijn een voorspelling van wat er uit de printer komt.

De maximale kolombreedte voor gedrukte tekst volgt uit dezelfde formule: `breedte in mm = 66 × 0,5 × grootte in pt × 0,3528`. Bij 10,5 pt is dat 122 mm; de vuistregel voor het printontwerp is daarom **geen tekstslot breder dan 120 mm**. Is een slot breder, dan zet de renderer de tekst in twee of drie kolommen die elk onder die grens blijven.

### 5.5 Kleur

Het palet is met opzet klein: één neutrale grijsschaal, één accentkleur, vier semantische kleuren. Er is geen tweede accent en geen merkkleur per school.

**Grijs.** Dertien treden, licht koel getint zodat het naast de accentkleur niet vergeelt.

| Teken | Hex | Contrast op wit | Contrast op `#14181D` | Gebruik |
|---|---|---|---|---|
| `gray-0` | `#FFFFFF` | 1,00 | 17,82 | Achtergrond van de pagina |
| `gray-25` | `#FBFCFD` | 1,03 | 17,35 | Achtergrond van een ingezonken vlak |
| `gray-50` | `#F6F7F9` | 1,07 | 16,63 | Achtergrond van een lijstrij onder de muisaanwijzer |
| `gray-100` | `#EDEFF2` | 1,15 | 15,47 | Vulling van een rustige knop, letterbalken bij passende foto's |
| `gray-200` | `#DFE3E8` | 1,29 | 13,83 | Scheidingslijn tussen lijstrijen |
| `gray-300` | `#C9CFD6` | 1,57 | 11,36 | Rand van een kaart; hoofdtekst in donkere modus |
| `gray-400` | `#A3ACB7` | 2,30 | 7,76 | Uitgeschakeld pictogram; ondersteunende tekst in donkere modus |
| `gray-500` | `#7C8794` | 3,65 | 4,88 | Rand van een invoerveld; pictogram op wit |
| `gray-600` | `#5C6672` | 5,84 | 3,05 | Tertiaire tekst, plaatshoudertekst, bijschriften |
| `gray-700` | `#444C57` | 8,69 | 2,05 | Ondersteunende tekst, labels |
| `gray-800` | `#2E353E` | 12,39 | 1,44 | Koppen |
| `gray-900` | `#1D232A` | 15,84 | 1,13 | Hoofdtekst |
| `gray-950` | `#14181D` | 17,82 | 1,00 | Achtergrond in donkere modus |

Twee grenzen die hieruit volgen en die je niet mag overschrijden. Tekst is nooit lichter dan `gray-600` (5,84 op wit), want daaronder haal je de 4,5:1 van WCAG 2.1 AA niet meer. De rand van een invoerveld is `gray-500` en niet lichter, want de begrenzing van een bedieningselement moet 3:1 halen tegen de aangrenzende achtergrond; `gray-300` haalt maar 1,57 en is daarom uitsluitend decoratief.

**Accent.** Een gedempt inktblauw. Tien treden, waarvan er in versie 1.0 vier daadwerkelijk in gebruik zijn.

| Teken | Hex | Contrast op wit | Contrast op `#14181D` | Gebruik |
|---|---|---|---|---|
| `accent-50` | `#EEF3FC` | 1,11 | 16,01 | Achtergrond van de geselecteerde lijstrij |
| `accent-100` | `#D9E4F8` | 1,28 | 13,92 | Achtergrond van een chip die actief is |
| `accent-200` | `#B6CBF0` | 1,64 | 10,86 | Rand van een actieve chip |
| `accent-300` | `#88A9E4` | 2,37 | 7,51 | Accenttekst en focusring in donkere modus |
| `accent-400` | `#5583D3` | 3,77 | 4,73 | Hoofdknop onder de muisaanwijzer in donkere modus |
| `accent-500` | `#2E5FBE` | 6,01 | 2,97 | Hoofdknop, koppeling, focusring |
| `accent-600` | `#1F4CA6` | 7,95 | 2,24 | Hoofdknop onder de muisaanwijzer |
| `accent-700` | `#1A3E86` | 10,11 | 1,76 | Hoofdknop ingedrukt |
| `accent-800` | `#17346D` | 12,01 | 1,48 | Gereserveerd |
| `accent-900` | `#152C5A` | 13,64 | 1,31 | Gereserveerd |

Witte tekst op `accent-500` haalt 6,01:1. De focusring is `accent-500` van 2 px met 2 px afstand tot het element; op wit haalt die 6,01 en op `gray-50` nog altijd ruim boven de 3:1 die voor een focusaanduiding geldt.

**Semantische kleuren.** Vier families van drie treden: een lichte achtergrond, een middentrede voor tekst en rand op wit, en een lichte trede voor tekst op donker.

| Rol | Achtergrond | Tekst op wit | Contrast op wit | Tekst op donker | Contrast op `#14181D` |
|---|---|---|---|---|---|
| Bevestiging | `success-50` `#E9F6EE` | `success-500` `#1E7A4B` | 5,33 | `success-300` `#66B78C` | 7,40 |
| Waarschuwing | `warning-50` `#FDF3E2` | `warning-500` `#9A6300` | 5,05 | `warning-300` `#E0A83C` | 8,35 |
| Fout | `danger-50` `#FDEDEC` | `danger-500` `#B42318` | 6,57 | `danger-300` `#E8837A` | 6,76 |
| Informatie | `info-50` `#E8F4F9` | `info-500` `#0B6E99` | 5,67 | `info-300` `#5FB4D4` | 7,61 |

Kleur draagt nooit alleen een betekenis. Een foutmelding heeft een rood pictogram, een rode rand én de woorden die zeggen wat er mis is. Een chip met een status heeft een tekstlabel, niet alleen een bolletje. Dit is geen extra, dit is de reden dat de semantische treden bestaan.

**Kleur voor reeksen.** Een reeks is een verwijzing (B-35) en heeft een eigen herkenningskleur, want in de lijst met documentaties wil Ilse in één blik zien welke bij "Kunstwerk Dok" horen. Het risico is dat het scherm een kleurenwaaier wordt. Daarom drie beperkingen. Ten eerste: er zijn acht kleuren, niet meer, en de app kent ze automatisch toe op volgorde van aanmaken; je kunt ze in Instellingen wisselen maar niet vrij kiezen. Ten tweede: de kleur verschijnt uitsluitend als een staaf van 3 px links van de rij of als een stip van 8 px voor de reeksnaam. Er is geen enkele plek waar een reekskleur een vlak vult, een knop kleurt of een tekst kleurt. Ten derde: naast de kleur staat altijd de naam van de reeks, zodat de kleur bijzaak is.

| Teken | Hex | Contrast op wit | Voorbeeld uit de testgegevens |
|---|---|---|---|
| `series-1` | `#2E5FBE` | 6,01 | Kunstwerk Dok |
| `series-2` | `#0B6E99` | 5,67 | ONDERZOEK Natuur |
| `series-3` | `#1E7A4B` | 5,33 | Start van het jaar |
| `series-4` | `#6B7A17` | 4,75 | — |
| `series-5` | `#9A6300` | 5,05 | — |
| `series-6` | `#A8452B` | 5,91 | — |
| `series-7` | `#8E3A6B` | 7,08 | — |
| `series-8` | `#5B4BA8` | 6,96 | — |

Alle acht halen minstens 4,5:1 op wit, zodat de reeksnaam desgewenst in zijn eigen kleur gezet kan worden zonder dat de leesbaarheid eronder lijdt. Vanaf de negende reeks begint de toekenning opnieuw bij `series-1`; twee reeksen met dezelfde kleur is minder erg dan een negende kleur die niemand herkent.

**Voorbereiding op donkere modus.** Donkere modus komt in versie 1.1 (B-42). Wat in versie 1.0 al gebouwd wordt, is de tokenlaag die hem mogelijk maakt, en niets meer. Concreet betekent dat drie dingen. Geen component verwijst ooit naar een paletteken; componenten verwijzen naar rolgebonden tekens als `--color-surface`, `--color-text-primary`, `--color-border-input`. De rolgebonden tekens staan twee keer in het tokenbestand: onder `:root` de lichte waarden, onder `[data-theme="dark"]` de donkere. De contrastkolom "op `#14181D`" in de tabellen hierboven is er precies om die tweede set nu al te kunnen invullen en toetsen. En de eenheidstest die contrast controleert (zie hoofdstuk 17) draait over beide sets, ook al is er in versie 1.0 geen manier om de donkere set aan te zetten. Wat er niet komt: een schakelaar in Instellingen, een `prefers-color-scheme`-regel, en visuele controle van de donkere schermen. Het is een voorbereiding, geen halve functie.

### 5.6 Ontwerptekens

Alle waarden staan in één bestand als CSS-eigenschappen. De namen zijn Engels, want het is code. Tailwind leest hetzelfde bestand, zodat er geen tweede waarheid ontstaat.

```css
:root {
  /* --- kleur: palet (nooit rechtstreeks in een component) --- */
  --palette-gray-0:#FFFFFF; --palette-gray-25:#FBFCFD; --palette-gray-50:#F6F7F9;
  --palette-gray-100:#EDEFF2; --palette-gray-200:#DFE3E8; --palette-gray-300:#C9CFD6;
  --palette-gray-400:#A3ACB7; --palette-gray-500:#7C8794; --palette-gray-600:#5C6672;
  --palette-gray-700:#444C57; --palette-gray-800:#2E353E; --palette-gray-900:#1D232A;
  --palette-gray-950:#14181D;
  --palette-accent-50:#EEF3FC; --palette-accent-100:#D9E4F8; --palette-accent-200:#B6CBF0;
  --palette-accent-300:#88A9E4; --palette-accent-400:#5583D3; --palette-accent-500:#2E5FBE;
  --palette-accent-600:#1F4CA6; --palette-accent-700:#1A3E86; --palette-accent-800:#17346D;
  --palette-accent-900:#152C5A;
  --palette-success-50:#E9F6EE; --palette-success-300:#66B78C; --palette-success-500:#1E7A4B; --palette-success-600:#186340;
  --palette-warning-50:#FDF3E2; --palette-warning-300:#E0A83C; --palette-warning-500:#9A6300; --palette-warning-600:#7E5100;
  --palette-danger-50:#FDEDEC;  --palette-danger-300:#E8837A;  --palette-danger-500:#B42318;  --palette-danger-600:#95190F;
  --palette-info-50:#E8F4F9;    --palette-info-300:#5FB4D4;    --palette-info-500:#0B6E99;    --palette-info-600:#095A7E;
  --palette-series-1:#2E5FBE; --palette-series-2:#0B6E99; --palette-series-3:#1E7A4B;
  --palette-series-4:#6B7A17; --palette-series-5:#9A6300; --palette-series-6:#A8452B;
  --palette-series-7:#8E3A6B; --palette-series-8:#5B4BA8;

  /* --- kleur: rollen (dit gebruiken componenten) --- */
  --color-surface:            var(--palette-gray-0);
  --color-surface-sunken:     var(--palette-gray-25);
  --color-surface-hover:      var(--palette-gray-50);
  --color-surface-selected:   var(--palette-accent-50);
  --color-surface-overlay:    var(--palette-gray-0);
  --color-scrim:              rgb(20 24 29 / 0.45);
  --color-text-primary:       var(--palette-gray-900);
  --color-text-heading:       var(--palette-gray-800);
  --color-text-secondary:     var(--palette-gray-700);
  --color-text-tertiary:      var(--palette-gray-600);
  --color-text-placeholder:   var(--palette-gray-600);
  --color-text-disabled:      var(--palette-gray-400);
  --color-text-on-accent:     var(--palette-gray-0);
  --color-border-subtle:      var(--palette-gray-200);
  --color-border-default:     var(--palette-gray-300);
  --color-border-input:       var(--palette-gray-500);
  --color-border-strong:      var(--palette-gray-700);
  --color-accent:             var(--palette-accent-500);
  --color-accent-hover:       var(--palette-accent-600);
  --color-accent-active:      var(--palette-accent-700);
  --color-accent-quiet:       var(--palette-accent-50);
  --color-focus:              var(--palette-accent-500);
  --color-success:            var(--palette-success-500);
  --color-success-bg:         var(--palette-success-50);
  --color-warning:            var(--palette-warning-500);
  --color-warning-bg:         var(--palette-warning-50);
  --color-danger:             var(--palette-danger-500);
  --color-danger-hover:       var(--palette-danger-600);
  --color-danger-bg:          var(--palette-danger-50);
  --color-info:               var(--palette-info-500);
  --color-info-bg:            var(--palette-info-50);

  /* --- ruimte --- */
  --space-0:0; --space-2:2px; --space-4:4px; --space-8:8px; --space-12:12px;
  --space-16:16px; --space-20:20px; --space-24:24px; --space-32:32px; --space-40:40px;
  --space-48:48px; --space-64:64px; --space-80:80px; --space-96:96px;

  /* --- letter --- */
  --font-screen: "Inter var", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-print:  "Source Sans 3", "Source Sans Pro", sans-serif;
  --font-mono:   ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", monospace;
  --text-3xl:32px;  --leading-3xl:40px;  --tracking-3xl:-0.02em;
  --text-2xl:24px;  --leading-2xl:32px;  --tracking-2xl:-0.015em;
  --text-xl:20px;   --leading-xl:28px;   --tracking-xl:-0.01em;
  --text-lg:18px;   --leading-lg:28px;   --tracking-lg:0;
  --text-md:16px;   --leading-md:24px;   --tracking-md:0;
  --text-sm:14px;   --leading-sm:20px;   --tracking-sm:0;
  --text-xs:12px;   --leading-xs:16px;   --tracking-xs:0.01em;
  --text-2xs:11px;  --leading-2xs:14px;  --tracking-2xs:0.04em;
  --weight-regular:400; --weight-medium:500; --weight-semibold:600;
  --measure-read:33rem;

  /* --- straal --- */
  --radius-0:0; --radius-sm:4px; --radius-md:6px; --radius-lg:10px;
  --radius-xl:16px; --radius-full:9999px;

  /* --- schaduw --- */
  --shadow-0:none;
  --shadow-1:0 1px 2px rgb(20 24 29 / 0.06), 0 1px 1px rgb(20 24 29 / 0.04);
  --shadow-2:0 2px 6px rgb(20 24 29 / 0.08), 0 1px 2px rgb(20 24 29 / 0.06);
  --shadow-3:0 8px 24px rgb(20 24 29 / 0.12), 0 2px 6px rgb(20 24 29 / 0.08);
  --shadow-4:0 16px 48px rgb(20 24 29 / 0.18);

  /* --- randen --- */
  --border-thin:1px; --border-thick:2px;
  --focus-width:2px; --focus-offset:2px;

  /* --- maten van de schil --- */
  --size-rail:240px; --size-rail-compact:64px; --size-rail-wide:280px;
  --size-panel:400px; --size-topbar:56px; --size-bottombar:56px;
  --size-control-sm:32px; --size-control-md:40px; --size-control-lg:48px;
  --size-touch-min:44px;
  --size-icon-sm:16px; --size-icon-md:20px; --size-icon-lg:24px;
  --size-content-max:1440px;

  /* --- beweging --- */
  --duration-0:0ms; --duration-1:120ms; --duration-2:180ms; --duration-3:240ms;
  --easing-standard:cubic-bezier(0.2,0,0,1);
  --easing-enter:cubic-bezier(0,0,0.2,1);
  --easing-exit:cubic-bezier(0.4,0,1,1);

  /* --- lagen --- */
  --layer-base:0; --layer-sticky:10; --layer-menu:100;
  --layer-panel:200; --layer-dialog:300; --layer-toast:400;
}

[data-theme="dark"] {
  --color-surface:            var(--palette-gray-950);
  --color-surface-sunken:     #0E1216;
  --color-surface-hover:      var(--palette-gray-900);
  --color-surface-selected:   #1B2536;
  --color-surface-overlay:    var(--palette-gray-900);
  --color-scrim:              rgb(0 0 0 / 0.60);
  --color-text-primary:       var(--palette-gray-300);
  --color-text-heading:       var(--palette-gray-200);
  --color-text-secondary:     var(--palette-gray-400);
  --color-text-tertiary:      var(--palette-gray-500);
  --color-text-placeholder:   var(--palette-gray-500);
  --color-text-disabled:      var(--palette-gray-600);
  --color-border-subtle:      var(--palette-gray-800);
  --color-border-default:     var(--palette-gray-700);
  --color-border-input:       var(--palette-gray-500);
  --color-accent:             var(--palette-accent-300);
  --color-accent-hover:       var(--palette-accent-400);
  --color-focus:              var(--palette-accent-300);
  --color-success:            var(--palette-success-300);
  --color-warning:            var(--palette-warning-300);
  --color-danger:             var(--palette-danger-300);
  --color-info:               var(--palette-info-300);
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration-1:0ms; --duration-2:0ms; --duration-3:0ms; }
}
```

De regel eromheen is hard: **geen enkele component bevat een waarde die niet uit een teken komt.** Geen `padding: 13px`, geen `#3b82f6`, geen `border-radius: 8px`, geen `transition: 200ms`. Twee dingen bewaken dat. Stylelint weigert een letterlijke kleur, een pixelwaarde buiten de schaal en een duur buiten de schaal in elk bestand onder `src/`. En een eenheidstest leest het tokenbestand, berekent voor elk tekstteken het contrast tegen zijn achtergrondrol, en faalt onder 4,5:1 voor tekst en onder 3:1 voor randen en focus, voor beide thema's. De enige uitzondering op de tekenregel is de printlaag: die rekent in millimeters en heeft een eigen tekenset, beschreven in §5.10.

### 5.7 Componentbibliotheek

Versie 1.0 heeft eenentwintig componenten. Ze staan op Radix waar Radix een primitief levert (zie hoofdstuk 11); dit deel beschrijft hun vorm en gedrag, niet hun code. Elke component kent dezelfde zeven toestanden waar ze van toepassing zijn: rust, zweven, focus, actief, uitgeschakeld, laden en fout. Toestanden die voor een component geen betekenis hebben, bestaan niet — een kaart heeft geen foutstand.

Eerst de maten van de bedieningselementen, want die zijn gedeeld:

| Maat | Hoogte | Horizontale binnenruimte | Tekst | Straal | Waar |
|---|---|---|---|---|---|
| Klein | 32 px | 12 px | `text-sm` | `radius-md` | In een tabelrij, in het exportpaneel, in een chipbalk |
| Standaard | 40 px | 16 px | `text-sm` | `radius-md` | Overal op de laptop |
| Groot | 48 px | 20 px | `text-md` | `radius-md` | Hoofdactie van een scherm; alle bedieningselementen onder 768 px |

Op de laptop is het klikbare vlak van elk bedieningselement minstens 24 × 24 px, ook als het pictogram kleiner is. Op een aanraakscherm is het minstens 44 × 44 px. Focus is overal dezelfde ring: 2 px `--color-focus` met 2 px afstand, zichtbaar bij toetsenbordfocus en verborgen bij muisfocus, via `:focus-visible`.

| Component | Varianten | Toestanden en vorm | Toegankelijkheid | Gebruik hem niet voor |
|---|---|---|---|---|
| **Knop** | Hoofd (gevuld accent), tweede (rand `gray-300`, witte vulling), rustig (geen rand, tekst `gray-700`), gevaarlijk (gevuld `danger-500`), alleen-pictogram | Rust `accent-500`; zweven `accent-600`; actief `accent-700` plus 1 px verschuiving omlaag zonder schaduw; focus ring; uitgeschakeld `gray-100` met `gray-400` tekst en geen aanwijzer; laden toont een draaiend pictogram van 16 px links van de tekst en houdt de breedte vast | Echt `<button>`, `aria-busy` bij laden, `aria-disabled` in plaats van `disabled` als de knop nog een uitlegballon moet kunnen tonen | Navigatie naar een ander scherm — dat is een koppeling |
| **Invoerveld** | Tekst, e-mail, getal, met voorvoegsel, met pictogram rechts | Hoogte 40 px, rand 1 px `border-input`, straal `radius-md`; zweven rand `gray-700`; focus rand `accent-500` plus ring; fout rand `danger-500` plus foutregel eronder; uitgeschakeld vulling `gray-50`; laden bestaat niet | Zichtbaar `<label>` boven het veld, nooit alleen een plaatshouder; `aria-describedby` naar hulptekst en foutregel; `aria-invalid` bij fout | Een zoekopdracht — daar is het zoekveld voor |
| **Tekstvlak** | Vast, groeiend, schrijfveld | Minimaal 3 regels, groeit tot 20 regels en gaat dan schuiven; het schrijfveld is een eigen variant zonder rand, breedte `measure-read`, met een tekenteller rechtsonder in `text-xs` | Zelfde als het invoerveld; de tekenteller is `aria-live="polite"` en meldt alleen bij de laatste 50 tekens | Opgemaakte tekst — er is in 1.0 geen vet of cursief in een tekstblok |
| **Keuzelijst** | Enkel, met zoekregel, gegroepeerd | Ziet eruit als een invoerveld met een pijltje van 16 px; open toont een lijst met `shadow-2` en `radius-lg`; de gekozen regel heeft `surface-selected` en een vinkje | Radix Select: toetsenbordnavigatie, typen om te springen, `aria-expanded`, focus keert terug naar de knop | Meer dan twaalf opties zonder zoekregel, en nooit voor twee opties — dan is het een schakelaar of een radiopaar |
| **Schakelaar** | Standaard, klein | Spoor 40 × 24 px, knop 20 px, straal `radius-full`; uit is `gray-300`, aan is `accent-500`; de knop schuift in `duration-1`; focus ring om het hele spoor | Radix Switch met `role="switch"` en `aria-checked`; het label staat links en is zelf klikbaar | Iets wat pas werkt na opslaan — een schakelaar belooft directe werking |
| **Selectievakje** | Enkel, onbepaald, in een lijst | 20 × 20 px, straal `radius-sm`, rand `border-input`; aangevinkt is `accent-500` met een wit vinkje; onbepaald toont een streep; fout kleurt de rand `danger-500` | Radix Checkbox, `aria-checked="mixed"` voor onbepaald, het label is aanklikbaar via `<label>` | Elkaar uitsluitende keuzes — dat is een radiogroep |
| **Kaart** | Rustig (rand `gray-200`, geen schaduw), aanklikbaar, met kop | Straal `radius-lg`, binnenruimte 24 px op de laptop en 16 px op de telefoon; aanklikbaar krijgt bij zweven `surface-hover` en bij focus de ring om de hele kaart | Is de hele kaart klikbaar, dan zit de koppeling op de titel en dekt een onzichtbaar vlak de rest; nooit `onClick` op een `<div>` | Een lijst van gelijksoortige regels — dat is een lijstrij |
| **Lijstrij** | Enkelvoudig, tweeregelig, met miniatuur, met reeksstaaf | Hoogte 56 px enkel, 72 px tweeregelig; binnenruimte 12 px verticaal en 20 px horizontaal; scheidingslijn `gray-200`; zweven `surface-hover`; geselecteerd `surface-selected` met een linkerstaaf van 3 px in `accent-500`; de reeksstaaf van 3 px zit links en gebruikt een `series`-teken | De rij is een `<a>` of `<button>`; de driepuntsknop (B-33) is een aparte knop met de naam "Meer acties voor <titel>" | Meer dan drie gegevens per regel — dan is het een tabel |
| **Tabblad** | Onderstreept, gesegmenteerd | Onderstreept: tekst `gray-700`, actief `gray-900` met een onderstreep van 2 px in `accent-500`; gesegmenteerd: vulling `gray-100` met een witte actieve pil en `shadow-1` | Radix Tabs: pijltjestoetsen wisselen, `aria-selected`, het paneel heeft `tabindex="0"` als het schuift | Stappen in een proces — dat is een stappenbalk, en die heeft 1.0 niet |
| **Paneel dat inschuift** | Rechts 400 px, schermvullend onder 768 px, onderblad op de telefoon | Schuift in 240 ms met `easing-enter`, met een waas van `color-scrim` eronder; `shadow-3`; een kop van 56 px met titel en sluitknop; de inhoud schuift, de kop niet | Radix Dialog met `modal`; focus springt naar de kop, Escape sluit, focus keert terug naar de knop die hem opende; achterliggende inhoud krijgt `aria-hidden` | Een bevestiging van één zin — dat is een dialoogvenster |
| **Dialoogvenster** | Bevestiging, invoer, vernietigend | Breedte 480 px, straal `radius-xl`, `shadow-4`, binnenruimte 24 px; knoppen rechtsonder met de bevestigende knop rechts; op de telefoon een onderblad met een greep van 32 × 4 px | Zelfde als het paneel; de vernietigende variant zet de standaardfocus op Annuleren, niet op Verwijderen | Iets wat je ook naast het werk kunt tonen — een dialoogvenster blokkeert |
| **Melding** | Bevestiging, waarschuwing, fout, informatie; als strook of als zwevend bericht | Strook: volle breedte, achtergrond `*-bg`, linkerrand 3 px in de semantische kleur, pictogram 20 px, titel `text-sm` 600, tekst `text-sm` 400. Zwevend: rechtsonder, breedte 360 px, `shadow-3`, verdwijnt na 6 seconden, blijft staan bij zweven of focus | `role="status"` voor bevestiging en informatie, `role="alert"` voor fout; een zwevende melding met een handeling verdwijnt nooit vanzelf | Een fout in een formulierveld — die hoort onder het veld |
| **Voortgangsbalk** | Bepaald, onbepaald | Hoogte 4 px, straal `radius-full`, spoor `gray-200`, vulling `accent-500`; de bepaalde variant toont rechts een percentage in `text-xs`; de onbepaalde variant schuift een blok van 30% heen en weer in 1200 ms | `role="progressbar"` met `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; bij onbepaald alleen `aria-label` | Iets korter dan 500 ms — dan gebeurt er niets zichtbaars |
| **Chip / label** | Statisch, verwijderbaar, aanklikbaar, status | Hoogte 24 px, binnenruimte 8 px, straal `radius-sm`, `text-xs` 500; statisch is `gray-100` met `gray-700`; aanklikbaar en gekozen is `accent-100` met `accent-700` en rand `accent-200`; verwijderbaar heeft een kruis van 16 px | De verwijderknop is een eigen knop met de naam "Verwijder <label>"; een statische chip is geen knop en krijgt geen focus | Een handeling — een chip die iets uitvoert is een knop |
| **Zoekveld** | In de balk, in een paneel | Hoogte 40 px, vergrootglas 20 px links, wisknop rechts zodra er tekst staat; resultaten verschijnen onder het veld met vet gezette treffers; zoeken start na 200 ms stilte | `role="searchbox"`, `aria-controls` naar de resultatenlijst, `aria-activedescendant` bij pijltjesnavigatie; het aantal resultaten wordt beleefd voorgelezen | Filteren op een vaste eigenschap — dat is een chipbalk of een keuzelijst |
| **Datumkiezer** | Enkele datum, periode | Veld van 40 px met een kalenderpictogram; de kalender is 280 px breed met dagcellen van 36 px, weeknummers links in `gray-600`, vakanties met een lichte `warning-50` achtergrond; vandaag heeft een rand, de keuze een gevulde cirkel | Typen in het veld blijft mogelijk in de vorm `dd-mm-jjjj`; de kalender is een dialoogvenster met pijltjesnavigatie, Page Up en Page Down voor maanden, en `aria-label` per dag met de volledige datum | Een tijdstip — tijd is een aparte keuzelijst met stappen van 5 minuten |
| **Fotoraster** | Strook (schrijfscherm), raster (fotokeuze), voorbeeld (exportpaneel) | Miniaturen van 96 px in de strook en 160 px in het raster, straal `radius-md`, altijd bijgesneden naar 3:2 met `object-fit: cover`; elke miniatuur heeft twee pijlknoppen en is sleepbaar (B-38); geselecteerd krijgt een rand van 2 px `accent-500` en een vinkje rechtsboven | De pijlknoppen zijn de toegankelijke route en heten "Verplaats naar voren" en "Verplaats naar achteren"; na verplaatsen meldt een beleefde regio "Foto 3 van 6"; slepen is nooit de enige weg | Een enkele foto — die krijgt gewoon een blok |
| **Avatar / initiaal** | Klein 24 px, standaard 32 px, groot 48 px | Cirkel, `radius-full`, vulling `gray-100`, tekst `gray-700` 600 in `text-xs` of `text-sm`; de inhoud is één of twee letters, nooit een foto van een kind | De initiaal is decoratief en krijgt `aria-hidden`; de naam staat er altijd als tekst naast of de knop heeft een eigen naam | Een kind herkenbaar maken — een avatar met een foto bestaat in EduFlow niet |
| **Lege toestand** | Eerste keer, geen resultaten, alles klaar | Gecentreerd in een kolom van maximaal 400 px, met 64 px ruimte boven en onder; één pictogram van 32 px in `gray-400`, een kop in `text-xl`, een zin in `text-md` `gray-700`, en hooguit één knop | De kop is een echte kop in de koppenhiërarchie; het pictogram is decoratief | Een laadmoment — een leeg scherm tijdens het laden is een skelet, geen lege toestand |
| **Foutblok** | Op het scherm, in een paneel, over de hele pagina | Zelfde bouw als de lege toestand maar met `danger-500` pictogram, de foutzin in gewone taal, wat de gebruiker nu kan doen, en een knop "Opnieuw proberen"; de technische code staat eronder in `text-xs` `gray-600` en is te kopiëren | `role="alert"` bij verschijnen; de focus springt naar de kop van het blok | Een validatiefout in een veld — die hoort bij het veld |
| **Hulptekst** | Uitleg, waarschuwing, teller | `text-sm` `gray-700`, 8 px onder het veld; bij een fout verandert hij niet van plek maar krijgt hij gezelschap van de foutregel in `danger-500` | Altijd gekoppeld met `aria-describedby`; verdwijnt nooit zodra het veld focus krijgt | Iets wat de gebruiker altijd moet weten — dat hoort in het label |

Twee dingen die over alle componenten gelden. Een component heeft nooit een eigen animatieduur, kleur of afstand; alles komt uit §5.6. En elke component die tekst toont, respecteert de leeskolom: staat hij in de leeskolom, dan is hij nooit breder dan `measure-read`.

### 5.8 Beweging

Beweging draagt betekenis of blijft achterwege. Er zijn precies drie dingen die beweging in EduFlow mag doen: laten zien waar iets vandaan komt, laten zien dat er iets is veranderd, en laten zien dat het systeem nog bezig is. Alles daarbuiten wordt niet gebouwd.

| Wat | Duur | Versoepeling | Wat er beweegt |
|---|---|---|---|
| Zweven, focus, aanvinken | 120 ms | `easing-standard` | Alleen kleur, rand en de knop van de schakelaar |
| Melding of tekstballon verschijnt | 180 ms | `easing-enter` | Doorzichtigheid en 4 px verschuiving omhoog |
| Melding of tekstballon verdwijnt | 120 ms | `easing-exit` | Alleen doorzichtigheid |
| Paneel schuift in | 240 ms | `easing-enter` | Positie van rechts, plus de waas van 0 naar 45% |
| Paneel schuift uit | 180 ms | `easing-exit` | Positie en waas |
| Dialoogvenster verschijnt | 240 ms | `easing-enter` | Doorzichtigheid en schaal van 0,98 naar 1 |
| Lijstrij verdwijnt na verwijderen | 180 ms | `easing-exit` | Hoogte naar 0 en doorzichtigheid naar 0 |
| Onbepaalde voortgang | 1200 ms, herhalend | lineair | Een blok van 30% dat heen en weer schuift |

Verdwijnen gaat altijd sneller dan verschijnen. Wat weg moet, moet weg zijn.

Wat niet beweegt: schermen wisselen niet met een overgang, lijsten schuiven niet in bij het laden, getallen tellen niet op, foto's zoomen niet bij het zweven, en er is geen enkele veerbeweging. De reden is hoofdregel 1: beweging trekt het oog en het oog hoort bij de tekst te zijn.

Eén beweging is bewust wél toegestaan omdat hij informatie draagt: als je "Overnemen" kiest en het AI-voorstel de plaats van je eigen tekst inneemt (B-39), vervaagt de oude tekst in 120 ms en verschijnt de nieuwe in 180 ms op dezelfde plek. Zonder die overgang is het onduidelijk of er iets is vervangen of dat er iets is bijgekomen.

`prefers-reduced-motion: reduce` zet alle drie de duurtekens op 0 ms, zoals te zien is in §5.6. Dat betekent: geen verschuiving, geen schaling, geen vervaging — de eindtoestand verschijnt meteen. De onbepaalde voortgangsbalk stopt met schuiven en wordt een statische balk met een beleefde tekstmelding ("Bezig met samenvatten"). Er wordt niets uitgeschakeld waardoor informatie verdwijnt; alleen de weg ernaartoe verdwijnt.

### 5.9 Iconen

Er is één set: Lucide. Lijnstijl, MIT-licentie, getekend op een raster van 24 px. De lijndikte staat op 1,5 px in plaats van de standaard 2 px, omdat 2 px naast Inter op 16 px te zwaar staat. Iconen worden als React-component ingevoegd, per stuk, nooit als volledig pakket en nooit als lettertype.

| Maat | Waarde | Lijndikte | Waar |
|---|---|---|---|
| Klein | 16 px | 1,5 px | In een knop naast tekst, in een chip, in een teller |
| Standaard | 20 px | 1,5 px | In een invoerveld, in de navigatiebalk, in een melding |
| Groot | 24 px | 1,5 px | Als losse knop in een werkbalk, in de pictogrambalk op 1024 px |

Een icoon staat nooit alleen zonder tekst of toegankelijke naam. Twee gevallen. Staat er tekst naast, dan is het icoon decoratief en krijgt het `aria-hidden="true"`; de tekst doet het werk. Staat er geen tekst naast, dan is het een knop met een `aria-label` in het Nederlands die de handeling benoemt ("Verwijder foto", niet "Prullenbak"), plus een tekstballon die na 400 ms hetzelfde zegt voor wie kan zien. Een icoon-knop zonder naam is een fout die de eenheidstest afvangt.

Iconen dragen nooit alleen een status. Een groen vinkje betekent niets zonder het woord ernaast. Iconen worden ook nooit gekleurd om decoratieve redenen: ze zijn `currentColor` en erven dus de kleur van hun tekst.

De set is beperkt tot ongeveer veertig iconen voor versie 1.0. Ontbreekt er een, dan kies je een bestaand icoon met een andere betekenis niet opnieuw; je zoekt in Lucide verder of je gebruikt tekst.

### 5.10 Het ontwerp van de documentatiepagina

De documentatiepagina is een ander ontwerpprobleem dan de rest van de app. Wat op het scherm staat, dient de maker; wat op de pagina staat, gaat naar ouders en wordt afgedrukt. De pagina moet leesbaar zijn op papier van 297 bij 210 millimeter, op een telefoonscherm waar hij als afbeelding in een bericht verschijnt, en op een schoolbord waar hij soms geprojecteerd wordt.

Het canvas is vast: **A4 liggend, 297 × 210 mm, 10 mm marge rondom** (T-13). Alle sloten worden in millimeters beschreven. De renderlaag rekent millimeters om naar punten voor de PDF en naar pixels voor het voorbeeld op het scherm; er is geen tweede layoutdefinitie (B-26).

De werkbare binnenmaat is dus **277 × 190 mm**. Daarbinnen ligt een raster van 12 kolommen van 21,25 mm met 4 mm tussenruimte, en 8 rijen van 21,75 mm met 4 mm tussenruimte. Elk slot valt op rasterlijnen. Dat maakt het mogelijk om later layouts toe te voegen zonder het systeem te herzien.

#### 5.10.1 Typografie van de gedrukte pagina

Dit is niet de schermtypografie uit 5.4. Op papier is de leesafstand groter, is er geen schuiven, en telt contrast met inkt anders dan contrast met licht.

| Rol | Grootte | Regelhoogte | Gewicht | Opmerking |
|---|---|---|---|---|
| Documentatietitel | 24 pt | 28 pt | 600 | maximaal twee regels, daarna afkappen met beletselteken |
| Reeksnaam | 10 pt | 12 pt | 500 | in hoofdletters met 0,08 em spatiëring, boven de titel |
| Datum | 10 pt | 12 pt | 400 | naast de reeksnaam, rechts uitgelijnd |
| Lopende tekst | 11 pt | 16,5 pt | 400 | regellengte nooit boven 90 tekens |
| Citaat | 14 pt | 20 pt | 400 cursief | met een 2 mm brede staaf links in de accentkleur |
| Citaatbron | 9 pt | 12 pt | 500 | roepnaam of initiaal, onder het citaat |
| Bijschrift bij foto | 8,5 pt | 11 pt | 400 | alleen als er een alternatieve tekst is ingevuld |
| Voettekst | 7,5 pt | 9 pt | 400 | neutraal-500 |
| Paginanummer | 7,5 pt | 9 pt | 500 | rechtsonder, vorm "2 van 3" |

De voettekst bevat één regel: de naam van de groep, de datum en de paginaaanduiding. Verder niets. Geen logo van EduFlow op de pagina zelf (zie 5.13).

#### 5.10.2 Layout A — fotoraster

Voor de gewone documentatie: vier tot zes foto's, een korte tekst, een of twee citaten. Dit is de layout die het vaakst gekozen wordt.

| Slot | Soort | x | y | breedte | hoogte |
|---|---|---|---|---|---|
| A0 | kop (reeks, titel, datum) | 10 | 10 | 277 | 26 |
| A1 | foto | 10 | 40 | 88 | 66 |
| A2 | foto | 104,5 | 40 | 88 | 66 |
| A3 | foto | 199 | 40 | 88 | 66 |
| A4 | foto | 10 | 110 | 88 | 66 |
| A5 | foto | 104,5 | 110 | 88 | 66 |
| A6 | tekst + citaten | 199 | 110 | 88 | 66 |
| A7 | voettekst | 10 | 192 | 277 | 8 |

Met vier foto's vervallen A3 en A5, en groeit A6 naar de vrijgekomen ruimte (B-07 en de bestaande regel dat de rest opschuift). Met zes foto's verhuist de tekst naar een vervolgpagina in layout `E-vervolg`.

#### 5.10.3 Layout B — verhaal

Voor de documentatie waarin de tekst het werk doet: één of twee foto's, veel tekst, meerdere citaten. Twee tekstkolommen, want 277 mm in één kolom levert regels van ver boven de 90 tekens.

| Slot | Soort | x | y | breedte | hoogte |
|---|---|---|---|---|---|
| B0 | kop | 10 | 10 | 277 | 26 |
| B1 | foto | 10 | 40 | 133 | 90 |
| B2 | foto | 154 | 40 | 133 | 90 |
| B3 | tekstkolom links | 10 | 136 | 133 | 54 |
| B4 | tekstkolom rechts | 154 | 136 | 133 | 54 |
| B5 | voettekst | 10 | 192 | 277 | 8 |

Met één foto beslaat B1 de volle 277 mm en zakken de tekstkolommen niet. Tekst loopt van B3 naar B4 en daarna naar een vervolgpagina.

#### 5.10.4 Layout C — groot beeld

Eén dominante foto met een kort onderschrift. Dit is de layout waarvoor de fotoresolutie uit T-02 verhoogd is: 277 mm bij 300 dpi vraagt 3272 pixels, en 3300 haalt dat met marge.

| Slot | Soort | x | y | breedte | hoogte |
|---|---|---|---|---|---|
| C0 | kop | 10 | 10 | 277 | 26 |
| C1 | foto | 10 | 40 | 277 | 122 |
| C2 | tekst of citaat | 10 | 168 | 190 | 22 |
| C3 | tweede foto (optioneel, klein) | 206 | 168 | 81 | 22 |
| C4 | voettekst | 10 | 192 | 277 | 8 |

#### 5.10.5 Layout D — alleen beeld

Twee tot vier foto's, geen lopende tekst. Bedoeld voor het moment waarop de beelden voor zichzelf spreken. Citaten zijn wél toegestaan, als bijschrift onder een foto, want een citaat is geen lopende tekst maar een uitspraak.

| Slot | Soort | x | y | breedte | hoogte |
|---|---|---|---|---|---|
| D0 | kop (compact, alleen titel en datum) | 10 | 10 | 277 | 16 |
| D1 | foto | 10 | 30 | 136,5 | 78 |
| D2 | foto | 150,5 | 30 | 136,5 | 78 |
| D3 | foto | 10 | 112 | 136,5 | 78 |
| D4 | foto | 150,5 | 112 | 136,5 | 78 |
| D5 | voettekst | 10 | 192 | 277 | 8 |

Met twee foto's beslaan D1 en D2 de volle hoogte van 160 mm.

**Tekst bij layout D (B-28).** Kies je D voor een documentatie waarin tekst staat, dan verdwijnt die tekst niet. Het exportpaneel meldt: "Layout D toont geen lopende tekst. Je tekst komt op een tweede pagina." en voegt automatisch een pagina in layout `B-verhaal` toe met de titel herhaald. Wil je dat niet, dan zet je in het paneel "Laat de tekst weg" aan; dat is een bewuste handeling met een zichtbaar gevolg, geen stille weglating.

#### 5.10.6 Layout E — vervolg

De layout die `PageService` zelf inzet bij overloop. Hij bestaat niet in de miniaturenkiezer, maar is wel zichtbaar in de paginanavigator en te wijzigen naar een van de andere vier.

| Slot | Soort | x | y | breedte | hoogte |
|---|---|---|---|---|---|
| E0 | herhaalde titel | 10 | 10 | 277 | 14 |
| E1 | tekstkolom links | 10 | 30 | 133 | 160 |
| E2 | tekstkolom rechts | 154 | 30 | 133 | 160 |
| E3 | voettekst | 10 | 192 | 277 | 8 |

De herhaalde titel is kleiner dan op de eerste pagina: 14 pt in plaats van 24 pt, met de toevoeging "(vervolg)" in neutraal-500. Zonder die herhaling is een losse tweede pagina op een bureau niet thuis te brengen — dat is precies waar B-07 voor bedoeld is.

#### 5.10.7 Overloopregels

`LayoutService` bepaalt of de inhoud past. De regels, in deze volgorde:

1. Foto's worden verdeeld over de fotosloten van de gekozen layout, in de volgorde waarin ze staan.
2. Zijn er meer foto's dan sloten, dan komt er een vervolgpagina in dezelfde layout.
3. Tekst wordt in de tekstsloten gezet tot die vol zijn, gemeten op de werkelijke regelhoogte.
4. Blijft er tekst over, dan komt er een vervolgpagina in `E-vervolg`.
5. Citaten blijven bij de tekst waar ze onder staan; een citaat wordt nooit over een paginagrens gebroken. Past het niet meer, dan schuift het geheel door.
6. Een pagina met minder dan 15 mm gevulde hoogte wordt niet aangemaakt; die inhoud gaat terug naar de vorige pagina en de tekst wordt daar iets krapper gezet, tot maximaal 4 procent kleiner. Helpt dat niet, dan komt de pagina er alsnog.

Het aantal pagina's staat vóór de export in het paneel, zodat je niet verrast wordt door een tweede blad (B-07).

### 5.11 Foto's in het ontwerp

Elk fotoslot heeft een vaste verhouding. Een foto wordt **passend gemaakt door bij te snijden vanuit het midden**, niet door te vervormen en niet door witruimte toe te voegen. Dat is de enige keuze die er altijd redelijk uitziet zonder de gebruiker om een beslissing te vragen.

Wie het anders wil, kan per foto het bijsnijdvenster verschuiven; dat wordt opgeslagen bij het `PhotoBlock`, niet bij de `Photo`, want dezelfde foto kan in twee documentaties anders bijgesneden zijn.

| Slotsoort | Verhouding | Voorbeeld |
|---|---|---|
| Fotoraster A1-A5 | 4:3 | 88 × 66 mm |
| Verhaal B1-B2 | 3:2 | 133 × 90 mm |
| Groot beeld C1 | 2,27:1 | 277 × 122 mm |
| Klein beeld C3 | 3,7:1 | 81 × 22 mm |
| Alleen beeld D1-D4 | 1,75:1 | 136,5 × 78 mm |

**Een staande foto in een liggend slot.** De foto wordt gecentreerd bijgesneden op de slotverhouding. Bij een verschil van meer dan een factor 1,8 tussen de verhoudingen verschijnt in het exportpaneel de opmerking "Deze foto is staand en wordt fors bijgesneden" met een knop "Bijsnijden aanpassen". Blokkeren doet de app niet.

**Te lage resolutie.** Voor 300 dpi geldt: benodigde pixels = breedte in mm × 11,81. Een slot van 88 mm vraagt 1040 px, C1 vraagt 3272 px. Is de opgeslagen `print`-variant kleiner dan het benodigde aantal, dan toont het exportpaneel per foto een waarschuwing met de haalbare resolutie: "Deze foto haalt 190 dpi op deze plek. Goed genoeg voor beeldscherm, zichtbaar op papier." De export gaat gewoon door; dit is informatie, geen blokkade.

### 5.12 De deelbare afbeelding

De deelbare afbeelding wordt **uit de gegenereerde PDF gerasterd** (B-27). Daardoor is hij per definitie identiek aan wat er uit de printer komt, en bestaat er geen tweede tekenpad dat uit de pas kan lopen.

| Eigenschap | Waarde | Reden |
|---|---|---|
| Formaat | JPEG | universeel te plakken en te versturen |
| Afmeting | 2480 × 1754 px | 210 dpi op A4 liggend; scherp op elk scherm, klein genoeg voor een mailbijlage |
| Kwaliteit | 88 | grens waaronder tekstranden zichtbaar gaan rafelen |
| Bestandsgrootte | doorgaans 400-900 kB per pagina | past in elke mail |
| Meerdere pagina's | één JPG per pagina, genummerd in de bestandsnaam | volgt uit B-07 |
| Bestandsnaam | `2026-10-13 Kunstwerk Dok 2 - pagina 1 van 3.jpg` | terug te vinden in een fotorol |

**De legenda bij initialen (B-40).** Staat de schakelaar "namen vervangen door initialen" aan, dan komt onderaan de laatste pagina een regel van 7,5 pt: "K. = Kjeld · K2. = Kaya · N. = Noa B. · N2. = Noa V." Zonder die legenda is een documentatie met twee K's niet te volgen, en de botsingsregel zonder uitleg is verwarrender dan de namen zelf. De legenda staat er alleen als er een botsing is.

### 5.13 Merk

De naam is **EduFlow**. Het beeldmerk is een enkele vorm: een afgeronde rechthoek met een doorlopende lijn erin die van links onder naar rechts boven buigt — een pagina met een beweging erin. Eén kleur, de accentkleur, en een variant in zwart voor afdrukken. Geen woordmerk met een aparte letter; de naam wordt gezet in de schermletter met gewicht 600.

De regel die belangrijker is dan het merk zelf: **EduFlow zet zijn naam niet op iets wat naar ouders gaat.** Een documentatie is het werk van de leerkracht en gaat over hun kind; er hoort geen leverancierslogo op. Het enige dat de app achterlaat is één regel in de voettekst in neutraal-500 op 7,5 pt: "Gemaakt met EduFlow". Die regel is uit te zetten in Instellingen, en dat is de standaard voor de deelbare afbeelding maar niet voor de PDF.

In de app zelf is het merk terughoudend aanwezig: het beeldmerk staat in de zijbalk op 24 px, en verder nergens. Er is geen splashscherm.

### 5.14 Ontwerpschulden en bewuste beperkingen

Wat nu niet ontworpen wordt, met de reden en het moment waarop het terugkomt.

| # | Wat | Waarom niet nu | Wanneer wel |
|---|---|---|---|
| 1 | Donkere modus | De tokens liggen klaar, maar elke component moet in twee schema's getest worden en dat is werk zonder nieuwe functionaliteit | versie 1.1 (B-42) |
| 2 | Eigen layouts maken | Een layout-editor is een product op zich; vijf goede layouts dekken de praktijk | niet voorzien |
| 3 | Kleuren of lettertypen per school | Vraagt om een merkbeheerscherm en maakt de export onvoorspelbaar | fase 2, als er meerdere scholen zijn |
| 4 | Illustraties en lege-scherm-tekeningen | Ze verouderen, ze kosten onderhoud, en tekst doet het werk beter | niet voorzien |
| 5 | Animaties bij het laden van AI-tekst | Streaming is al de animatie; extra beweging leidt af van meelezen | niet voorzien |
| 6 | Portretstand voor de exportpagina | Verdubbelt het aantal layouts; liggend past bij foto's en bij ophangen | fase 2, als gebruikers erom vragen |
| 7 | Een componentbibliotheek als los pakket | Er is één toepassing; een pakket kost versiebeheer zonder afnemer | fase 2 |
| 8 | Toegankelijkheidsniveau AAA | AA is de vloer en haalbaar; AAA vraagt om contrast dat de rustige uitstraling breekt | niet voorzien |

---
