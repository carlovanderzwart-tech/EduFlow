import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CalendarEvent } from "@/domain/types";
import { jaardagen, jaartellingen } from "@/services/agenda/schooljaar";

import { YearView } from "./YearView";

/**
 * De jaarweergave (`FR-AGE-32`, `FR-AGE-33`, B-129).
 *
 * Twee dingen die na de eerste eigen test ontbraken: je zag niet wélke dag een
 * cel was, en je zag niet of er iets stond. Beide toetsen kijken naar wat er in de
 * cel te zien én te lezen valt, want kleur en stip zijn nooit de enige drager
 * (NFR-38).
 */

const OPZET = {
  firstSchoolDay: "2026-08-24",
  lastSchoolDay: "2027-07-16",
  vakanties: [
    {
      schoolYearName: "2026-2027",
      region: "midden" as const,
      holidayKey: "herfst",
      name: "Herfstvakantie",
      from: "2026-10-17",
      to: "2026-10-25",
      fixed: false,
      aangepast: false,
      landelijk: null,
    },
  ],
};

function teken(items: CalendarEvent[] = []) {
  const dagen = jaardagen({ ...OPZET, items });
  return render(
    <YearView
      firstSchoolDay={OPZET.firstSchoolDay}
      dagen={dagen}
      vakanties={OPZET.vakanties}
      tellingen={jaartellingen(dagen)}
      onKiesDag={vi.fn()}
      onKiesVakantie={vi.fn()}
    />,
  );
}

/** Eén afspraak op 15 september, met tijden. */
const OUDERGESPREK = {
  kind: "afspraak",
  allDay: false,
  start: "2026-09-15T12:30:00.000Z",
  end: "2026-09-15T13:00:00.000Z",
  title: "Oudergesprek",
} as unknown as CalendarEvent;

describe("het dagnummer staat in de cel — FR-AGE-32, B-129", () => {
  it("zet 24 in de cel van de eerste schooldag (FR-AGE-32)", () => {
    teken();

    const cel = screen.getByRole("button", { name: "24 augustus — schooldag" });
    expect(cel).toHaveTextContent("24");
  });

  it("nummert ook een dag buiten het schooljaar, zodat de kolom te lezen blijft", () => {
    teken();

    // 1 augustus valt vóór de eerste schooldag: wel zichtbaar, niet aanklikbaar.
    const cel = screen.getByRole("button", { name: "1 augustus" });
    expect(cel).toHaveTextContent("1");
    expect(cel).toBeDisabled();
  });

  it("houdt het nummer buiten de voorleesnaam, zodat hij niet dubbel klinkt", () => {
    teken();

    // Zou de `<span>` niet verborgen zijn, dan stond het nummer twee keer in de
    // toegankelijke naam: één keer als tekst en één keer uit het `aria-label`.
    expect(screen.getByRole("button", { name: "24 augustus — schooldag" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "24 24 augustus — schooldag" })).toBeNull();
  });
});

describe("een stip zegt dat er iets staat — FR-AGE-33, B-129", () => {
  it("noemt de afspraak in de naam van de cel (FR-AGE-33, NFR-38)", () => {
    teken([OUDERGESPREK]);

    expect(
      screen.getByRole("button", { name: "15 september — schooldag — 1 afspraak" }),
    ).toBeInTheDocument();
  });

  it("laat een dag zonder afspraken ongemoeid (FR-AGE-33)", () => {
    teken([OUDERGESPREK]);

    expect(
      screen.getByRole("button", { name: "16 september — schooldag" }),
    ).toBeInTheDocument();
  });

  it("telt twee afspraken in het meervoud (FR-AGE-33)", () => {
    teken([OUDERGESPREK, { ...OUDERGESPREK, title: "Overleg" }]);

    expect(
      screen.getByRole("button", { name: "15 september — schooldag — 2 afspraken" }),
    ).toBeInTheDocument();
  });

  it("legt de stip uit in de legenda (FR-AGE-33)", () => {
    teken([OUDERGESPREK]);

    expect(screen.getByText("Er staat iets in de agenda")).toBeInTheDocument();
  });
});
