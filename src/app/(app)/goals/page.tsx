"use client";

import { useState } from "react";

const goals = [
  { name: "Raise the Series A", area: "Work", areaColor: "#29a8b2", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", progress: 72, target: "Close by Jun 30", projects: ["Series A raise"] },
  { name: "Ship the v2 platform", area: "Work", areaColor: "#29a8b2", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", progress: 45, target: "Launch Sep 1", projects: ["Q3 product launch", "Hire design lead"] },
  { name: "Run Chicago sub-3:30", area: "Health", areaColor: "#eb6532", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", progress: 60, target: "Race Oct 12", projects: ["Marathon training"] },
  { name: "Be present at home", area: "Family", areaColor: "#674197", status: "At risk", statusBg: "#fdeee6", statusColor: "#b84a1f", progress: 38, target: "Ongoing", projects: ["Home renovation", "Italy trip"] },
  { name: "Read 24 books", area: "Personal", areaColor: "#f0ae35", status: "On track", statusBg: "#e9f6f7", statusColor: "#1d7a82", progress: 50, target: "12 of 24 read", projects: [] },
];

export default function GoalsPage() {
  const [_tick, setTick] = useState(0);

  return (
    <div style={{ padding: 32, maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>Q3 2026 · 4 OF 5 ON TRACK</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          Goals everything <span style={{ fontStyle: "italic", color: "#29a8b2" }}>ladders up</span> to.
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {goals.map((g, i) => {
          const ringBg = `conic-gradient(${g.areaColor} ${g.progress * 3.6}deg, #eceef3 0deg)`;
          return (
            <div
              key={i}
              style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 18, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", display: "flex", gap: 18 }}
            >
              {/* Progress ring */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: ringBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Fraunces', serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0f1014",
                  }}
                >
                  {g.progress}%
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: g.areaColor, display: "inline-block" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{g.area}</span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: g.statusBg, color: g.statusColor }}>{g.status}</span>
                </div>

                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#0f1014", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{g.name}</h3>

                {g.projects.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
                    {g.projects.map((pj, j) => (
                      <span key={j} style={{ fontSize: 11.5, fontWeight: 500, color: "#5b606f", background: "#f5f6f9", border: "1px solid #eceef3", borderRadius: 7, padding: "3px 9px" }}>{pj}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 12, borderTop: "1px solid #f5f6f9" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3b7c6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
                  <span style={{ fontSize: 12, color: "#80859a" }}>{g.target}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
