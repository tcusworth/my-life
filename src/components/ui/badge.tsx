import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center justify-center rounded px-1.5 type-micro normal-case tracking-normal whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-foreground/8 text-foreground",
        secondary: "bg-muted text-muted-foreground",
        outline: "border border-border text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

function Badge({
  className,
  variant = "secondary",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
