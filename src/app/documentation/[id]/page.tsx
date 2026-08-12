import type { Metadata } from "next";

import { DocumentEditor } from "@/modules/documentation/DocumentEditor";

export const metadata: Metadata = {
  title: "Documentatie",
};

export default async function Page({ params }: PageProps<"/documentation/[id]">) {
  const { id } = await params;

  return <DocumentEditor documentId={id} />;
}
