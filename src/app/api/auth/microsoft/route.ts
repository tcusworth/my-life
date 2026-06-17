import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/config/environment";
import { APP_URL, AUTH_COOKIE_NAME } from "@/lib/pocketbase/config";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function GET(request: NextRequest) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = pb.authStore.model?.id as string;
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  const state = Buffer.from(JSON.stringify({ userId, token: authToken })).toString("base64url");

  const params = new URLSearchParams({
    client_id: env.microsoftClientId,
    redirect_uri: `${APP_URL}/api/auth/microsoft/callback`,
    response_type: "code",
    scope: "openid email offline_access Calendars.Read",
    state,
  });

  return NextResponse.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`);
}
