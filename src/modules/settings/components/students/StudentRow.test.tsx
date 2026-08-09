import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Student } from "@/types/student";

import { StudentRow } from "./StudentRow";

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: "s1",
    firstName: "Sanne",
    lastName: "de Wit",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const noop = () => {};

/** docs/archief/04, scherm 7: per regel een selectievakje, de naam, de groep en de leeftijd. */
describe("StudentRow", () => {
  it("toont de naam en de groep", () => {
    render(
      <StudentRow
        student={makeStudent()}
        groupName="groep geel"
        selected={false}
        onSelectedChange={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByText("Sanne de Wit")).toBeInTheDocument();
    expect(screen.getByText(/groep geel/)).toBeInTheDocument();
  });

  it("toont geen leeftijd zonder geboortedatum", () => {
    render(
      <StudentRow
        student={makeStudent()}
        groupName="groep geel"
        selected={false}
        onSelectedChange={noop}
        onEdit={noop}
      />,
    );

    // docs/archief/02: geen streepje en geen schatting.
    expect(screen.getByText("groep geel")).toBeInTheDocument();
    expect(screen.queryByText(/jaar/)).not.toBeInTheDocument();
  });

  it("blijft zichtbaar zonder groep, want opruimen gooit geen werk weg", () => {
    render(
      <StudentRow
        student={makeStudent({ groupId: undefined })}
        selected={false}
        onSelectedChange={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByText("Sanne de Wit")).toBeInTheDocument();
  });

  it("merkt een inactieve leerling", () => {
    render(
      <StudentRow
        student={makeStudent({ active: false })}
        selected={false}
        onSelectedChange={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByText("Inactief")).toBeInTheDocument();
  });

  it("geeft het selectievakje een naam die zegt om wie het gaat", () => {
    render(
      <StudentRow
        student={makeStudent()}
        selected={false}
        onSelectedChange={noop}
        onEdit={noop}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Sanne de Wit selecteren" })).toBeInTheDocument();
  });

  it("opent het bewerkpaneel via de naam", () => {
    const onEdit = vi.fn();

    render(
      <StudentRow
        student={makeStudent()}
        selected={false}
        onSelectedChange={noop}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sanne de Wit" }));

    expect(onEdit).toHaveBeenCalledOnce();
  });
});
