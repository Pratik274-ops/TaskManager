import { PRIORITIES, STATUSES, type TaskPriority, type TaskStatus } from "@/lib/task-types";
import { cn } from "@/lib/utils";

export function PriorityTag({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const meta = PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[0]!;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <Icon className={cn("size-3.5 shrink-0", meta.className)} />
      <span className={priority === "none" ? "text-muted-foreground" : "text-foreground"}>
        {meta.label}
      </span>
    </span>
  );
}

export function StatusTag({ status, className }: { status: TaskStatus; className?: string }) {
  const meta = STATUSES.find((s) => s.value === status) ?? STATUSES[1]!;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <Icon className={cn("size-3.5 shrink-0", meta.className)} />
      <span className="text-foreground">{meta.label}</span>
    </span>
  );
}

export function LabelChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}
