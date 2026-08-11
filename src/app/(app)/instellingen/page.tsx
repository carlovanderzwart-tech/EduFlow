import type { Metadata } from "next";

import { SettingsPage } from "@/modules/instellingen/SettingsPage";

export const metadata: Metadata = {
  title: "Instellingen",
};

export default function Page() {
  return <SettingsPage />;
}
