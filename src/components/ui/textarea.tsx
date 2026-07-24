import * as React from "react";
import { cn } from "@/lib/utils";

const INSET = "inset 3px 3px 8px rgba(45,74,43,0.12), inset -2px -2px 6px rgba(255,255,255,0.72)";
const INSET_FOCUS =
  "inset 3px 3px 10px rgba(45,74,43,0.16), inset -2px -2px 6px rgba(255,255,255,0.72), 0 0 0 2px rgba(156,181,110,0.4)";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, style, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <textarea
        className={cn(
          "flex min-h-24 w-full px-4 py-3 text-sm transition-shadow duration-200 resize-y",
          "placeholder:text-[#9BAF92]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={{
          background: "#EFF4E7",
          borderRadius: 16,
          border: "none",
          color: "#2A3324",
          outline: "none",
          boxShadow: focused ? INSET_FOCUS : INSET,
          ...style,
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
