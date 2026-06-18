"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Something went wrong</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={reset} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}>
            Try again
          </button>
          <a href="/login" style={{ padding: "8px 16px", borderRadius: "8px", background: "#000", color: "#fff", textDecoration: "none", fontSize: "14px" }}>
            Back to login
          </a>
        </div>
      </body>
    </html>
  );
}
