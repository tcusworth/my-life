import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { POCKETBASE_URL, AUTH_COOKIE_NAME } from "@/lib/pocketbase/config";
import { getAdminClient } from "@/lib/pocketbase/admin";
import { upsertOAuthConnection } from "@/lib/sync/oauth-connections";
import type { TypedPocketBase } from "@/types/pocketbase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user_id") ?? "";

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  pb.autoCancellation(false);

  if (authCookie?.value) {
    pb.authStore.loadFromCookie(`${AUTH_COOKIE_NAME}=${authCookie.value}`);
  }

  if (!pb.authStore.isValid) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const resolvedUserId = userId || ((pb.authStore.model as { id?: string })?.id ?? "");

  try {
    const admin = await getAdminClient();
    await upsertOAuthConnection(admin, {
      user: resolvedUserId,
      provider: "google",
      accessToken: searchParams.get("access_token") ?? "",
      refreshToken: searchParams.get("refresh_token") ?? "",
      expiresAt: new Date(Date.now() + parseInt(searchParams.get("expires_in") ?? "3600", 10) * 1000).toISOString(),
      providerEmail: searchParams.get("email") ?? "",
      scopes: searchParams.get("scope") ?? "",
    });
  } catch (err) {
    console.error("[finalize/google] upsertOAuthConnection failed:", err);
    return Response.json({ error: String(err), userId: resolvedUserId }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/settings?connected=google", request.url));
}