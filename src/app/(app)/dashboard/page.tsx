"use client";

import React, { useState } from "react";

const stats = [
  { label: "Inbox", value: 6, helper: "Items to triage", color: "#eb6532", soft: "#fdeee6" },
  { label: "Today", value: 8, helper: "Tasks scheduled", color: "#29a8b2", soft: "#e9f6f7" },
  { label: "Follow-ups", value: 4, helper: "People waiting", color: "#674197", soft: "#efe9f5" },
  { label: "Focus", value: "4.5h", helper: "Deep work today", color: "#f0ae35", soft: "#fdf4e0" },
];

const rawTasks = [
  { id: "t1", title: "Finalize pitch deck v4", project: "Series A raise", dot: "#eb6532", time: "9:00", priority: "High", prioBg: "#fdeee6", prioColor: "#b84a1f" },
  { id: "t2", title: "Interview design lead candidate", project: "Hiring", dot: "#29a8b2", time: "11:30", priority: "High", prioBg: "#fdeee6", prioColor: "#b84a1f" },
  { id: "t3", title: "Strength session", project: "Marathon training", dot: "#f0ae35", time: "13:00", priority: "Low", prioBg: "#e9f6f7", prioColor: "#1d7a82" },
  { id: "t4", title: "Call accountant re: SAFE", project: "Series A raise", dot: "#eb6532", time: "14:00", priority: "Med", prioBg: "#fdf4e0", prioColor: "#b17d1f" },
  { id: "t5", title: "Pick up Leo from soccer", project: "Family", dot: "#674197", time: "17:30", priority: "Med", prioBg: "#fdf4e0", prioColor: "#b17d1f" },
];

const followUps = [
  { initials: "MC", name: "Maya Chen", note: "Owes: updated deck + numbers", bg: "#fdeee6", color: "#b84a1f", age: "1d" },
  { initials: "PD", name: "Priya Desai", note: "Recruiter — design lead feedback", bg: "#e9f6f7", color: "#1d7a82", age: "3d" },
  { initials: "DK", name: "Coach Dan", note: "Confirm Saturday long run", bg: "#fdf4e0", color: "#b17d1f", age: "2d" },
  { initials: "MR", name: "Mom", note: "Call back about July visit", bg: "#efe9f5", color: "#4a2d6e", age: "4d" },
];

function StatIcon({ label }: { label: string }) {
  const paths: Record<string, string> = {
    Inbox: "M4 13h4l1.6 3h4.8L20 13M4 13 6.2 5h11.6L20 13v6H4z",
    Today: "M12 8v4l3 2M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    "Follow-ups": "M9 8a3 3 0 1 0 0-.01M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6",
    Focus: "M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z",
  };
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[label]} />
    </svg>
  );
}

export default function DashboardPage() {
  const [done, setDone] = useState<Record<string, boolean>>({ t3: true });

  const toggleTask = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date();
  const dateEyebrow = today
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes ml-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ml-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ padding: "32px", maxWidth: "1320px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ animation: "ml-rise 480ms ease-out both", marginBottom: "26px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>
            {dateEyebrow}
          </span>
          <h1 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "42px", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.02em", color: "#0f1014", margin: "10px 0 0", maxWidth: "20ch" }}>
            Good morning, Trevor. Three things need you{" "}
            <span style={{ fontStyle: "italic", color: "#eb6532" }}>today</span>.
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#5b606f", margin: "13px 0 0", maxWidth: "62ch" }}>
            The Series A deck closes this week, a design lead is waiting on you, and you have an 18-mile long run on the calendar. Here&apos;s where things stand.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "26px", animation: "ml-rise 540ms ease-out both" }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.color }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#5b606f" }}>{s.label}</span>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: s.soft, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <StatIcon label={s.label} />
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "40px", fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", marginTop: "6px", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12.5px", color: "#80859a", marginTop: "6px" }}>{s.helper}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "22px", alignItems: "start" }}>
          {/* Left: task list */}
          <div style={{ animation: "ml-rise 600ms ease-out both" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px" }}>
              <h2 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "22px", fontWeight: 600, color: "#0f1014", margin: 0, letterSpacing: "-0.01em" }}>
                Up next today
              </h2>
              <a
                href="/today"
                style={{ fontSize: "13px", fontWeight: 500, color: "#1d7a82", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}
              >
                View agenda
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
              {rawTasks.map((t, i) => {
                const isDone = !!done[t.id];
                return (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                      padding: "14px 18px",
                      borderBottom: i < rawTasks.length - 1 ? "1px solid #f5f6f9" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }}
                      style={{
                        width: "21px",
                        height: "21px",
                        borderRadius: "7px",
                        border: `1.8px solid ${isDone ? "#29a8b2" : "#d7dae3"}`,
                        background: isDone ? "#29a8b2" : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        transition: "all 160ms",
                      }}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isDone ? 1 : 0 }}>
                        <path d="M5 12l4 4L19 7" />
                      </svg>
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: isDone ? "#b3b7c6" : "#15171d", textDecoration: isDone ? "line-through" : "none" }}>
                        {t.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "999px", background: t.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#80859a" }}>{t.project}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px", background: t.prioBg, color: t.prioColor }}>
                      {t.priority}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "12px", color: "#5b606f", minWidth: "58px", textAlign: "right" }}>
                      {t.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: AI focus + follow-ups */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "ml-rise 660ms ease-out both" }}>
            {/* AI focus card */}
            <div style={{ background: "linear-gradient(160deg, #26163a, #4a2d6e)", borderRadius: "18px", padding: "20px", color: "#fff", boxShadow: "0 18px 40px -20px rgba(38,22,58,0.6)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "13px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#f0ae35" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
                  </svg>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d3c4e2" }}>
                  AI focus
                </div>
                <span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#f0ae35", animation: "ml-pulse 2s ease-in-out infinite", marginLeft: "auto" }} />
              </div>
              <p style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "19px", fontWeight: 500, lineHeight: 1.3, margin: "0 0 6px", color: "#fff" }}>
                Send Maya the v4 deck before your 9am.
              </p>
              <p style={{ fontSize: "13px", lineHeight: 1.55, color: "#d3c4e2", margin: "0 0 16px" }}>
                She replied last night asking for updated traction numbers. I&apos;ve drafted the email and attached the deck.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none", background: "#fff", color: "#26163a", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "transform 160ms" }}>
                  Review draft
                </button>
                <button style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                  Snooze
                </button>
              </div>
            </div>

            {/* Follow-ups card */}
            <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", padding: "18px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h3 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "16px", fontWeight: 600, color: "#0f1014", margin: 0 }}>
                  Follow-ups
                </h3>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#b84a1f", background: "#fdeee6", padding: "2px 8px", borderRadius: "999px" }}>
                  4 waiting
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {followUps.map((f) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flexShrink: 0 }}>
                      {f.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#15171d" }}>{f.name}</div>
                      <div style={{ fontSize: "12px", color: "#80859a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.note}</div>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "11px", color: "#b3b7c6" }}>
                      {f.age}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
