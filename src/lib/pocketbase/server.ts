import PocketBase from "pocketbase";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, POCKETBASE_URL } from "@/lib/pocketbase/config";
import type { TypedPocketBase, User } from "@/types/pocketbase";

export function createServerClient(): TypedPocketBase {
  const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  pb.autoCancellation(false);
  return pb;
}

export async function getAuthenticatedClient(): Promise<TypedPocketBase | null> {
  const pb = createServerClient();
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie?.value) {
    return null;
  }

  pb.authStore.loadFromCookie(`${AUTH_COOKIE_NAME}=${authCookie.value}`);

  if (!pb.authStore.isValid) {
    return null;
  }

  // Skip authRefresh — SDK v0.27 misparses PocketBase v0.39 response format,
  // silently clearing the auth store. JWT validity from isValid is sufficient.
  return pb;
}

export async function getCurrentUser(): Promise<User | null> {
  const pb = await getAuthenticatedClient();
  if (!pb?.authStore.model) return null;
  return pb.authStore.model as unknown as User;
}
