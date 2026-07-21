import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>

      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
