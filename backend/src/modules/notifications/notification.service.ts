import { NotificationModel, type NotificationDocument } from "./notification.model.js";
import { ApiError } from "../../utils/api-error.js";
import type { AppNotification } from "@studybuddy/shared";

function toNotification(doc: NotificationDocument): AppNotification {
  return doc.toJSON() as unknown as AppNotification;
}

async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
  return notifications.map(toNotification);
}

async function getUnreadCount(userId: string): Promise<number> {
  return await NotificationModel.countDocuments({ userId, read: false });
}

async function markAsRead(userId: string, notificationId: string): Promise<AppNotification> {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  return toNotification(notification);
}

async function markAllAsRead(userId: string): Promise<void> {
  await NotificationModel.updateMany({ userId, read: false }, { read: true });
}

async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
): Promise<AppNotification> {
  const notification = await NotificationModel.create({
    userId,
    title,
    message,
    type,
    link,
    read: false
  });
  return toNotification(notification);
}

export const notificationService = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification
};
