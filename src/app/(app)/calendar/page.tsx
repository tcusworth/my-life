import { startOfWeek, endOfWeek, differenceInMinutes, getDay } from "date-fns";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
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

const mockEvents = [
  { day: 0, title: "Investor sync — Maya", time: "9:00 AM", top: (9 - 7) * 46, height: 0.75 * 46, ...EVENT_COLORS[0] },
  { day: 0, title: "1:1 with Priya", time: "2:00 PM", top: (14 - 7) * 46, height: 0.5 * 46, ...EVENT_COLORS[2] },
  { day: 1, title: "Pitch deck review", time: "9:00 AM", top: (9 - 7) * 46, height: 1 * 46, ...EVENT_COLORS[1] },
  { day: 1, title: "Design lead interview", time: "11:30 AM", top: (11.5 - 7) * 46, height: 1 * 46, ...EVENT_COLORS[0] },
  { day: 1, title: "School pickup", time: "5:30 PM", top: (17.5 - 7) * 46, height: 0.5 * 46, ...EVENT_COLORS[3] },
  { day: 2, title: "Long run 18mi", time: "6:30 AM", top: 0, height: 1.5 * 46, ...EVENT_COLORS[0] },
  { day: 2, title: "Board prep", time: "10:00 AM", top: (10 - 7) * 46, height: 1.5 * 46, ...EVENT_COLORS[2] },
  { day: 3, title: "Q3 launch standup", time: "9:00 AM", top: (9 - 7) * 46, height: 0.5 * 46, ...EVENT_COLORS[0] },
  { day: 3, title: "Renovation walkthrough", time: "3:00 PM", top: (15 - 7) * 46, height: 1 * 46, ...EVENT_COLORS[3] },
  { day: 4, title: "Demo day rehearsal", time: "1:00 PM", top: (13 - 7) * 46, height: 1.5 * 46, ...EVENT_COLORS[1] },
  { day: 5, title: "Farmers market", time: "9:00 AM", top: (9 - 7) * 46, height: 1.5 * 46, ...EVENT_COLORS[3] },
];

function isoWeekdayToIndex(date: Date): number {
  const dow = getDay(date);
  return dow === 0 ? 6 : dow - 1;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function eventToDisplayFormat(ev: CalendarEvent, colorIdx: number) {
  const start = new Date(ev.startsAt);
  const end = new Date(ev.endsAt);
  const startHour = start.getHours() + start.getMinutes() / 60;
  const durationHours = differenceInMinutes(end, start) / 60;

  const top = Math.max(0, (startHour - DAY_START_HOUR) * HOUR_HEIGHT);
  const height = Math.max(0.25, durationHours) * HOUR_HEIGHT;
  const colors = EVENT_COLORS[colorIdx % EVENT_COLORS.length];

  return {
    day: isoWeekdayToIndex(start),
    title: ev.title,
    time: formatTime(ev.startsAt),
    top,
    height,
    ...colors,
  };
}

export default async function CalendarPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const pb = await getAuthenticatedClient();

  let calEvents = mockEvents;
  let eventCount = mockEvents.length;
  let syncedLabel = "Demo data";

  if (pb) {
    try {
      const weekStartIso = weekStart.toISOString();
      const weekEndIso = weekEnd.toISOString();

      const events = (await pb.collection("calendar_events").getFullList({
        filter: `startsAt >= "${weekStartIso}" && startsAt <= "${weekEndIso}" && deletedAt = ""`,
        sort: "startsAt",
      })) as unknown as CalendarEvent[];

      if (events.length > 0) {
        calEvents = events.map((ev: CalendarEvent, i: number) => eventToDisplayFormat(ev, i));
        eventCount = events.length;
        syncedLabel = "Synced from your calendars";
      }
    } catch {
      // fall through to mock events
    }
  }

  const weekLabel = (() => {
    const startLabel = weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    const endLabel = weekEnd.getDate().toString();
    return `${startLabel} – ${endLabel}`;
  })();

  const todayIdx = isoWeekdayToIndex(now);

  const calDays = dayLabels.map((label, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const isToday = i === todayIdx;
    return {
      label,
      num: dayDate.getDate(),
      isToday,
      headBg: isToday ? "#faf7f1" : "#ffffff",
      labelColor: isToday ? "#29a8b2" : "#80859a",
      numColor: isToday ? "#ffffff" : "#0f1014",
      numBg: isToday ? "#29a8b2" : "transparent",
      colBg: isToday ? "#fafcfc" : "transparent",
      events: calEvents.filter((e) => e.day === i),
    };
  });

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>
            {weekLabel}
          </h1>
          <p style={{ fontSize: 13.5, color: "#80859a", margin: "6px 0 0" }}>{syncedLabel} · {eventCount} event{eventCount !== 1 ? "s" : ""} this week</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a
            href="/calendar"
            style={{ fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", color: "#2c2f3a", textDecoration: "none" }}
          >
            Today
          </a>
        </div>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #d7dae3", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,16,20,0.05)" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", borderBottom: "1px solid #eceef3" }}>
          <div />
          {calDays.map((d, i) => (
            <div key={i} style={{ padding: "12px 8px", textAlign: "center" as const, borderLeft: "1px solid #f5f6f9", background: d.headBg }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: d.labelColor }}>{d.label}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: d.numColor, marginTop: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 32, height: 32, borderRadius: 999, background: d.numBg }}>{d.num}</div>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", maxHeight: 560, overflowY: "auto", position: "relative" }}>
          {/* Time column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {hours.map((h, i) => (
              <div key={i} style={{ height: 46, borderBottom: "1px solid #f5f6f9", textAlign: "right" as const, paddingRight: 8, paddingTop: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#b3b7c6" }}>{h}</div>
            ))}
          </div>

          {/* Day columns */}
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
    </div>
  );
}
