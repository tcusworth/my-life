"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { approveInboxItems, extractInboxText } from "./actions";
import { InboxReviewPanel } from "./inbox-review-panel";
import { InboxReadinessAlert } from "./inbox-readiness-alert";
import {
  extractionToReviewItems,
  type ReviewItem,
} from "@/lib/ai/inbox-review";
import { getErrorCode, getErrorMessage } from "@/lib/errors/app-errors";
import type { InboxProcessingResult } from "@/types/pocketbase";

type Step = "input" | "review" | "done";

interface AiInboxProcessorProps {
  readiness: {
    pocketbase: { ok: boolean; message?: string };
    oauth: { ok: boolean; message?: string };
    openai: { ok: boolean; message?: string };
    ready: boolean;
  };
}

export function AiInboxProcessor({ readiness }: AiInboxProcessorProps) {
  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [result, setResult] = useState<InboxProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExtract() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const extraction = await extractInboxText(text);
        setReviewItems(extractionToReviewItems(extraction));
        setStep("review");
      } catch (err) {
        setError(getErrorMessage(err));
        if (getErrorCode(err) === "EMPTY_EXTRACTION") {
          setStep("input");
        }
      }
    });
  }

  function handleApprove() {
    setError(null);

    startTransition(async () => {
      try {
        const processingResult = await approveInboxItems(reviewItems);
        setResult(processingResult);
        setStep("done");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  }

  function resetFlow() {
    setStep("input");
    setText("");
    setReviewItems([]);
    setResult(null);
    setError(null);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-[var(--spacing-card)]">
        <InboxReadinessAlert readiness={readiness} />

        {step === "input" && (
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={`Example:\n\nCall Sarah about the Q3 roadmap by Friday.\nStart a Home Renovation project under Personal.\nFollow up with Mike from Acme next Tuesday about the proposal.`}
              rows={8}
              disabled={isPending || !readiness.ready}
              className="min-h-40 resize-y"
            />
            <Button
              type="button"
              onClick={handleExtract}
              disabled={isPending || !text.trim() || !readiness.ready}
            >
              {isPending ? "Extracting…" : "Extract items"}
            </Button>
          </div>
        )}

        {step === "review" && (
          <InboxReviewPanel
            items={reviewItems}
            onChange={setReviewItems}
            onBack={() => setStep("input")}
            onApprove={handleApprove}
            isPending={isPending}
          />
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            <div className="surface-card surface-flush p-4 type-body">
              <p className="font-medium">Created from approved items</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>{result.tasksCreated} tasks</li>
                <li>{result.projectsCreated} projects</li>
                <li>{result.contactsCreated} contacts</li>
                <li>{result.followUpsCreated} follow-up activities</li>
                <li>{result.areasCreated} areas</li>
              </ul>
            </div>
            <Button type="button" variant="outline" onClick={resetFlow}>
              Process another inbox
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
