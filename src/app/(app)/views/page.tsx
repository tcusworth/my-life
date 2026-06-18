"use client";
import { useState } from "react";

type Priority = "high" | "med" | "low";

const prio: Record<Priority, { bg: string; color: string; label: string }> = {
  high: { bg: "#fdeee6", color: "#b84a1f", label: "High" },
  med: { bg: "#fdf4e0", color: "#b17d1f", label: "Med" },
  low: { bg: "#e9f6f7", color: "#1d7a82", label: "Low" },
};

const allTasks = [
  { id: "t1", title: "Finalize pitch deck v4", project: "Series A raise", dot: "#eb6532", time: "9:00", p: "high" as Priority },
  { id: "t2", title: "Interview design lead candidate", project: "Hiring", dot: "#29a8b2", time: "11:30", p: "high" as Priority },
  { id: "t3", title: "Strength session", project: "Marathon training", dot: "#f0ae35", time: "13:00", p: "low" as Priority },
  { id: "t4", title: "Call accountant re: SAFE", project: "Series A raise", dot: "#eb6532", time: "14:00", p: "med" as Priority },
  { id: "t5", title: "Pick up Leo from soccer", project: "Family", dot: "#674197", time: "17:30", p: "med" as Priority },
];

const viewDefs = [
  { key: "week", name: "Due this week" },
  { key: "high", name: "High priority" },
  { key: "family", name: "Family" },
  { key: "series", name: "Series A" },
];

const viewFilters: Record<string, (t: typeof allTasks[0]) => boolean> = {
  week: () => true,
  high: (t) => t.p === "high",
  family: (t) => t.project === "Family",
  series: (t) => t.project === "Series A raise",
};

export default function ViewsPage() {
  const [viewSel, setViewSel] = useState("week");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const toggleDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filterFn = viewFilters[viewSel] || (() => true);
  const viewTasks = allTasks.filter(filterFn);

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto", background: "#faf7f1", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#80859a" }}>SAVED VIEWS</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          See only what <span style={{ fontStyle: "italic", color: "#eb6532" }}>matters</span> now.
        </h1>
      </div>

      {/* View filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {viewDefs.map((v) => {
          const count = allTasks.filter(viewFilters[v.key]).length;
          const active = viewSel === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setViewSel(v.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 999,
                background: active ? "#0f1014" : "#ffffff",
                color: active ? "#faf7f1" : "#5b606f",
                border: `1px solid ${active ? "#0f1014" : "#d7dae3"}`,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {v.name}
              <span style={{ fontSize: 11, opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks list */}
      {viewTasks.length > 0 ? (
        <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
          {viewTasks.map((t, idx) => {
            const isDone = !!done[t.id];
            const pk = prio[t.p];
            const isLast = idx === viewTasks.length - 1;
            return (
              <div
                key={t.id}
                onClick={() => showToast(`Opening: ${t.title}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 13,
                  padding: "14px 18px",
                  borderBottom: isLast ? "none" : "1px solid #f5f6f9",
                  cursor: "pointer",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleDone(t.id, e)}
                  style={{
                    width: 21, height: 21, borderRadius: 7,
                    border: `1.8px solid ${isDone ? "#29a8b2" : "#d7dae3"}`,
                    background: isDone ? "#29a8b2" : "transparent",
                    cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, transition: "all 160ms",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isDone ? 1 : 0 }}>
                    <path d="M5 12l4 4L19 7" />
                  </svg>
                </button>

                {/* Title + project */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: isDone ? "#b3b7c6" : "#15171d", textDecoration: isDone ? "line-through" : "none" }}>
                    {t.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: t.dot }} />
                    <span style={{ fontSize: 12, color: "#80859a" }}>{t.project}</span>
                  </div>
                </div>

                {/* Priority badge */}
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: pk.bg, color: pk.color }}>
                  {pk.label}
                </span>

                {/* Time */}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#5b606f", minWidth: 58, textAlign: "right" }}>
                  {t.time}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, padding: 48, textAlign: "center", color: "#80859a", fontSize: 14 }}>
          Nothing matches this view right now.
        </div>
      )}

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
