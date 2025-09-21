import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "resize-none border border-gray-300 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 bg-white flex min-h-16 w-full rounded-md px-3 py-2 text-base transition-[color,box-shadow] outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
