import { cn } from "@/lib/utils";

type TypographyProps = React.ComponentProps<"p"> & {
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3";
};

export function H1({ className, as: Tag = "h1", ...props }: TypographyProps) {
  return <Tag className={cn("type-h1", className)} {...props} />;
}

export function H2({ className, as: Tag = "h2", ...props }: TypographyProps) {
  return <Tag className={cn("type-h2", className)} {...props} />;
}

export function H3({ className, as: Tag = "h3", ...props }: TypographyProps) {
  return <Tag className={cn("type-h3", className)} {...props} />;
}

export function Body({ className, as: Tag = "p", ...props }: TypographyProps) {
  return <Tag className={cn("type-body", className)} {...props} />;
}

export function Small({ className, as: Tag = "p", ...props }: TypographyProps) {
  return <Tag className={cn("type-small", className)} {...props} />;
}

export function Micro({ className, as: Tag = "span", ...props }: TypographyProps) {
  return <Tag className={cn("type-micro", className)} {...props} />;
}
