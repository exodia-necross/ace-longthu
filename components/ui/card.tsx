import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-white/[0.88] p-5 shadow-sm backdrop-blur dark:bg-white/[0.06]", className)} {...props} />;
}
