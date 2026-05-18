import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-paper-2 text-ink",
  accent:  "bg-claret-soft text-claret-ink",
  success: "bg-ok-soft text-ok",
  warning: "bg-warn-soft text-warn",
  danger:  "bg-alarm-soft text-alarm",
  neutral: "bg-paper-2 text-ink-mute",
  /* `purple` kept for API stability with case-utils consumers; reads as neutral. */
  purple:  "bg-paper-2 text-ink-mute",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
