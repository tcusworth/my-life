import { authenticateSyncAgent } from "@/lib/sync/auth";
import { upsertCalendarSources } from "@/lib/sync/calendars";
import { syncError, syncJson, readJsonBody, assertValidation } from "@/lib/sync/http";
import { validateCalendarSourcesPayload } from "@/lib/sync/validation";

export async function POST(request: Request) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const body = await readJsonBody(request);
    const data = assertValidation(validateCalendarSourcesPayload(body));
    const results = await upsertCalendarSources(ctx, data.sources);

    return syncJson({ sources: results });
  } catch (error) {
    return syncError(error);
  }
}
