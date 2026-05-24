import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/70",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:border-white/30 focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-white/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
