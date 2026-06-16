import { redirect } from "next/navigation";
import { env } from "@/lib/config/environment";
import { APP_URL } from "@/lib/pocketbase/config";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function GET() {
  const pb = await getAuthenticatedClient();
  if (!pb) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = pb.authStore.model?.id as string;

  const params = new URLSearchParams({
    client_id: env.microsoftClientId,
    redirect_uri: `${APP_URL}/api/auth/microsoft/callback`,
    response_type: "code",
    scope: "openid email offline_access Calendars.Read",
    state: userId,
  });

  redirect(
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
  );
}
