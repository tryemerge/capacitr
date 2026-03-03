import type { Metadata } from "next";
import "./globals.css";
import { SideNav } from "@/components/SideNav";

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
        <SideNav />
        <div className="flex-1 ml-48">{children}</div>
      </body>
    </html>
  );
}
