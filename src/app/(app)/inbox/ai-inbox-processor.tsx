"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { processInboxText } from "./actions";
import type { InboxProcessingResult } from "@/types/pocketbase";

export function AiInboxProcessor() {
  const [result, setResult] = useState<InboxProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          AI Inbox Processing
        </CardTitle>
        <CardDescription>
          Paste meeting notes, emails, or brain dumps. AI extracts tasks, projects,
          contacts, due dates, and follow-ups into your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          action={(formData) => {
            setError(null);
            setResult(null);
            startTransition(async () => {
              try {
                const processingResult = await processInboxText(formData);
                setResult(processingResult);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Failed to process inbox"
                );
              }
            });
          }}
          className="space-y-4"
        >
          <Textarea
            name="text"
            placeholder={`Example:\n\nCall Sarah about the Q3 roadmap by Friday.\nStart a Home Renovation project under Personal.\nFollow up with Mike from Acme next Tuesday about the proposal.`}
            rows={8}
            required
            disabled={isPending}
            className="min-h-40 resize-y"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Processing…" : "Extract and create records"}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium">Created from inbox</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>{result.tasksCreated} tasks</li>
              <li>{result.projectsCreated} projects</li>
              <li>{result.contactsCreated} contacts</li>
              <li>{result.followUpsCreated} follow-up activities</li>
              <li>{result.areasCreated} areas</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
