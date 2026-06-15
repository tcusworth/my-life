"use client";

import { useState, useTransition } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_AREAS } from "@/lib/seed/default-areas";
import { getErrorMessage } from "@/lib/errors/app-errors";
import { seedDefaultAreasAction } from "./actions";

export function SeedAreasForm() {
  const [result, setResult] = useState<{
    created: string[];
    skipped: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="size-4 text-primary" />
          Default areas
        </CardTitle>
        <CardDescription>
          Create the standard life/work areas for organizing projects. Existing
          areas with the same name are skipped.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {DEFAULT_AREAS.map((area) => (
            <li
              key={area}
              className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              {area}
            </li>
          ))}
        </ul>

        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            setResult(null);
            startTransition(async () => {
              try {
                const seedResult = await seedDefaultAreasAction();
                setResult(seedResult);
              } catch (err) {
                setError(getErrorMessage(err));
              }
            });
          }}
        >
          {isPending ? "Seeding…" : "Seed default areas"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            {result.created.length > 0 && (
              <p>Created: {result.created.join(", ")}</p>
            )}
            {result.skipped.length > 0 && (
              <p className="text-muted-foreground">
                Skipped (already exist): {result.skipped.join(", ")}
              </p>
            )}
            {result.created.length === 0 && result.skipped.length > 0 && (
              <p>All default areas already exist.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
