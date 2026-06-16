"use client";

import { useState } from "react";

const healthRings = [
  { label: "Move", value: "642", unit: "of 750 cal", color: "#eb6532", pct: 86 },
  { label: "Exercise", value: "38", unit: "of 30 min", color: "#29a8b2", pct: 100 },
  { label: "Stand", value: "9", unit: "of 12 hr", color: "#674197", pct: 75 },
];

const stepTrend = [
  { d: "Mon", h: "62%", bg: "#d7dae3" },
  { d: "Tue", h: "84%", bg: "#29a8b2" },
  { d: "Wed", h: "58%", bg: "#d7dae3" },
  { d: "Thu", h: "92%", bg: "#d7dae3" },
  { d: "Fri", h: "70%", bg: "#d7dae3" },
  { d: "Sat", h: "100%", bg: "#d7dae3" },
  { d: "Sun", h: "44%", bg: "#d7dae3" },
];

const metrics = [
  { label: "Steps", value: "9,432", helper: "+12% vs avg", helperColor: "#2f8f5e", color: "#29a8b2", soft: "#e9f6f7" },
  { label: "Sleep", value: "7h 12m", helper: "81 · Good", helperColor: "#5b606f", color: "#674197", soft: "#efe9f5" },
  { label: "Resting HR", value: "58", helper: "bpm · -2", helperColor: "#2f8f5e", color: "#eb6532", soft: "#fdeee6" },
  { label: "Active energy", value: "642", helper: "cal today", helperColor: "#5b606f", color: "#f0ae35", soft: "#fdf4e0" },
  { label: "VO₂ max", value: "48.2", helper: "High · +0.4", helperColor: "#2f8f5e", color: "#2f8f5e", soft: "#e7f3ec" },
  { label: "Workouts", value: "4", helper: "this week", helperColor: "#5b606f", color: "#29a8b2", soft: "#e9f6f7" },
];

const workouts = [
  { name: "Morning run", detail: "6.2 mi · 8:26 /mi · 612 cal", when: "Today · 6:34 AM", color: "#29a8b2", soft: "#e9f6f7" },
  { name: "Strength — lower body", detail: "45 min · 220 cal", when: "Planned · 1:00 PM", color: "#674197", soft: "#efe9f5" },
  { name: "Long run", detail: "14 mi · 9:02 /mi · 1,420 cal", when: "Sat · 7:10 AM", color: "#29a8b2", soft: "#e9f6f7" },
  { name: "Cycling", detail: "18 mi · 58 min · 540 cal", when: "Thu · 5:45 PM", color: "#f0ae35", soft: "#fdf4e0" },
];

const workoutIcons: Record<string, string> = {
  "Morning run": "🏃",
  "Strength — lower body": "💪",
  "Long run": "🏃",
  "Cycling": "🚴",
};

export default function HealthPage() {
  const [_tick, setTick] = useState(0);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>APPLE HEALTH · SYNCED 8 MIN AGO</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
            Your body, <span style={{ fontStyle: "italic", color: "#29a8b2" }}>in the loop</span>.
          </h1>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#b84a1f", background: "#fdeee6", border: "1px solid #fad2bf", padding: "8px 13px", borderRadius: 999, flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#eb6532" stroke="none"><path d="M12 20s-6.5-4.4-9-8.5a4.3 4.3 0 0 1 8-2.4 4.3 4.3 0 0 1 8 2.4c-2.5 4.1-7 8.5-7 8.5z" /></svg>
          Connected
        </span>
      </div>

      {/* Activity rings + Steps chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 18, marginBottom: 18, alignItems: "stretch" }}>
        {/* Dark rings card */}
        <div style={{ background: "#0f1014", borderRadius: 20, padding: 24, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#80859a", marginBottom: 18 }}>Activity rings · today</div>
          <div style={{ display: "flex", justifyContent: "space-around", gap: 12 }}>
            {healthRings.map((r, i) => {
              const ringBg = `conic-gradient(${r.color} ${r.pct * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;
              return (
                <div key={i} style={{ textAlign: "center" as const }}>
                  <div style={{ width: 96, height: 96, borderRadius: 999, background: ringBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <div style={{ width: 68, height: 68, borderRadius: 999, background: "#0f1014", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: r.color }}>{r.value}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 11 }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: "#80859a", marginTop: 1 }}>{r.unit}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps chart */}
        <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 20, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0f1014", margin: 0 }}>Steps this week</h3>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#0f1014" }}>58,210</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
            {stepTrend.map((st, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", height: st.h, background: st.bg, borderRadius: "7px 7px 4px 4px", minHeight: 6 }} />
                <span style={{ fontSize: 11.5, fontWeight: 500, color: "#80859a" }}>{st.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#5b606f" }}>{m.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: m.soft, display: "flex", alignItems: "center", justifyContent: "center", color: m.color }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-5 4 10 2-5h4" /></svg>
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", marginTop: 8, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: 12.5, color: m.helperColor, marginTop: 7, fontWeight: 500 }}>{m.helper}</div>
          </div>
        ))}
      </div>

      {/* Workouts + Marathon goal */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#0f1014", margin: "0 0 14px" }}>Recent workouts</h2>
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            {workouts.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderBottom: i < workouts.length - 1 ? "1px solid #f5f6f9" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: w.soft, display: "flex", alignItems: "center", justifyContent: "center", color: w.color, flexShrink: 0, fontSize: 18 }}>
                  {workoutIcons[w.name] || "🏅"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>{w.name}</div>
                  <div style={{ fontSize: 12.5, color: "#80859a", marginTop: 2 }}>{w.detail}</div>
                </div>
                <span style={{ fontSize: 12, color: "#b3b7c6", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{w.when}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marathon goal card */}
        <div style={{ background: "linear-gradient(160deg,#0f4247,#1d7a82)", borderRadius: 18, padding: 22, color: "#fff", boxShadow: "0 18px 40px -22px rgba(15,66,71,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9fe3da" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-5 4 10 2-5h4" /></svg>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#9fe3da" }}>Marathon goal</span>
          </div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 500, lineHeight: 1.35, margin: "0 0 14px", color: "#fff" }}>
            On pace for Chicago. You&apos;re 60% through an 18-week block.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: "#fff", lineHeight: 1 }}>32<span style={{ fontSize: 15, color: "#9fe3da" }}> mi</span></div>
              <div style={{ fontSize: 12, color: "#9fe3da", marginTop: 5 }}>This week</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: "#fff", lineHeight: 1 }}>3:28</div>
              <div style={{ fontSize: 12, color: "#9fe3da", marginTop: 5 }}>Projected time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
