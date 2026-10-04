import type { Metadata } from "next";

import { Basisweek } from "@/modules/settings/Basisweek";

export const metadata: Metadata = {
  title: "Basisweek",
};

export default function Page() {
  return <Basisweek />;
}
