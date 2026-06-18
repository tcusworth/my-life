"use client";

import React, { useState } from "react";

type ExtractedItem = {
  id: string;
  title: string;
  type: string;
  typeColor: string;
  detail: string;
  iconBg: string;
  iconColor: string;
};

const extractedRaw: ExtractedItem[] = [
  { id: "e1", title: "Send Maya the updated deck with Q2 numbers", type: "Task", typeColor: "#1d7a82", detail: "Series A · due today", iconBg: "#e9f6f7", iconColor: "#1d7a82" },
  { id: "e2", title: "Book dentist appointment for Leo", type: "Task", typeColor: "#1d7a82", detail: "Family · this week", iconBg: "#e9f6f7", iconColor: "#1d7a82" },
  { id: "e3", title: "Sarah's birthday — buy a gift", type: "Event", typeColor: "#b17d1f", detail: "Next Thursday", iconBg: "#fdf4e0", iconColor: "#b17d1f" },
  { id: "e4", title: "Follow up with Priya about design lead", type: "Follow-up", typeColor: "#4a2d6e", detail: "Hiring · overdue", iconBg: "#efe9f5", iconColor: "#4a2d6e" },
  { id: "e5", title: "Renew passport before Italy", type: "Task", typeColor: "#1d7a82", detail: "Family trip · 6 weeks", iconBg: "#e9f6f7", iconColor: "#1d7a82" },
];

function ItemIcon({ type, iconColor, iconBg }: { type: string; iconColor: string; iconBg: string }) {
  const taskPath = "M5 12l4 4L19 7";
  const eventPath = "M3 9.5h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z";
  const followupPath = "M9 8a3 3 0 1 0 0-.01M3 19a6 6 0 0 1 12 0";

  const path = type === "Event" ? eventPath : type === "Follow-up" ? followupPath : taskPath;

  return (
    <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </div>
  );
}

export default function InboxPage() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const accept = (id: string) => {
    setAccepted((prev) => ({ ...prev, [id]: true }));
    setDismissed((prev) => ({ ...prev, [id]: false }));
  };

  const dismiss = (id: string) => {
    setDismissed((prev) => ({ ...prev, [id]: true }));
    setAccepted((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "34px", fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>
          Capture now,{" "}
          <span style={{ fontStyle: "italic", color: "#674197" }}>sort later</span>.
        </h1>
        <p style={{ fontSize: "15px", color: "#5b606f", margin: "10px 0 0" }}>
          Brain-dump anything. AI turns it into tasks, events, and follow-ups — you just approve.
        </p>
      </div>

      {/* Capture box */}
      <div style={{ background: "#ffffff", border: "1px solid #d3c4e2", borderRadius: "18px", padding: "6px", boxShadow: "0 10px 30px -18px rgba(38,22,58,0.3)", marginBottom: "26px" }}>
        <div style={{ background: "#faf7f1", borderRadius: "14px", padding: "16px 18px" }}>
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "#2c2f3a", margin: 0 }}>
            Need to send Maya the updated deck w/ Q2 numbers. Book dentist for Leo. Sarah&apos;s birthday next Thurs — get a gift. Follow up with Priya about the design lead, she ghosted. Long run Sat morning, 18mi. Renew passport before Italy trip.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px" }}>
          <span style={{ fontSize: "12px", color: "#80859a" }}>6 items detected</span>
          <div style={{ flex: 1 }} />
          <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "11px", border: "none", background: "#674197", color: "#fff", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", transition: "background 160ms" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9z" />
            </svg>
            Process with AI
          </button>
        </div>
      </div>

      {/* Extracted by AI */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "14px" }}>
        <h2 style={{ fontFamily: "var(--font-serif, 'Fraunces', serif)", fontSize: "19px", fontWeight: 600, color: "#0f1014", margin: 0 }}>
          Extracted by AI
        </h2>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#674197", background: "#efe9f5", padding: "3px 9px", borderRadius: "999px" }}>
          Review &amp; approve
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        {extractedRaw.map((e) => {
          const isAccepted = !!accepted[e.id];
          const isDismissed = !!dismissed[e.id];
          const statusLabel = isAccepted ? "Added" : isDismissed ? "Skipped" : "";
          const statusColor = isAccepted ? "#2f8f5e" : "#b3b7c6";
          const acceptBg = isAccepted ? "#2f8f5e" : "#29a8b2";

          return (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "#ffffff",
                border: "1px solid #d7dae3",
                borderRadius: "14px",
                padding: "14px 18px",
                boxShadow: "0 1px 2px rgba(15,16,20,0.04)",
                opacity: isDismissed ? 0.4 : 1,
                transition: "opacity 200ms",
              }}
            >
              <ItemIcon type={e.type} iconColor={e.iconColor} iconBg={e.iconBg} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#15171d", textDecoration: isDismissed ? "line-through" : "none" }}>
                  {e.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: e.typeColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {e.type}
                  </span>
                  <span style={{ fontSize: "12px", color: "#b3b7c6" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#80859a" }}>{e.detail}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                {statusLabel && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: statusColor, minWidth: "62px", textAlign: "right" }}>
                    {statusLabel}
                  </span>
                )}

                {/* Dismiss button */}
                <button
                  onClick={() => dismiss(e.id)}
                  style={{ width: "32px", height: "32px", borderRadius: "9px", border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#80859a", transition: "background 160ms", flexShrink: 0 }}
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>

                {/* Accept button */}
                <button
                  onClick={() => accept(e.id)}
                  style={{ width: "32px", height: "32px", borderRadius: "9px", border: "none", background: acceptBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 160ms", flexShrink: 0 }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
