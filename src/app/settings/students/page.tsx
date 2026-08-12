import type { Metadata } from "next";

import { StudentsPage } from "@/modules/settings/StudentsPage";

export const metadata: Metadata = {
  title: "Leerlingen",
};

export default function Page() {
  return <StudentsPage />;
}
