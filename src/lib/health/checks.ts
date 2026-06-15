import { env, isOpenAiConfigured } from "@/lib/config/environment";

export interface ServiceHealth {
  ok: boolean;
  message?: string;
}

export interface AppHealthStatus {
  pocketbase: ServiceHealth;
  openai: ServiceHealth;
  oauth: ServiceHealth;
  appUrl: string;
  pocketbaseUrl: string;
}

export async function checkPocketBaseHealth(): Promise<ServiceHealth> {
  try {
    const response = await fetch(`${env.pocketbaseUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `PocketBase health check returned ${response.status}`,
      };
    }

    const data = (await response.json()) as { message?: string };
    if (data.message !== "API is healthy.") {
      return { ok: false, message: "Unexpected PocketBase health response" };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Cannot connect to PocketBase. Verify NEXT_PUBLIC_POCKETBASE_URL and VPS uptime.",
    };
  }
}

export async function checkGoogleOAuth(): Promise<ServiceHealth> {
  try {
    const response = await fetch(
      `${env.pocketbaseUrl}/api/collections/users/auth-methods`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) {
      return {
        ok: false,
        message: "Could not read PocketBase auth methods",
      };
    }

    const data = (await response.json()) as {
      oauth2?: {
        enabled?: boolean;
        providers?: Array<{ name: string }>;
      };
      authProviders?: Array<{ name: string }>;
    };

    const providers =
      data.oauth2?.providers?.map((provider) => provider.name) ??
      data.authProviders?.map((provider) => provider.name) ??
      [];

    const googleEnabled =
      data.oauth2?.enabled !== false &&
      providers.some((name) => name.toLowerCase() === "google");

    if (!googleEnabled) {
      return {
        ok: false,
        message:
          "Google OAuth is not enabled in PocketBase Admin → Auth providers.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Could not verify Google OAuth configuration",
    };
  }
}

export function checkOpenAiConfig(): ServiceHealth {
  if (!isOpenAiConfigured()) {
    return {
      ok: false,
      message: "OPENAI_API_KEY is not set",
    };
  }
  return { ok: true };
}

export async function getAppHealthStatus(): Promise<AppHealthStatus> {
  const [pocketbase, oauth] = await Promise.all([
    checkPocketBaseHealth(),
    checkGoogleOAuth(),
  ]);

  return {
    pocketbase,
    openai: checkOpenAiConfig(),
    oauth,
    appUrl: env.appUrl,
    pocketbaseUrl: env.pocketbaseUrl,
  };
}
