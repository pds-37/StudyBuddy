import { useEffect, useMemo } from "react";
import { Platform, useColorScheme } from "react-native";

import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as Notifications from "expo-notifications";

import ConfettiAnimation from "@/components/ConfettiAnimation";
import NoteModal from "@/components/NoteModal";
import Toast from "@/components/Toast";
import { getTheme } from "@/constants/theme";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { addNotificationResponseListener } from "@/lib/notifications";
import { getInitialQuickActionTarget, subscribeToQuickActions } from "@/lib/quickActions";

const AppShell = () => {
  const router = useRouter();
  const {
    toast,
    isConfettiVisible,
    noteModal,
    openNoteComposer,
    closeNoteComposer,
    saveNote,
    setHighlightedReminderId
  } = useAppContext();

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      const withModifier = event.ctrlKey || event.metaKey;
      if (!withModifier) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "n") {
        event.preventDefault();
        router.push("/");
        openNoteComposer();
      }

      if (key === "k") {
        event.preventDefault();
        router.push("/buddy");
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [openNoteComposer, router]);

  useEffect(() => {
    const handleQuickAction = (target: "new_note" | "ask_buddy" | "roadmap") => {
      if (target === "new_note") {
        router.push("/");
        setTimeout(() => openNoteComposer(), 150);
        return;
      }

      if (target === "ask_buddy") {
        router.push("/buddy");
        return;
      }

      router.push("/roadmap");
    };

    const initialQuickAction = getInitialQuickActionTarget();
    if (initialQuickAction) {
      handleQuickAction(initialQuickAction);
    }

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        const data = response?.notification.request.content.data ?? {};
        const reminderId = typeof data.reminderId === "string" ? data.reminderId : null;
        if (reminderId) {
          setHighlightedReminderId(reminderId);
          router.push("/reminders");
        }
      })
      .catch(() => undefined);

    const quickActionSubscription = subscribeToQuickActions(handleQuickAction);
    const notificationSubscription = addNotificationResponseListener(({ reminderId }) => {
      setHighlightedReminderId(reminderId);
      router.push("/reminders");
    });

    return () => {
      quickActionSubscription.remove();
      notificationSubscription.remove();
    };
  }, [openNoteComposer, router, setHighlightedReminderId]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <NoteModal
        visible={noteModal.visible}
        note={noteModal.note}
        initialSubject={noteModal.selectedSubject}
        suggestedTopic={noteModal.suggestedTopic}
        onClose={closeNoteComposer}
        onSave={async (input) => {
          await saveNote(input);
        }}
      />
      <ConfettiAnimation visible={isConfettiVisible} />
      <Toast toast={toast} />
    </>
  );
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => undefined);
  }, [theme.colors.background]);

  return (
    <AppProvider>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <AppShell />
    </AppProvider>
  );
}
