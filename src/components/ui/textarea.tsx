import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70",
          "focus-visible:outline-none focus-visible:border-white/30 focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-white/10",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
