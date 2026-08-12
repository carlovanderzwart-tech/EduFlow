import type { Metadata } from "next";

import { AgendaPage } from "@/modules/agenda/AgendaPage";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function Page() {
  return <AgendaPage />;
}
