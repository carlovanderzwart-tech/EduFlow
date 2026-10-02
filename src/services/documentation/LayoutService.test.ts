/**
 * Toetsen bij werkopdracht D08 — de layout van de gedrukte pagina.
 *
 * Elke toets draagt zijn `FR-`nummer in de naam (DR-40). Zonder browser en zonder
 * canvas: de meter is een functie die telt, want wat hier getoetst wordt is de
 * verdeling over de pagina en niet de breedte van een letter.
 *
 * De belangrijkste toets is die van `FR-DOC-112`: het aantal pagina's moet vóór de
 * export bekend zijn. Dat is B-07, en het is het verschil tussen een documentatie
 * die je verstuurt en een tweede blad dat je pas in de mail van een ouder ontdekt.
 */

import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { createLayoutService, PAGINA, PRINTLETTER, type Exportinhoud } from "./LayoutService";
import { MM_PER_PUNT, type Tekstmeter } from "./tekstzetten";

/** Elke letter een halve puntgrootte breed; genoeg om regels te laten breken. */
const meet: Tekstmeter = (tekst, punt) => tekst.length * punt * MM_PER_PUNT * 0.5;

const layout = createLayoutService({ meet });

function inhoud(deel: Partial<Exportinhoud> = {}): Exportinhoud {
  return {
    titel: "Kunstwerk Dok: de zoektocht",
    reeks: "Kunstwerk Dok",
    datum: "2026-05-12",
    tekst: "De kinderen gingen in de berm op zoek naar hun eigen kleur.",
    fotos: [],
    groep: "Groep 4 — De Regenboog",
    leerlingen: [],
    legenda: "",
    ...deel,
  };
}

function fotos(aantal: number) {
  return Array.from({ length: aantal }, () => ({ photoId: newId(), bijschrift: "" }));
}

describe("het canvas staat vast — §5.10, T-13", () => {
  it("is A4 liggend met 10 mm marge", () => {
    expect(PAGINA).toEqual({ breedte: 297, hoogte: 210, marge: 10 });
  });

  it("houdt elk slot binnen de werkbare binnenmaat van 277 × 190 mm", () => {
    for (const slot of layout.sloten("A-fotoraster")) {
      expect(slot.x).toBeGreaterThanOrEqual(PAGINA.marge);
      expect(slot.y).toBeGreaterThanOrEqual(PAGINA.marge);
      expect(slot.x + slot.breedte).toBeLessThanOrEqual(PAGINA.breedte - PAGINA.marge);
      expect(slot.y + slot.hoogte).toBeLessThanOrEqual(PAGINA.hoogte - PAGINA.marge);
    }
  });

  it("draagt de slottabel van §5.10.2: vijf fotosloten van 88 × 66 mm", () => {
    const fotosloten = layout.sloten("A-fotoraster").filter((slot) => slot.soort === "foto");

    expect(fotosloten).toHaveLength(5);
    for (const slot of fotosloten) {
      expect(slot.breedte).toBe(88);
      expect(slot.hoogte).toBe(66);
    }
  });

  it("kent nu ook de vier andere layouts (B-140, §5.10.3 t/m §5.10.6)", () => {
    // Deze toets stond tot B-140 op "werpt een fout". Dat is niet versoepeld maar
    // ingelost: de slottabellen stonden al in het handboek en zijn nu gebouwd.
    expect(layout.sloten("B-verhaal").map((slot) => slot.naam)).toEqual([
      "B0",
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
    ]);
    expect(layout.sloten("C-groot-beeld")).toHaveLength(5);
    expect(layout.sloten("D-alleen-beeld")).toHaveLength(6);
    expect(layout.sloten("E-vervolg")).toHaveLength(4);
  });

  it("geeft B twee tekstkolommen en D geen enkele (§5.10.3, §5.10.5)", () => {
    const tekstvakken = (id: Parameters<typeof layout.sloten>[0]) =>
      layout.sloten(id).filter((slot) => slot.soort === "tekst").length;

    expect(tekstvakken("B-verhaal")).toBe(2);
    expect(tekstvakken("C-groot-beeld")).toBe(1);
    expect(tekstvakken("D-alleen-beeld")).toBe(0);
  });

  it("houdt elke slottabel binnen het blad van 297 bij 210 (T-13)", () => {
    for (const id of ["A-fotoraster", "B-verhaal", "C-groot-beeld", "D-alleen-beeld", "E-vervolg"] as const) {
      for (const slot of layout.sloten(id)) {
        expect(slot.x).toBeGreaterThanOrEqual(PAGINA.marge);
        expect(slot.y).toBeGreaterThanOrEqual(PAGINA.marge);
        expect(slot.x + slot.breedte).toBeLessThanOrEqual(PAGINA.breedte - PAGINA.marge);
        expect(slot.y + slot.hoogte).toBeLessThanOrEqual(PAGINA.hoogte);
      }
    }
  });
});

