import * as Notifications from "expo-notifications";

import { firstSixtyCharacters } from "@/lib/date";
import type { Note, Reminder } from "@/lib/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export const requestNotificationPermissions = async () => {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const nextPermissions = await Notifications.requestPermissionsAsync();
  return nextPermissions.granted;
};

export const scheduleReminderNotification = async (reminder: Reminder, note?: Note | null) => {
  try {
    const scheduledDate = new Date(reminder.scheduledAt);
    if (scheduledDate.getTime() <= Date.now()) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to revise: ${note?.subject ?? reminder.subject ?? "Study Buddy"}`,
        body: firstSixtyCharacters(note?.summary ?? reminder.noteSummary ?? reminder.title),
        data: {
          noteId: reminder.noteId ?? note?.id ?? null,
          reminderId: reminder.id,
          screen: "reminders"
        }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledDate
      }
    });
  } catch {
    return null;
  }
};

export const cancelReminderNotification = async (identifier?: string | null) => {
  if (!identifier) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Safe no-op if the identifier does not exist anymore.
  }
};

export const resyncReminderNotifications = async (reminders: Reminder[], notes: Note[]) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore cancellation issues and try to rebuild whatever we can.
  }

  const noteMap = new Map(notes.map((note) => [note.id, note]));
  const pending = reminders.filter(
    (reminder) => !reminder.isReviewed && new Date(reminder.scheduledAt).getTime() > Date.now()
  );

  for (const reminder of pending) {
    await scheduleReminderNotification(reminder, reminder.noteId ? noteMap.get(reminder.noteId) ?? null : null);
  }
};

export const addNotificationResponseListener = (
  callback: (payload: { noteId: string | null; reminderId: string | null; screen?: string | null }) => void
) =>
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data ?? {};
    callback({
      noteId: typeof data.noteId === "string" ? data.noteId : null,
      reminderId: typeof data.reminderId === "string" ? data.reminderId : null,
      screen: typeof data.screen === "string" ? data.screen : null
    });
  });
