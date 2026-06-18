import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AppHeader({ title, description, actions }: Props) {
  return (
    <div className="surface-page flex flex-col gap-1 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}