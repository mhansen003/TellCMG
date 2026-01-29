import type { Metadata } from "next";
import { jakarta, jetbrains } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TellCMG — Voice Your Ideas",
  description:
    "Speak your ideas for improving CMG tools, processes, and systems. Voice-powered idea submission for loan officers with AI-assisted refinement.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
