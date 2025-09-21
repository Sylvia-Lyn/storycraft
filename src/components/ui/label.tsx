import * as React from "react";

import { cn } from "./utils";

function Label({ children, className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export { Label };
