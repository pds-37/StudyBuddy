import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";

import { alpha, getTheme, subjectPresets } from "@/constants/theme";
import { getIsDesktopLayout } from "@/lib/responsive";
import type { Note, SaveNoteInput } from "@/lib/types";

type NoteModalProps = {
  visible: boolean;
  note: Note | null;
  initialSubject?: string | null;
  suggestedTopic?: string | null;
  onClose: () => void;
  onSave: (input: SaveNoteInput) => Promise<void>;
};

export const NoteModal = ({
  visible,
  note,
  initialSubject,
  suggestedTopic,
  onClose,
  onSave
}: NoteModalProps) => {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isDesktop = getIsDesktopLayout(width);
  const translateY = useRef(new Animated.Value(600)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [content, setContent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      const presetMatch = subjectPresets.includes((initialSubject ?? note?.subject ?? "") as (typeof subjectPresets)[number]);
      setContent(note?.content ?? "");
      setSelectedSubject(presetMatch ? (initialSubject ?? note?.subject ?? null) : "Custom...");
      setCustomSubject(presetMatch ? "" : initialSubject ?? note?.subject ?? "");
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 600,
          duration: 220,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [backdrop, initialSubject, note, translateY, visible]);

  const resolvedSubject = selectedSubject === "Custom..." ? customSubject.trim() : selectedSubject?.trim();

  const handleSave = async () => {
    if (!content.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: note?.id,
        content: content.trim(),
        selectedSubject: resolvedSubject || undefined
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={[styles.sheetShell, isDesktop ? styles.sheetShellDesktop : styles.sheetShellMobile]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            isDesktop ? styles.sheetDesktop : styles.sheetMobile,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {note ? "Edit note" : "New note"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="What did you study today..."
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { color: theme.colors.textPrimary }]}
              textAlignVertical="top"
              onKeyPress={(event) => {
                const nativeEvent = event.nativeEvent as typeof event.nativeEvent & {
                  ctrlKey?: boolean;
                  metaKey?: boolean;
                };
                const withModifier = nativeEvent.ctrlKey || nativeEvent.metaKey;
                if (withModifier && nativeEvent.key === "Enter") {
                  event.preventDefault?.();
                  handleSave().catch(() => undefined);
                }
              }}
            />

            {suggestedTopic ? (
              <View
                style={[
                  styles.topicHint,
                  {
                    backgroundColor: alpha(theme.colors.primary, 0.08),
                    borderColor: alpha(theme.colors.primary, 0.16)
                  }
                ]}
              >
                <Text style={[styles.topicHintText, { color: theme.colors.primary }]}>
                  Suggested topic: {suggestedTopic}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.heading, { color: theme.colors.heading }]}>Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectRow}>
              {subjectPresets.map((subject) => {
                const active = selectedSubject === subject;
                return (
                  <TouchableOpacity
                    key={subject}
                    activeOpacity={0.75}
                    onPress={() => setSelectedSubject(subject)}
                    style={[
                      styles.subjectChip,
                      {
                        backgroundColor: active ? theme.colors.primary : alpha(theme.colors.primary, 0.08),
                        borderColor: active ? theme.colors.primary : alpha(theme.colors.primary, 0.12)
                      }
                    ]}
                  >
                    <Text style={[styles.subjectChipLabel, { color: active ? "#FFFFFF" : theme.colors.primary }]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedSubject === "Custom..." ? (
              <TextInput
                value={customSubject}
                onChangeText={setCustomSubject}
                placeholder="Custom subject"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.customInput,
                  {
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border
                  }
                ]}
              />
            ) : null}
          </ScrollView>

          {isSaving ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={[styles.loaderText, { color: theme.colors.textSecondary }]}>Buddy is reading...</Text>
            </View>
          ) : null}

          {isDesktop ? (
            <Text style={[styles.desktopHint, { color: theme.colors.textSecondary }]}>
              Tip: press Ctrl/Cmd + Enter to save quickly.
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.saveButtonLabel}>{isSaving ? "Saving..." : "Save & Analyse"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)"
  },
  sheetShell: {
    ...StyleSheet.absoluteFillObject
  },
  sheetShellMobile: {
    justifyContent: "flex-end"
  },
  sheetShellDesktop: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  sheet: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    overflow: "hidden"
  },
  sheetMobile: {
    height: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1
  },
  sheetDesktop: {
    maxWidth: 760,
    height: "82%",
    borderRadius: 24,
    borderWidth: 1
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#CFCFCF",
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16
  },
  contentContainer: {
    gap: 16,
    paddingBottom: 16
  },
  input: {
    minHeight: 220,
    fontSize: 14,
    lineHeight: 22
  },
  topicHint: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  topicHintText: {
    fontSize: 13,
    fontWeight: "500"
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  subjectRow: {
    gap: 8
  },
  subjectChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  subjectChipLabel: {
    fontSize: 13,
    fontWeight: "500"
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  loaderText: {
    fontSize: 13
  },
  desktopHint: {
    fontSize: 11,
    marginBottom: 12
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButtonLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF"
  }
});

export default NoteModal;
