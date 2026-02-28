import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacitor Deliberation Simulator",
  description: "Model token flows through governance deliberation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
