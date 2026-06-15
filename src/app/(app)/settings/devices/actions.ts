"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { generateApiKey, hashApiKey } from "@/lib/crypto";

export async function registerDevice(formData: FormData) {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.record) {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Device name is required");
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  await pb.collection("devices").create({
    user: pb.authStore.record.id,
    name,
    platform: "macos",
    apiKeyHash,
    isActive: true,
  });

  revalidatePath("/settings/devices");

  return { apiKey };
}
