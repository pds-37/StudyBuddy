import { Platform } from "react-native";

import * as QuickActions from "expo-quick-actions";

export type QuickActionTarget = "new_note" | "ask_buddy" | "roadmap";

const items = [
  {
    id: "new_note",
    title: "New Note",
    icon: Platform.OS === "ios" ? "compose" : "study_compose",
    params: { target: "new_note" as QuickActionTarget, href: "/" }
  },
  {
    id: "ask_buddy",
    title: "Ask Buddy",
    icon: Platform.OS === "ios" ? "search" : "study_search",
    params: { target: "ask_buddy" as QuickActionTarget, href: "/buddy" }
  },
  {
    id: "roadmap",
    title: "My Roadmap",
    icon: Platform.OS === "ios" ? "bookmark" : "study_bookmark",
    params: { target: "roadmap" as QuickActionTarget, href: "/roadmap" }
  }
];

export const configureQuickActions = async () => {
  try {
    const isSupported = await QuickActions.isSupported();
    if (!isSupported) {
      return;
    }

    await QuickActions.setItems(items);
  } catch {
    // Quick actions are optional outside development builds.
  }
};

export const getInitialQuickActionTarget = (): QuickActionTarget | null => {
  const target = QuickActions.initial?.params?.target;
  return target === "new_note" || target === "ask_buddy" || target === "roadmap" ? target : null;
};

export const subscribeToQuickActions = (callback: (target: QuickActionTarget) => void) => {
  try {
    return QuickActions.addListener((payload) => {
      const target = payload.params?.target;
      if (target === "new_note" || target === "ask_buddy" || target === "roadmap") {
        callback(target);
      }
    });
  } catch {
    return {
      remove: () => undefined
    };
  }
};
