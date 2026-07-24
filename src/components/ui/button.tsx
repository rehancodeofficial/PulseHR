import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold cursor-pointer transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-[#FAFAF7] [--btn-bg:linear-gradient(145deg,#9CB56E_0%,#5C7A45_100%)] [--btn-shadow:4px_4px_12px_rgba(45,74,43,0.22),_-3px_-3px_8px_rgba(255,255,255,0.55),_inset_0_1px_0_rgba(255,255,255,0.25)] [--btn-shadow-hover:5px_5px_15px_rgba(45,74,43,0.28),_-3px_-3px_10px_rgba(255,255,255,0.6),_inset_0_1px_0_rgba(255,255,255,0.25)] [--btn-shadow-active:2px_2px_6px_rgba(45,74,43,0.2),_-1px_-1px_4px_rgba(255,255,255,0.45),_inset_1px_1px_4px_rgba(45,74,43,0.12)]",
        destructive:
          "text-[#FAFAF7] [--btn-bg:linear-gradient(145deg,#C17A64_0%,#A15A44_100%)] [--btn-shadow:4px_4px_12px_rgba(193,122,100,0.28),_-3px_-3px_8px_rgba(255,255,255,0.55),_inset_0_1px_0_rgba(255,255,255,0.2)] [--btn-shadow-hover:5px_5px_15px_rgba(193,122,100,0.35),_-3px_-3px_10px_rgba(255,255,255,0.6)] [--btn-shadow-active:2px_2px_6px_rgba(193,122,100,0.2),_inset_1px_1px_4px_rgba(193,122,100,0.15)]",
        outline:
          "text-[#5C7A45] [--btn-bg:#FAFAF7] [--btn-shadow:3px_3px_8px_rgba(45,74,43,0.1),_-2px_-2px_6px_rgba(255,255,255,0.65),_inset_0_1px_0_rgba(255,255,255,0.5)] [--btn-shadow-hover:4px_4px_10px_rgba(45,74,43,0.14),_-2px_-2px_8px_rgba(255,255,255,0.7)] [--btn-shadow-active:inset_2px_2px_5px_rgba(45,74,43,0.1),_inset_-1px_-1px_3px_rgba(255,255,255,0.5)]",
        secondary:
          "text-[#2A3324] [--btn-bg:#EFF4E7] [--btn-shadow:3px_3px_8px_rgba(45,74,43,0.1),_-2px_-2px_6px_rgba(255,255,255,0.65)] [--btn-shadow-hover:4px_4px_10px_rgba(45,74,43,0.14),_-2px_-2px_8px_rgba(255,255,255,0.7)] [--btn-shadow-active:inset_2px_2px_5px_rgba(45,74,43,0.1)]",
        ghost:
          "text-[#5C7A45] [--btn-bg:transparent] [--btn-shadow:none] [--btn-shadow-hover:inset_2px_2px_5px_rgba(45,74,43,0.08),_inset_-1px_-1px_4px_rgba(255,255,255,0.55)] [--btn-shadow-active:inset_3px_3px_6px_rgba(45,74,43,0.1)]",
        link: "text-[#5C7A45] underline-offset-4 hover:underline [--btn-bg:transparent] [--btn-shadow:none] [--btn-shadow-hover:none] [--btn-shadow-active:none]",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-2xl",
        sm: "h-8 px-3.5 text-xs rounded-xl",
        lg: "h-12 px-7 rounded-2xl text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          background: "var(--btn-bg)",
          boxShadow: "var(--btn-shadow)",
          border: "none",
          ...style,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = "var(--btn-shadow-hover)";
          el.style.transform = "translateY(-1px)";
          props.onMouseEnter?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = "var(--btn-shadow)";
          el.style.transform = "none";
          props.onMouseLeave?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = "var(--btn-shadow-active)";
          el.style.transform = "translateY(1px)";
          props.onMouseDown?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        onMouseUp={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = "var(--btn-shadow)";
          el.style.transform = "none";
          props.onMouseUp?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
