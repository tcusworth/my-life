import { authenticateSyncAgent } from "@/lib/sync/auth";
import { listPendingWrites } from "@/lib/sync/pending-writes";
import { syncError, syncJson } from "@/lib/sync/http";

export async function GET(request: Request) {
  try {
    const ctx = await authenticateSyncAgent(request);
    const items = await listPendingWrites(ctx);

    return syncJson({
      pendingWrites: items.map((item) => ({
        id: item.id,
        operation: item.operation,
        status: item.status,
        payload: item.payload,
        created: item.created,
        updated: item.updated,
      })),
    });
  } catch (error) {
    return syncError(error);
  }
}
