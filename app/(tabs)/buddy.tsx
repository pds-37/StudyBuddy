import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ChatBubble from "@/components/ChatBubble";
import QuickPromptChips from "@/components/QuickPromptChips";
import { alpha, getTheme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { DESKTOP_CONTENT_WIDTH, getIsDesktopLayout } from "@/lib/responsive";

export default function BuddyScreen() {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isDesktop = getIsDesktopLayout(width);
  const {
    notes,
    chatMessages,
    askBuddyContextNote,
    sendBuddyMessage,
    openNoteComposer,
    clearChatSession
  } = useAppContext();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const latestNote = notes[0];
  const lastKeyConcept = latestNote?.keyConcepts?.[0] ?? "your latest concept";
  const prompts = [
    `Quiz me on ${latestNote?.subject ?? "my latest subject"}`,
    `Explain ${lastKeyConcept}`,
    "What should I study next?"
  ];

  const submitMessage = async (message: string) => {
    if (!message.trim() || isSending) {
      return;
    }

    setInput("");
    setIsSending(true);
    try {
      await sendBuddyMessage(message.trim());
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={[styles.shell, isDesktop && styles.shellDesktop]}>
          {isDesktop ? (
            <View
              style={[
                styles.desktopRail,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }
              ]}
            >
              <Text style={[styles.desktopRailTitle, { color: theme.colors.textPrimary }]}>Study Buddy</Text>
              <Text style={[styles.desktopRailText, { color: theme.colors.textSecondary }]}>
                Chat with your notes like a personal study workspace.
              </Text>
              <View style={[styles.countChip, { backgroundColor: alpha(theme.colors.primary, 0.1) }]}>
                <Text style={[styles.countText, { color: theme.colors.primary }]}>Based on {notes.length} notes</Text>
              </View>
              <QuickPromptChips prompts={prompts} onSelect={(prompt) => submitMessage(prompt)} />
              <View style={styles.desktopActionRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => clearChatSession()}
                  style={[
                    styles.desktopRailSecondaryButton,
                    {
                      backgroundColor: alpha(theme.colors.primary, 0.08),
                      borderColor: alpha(theme.colors.primary, 0.16)
                    }
                  ]}
                >
                  <Text style={[styles.desktopRailSecondaryButtonLabel, { color: theme.colors.primary }]}>New Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openNoteComposer()}
                  style={[styles.desktopRailButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.desktopRailButtonLabel}>New Note</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.desktopHint, { color: theme.colors.textSecondary }]}>
                Shortcut: Ctrl/Cmd + K opens chat, Ctrl/Cmd + N opens a note, Enter sends.
              </Text>
            </View>
          ) : null}

          <View style={[styles.chatPanel, isDesktop && styles.chatPanelDesktop]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Ask Buddy</Text>
              <View style={styles.headerActions}>
                {!isDesktop ? (
                  <View style={[styles.countChip, { backgroundColor: alpha(theme.colors.primary, 0.1) }]}>
                    <Text style={[styles.countText, { color: theme.colors.primary }]}>Based on {notes.length} notes</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => clearChatSession()}
                  style={[
                    styles.clearButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border
                    }
                  ]}
                >
                  <Text style={[styles.clearButtonLabel, { color: theme.colors.textSecondary }]}>New chat</Text>
                </TouchableOpacity>
              </View>
            </View>

            {askBuddyContextNote ? (
              <View
                style={[
                  styles.contextChip,
                  {
                    backgroundColor: alpha(theme.colors.primary, 0.08),
                    borderColor: alpha(theme.colors.primary, 0.16)
                  }
                ]}
              >
                <Text style={[styles.contextText, { color: theme.colors.primary }]}>
                  Focused on {askBuddyContextNote.subject} &gt; {askBuddyContextNote.category}
                </Text>
              </View>
            ) : null}

            <FlatList
              data={chatMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatBubble message={item} />}
              contentContainerStyle={[styles.chatContent, isDesktop && styles.chatContentDesktop]}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>Ask anything about your notes</Text>
                  <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                    Buddy answers from your saved notes and keeps things short, clear, and encouraging.
                  </Text>
                  {!notes.length ? (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => openNoteComposer()}
                      style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                    >
                      <Text style={styles.emptyButtonLabel}>Add your first note</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              }
            />

            <View style={styles.inputArea}>
              {!isDesktop ? <QuickPromptChips prompts={prompts} onSelect={(prompt) => submitMessage(prompt)} /> : null}
              <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={isDesktop ? "Ask Buddy... Press Enter to send" : "Ask Buddy..."}
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  multiline
                  onKeyPress={(event) => {
                    const nativeEvent = event.nativeEvent as typeof event.nativeEvent & {
                      shiftKey?: boolean;
                    };

                    if (Platform.OS === "web" && nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
                      event.preventDefault?.();
                      submitMessage(input);
                    }
                  }}
                />
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => submitMessage(input)}
                  style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                >
                  {isSending ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="arrow-up" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  shell: {
    flex: 1
  },
  shellDesktop: {
    flexDirection: "row",
    width: "100%",
    maxWidth: DESKTOP_CONTENT_WIDTH,
    alignSelf: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  desktopRail: {
    width: 280,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    gap: 16
  },
  desktopRailTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  desktopRailText: {
    fontSize: 14,
    lineHeight: 22
  },
  desktopRailButton: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  desktopRailButtonLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500"
  },
  desktopActionRow: {
    flexDirection: "row",
    gap: 10
  },
  desktopRailSecondaryButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  desktopRailSecondaryButtonLabel: {
    fontSize: 13,
    fontWeight: "500"
  },
  desktopHint: {
    fontSize: 11,
    lineHeight: 18
  },
  chatPanel: {
    flex: 1
  },
  chatPanelDesktop: {
    minWidth: 0
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "600"
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  clearButtonLabel: {
    fontSize: 11,
    fontWeight: "500"
  },
  countChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  countText: {
    fontSize: 11,
    fontWeight: "500"
  },
  contextChip: {
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  contextText: {
    fontSize: 11,
    fontWeight: "500"
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1
  },
  chatContentDesktop: {
    paddingTop: 20,
    paddingBottom: 20
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 48
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280
  },
  emptyButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  emptyButtonLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500"
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8
  },
  inputBar: {
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    maxHeight: 110
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  }
});
