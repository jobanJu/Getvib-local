import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full resize-y rounded-xl border border-foreground/20 bg-card-soft px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-gray-500 focus:border-accent focus:ring-4 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
