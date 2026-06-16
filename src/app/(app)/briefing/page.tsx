"use client";
import { useState } from "react";

const attention = [
  { dot: "#c94339", tag: "Conflict", tagBg: "#f8e3e1", tagColor: "#a33229", title: "Pitch review overlaps your investor sync", detail: "Both booked 9:00–10:00 today", action: "Resolve" },
  { dot: "#eb6532", tag: "Slipping", tagBg: "#fdeee6", tagColor: "#b84a1f", title: "Series A deck is still in draft", detail: "Round closes in 6 days — 5 tasks left", action: "Open" },
  { dot: "#f0ae35", tag: "Overdue", tagBg: "#fdf4e0", tagColor: "#b17d1f", title: "Priya is waiting on design-lead feedback", detail: "3 days since you said you'd reply", action: "Nudge" },
  { dot: "#674197", tag: "Health", tagBg: "#efe9f5", tagColor: "#4a2d6e", title: "No long run on the calendar this week", detail: "Marathon plan calls for 18 miles", action: "Schedule" },
];

const balance = [
  { name: "Work", color: "#29a8b2", pct: 58 },
  { name: "Family", color: "#674197", pct: 22 },
  { name: "Health", color: "#eb6532", pct: 12 },
  { name: "Personal", color: "#f0ae35", pct: 8 },
];

const wins = ["Closed 5 tasks", "Shipped onboarding copy", "Cleared the inbox to zero", "Hit a 4-day workout streak"];

export default function BriefingPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1180, margin: "0 auto", background: "#faf7f1", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>INTELLIGENCE · TUESDAY JUNE 16</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
            Your day, <span style={{ fontStyle: "italic", color: "#eb6532" }}>briefed</span>.
          </h1>
        </div>
        <button
          onClick={() => showToast("Briefing regenerated")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 11, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Hero AI card */}
      <div style={{ background: "linear-gradient(160deg,#26163a,#4a2d6e)", borderRadius: 20, padding: "28px 32px", color: "#fff", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f0ae35" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d3c4e2" }}>AI DAILY BRIEFING</span>
        </div>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, lineHeight: 1.45, color: "#f3eeff", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
          Today is heavy on Series A work. You have a scheduling conflict at 9 AM — resolve it now to protect your momentum heading into the investor sync.
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#c5b8e2", margin: 0 }}>
          Priya has been waiting 3 days on design-lead feedback — a quick nudge this morning keeps that loop closed. Your marathon long run is still unscheduled this week; block Saturday morning before it slips. Yesterday was strong: 5 tasks closed and inbox at zero.
        </p>
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Left: Needs your attention */}
        <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #eceef3" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: 0 }}>Needs your attention</h3>
          </div>
          {attention.map((item, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: i < attention.length - 1 ? "1px solid #f5f6f9" : "none", display: "flex", alignItems: "flex-start", gap: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: item.dot, flexShrink: 0, marginTop: 6 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d", lineHeight: 1.4 }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 3 }}>{item.detail}</div>
              </div>
              <button
                onClick={() => showToast(`${item.action} action taken`)}
                style={{ padding: "6px 12px", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", color: "#2c2f3a", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Life balance */}
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 16px" }}>Life balance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {balance.map((b) => (
                <div key={b.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#5b606f" }}>{b.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#15171d", fontFamily: "'JetBrains Mono', monospace" }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "#eceef3", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${b.pct}%`, background: b.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wins yesterday */}
          <div style={{ background: "#e9f6f7", border: "1px solid #c9ebed", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#0f4247", margin: "0 0 12px" }}>Wins yesterday</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {wins.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d7a82" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                    <path d="M5 12l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: 13, color: "#0f4247" }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 70, display: "flex", alignItems: "center", gap: 10, background: "#0f1014", color: "#faf7f1", padding: "12px 18px", borderRadius: 12, boxShadow: "0 18px 40px -16px rgba(15,16,20,0.5)", fontSize: 13.5, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5fd0aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 7" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
