"use client";

interface Goal {
  id: string;
  title: string;
  status: string;
  progress: number;
  targetDate?: string;
  description?: string;
  expand?: { area?: { name: string; color: string } };
}

interface Props {
  goals: Goal[];
}

function statusBadge(status: string) {
  if (status === "completed") return { label: "Completed", bg: "#e9f6f7", color: "#1d7a82" };
  if (status === "on_hold") return { label: "On hold", bg: "#fdf4e0", color: "#b17d1f" };
  return { label: "Active", bg: "#eef6ee", color: "#1a7a2a" };
}

function formatTarget(dateStr?: string): string {
  if (!dateStr) return "No target date";
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", d: "numeric", year: "numeric" } as Intl.DateTimeFormatOptions);
}

export default function GoalsClient({ goals }: Props) {
  const active = goals.filter((g) => g.status === "active");
  const onTrack = active.length;

  return (
    <div style={{ padding: 32, maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#80859a" }}>
          {goals.length} GOAL{goals.length !== 1 ? "S" : ""} · {onTrack} ACTIVE
        </span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: "9px 0 0" }}>
          Goals everything <span style={{ fontStyle: "italic", color: "#29a8b2" }}>ladders up</span> to.
        </h1>
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign: "center", color: "#80859a", fontSize: 15, padding: "60px 0" }}>
          No goals yet. Add your first goal to get started.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {goals.map((g) => {
          const areaColor = g.expand?.area?.color || "#d7dae3";
          const areaName = g.expand?.area?.name || "";
          const progress = Math.min(100, Math.max(0, g.progress || 0));
          const ringBg = `conic-gradient(${areaColor} ${progress * 3.6}deg, #eceef3 0deg)`;
          const badge = statusBadge(g.status);

          return (
            <div
              key={g.id}
              style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 18, padding: 22, boxShadow: "0 1px 2px rgba(15,16,20,0.05)", display: "flex", gap: 18 }}
            >
              {/* Progress ring */}
              <div style={{ width: 64, height: 64, borderRadius: 999, background: ringBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#0f1014" }}>
                  {progress}%
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {areaName && (
                      <>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: areaColor, display: "inline-block" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#80859a" }}>{areaName}</span>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: badge.bg, color: badge.color }}>{badge.label}</span>
                </div>

                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#0f1014", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{g.title}</h3>

                {g.description && (
                  <p style={{ fontSize: 13, color: "#5b606f", margin: "0 0 10px", lineHeight: 1.5 }}>{g.description}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 12, borderTop: "1px solid #f5f6f9" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3b7c6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />
                  </svg>
                  <span style={{ fontSize: 12, color: "#80859a" }}>{formatTarget(g.targetDate)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
