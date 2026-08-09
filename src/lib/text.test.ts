import { describe, expect, it } from "vitest";

import { foldDiacritics, tokenize } from "./text";

/**
 * De namen komen uit bijlage A. Elke naam daar dekt een geval dat later in
 * `PrivacyService` moet kloppen (§12.5); hier worden de primitieven getoetst
 * waar die service straks op staat.
 */
describe("foldDiacritics — §12.5 stap 6", () => {
  it("laat Hanaë op Hanae uitkomen", () => {
    expect(foldDiacritics("Hanaë")).toBe("Hanae");
  });

  it("laat een naam zonder diakriet ongemoeid", () => {
    expect(foldDiacritics("Kjeld")).toBe("Kjeld");
  });

  it("raakt de hoofdletters niet aan", () => {
    // Vouwen is iets anders dan kleine letters maken; §12.5 herstelt de
    // hoofdletters bij het terugvertalen.
    expect(foldDiacritics("HANAË")).toBe("HANAE");
  });
});

describe("tokenize — §8.5", () => {
  it("behoudt diakrieten", () => {
    // §8.5 zegt uitdrukkelijk "diakrieten behouden". Dat is het tegenovergestelde
    // van wat §12.5 vraagt, en die twee mogen niet door elkaar lopen.
    expect(tokenize("Hanaë")).toEqual(["hanaë"]);
  });

  it("maakt kleine letters", () => {
    expect(tokenize("Kjeld")).toEqual(["kjeld"]);
  });

  it("splitst op niet-letters", () => {
    expect(tokenize("Kjeld, Aya en Noa B.")).toEqual(["kjeld", "aya", "en", "noa"]);
  });

  it("laat woorden van één teken weg", () => {
    // "B" uit "Noa B." valt af; woorden van twee tekens blijven.
    expect(tokenize("Noa B. is er")).toEqual(["noa", "is", "er"]);
  });

  it("houdt samenwerken één woord", () => {
    // Bijlage A: "Sam" komt als deel van "samenwerken" voor. Zou tokenize hier
    // "sam" van maken, dan zou de afscherming later op het verkeerde woord slaan.
    expect(tokenize("samen samenwerken")).toEqual(["samen", "samenwerken"]);
    expect(tokenize("samenwerken")).not.toContain("sam");
  });

  it("houdt rozen los van roos", () => {
    // Bijlage A: "Roos" is ook een gewoon Nederlands woord. "de rozen in de
    // schooltuin" mag niet als de naam Roos gelezen worden.
    const tokens = tokenize("de rozen in de schooltuin");

    expect(tokens).toContain("rozen");
    expect(tokens).not.toContain("roos");
  });

  it("geeft een lege lijst bij tekst zonder letters", () => {
    expect(tokenize("2026 — 12:04")).toEqual([]);
  });

  it("verwijdert geen stopwoorden", () => {
    // De stopwoordenlijst uit §8.5 hoort bij SearchService en niet bij lib/;
    // die service ontstaat bij een latere implementatiestap.
    expect(tokenize("de en het")).toEqual(["de", "en", "het"]);
  });
});
