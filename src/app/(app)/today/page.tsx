"use client";

import React from "react";

const agenda = [
  { time: "9:00", ampm: "AM", dot: "#eb6532", title: "Pitch deck review", tag: "Series A", tagBg: "#fdeee6", tagColor: "#b84a1f", meta: "Deep work · 1h" },
  { time: "11:30", ampm: "AM", dot: "#29a8b2", title: "Design lead interview", tag: "Hiring", tagBg: "#e9f6f7", tagColor: "#1d7a82", meta: "with Priya + panel · 1h" },
  { time: "1:00", ampm: "PM", dot: "#f0ae35", title: "Strength session", tag: "Health", tagBg: "#fdf4e0", tagColor: "#b17d1f", meta: "Gym · 45m" },
  { time: "2:00", ampm: "PM", dot: "#eb6532", title: "Call accountant", tag: "Series A", tagBg: "#fdeee6", tagColor: "#b84a1f", meta: "SAFE paperwork · 30m" },
  { time: "5:30", ampm: "PM", dot: "#674197", title: "School pickup → soccer", tag: "Family", tagBg: "#efe9f5", tagColor: "#4a2d6e", meta: "Leo · don't be late" },
];

const today = new Date();
const dateEyebrow = today
  .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  .toUpperCase();

export default function TodayPage() {
  return (
    <div style={{ padding: "32px", maxWidth: "1180px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>
          {dateEyebrow}
        </span>
        <h1 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "38px", fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "8px 0 0" }}>
          A focused <span style={{ fontStyle: "italic", color: "#29a8b2" }}>Tuesday</span>.
        </h1>
      </div>

      {/* 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "22px", alignItems: "start" }}>
        {/* Left: Agenda timeline */}
        <div>
          <h2 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "20px", fontWeight: 600, color: "#0f1014", margin: "0 0 14px" }}>
            Agenda
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {agenda.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>
                {/* Time column */}
                <div style={{ width: "62px", flexShrink: 0, textAlign: "right", paddingTop: "14px" }}>
                  <div style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: "12.5px", fontWeight: 500, color: "#2c2f3a" }}>{a.time}</div>
                  <div style={{ fontSize: "11px", color: "#b3b7c6" }}>{a.ampm}</div>
                </div>
                {/* Vertical line with dot */}
                <div style={{ width: "2px", background: "#eceef3", flexShrink: 0, position: "relative" }}>
                  <span style={{ position: "absolute", top: "16px", left: "-4px", width: "10px", height: "10px", borderRadius: "999px", background: a.dot, border: "2px solid #faf7f1" }} />
                </div>
                {/* Event card */}
                <div style={{ flex: 1, background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "13px", padding: "13px 16px", boxShadow: "0 1px 2px rgba(15,16,20,0.04)", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#15171d" }}>{a.title}</span>
                    <span style={{ fontSize: "10.5px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: a.tagBg, color: a.tagColor }}>
                      {a.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#80859a", marginTop: "4px" }}>{a.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: At a glance + Don't forget */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* At a glance card */}
          <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
            <h3 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "16px", fontWeight: 600, color: "#0f1014", margin: "0 0 16px" }}>
              At a glance
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "34px", fontWeight: 500, color: "#1d7a82", lineHeight: 1 }}>
                  3<span style={{ fontSize: "18px", color: "#b3b7c6" }}>/8</span>
                </div>
                <div style={{ fontSize: "12px", color: "#80859a", marginTop: "5px" }}>Tasks done</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "34px", fontWeight: 500, color: "#0f1014", lineHeight: 1 }}>
                  4.5h
                </div>
                <div style={{ fontSize: "12px", color: "#80859a", marginTop: "5px" }}>Deep focus</div>
              </div>
            </div>

            <div style={{ height: "1px", background: "#f5f6f9", margin: "16px 0" }} />

            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#80859a", marginBottom: "11px" }}>
              Time blocks
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "3px", height: "26px", borderRadius: "3px", background: "#29a8b2", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#15171d" }}>Deep work — fundraise</div>
                  <div style={{ fontSize: "11.5px", color: "#80859a" }}>8:00 – 10:30</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "3px", height: "26px", borderRadius: "3px", background: "#674197", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#15171d" }}>Hiring loop</div>
                  <div style={{ fontSize: "11.5px", color: "#80859a" }}>11:00 – 13:00</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "3px", height: "26px", borderRadius: "3px", background: "#f0ae35", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#15171d" }}>Family + dinner</div>
                  <div style={{ fontSize: "11.5px", color: "#80859a" }}>17:30 – 20:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Don't forget card */}
          <div style={{ background: "#fdf4e0", border: "1px solid #fbe5b1", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b17d1f", marginBottom: "8px" }}>
              Don&apos;t forget
            </div>
            <p style={{ fontSize: "14px", color: "#5c400f", margin: 0, lineHeight: 1.5 }}>
              School pickup at 5:30 — Leo has soccer practice right after, cleats are by the door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
