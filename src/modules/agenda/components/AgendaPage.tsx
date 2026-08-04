import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function AgendaPage() {
  return (
    <EmptyState
      icon={CalendarDays}
      title="Agenda"
      description="Hier zie je straks schoolvakanties naast je eigen afspraken, studiedagen en margedagen. Deze module wordt in een volgende sprint gebouwd."
    />
  );
}
