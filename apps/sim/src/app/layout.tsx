import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Capacitor Simulator",
  description: "Model token flows through launchpad economics and governance deliberation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
