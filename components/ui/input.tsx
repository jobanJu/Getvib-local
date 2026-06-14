import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-foreground/20 bg-card-soft px-4 text-sm text-foreground outline-none transition placeholder:text-gray-500 focus:border-accent focus:ring-4 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
