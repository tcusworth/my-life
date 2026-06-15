"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  countSelectedItems,
  type ReviewItem,
} from "@/lib/ai/inbox-review";

interface InboxReviewPanelProps {
  items: ReviewItem[];
  onChange: (items: ReviewItem[]) => void;
  onBack: () => void;
  onApprove: () => void;
  isPending: boolean;
}

function updateItem(
  items: ReviewItem[],
  id: string,
  patch: Partial<ReviewItem>
): ReviewItem[] {
  return items.map((item) =>
    item.id === id ? ({ ...item, ...patch } as ReviewItem) : item
  );
}

export function InboxReviewPanel({
  items,
  onChange,
  onBack,
  onApprove,
  isPending,
}: InboxReviewPanelProps) {
  const selectedCount = useMemo(() => countSelectedItems(items), [items]);

  const grouped = useMemo(
    () => ({
      project: items.filter((item) => item.type === "project"),
      contact: items.filter((item) => item.type === "contact"),
      task: items.filter((item) => item.type === "task"),
      followUp: items.filter((item) => item.type === "followUp"),
    }),
    [items]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Review extracted items</h3>
          <p className="text-sm text-muted-foreground">
            Edit fields and uncheck anything you do not want to create.
          </p>
        </div>
        <Badge variant="secondary">{selectedCount} selected</Badge>
      </div>

      {grouped.project.length > 0 && (
        <ReviewSection title="Projects">
          {grouped.project.map((item) => (
            <ReviewCard
              key={item.id}
              selected={item.selected}
              onToggle={(selected) => onChange(updateItem(items, item.id, { selected }))}
            >
              <Field label="Name">
                <Input
                  value={item.name}
                  onChange={(event) =>
                    onChange(updateItem(items, item.id, { name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Area">
                <Input
                  value={item.areaName ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateItem(items, item.id, {
                        areaName: event.target.value || null,
                      })
                    )
                  }
                />
              </Field>
            </ReviewCard>
          ))}
        </ReviewSection>
      )}

      {grouped.contact.length > 0 && (
        <ReviewSection title="Contacts">
          {grouped.contact.map((item) => (
            <ReviewCard
              key={item.id}
              selected={item.selected}
              onToggle={(selected) => onChange(updateItem(items, item.id, { selected }))}
            >
              <Field label="Name">
                <Input
                  value={item.name}
                  onChange={(event) =>
                    onChange(updateItem(items, item.id, { name: event.target.value }))
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input
                    value={item.email ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, {
                          email: event.target.value || null,
                        })
                      )
                    }
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={item.company ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, {
                          company: event.target.value || null,
                        })
                      )
                    }
                  />
                </Field>
              </div>
            </ReviewCard>
          ))}
        </ReviewSection>
      )}

      {grouped.task.length > 0 && (
        <ReviewSection title="Tasks">
          {grouped.task.map((item) => (
            <ReviewCard
              key={item.id}
              selected={item.selected}
              onToggle={(selected) => onChange(updateItem(items, item.id, { selected }))}
            >
              <Field label="Title">
                <Input
                  value={item.title}
                  onChange={(event) =>
                    onChange(updateItem(items, item.id, { title: event.target.value }))
                  }
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={item.description ?? ""}
                  rows={2}
                  onChange={(event) =>
                    onChange(
                      updateItem(items, item.id, {
                        description: event.target.value || null,
                      })
                    )
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Due date">
                  <Input
                    value={item.dueAt ?? ""}
                    placeholder="YYYY-MM-DD"
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, {
                          dueAt: event.target.value || null,
                        })
                      )
                    }
                  />
                </Field>
                <Field label="Project">
                  <Input
                    value={item.projectName ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, {
                          projectName: event.target.value || null,
                        })
                      )
                    }
                  />
                </Field>
              </div>
            </ReviewCard>
          ))}
        </ReviewSection>
      )}

      {grouped.followUp.length > 0 && (
        <ReviewSection title="Follow-ups">
          {grouped.followUp.map((item) => (
            <ReviewCard
              key={item.id}
              selected={item.selected}
              onToggle={(selected) => onChange(updateItem(items, item.id, { selected }))}
            >
              <Field label="Title">
                <Input
                  value={item.title}
                  onChange={(event) =>
                    onChange(updateItem(items, item.id, { title: event.target.value }))
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Follow-up date">
                  <Input
                    value={item.followUpAt}
                    placeholder="YYYY-MM-DD"
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, { followUpAt: event.target.value })
                      )
                    }
                  />
                </Field>
                <Field label="Contact">
                  <Input
                    value={item.contactName ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateItem(items, item.id, {
                          contactName: event.target.value || null,
                        })
                      )
                    }
                  />
                </Field>
              </div>
            </ReviewCard>
          ))}
        </ReviewSection>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onApprove}
          disabled={isPending || selectedCount === 0}
        >
          {isPending ? "Creating…" : `Create ${selectedCount} selected`}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ReviewCard({
  selected,
  onToggle,
  children,
}: {
  selected: boolean;
  onToggle: (selected: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Checkbox checked={selected} onCheckedChange={(value) => onToggle(value === true)} />
        <span className="text-xs text-muted-foreground">
          {selected ? "Include" : "Skip"}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
