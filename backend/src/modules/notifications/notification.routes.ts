import { Router } from "express";
import { authenticate as requireAuth } from "../../middlewares/authenticate.js";
import * as notificationController from "./notification.controller.js";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", notificationController.getNotifications);
notificationRouter.get("/unread", notificationController.getUnreadCount);
notificationRouter.patch("/:id/read", notificationController.markAsRead);
notificationRouter.post("/read-all", notificationController.markAllAsRead);
notificationRouter.post("/subscribe", notificationController.registerPushSubscription);
