import type { Metadata } from "next";

import { StudentsAndGroupsPage } from "@/modules/settings/components/StudentsAndGroupsPage";

export const metadata: Metadata = {
  title: "Leerlingen en groepen",
};

export default function Page() {
  return <StudentsAndGroupsPage />;
}
