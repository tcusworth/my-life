import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/config/environment";
import { APP_URL } from "@/lib/pocketbase/config";
import { getAdminClient } from "@/lib/pocketbase/admin";
import { upsertOAuthConnection } from "@/lib/sync/oauth-connections";

export async function GET(request: NextRequest) {
  console.log("[callback/google] HIT", request.nextUrl.toString().slice(0, 120));
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  if (!code || !rawState) return Response.json({ error: "Missing code or state" }, { status: 400 });

  let userId: string;
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString());
    userId = parsed.userId;
  } catch {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) return Response.json({ error: await tokenRes.text() }, { status: 500 });
  const tokenData = await tokenRes.json();
  console.log("[callback/google] tokenData:", { hasAccessToken: !!tokenData.access_token, tokenLength: (tokenData.access_token ?? "").length, hasRefreshToken: !!tokenData.refresh_token });

  const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userInfoRes.ok) return Response.json({ error: "Failed to fetch user info" }, { status: 500 });
  const userInfo = await userInfoRes.json();

  try {
    const admin = await getAdminClient();

    // Find existing connection to preserve refresh token if Google doesn't return a new one
    let existingRefreshToken = "";
    try {
      const existing = await admin.collection("oauth_connections").getFirstListItem(
        `provider = "google" && user = "${userId}"`
      );
      existingRefreshToken = (existing as any).refreshToken ?? "";
    } catch {
      // No existing record — first connection
    }

    const refreshToken = tokenData.refresh_token || existingRefreshToken;

    await upsertOAuthConnection(admin, {
      user: userId,
      provider: "google",
      accessToken: tokenData.access_token ?? "",
      refreshToken,
      expiresAt: new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000).toISOString(),
      providerEmail: userInfo.email ?? "",
      scopes: tokenData.scope ?? "",
    });
  } catch (err) {
    const e = err as any;
    const detail = {
      message: e?.message,
      status: e?.status,
      response: e?.response,
      url: e?.url,
    };
    console.error("[callback/google] upsertOAuthConnection failed:", JSON.stringify(detail));
    return Response.json({ error: String(err), detail }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/settings?connected=google", request.url));
}