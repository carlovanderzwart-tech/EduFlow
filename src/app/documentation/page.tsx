import type { Metadata } from "next";

import { DocumentationPage } from "@/modules/documentation/components/DocumentationPage";

export const metadata: Metadata = {
  title: "Documentatie",
};

export default function Page() {
  return <DocumentationPage />;
}
