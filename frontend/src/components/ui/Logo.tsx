import React from "react";
import { cn } from "../../lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center group",
      sizeClasses[size],
      className
    )}>
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-[inherit] bg-brand opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
      
      {/* Image */}
      <img 
        src="/brand/studybuddy-logo.png" 
        alt="StudyBuddy" 
        className="relative z-10 w-full h-full object-cover rounded-[inherit]"
      />
    </div>
  );
}
