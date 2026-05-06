import React from "react";
import { cn } from "../../lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm rounded-lg",
    md: "w-10 h-10 text-lg rounded-xl",
    lg: "w-16 h-16 text-2xl rounded-2xl",
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center font-black text-white group",
      sizeClasses[size],
      className
    )}>
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-brand to-cyan opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
      
      {/* Main Container */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-brand to-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] overflow-hidden">
        {/* Shine Effect */}
        <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      {/* Symbol */}
      <span className="relative z-10 drop-shadow-md">S</span>
    </div>
  );
}
