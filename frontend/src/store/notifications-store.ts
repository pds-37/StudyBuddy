import { create } from "zustand";
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api/notifications";
import type { AppNotification } from "@studybuddy/shared";

type NotificationsState = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: AppNotification) => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const notifications = await getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      // silently fail
    }
  },

  markAsRead: async (id: string) => {
    try {
      const updated = await markNotificationAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? updated : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {}
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead();
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {}
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));
