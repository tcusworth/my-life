import * as React from "react";
import { cn } from "@/lib/utils";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";

/**
 * Card surface variants (strict mapping):
 * - `default` → surface-card (standard content container)
 * - `panel`   → surface-panel (rare; prefer PageSection for section-level panels)
 *
 * Floating overlays are NOT Card variants — use surface-floating on overlay primitives.
 */
type CardVariant = "default" | "panel";

const variantClasses: Record<CardVariant, string> = {
  default: "surface-card surface-flush",
  panel: "surface-panel surface-flush",
};

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: CardVariant }) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(variantClasses[variant], "flex flex-col", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1 px-[var(--spacing-card)] pt-[var(--spacing-card)]",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <H3
      data-slot="card-title"
      as="div"
      className={className}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Small
      data-slot="card-description"
      as="div"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ml-auto shrink-0", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-[var(--spacing-card)] pb-[var(--spacing-card)]", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-border px-[var(--spacing-card)] py-3",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
