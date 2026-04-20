import { apiClient } from "./client";
import type { AppNotification } from "@studybuddy/shared";

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>("/notifications");
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/notifications/unread");
  return data.count;
}

export async function markNotificationAsRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.post("/notifications/read-all");
}
