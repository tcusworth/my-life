import { createHash, randomBytes, timingSafeEqual } from "crypto";

/** @deprecated Use generateSyncApiKey for Mac Sync Agents */
export function generateApiKey(): string {
  return generateSyncApiKey();
}

/** Mac Sync Agent API key: ml_sync_<64 hex chars> */
export function generateSyncApiKey(): string {
  return `ml_sync_${randomBytes(32).toString("hex")}`;
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function isValidSyncApiKeyFormat(apiKey: string): boolean {
  return /^ml_sync_[a-f0-9]{64}$/.test(apiKey) || /^ml_[a-f0-9]{64}$/.test(apiKey);
}
