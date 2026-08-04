import type { Metadata } from "next";

import { MailPage } from "@/modules/mail/components/MailPage";

export const metadata: Metadata = {
  title: "Mail",
};

export default function Page() {
  return <MailPage />;
}
