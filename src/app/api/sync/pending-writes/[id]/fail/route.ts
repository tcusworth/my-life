import { authenticateSyncAgent } from "@/lib/sync/auth";
import { failPendingWrite } from "@/lib/sync/pending-writes";
import {
  assertValidation,
  readJsonBody,
  syncError,
  syncJson,
} from "@/lib/sync/http";
import { validatePendingWriteFailPayload } from "@/lib/sync/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const { id } = await context.params;
    const body = await readJsonBody(request);
    const data = assertValidation(validatePendingWriteFailPayload(body));
    const result = await failPendingWrite(ctx, id, data);

    return syncJson({
      pendingWriteId: result.id,
      status: result.status,
      errorMessage: result.errorMessage,
    });
  } catch (error) {
    return syncError(error);
  }
}
