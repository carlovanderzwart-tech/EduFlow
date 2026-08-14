/**
 * Het doek waarop de pagina wordt getekend (§5.12, DR-12).
 *
 * De renderlaag praat niet rechtstreeks tegen een `<canvas>` maar tegen deze twee
 * typen. Reden: een service die een canvas nodig heeft is niet te toetsen zonder
 * browser, en dan is `FR-DOC-113` — het voorbeeld ís het eindresultaat — precies de
 * eis die je niet meer kunt bewijzen. Een toets levert een doek dat de tekenopdrachten
 * opschrijft in plaats van uitvoert, en kan daarna nakijken wáár elke letter en elke
 * foto terechtkwam.
 *
 * Dit is dezelfde afspraak als de `Hertekenaar` van `PhotoService`: de browserkant
 * woont in `lib/`, de regel woont hier.
 */

/**
 * Het stukje canvas-API dat de renderlaag werkelijk gebruikt.
 *
 * Bewust smal. Alles wat hier niet in staat, kan de renderlaag niet aanroepen, en
 * dat houdt het namaakdoek in de toetsen klein genoeg om te vertrouwen.
 */
export interface Tekencontext {
  // De typen zijn die van `CanvasRenderingContext2D` en niet krapper. Krapper zou
  // beter lezen, maar dan is de echte context er niet meer aan toe te wijzen — en
  // dan gaat de echte kant met een `as` naar binnen, en dat is precies het gat
  // waar een verschil tussen voorbeeld en export doorheen glipt.
  fillStyle: string | CanvasGradient | CanvasPattern;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  letterSpacing?: string;
  save(): void;
  restore(): void;
  beginPath(): void;
  rect(x: number, y: number, breedte: number, hoogte: number): void;
  clip(): void;
  fillRect(x: number, y: number, breedte: number, hoogte: number): void;
  fillText(tekst: string, x: number, y: number): void;
  measureText(tekst: string): { width: number };
  drawImage(
    bron: CanvasImageSource,
    sx: number,
    sy: number,
    sBreedte: number,
    sHoogte: number,
    dx: number,
    dy: number,
    dBreedte: number,
    dHoogte: number,
  ): void;
}

export interface Doek {
  breedte: number;
  hoogte: number;
  context: Tekencontext;
  /** JPEG, want dat is wat §5.12 voorschrijft en wat overal te plakken is. */
  naarJpeg(kwaliteit: number): Promise<Blob>;
}

/**
 * De doekmaker draagt zijn soort doek mee.
 *
 * Daardoor krijgt een toets die het namaakdoek levert de tekenopdrachten terug
 * zonder een `as`, en kan hij nakijken wáár elke letter terechtkwam.
 */
export type Doekmaker<D extends Doek = Doek> = (breedtePx: number, hoogtePx: number) => D;

/** Een ingelezen foto: de bron die het doek kan tekenen, met zijn ware maten. */
export interface Beeld {
  bron: CanvasImageSource;
  breedte: number;
  hoogte: number;
}

/**
 * De tekenset van de printlaag (§5.9, §5.10.1).
 *
 * De printlaag is de enige uitzondering op DR-55: hij rekent in millimeters en heeft
 * een eigen tekenset. Die tekenset komt hier binnen als waarden in plaats van als
 * letterlijke kleuren in de service, zodat `tokens.css` één bron blijft en een toets
 * zijn eigen kleuren kan meegeven.
 */
export interface Printstijl {
  familie: string;
  /** Lopende tekst en titel. */
  inkt: string;
  /** Voettekst en legenda: neutraal-500 (§5.10.1). */
  gedempt: string;
  papier: string;
}
