import type { Metadata } from "next";

import { StudentDetailPage } from "@/modules/settings/StudentDetailPage";

export const metadata: Metadata = {
  title: "Leerling",
};

export default async function Page({ params }: PageProps<"/settings/students/[id]">) {
  const { id } = await params;

  return <StudentDetailPage studentId={id} />;
}
