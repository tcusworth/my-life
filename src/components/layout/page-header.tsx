"use client";

import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { H1 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
import type { User } from "@/types/pocketbase";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

function getUserInitials(user: User) {
  const fromName = user.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (fromName) return fromName;

  const fromEmail = user.email?.slice(0, 2).toUpperCase();
  if (fromEmail) return fromEmail;

  return "?";
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  const { user, isLoading, logout } = useAuth();
  const initials = !isLoading && user ? getUserInitials(user) : "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex shrink-0 items-center gap-4 border-b border-border bg-[var(--surface-page-bg)] px-[var(--spacing-page-x)] py-4 max-md:px-4",
        className
      )}
    >
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <H1 className="truncate">{title}</H1>
          {description && (
            <Small className="truncate text-muted-foreground">{description}</Small>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Avatar className="size-8">
                <AvatarImage src={user?.avatar} alt={user?.name ?? user?.email} />
                <AvatarFallback className="type-small bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="space-y-1">
                  <p className="type-h3">{user?.name ?? "Account"}</p>
                  <p className="type-small text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/** @deprecated Use PageHeader */
export const AppHeader = PageHeader;
