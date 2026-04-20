import type { Request, Response, NextFunction } from "express";
import { notificationService } from "./notification.service.js";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.userId!);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.userId!);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.userId!, String(req.params.id));
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.userId!);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
