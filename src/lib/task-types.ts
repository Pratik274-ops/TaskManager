import {
  AlertTriangle,
  ArrowUp,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Equal,
  Minus,
  type LucideIcon,
} from "lucide-react";

export type TaskStatus = "backlog" | "todo" | "doing" | "completed";
export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  parent_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  labels: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
}

interface StatusMeta {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
  className: string;
}

export const STATUSES: StatusMeta[] = [
  { value: "backlog", label: "Backlog", icon: CircleDashed, className: "text-status-backlog" },
  { value: "todo", label: "To Do", icon: Circle, className: "text-status-todo" },
  { value: "doing", label: "Doing", icon: CircleDot, className: "text-status-doing" },
  { value: "completed", label: "Completed", icon: CircleCheck, className: "text-status-completed" },
];

interface PriorityMeta {
  value: TaskPriority;
  label: string;
  icon: LucideIcon;
  className: string;
}

export const PRIORITIES: PriorityMeta[] = [
  { value: "none", label: "No priority", icon: Minus, className: "text-priority-none" },
  { value: "low", label: "Low", icon: Equal, className: "text-priority-low" },
  { value: "medium", label: "Medium", icon: Equal, className: "text-priority-medium" },
  { value: "high", label: "High", icon: ArrowUp, className: "text-priority-high" },
  { value: "urgent", label: "Urgent", icon: AlertTriangle, className: "text-priority-urgent" },
];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

export function statusMeta(status: TaskStatus): StatusMeta {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[1]!;
}

export function priorityMeta(priority: TaskPriority): PriorityMeta {
  return PRIORITIES.find((p) => p.value === priority) ?? PRIORITIES[0]!;
}

export const FIELD_KEYS = ["priority", "dueDate", "labels", "status"] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
  priority: "Priority",
  dueDate: "Due Date",
  labels: "Labels",
  status: "Status",
};

export function formatDueDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
