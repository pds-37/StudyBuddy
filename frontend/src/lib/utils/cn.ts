import { clsx, type ClassValue } from "clsx";

/** Joins conditional class names for Tailwind components. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
