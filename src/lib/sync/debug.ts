export function isSyncDebugEnabled(debugParam?: string): boolean {
  if (debugParam === "1" || debugParam === "true") {
    return true;
  }
  return process.env.NEXT_PUBLIC_SYNC_DEBUG === "true";
}
