import { env } from "@/lib/config/environment";
import { escapeFilterValue } from "@/lib/pocketbase/admin";
import type { OAuthConnection, OAuthProvider, TypedPocketBase } from "@/types/pocketbase";

export async function getOAuthConnection(
  pb: TypedPocketBase,
  userId: string,
  provider: OAuthProvider
): Promise<OAuthConnection | null> {
  const filter = [
    `user = "${escapeFilterValue(userId)}"`,
    `provider = "${provider}"`,
  ].join(" && ");

  const result = await pb.collection("oauth_connections").getList(1, 1, { filter });
  return (result.items[0] as unknown as OAuthConnection) ?? null;
}

export async function upsertOAuthConnection(
  pb: TypedPocketBase,
  data: Omit<OAuthConnection, "id" | "created" | "updated">
): Promise<OAuthConnection> {
  const existing = await getOAuthConnection(pb, data.user, data.provider);

  if (existing) {
    return pb.collection("oauth_connections").update(existing.id, data);
  }

  return pb.collection("oauth_connections").create(data);
}

export async function deleteOAuthConnection(
  pb: TypedPocketBase,
  userId: string,
  provider: OAuthProvider
): Promise<void> {
  const existing = await getOAuthConnection(pb, userId, provider);
  if (existing) {
    await pb.collection("oauth_connections").delete(existing.id);
  }
}

export async function refreshGoogleToken(
  connection: OAuthConnection
): Promise<{ accessToken: string; expiresAt: string }> {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    refresh_token: connection.refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token refresh failed: ${err}`);
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { accessToken: data.access_token, expiresAt };
}

export async function refreshMicrosoftToken(
  connection: OAuthConnection
): Promise<{ accessToken: string; expiresAt: string }> {
  const params = new URLSearchParams({
    client_id: env.microsoftClientId,
    client_secret: env.microsoftClientSecret,
    refresh_token: connection.refreshToken,
    grant_type: "refresh_token",
    scope: "openid email offline_access Calendars.Read",
  });

  const res = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft token refresh failed: ${err}`);
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { accessToken: data.access_token, expiresAt };
}

export async function getValidAccessToken(
  pb: TypedPocketBase,
  userId: string,
  provider: OAuthProvider
): Promise<string> {
  const connection = await getOAuthConnection(pb, userId, provider);
  if (!connection) {
    throw new Error(`No ${provider} connection found for user`);
  }

  const expiresAt = new Date(connection.expiresAt).getTime();
  const bufferMs = 5 * 60 * 1000;
  if (Date.now() + bufferMs < expiresAt) {
    return connection.accessToken;
  }

  const refreshed =
    provider === "google"
      ? await refreshGoogleToken(connection)
      : await refreshMicrosoftToken(connection);

  await pb.collection("oauth_connections").update(connection.id, {
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
  });

  return refreshed.accessToken;
}
