import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getOAuthConnection } from "@/lib/sync/oauth-connections";

export async function GET() {
  const pb = await getAuthenticatedClient();
  if (!pb) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = pb.authStore.model?.id as string;

  const [google, microsoft] = await Promise.all([
    getOAuthConnection(pb, userId, "google"),
    getOAuthConnection(pb, userId, "microsoft"),
  ]);

  return Response.json({
    google: google
      ? { connected: true, email: google.providerEmail }
      : { connected: false },
    microsoft: microsoft
      ? { connected: true, email: microsoft.providerEmail }
      : { connected: false },
  });
}
