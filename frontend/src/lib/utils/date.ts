/** Utility for premium date and time formatting across the app. */

/** Returns a relative time string (e.g. "2 minutes ago", "Tomorrow"). */
export function formatRelativeTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Future dates
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return "Starting now";
    if (absDiff < 3600) return `In ${Math.floor(absDiff / 60)}m`;
    if (absDiff < 86400) return `In ${Math.floor(absDiff / 3600)}h`;
    
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Past dates
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  if (date.toDateString() === now.toDateString()) return "Today";
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Formats a timestamp into a compact clock format (e.g. "11:45 PM"). */
export function formatTime(dateInput: string | Date | number): string {
  return new Date(dateInput).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** Formats a date for lists and headers (e.g. "May 3"). */
export function formatDate(dateInput: string | Date | number): string {
  return new Date(dateInput).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}
