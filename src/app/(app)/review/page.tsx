"use client";
import { useState } from "react";

const stats = [
  { value: "32", label: "Tasks completed", helper: "of 41 planned", color: "#29a8b2" },
  { value: "22.5h", label: "Deep focus", helper: "+3.2h vs last week", color: "#674197" },
  { value: "78%", label: "On-time rate", helper: "+6 pts", color: "#2f8f5e" },
  { value: "4", label: "Workouts", helper: "32 mi logged", color: "#eb6532" },
];

const momentum = [
  { name: "Raise the Series A", color: "#29a8b2", delta: "+8%", deltaColor: "#2f8f5e", to: "72%" },
  { name: "Ship the v2 platform", color: "#29a8b2", delta: "+5%", deltaColor: "#2f8f5e", to: "45%" },
  { name: "Run Chicago sub-3:30", color: "#eb6532", delta: "+4%", deltaColor: "#2f8f5e", to: "60%" },
  { name: "Be present at home", color: "#674197", delta: "-2%", deltaColor: "#c94339", to: "38%" },
];

const reviewWins = ["Closed the design-lead loop", "Hit every scheduled long run", "Inbox to zero 4 days"];
const reviewMisses = ["Italy planning slipped a week", "Skipped two journaling days"];

const healthTrend = [
  { label: "Steps / day", value: "8,316", delta: "+12%" },
  { label: "Avg sleep", value: "7h 04m", delta: "+18m" },
  { label: "Resting HR", value: "58 bpm", delta: "-2 bpm" },
];

export default function ReviewPage() {
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
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>WEEK OF JUNE 15 · SUNDAY RECAP</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
            A week, in <span style={{ fontStyle: "italic", color: "#eb6532" }}>review</span>.
          </h1>
        </div>
        <button
          onClick={() => showToast("Opening next week planner")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 11, border: "none", background: "#0f1014", color: "#faf7f1", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          Plan next week
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((r) => (
          <div key={r.label} style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: r.color, lineHeight: 1 }}>{r.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#15171d", marginTop: 9 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: "#80859a", marginTop: 3 }}>{r.helper}</div>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Goal momentum */}
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "#0f1014", margin: "0 0 16px" }}>Goal momentum</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {momentum.map((g) => (
                <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: g.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "#15171d" }}>{g.name}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: g.deltaColor }}>{g.delta}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f1014", fontFamily: "'JetBrains Mono', monospace", minWidth: 44, textAlign: "right" }}>{g.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wins / Slipped */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#e9f6f7", border: "1px solid #c9ebed", borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#0f4247", margin: "0 0 12px" }}>Wins</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {reviewWins.map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d7a82" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#0f4247" }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fdf4e0", border: "1px solid #fbe5b1", borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#5c400f", margin: "0 0 12px" }}>Slipped</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {reviewMisses.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b17d1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                      <path d="M12 8v5M12 16v.5" /><circle cx="12" cy="12" r="9" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#5c400f" }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Health trends */}
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: "0 0 14px" }}>Health trends</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {healthTrend.map((h) => (
                <div key={h.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#5b606f" }}>{h.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f1014", fontFamily: "'JetBrains Mono', monospace" }}>{h.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2f8f5e", minWidth: 42, textAlign: "right" }}>{h.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI recap */}
          <div style={{ background: "linear-gradient(160deg,#26163a,#4a2d6e)", borderRadius: 16, padding: 22, color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f0ae35" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d3c4e2" }}>AI recap</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#e7ddf2", margin: 0 }}>
              Strong week — you shipped more than you planned and protected your training. Watch the Family area: it slipped two weeks running. Next week, block two evenings for Italy planning before it becomes urgent.
            </p>
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