describe("het aantal pagina's staat vooraf vast — FR-DOC-112, B-07", () => {
  it("levert één pagina bij vijf foto's", () => {
    expect(layout.aantalPaginas(inhoud({ fotos: fotos(5) }))).toBe(1);
  });

  it("levert één pagina zonder foto's", () => {
    expect(layout.aantalPaginas(inhoud())).toBe(1);
  });

  it("levert twee pagina's bij zes foto's, want er zijn vijf sloten (§5.10.7 regel 2)", () => {
    expect(layout.aantalPaginas(inhoud({ fotos: fotos(6) }))).toBe(2);
  });

  it("levert vier pagina's bij twintig foto's, de bovengrens van FR-DOC-45", () => {
    expect(layout.aantalPaginas(inhoud({ fotos: fotos(20) }))).toBe(4);
  });

  it("nummert elke pagina met zijn plaats in het geheel", () => {
    const plan = layout.plan(inhoud({ fotos: fotos(6) }));
    const voeten = plan.paginas.map(
      (pagina) => pagina.vlakken.find((vlak) => vlak.soort === "voettekst")!,
    );

    expect(voeten.map((voet) => (voet.soort === "voettekst" ? voet.rechts : ""))).toEqual([
      "1 van 2",
      "2 van 2",
    ]);
  });
});

describe("de foto's vullen de sloten op volgorde — §5.10.7 regel 1", () => {
  it("zet de eerste foto in het eerste slot", () => {
    const beelden = fotos(3);
    const plan = layout.plan(inhoud({ fotos: beelden }));
    const getekend = plan.paginas[0]!.vlakken.filter((vlak) => vlak.soort === "foto");

    expect(getekend.map((vlak) => (vlak.soort === "foto" ? vlak.photoId : ""))).toEqual(
      beelden.map((foto) => foto.photoId),
    );
    expect(getekend[0]!.kader).toMatchObject({ x: 10, y: 40 });
  });

  it("schuift wat niet past door naar de volgende pagina", () => {
    const beelden = fotos(7);
    const plan = layout.plan(inhoud({ fotos: beelden }));

    const tweede = plan.paginas[1]!.vlakken.filter((vlak) => vlak.soort === "foto");
    expect(tweede).toHaveLength(2);
    expect(tweede[0]!.soort === "foto" && tweede[0]!.photoId).toBe(beelden[5]!.photoId);
  });
});

describe("de tekst blijft op pagina 1 — B-122", () => {
  it("zet de tekst in het tekstslot van de eerste pagina", () => {
    const plan = layout.plan(inhoud({ fotos: fotos(6) }));

    const eerste = plan.paginas[0]!.vlakken.find((vlak) => vlak.soort === "tekst");
    const tweede = plan.paginas[1]!.vlakken.find((vlak) => vlak.soort === "tekst");

    expect(eerste).toBeDefined();
    expect(tweede).toBeUndefined();
  });

  it("maakt geen leeg tekstvlak als er geen tekst is", () => {
    const plan = layout.plan(inhoud({ tekst: "" }));

    expect(plan.paginas[0]!.vlakken.some((vlak) => vlak.soort === "tekst")).toBe(false);
  });

  it("meldt wat er niet past in plaats van het weg te laten (§5.10.7 regel 4)", () => {
    const plan = layout.plan(inhoud({ tekst: "woord ".repeat(600) }));

    expect(plan.opmerkingen).toHaveLength(1);
    expect(plan.opmerkingen[0]).toMatch(/vervolgpagina/u);
  });

  it("zet de rest op een vervolgpagina in E-vervolg (§5.10.7 regel 4, B-142)", () => {
    const plan = layout.plan(inhoud({ tekst: "woord ".repeat(600) }));

    const laatste = plan.paginas[plan.paginas.length - 1]!;
    expect(laatste.layoutId).toBe("E-vervolg");
    expect(laatste.vlakken.some((vlak) => vlak.soort === "tekst")).toBe(true);

    // §5.10.6: de herhaalde titel draagt "(vervolg)".
    const kop = laatste.vlakken.find((vlak) => vlak.soort === "kop")!;
    expect(kop.titel.map((regel) => regel.tekst).join(" ")).toMatch(/vervolg/u);
  });

  it("zwijgt zolang alles erop past", () => {
    expect(layout.plan(inhoud()).opmerkingen).toEqual([]);
  });
});

