import type { ComplaintPriority, ComplaintStatus } from "@/api/services/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ComplaintStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  ESCALATED: "bg-red-100 text-red-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

const priorityStyles: Record<ComplaintPriority, string> = {
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-info/10 text-info border-info/30",
  HIGH: "bg-warning/15 text-[oklch(0.45_0.15_75)] border-warning/40",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusChip({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: ComplaintPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}
