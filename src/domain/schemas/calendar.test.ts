import { describe, expect, it } from "vitest";

import { agendaItem, heleDagItem, zonderVeld } from "../toetsgegevens";
import { zCalendarEvent } from "./calendar";

describe("zCalendarEvent — §6.2.2, INV-31", () => {
  it("laat beide vormen door", () => {
    expect(zCalendarEvent.safeParse(agendaItem()).success).toBe(true);
    expect(zCalendarEvent.safeParse(heleDagItem()).success).toBe(true);
  });

  it("kent de acht soorten en geen negende", () => {
    for (const kind of [
      "afspraak",
      "oudergesprek",
      "studiedag",
      "margedag",
      "vakantie",
      "verjaardag",
      "herinnering",
      "documentatiemoment",
    ]) {
      expect(zCalendarEvent.safeParse({ ...agendaItem(), kind }).success).toBe(true);
    }
    expect(zCalendarEvent.safeParse({ ...agendaItem(), kind: "les" }).success).toBe(false);
  });

  it("weigert een herhaalregel (B-101)", () => {
    // `recurrence` is vervallen. Wat zich herhaalt is de basisweek, niet een item.
    const metHerhaling = { ...agendaItem(), recurrence: "wekelijks" };

    expect(zCalendarEvent.safeParse(metHerhaling).success).toBe(false);
  });

  it("weigert een titel zonder tekens en boven honderdtwintig", () => {
    expect(zCalendarEvent.safeParse({ ...agendaItem(), title: "" }).success).toBe(false);
    expect(zCalendarEvent.safeParse({ ...agendaItem(), title: "a".repeat(121) }).success).toBe(
      false,
    );
  });
});

describe("INV-31 — een hele-dag-item heeft geen tijden", () => {
  it("weigert tijdstippen op een hele-dag-item", () => {
    // Dit is de kern van INV-31: de twee vormen sluiten elkaar uit. Een studiedag
    // met een tijdstip is niet uit te drukken.
    const metTijd = { ...heleDagItem(), start: "2026-10-12T08:30:00.000Z" };

    expect(zCalendarEvent.safeParse(metTijd).success).toBe(false);
  });

  it("weigert een kalenderdag op een item met tijden", () => {
    expect(zCalendarEvent.safeParse({ ...agendaItem(), start: "2026-10-13" }).success).toBe(false);
  });

  it("laat een vakantie van negen dagen één item zijn", () => {
    // §8.1.4: een kalenderdag wordt nooit als tijdstip opgeslagen. Het einde is
    // de laatste dag, dus negen dagen zijn één item en geen negen.
    const herfst = {
      ...heleDagItem(),
      kind: "vakantie",
      title: "Herfstvakantie",
      start: "2026-10-17",
      end: "2026-10-25",
    };

    expect(zCalendarEvent.safeParse(herfst).success).toBe(true);
  });
});

describe("INV-30 — een item heeft een begin en een einde", () => {
  it("weigert een einde vóór het begin, in beide vormen", () => {
    const omgekeerdMetTijd = {
      ...agendaItem(),
      start: "2026-10-13T12:30:00.000Z",
      end: "2026-10-13T12:00:00.000Z",
    };
    const omgekeerdHeleDag = { ...heleDagItem(), start: "2026-10-25", end: "2026-10-17" };

    expect(zCalendarEvent.safeParse(omgekeerdMetTijd).success).toBe(false);
    expect(zCalendarEvent.safeParse(omgekeerdHeleDag).success).toBe(false);
  });

  it("weigert een item zonder einde, ook als het een hele dag beslaat", () => {
    // §6.2.2 zei "ja bij niet-hele-dag"; INV-30 eist het altijd, en INV-31 kiest
    // INV-30. Zonder einde is een meerdaagse vakantie niet uit te drukken.
    expect(zCalendarEvent.safeParse(zonderVeld(heleDagItem(), "end")).success).toBe(false);
    expect(zCalendarEvent.safeParse(zonderVeld(agendaItem(), "end")).success).toBe(false);
  });

  it("laat begin en einde op hetzelfde moment toe", () => {
    const nul = { ...agendaItem(), end: agendaItem().start };

    expect(zCalendarEvent.safeParse({ ...nul, start: nul.end }).success).toBe(true);
  });
});
