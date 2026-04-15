import { useEffect, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import NoteCard from "@/components/NoteCard";
import { alpha, getTheme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { formatDayPill, getLastSevenDays, isSameDay } from "@/lib/date";
import { DESKTOP_CONTENT_WIDTH, getIsDesktopLayout } from "@/lib/responsive";
import type { Note } from "@/lib/types";

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ compose?: string; subject?: string; topic?: string }>();
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isDesktop = getIsDesktopLayout(width);
  const { notes, isHydrating, openNoteComposer, deleteNote } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    if (params.compose === "1") {
      openNoteComposer({
        subject: typeof params.subject === "string" ? params.subject : null,
        topic: typeof params.topic === "string" ? params.topic : null
      });
      router.replace("/");
    }
  }, [openNoteComposer, params.compose, params.subject, params.topic, router]);

  const visibleNotes = useMemo(
    () => notes.filter((note) => isSameDay(note.createdAt, selectedDate)),
    [notes, selectedDate]
  );

  const showLongPressActions = (note: Note) => {
    const handleSelection = (index: number) => {
      if (index === 0) {
        openNoteComposer({ note });
      }
      if (index === 1) {
        deleteNote(note.id).catch(() => undefined);
      }
      if (index === 2) {
        router.push({
          pathname: "/reminders",
          params: {
            compose: "1",
            noteId: note.id
          }
        });
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Edit", "Delete", "Add Reminder", "Cancel"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 3
        },
        (buttonIndex) => {
          if (buttonIndex < 3) {
            handleSelection(buttonIndex);
          }
        }
      );
      return;
    }

    Alert.alert(note.subject, "Choose an action", [
      { text: "Edit", onPress: () => handleSelection(0) },
      { text: "Delete", style: "destructive", onPress: () => handleSelection(1) },
      { text: "Add Reminder", onPress: () => handleSelection(2) },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.screenShell, isDesktop && styles.screenShellDesktop]}>
        <View style={[styles.headerRow, isDesktop && styles.headerRowDesktop]}>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Today&apos;s Notes</Text>
            {isDesktop ? (
              <Text style={[styles.desktopSubtext, { color: theme.colors.textSecondary }]}>
                Press Ctrl/Cmd + N for a new note
              </Text>
            ) : null}
          </View>
          {isDesktop ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => openNoteComposer()}
              style={[styles.desktopAction, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.desktopActionLabel}>New Note</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={visibleNotes}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <FlatList
                horizontal
                data={getLastSevenDays()}
                keyExtractor={(item) => item.toISOString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateStrip}
                renderItem={({ item }) => {
                  const active = isSameDay(item, selectedDate);
                  return (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => setSelectedDate(item)}
                      style={[
                        styles.datePill,
                        {
                          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                          borderColor: active ? theme.colors.primary : theme.colors.border
                        }
                      ]}
                    >
                      <Text style={[styles.datePillText, { color: active ? "#FFFFFF" : theme.colors.textSecondary }]}>
                        {formatDayPill(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Study Log</Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, isDesktop && styles.listContentDesktop]}
          renderItem={({ item }) => (
            <NoteCard note={item} onLongPress={() => showLongPressActions(item)} onPress={() => showLongPressActions(item)} />
          )}
          ListEmptyComponent={
            isHydrating ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                  Loading your study space...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}>
                  <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No notes for this day yet</Text>
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                  Start writing what you studied and Buddy will organise it for you.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openNoteComposer()}
                  style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.emptyButtonLabel}>Write a note</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      </View>

      {!isDesktop ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => openNoteComposer()}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  screenShell: {
    flex: 1,
    width: "100%"
  },
  screenShellDesktop: {
    alignSelf: "center",
    width: "100%",
    maxWidth: DESKTOP_CONTENT_WIDTH
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8
  },
  headerRowDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 16,
    fontWeight: "600"
  },
  desktopSubtext: {
    marginTop: 4,
    fontSize: 11
  },
  desktopAction: {
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  desktopActionLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500"
  },
  listHeader: {
    gap: 16
  },
  dateStrip: {
    gap: 8
  },
  datePill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  datePillText: {
    fontSize: 11,
    fontWeight: "500"
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12
  },
  listContentDesktop: {
    paddingBottom: 40
  },
  emptyState: {
    paddingTop: 56,
    alignItems: "center",
    gap: 12
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
  }
});
