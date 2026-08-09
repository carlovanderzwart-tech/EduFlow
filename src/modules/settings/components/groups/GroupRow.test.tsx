import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Group } from "@/types/group";

import { GroupRow } from "./GroupRow";

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: "g1",
    name: "groep geel",
    schoolYear: "2025/2026",
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const noop = () => {};

function renderRow(group: Group, studentCount = 23) {
  render(
    <GroupRow
      group={group}
      studentCount={studentCount}
      onRename={noop}
      onArchive={noop}
      onUnarchive={noop}
      onRemove={noop}
    />,
  );
}

/** docs/archief/04, scherm 7: naam, schooljaar en hoeveel leerlingen erin zitten. */
describe("GroupRow", () => {
  it("toont naam, schooljaar en aantal leerlingen", () => {
    renderRow(makeGroup());

    expect(screen.getByText("groep geel")).toBeInTheDocument();
    expect(screen.getByText("2025/2026 · 23 leerlingen")).toBeInTheDocument();
  });

  it("telt enkelvoud als enkelvoud", () => {
    renderRow(makeGroup(), 1);

    expect(screen.getByText(/1 leerling$/)).toBeInTheDocument();
  });

  it("biedt bij een gearchiveerde groep alleen terughalen", () => {
    renderRow(makeGroup({ archived: true }));

    expect(screen.getByRole("button", { name: "Terughalen" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Acties voor/ }),
    ).not.toBeInTheDocument();
  });

  it("biedt bij een gewone groep het actiemenu", () => {
    renderRow(makeGroup());

    expect(screen.getByRole("button", { name: "Acties voor groep geel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Terughalen" })).not.toBeInTheDocument();
  });
});
