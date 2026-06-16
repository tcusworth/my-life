import { generateSyncApiKey, hashApiKey } from "@/lib/crypto";
import type { Device } from "@/types/pocketbase";
import type {
  RegisterSyncAgentInput,
  RegisterSyncAgentResult,
  SyncAgentContext,
} from "@/lib/sync/types";

export async function registerSyncAgent(
  pb: SyncAgentContext["pb"],
  userId: string,
  input: RegisterSyncAgentInput
): Promise<RegisterSyncAgentResult> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Agent name is required");
  }

  const apiKey = generateSyncApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const device = (await pb.collection("devices").create({
    user: userId,
    name,
    platform: "macos",
    agentVersion: input.agentVersion?.trim() || undefined,
    apiKeyHash,
    isActive: true,
    lastSeenAt: new Date().toISOString(),
  })) as Device;

  return {
    deviceId: device.id,
    name: device.name,
    apiKey,
    platform: "macos",
  };
}
