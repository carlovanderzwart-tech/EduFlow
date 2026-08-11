/**
 * Verzonnen testgegevens. Bron: Product Bible bijlage A (`docs/A-testgegevens.md`).
 *
 * DR-33 / §15.6: hier komt nooit de naam van een echt kind in, ook niet in een
 * voorbeeld, een schermafbeelding of een commit-boodschap. Elke toets, demo en
 * schermafdruk gebruikt deze twintig.
 *
 * De namen zijn niet willekeurig: elke naam dekt een geval dat PrivacyService moet
 * aankunnen (§12.5). Zie PRIVACY_GEVALLEN onderaan — dat is de toetsset van D03.
 */

export const SCHOOLJAAR = "2026-2027" as const;

/* ------------------------------------------------------------------ */
/* A.1 — De groep                                                     */
/* ------------------------------------------------------------------ */

export interface TestLeerling {
  readonly id: string;
  readonly voornaam: string;
  /** Waarom deze naam in de lijst staat. Leeg = gewone naam, vergelijkingsmateriaal. */
  readonly dekt: string;
}

/** Groep 4 — De Regenboog, stamgroep, twintig leerlingen. */
export const GROEP_4: readonly TestLeerling[] = [
  { id: "l-01", voornaam: "Aya",      dekt: "" },
  { id: "l-02", voornaam: "Bram",     dekt: "gewone naam, vergelijkingsmateriaal" },
  { id: "l-03", voornaam: "Cato",     dekt: "korte naam die als lettergreep voorkomt" },
  { id: "l-04", voornaam: "Dani",     dekt: "" },
  { id: "l-05", voornaam: "Elin",     dekt: "" },
  { id: "l-06", voornaam: "Fenna",    dekt: "" },
  { id: "l-07", voornaam: "Guus",     dekt: "gewone naam, vergelijkingsmateriaal" },
  { id: "l-08", voornaam: "Hanae",    dekt: "diakriet: wordt soms Hanaë geschreven" },
  { id: "l-09", voornaam: "Imre",     dekt: "korte naam die als lettergreep voorkomt" },
  { id: "l-10", voornaam: "Jasper",   dekt: "" },
  { id: "l-11", voornaam: "Kjeld",    dekt: "verbuigingen: Kjelds, Kjeldje, KJELD" },
  { id: "l-12", voornaam: "Lieve",    dekt: "" },
  { id: "l-13", voornaam: "Mees",     dekt: "gewone naam, vergelijkingsmateriaal" },
  { id: "l-14", voornaam: "Noa B.",   dekt: "dubbele voornaam, eigen code (B-76)" },
  { id: "l-15", voornaam: "Noa V.",   dekt: "dubbele voornaam, eigen code (B-76)" },
  { id: "l-16", voornaam: "Otis",     dekt: "korte naam die als lettergreep voorkomt" },
  { id: "l-17", voornaam: "Pippa",    dekt: "" },
  { id: "l-18", voornaam: "Quinten",  dekt: "" },
  { id: "l-19", voornaam: "Roos",     dekt: "is ook een gewoon Nederlands woord" },
  { id: "l-20", voornaam: "Sam",      dekt: "zit in 'samenwerken' en 'samen'" },
] as const;

/* ------------------------------------------------------------------ */
/* A.2 — De reeksen                                                   */
/* ------------------------------------------------------------------ */

export const REEKSEN = [
  {
    id: "r-01",
    naam: "Kunstwerk Dok",
    delen: 4,
    kleur: 1,
    toetst: "vervolgzin op basis van eerdere delen (B-04); meer dan drie delen, dus de afkapregel uit B-68",
  },
  {
    id: "r-02",
    naam: "ONDERZOEK Natuur",
    delen: 3,
    kleur: 2,
    toetst: "reeksweergave, volgorde, een reeks verwijderen",
  },
  {
    id: "r-03",
    naam: "Start van het jaar",
    delen: 2,
    kleur: 3,
    toetst: "het kleinste geval waarin de vervolgzin bestaat",
  },
] as const;

/* ------------------------------------------------------------------ */
/* A.3 — Groepen naast de stamgroep                                   */
/*                                                                    */
/* Lidmaatschap is een eigen entiteit met een looptijd (U-07, B-16,   */
/* B-63, FR-INS-06 t/m FR-INS-08). Noa V. begint pas op 3 november en */
/* zit dan meteen in twee groepen — dat is flow F-22.                 */
/* ------------------------------------------------------------------ */

export const GROEPEN = [
  {
    id: "g-01",
    naam: "Groep 4 — De Regenboog",
    type: "stamgroep",
    leden: GROEP_4.map((l) => l.id),
    van: "2026-08-24",
    tot: "2027-07-17",
  },
  {
    id: "g-02",
    naam: "Techniekclub",
    type: "projectgroep",
    leden: ["l-11", "l-13", "l-15", "l-18", "l-01"], // Kjeld, Mees, Noa V., Quinten, Aya
    van: "2026-11-03",
    tot: "2027-02-12",
  },
  {
    id: "g-03",
    naam: "Leesgroepje dinsdag",
    type: "zorggroep",
    leden: ["l-04", "l-16", "l-17"], // Dani, Otis, Pippa
    van: "2026-09-08",
    tot: null, // open
  },
] as const;

