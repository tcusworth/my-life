import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { SyncNotFoundError } from "@/lib/sync/errors";
import { findCalendarSource } from "@/lib/sync/calendars";
import { logSyncSuccess } from "@/lib/sync/log";
import type { SyncAgentContext } from "@/lib/sync/types";
import type {
  DeletedEventPayload,
  EventPayload,
} from "@/lib/sync/validation";
import type { CalendarEvent } from "@/types/pocketbase";

export async function upsertCalendarEvents(
  ctx: SyncAgentContext,
  events: EventPayload[]
) {
  const results: Array<{
    externalId: string;
    id: string;
    action: "created" | "updated";
  }> = [];

  for (const event of events) {
    const source = await findCalendarSource(ctx, event.calendarSourceExternalId);
    if (!source) {
      throw new SyncNotFoundError(
        `Calendar source not found: ${event.calendarSourceExternalId}`
      );
    }

    const filter = [
      `user = "${escapeFilterValue(ctx.userId)}"`,
      `calendarSource = "${escapeFilterValue(source.id)}"`,
      `externalId = "${escapeFilterValue(event.externalId)}"`,
    ].join(" && ");

    const existing = await ctx.pb.collection("calendar_events").getList<CalendarEvent>(1, 1, {
      filter,
    });

    const body = {
      user: ctx.userId,
      calendarSource: source.id,
      externalId: event.externalId,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      isAllDay: event.isAllDay ?? false,
      recurrenceRule: event.recurrenceRule,
      lastSyncedAt: new Date().toISOString(),
      deletedAt: null as string | null,
    };

    if (existing.items[0]) {
      const updated = await ctx.pb
        .collection("calendar_events")
        .update(existing.items[0].id, body);
      results.push({ externalId: event.externalId, id: updated.id, action: "updated" });
    } else {
      const created = await ctx.pb.collection("calendar_events").create(body);
      results.push({ externalId: event.externalId, id: created.id, action: "created" });
    }
  }

  await logSyncSuccess(ctx, "calendar_events", `Upserted ${results.length} events`, {
    count: results.length,
  });

  return results;
}

export async function markCalendarEventsDeleted(
  ctx: SyncAgentContext,
  events: DeletedEventPayload[]
) {
  const results: Array<{ externalId: string; id: string | null; deleted: boolean }> = [];

  for (const event of events) {
    const source = await findCalendarSource(ctx, event.calendarSourceExternalId);
    if (!source) {
      results.push({ externalId: event.externalId, id: null, deleted: false });
      continue;
    }

    const filter = [
      `user = "${escapeFilterValue(ctx.userId)}"`,
      `calendarSource = "${escapeFilterValue(source.id)}"`,
      `externalId = "${escapeFilterValue(event.externalId)}"`,
    ].join(" && ");

    const existing = await ctx.pb.collection("calendar_events").getList<CalendarEvent>(1, 1, {
      filter,
    });

    if (!existing.items[0]) {
      results.push({ externalId: event.externalId, id: null, deleted: false });
      continue;
    }

    const deletedAt = event.deletedAt ?? new Date().toISOString();
    await ctx.pb.collection("calendar_events").update(existing.items[0].id, {
      deletedAt,
      lastSyncedAt: new Date().toISOString(),
    });

    results.push({
      externalId: event.externalId,
      id: existing.items[0].id,
      deleted: true,
    });
  }

  await logSyncSuccess(
    ctx,
    "calendar_events_deleted",
    `Marked ${results.filter((item) => item.deleted).length} events deleted`,
    { count: results.length }
  );

  return results;
}
