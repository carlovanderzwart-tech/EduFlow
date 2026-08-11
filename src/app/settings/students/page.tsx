import type { Metadata } from "next";

import { StudentsPage } from "@/modules/settings/components/StudentsPage";

export const metadata: Metadata = {
  title: "Leerlingen",
};

export default function Page() {
  return <StudentsPage />;
}
