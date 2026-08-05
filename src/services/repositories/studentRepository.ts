import type { Student } from "@/types/student";

import { withDb } from "../db";

/**
 * Leest en schrijft leerlingen. Geen businesslogica — zie `StudentService`.
 *
 * Er is geen `delete`. Leerlingen worden op inactief gezet en nooit hard
 * verwijderd (besluit T-14), omdat de afscherming op het volledige register
 * werkt. Een methode die dat wel zou kunnen is een uitnodiging om die regel te
 * overtreden.
 */
export const studentRepository = {
  getAll(): Promise<Student[]> {
    return withDb((db) => db.getAll("students"));
  },

  get(id: string): Promise<Student | undefined> {
    return withDb((db) => db.get("students", id));
  },

  getByGroup(groupId: string): Promise<Student[]> {
    return withDb((db) => db.getAllFromIndex("students", "by-group", groupId));
  },

  put(student: Student): Promise<void> {
    return withDb(async (db) => {
      await db.put("students", student);
    });
  },

  /** In bulk, in één transactie. Een klas is één handeling, geen dertig. */
  putMany(students: Student[]): Promise<void> {
    return withDb(async (db) => {
      const tx = db.transaction("students", "readwrite");
      await Promise.all(students.map((student) => tx.store.put(student)));
      await tx.done;
    });
  },
};
