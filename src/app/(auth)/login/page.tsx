"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter), sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#0f1014", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 4 L21 19 L3 19 Z" fill="#f0ae35"/>
              <path d="M12 4 L16.5 19 L3 19 Z" fill="#eb6532"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "28px", fontWeight: 500, color: "#0f1014", margin: "0 0 8px" }}>My Life</h1>
          <p style={{ fontSize: "14px", color: "#80859a", margin: 0 }}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#5b606f", marginBottom: "6px", letterSpacing: "0.04em" }}>Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: "14.5px", color: "#15171d", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#5b606f", marginBottom: "6px", letterSpacing: "0.04em" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #d7dae3", background: "#fff", fontFamily: "inherit", fontSize: "14.5px", color: "#15171d", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: "13px", color: "#b84a1f", background: "#fdeee6", padding: "10px 14px", borderRadius: "9px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "4px", padding: "12px", borderRadius: "10px", border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
