import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { logSyncSuccess } from "@/lib/sync/log";
import type { SyncAgentContext } from "@/lib/sync/types";
import type { CalendarSourcePayload } from "@/lib/sync/validation";
import type { CalendarSource } from "@/types/pocketbase";

export async function upsertCalendarSources(
  ctx: SyncAgentContext,
  sources: CalendarSourcePayload[]
) {
  const results: Array<{ externalId: string; id: string; action: "created" | "updated" }> =
    [];

  for (const source of sources) {
    const filter = [
      `user = "${escapeFilterValue(ctx.userId)}"`,
      `device = "${escapeFilterValue(ctx.device.id)}"`,
      `externalId = "${escapeFilterValue(source.externalId)}"`,
    ].join(" && ");

    const existing = await ctx.pb.collection("calendar_sources").getList<CalendarSource>(1, 1, {
      filter,
    });

    const body = {
      user: ctx.userId,
      device: ctx.device.id,
      externalId: source.externalId,
      name: source.name,
      color: source.color,
      isEnabled: source.isEnabled ?? true,
      sourceType: source.sourceType ?? "eventkit",
    };

    if (existing.items[0]) {
      const updated = await ctx.pb
        .collection("calendar_sources")
        .update(existing.items[0].id, body);
      results.push({
        externalId: source.externalId,
        id: updated.id,
        action: "updated",
      });
    } else {
      const created = await ctx.pb.collection("calendar_sources").create(body);
      results.push({
        externalId: source.externalId,
        id: created.id,
        action: "created",
      });
    }
  }

  await logSyncSuccess(ctx, "calendar_sources", `Upserted ${results.length} calendar sources`, {
    count: results.length,
  });

  return results;
}

async function findCalendarSource(
  ctx: SyncAgentContext,
  calendarSourceExternalId: string
) {
  const filter = [
    `user = "${escapeFilterValue(ctx.userId)}"`,
    `device = "${escapeFilterValue(ctx.device.id)}"`,
    `externalId = "${escapeFilterValue(calendarSourceExternalId)}"`,
  ].join(" && ");

  const result = await ctx.pb.collection("calendar_sources").getList<CalendarSource>(1, 1, {
    filter,
  });

  return result.items[0] ?? null;
}

export { findCalendarSource };
