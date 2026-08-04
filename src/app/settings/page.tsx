import type { Metadata } from "next";

import { SettingsPage } from "@/modules/settings/components/SettingsPage";

export const metadata: Metadata = {
  title: "Instellingen",
};

export default function Page() {
  return <SettingsPage />;
}
