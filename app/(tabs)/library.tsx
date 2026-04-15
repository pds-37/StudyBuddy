import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  SectionList,
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
import { useRouter } from "expo-router";

import NoteCard from "@/components/NoteCard";
import SubjectTabs from "@/components/SubjectTabs";
import { alpha, getTheme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { DESKTOP_CONTENT_WIDTH, getIsDesktopLayout } from "@/lib/responsive";
import type { Note } from "@/lib/types";

export default function LibraryScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const isDesktop = getIsDesktopLayout(width);
  const { notes, isHydrating, openNoteComposer, deleteNote, setAskBuddyContextNote } = useAppContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const subjects = useMemo(() => ["All", ...new Set(notes.map((note) => note.subject))], [notes]);

  useEffect(() => {
    if (!subjects.includes(activeSubject)) {
      setActiveSubject("All");
    }
  }, [activeSubject, subjects]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes.filter((note) => {
      const subjectMatch = activeSubject === "All" || note.subject === activeSubject;
      if (!subjectMatch) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [note.content, note.subject, note.category, note.summary, note.keyConcepts.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeSubject, notes, query]);

  const sections = useMemo(() => {
    const grouped = filteredNotes.reduce<Record<string, Note[]>>((accumulator, note) => {
      const key = note.category || "General";
      accumulator[key] = accumulator[key] ? [...accumulator[key], note] : [note];
      return accumulator;
    }, {});

    return Object.keys(grouped)
      .sort((left, right) => left.localeCompare(right))
      .map((category) => ({
        title: category,
        data: grouped[category]
      }));
  }, [filteredNotes]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.screenShell, isDesktop && styles.screenShellDesktop]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Library</Text>
            {isDesktop ? (
              <Text style={[styles.desktopSubtext, { color: theme.colors.textSecondary }]}>
                Browse your notes by subject and category
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setSearchOpen((current) => !current)}
            style={[styles.iconButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Ionicons name="search-outline" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {searchOpen ? (
          <View style={[styles.searchRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search notes, subjects, concepts..."
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            />
            <TouchableOpacity activeOpacity={0.75} onPress={() => setQuery("")}>
              <Text style={[styles.clearButton, { color: theme.colors.primary }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.tabWrap}>
          <SubjectTabs subjects={subjects} activeSubject={activeSubject} onChange={setActiveSubject} />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, isDesktop && styles.listContentDesktop]}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: theme.colors.heading }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => <NoteCard note={item} compact onPress={() => setSelectedNote(item)} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            isHydrating ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                  Organising your library...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}>
                  <Ionicons name="library-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No notes in {activeSubject} yet</Text>
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                  Start writing and Buddy will file everything here.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openNoteComposer({ subject: activeSubject === "All" ? null : activeSubject })}
                  style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.emptyButtonLabel}>Start writing</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      </View>

      <Modal visible={!!selectedNote} animationType="slide" onRequestClose={() => setSelectedNote(null)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Note Details</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={() => setSelectedNote(null)}>
              <Text style={[styles.clearButton, { color: theme.colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          {selectedNote ? (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: alpha(theme.colors.primary, 0.16) }]}>
                  <Text style={[styles.tagLabel, { color: theme.colors.primary }]}>{selectedNote.subject}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: alpha(theme.colors.textSecondary, 0.14) }]}>
                  <Text style={[styles.tagLabel, { color: theme.colors.textSecondary }]}>{selectedNote.category}</Text>
                </View>
              </View>

              <Text style={[styles.contentText, { color: theme.colors.textPrimary }]}>{selectedNote.content}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.conceptsRow}>
                {selectedNote.keyConcepts.map((concept) => (
                  <View key={concept} style={[styles.conceptChip, { backgroundColor: alpha(theme.colors.primary, 0.08) }]}>
                    <Text style={[styles.conceptText, { color: theme.colors.primary }]}>{concept}</Text>
                  </View>
                ))}
              </ScrollView>

              <View
                style={[
                  styles.summaryBox,
                  {
                    backgroundColor: alpha(theme.colors.primary, 0.08),
                    borderColor: alpha(theme.colors.primary, 0.16)
                  }
                ]}
              >
                <Text style={[styles.sectionHeader, { color: theme.colors.heading }]}>AI Summary</Text>
                <Text style={[styles.summaryText, { color: theme.colors.textPrimary }]}>{selectedNote.summary}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedNote(null);
                    openNoteComposer({ note: selectedNote });
                  }}
                  style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    deleteNote(selectedNote.id).catch(() => undefined);
                    setSelectedNote(null);
                  }}
                  style={[styles.actionButton, { backgroundColor: alpha(theme.colors.danger, 0.08) }]}
                >
                  <Text style={[styles.actionLabel, { color: theme.colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setAskBuddyContextNote(selectedNote);
                  setSelectedNote(null);
                  router.push("/buddy");
                }}
                style={[styles.askButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.askButtonLabel}>Ask Buddy about this</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  searchRow: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  clearButton: {
    fontSize: 13,
    fontWeight: "500"
  },
  tabWrap: {
    paddingHorizontal: 20,
    paddingTop: 16
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  listContentDesktop: {
    paddingBottom: 40
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8
  },
  emptyState: {
    paddingTop: 64,
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
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: "500"
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22
  },
  conceptsRow: {
    gap: 8
  },
  conceptChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  conceptText: {
    fontSize: 11,
    fontWeight: "500"
  },
  summaryBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22
  },
  actionRow: {
    flexDirection: "row",
    gap: 12
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500"
  },
  askButton: {
    minHeight: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  askButtonLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500"
  }
});
