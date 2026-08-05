import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Group } from "@/types/group";

import { StudentBatchBar } from "./StudentBatchBar";

const groups: Group[] = [
  {
    id: "g1",
    name: "groep blauw",
    schoolYear: "2025/2026",
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const noop = () => {};

function renderBar(props: Partial<React.ComponentProps<typeof StudentBatchBar>> = {}) {
  return render(
    <StudentBatchBar
      count={23}
      groups={groups}
      onMove={noop}
      onDeactivate={noop}
      onActivate={noop}
      onClear={noop}
      {...props}
    />,
  );
}

/** Doc 04, scherm 7: het aantal geselecteerde leerlingen en drie acties. */
describe("StudentBatchBar", () => {
  it("noemt het aantal geselecteerde leerlingen", () => {
    renderBar();

    expect(screen.getByText("23 leerlingen geselecteerd")).toBeInTheDocument();
  });

  it("telt enkelvoud als enkelvoud", () => {
    renderBar({ count: 1 });

    expect(screen.getByText("1 leerling geselecteerd")).toBeInTheDocument();
  });

  it("biedt de drie gedocumenteerde acties", () => {
    renderBar();

    expect(screen.getByRole("button", { name: "Verplaatsen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Op inactief zetten" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Op actief zetten" })).toBeInTheDocument();
  });

  it("heeft geen verwijderknop", () => {
    renderBar();

    // Leerlingen worden nooit hard verwijderd (T-14). Een massale verwijdering
    // is precies de handeling waarmee de afscherming stukgaat (doc 02).
    expect(screen.queryByRole("button", { name: /verwijder/i })).not.toBeInTheDocument();
  });

  it("verplaatst pas wanneer er een groep is gekozen", () => {
    const onMove = vi.fn();
    renderBar({ onMove });

    expect(screen.getByRole("button", { name: "Verplaatsen" })).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox", { name: "Verplaatsen naar groep" }), {
      target: { value: "g1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verplaatsen" }));

    expect(onMove).toHaveBeenCalledWith("g1");
  });
});
