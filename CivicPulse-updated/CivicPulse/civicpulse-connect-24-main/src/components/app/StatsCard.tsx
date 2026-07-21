import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap: Record<string, string> = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-rose-500/10 text-rose-600",
    info: "bg-blue-500/10 text-blue-600",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>

        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>

      {icon && (
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", toneMap[tone])}>
          {icon}
        </div>
      )}
    </div>
  );
}
