import { createHash, randomBytes } from "crypto";

export function generateApiKey(): string {
  return `ml_${randomBytes(32).toString("hex")}`;
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}
