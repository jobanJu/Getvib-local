import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-white/8 px-4 text-sm text-white outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
