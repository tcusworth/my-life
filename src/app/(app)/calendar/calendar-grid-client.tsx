"use client";

import { differenceInMinutes, getDay } from "date-fns";
import type { CalendarEvent } from "@/types/pocketbase";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];
const HOUR_HEIGHT = 46;
const DAY_START_HOUR = 7;

const EVENT_COLORS = [
  { bg: "#e9f6f7", border: "#c9ebed", accent: "#29a8b2", color: "#1d7a82" },
  { bg: "#fdeee6", border: "#fad2bf", accent: "#eb6532", color: "#b84a1f" },
  { bg: "#efe9f5", border: "#d3c4e2", accent: "#674197", color: "#4a2d6e" },
  { bg: "#fdf4e0", border: "#f5dfa5", accent: "#f0ae35", color: "#b17d1f" },
];

function isoWeekdayToIndex(date: Date): number {
  const dow = getDay(date);
  return dow === 0 ? 6 : dow - 1;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface CalendarGridProps {
  events: CalendarEvent[];
  weekStartIso: string;
  todayIso: string;
}

export function CalendarGrid({ events, weekStartIso, todayIso }: CalendarGridProps) {
  const weekStart = new Date(weekStartIso);
  const today = new Date(todayIso);
  const todayIdx = isoWeekdayToIndex(today);

  const calDays = dayLabels.map((label, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const isToday = i === todayIdx;

    const dayEvents = events
      .map((ev, idx) => {
        const start = new Date(ev.startsAt);
        const end = new Date(ev.endsAt);
        if (isoWeekdayToIndex(start) !== i) return null;
        const startHour = start.getHours() + start.getMinutes() / 60;
        const durationHours = differenceInMinutes(end, start) / 60;
        const top = Math.max(0, (startHour - DAY_START_HOUR) * HOUR_HEIGHT);
        const height = Math.max(0.25, durationHours) * HOUR_HEIGHT;
        const colors = EVENT_COLORS[idx % EVENT_COLORS.length];
        return { title: ev.title, time: formatTime(start), top, height, ...colors };
      })
      .filter(Boolean) as Array<{ title: string; time: string; top: number; height: number; bg: string; border: string; accent: string; color: string }>;

    return {
      label,
      num: dayDate.getDate(),
      isToday,
      headBg: isToday ? "#faf7f1" : "#ffffff",
      labelColor: isToday ? "#29a8b2" : "#80859a",
      numColor: isToday ? "#ffffff" : "#0f1014",
      numBg: isToday ? "#29a8b2" : "transparent",
      colBg: isToday ? "#fafcfc" : "transparent",
      events: dayEvents,
    };
  });

  return (
    <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", borderBottom: "1px solid #eceef3" }}>
        <div />
        {calDays.map((d, i) => (
          <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderLeft: "1px solid #f5f6f9", background: d.headBg }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: d.labelColor }}>{d.label}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: d.numColor, marginTop: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 32, height: 32, borderRadius: 999, background: d.numBg }}>{d.num}</div>
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", maxHeight: 560, overflowY: "auto", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {hours.map((h, i) => (
            <div key={i} style={{ height: 46, borderBottom: "1px solid #f5f6f9", textAlign: "right", paddingRight: 8, paddingTop: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#b3b7c6" }}>{h}</div>
          ))}
        </div>
        {calDays.map((d, di) => (
          <div key={di} style={{ position: "relative", borderLeft: "1px solid #f5f6f9", background: d.colBg }}>
            {hours.map((_, hi) => (
              <div key={hi} style={{ height: 46, borderBottom: "1px solid #f5f6f9" }} />
            ))}
            {d.events.map((ev, ei) => (
              <div
                key={ei}
                style={{
                  position: "absolute",
                  left: 4,
                  right: 4,
                  top: ev.top,
                  height: Math.max(ev.height, 28),
                  background: ev.bg,
                  border: `1px solid ${ev.border}`,
                  borderLeft: `3px solid ${ev.accent}`,
                  borderRadius: 8,
                  padding: "5px 8px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 600, color: ev.color, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                <div style={{ fontSize: 10, color: ev.color, opacity: 0.75, marginTop: 1 }}>{ev.time}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
