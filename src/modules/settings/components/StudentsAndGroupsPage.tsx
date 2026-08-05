"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGroups } from "../hooks/useGroups";
import { useStudents } from "../hooks/useStudents";
import { GroupsTab } from "./groups/GroupsTab";
import { StudentsTab } from "./students/StudentsTab";

/**
 * Scherm 7 uit doc 04: leerlingen en groepen, met twee tabbladen.
 *
 * Bereikbaar via Instellingen en **geen zesde icoon in de navigatie** — dit
 * beheer je een paar keer per jaar, niet dagelijks.
 *
 * Het laden staat hier, niet in de tabbladen: beide werken op dezelfde
 * gegevens. Een groep archiveren zet leerlingen op inactief, en leerlingen
 * verplaatsen verandert de aantallen per groep. Eén plek die herlaadt houdt die
 * twee lijsten gelijk.
 */
export function StudentsAndGroupsPage() {
  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const students = useStudents({ search, groupId: groupId || undefined, includeInactive: showInactive });
  const groups = useGroups();

  const { reload: reloadStudents } = students;
  const { reload: reloadGroups } = groups;

  const reloadAll = useCallback(() => {
    reloadStudents();
    reloadGroups();
  }, [reloadStudents, reloadGroups]);

  const allGroups = groups.groups.map((entry) => entry.group);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        {/* Een kop onder die van de Topbar: die zegt "Instellingen", en dit is
            het onderdeel daarbinnen. */}
        <h2 className="font-heading text-lg font-medium">Leerlingen en groepen</h2>
        <Link
          href="/settings"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Instellingen
        </Link>
      </div>

      <Tabs defaultValue="leerlingen">
        <TabsList>
          <TabsTrigger value="leerlingen">Leerlingen</TabsTrigger>
          <TabsTrigger value="groepen">Groepen</TabsTrigger>
        </TabsList>

        <TabsContent value="leerlingen" className="pt-3">
          <StudentsTab
            students={students.students}
            groups={allGroups}
            loading={students.loading}
            error={students.error}
            search={search}
            onSearchChange={setSearch}
            groupId={groupId}
            onGroupChange={setGroupId}
            showInactive={showInactive}
            onShowInactiveChange={setShowInactive}
            onChanged={reloadAll}
          />
        </TabsContent>

        <TabsContent value="groepen" className="pt-3">
          <GroupsTab
            groups={groups.groups}
            loading={groups.loading}
            error={groups.error}
            onChanged={reloadAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
