import { Platform } from "react-native";

export const DESKTOP_BREAKPOINT = 1024;
export const DESKTOP_CONTENT_WIDTH = 1080;

export const getIsDesktopLayout = (width: number) =>
  Platform.OS === "web" && width >= DESKTOP_BREAKPOINT;
