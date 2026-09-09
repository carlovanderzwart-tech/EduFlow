import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Series } from "@/domain/types";

import { Koppelingen } from "./Koppelingen";
import { NieuweReeks } from "./NieuweReeks";

/**
 * Een reeks maken waar je hem gebruikt (`FR-DOC-125`, `FR-DOC-126`, B-127).
 *
 * Twee plekken, één component. Deze toetsen dekken de plek in het schrijfscherm
 * (`FR-DOC-125`) en het blok zelf, dat het overzicht met dezelfde eigenschappen
 * gebruikt (`FR-DOC-126`).
 *
 * Er wordt met `fireEvent` geklikt en niet met `user-event`: die staat niet in de
 * goedgekeurde lijst van §16, en voor een keuzelijst en twee knoppen voegt hij niets
 * toe wat het gedrag scherper maakt.
 *
 * `diensten()` is hier nagemaakt: het gaat om wat het scherm doet met het antwoord,
 * niet om of Dexie een rij wegschrijft. Dat laatste toetst `instellingen.test.ts` al
 * op `SeriesService` zelf (U-03).
 */

const maak = vi.fn();

vi.mock("@/services/diensten", () => ({
  diensten: async () => ({ series: { maak } }),
}));

function reeks(naam: string, id = `id-${naam}`): Series {
  return {
    id: id as Series["id"],
    name: naam,
    colour: "series-1",
    description: "",
  } as Series;
}

const BESTAAND = [reeks("Kunstwerk Dok"), reeks("Bouwhoek")];

beforeEach(() => {
  maak.mockReset();
});

function velden(seriesId = "") {
  return { seriesId, studentIds: [], groupIds: [] };
}

describe("de reekskeuze in het schrijfscherm — FR-DOC-125, §6.1, B-127", () => {
  it("zet «Nieuwe reeks maken…» onderaan de lijst (FR-DOC-125)", () => {
    render(
      <Koppelingen
        formulier={velden()}
        leerlingen={[]}
        groepen={[]}
        reeksen={BESTAAND}
        onWijzig={vi.fn()}
      />,
    );

    const opties = screen
      .getAllByRole("option")
      .map((optie) => optie.textContent);

    expect(opties[0]).toBe("Geen reeks");
    expect(opties[opties.length - 1]).toBe("Nieuwe reeks maken…");
  });

  it("opent het invulblok en meldt de keuze niet als reeks (FR-DOC-125)", async () => {
    const onWijzig = vi.fn();
    render(
      <Koppelingen
        formulier={velden()}
        leerlingen={[]}
        groepen={[]}
        reeksen={BESTAAND}
        onWijzig={onWijzig}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reeks"), { target: { value: "+nieuw" } });

    expect(screen.getByLabelText("Naam van de nieuwe reeks")).toBeInTheDocument();
    // De regel is geen reeks; hij mag nooit als `seriesId` worden opgeslagen.
    expect(onWijzig).not.toHaveBeenCalled();
  });

  it("kiest de nieuwe reeks meteen, zodat de documentatie er ook aan hangt (FR-DOC-125)", async () => {
    const gemaakt = reeks("Zoutdeeg", "id-nieuw");
    maak.mockResolvedValue({ ok: true, value: gemaakt });

    const onWijzig = vi.fn();
    render(
      <Koppelingen
        formulier={velden()}
        leerlingen={[]}
        groepen={[]}
        reeksen={BESTAAND}
        onWijzig={onWijzig}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reeks"), { target: { value: "+nieuw" } });
    fireEvent.change(screen.getByLabelText("Naam van de nieuwe reeks"), {
      target: { value: "Zoutdeeg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reeks toevoegen" }));

    await waitFor(() => expect(onWijzig).toHaveBeenCalledWith({ seriesId: "id-nieuw" }));
    // En hij staat in de lijst, zonder dat het scherm opnieuw geladen is.
    expect(screen.getAllByRole("option").map((optie) => optie.textContent)).toContain("Zoutdeeg");
  });

  it("laat het scherm staan als de naam wordt geweigerd (FR-DOC-125)", async () => {
    maak.mockResolvedValue({
      ok: false,
      error: { code: "ongeldig", message: "Een reeks heeft een naam nodig. Vul er een in." },
    });

    render(
      <Koppelingen
        formulier={velden()}
        leerlingen={[]}
        groepen={[]}
        reeksen={BESTAAND}
        onWijzig={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reeks"), { target: { value: "+nieuw" } });
    fireEvent.change(screen.getByLabelText("Naam van de nieuwe reeks"), {
      target: { value: " " },
    });
    // Een naam van één spatie is voor de knop leeg; typ iets wat de service afkeurt.
    fireEvent.change(screen.getByLabelText("Naam van de nieuwe reeks"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reeks toevoegen" }));

    expect(await screen.findByText(/Een reeks heeft een naam nodig/)).toBeInTheDocument();
    expect(screen.getByLabelText("Naam van de nieuwe reeks")).toBeInTheDocument();
  });
});

describe("hetzelfde blok in het overzicht — FR-DOC-126, B-127", () => {
  it("geeft de gemaakte reeks door aan wie hem opende (FR-DOC-126)", async () => {
    const gemaakt = reeks("Zoutdeeg", "id-nieuw");
    maak.mockResolvedValue({ ok: true, value: gemaakt });

    const onGemaakt = vi.fn();
    render(<NieuweReeks aantalBestaand={2} onGemaakt={onGemaakt} onAnnuleer={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Naam van de nieuwe reeks"), {
      target: { value: "Zoutdeeg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reeks toevoegen" }));

    await waitFor(() => expect(onGemaakt).toHaveBeenCalledWith(gemaakt));
  });

  it("kiest de eerstvolgende kleur uit de acht van §5.5 (FR-DOC-126)", async () => {
    maak.mockResolvedValue({ ok: true, value: reeks("Zoutdeeg", "id-nieuw") });

    render(<NieuweReeks aantalBestaand={2} onGemaakt={vi.fn()} onAnnuleer={vi.fn()} />);

    // Twee bestaande reeksen: de derde kleur staat alvast aan (§4.4, geen lege keuze).
    expect(screen.getByRole("button", { name: "Kleur 3" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByLabelText("Naam van de nieuwe reeks"), {
      target: { value: "Zoutdeeg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reeks toevoegen" }));

    await waitFor(() =>
      expect(maak).toHaveBeenCalledWith(expect.objectContaining({ colour: "series-3" })),
    );
  });

  it("maakt niets zolang er geen naam staat (FR-INS-11)", () => {
    render(<NieuweReeks aantalBestaand={0} onGemaakt={vi.fn()} onAnnuleer={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Reeks toevoegen" })).toBeDisabled();
    expect(maak).not.toHaveBeenCalled();
  });
});
