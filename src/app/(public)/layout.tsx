export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-bg, #0a0a0a)" }}>
      {children}
    </main>
  );
}
