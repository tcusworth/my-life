import { cn } from "@/lib/utils";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-empty flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3 text-muted-foreground/60">{icon}</div>
      )}
      <H3 className="text-foreground/90">{title}</H3>
      <Small className="mt-1 max-w-sm text-muted-foreground">{description}</Small>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
