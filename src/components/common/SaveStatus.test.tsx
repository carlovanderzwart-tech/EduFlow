import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SaveStatus } from "./SaveStatus";

/**
 * Doc 04 (*Gedeelde patronen*): "Kort bericht in beeld: 'Opgeslagen.'" — en in
 * rust staat er niets.
 */
describe("SaveStatus", () => {
  it("zegt niets in rust", () => {
    render(<SaveStatus state="idle" />);

    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("meldt dat er wordt opgeslagen", () => {
    render(<SaveStatus state="saving" />);

    expect(screen.getByRole("status")).toHaveTextContent("Opslaan…");
  });

  it("meldt dat er is opgeslagen", () => {
    render(<SaveStatus state="saved" />);

    expect(screen.getByRole("status")).toHaveTextContent("Opgeslagen.");
  });

  it("onderbreekt een schermlezer niet", () => {
    render(<SaveStatus state="saved" />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
