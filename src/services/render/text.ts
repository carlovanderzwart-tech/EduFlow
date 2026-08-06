/**
 * Tekst meten, opmaken en afbreken voor de renderlaag.
 *
 * Staat los van `RenderService` omdat het een eigen probleem is: canvas kent
 * geen automatische regelval, dus afbreken is handwerk. Het meten zit achter
 * een interface, zodat de opmaak zonder browser te testen is — jsdom heeft geen
 * tekstmetriek.
 */

export interface TextStyle {
  fontSize: number;
  lineHeight: number;
  weight: "normal" | "bold";
  italic: boolean;
  color: string;
}

/** Afmetingen in exportpixels, dus op 300 dpi. 52 px is ongeveer 12,5 punt. */
export const STYLES: Record<"title" | "meta" | "body" | "quote", TextStyle> = {
  title: { fontSize: 96, lineHeight: 124, weight: "bold", italic: false, color: "#111827" },
  meta: { fontSize: 46, lineHeight: 62, weight: "normal", italic: false, color: "#6b7280" },
  body: { fontSize: 52, lineHeight: 78, weight: "normal", italic: false, color: "#111827" },
  quote: { fontSize: 56, lineHeight: 86, weight: "normal", italic: true, color: "#374151" },
};

export interface TextMeasurer {
  width(text: string, style: TextStyle): number;
}

/** Het lettertype van de app, zodat de export er niet anders uitziet. */
function fontFamily(): string {
  if (typeof document === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-sans")
    .trim();
  return value || "sans-serif";
}

export function fontOf(style: TextStyle): string {
  const italic = style.italic ? "italic " : "";
  const weight = style.weight === "bold" ? "bold " : "";
  return `${italic}${weight}${style.fontSize}px ${fontFamily()}`;
}

/**
 * Hakt woorden die op zichzelf al breder zijn dan het vak. Zonder deze stap
 * loopt het afbreken vast op bijvoorbeeld een geplakte URL.
 */
function fitWords(
  words: string[],
  maxWidth: number,
  style: TextStyle,
  measure: TextMeasurer,
): string[] {
  const out: string[] = [];

  for (const word of words) {
    if (measure.width(word, style) <= maxWidth) {
      out.push(word);
      continue;
    }

    let chunk = "";
    for (const character of word) {
      const next = chunk + character;
      // De `chunk &&` houdt hem aan de gang wanneer één teken al te breed is.
      if (chunk && measure.width(next, style) > maxWidth) {
        out.push(chunk);
        chunk = character;
      } else {
        chunk = next;
      }
    }
    if (chunk) out.push(chunk);
  }

  return out;
}

/** Breekt een alinea af op woordgrenzen binnen de gegeven breedte. */
export function wrap(
  text: string,
  maxWidth: number,
  style: TextStyle,
  measure: TextMeasurer,
): string[] {
  const words = fitWords(text.split(/\s+/).filter(Boolean), maxWidth, style, measure);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure.width(candidate, style) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

/** Meet met een canvas. Alleen in de browser; tests geven hun eigen meter mee. */
export function createMeasurer(): TextMeasurer {
  const context = document.createElement("canvas").getContext("2d");

  return {
    width(text, style) {
      if (!context) return text.length * style.fontSize * 0.5;
      context.font = fontOf(style);
      return context.measureText(text).width;
    },
  };
}
