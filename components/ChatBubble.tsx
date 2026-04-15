import { memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";
import { formatRelativeDateTime } from "@/lib/date";
import type { ChatMessage } from "@/lib/types";

type ChatBubbleProps = {
  message: ChatMessage;
};

export const ChatBubble = memo(({ message }: ChatBubbleProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View
        style={[
          styles.bubble,
          {
            alignSelf: isUser ? "flex-end" : "flex-start",
            backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
            borderColor: isUser ? alpha(theme.colors.primary, 0.4) : theme.colors.border
          }
        ]}
      >
        <Text style={[styles.text, { color: isUser ? "#FFFFFF" : theme.colors.textPrimary }]}>
          {message.content}
        </Text>
        <Text
          style={[
            styles.caption,
            { color: isUser ? alpha("#FFFFFF", 0.72) : theme.colors.textSecondary }
          ]}
        >
          {formatRelativeDateTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginBottom: 12
  },
  userRow: {
    alignItems: "flex-end"
  },
  assistantRow: {
    alignItems: "flex-start"
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  text: {
    fontSize: 14,
    lineHeight: 22
  },
  caption: {
    fontSize: 11
  }
});

export default ChatBubble;
