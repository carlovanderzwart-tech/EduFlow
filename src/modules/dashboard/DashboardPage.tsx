import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/ui/EmptyState";

export function DashboardPage() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Dashboard"
      description="Hier komt straks je agenda van vandaag en morgen, snel beginnen en je recente werk te zien. Deze module wordt in een volgende sprint gebouwd."
    />
  );
}
