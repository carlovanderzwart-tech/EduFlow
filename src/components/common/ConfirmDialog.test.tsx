import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

/**
 * docs/archief/04 (*Gedeelde patronen*): "Verwijderen. Vraagt altijd om bevestiging en
 * zegt wat er verdwijnt." Het tweede deel is hier het belangrijkste: de
 * beschrijving moet zichtbaar zijn.
 */
describe("ConfirmDialog", () => {
  const props = {
    title: "Documentatie verwijderen?",
    description: '"Bouwen met blokken" verdwijnt, samen met de foto die erbij hoort.',
    confirmLabel: "Verwijderen",
  };

  it("zegt wat er verdwijnt", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} {...props} />);

    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it("toont niets zolang hij gesloten is", () => {
    render(<ConfirmDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} {...props} />);

    expect(screen.queryByText(props.description)).not.toBeInTheDocument();
  });

  it("bevestigt en sluit daarna", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} destructive {...props} />,
    );

    screen.getByRole("button", { name: "Verwijderen" }).click();

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("heeft standaard een annuleerknop", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} {...props} />);

    expect(screen.getByRole("button", { name: "Annuleren" })).toBeInTheDocument();
  });
});
