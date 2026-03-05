import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Web3Provider } from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "Capacitr",
  description: "The Idea Launchpad — launch ideas as tokens, earn by building",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-zinc-950 text-zinc-100">
        <Web3Provider>
          <AppShell>{children}</AppShell>
        </Web3Provider>
      </body>
    </html>
  );
}
