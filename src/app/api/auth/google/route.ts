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
    client_id: env.googleClientId,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope:
      "openid email https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });

  redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
