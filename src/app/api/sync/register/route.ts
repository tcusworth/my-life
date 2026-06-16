import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { registerSyncAgent } from "@/lib/sync/register";
import { syncError, syncJson, readJsonBody } from "@/lib/sync/http";
import { SyncAuthError } from "@/lib/sync/errors";

export async function POST(request: Request) {
  try {
    const pb = await getAuthenticatedClient();
    if (!pb?.authStore.record) {
      throw new SyncAuthError("Sign in required to register a Mac Sync Agent");
    }

    const body = (await readJsonBody(request)) as {
      name?: string;
      agentVersion?: string;
    };

    const name = String(body.name ?? "").trim();
    if (!name) {
      return syncJson({ error: "name is required", code: "VALIDATION_ERROR" }, 400);
    }

    const result = await registerSyncAgent(pb, pb.authStore.record.id, {
      name,
      agentVersion: body.agentVersion,
    });

    return syncJson({
      ...result,
      message: "Store the apiKey securely — it is shown only once.",
    }, 201);
  } catch (error) {
    return syncError(error);
  }
}
