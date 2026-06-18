import { startOfWeek, endOfWeek, format, addWeeks } from "date-fns";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { CalendarEvent } from "@/types/pocketbase";
import SyncOnMount from "@/components/SyncOnMount";
import { CalendarGrid } from "./calendar-grid-client";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const base = week ? new Date(week) : new Date();
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(base, { weekStartsOn: 1 });

  const prevWeek = addWeeks(weekStart, -1).toISOString().slice(0, 10);
  const nextWeek = addWeeks(weekStart, 1).toISOString().slice(0, 10);
  const todayParam = new Date().toISOString().slice(0, 10);

  const pb = await getAuthenticatedClient();
  let calEvents: CalendarEvent[] = [];
  let eventCount = 0;
  let syncedLabel = "No events synced yet";

  if (pb) {
    try {
      const events = (await pb.collection("calendar_events").getFullList({
        filter: `startsAt >= "${weekStart.toISOString()}" && startsAt <= "${weekEnd.toISOString()}" && deletedAt = ""`,
        sort: "startsAt",
      })) as unknown as CalendarEvent[];

      if (events.length > 0) {
        calEvents = events;
        eventCount = events.length;
        syncedLabel = "Synced from your calendars";
      }
    } catch {
      // fall through
    }
  }

  const weekLabel = `${format(weekStart, "MMMM d")} – ${format(weekEnd, "d")}`;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1320, margin: "0 auto" }}>
      <SyncOnMount />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em", color: "#0f1014", margin: 0 }}>
            {weekLabel}
          </h1>
          <p style={{ fontSize: 13.5, color: "#80859a", margin: "6px 0 0" }}>
            {syncedLabel}{eventCount > 0 ? ` · ${eventCount} event${eventCount !== 1 ? "s" : ""} this week` : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href={`/calendar?week=${prevWeek}`} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", textDecoration: "none", color: "#2c2f3a" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </a>
          <a href={`/calendar?week=${todayParam}`} style={{ fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", color: "#2c2f3a", textDecoration: "none" }}>
            Today
          </a>
          <a href={`/calendar?week=${nextWeek}`} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", textDecoration: "none", color: "#2c2f3a" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>
      </div>

      <CalendarGrid
        events={calEvents}
        weekStartIso={weekStart.toISOString()}
        todayIso={new Date().toISOString()}
      />
    </div>
  );
}
