"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { revokeSyncAgentAction } from "./actions";

interface RevokeSyncAgentButtonProps {
  deviceId: string;
  deviceName: string;
  isActive: boolean;
}

export function RevokeSyncAgentButton({
  deviceId,
  deviceName,
  isActive,
}: RevokeSyncAgentButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isActive) {
    return <span className="text-xs text-muted-foreground">Revoked</span>;
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="max-w-xs text-xs text-muted-foreground">
          Revoke <span className="font-medium text-foreground">{deviceName}</span>? The
          API key stops working immediately and cannot be recovered.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await revokeSyncAgentAction(deviceId);
                setConfirming(false);
              });
            }}
          >
            {isPending ? "Revoking…" : "Confirm revoke"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setConfirming(true)}
    >
      Revoke
    </Button>
  );
}
