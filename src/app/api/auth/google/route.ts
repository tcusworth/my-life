import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/config/environment";
import { APP_URL, AUTH_COOKIE_NAME } from "@/lib/pocketbase/config";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function GET() {
  try {
    const pb = await getAuthenticatedClient();
    if (!pb) return Response.json({ error: "Unauthorized - not logged in" }, { status: 401 });

    const userId = pb.authStore.model?.id as string;
    const cookieStore = await cookies();
    const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
    const state = Buffer.from(JSON.stringify({ userId, token: authToken })).toString("base64url");

    const params = new URLSearchParams({
      client_id: env.googleClientId,
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid email https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error("[/api/auth/google] error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
