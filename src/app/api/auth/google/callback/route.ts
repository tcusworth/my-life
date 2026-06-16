import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { env } from "@/lib/config/environment";
import { APP_URL } from "@/lib/pocketbase/config";
import { getAdminClient } from "@/lib/pocketbase/admin";
import { upsertOAuthConnection } from "@/lib/sync/oauth-connections";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return Response.json({ error: "Missing code or state" }, { status: 400 });
  }

  const tokenParams = new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return Response.json({ error: `Token exchange failed: ${err}` }, { status: 500 });
  }

  const tokenData = await tokenRes.json();

  const userInfoRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  if (!userInfoRes.ok) {
    return Response.json({ error: "Failed to fetch user info" }, { status: 500 });
  }

  const userInfo = await userInfoRes.json();

  const pb = await getAdminClient();
  const expiresAt = new Date(
    Date.now() + (tokenData.expires_in ?? 3600) * 1000
  ).toISOString();

  await upsertOAuthConnection(pb, {
    user: userId,
    provider: "google",
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? "",
    expiresAt,
    providerEmail: userInfo.email ?? "",
    scopes: tokenData.scope ?? "",
  });

  redirect("/settings?connected=google");
}
