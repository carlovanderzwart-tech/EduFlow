import { render, screen } from "@testing-library/react";
import { NotebookPen } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";

/**
 * Doc 04 (*Gedeelde patronen*): "Nooit alleen leegte. Altijd één zin die
 * uitlegt wat hier komt te staan, plus één knop." De knop is optioneel, maar er
 * mag er nooit meer dan één zijn.
 */
describe("EmptyState", () => {
  it("toont titel en uitleg", () => {
    render(
      <EmptyState
        icon={NotebookPen}
        title="Nog geen documentaties"
        description="Hier komen je documentaties te staan."
      />,
    );

    expect(screen.getByText("Nog geen documentaties")).toBeInTheDocument();
    expect(screen.getByText("Hier komen je documentaties te staan.")).toBeInTheDocument();
  });

  it("toont hooguit één knop", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={NotebookPen}
        title="Nog geen documentaties"
        description="Hier komen je documentaties te staan."
        action={{ label: "Nieuwe documentatie", onClick }}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("werkt zonder knop", () => {
    render(<EmptyState icon={NotebookPen} title="Niets gevonden" description="Pas je filters aan." />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
