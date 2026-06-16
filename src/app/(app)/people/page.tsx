"use client";

import { useState } from "react";

const people = [
  { initials: "MC", name: "Maya Chen", role: "Lead investor", bg: "#fdeee6", color: "#b84a1f", last: "1d ago", lastColor: "#5b606f", next: "Owes: updated deck + Q2 numbers" },
  { initials: "PD", name: "Priya Desai", role: "Recruiter", bg: "#e9f6f7", color: "#1d7a82", last: "3d ago", lastColor: "#b84a1f", next: "Design-lead feedback — overdue" },
  { initials: "DK", name: "Coach Dan", role: "Running coach", bg: "#fdf4e0", color: "#b17d1f", last: "2d ago", lastColor: "#5b606f", next: "Confirm Saturday long run" },
  { initials: "MR", name: "Mom", role: "Family", bg: "#efe9f5", color: "#4a2d6e", last: "6d ago", lastColor: "#b84a1f", next: "Call back about July visit" },
  { initials: "SP", name: "Sarah Park", role: "Spouse", bg: "#efe9f5", color: "#4a2d6e", last: "Today", lastColor: "#1d7a82", next: "Birthday Thursday — get a gift" },
  { initials: "DO", name: "David Okafor", role: "Co-founder", bg: "#e9f6f7", color: "#1d7a82", last: "Today", lastColor: "#1d7a82", next: "In sync — nothing pending" },
  { initials: "LP", name: "Lena Park", role: "Mentor", bg: "#fdf4e0", color: "#b17d1f", last: "21d ago", lastColor: "#b84a1f", next: "Overdue catch-up coffee" },
  { initials: "TR", name: "Tom Reyes", role: "Contractor", bg: "#efe9f5", color: "#4a2d6e", last: "4d ago", lastColor: "#5b606f", next: "Kitchen walkthrough Friday" },
];

const nudgePeople = people.filter(p => p.lastColor === "#b84a1f");

export default function PeoplePage() {
  const [loggedPerson, setLoggedPerson] = useState<string | null>(null);

  return (
    <div style={{ padding: 32, maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>NETWORK · 3 NEED A NUDGE</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          The people behind the <span style={{ fontStyle: "italic", color: "#29a8b2" }}>work</span>.
        </h1>
      </div>

      {/* Reconnect soon */}
      <div style={{ background: "#fdeee6", border: "1px solid #fad2bf", borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#b84a1f", marginBottom: 12 }}>Reconnect soon</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          {nudgePeople.map((n, i) => (
            <button
              key={i}
              onClick={() => setLoggedPerson(n.name)}
              style={{ display: "flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid #fad2bf", borderRadius: 11, padding: "8px 14px 8px 8px", cursor: "pointer", fontFamily: "inherit" }}
            >
              <span style={{ width: 30, height: 30, borderRadius: 8, background: n.bg, color: n.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 600 }}>{n.initials}</span>
              <span style={{ textAlign: "left" as const }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#15171d" }}>{n.name}</span>
                <span style={{ display: "block", fontSize: 11, color: "#b84a1f" }}>{n.last}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* People table */}
      <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.7fr 1.4fr 80px", gap: 12, padding: "12px 20px", borderBottom: "1px solid #eceef3", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#b3b7c6" }}>
          <span>Person</span>
          <span>Relationship</span>
          <span>Last touch</span>
          <span>Next action</span>
          <span />
        </div>

        {/* Table rows */}
        {people.map((p, i) => (
          <div
            key={i}
            style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.7fr 1.4fr 80px", gap: 12, alignItems: "center", padding: "13px 20px", borderBottom: i < people.length - 1 ? "1px solid #f5f6f9" : "none" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: p.bg, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{p.initials}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#15171d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
            </div>
            <span style={{ fontSize: 13, color: "#5b606f" }}>{p.role}</span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: p.lastColor, fontFamily: "'JetBrains Mono', monospace" }}>{p.last}</span>
            <span style={{ fontSize: 12.5, color: "#80859a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.next}</span>
            <button
              onClick={() => setLoggedPerson(p.name)}
              style={{ fontSize: 12, fontWeight: 600, color: "#1d7a82", background: "#e9f6f7", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: "inherit", justifySelf: "end" as const }}
            >
              {loggedPerson === p.name ? "Logged!" : "Log"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
