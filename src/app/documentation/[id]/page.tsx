import type { Metadata } from "next";

import { DocumentEditor } from "@/modules/documentation/components/DocumentEditor";

export const metadata: Metadata = {
  title: "Documentatie bewerken",
};

export default async function Page({ params, searchParams }: PageProps<"/documentation/[id]">) {
  const { id } = await params;
  const { nieuw } = await searchParams;

  return <DocumentEditor documentId={id} isNew={nieuw === "1"} />;
}
