import type { ColorSchemeName, TextStyle, ViewStyle } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const radius = {
  card: 8,
  button: 6,
  pill: 20
} as const;

const lightColors = {
  background: "#F7F7F5",
  surface: "#FFFFFF",
  primary: "#6C63FF",
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
  heading: "#888888",
  border: "#E8E8E8",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444"
};

const darkColors = {
  background: "#111111",
  surface: "#1E1E1E",
  primary: "#8B85FF",
  textPrimary: "#F0F0F0",
  textSecondary: "#999999",
  heading: "#888888",
  border: "#2E2E2E",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444"
};

export const typography = {
  screenTitle: {
    fontSize: 16,
    fontWeight: "600"
  } satisfies TextStyle,
  sectionHeading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8
  } satisfies TextStyle,
  body: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22
  } satisfies TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: "400"
  } satisfies TextStyle,
  button: {
    fontSize: 13,
    fontWeight: "500"
  } satisfies TextStyle,
  tabLabel: {
    fontSize: 10,
    fontWeight: "500"
  } satisfies TextStyle
};

export const shadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 2
  },
  elevation: 2
} satisfies ViewStyle;

export const subjectPresets = [
  "DSA",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "Custom..."
] as const;

export const getTheme = (scheme: ColorSchemeName) => {
  const colors = scheme === "dark" ? darkColors : lightColors;

  return {
    colors,
    spacing,
    radius,
    typography,
    shadow
  };
};

export type AppTheme = ReturnType<typeof getTheme>;

export const alpha = (hex: string, opacity: number) => {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3
    ? clean
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : clean;

  const alphaValue = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${normalized}${alphaValue}`;
};
