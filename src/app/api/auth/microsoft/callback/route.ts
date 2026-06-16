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
    client_id: env.microsoftClientId,
    client_secret: env.microsoftClientSecret,
    redirect_uri: `${APP_URL}/api/auth/microsoft/callback`,
    grant_type: "authorization_code",
    scope: "openid email offline_access Calendars.Read",
  });

  const tokenRes = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return Response.json({ error: `Token exchange failed: ${err}` }, { status: 500 });
  }

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return Response.json({ error: "Failed to fetch user info" }, { status: 500 });
  }

  const userData = await userRes.json();

  const pb = await getAdminClient();
  const expiresAt = new Date(
    Date.now() + (tokenData.expires_in ?? 3600) * 1000
  ).toISOString();

  await upsertOAuthConnection(pb, {
    user: userId,
    provider: "microsoft",
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? "",
    expiresAt,
    providerEmail: userData.mail ?? userData.userPrincipalName ?? "",
    scopes: tokenData.scope ?? "",
  });

  redirect("/settings?connected=microsoft");
}
