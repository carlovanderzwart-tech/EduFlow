import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/app/(app)/_shell/AppShell";
import { Toaster } from "@/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EduFlow",
    template: "%s – EduFlow",
  },
  description:
    "EduFlow is een platform voor onderwijsprofessionals die omkomen in de administratie.",
  /**
   * Niet vindbaar via een zoekmachine.
   *
   * EduFlow is geen website maar het gereedschap van één professional, met de namen
   * van kinderen erin. Er staat niets van haar op de server (§10.6) en toch hoort de
   * app niet in een zoekresultaat: B-21 kent geen accounts en T-05 regelt de toegang
   * per apparaat met een code. Zolang die code er nog niet is, is dit wat er wél kan.
   */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
        {/* Eén keer gemonteerd; hier komen de korte berichten uit docs/archief/04
            (*Gedeelde patronen*) terecht. */}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