describe("de kop — §5.10.1", () => {
  it("draagt reeksnaam, titel en datum", () => {
    const kop = layout.plan(inhoud()).paginas[0]!.vlakken.find((vlak) => vlak.soort === "kop")!;

    expect(kop.soort === "kop" && kop.reeks).toBe("Kunstwerk Dok");
    expect(kop.soort === "kop" && kop.datum).toBe("12 mei 2026");
    expect(kop.soort === "kop" && kop.titel[0]!.tekst).toContain("Kunstwerk Dok");
  });

  it("kapt een titel van meer dan twee regels af met een beletselteken", () => {
    const kop = layout
      .plan(inhoud({ titel: "Een titel die veel te lang is ".repeat(6) }))
      .paginas[0]!.vlakken.find((vlak) => vlak.soort === "kop")!;

    expect(kop.soort === "kop" && kop.titel).toHaveLength(2);
    expect(kop.soort === "kop" && kop.titel[1]!.tekst.endsWith("…")).toBe(true);
  });

  it("zet de titel op 24 punt met een regelhoogte van 28 punt", () => {
    expect(PRINTLETTER.titel).toEqual({ punt: 24, regelhoogte: 28, gewicht: 600 });
  });
});

describe("de voettekst — §5.10.1", () => {
  it("draagt de groepsnaam, de datum en de paginaaanduiding en verder niets", () => {
    const voet = layout.plan(inhoud()).paginas[0]!.vlakken.find((vlak) => vlak.soort === "voettekst")!;

    expect(voet.soort === "voettekst" && voet.links).toBe("Groep 4 — De Regenboog · 12 mei 2026");
    expect(voet.soort === "voettekst" && voet.rechts).toBe("1 van 1");
  });
});

describe("de legenda bij initialen — B-40", () => {
  it("staat onderaan de laatste pagina", () => {
    const plan = layout.plan(inhoud({ fotos: fotos(6), legenda: "K. = Kjeld · K2. = Kaya" }));

    expect(plan.paginas[0]!.vlakken.some((vlak) => vlak.soort === "legenda")).toBe(false);
    expect(plan.paginas[1]!.vlakken.some((vlak) => vlak.soort === "legenda")).toBe(true);
  });

  it("blijft weg als er geen botsing is", () => {
    const plan = layout.plan(inhoud({ legenda: "" }));

    expect(plan.paginas[0]!.vlakken.some((vlak) => vlak.soort === "legenda")).toBe(false);
  });
});

