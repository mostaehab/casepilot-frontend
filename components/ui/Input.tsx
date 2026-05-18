import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium tracking-[0.01em] text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "block h-10 w-full rounded-md border border-rule bg-page px-3 text-sm text-ink",
            "placeholder:text-ink-faint",
            "transition-[border-color,box-shadow] duration-150",
            "focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-alarm focus:border-alarm focus:shadow-[0_0_0_3px_var(--alarm-soft)]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[12px] text-ink-faint">{hint}</p>
        )}
        {error && <p className="text-[12px] text-alarm">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
