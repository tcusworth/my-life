import {
  hashApiKey,
  isValidSyncApiKeyFormat,
  secureCompare,
} from "@/lib/crypto";
import { escapeFilterValue, getAdminClient } from "@/lib/pocketbase/admin";
import type { Device } from "@/types/pocketbase";
import { SyncAuthError } from "@/lib/sync/errors";
import type { SyncAgentContext } from "@/lib/sync/types";

export async function authenticateSyncAgent(
  request: Request
): Promise<SyncAgentContext> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new SyncAuthError("Missing Authorization: Bearer <api-key> header");
  }

  const apiKey = authorization.slice("Bearer ".length).trim();
  if (!apiKey || !isValidSyncApiKeyFormat(apiKey)) {
    throw new SyncAuthError("Invalid API key format");
  }

  const apiKeyHash = hashApiKey(apiKey);
  const pb = await getAdminClient();

  const result = await pb.collection("devices").getList<Device>(1, 1, {
    filter: `apiKeyHash = "${escapeFilterValue(apiKeyHash)}"`,
  });

  const device = result.items[0];

  if (!device || device.isActive === false) {
    secureCompare(apiKeyHash, hashApiKey("ml_sync_invalid_key_padding"));
    throw new SyncAuthError("Invalid or revoked API key");
  }

  const agentVersion =
    request.headers.get("x-sync-agent-version") ?? device.agentVersion;

  await pb.collection("devices").update(device.id, {
    lastSeenAt: new Date().toISOString(),
    ...(agentVersion ? { agentVersion } : {}),
  });

  return {
    pb,
    device: {
      ...device,
      lastSeenAt: new Date().toISOString(),
      agentVersion: agentVersion ?? device.agentVersion,
    },
    userId: device.user,
  };
}
