import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import ReminderCard from "@/components/ReminderCard";
import { alpha, getTheme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { addDays, groupDateLabel, isSameDay } from "@/lib/date";
import type { Note } from "@/lib/types";

export default function RemindersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ compose?: string; noteId?: string }>();
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const {
    reminders,
    notes,
    isHydrating,
    highlightedReminderId,
    saveCustomReminder,
    reviewReminder,
    snoozeReminder
  } = useAppContext();

  const [composerVisible, setComposerVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => addDays(new Date(), 1));
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [noteQuery, setNoteQuery] = useState("");
  const [linkedNoteId, setLinkedNoteId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const reviewOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.compose === "1") {
      const linked = typeof params.noteId === "string" ? notes.find((note) => note.id === params.noteId) : null;
      setComposerVisible(true);
      if (linked) {
        setLinkedNoteId(linked.id);
        setSubject(linked.subject);
        setTitle(`Revise ${linked.subject}`);
      }
      router.replace("/reminders");
    }
  }, [notes, params.compose, params.noteId, router]);

  const linkedNote = useMemo(
    () => (linkedNoteId ? notes.find((note) => note.id === linkedNoteId) ?? null : null),
    [linkedNoteId, notes]
  );

  const dueToday = useMemo(
    () =>
      reminders.filter(
        (reminder) => !reminder.isReviewed && reminder.intervalDays > 0 && isSameDay(reminder.scheduledAt, new Date())
      ),
    [reminders]
  );

  const upcoming = useMemo(() => {
    const upperBound = addDays(new Date(), 7).getTime();
    return reminders.filter((reminder) => {
      const time = new Date(reminder.scheduledAt).getTime();
      return !reminder.isReviewed && reminder.intervalDays > 0 && time > Date.now() && time <= upperBound;
    });
  }, [reminders]);

  const customReminders = useMemo(
    () => reminders.filter((reminder) => !reminder.isReviewed && reminder.intervalDays === 0),
    [reminders]
  );

  const groupedUpcoming = useMemo(() => {
    return upcoming.reduce<Record<string, typeof upcoming>>((accumulator, reminder) => {
      const label = groupDateLabel(reminder.scheduledAt);
      accumulator[label] = accumulator[label] ? [...accumulator[label], reminder] : [reminder];
      return accumulator;
    }, {});
  }, [upcoming]);

  const filteredNotes = useMemo(() => {
    const query = noteQuery.trim().toLowerCase();
    if (!query) {
      return notes.slice(0, 6);
    }

    return notes.filter((note) =>
      [note.subject, note.category, note.summary, note.content].join(" ").toLowerCase().includes(query)
    ).slice(0, 6);
  }, [noteQuery, notes]);

  const animateReview = async (reminderId: string) => {
    await reviewReminder(reminderId);
    reviewOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(reviewOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(reviewOpacity, {
        toValue: 0,
        duration: 220,
        delay: 420,
        useNativeDriver: true
      })
    ]).start();
  };

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) {
      setPickerMode(null);
      return;
    }

    setScheduledAt((current) => {
      const next = new Date(current);
      if (pickerMode === "date") {
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      } else {
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      }
      return next;
    });
    setPickerMode(null);
  };

  const resetComposer = () => {
    setComposerVisible(false);
    setTitle("");
    setScheduledAt(addDays(new Date(), 1));
    setPickerMode(null);
    setNoteQuery("");
    setLinkedNoteId(null);
    setSubject("");
  };

  const saveReminderDraft = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await saveCustomReminder({
        title: title.trim(),
        scheduledAt: scheduledAt.toISOString(),
        noteId: linkedNoteId,
        subject: (linkedNote?.subject ?? subject).trim() || undefined
      });
      resetComposer();
    } finally {
      setIsSaving(false);
    }
  };

  const emptyEverything = !dueToday.length && !upcoming.length && !customReminders.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Reminders</Text>
      </View>

      <Animated.View style={[styles.reviewBadge, { opacity: reviewOpacity, backgroundColor: alpha(theme.colors.success, 0.12) }]}>
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
        <Text style={[styles.reviewBadgeText, { color: theme.colors.success }]}>Reviewed</Text>
      </Animated.View>

      {isHydrating ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Loading your revision queue...</Text>
        </View>
      ) : emptyEverything ? (
        <View style={styles.centerState}>
          <View style={[styles.emptyIcon, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No reminders yet</Text>
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Notes will create revision reminders automatically, and you can add custom ones anytime.
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setComposerVisible(true)}
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.primaryButtonLabel}>Add custom reminder</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Due Today</Text>
          {dueToday.length ? (
            dueToday.map((reminder) => (
              <View key={reminder.id} style={styles.cardGap}>
                <ReminderCard
                  reminder={reminder}
                  highlighted={highlightedReminderId === reminder.id}
                  onReviewed={() => animateReview(reminder.id)}
                  onSnooze={() => snoozeReminder(reminder.id)}
                />
              </View>
            ))
          ) : (
            <Text style={[styles.sectionPlaceholder, { color: theme.colors.textSecondary }]}>Nothing due today. Nice work.</Text>
          )}

          <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Upcoming</Text>
          {Object.keys(groupedUpcoming).length ? (
            Object.entries(groupedUpcoming).map(([label, items]) => (
              <View key={label} style={styles.groupWrap}>
                <Text style={[styles.groupLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                {items.map((reminder) => (
                  <View key={reminder.id} style={styles.cardGap}>
                    <ReminderCard reminder={reminder} highlighted={highlightedReminderId === reminder.id} />
                  </View>
                ))}
              </View>
            ))
          ) : (
            <Text style={[styles.sectionPlaceholder, { color: theme.colors.textSecondary }]}>No upcoming revision reminders in the next 7 days.</Text>
          )}

          <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Custom Reminders</Text>
          {customReminders.length ? (
            customReminders.map((reminder) => (
              <View key={reminder.id} style={styles.cardGap}>
                <ReminderCard reminder={reminder} highlighted={highlightedReminderId === reminder.id} />
              </View>
            ))
          ) : (
            <Text style={[styles.sectionPlaceholder, { color: theme.colors.textSecondary }]}>Add one-off nudges for topics, tasks, or deadlines.</Text>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setComposerVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={composerVisible} transparent animationType="fade" onRequestClose={resetComposer}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity activeOpacity={1} onPress={resetComposer} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>New Reminder</Text>

            <ScrollView contentContainerStyle={styles.sheetContent}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Reminder title"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.fieldInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />

              <View style={styles.dateRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setPickerMode("date")}
                  style={[styles.dateButton, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.dateButtonText, { color: theme.colors.textPrimary }]}>
                    {scheduledAt.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setPickerMode("time")}
                  style={[styles.dateButton, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.dateButtonText, { color: theme.colors.textPrimary }]}>
                    {scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </Text>
                </TouchableOpacity>
              </View>

              {pickerMode ? (
                <DateTimePicker value={scheduledAt} mode={pickerMode} onChange={onPickerChange} />
              ) : null}

              <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Link a Note</Text>
              <TextInput
                value={noteQuery}
                onChangeText={setNoteQuery}
                placeholder="Search a note to link"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.fieldInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />

              {linkedNote ? (
                <View style={[styles.selectedNote, { backgroundColor: alpha(theme.colors.primary, 0.08) }]}>
                  <Text style={[styles.selectedNoteText, { color: theme.colors.primary }]}>
                    Linked to {linkedNote.subject} {" > "} {linkedNote.category}
                  </Text>
                  <TouchableOpacity activeOpacity={0.75} onPress={() => setLinkedNoteId(null)}>
                    <Text style={[styles.clearLink, { color: theme.colors.primary }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <ScrollView style={styles.noteResults} nestedScrollEnabled>
                {filteredNotes.map((note: Note) => (
                  <TouchableOpacity
                    key={note.id}
                    activeOpacity={0.75}
                    onPress={() => {
                      setLinkedNoteId(note.id);
                      setSubject(note.subject);
                      setTitle((current) => current || `Revise ${note.subject}`);
                    }}
                    style={[styles.noteResult, { borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.noteResultTitle, { color: theme.colors.textPrimary }]}>
                      {note.subject} {" > "} {note.category}
                    </Text>
                    <Text style={[styles.noteResultSummary, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {note.summary}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Subject / Topic</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject or topic"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.fieldInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              />
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={saveReminderDraft}
              disabled={isSaving}
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            >
              {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryButtonLabel}>Save Reminder</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "600"
  },
  reviewBadge: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 20,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: "500"
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20
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
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500"
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 12
  },
  sectionPlaceholder: {
    fontSize: 14,
    lineHeight: 22
  },
  groupWrap: {
    marginBottom: 8
  },
  groupLabel: {
    fontSize: 11,
    marginBottom: 8
  },
  cardGap: {
    marginBottom: 12
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 3
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end"
  },
  sheet: {
    height: "78%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#CFCFCF",
    marginBottom: 16
  },
  sheetContent: {
    gap: 16,
    paddingBottom: 16
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  dateRow: {
    flexDirection: "row",
    gap: 12
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  dateButtonText: {
    fontSize: 14
  },
  selectedNote: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  selectedNoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500"
  },
  clearLink: {
    fontSize: 13,
    fontWeight: "500"
  },
  noteResults: {
    maxHeight: 160
  },
  noteResult: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },
  noteResultTitle: {
    fontSize: 13,
    fontWeight: "500"
  },
  noteResultSummary: {
    fontSize: 11,
    marginTop: 4
  }
});
