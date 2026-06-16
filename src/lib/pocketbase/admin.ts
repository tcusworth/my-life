import PocketBase from "pocketbase";
import { POCKETBASE_URL } from "@/lib/pocketbase/config";
import type { TypedPocketBase } from "@/types/pocketbase";

let cachedAdmin: TypedPocketBase | null = null;

export async function getAdminClient(): Promise<TypedPocketBase> {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be configured for sync API"
    );
  }

  if (cachedAdmin?.authStore.isValid) {
    return cachedAdmin;
  }

  const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  pb.autoCancellation(false);

  try {
    await pb.collection("_superusers").authWithPassword(email, password);
  } catch {
    await pb.admins.authWithPassword(email, password);
  }

  cachedAdmin = pb;
  return pb;
}

export function escapeFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
