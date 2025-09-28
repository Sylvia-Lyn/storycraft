import * as React from "react";

import { cn } from "./utils";

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) {
  const context = React.useContext(TooltipContext);
  const setOpen = context?.setOpen;
  
  const handleMouseEnter = () => {
    setOpen?.(true);
  };
  
  const handleMouseLeave = () => {
    setOpen?.(false);
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    } as any);
  }
  
  return (
    <span 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </span>
  );
}

function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(TooltipContext);
  const open = context?.open || false;
  
  if (!open) return null;
  
  return (
    <div
      className={cn(
        "absolute z-[9999] w-80 max-w-sm rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-xl border border-gray-600",
        "left-1/2 -translate-x-1/2 -translate-y-full mb-2",
        className,
      )}
      style={{
        position: 'absolute',
        top: '-10px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-100%)',
        zIndex: 9999,
      }}
    >
      <div className="relative">
        {children}
        {/* 箭头 */}
        <div 
          className="absolute left-1/2 top-full transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #111827'
          }}
        />
      </div>
    </div>
  );
}

// TooltipProvider 是一个简单的包装组件，实际上 Tooltip 已经包含了 Provider 功能
function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
