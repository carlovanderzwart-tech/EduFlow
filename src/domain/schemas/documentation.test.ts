import { describe, expect, it } from "vitest";

import { newId } from "@/lib/uuid";

import { documentatie } from "../toetsgegevens";
import { zDocumentation } from "./documentation";

describe("zDocumentation — §8.3.5, §6.1.1", () => {
  it("laat een geldige documentatie door", () => {
    expect(zDocumentation.safeParse(documentatie()).success).toBe(true);
  });

  it("laat een documentatie zonder titel door", () => {
    // FR-DOC-03: een documentatie mag zonder titel bestaan.
    expect(zDocumentation.safeParse({ ...documentatie(), title: "" }).success).toBe(true);
  });

  it("weigert een titel boven honderdtwintig tekens", () => {
    expect(zDocumentation.safeParse({ ...documentatie(), title: "a".repeat(121) }).success).toBe(
      false,
    );
  });

  it("weigert een datum die geen bestaande kalenderdag is", () => {
    expect(zDocumentation.safeParse({ ...documentatie(), date: "2026-02-30" }).success).toBe(false);
  });

  it("weigert een datum met een tijd erin", () => {
    // §8.1.4: een kalenderdag wordt nooit als tijdstip opgeslagen, want dan
    // verschuift 1 januari op de helft van de apparaten naar 31 december.
    const metTijd = { ...documentatie(), date: "2026-10-13T00:00:00.000Z" };

    expect(zDocumentation.safeParse(metTijd).success).toBe(false);
  });

  it("weigert een status die niet bestaat", () => {
    // Twee statussen, meer niet (B-13). "gearchiveerd" is een merker, geen status.
    expect(zDocumentation.safeParse({ ...documentatie(), status: "gearchiveerd" }).success).toBe(
      false,
    );
  });

  it("weigert een notitie voor jezelf boven tweeduizend tekens", () => {
    expect(
      zDocumentation.safeParse({ ...documentatie(), privateNote: "a".repeat(2001) }).success,
    ).toBe(false);
  });
});

describe("INV-08 — zodra een documentatie bestaat, heeft hij minstens één pagina", () => {
  it("weigert een documentatie zonder pagina's", () => {
    expect(zDocumentation.safeParse({ ...documentatie(), pageIds: [] }).success).toBe(false);
  });

  it("weigert meer dan twintig pagina's", () => {
    const teveel = Array.from({ length: 21 }, newId);

    expect(zDocumentation.safeParse({ ...documentatie(), pageIds: teveel }).success).toBe(false);
  });

  it("weigert dezelfde pagina twee keer", () => {
    const sleutel = newId();

    expect(
      zDocumentation.safeParse({ ...documentatie(), pageIds: [sleutel, sleutel] }).success,
    ).toBe(false);
  });
});

describe("INV-19 — hoogstens één reeks", () => {
  it("laat geen reeks toe als lijst", () => {
    // Het veld is één optionele sleutel; meer dan één reeks is niet uit te
    // drukken. Een lijst zou het schema moeten weigeren, niet stilzwijgend
    // omzetten.
    expect(zDocumentation.safeParse({ ...documentatie(), seriesId: [newId()] }).success).toBe(
      false,
    );
  });

  it("laat een lege reeksverwijzing toe", () => {
    expect(zDocumentation.safeParse({ ...documentatie(), seriesId: null }).success).toBe(true);
  });
});

describe("koppelingen — §6.1.1", () => {
  it("weigert dezelfde leerling twee keer", () => {
    const sleutel = newId();

    expect(
      zDocumentation.safeParse({ ...documentatie(), studentIds: [sleutel, sleutel] }).success,
    ).toBe(false);
  });

  it("weigert meer dan zestig leerlingen", () => {
    const teveel = Array.from({ length: 61 }, newId);

    expect(zDocumentation.safeParse({ ...documentatie(), studentIds: teveel }).success).toBe(false);
  });

  it("weigert meer dan tien groepen", () => {
    const teveel = Array.from({ length: 11 }, newId);

    expect(zDocumentation.safeParse({ ...documentatie(), groupIds: teveel }).success).toBe(false);
  });

  it("laat een documentatie zonder leerlingen en zonder groepen toe", () => {
    const los = { ...documentatie(), studentIds: [], groupIds: [] };

    expect(zDocumentation.safeParse(los).success).toBe(true);
  });
});

describe("status als opgeslagen veld — T-41, INV-15", () => {
  it("bewaart de status en niet alleen het exportmoment", () => {
    // §9.8 noemt de status nog "geen veld, een functie". T-41 en §8.3.5 zeggen
    // het tegenovergestelde en zijn de geldende bepaling.
    const gedeeld = {
      ...documentatie(),
      status: "gedeeld",
      firstExportedAt: "2026-11-14T10:00:00.000Z",
    };

    const uitkomst = zDocumentation.safeParse(gedeeld);
    if (!uitkomst.success) throw new Error("hoort te slagen");
    expect(uitkomst.data.status).toBe("gedeeld");
  });

  it("keurt een afwijking tussen status en exportmoment niet af", () => {
    // INV-15 legt de correctie bij DocumentationService, die hem bij het lezen
    // rechtzet en logt. Een schema dat zo'n record weigert, maakt werk
    // onbereikbaar dat de service juist kan repareren.
    const scheef = { ...documentatie(), status: "gedeeld", firstExportedAt: null };

    expect(zDocumentation.safeParse(scheef).success).toBe(true);
  });
});
