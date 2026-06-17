import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getAdminClient } from "@/lib/pocketbase/admin";
import { upsertOAuthConnection } from "@/lib/sync/oauth-connections";

export async function GET(request: NextRequest) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user_id") ?? (pb.authStore.model?.id as string);

  try {
    const admin = await getAdminClient();
    await upsertOAuthConnection(admin, {
      user: userId,
      provider: "microsoft",
      accessToken: searchParams.get("access_token") ?? "",
      refreshToken: searchParams.get("refresh_token") ?? "",
      expiresAt: new Date(Date.now() + parseInt(searchParams.get("expires_in") ?? "3600", 10) * 1000).toISOString(),
      providerEmail: searchParams.get("email") ?? "",
      scopes: searchParams.get("scope") ?? "",
    });
  } catch (err) {
    console.error("[finalize/microsoft] upsertOAuthConnection failed:", err);
    return Response.json({ error: String(err), userId }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/settings?connected=microsoft", request.url));
}