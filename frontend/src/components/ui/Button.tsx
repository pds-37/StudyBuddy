import { type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "sm" | "icon";
  variant?: "primary" | "secondary" | "ghost";
};

/** Provides the base button style used by scaffold pages. */
export function Button({
  className,
  size = "default",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const sizeClassName =
    size === "sm"
      ? "px-4 py-2 text-sm"
      : size === "icon"
        ? "h-11 w-11 p-0"
        : "px-5 py-3 text-sm";
  const variantClassName =
    variant === "secondary"
      ? "bg-white/[0.06] text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/[0.1]"
      : variant === "ghost"
        ? "bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-slate-900 dark:text-slate-900 dark:text-white"
        : "bg-gradient-to-r from-brand via-violet-500 to-cyan text-slate-900 dark:text-slate-900 dark:text-white hover:scale-[1.01]";

  return (
    <button
      type={type}
      className={cn(
        "rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName,
        sizeClassName,
        className
      )}
      {...props}
    />
  );
}
