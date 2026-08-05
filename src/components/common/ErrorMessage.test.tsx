import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorMessage } from "./ErrorMessage";

/**
 * Doc 04 (*Gedeelde patronen*): een fout is altijd in gewone taal en noemt
 * altijd een vervolgstap. Die twee eisen worden hier getest.
 */
describe("ErrorMessage", () => {
  it("toont zowel de melding als de vervolgstap", () => {
    render(
      <ErrorMessage
        message="Het lukte niet om AI te bereiken."
        nextStep="Je tekst is bewaard. Probeer het zo nog eens."
      />,
    );

    expect(screen.getByText("Het lukte niet om AI te bereiken.")).toBeInTheDocument();
    expect(screen.getByText("Je tekst is bewaard. Probeer het zo nog eens.")).toBeInTheDocument();
  });

  it("kondigt zich aan bij een schermlezer", () => {
    render(<ErrorMessage message="Er ging iets mis." nextStep="Probeer het zo nog eens." />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("toont geen knop wanneer er geen actie is meegegeven", () => {
    render(<ErrorMessage message="Er ging iets mis." nextStep="Probeer het zo nog eens." />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("voert de vervolgstap uit wanneer er een actie is", async () => {
    const onClick = vi.fn();
    render(
      <ErrorMessage
        message="De opslag is vol."
        nextStep="Ruim documentaties op."
        action={{ label: "Naar overzicht", onClick }}
      />,
    );

    screen.getByRole("button", { name: "Naar overzicht" }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
