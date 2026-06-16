import { authenticateSyncAgent } from "@/lib/sync/auth";
import { upsertCalendarEvents } from "@/lib/sync/events";
import { syncError, syncJson, readJsonBody, assertValidation } from "@/lib/sync/http";
import { validateEventsPayload } from "@/lib/sync/validation";

export async function POST(request: Request) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const body = await readJsonBody(request);
    const data = assertValidation(validateEventsPayload(body));
    const results = await upsertCalendarEvents(ctx, data.events);

    return syncJson({ events: results });
  } catch (error) {
    return syncError(error);
  }
}
