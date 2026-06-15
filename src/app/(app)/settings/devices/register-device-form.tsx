"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerDevice } from "./actions";

export function RegisterDeviceForm() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        action={(formData) => {
          setError(null);
          setApiKey(null);
          startTransition(async () => {
            try {
              const result = await registerDevice(formData);
              setApiKey(result.apiKey);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to register device");
            }
          });
        }}
      >
        <Input
          name="name"
          placeholder="MacBook Pro"
          required
          disabled={isPending}
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering…" : "Register device"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {apiKey && (
        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-medium">Save this API key — it will not be shown again.</p>
          <code className="mt-2 block break-all rounded bg-background p-2 font-mono text-xs">
            {apiKey}
          </code>
          <p className="mt-2 text-muted-foreground">
            Use this key in your macOS EventKit sync agent when connecting to PocketBase.
          </p>
        </div>
      )}
    </div>
  );
}
