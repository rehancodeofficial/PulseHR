import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  active: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",
  present: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",
  approved: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",
  completed: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",
  done: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",
  available: "bg-[--color-success]/15 text-[--color-success] border-[--color-success]/30",

  pending: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  on_leave: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  late: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  half_day: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  probation: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  on_hold: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  review: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",
  maintenance: "bg-[--color-warning]/15 text-[--color-warning] border-[--color-warning]/30",

  absent: "bg-destructive/15 text-destructive border-destructive/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  terminated: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  retired: "bg-destructive/15 text-destructive border-destructive/30",

  planning: "bg-[--color-info]/15 text-[--color-info] border-[--color-info]/30",
  in_progress: "bg-[--color-info]/15 text-[--color-info] border-[--color-info]/30",
  active_project: "bg-[--color-info]/15 text-[--color-info] border-[--color-info]/30",
  assigned: "bg-[--color-info]/15 text-[--color-info] border-[--color-info]/30",
  leave: "bg-[--color-info]/15 text-[--color-info] border-[--color-info]/30",

  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-secondary/15 text-secondary border-secondary/30",
  low: "bg-muted text-muted-foreground border-border",
  todo: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  const v = variants[status] ?? "bg-muted text-muted-foreground border-border";
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant="outline" className={cn("capitalize font-medium border", v)}>
      {label}
    </Badge>
  );
}
