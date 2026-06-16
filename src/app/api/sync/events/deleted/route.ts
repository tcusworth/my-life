import { authenticateSyncAgent } from "@/lib/sync/auth";
import { markCalendarEventsDeleted } from "@/lib/sync/events";
import { syncError, syncJson, readJsonBody, assertValidation } from "@/lib/sync/http";
import { validateDeletedEventsPayload } from "@/lib/sync/validation";

export async function POST(request: Request) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const body = await readJsonBody(request);
    const data = assertValidation(validateDeletedEventsPayload(body));
    const results = await markCalendarEventsDeleted(ctx, data.events);

    return syncJson({ events: results });
  } catch (error) {
    return syncError(error);
  }
}
