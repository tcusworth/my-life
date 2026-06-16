import { cn } from "@/lib/utils";

export function DataTable({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("surface-card surface-flush overflow-hidden", className)}
      {...props}
    />
  );
}

export function DataTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("border-b border-border bg-muted/30", className)}
      {...props}
    />
  );
}

export function DataTableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function DataTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "bg-[var(--surface-card-bg)] transition-colors hover:bg-muted/20",
        className
      )}
      {...props}
    />
  );
}

export function DataTableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "type-micro px-4 py-3 text-left font-medium normal-case tracking-normal text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("type-body px-4 py-3 align-top text-foreground", className)}
      {...props}
    />
  );
}
