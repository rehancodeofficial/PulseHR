import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-3 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          "text-[#FAFAF7]",
        secondary:
          "text-[#2A3324]",
        destructive:
          "text-[#FAFAF7]",
        outline:
          "text-[#5C7A45]",
        success:
          "text-[#FAFAF7]",
        warning:
          "text-[#2A3324]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  default: {
    background: "linear-gradient(145deg, #9CB56E, #5C7A45)",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 6px rgba(45,74,43,0.2), -1px -1px 4px rgba(255,255,255,0.6)",
  },
  secondary: {
    background: "#EFF4E7",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 5px rgba(45,74,43,0.1), -1px -1px 3px rgba(255,255,255,0.65)",
  },
  destructive: {
    background: "linear-gradient(145deg, #C17A64, #A15A44)",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 6px rgba(193,122,100,0.25), -1px -1px 4px rgba(255,255,255,0.6)",
  },
  outline: {
    background: "#FAFAF7",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 5px rgba(45,74,43,0.1), -1px -1px 3px rgba(255,255,255,0.65)",
  },
  success: {
    background: "linear-gradient(145deg, #8CAE72, #5E7E46)",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 6px rgba(45,74,43,0.2), -1px -1px 4px rgba(255,255,255,0.6)",
  },
  warning: {
    background: "linear-gradient(145deg, #D4AE72, #B8924C)",
    borderRadius: 20,
    border: "none",
    boxShadow: "2px 2px 6px rgba(184,146,76,0.25), -1px -1px 4px rgba(255,255,255,0.6)",
  },
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...BADGE_STYLES[variant ?? "default"], ...style }}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
