import type { Metadata } from "next";

import { SeriesPage } from "@/modules/settings/SeriesPage";

export const metadata: Metadata = {
  title: "Reeksen",
};

export default function Page() {
  return <SeriesPage />;
}
