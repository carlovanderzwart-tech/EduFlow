import { NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function DocumentationPage() {
  return (
    <EmptyState
      icon={NotebookPen}
      title="Documentatie"
      description="Hier kun je straks documentaties schrijven, met AI die meeschrijft en foto's toevoegt. Deze module wordt in een volgende sprint gebouwd."
    />
  );
}
