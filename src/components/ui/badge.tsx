import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/[0.05] text-foreground/90",
        outline:
          "border-white/15 bg-transparent text-muted-foreground",
        success:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        warning:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
        danger:
          "border-red-400/20 bg-red-400/10 text-red-300",
        info: "border-sky-400/20 bg-sky-400/10 text-sky-300",
        muted: "border-white/[0.06] bg-white/[0.02] text-muted-foreground",
        elite:
          "border-white/20 bg-gradient-to-b from-white/15 to-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        owner:
          "border-amber-300/30 bg-gradient-to-b from-amber-300/20 to-amber-400/5 text-amber-100 shadow-[inset_0_1px_0_rgba(252,211,77,0.18)]",
        coowner:
          "border-zinc-200/25 bg-gradient-to-b from-zinc-100/15 to-zinc-300/5 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        devs:
          "border-sky-400/25 bg-gradient-to-b from-sky-400/15 to-sky-500/5 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.15)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
