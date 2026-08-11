import type { Metadata } from "next";

import { DocumentEditor } from "@/modules/documentaties/DocumentEditor";

export const metadata: Metadata = {
  title: "Documentatie",
};

export default async function Page({ params }: PageProps<"/documentaties/[id]">) {
  const { id } = await params;

  return <DocumentEditor documentId={id} />;
}
