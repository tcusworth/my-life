import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  width?: "default" | "narrow" | "full";
  className?: string;
}

const widthClasses = {
  default: "max-w-[var(--width-content)]",
  narrow: "max-w-[var(--width-content-narrow)]",
  full: "max-w-none",
};

export function PageShell({
  children,
  width = "default",
  className,
}: PageShellProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col px-8 py-8", className)}>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col gap-8",
          widthClasses[width]
        )}
      >
        {children}
      </div>
    </div>
  );
}