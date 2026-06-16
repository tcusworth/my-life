import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getValidAccessToken } from "@/lib/sync/oauth-connections";
import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { fetchMicrosoftCalendars, fetchMicrosoftEvents } from "@/lib/calendar/microsoft";
import type { CalendarSourceType } from "@/types/pocketbase";

export async function POST() {
  const pb = await getAuthenticatedClient();
  if (!pb) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = pb.authStore.model?.id as string;

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(pb, userId, "microsoft");
  } catch {
    return Response.json({ error: "No Microsoft connection found" }, { status: 400 });
  }

  const now = new Date();
  const startDateTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDateTime = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

  const calendars = await fetchMicrosoftCalendars(accessToken);

  let totalEvents = 0;

  for (const cal of calendars) {
    const sourceFilter = [
      `user = "${escapeFilterValue(userId)}"`,
      `externalId = "${escapeFilterValue(cal.id)}"`,
      `sourceType = "microsoft"`,
    ].join(" && ");

    const existingSources = await pb
      .collection("calendar_sources")
      .getList(1, 1, { filter: sourceFilter });

    const sourceBody = {
      user: userId,
      externalId: cal.id,
      name: cal.name,
      color: cal.hexColor,
      sourceType: "microsoft" as CalendarSourceType,
      isEnabled: true,
    };

    let calendarSourceId: string;

    if (existingSources.items[0]) {
      const updated = await pb
        .collection("calendar_sources")
        .update(existingSources.items[0].id, sourceBody);
      calendarSourceId = updated.id;
    } else {
      const created = await pb.collection("calendar_sources").create(sourceBody);
      calendarSourceId = created.id;
    }

    let events: Awaited<ReturnType<typeof fetchMicrosoftEvents>>;
    try {
      events = await fetchMicrosoftEvents(accessToken, cal.id, startDateTime, endDateTime);
    } catch {
      continue;
    }

    for (const ev of events) {
      if (!ev.id) continue;

      const startsAt = ev.start.dateTime;
      const endsAt = ev.end.dateTime;

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
        title: ev.subject ?? "(No title)",
        description: ev.bodyPreview ?? "",
        location: ev.location?.displayName ?? "",
        startsAt,
        endsAt,
        isAllDay: ev.isAllDay ?? false,
        lastSyncedAt: new Date().toISOString(),
        deletedAt: "",
      };

      if (existingEvents.items[0]) {
        await pb
          .collection("calendar_events")
          .update(existingEvents.items[0].id, eventBody);
      } else {
        await pb.collection("calendar_events").create(eventBody);
      }

      totalEvents++;
    }
  }

  return Response.json({ synced: { calendars: calendars.length, events: totalEvents } });
}
