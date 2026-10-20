import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_24px_70px_rgba(74,37,50,.08)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
