import { startOfWeek, endOfWeek, format } from "date-fns";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { CalendarEvent } from "@/types/pocketbase";
import SyncOnMount from "@/components/SyncOnMount";
import { CalendarGrid } from "./calendar-grid-client";

const mockEvents: CalendarEvent[] = [];

export default async function CalendarPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const pb = await getAuthenticatedClient();

  let calEvents: CalendarEvent[] = mockEvents;
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
        <a
          href="/calendar"
          style={{ fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 9, border: "1px solid #d7dae3", background: "#fff", cursor: "pointer", color: "#2c2f3a", textDecoration: "none" }}
        >
          Today
        </a>
      </div>

      <CalendarGrid
        events={calEvents}
        weekStartIso={weekStart.toISOString()}
        todayIso={now.toISOString()}
      />
    </div>
  );
}
