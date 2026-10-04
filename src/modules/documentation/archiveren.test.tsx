import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Werkbalk } from "./Werkbalk";

/**
 * Archiveren op het scherm (`FR-DOC-120`, B-144).
 *
 * Hier staat de knop die het doet. De andere drie zinnen uit de eis staan elders:
 * verbergen bij bladeren en vinden bij zoeken in `services/archiveren.test.ts`, het
 * dashboardblok in `modules/dashboard/verder-werken-aan.test.ts`. Dat laatste apart,
 * omdat een module nooit uit een andere module importeert (§10.2) en dat ook voor
 * een toets geldt.
 *
 * De toets die het meest waard is, is dat de knop ná het archiveren "Uit archief
 * halen" heet. Zou hij "Archiveren" blijven staan, dan is er geen enkele manier om
 * te zien wat je zojuist hebt gedaan, en dan drukt iemand nog een keer.
 */

const archiveer = vi.fn();
const haalUitArchief = vi.fn();
const verwijder = vi.fn();
const duw = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: duw }),
}));

vi.mock("@/services/diensten", () => ({
  diensten: async () => ({ documentation: { archiveer, haalUitArchief, verwijder } }),
}));

beforeEach(() => {
  archiveer.mockReset().mockResolvedValue({ ok: true, value: {} });
  haalUitArchief.mockReset().mockResolvedValue({ ok: true, value: {} });
  verwijder.mockReset();
  duw.mockReset();
});

function balk(gearchiveerd: boolean, onGearchiveerd = vi.fn()) {
  render(
    <Werkbalk
      sleutel="doc-1"
      state="idle"
      gearchiveerd={gearchiveerd}
      onGearchiveerd={onGearchiveerd}
      onFout={vi.fn()}
    />,
  );
  return onGearchiveerd;
}

describe("de knop Archiveren — `FR-DOC-120`", () => {
  it("archiveert en meldt het terug (`FR-DOC-120`)", async () => {
    const gemeld = balk(false);

    fireEvent.click(screen.getByRole("button", { name: "Archiveren" }));

    await waitFor(() => expect(archiveer).toHaveBeenCalledWith("doc-1"));
    expect(gemeld).toHaveBeenCalledWith(true);
    expect(haalUitArchief).not.toHaveBeenCalled();
  });

  it("heet daarna Uit archief halen (`FR-DOC-120`)", async () => {
    const gemeld = balk(true);

    fireEvent.click(screen.getByRole("button", { name: "Uit archief halen" }));

    await waitFor(() => expect(haalUitArchief).toHaveBeenCalledWith("doc-1"));
    expect(gemeld).toHaveBeenCalledWith(false);
  });

  it("vraagt geen bevestiging (`FR-DOC-120`)", async () => {
    balk(false);

    fireEvent.click(screen.getByRole("button", { name: "Archiveren" }));

    // Archiveren gooit niets weg en draait in één klik terug; een dialoog zou hier
    // alleen in de weg staan. Verwijderen vraagt die bevestiging wél (`FR-DOC-121`).
    await waitFor(() => expect(archiveer).toHaveBeenCalled());
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("staat uit zolang er niets bewaard is (FR-DOC-01)", () => {
    render(
      <Werkbalk
        sleutel={null}
        state="idle"
        gearchiveerd={false}
        onGearchiveerd={vi.fn()}
        onFout={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Archiveren" })).toBeDisabled();
  });

  it("meldt een fout en draait de knop niet om (`FR-DOC-120`)", async () => {
    archiveer.mockResolvedValue({ ok: false, error: { message: "Dat ging mis." } });
    const gemeld = vi.fn();
    const foutmelder = vi.fn();
    render(
      <Werkbalk
        sleutel="doc-1"
        state="idle"
        gearchiveerd={false}
        onGearchiveerd={gemeld}
        onFout={foutmelder}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Archiveren" }));

    await waitFor(() => expect(foutmelder).toHaveBeenCalledWith("Dat ging mis."));
    expect(gemeld).not.toHaveBeenCalled();
  });
});
