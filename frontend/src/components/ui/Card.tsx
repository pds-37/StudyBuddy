import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

/** Provides a reusable dark card container for placeholder screens. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-slate-200 dark:border-slate-200 dark:border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-glow backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
