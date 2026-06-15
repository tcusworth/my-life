export const env = {
  pocketbaseUrl:
    process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export function isOpenAiConfigured() {
  return env.openaiApiKey.length > 0;
}

export function isProduction() {
  return env.nodeEnv === "production";
}
