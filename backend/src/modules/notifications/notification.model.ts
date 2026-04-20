import mongoose from "mongoose";
import type { AppNotification } from "@studybuddy/shared";

export type NotificationDocument = Omit<AppNotification, "id"> & mongoose.Document;

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  read: { type: Boolean, default: false },
  link: { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);
