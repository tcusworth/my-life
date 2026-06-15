"use client";

import PocketBase from "pocketbase";
import { AUTH_COOKIE_NAME, POCKETBASE_URL } from "@/lib/pocketbase/config";
import type { TypedPocketBase } from "@/types/pocketbase";

let client: TypedPocketBase | null = null;

function syncAuthCookie(pb: TypedPocketBase) {
  if (typeof document === "undefined") return;

  if (pb.authStore.isValid) {
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function createBrowserClient(): TypedPocketBase {
  if (client) return client;

  const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  pb.autoCancellation(false);

  pb.authStore.onChange(() => {
    syncAuthCookie(pb);
  });

  client = pb;
  return pb;
}

export function getBrowserClient(): TypedPocketBase {
  return createBrowserClient();
}
