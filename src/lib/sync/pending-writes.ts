import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { findCalendarSource } from "@/lib/sync/calendars";
import { SyncForbiddenError, SyncNotFoundError } from "@/lib/sync/errors";
import { logSyncError, logSyncSuccess } from "@/lib/sync/log";
import type { SyncAgentContext } from "@/lib/sync/types";
import type {
  PendingWriteCompletePayload,
  PendingWriteFailPayload,
} from "@/lib/sync/validation";
import type {
  CalendarEvent,
  PendingCalendarWrite,
} from "@/types/pocketbase";

async function getPendingWriteForAgent(ctx: SyncAgentContext, id: string) {
  let record: PendingCalendarWrite;

  try {
    record = await ctx.pb.collection("pending_calendar_writes").getOne<PendingCalendarWrite>(id);
  } catch {
    throw new SyncNotFoundError("Pending write not found");
  }

  if (record.user !== ctx.userId) {
    throw new SyncForbiddenError("Pending write does not belong to this user");
  }

  if (record.device && record.device !== ctx.device.id) {
    throw new SyncForbiddenError("Pending write is assigned to another agent");
  }

  return record;
}

export async function listPendingWrites(ctx: SyncAgentContext) {
  const filter = [
    `user = "${escapeFilterValue(ctx.userId)}"`,
    `(device = "${escapeFilterValue(ctx.device.id)}" || device = null)`,
    `(status = "pending" || status = "processing")`,
  ].join(" && ");

  const items = await ctx.pb
    .collection("pending_calendar_writes")
    .getFullList<PendingCalendarWrite>({
      filter,
      sort: "created",
    });

  await logSyncSuccess(ctx, "pending_calendar_writes", `Fetched ${items.length} pending writes`, {
    count: items.length,
  });

  return items;
}

export async function completePendingWrite(
  ctx: SyncAgentContext,
  id: string,
  input: PendingWriteCompletePayload
) {
  const record = await getPendingWriteForAgent(ctx, id);

  if (record.status === "completed" || record.status === "failed") {
    throw new SyncForbiddenError(`Pending write already ${record.status}`);
  }

  const payload = record.payload ?? {};
  let calendarEventId = input.calendarEventId;

  if (!calendarEventId) {
    const calendarSourceExternalId =
      typeof payload.calendarSourceExternalId === "string"
        ? payload.calendarSourceExternalId
        : undefined;

    if (calendarSourceExternalId) {
      const source = await findCalendarSource(ctx, calendarSourceExternalId);
      if (source) {
        const filter = [
          `user = "${escapeFilterValue(ctx.userId)}"`,
          `calendarSource = "${escapeFilterValue(source.id)}"`,
          `externalId = "${escapeFilterValue(input.externalId)}"`,
        ].join(" && ");

        const existing = await ctx.pb
          .collection("calendar_events")
          .getList<CalendarEvent>(1, 1, { filter });

        const eventBody = {
          user: ctx.userId,
          calendarSource: source.id,
          externalId: input.externalId,
          title: String(payload.title ?? "Untitled"),
          description:
            typeof payload.description === "string" ? payload.description : undefined,
          location: typeof payload.location === "string" ? payload.location : undefined,
          startsAt: String(payload.startsAt ?? new Date().toISOString()),
          endsAt: String(payload.endsAt ?? new Date().toISOString()),
          isAllDay: Boolean(payload.isAllDay),
          lastSyncedAt: new Date().toISOString(),
          deletedAt: null as string | null,
        };

        if (existing.items[0]) {
          const updated = await ctx.pb
            .collection("calendar_events")
            .update(existing.items[0].id, eventBody);
          calendarEventId = updated.id;
        } else if (record.operation !== "delete") {
          const created = await ctx.pb.collection("calendar_events").create(eventBody);
          calendarEventId = created.id;
        }
      }
    }

    if (record.operation === "delete" && typeof payload.externalId === "string") {
      const filter = [
        `user = "${escapeFilterValue(ctx.userId)}"`,
        `externalId = "${escapeFilterValue(payload.externalId as string)}"`,
      ].join(" && ");
      const existing = await ctx.pb.collection("calendar_events").getList<CalendarEvent>(1, 1, {
        filter,
      });
      if (existing.items[0]) {
        await ctx.pb.collection("calendar_events").update(existing.items[0].id, {
          deletedAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString(),
        });
        calendarEventId = existing.items[0].id;
      }
    }
  }

  const updatedPayload = {
    ...payload,
    resultExternalId: input.externalId,
    resultCalendarEventId: calendarEventId,
  };

  const updated = await ctx.pb.collection("pending_calendar_writes").update(id, {
    status: "completed",
    payload: updatedPayload,
    errorMessage: "",
  });

  await logSyncSuccess(ctx, "pending_calendar_write_complete", `Completed pending write ${id}`, {
    pendingWriteId: id,
    externalId: input.externalId,
    calendarEventId,
  });

  return { pendingWrite: updated, calendarEventId };
}

export async function failPendingWrite(
  ctx: SyncAgentContext,
  id: string,
  input: PendingWriteFailPayload
) {
  const record = await getPendingWriteForAgent(ctx, id);

  if (record.status === "completed") {
    throw new SyncForbiddenError("Pending write already completed");
  }

  const updated = await ctx.pb.collection("pending_calendar_writes").update(id, {
    status: "failed",
    errorMessage: input.errorMessage,
  });

  await logSyncError(ctx, "pending_calendar_write_fail", input.errorMessage, {
    pendingWriteId: id,
  });

  return updated;
}
