import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Group } from "@/types/group";
import type { Student } from "@/types/student";

import { StudentSheet } from "./StudentSheet";

const groups: Group[] = [
  {
    id: "g1",
    name: "groep geel",
    schoolYear: "2025/2026",
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const noop = () => {};

function renderSheet(student: Student | null, onSave = vi.fn()) {
  render(
    <StudentSheet
      open
      onOpenChange={noop}
      student={student}
      groups={groups}
      onSave={onSave}
    />,
  );
  return onSave;
}

/** docs/archief/04, scherm 7: het paneel om een leerling toe te voegen of aan te passen. */
describe("StudentSheet", () => {
  it("toont alle gedocumenteerde velden", () => {
    renderSheet(null);

    expect(screen.getByLabelText("Voornaam")).toBeInTheDocument();
    expect(screen.getByLabelText("Roepnaam")).toBeInTheDocument();
    expect(screen.getByLabelText("Achternaam")).toBeInTheDocument();
    expect(screen.getByLabelText("Geboortedatum")).toBeInTheDocument();
    expect(screen.getByLabelText("Groep")).toBeInTheDocument();
    // Rolvraag in plaats van labelvraag: de schakelaar rendert een knop met
    // daarnaast een verborgen invoerveld, en beide dragen hetzelfde label.
    expect(screen.getByRole("switch", { name: "Actief" })).toBeInTheDocument();
  });

  it("legt uit waarom de roepnaam er is", () => {
    renderSheet(null);

    expect(screen.getByText(/afgeschermd voordat er tekst naar AI gaat/)).toBeInTheDocument();
  });

  it("legt bij de schakelaar uit waarom er geen verwijderknop is", () => {
    renderSheet(null);

    expect(screen.getByText(/van school gaat zet je op inactief/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verwijder/i })).not.toBeInTheDocument();
  });

  it("slaat niet op zonder voornaam en zonder groep", () => {
    const onSave = renderSheet(null);

    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Vul een voornaam in.")).toBeInTheDocument();
    expect(screen.getByText("Kies een groep.")).toBeInTheDocument();
  });

  it("slaat op zodra voornaam en groep er zijn", () => {
    const onSave = renderSheet(null);

    fireEvent.change(screen.getByLabelText("Voornaam"), { target: { value: "  Sanne  " } });
    fireEvent.change(screen.getByLabelText("Groep"), { target: { value: "g1" } });
    fireEvent.click(screen.getByRole("button", { name: "Opslaan" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "  Sanne  ", groupId: "g1" }),
    );
  });

  it("toont de leeftijd zodra er een geboortedatum staat", () => {
    renderSheet(null);

    // docs/archief/02: "4 jaar en 1 maand", en niets wanneer het veld leeg is.
    expect(screen.queryByText(/^\d+ jaar/)).not.toBeInTheDocument();

    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    fireEvent.change(screen.getByLabelText("Geboortedatum"), {
      target: { value: fourYearsAgo.toISOString().slice(0, 10) },
    });

    expect(screen.getByText("4 jaar")).toBeInTheDocument();
  });

  it("vult de bestaande gegevens in bij aanpassen", () => {
    const student: Student = {
      id: "s1",
      firstName: "Jan-Peter",
      callName: "JP",
      lastName: "de Vries",
      groupId: "g1",
      active: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    renderSheet(student);

    expect(screen.getByLabelText("Voornaam")).toHaveValue("Jan-Peter");
    expect(screen.getByLabelText("Roepnaam")).toHaveValue("JP");
    expect(screen.getByLabelText("Groep")).toHaveValue("g1");
  });
});
