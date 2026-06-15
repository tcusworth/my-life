"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InboxReadinessAlertProps {
  readiness: {
    pocketbase: { ok: boolean; message?: string };
    oauth: { ok: boolean; message?: string };
    openai: { ok: boolean; message?: string };
    ready: boolean;
  };
}

export function InboxReadinessAlert({ readiness }: InboxReadinessAlertProps) {
  if (readiness.ready) {
    return (
      <Alert>
        <CheckCircle2 className="size-4" />
        <AlertTitle>Ready for AI inbox processing</AlertTitle>
        <AlertDescription>
          PocketBase, Google OAuth, and OpenAI are configured.
        </AlertDescription>
      </Alert>
    );
  }

  const issues = [
    !readiness.pocketbase.ok ? readiness.pocketbase.message : null,
    !readiness.oauth.ok ? readiness.oauth.message : null,
    !readiness.openai.ok ? readiness.openai.message : null,
  ].filter((issue): issue is string => Boolean(issue));

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Setup required before processing</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
