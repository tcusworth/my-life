"use client";
import { useState } from "react";

const habitBase = [
  { id: "h1", name: "Morning workout", cadence: "Daily", streak: 12, color: "#eb6532", soft: "#fdeee6", week: [1,1,0,1,1,1], iconPath: "M6 7v10M18 7v10M4 12h16M2 9v6M22 9v6" },
  { id: "h2", name: "Journal", cadence: "Daily", streak: 4, color: "#674197", soft: "#efe9f5", week: [1,0,1,1,1,0], iconPath: "M5 4h11l3 3v13H5zM9 12h6M9 16h4" },
  { id: "h3", name: "No phone after 10pm", cadence: "Daily", streak: 8, color: "#29a8b2", soft: "#e9f6f7", week: [1,1,1,1,0,1], iconPath: "M8 3h8v18H8zM11 18h2" },
  { id: "h4", name: "Read 20 minutes", cadence: "Daily", streak: 21, color: "#f0ae35", soft: "#fdf4e0", week: [1,1,1,1,1,1], iconPath: "M4 5h7v15H4zM13 5h7v15h-7" },
  { id: "h5", name: "Family dinner", cadence: "Weekdays", streak: 5, color: "#2f8f5e", soft: "#e7f3ec", week: [1,1,0,1,1,0], iconPath: "M5 3v8M8 3v8M6.5 11v10M16 3c-1 3-1 6 0 8v10" },
  { id: "h6", name: "Plan tomorrow", cadence: "Daily", streak: 9, color: "#1d7a82", soft: "#e9f6f7", week: [1,1,1,0,1,1], iconPath: "M9 11l3 3 7-7M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10" },
];

export default function HabitsClient() {
  const [habitsDone, setHabitsDone] = useState<Record<string, boolean>>({ h3: true, h4: true, h6: true });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const toggleHabit = (id: string) => {
    setHabitsDone((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast("Habit updated");
  };

  const habitDoneCount = habitBase.filter((h) => habitsDone[h.id]).length;

  const habitStats = [
    { value: `${habitDoneCount}/6`, label: "Done today", color: "#29a8b2" },
    { value: "21", label: "Longest streak", color: "#f0ae35" },
    { value: "86%", label: "30-day rate", color: "#2f8f5e" },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1040, margin: "0 auto", background: "#faf7f1", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>ROUTINES</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          Small things, <span style={{ fontStyle: "italic", color: "#eb6532" }}>repeated</span>.
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        {habitStats.map((hs) => (
          <div key={hs.label} style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", color: hs.color, lineHeight: 1 }}>{hs.value}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#5b606f", marginTop: 8 }}>{hs.label}</div>
          </div>
        ))}
      </div>

      {/* Habits table */}
      <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
        {/* Table header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: "1px solid #eceef3" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#80859a", flex: 1 }}>Today&apos;s habits</span>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#b3b7c6" }}>Last 7 days</span>
        </div>

        {/* Habit rows */}
        {habitBase.map((h, idx) => {
          const done = !!habitsDone[h.id];
          const days = h.week.concat([done ? 1 : 0]).map((v) => ({ bg: v ? h.color : "#eceef3" }));
          const isLast = idx === habitBase.length - 1;
          return (
            <div
              key={h.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: isLast ? "none" : "1px solid #f5f6f9" }}
            >
              {/* Circular checkbox */}
              <button
                onClick={() => toggleHabit(h.id)}
                style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: `1.8px solid ${done ? h.color : "#d7dae3"}`,
                  background: done ? h.color : "transparent",
                  cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, transition: "all 160ms",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: done ? 1 : 0 }}>
                  <path d="M5 12l4 4L19 7" />
                </svg>
              </button>

              {/* Icon */}
              <div style={{ width: 34, height: 34, borderRadius: 10, background: h.soft, color: h.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={h.iconPath} />
                </svg>
              </div>

              {/* Name + cadence */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#15171d" }}>{h.name}</div>
                <div style={{ fontSize: 12, color: "#80859a", marginTop: 1 }}>{h.cadence}</div>
              </div>

              {/* 7-day grid */}
              <div style={{ display: "flex", gap: 4 }}>
                {days.map((d, i) => (
                  <span key={i} style={{ width: 15, height: 15, borderRadius: 4, background: d.bg, display: "inline-block" }} />
                ))}
              </div>

              {/* Streak */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 54, justifyContent: "flex-end" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={h.color} stroke="none">
                  <path d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .3-2 1-3 .2 2 1 2.5 1.5 2.5C9 7 12 6 12 2z" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: h.color, fontFamily: "'JetBrains Mono', monospace" }}>{h.streak}</span>
              </div>
            </div>
          );
        })}
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
