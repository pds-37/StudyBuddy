import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";
import type { ToastState } from "@/lib/types";

type ToastProps = {
  toast: ToastState | null;
};

export const Toast = ({ toast }: ToastProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: toast ? 0 : 40,
        duration: 220,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: toast ? 1 : 0,
        duration: 220,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, toast, translateY]);

  if (!toast) {
    return null;
  }

  const toneColor =
    toast.tone === "success"
      ? theme.colors.success
      : toast.tone === "warning"
        ? theme.colors.warning
        : toast.tone === "danger"
          ? theme.colors.danger
          : theme.colors.textPrimary;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: theme.colors.surface,
            borderColor: alpha(toneColor, 0.2)
          }
        ]}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: toneColor
            }
          ]}
        />
        <Text style={[styles.text, { color: theme.colors.textPrimary }]}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 30,
    alignItems: "center",
    zIndex: 50
  },
  toast: {
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  text: {
    fontSize: 13,
    fontWeight: "500"
  }
});

export default Toast;
