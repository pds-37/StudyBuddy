const shortWeekday = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const shortDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short"
});
const monthDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short"
});
const timeOnly = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit"
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto"
});

export const nowIso = () => new Date().toISOString();

export const createId = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

export const addDays = (date: Date | string, amount: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
};

export const addHours = (date: Date | string, amount: number) => {
  const value = new Date(date);
  value.setHours(value.getHours() + amount);
  return value;
};

export const startOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const isSameDay = (left: Date | string, right: Date | string) =>
  startOfDay(left).getTime() === startOfDay(right).getTime();

export const isToday = (value: Date | string) => isSameDay(value, new Date());

export const isTomorrow = (value: Date | string) => isSameDay(value, addDays(new Date(), 1));

export const isYesterday = (value: Date | string) => isSameDay(value, addDays(new Date(), -1));

export const getLastSevenDays = () =>
  Array.from({ length: 7 }, (_, index) => addDays(new Date(), index - 6));

export const formatDayPill = (value: Date | string) => {
  const date = new Date(value);
  return `${shortWeekday.format(date)} ${date.getDate()}`;
};

export const formatDateOnly = (value: Date | string) => {
  const date = new Date(value);
  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return shortDate.format(date);
};

export const formatTimeOnly = (value: Date | string) => timeOnly.format(new Date(value));

export const formatRelativeDateTime = (value: Date | string) => {
  const date = new Date(value);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);

  if (absSeconds < 45) {
    return "Just now";
  }

  const minutes = Math.round(diffMs / (1000 * 60));
  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, "minute");
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, "hour");
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days === -1) {
    return "Yesterday";
  }

  if (days === 1) {
    return "Tomorrow";
  }

  if (Math.abs(days) < 7) {
    return relativeFormatter.format(days, "day");
  }

  return shortDate.format(date);
};

export const formatReminderDateLabel = (value: Date | string) => {
  const date = new Date(value);
  if (isToday(date)) {
    return `Today • ${formatTimeOnly(date)}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow • ${formatTimeOnly(date)}`;
  }

  return `${monthDate.format(date)} • ${formatTimeOnly(date)}`;
};

export const groupDateLabel = (value: Date | string) => {
  const date = new Date(value);
  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  return shortDate.format(date);
};

export const firstSixtyCharacters = (input: string) =>
  input.length <= 60 ? input : `${input.slice(0, 57).trimEnd()}...`;

export const sortByNewest = <T extends { createdAt?: string; scheduledAt?: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    const leftValue = new Date(left.createdAt ?? left.scheduledAt ?? 0).getTime();
    const rightValue = new Date(right.createdAt ?? right.scheduledAt ?? 0).getTime();
    return rightValue - leftValue;
  });
