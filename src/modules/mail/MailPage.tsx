import { Mail as MailIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export function MailPage() {
  return (
    <EmptyState
      icon={MailIcon}
      title="Mail"
      description="Hier kun je straks mails laten opstellen vanuit een sjabloon of vanaf niets. Deze module wordt in een volgende sprint gebouwd."
    />
  );
}
