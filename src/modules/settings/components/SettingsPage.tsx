import { Settings as SettingsIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function SettingsPage() {
  return (
    <EmptyState
      icon={SettingsIcon}
      title="Instellingen"
      description="Hier beheer je straks de namenlijst, reeksen, vakantieregio en je AI-provider. Deze module wordt in een volgende sprint gebouwd."
    />
  );
}