describe("waar de tekst komt — FR-DOC-128, B-141", () => {
  function tekstkader(opties: Parameters<typeof layout.plan>[1]) {
    const plan = layout.plan(inhoud({ fotos: fotos(2) }), opties);
    const vlak = plan.paginas[0]!.vlakken.find((v) => v.soort === "tekst")!;
    return vlak.kader;
  }

  it("zet de tekst standaard rechtsonder, zoals §5.10.2 (FR-DOC-128)", () => {
    expect(tekstkader({})).toMatchObject({ x: 199, y: 110 });
  });

  it("verhuist de tekst naar het gekozen vak (FR-DOC-128)", () => {
    expect(tekstkader({ tekstslot: "A1" })).toMatchObject({ x: 10, y: 40 });
  });

  it("maakt van het oude tekstvak een fotovak, zodat het raster vol blijft (B-141)", () => {
    const plan = layout.plan(inhoud({ fotos: fotos(6) }), { tekstslot: "A1" });
    const fotovakken = plan.paginas[0]!.vlakken.filter((vlak) => vlak.soort === "foto");

    // Zes foto's, vijf vakken: A6 is er nu een. Het zesde gaat naar pagina 2.
    expect(fotovakken).toHaveLength(5);
    expect(fotovakken.some((vlak) => vlak.kader.x === 199 && vlak.kader.y === 110)).toBe(true);
  });

  it("negeert een vak dat in deze layout niet bestaat (FR-DOC-128)", () => {
    // Een slotnaam uit een andere layout verandert niets; de stand blijft die van §5.10.
    expect(tekstkader({ tekstslot: "B3" })).toMatchObject({ x: 199, y: 110 });
  });

  it("noemt de plekken waar de tekst heen kan (FR-DOC-128)", () => {
    expect(layout.tekstplekken("A-fotoraster")).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"]);
    expect(layout.tekstplekken("D-alleen-beeld")).toEqual(["D1", "D2", "D3", "D4"]);
  });
});

describe("de andere layouts — B-140, §5.10.3 t/m §5.10.5", () => {
  it("laat de tekst in layout B van de linker naar de rechter kolom lopen (§5.10.3)", () => {
    const plan = layout.plan(inhoud({ tekst: "woord ".repeat(120) }), { layoutId: "B-verhaal" });
    const tekstvlakken = plan.paginas[0]!.vlakken.filter((vlak) => vlak.soort === "tekst");

    expect(tekstvlakken).toHaveLength(2);
    expect(tekstvlakken[0]!.kader.x).toBe(10);
    expect(tekstvlakken[1]!.kader.x).toBe(154);
  });

  it("geeft layout C één grote foto over de volle breedte (§5.10.4)", () => {
    const plan = layout.plan(inhoud({ fotos: fotos(1) }), { layoutId: "C-groot-beeld" });
    const foto = plan.paginas[0]!.vlakken.find((vlak) => vlak.soort === "foto")!;

    expect(foto.kader).toMatchObject({ x: 10, y: 40, breedte: 277, hoogte: 122 });
  });

  it("meldt bij layout D dat de tekst naar een vervolgpagina gaat (B-28)", () => {
    const plan = layout.plan(inhoud(), { layoutId: "D-alleen-beeld" });

    expect(plan.opmerkingen[0]).toMatch(/geen lopende tekst/u);
    expect(plan.paginas[plan.paginas.length - 1]!.layoutId).toBe("E-vervolg");
  });

  it("laat de tekst weg als je daarvoor kiest (B-28)", () => {
    const plan = layout.plan(inhoud(), { layoutId: "D-alleen-beeld", laatTekstWeg: true });

    expect(plan.opmerkingen).toEqual([]);
    expect(plan.paginas).toHaveLength(1);
    expect(plan.paginas[0]!.vlakken.some((vlak) => vlak.soort === "tekst")).toBe(false);
  });
});

describe("de leeftijd staat in de voettekst — FR-DOC-127, B-139", () => {
  function voettekst(leerlingen: string[]) {
    const plan = layout.plan(inhoud({ leerlingen }));
    const vlak = plan.paginas[0]!.vlakken.find((v) => v.soort === "voettekst")!;
    return vlak.links;
  }

  it("zet de kinderen met hun leeftijd tussen de groep en de datum (FR-DOC-127)", () => {
    expect(voettekst(["Kjeld 6,1", "Aya 5,11"])).toContain("Kjeld 6,1, Aya 5,11");
  });

  it("laat de regel ongemoeid als er geen leerlingen aan hangen", () => {
    expect(voettekst([])).not.toContain(",,");
  });

  it("kapt af bij meer dan zes, want twintig namen passen niet op één regel", () => {
    const twintig = Array.from({ length: 20 }, (_, n) => `Kind${n} 6,1`);

    expect(voettekst(twintig)).toContain("en nog 14");
  });
});
