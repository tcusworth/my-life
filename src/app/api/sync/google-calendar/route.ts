import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getValidAccessToken } from "@/lib/sync/oauth-connections";
import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { fetchGoogleCalendars, fetchGoogleEvents } from "@/lib/calendar/google";
import type { CalendarSourceType } from "@/types/pocketbase";

export async function POST() {
  try {
    const pb = await getAuthenticatedClient();
    if (!pb) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = pb.authStore.model?.id as string;

    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(pb, userId, "google");
    } catch {
      return Response.json({ error: "No Google connection found" }, { status: 400 });
    }

    const now = new Date();
    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const calendars = await fetchGoogleCalendars(accessToken);
    let totalEvents = 0;

    for (const cal of calendars) {
      const sourceFilter = [
        `user = "${escapeFilterValue(userId)}"`,
        `externalId = "${escapeFilterValue(cal.id)}"`,
        `sourceType = "google"`,
      ].join(" && ");

      const existingSources = await pb
        .collection("calendar_sources")
        .getList(1, 1, { filter: sourceFilter });

      const sourceBody = {
        user: userId,
        externalId: cal.id ?? "",
        name: cal.summary ?? "Unnamed Calendar",
        color: cal.backgroundColor ?? "",
        sourceType: "google" as CalendarSourceType,
        isEnabled: true,
      };

      let calendarSourceId: string;
      try {
        if (existingSources.items[0]) {
          const updated = await pb.collection("calendar_sources").update(existingSources.items[0].id, sourceBody);
          calendarSourceId = updated.id;
        } else {
          const created = await pb.collection("calendar_sources").create(sourceBody);
          calendarSourceId = created.id;
        }
      } catch (err) {
        const e = err as any;
        console.error("[google-calendar sync] calendar_sources upsert failed:", e?.data ?? e);
        return Response.json({ error: String(err), field_errors: e?.data?.data ?? e?.data }, { status: 500 });
      }

      let events: Awaited<ReturnType<typeof fetchGoogleEvents>>;
      try {
        events = await fetchGoogleEvents(accessToken, cal.id, timeMin, timeMax);
      } catch {
        continue;
      }

      for (const ev of events) {
        if (!ev.id) continue;

        const startsAt = ev.start.dateTime ?? ev.start.date ?? "";
        const endsAt = ev.end.dateTime ?? ev.end.date ?? startsAt;
        if (!startsAt || !endsAt) continue;

        const isAllDay = !ev.start.dateTime;

        const eventFilter = [
          `user = "${escapeFilterValue(userId)}"`,
          `calendarSource = "${escapeFilterValue(calendarSourceId)}"`,
          `externalId = "${escapeFilterValue(ev.id)}"`,
        ].join(" && ");

        const existingEvents = await pb
          .collection("calendar_events")
          .getList(1, 1, { filter: eventFilter });

        const eventBody = {
          user: userId,
          calendarSource: calendarSourceId,
          externalId: ev.id,
          title: ev.summary ?? "(No title)",
          description: (ev.description ?? "").slice(0, 5000),
          location: (ev.location ?? "").slice(0, 1000),
          startsAt,
          endsAt,
          isAllDay,
          lastSyncedAt: new Date().toISOString(),
        };

        try {
          if (existingEvents.items[0]) {
            await pb.collection("calendar_events").update(existingEvents.items[0].id, eventBody);
          } else {
            await pb.collection("calendar_events").create(eventBody);
          }
          totalEvents++;
        } catch (err) {
          const e = err as any;
          console.error("[google-calendar sync] calendar_events upsert failed:", e?.data ?? e);
          return Response.json({ error: String(err), field_errors: e?.data?.data ?? e?.data, eventBody }, { status: 500 });
        }
      }
    }

    return Response.json({ synced: { calendars: calendars.length, events: totalEvents } });
  } catch (err) {
    console.error("[google-calendar sync] unhandled error:", err);
    const e = err as any;
    return Response.json({ error: String(err), field_errors: e?.data?.data ?? e?.data }, { status: 500 });
  }
}
