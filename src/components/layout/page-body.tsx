import { cn } from "@/lib/utils";

interface PageBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PageBody({ children, className }: PageBodyProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-6 px-[var(--spacing-page-x)] pb-[var(--spacing-page-y)] pt-2 max-md:px-4 max-md:pb-4",
        className
      )}
    >
      {children}
    </div>
  );
}
