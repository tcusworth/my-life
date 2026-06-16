"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { registerSyncAgent } from "@/lib/sync/register";

export async function registerSyncAgentAction(formData: FormData) {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Agent name is required");
  }

  const agentVersion = String(formData.get("agentVersion") ?? "").trim();

  const result = await registerSyncAgent(pb, pb.authStore.record.id, {
    name,
    agentVersion: agentVersion || undefined,
  });

  revalidatePath("/settings/devices");

  return result;
}

export async function revokeSyncAgentAction(deviceId: string) {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new Error("Unauthorized");
  }

  await pb.collection("devices").update(deviceId, { isActive: false });

  revalidatePath("/settings/devices");
}
