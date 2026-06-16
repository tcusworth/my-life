import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12 lg:gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardGridItemProps {
  children: React.ReactNode;
  span?: 4 | 6 | 8 | 12;
  className?: string;
}

const spanClasses = {
  4: "md:col-span-3 lg:col-span-4",
  6: "md:col-span-3 lg:col-span-6",
  8: "md:col-span-6 lg:col-span-8",
  12: "md:col-span-6 lg:col-span-12",
};

export function DashboardGridItem({
  children,
  span = 4,
  className,
}: DashboardGridItemProps) {
  return (
    <div className={cn(spanClasses[span], className)}>{children}</div>
  );
}
