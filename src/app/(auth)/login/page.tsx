"use client";

import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="surface-page flex min-h-full flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-foreground text-background">
            <span className="type-micro text-background normal-case tracking-normal">ML</span>
          </div>
          <H1 className="text-center">My Life</H1>
          <Small className="block text-center text-muted-foreground">
            Personal AI productivity — tasks, calendar, and focus in one place.
          </Small>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isLoading}
          onClick={() => void login()}
        >
          Continue with Google
        </Button>

        <Small className="block text-center text-muted-foreground">
          Sign in with the Google account linked to your PocketBase instance.
        </Small>
      </div>
    </div>
  );
}
