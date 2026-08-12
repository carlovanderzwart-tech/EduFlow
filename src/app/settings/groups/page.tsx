import type { Metadata } from "next";

import { GroupsPage } from "@/modules/settings/GroupsPage";

export const metadata: Metadata = {
  title: "Groepen",
};

export default function Page() {
  return <GroupsPage />;
}
