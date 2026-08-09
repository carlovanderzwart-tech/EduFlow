import type { Group } from "@/types/group";
import { getCurrentSchoolYearLabel } from "@/utils/date";
import { createId } from "@/utils/id";
import { normalizeForSearch } from "@/utils/text";

import { AuditService } from "./AuditService";
import { groupRepository } from "./repositories/groupRepository";
import { studentRepository } from "./repositories/studentRepository";
import { serviceError } from "./ServiceError";

/**
 * Groepen beheren: toevoegen, hernoemen, opruimen, archiveren (docs/archief/03).
 */
export const GroupService = {
  getAll(): Promise<Group[]> {
    return groupRepository.getAll();
  },

  /** Alleen niet-gearchiveerde groepen; dat zijn de groepen voor keuzelijsten. */
  async getActive(): Promise<Group[]> {
    const groups = await groupRepository.getAll();
    return groups
      .filter((group) => !group.archived)
      .sort((a, b) => a.name.localeCompare(b.name, "nl"));
  },

  get(id: string): Promise<Group | undefined> {
    return groupRepository.get(id);
  },

  /** Maakt een groep aan, of geeft de bestaande terug bij dezelfde naam. */
  async create(name: string, schoolYear?: string): Promise<Group> {
    const trimmed = name.trim();
    if (!trimmed) throw serviceError("not-found");

    const existing = await groupRepository.getAll();
    // Hoofdletterongevoelig vergelijken, anders leveren "groep geel" en
    // "Groep Geel" twee groepen op.
    const match = existing.find(
      (group) => normalizeForSearch(group.name) === normalizeForSearch(trimmed),
    );
    if (match) return match;

    const at = new Date().toISOString();
    const group: Group = {
      id: createId(),
      name: trimmed,
      schoolYear: schoolYear?.trim() || getCurrentSchoolYearLabel(),
      archived: false,
      createdAt: at,
      updatedAt: at,
    };

    await groupRepository.put(group);
    return group;
  },

  async update(id: string, patch: Partial<Omit<Group, "id" | "createdAt">>): Promise<Group> {
    const group = await groupRepository.get(id);
    if (!group) throw serviceError("not-found");

    const next: Group = { ...group, ...patch, updatedAt: new Date().toISOString() };
    await groupRepository.put(next);
    return next;
  },

  /**
   * Ruimt een groep op. Leerlingen en documentaties blijven bestaan en raken
   * hun groepsverwijzing kwijt (docs/archief/03) — opruimen mag nooit werk weggooien.
   */
  async remove(id: string): Promise<void> {
    await groupRepository.delete(id);
  },

  /**
   * Archiveert een groep: de groep verdwijnt uit keuzelijsten en alle
   * leerlingen erin gaan op inactief.
   *
   * Verwijdert niets en schermt niets minder af — gearchiveerde groepen en hun
   * leerlingen tellen onverkort mee bij de naamvervanging.
   */
  async archive(id: string): Promise<{ group: Group; studentsDeactivated: number }> {
    const group = await groupRepository.get(id);
    if (!group) throw serviceError("not-found");

    const students = await studentRepository.getByGroup(id);
    const at = new Date().toISOString();

    const deactivated = students
      .filter((student) => student.active)
      .map((student) => ({ ...student, active: false, updatedAt: at }));

    if (deactivated.length > 0) {
      await studentRepository.putMany(deactivated);
    }

    const next: Group = { ...group, archived: true, updatedAt: at };
    await groupRepository.put(next);

    await AuditService.record("group-archived", {
      entityId: id,
      counts: { leerlingenOpInactief: deactivated.length },
    });

    return { group: next, studentsDeactivated: deactivated.length };
  },

  /**
   * Haalt een groep terug uit het archief. De leerlingen blijven inactief:
   * massaal activeren zou een vertrokken kind terugzetten in de keuzelijsten.
   */
  async unarchive(id: string): Promise<Group> {
    const group = await groupRepository.get(id);
    if (!group) throw serviceError("not-found");

    const next: Group = { ...group, archived: false, updatedAt: new Date().toISOString() };
    await groupRepository.put(next);

    await AuditService.record("group-unarchived", { entityId: id });
    return next;
  },

  /** Hoeveel leerlingen er in een groep zitten (docs/archief/02). */
  async countStudents(groupId: string): Promise<number> {
    const students = await studentRepository.getByGroup(groupId);
    return students.length;
  },
};
