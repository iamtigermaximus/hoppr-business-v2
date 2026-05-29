export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg, #0a0a0a)" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "var(--color-text-primary, #fff)", fontSize: "24px", fontWeight: 800 }}>Access Denied</h1>
        <p style={{ color: "var(--color-text-muted, #737373)", marginTop: "8px" }}>You do not have permission to access this page.</p>
      </div>
    </div>
  );
}
