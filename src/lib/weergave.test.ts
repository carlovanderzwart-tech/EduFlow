/**
 * Toetsen op de weergavelaag (§8.1.4).
 *
 * `opDag` staat er als eerste, omdat hij een fout afdekt die op het scherm niet te
 * zien is: een nieuw agenda-item kreeg de tijd van **vandaag** in plaats van van de
 * dag die je bekijkt. Je maakt dan vanuit de week van september een afspraak die
 * vandaag blijkt te staan, en dat merk je pas als je hem zoekt.
 */

import { describe, expect, it } from "vitest";

import { naarLokaleInvoer, opDag, plusMinuten, vandaag, vanLokaleInvoer } from "./weergave";

describe("opDag — dezelfde tijd, een andere dag", () => {
  it("verplaatst het tijdstip naar de gevraagde dag", () => {
    const halfNegen = new Date(2026, 7, 15, 8, 30).toISOString();

    expect(vandaag(new Date(opDag("2026-09-20", halfNegen)))).toBe("2026-09-20");
  });

  it("houdt uur en minuut vast", () => {
    const bron = new Date(2026, 7, 15, 8, 30).toISOString();
    const verplaatst = new Date(opDag("2026-09-20", bron));

    expect(verplaatst.getHours()).toBe(8);
    expect(verplaatst.getMinutes()).toBe(30);
  });

  it("houdt half negen half negen over de zomertijdgrens heen", () => {
    // 15 augustus is zomertijd, 20 november wintertijd.
    const zomer = new Date(2026, 7, 15, 8, 30).toISOString();
    const winter = new Date(opDag("2026-11-20", zomer));

    expect(winter.getHours()).toBe(8);
    expect(winter.getMinutes()).toBe(30);
  });

  it("geeft de invoer terug bij een dag die geen dag is", () => {
    const bron = new Date(2026, 7, 15, 8, 30).toISOString();

    expect(opDag("gisteren", bron)).toBe(bron);
  });
});

describe("heen en weer tussen veld en opslag", () => {
  it("leest terug wat het schreef", () => {
    const opslag = new Date(2026, 7, 15, 14, 0).toISOString();

    expect(vanLokaleInvoer(naarLokaleInvoer(opslag))).toBe(opslag);
  });

  it("telt minuten op zonder de dag te verliezen", () => {
    const begin = new Date(2026, 7, 15, 23, 45).toISOString();

    expect(vandaag(new Date(plusMinuten(begin, 30)))).toBe("2026-08-16");
  });
});
