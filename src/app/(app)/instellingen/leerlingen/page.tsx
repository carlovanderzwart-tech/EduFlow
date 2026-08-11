import type { Metadata } from "next";

import { StudentsPage } from "@/modules/instellingen/StudentsPage";

export const metadata: Metadata = {
  title: "Leerlingen",
};

export default function Page() {
  return <StudentsPage />;
}
