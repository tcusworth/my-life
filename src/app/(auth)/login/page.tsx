"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">My Life</h1>
          <p className="text-sm text-muted-foreground">
            Personal AI productivity — tasks, calendar, and focus in one place.
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isLoading}
          onClick={() => void login()}
        >
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground">
          Sign in with the Google account linked to your PocketBase instance.
        </p>
      </div>
    </div>
  );
}
