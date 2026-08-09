import { getMaskableNames, type Student } from "@/types/student";
import { createId } from "@/utils/id";
import { normalizeForSearch } from "@/utils/text";

import { AuditService } from "./AuditService";
import { studentRepository } from "./repositories/studentRepository";
import { serviceError } from "./ServiceError";

/** Wat je bij een nieuwe leerling invult. De rest volgt. */
export type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt" | "active"> & {
  active?: boolean;
};

export interface StudentFilter {
  search?: string;
  groupId?: string;
  /** Standaard alleen actieve leerlingen; inactieve komen er pas bij op verzoek. */
  includeInactive?: boolean;
}

/** Eén naam met de code die ervoor in de plaats komt bij afscherming. */
export interface MaskableName {
  studentId: string;
  name: string;
}

/**
 * Leerlingen beheren (docs/archief/03). Import en export lopen niet via deze service —
 * die kent geen bestandsformaten.
 */
export const StudentService = {
  async list(filter: StudentFilter = {}): Promise<Student[]> {
    const students = await studentRepository.getAll();
    const query = normalizeForSearch(filter.search ?? "");

    return students
      .filter((student) => (filter.includeInactive ? true : student.active))
      .filter((student) => (filter.groupId ? student.groupId === filter.groupId : true))
      .filter((student) => {
        if (!query) return true;
        const haystack = normalizeForSearch(
          [student.firstName, student.callName, student.lastName].filter(Boolean).join(" "),
        );
        return haystack.includes(query);
      })
      .sort((a, b) =>
        `${a.firstName} ${a.lastName ?? ""}`.localeCompare(`${b.firstName} ${b.lastName ?? ""}`, "nl"),
      );
  },

  get(id: string): Promise<Student | undefined> {
    return studentRepository.get(id);
  },

  getByGroup(groupId: string): Promise<Student[]> {
    return studentRepository.getByGroup(groupId);
  },

  async create(input: NewStudent): Promise<Student> {
    const firstName = input.firstName.trim();
    if (!firstName) throw serviceError("not-found");

    const at = new Date().toISOString();
    const student: Student = {
      ...input,
      id: createId(),
      firstName,
      active: input.active ?? true,
      createdAt: at,
      updatedAt: at,
    };

    await studentRepository.put(student);
    return student;
  },

  async update(
    id: string,
    patch: Partial<Omit<Student, "id" | "createdAt">>,
  ): Promise<Student> {
    const student = await studentRepository.get(id);
    if (!student) throw serviceError("not-found");

    const next: Student = { ...student, ...patch, updatedAt: new Date().toISOString() };
    await studentRepository.put(next);
    return next;
  },

  /**
   * Zet een leerling op inactief. Er is geen verwijderen: de afscherming werkt
   * op het volledige register (DR-26).
   */
  deactivate(id: string): Promise<Student> {
    return this.update(id, { active: false });
  },

  activate(id: string): Promise<Student> {
    return this.update(id, { active: true });
  },

  // ---- Batchbewerkingen ---------------------------------------------------

  /**
   * Verplaatst leerlingen naar een andere groep. Een jaarovergang is dertig keer
   * dezelfde handeling (docs/archief/02).
   */
  async moveToGroup(ids: string[], groupId: string): Promise<number> {
    return this.applyToMany(ids, { groupId }, "verplaatst");
  },

  async setActive(ids: string[], active: boolean): Promise<number> {
    return this.applyToMany(ids, { active }, active ? "geactiveerd" : "opInactief");
  },

  async applyToMany(
    ids: string[],
    patch: Partial<Omit<Student, "id" | "createdAt">>,
    countLabel: string,
  ): Promise<number> {
    if (ids.length === 0) return 0;

    const at = new Date().toISOString();
    const updated: Student[] = [];

    for (const id of ids) {
      const student = await studentRepository.get(id);
      if (!student) continue;
      updated.push({ ...student, ...patch, updatedAt: at });
    }

    await studentRepository.putMany(updated);
    await AuditService.record("students-batch-updated", {
      counts: { [countLabel]: updated.length },
    });

    return updated.length;
  },

  // ---- Afscherming --------------------------------------------------------

  /**
   * Alle namen die afgeschermd moeten worden, **inclusief inactieve
   * leerlingen**.
   *
   * Bewust niet `getActiveStudents` genoemd: een vertrokken kind komt voor in
   * documentaties van eerder dit jaar, en die worden bewerkt en als context
   * meegestuurd. Afschermen op alleen de actieve leerlingen zou die
   * documentaties stilzwijgend onbeschermd maken.
   *
   * De naam wordt aan het leerling-id gekoppeld, zodat hetzelfde kind bij elke
   * aanroep dezelfde code krijgt — ook nadat er leerlingen bij zijn gekomen.
   * Langste naam eerst, zodat "Jan-Peter" niet als "Jan" wordt gepakt (T-04).
   */
  async getNamesForMasking(): Promise<MaskableName[]> {
    const students = await studentRepository.getAll();

    return students
      .flatMap((student) =>
        getMaskableNames(student).map((name) => ({ studentId: student.id, name })),
      )
      .sort((a, b) => b.name.length - a.name.length);
  },

  /** Alle groepsaanduidingen die in gebruik zijn, voor keuzelijsten. */
  async getUsedGroupIds(): Promise<string[]> {
    const students = await studentRepository.getAll();
    return [...new Set(students.map((student) => student.groupId).filter(Boolean))] as string[];
  },
};
