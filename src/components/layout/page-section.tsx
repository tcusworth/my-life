import { cn } from "@/lib/utils";
import { H2 } from "@/components/ui/typography";

interface PageSectionProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: PageSectionProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            {title && <H2>{title}</H2>}
            {description && (
              <div className="type-small text-muted-foreground">
                {description}
              </div>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {children}
    </section>
  );
}