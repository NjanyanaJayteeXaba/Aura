export function Background({ children, theme = "dark" }: { children: React.ReactNode; theme?: "dark" | "light" }) {
  return (
    <div className={`min-h-screen overflow-hidden bg-ink text-white theme-root theme-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-lines" />
      {children}
    </div>
  );
}
