import { NotificationModel, type NotificationDocument } from "./notification.model.js";
import { UserModel } from "../users/user.model.js";
import { sendPushNotification } from "../../utils/push.js";
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

  // Also send push notification if user has subscriptions
  void sendPushToUser(userId, title, message);

  return toNotification(notification);
}

async function registerSubscription(userId: string, subscription: any) {
  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { pushSubscriptions: subscription }
  });
}

async function sendPushToUser(userId: string, title: string, body: string) {
  const user = await UserModel.findById(userId);
  if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

  const results = await Promise.allSettled(
    user.pushSubscriptions.map(sub => sendPushNotification(sub, { title, body }))
  );

  // Clean up failed subscriptions
  const failedIndices = results
    .map((res, i) => (res.status === "rejected" ? i : -1))
    .filter(i => i !== -1);

  if (failedIndices.length > 0) {
    const newSubscriptions = user.pushSubscriptions.filter((_, i) => !failedIndices.includes(i));
    await UserModel.findByIdAndUpdate(userId, { pushSubscriptions: newSubscriptions });
  }
}

export const notificationService = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  registerSubscription,
  sendPushToUser
};
