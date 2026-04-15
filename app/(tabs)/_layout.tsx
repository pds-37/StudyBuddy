import { useMemo } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { getTheme } from "@/constants/theme";
import { getIsDesktopLayout } from "@/lib/responsive";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isDesktop = getIsDesktopLayout(width);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarActiveBackgroundColor: isDesktop ? `${theme.colors.primary}14` : undefined,
        tabBarPosition: isDesktop ? "left" : "bottom",
        tabBarVariant: isDesktop ? "material" : "uikit",
        tabBarStyle: isDesktop
          ? {
              width: 232,
              backgroundColor: theme.colors.surface,
              borderRightColor: theme.colors.border,
              borderRightWidth: 1,
              paddingTop: 20
            }
          : {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border
            },
        tabBarItemStyle: isDesktop
          ? {
              marginHorizontal: 12,
              marginBottom: 6,
              borderRadius: 12
            }
          : undefined,
        tabBarLabelStyle: {
          fontSize: isDesktop ? 13 : 10,
          fontWeight: "500"
        },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === "index"
              ? "create-outline"
              : route.name === "library"
                ? "library-outline"
                : route.name === "buddy"
                  ? "chatbubble-ellipses-outline"
                  : route.name === "reminders"
                    ? "notifications-outline"
                    : "map-outline";

          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarHideOnKeyboard: !isDesktop
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Notes" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="buddy" options={{ title: "Ask Buddy" }} />
      <Tabs.Screen name="reminders" options={{ title: "Reminders" }} />
      <Tabs.Screen name="roadmap" options={{ title: "Roadmap" }} />
    </Tabs>
  );
}