/* ------------------------------------------------------------------ */
/* De toetsset voor PrivacyService (§12.5, werkopdracht D03)          */
/*                                                                    */
/* INV-30 eist: restore(pseudonymise(t)) === t, voor elk geval hier.  */
/* De codes hieronder gaan uit van toekenning op volgorde van de      */
/* leerlingenlijst; gebruikt de implementatie een andere toekenning,  */
/* dan is de vaste string niet de toets — de heen-en-terug-gelijkheid */
/* is dat wel, en die geldt altijd.                                   */
/* ------------------------------------------------------------------ */

export interface PrivacyGeval {
  readonly naam: string;
  readonly invoer: string;
  /** Moet de naam vervangen worden? false = de tekst blijft ongemoeid. */
  readonly vervangt: boolean;
  readonly waarom: string;
}

export const PRIVACY_GEVALLEN: readonly PrivacyGeval[] = [
  {
    naam: "gewone naam",
    invoer: "Bram bouwde een toren van negen blokken.",
    vervangt: true,
    waarom: "het eenvoudigste geval; als dit faalt, faalt alles",
  },
  {
    naam: "naam is ook een woord — als naam",
    invoer: "Roos legde er drie steentjes naast.",
    vervangt: true,
    waarom: "hoofdletter aan het begin van een zin plus werkwoord: dit is de leerling",
  },
  {
    naam: "naam is ook een woord — als woord",
    invoer: "De rozen in de schooltuin bloeien.",
    vervangt: false,
    waarom: "'rozen' is geen naam; vervangen zou de tekst onleesbaar maken",
  },
  {
    naam: "naam als deelwoord",
    invoer: "De kinderen waren aan het samenwerken.",
    vervangt: false,
    waarom: "'Sam' zit in 'samenwerken'; woordgrenzen moeten kloppen",
  },
  {
    naam: "naam als deelwoord, tweede vorm",
    invoer: "Ze deden het samen.",
    vervangt: false,
    waarom: "idem, zonder achtervoegsel",
  },
  {
    naam: "bezitsvorm",
    invoer: "Kjelds idee werkte niet meteen.",
    vervangt: true,
    waarom: "Nederlandse bezitsvorm zonder apostrof",
  },
  {
    naam: "verkleinwoord",
    invoer: "Kjeldje mocht als eerste.",
    vervangt: true,
    waarom: "verkleinvorm van een voornaam",
  },
  {
    naam: "hoofdletters",
    invoer: "KJELD stond op de tekening.",
    vervangt: true,
    waarom: "hoofdletterongevoelig matchen, maar de vorm herstellen bij terugvertalen",
  },
  {
    naam: "diakriet",
    invoer: "Hanaë wees precies één ding aan.",
    vervangt: true,
    waarom: "'Hanae' in de lijst moet 'Hanaë' in de tekst vinden",
  },
  {
    naam: "dubbele voornaam",
    invoer: "Noa B. en Noa V. werkten aan hetzelfde bouwwerk.",
    vervangt: true,
    waarom: "twee leerlingen, twee verschillende codes; terugvertalen op de code (B-76)",
  },
  {
    naam: "dubbele voornaam zonder letter",
    invoer: "Noa begon opnieuw.",
    vervangt: true,
    waarom: "de app kan niet zien welke Noa bedoeld is — het gedrag hierbij is B-76",
  },
  {
    naam: "korte naam in een woord",
    invoer: "Het was een categorie die ze zelf bedacht.",
    vervangt: false,
    waarom: "'Cato' zit in 'categorie'",
  },
  {
    naam: "korte naam in een woord, tweede",
    invoer: "De motor van de kar deed het niet.",
    vervangt: false,
    waarom: "'Otis' niet, maar dit is het type geval; ook 'Imre' in 'imressie'-achtige typefouten",
  },
  {
    naam: "meerdere namen in één zin",
    invoer: "Guus, Mees en Bram kozen alle drie een andere kant.",
    vervangt: true,
    waarom: "drie vervangingen, en de volgorde van de codes moet stabiel zijn",
  },
  {
    naam: "naam aan het einde van een zin",
    invoer: "Het laatste blok legde Pippa.",
    vervangt: true,
    waarom: "geen hoofdletter aan het zinsbegin, wel een naam",
  },
];

/**
 * Twee namen die NIET in de lijst staan. §6.1 en B-11: de namenlijst is een vangnet,
 * geen garantie — het controlescherm is het enige dat deze twee opvangt.
 * Toets hiermee dat de app niet doet alsof hij ze kent.
 */
export const NIET_IN_DE_LIJST = ["Tobias", "Yara"] as const;
