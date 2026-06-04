import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-court-blue disabled:opacity-50",
        variant === "primary" && "bg-court-blue text-white hover:bg-blue-700",
        variant === "secondary" && "bg-court-green text-white hover:bg-emerald-700",
        variant === "ghost" && "border border-border bg-white/70 hover:bg-muted dark:bg-white/5",
        className
      )}
      {...props}
    />
  );
}
