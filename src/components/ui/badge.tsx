import * as React from "react";

import { cn } from "./utils";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-800",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "text-gray-900 border-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors overflow-hidden",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
