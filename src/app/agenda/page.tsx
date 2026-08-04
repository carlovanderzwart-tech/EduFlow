import type { Metadata } from "next";

import { AgendaPage } from "@/modules/agenda/components/AgendaPage";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function Page() {
  return <AgendaPage />;
}
