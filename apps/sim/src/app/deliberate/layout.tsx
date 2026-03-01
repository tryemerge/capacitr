export default function DeliberateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full-bleed layout — the viewer manages its own chrome
  return <div className="h-screen">{children}</div>;
}
