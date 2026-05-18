import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "accent"
    | "secondary"
    | "outline"
    | "ghost"
    | "ghostLight"
    | "primaryInverse"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", fullWidth, className, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-[background-color,color,border-color,opacity] duration-150",
          "outline-none focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer select-none",
          variant === "primary" &&
            "bg-navy text-page hover:bg-navy-hover",
          variant === "accent" &&
            "bg-accent text-ink-strong hover:bg-accent-hover",
          variant === "secondary" &&
            "bg-navy-soft text-navy hover:bg-page-3",
          variant === "outline" &&
            "border border-rule-strong bg-page text-ink hover:bg-page-2",
          variant === "ghost" &&
            "text-ink-mute hover:bg-page-2 hover:text-ink",
          variant === "ghostLight" &&
            "text-ink-faint hover:bg-page-2 hover:text-ink",
          variant === "primaryInverse" &&
            "bg-ink-strong text-page hover:bg-ink",
          variant === "destructive" &&
            "bg-alarm text-page hover:opacity-90",
          size === "sm" && "h-8 px-3 text-[13px]",
          size === "md" && "h-9 px-4 text-sm",
          size === "lg" && "h-11 px-5 text-[15px]",
          size === "icon" && "h-9 w-9 p-0",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
