import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("heeft een toegankelijk label zonder zichtbaar kopje", () => {
    render(<SearchField value="" onValueChange={vi.fn()} label="Zoek in documentaties" />);

    expect(screen.getByRole("searchbox", { name: "Zoek in documentaties" })).toBeInTheDocument();
  });

  it("toont de wisknop alleen wanneer er iets staat", () => {
    const { rerender } = render(
      <SearchField value="" onValueChange={vi.fn()} label="Zoek in documentaties" />,
    );
    expect(screen.queryByRole("button", { name: "Zoekopdracht wissen" })).not.toBeInTheDocument();

    rerender(<SearchField value="blokken" onValueChange={vi.fn()} label="Zoek in documentaties" />);
    expect(screen.getByRole("button", { name: "Zoekopdracht wissen" })).toBeInTheDocument();
  });

  it("wist de zoekopdracht", () => {
    const onValueChange = vi.fn();
    render(
      <SearchField value="blokken" onValueChange={onValueChange} label="Zoek in documentaties" />,
    );

    screen.getByRole("button", { name: "Zoekopdracht wissen" }).click();
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
