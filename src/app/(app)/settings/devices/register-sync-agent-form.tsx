"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSyncAgentAction } from "./actions";

export function RegisterSyncAgentForm() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 lg:flex-row lg:items-end"
        action={(formData) => {
          setError(null);
          setApiKey(null);
          setDeviceId(null);
          startTransition(async () => {
            try {
              const result = await registerSyncAgentAction(formData);
              setApiKey(result.apiKey);
              setDeviceId(result.deviceId);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Failed to register sync agent"
              );
            }
          });
        }}
      >
        <div className="space-y-1.5">
          <Input
            name="name"
            placeholder="MacBook Pro"
            required
            disabled={isPending}
            className="sm:min-w-64"
          />
        </div>
        <div className="space-y-1.5">
          <Input
            name="agentVersion"
            placeholder="Agent version (optional)"
            disabled={isPending}
            className="sm:min-w-48"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering…" : "Register Mac Sync Agent"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {apiKey && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium">Save this API key — it will not be shown again.</p>
          {deviceId && (
            <p className="mt-1 text-xs text-muted-foreground">Agent ID: {deviceId}</p>
          )}
          <code className="mt-2 block break-all rounded bg-background p-2 font-mono text-xs">
            {apiKey}
          </code>
          <p className="mt-2 text-muted-foreground">
            Configure the macOS EventKit agent with{" "}
            <code className="text-xs">Authorization: Bearer &lt;api-key&gt;</code> against{" "}
            <code className="text-xs">/api/sync/*</code>. See MAC_SYNC_AGENT.md.
          </p>
        </div>
      )}
    </div>
  );
}
