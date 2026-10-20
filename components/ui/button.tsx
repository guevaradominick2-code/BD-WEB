import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--champagne)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--burgundy)] px-6 py-3 text-white shadow-[0_12px_30px_rgba(90,38,54,.25)] hover:-translate-y-0.5 hover:bg-[#713348]",
        secondary:
          "border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-2.5 text-[var(--ink)] backdrop-blur hover:bg-[color:var(--surface-strong)]",
        ghost: "px-4 py-2 text-[var(--muted)] hover:bg-[color:var(--surface)] hover:text-[var(--ink)]",
        icon: "size-10 border border-[color:var(--line)] bg-[color:var(--surface)] text-[var(--ink)] hover:-translate-y-0.5",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 text-xs",
        lg: "min-h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
