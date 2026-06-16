import { authenticateSyncAgent } from "@/lib/sync/auth";
import { completePendingWrite } from "@/lib/sync/pending-writes";
import {
  assertValidation,
  readJsonBody,
  syncError,
  syncJson,
} from "@/lib/sync/http";
import { validatePendingWriteCompletePayload } from "@/lib/sync/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const { id } = await context.params;
    const body = await readJsonBody(request);
    const data = assertValidation(validatePendingWriteCompletePayload(body));
    const result = await completePendingWrite(ctx, id, data);

    return syncJson({
      pendingWriteId: result.pendingWrite.id,
      status: result.pendingWrite.status,
      calendarEventId: result.calendarEventId,
      externalId: data.externalId,
    });
  } catch (error) {
    return syncError(error);
  }
}
