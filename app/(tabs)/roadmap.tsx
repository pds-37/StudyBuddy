import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import MilestoneCard from "@/components/MilestoneCard";
import { alpha, getTheme } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { generateRoadmap } from "@/lib/gemini";
import { addDays, createId } from "@/lib/date";
import type { GeminiRoadmap, RoadmapDraftMilestone } from "@/lib/types";

const buildFallbackRoadmap = (goalInput: string): GeminiRoadmap => ({
  goal_title: goalInput.slice(0, 48) || "Study Goal",
  target_date: addDays(new Date(), 30).toISOString(),
  subject: "B.Tech CSE",
  milestones: [
    {
      id: createId("milestone"),
      topic: "Core Concepts",
      description: "Collect the key B.Tech CSE concepts, definitions, and formulas you need first.",
      order: 1,
      estimated_notes_needed: 2
    },
    {
      id: createId("milestone"),
      topic: "Problem Solving",
      description: "Work through coding, systems, or theory examples and turn them into clean notes.",
      order: 2,
      estimated_notes_needed: 2
    },
    {
      id: createId("milestone"),
      topic: "Revision and Mock Prep",
      description: "Review weak areas, revisit tricky topics, and prepare short revision notes.",
      order: 3,
      estimated_notes_needed: 2
    }
  ]
});

const normalizeDraft = (draft: GeminiRoadmap): GeminiRoadmap => ({
  ...draft,
  goal_title: draft.goal_title || "Study Goal",
  target_date: draft.target_date || addDays(new Date(), 30).toISOString(),
  subject: draft.subject || "General Study",
  milestones: (draft.milestones || []).map((milestone, index) => ({
    id: milestone.id || createId("milestone"),
    topic: milestone.topic || `Milestone ${index + 1}`,
    description: milestone.description || "What to study for this step.",
    order: index + 1,
    estimated_notes_needed: milestone.estimated_notes_needed || 2
  }))
});

export default function RoadmapScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const { roadmap, isHydrating, openNoteComposer, saveRoadmap, showToast } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [goalInput, setGoalInput] = useState("");
  const [draft, setDraft] = useState<GeminiRoadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = roadmap?.milestones.filter((milestone) => milestone.status === "completed").length ?? 0;
  const totalCount = roadmap?.milestones.length ?? 0;
  const progress = totalCount ? completedCount / totalCount : 0;

  const resetFlow = () => {
    setModalVisible(false);
    setStep(1);
    setGoalInput("");
    setDraft(null);
    setIsGenerating(false);
    setIsSaving(false);
  };

  const updateMilestone = (id: string, patch: Partial<RoadmapDraftMilestone>) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        milestones: current.milestones.map((milestone) =>
          milestone.id === id
            ? {
                ...milestone,
                ...patch
              }
            : milestone
        )
      };
    });
  };

  const reorderMilestone = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.milestones.length) {
        return current;
      }

      const milestones = [...current.milestones];
      const [moved] = milestones.splice(index, 1);
      milestones.splice(nextIndex, 0, moved);

      return {
        ...current,
        milestones: milestones.map((milestone, order) => ({
          ...milestone,
          order: order + 1
        }))
      };
    });
  };

  const deleteMilestone = (id: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            milestones: current.milestones
              .filter((milestone) => milestone.id !== id)
              .map((milestone, index) => ({
                ...milestone,
                order: index + 1
              }))
          }
        : current
    );
  };

  const addCustomMilestone = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            milestones: [
              ...current.milestones,
              {
                id: createId("milestone"),
                topic: "New topic",
                description: "Describe what to study here.",
                order: current.milestones.length + 1,
                estimated_notes_needed: 2
              }
            ]
          }
        : current
    );
  };

  const handleGenerate = async () => {
    if (!goalInput.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateRoadmap(goalInput.trim());
      setDraft(normalizeDraft(response));
      setStep(2);
    } catch {
      showToast("Gemini is unavailable, so Buddy made a starter roadmap you can edit.", "warning");
      setDraft(normalizeDraft(buildFallbackRoadmap(goalInput.trim())));
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!draft || !draft.milestones.length) {
      return;
    }

    setIsSaving(true);
    try {
      await saveRoadmap(draft, draft.milestones);
      resetFlow();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Roadmap</Text>
      </View>

      {isHydrating ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Loading your roadmap...</Text>
        </View>
      ) : !roadmap ? (
        <View style={styles.centerState}>
          <View style={[styles.emptyIcon, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}>
            <Ionicons name="map-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No roadmap yet</Text>
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Tell Buddy what you want to achieve and it will turn the goal into manageable milestones.
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setModalVisible(true)}
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.primaryButtonLabel}>Create your first goal →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }]}>{roadmap.roadmap.goalTitle}</Text>
          <Text style={[styles.goalMeta, { color: theme.colors.textSecondary }]}>
            {completedCount} of {totalCount} topics covered
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(progress * 100, totalCount ? 8 : 0)}%`,
                  backgroundColor: theme.colors.primary
                }
              ]}
            />
          </View>

          <Text style={[styles.sectionHeading, { color: theme.colors.heading }]}>Timeline</Text>
          {roadmap.milestones.map((milestone, index) => (
            <View key={milestone.id} style={styles.milestoneWrap}>
              <MilestoneCard
                milestone={milestone}
                isLast={index === roadmap.milestones.length - 1}
                onStartStudying={() => {
                  router.push("/");
                  openNoteComposer({
                    subject: roadmap.roadmap.subject,
                    topic: milestone.topic
                  });
                }}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={resetFlow}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Roadmap</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={resetFlow}>
              <Text style={[styles.linkLabel, { color: theme.colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>

          {step === 1 ? (
            <View style={styles.stepOne}>
              <TextInput
                multiline
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder="I want to..."
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.goalInput,
                  {
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface
                  }
                ]}
                textAlignVertical="top"
              />
              <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                Describe your goal naturally. Buddy will build your roadmap.
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleGenerate}
                disabled={isGenerating}
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              >
                {isGenerating ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryButtonLabel}>Generate Roadmap →</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.editorContent}>
              <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }]}>{draft?.goal_title}</Text>
              <Text style={[styles.goalMeta, { color: theme.colors.textSecondary }]}>
                {draft?.subject} • target {new Date(draft?.target_date ?? new Date()).toLocaleDateString()}
              </Text>

              {draft?.milestones.map((milestone, index) => (
                <View
                  key={milestone.id}
                  style={[styles.editorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <TextInput
                    value={milestone.topic}
                    onChangeText={(value) => updateMilestone(milestone.id, { topic: value })}
                    style={[styles.editorTitle, { color: theme.colors.textPrimary }]}
                  />
                  <TextInput
                    multiline
                    value={milestone.description}
                    onChangeText={(value) => updateMilestone(milestone.id, { description: value })}
                    style={[styles.editorDescription, { color: theme.colors.textSecondary }]}
                  />
                  <TextInput
                    keyboardType="number-pad"
                    value={String(milestone.estimated_notes_needed)}
                    onChangeText={(value) =>
                      updateMilestone(milestone.id, {
                        estimated_notes_needed: Number.parseInt(value || "0", 10) || 1
                      })
                    }
                    style={[
                      styles.estimateInput,
                      {
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border
                      }
                    ]}
                  />
                  <View style={styles.editorActions}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => reorderMilestone(index, -1)}
                      style={[styles.smallButton, { backgroundColor: alpha(theme.colors.primary, 0.1) }]}
                    >
                      <Text style={[styles.smallButtonLabel, { color: theme.colors.primary }]}>Move up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => reorderMilestone(index, 1)}
                      style={[styles.smallButton, { backgroundColor: alpha(theme.colors.primary, 0.1) }]}
                    >
                      <Text style={[styles.smallButtonLabel, { color: theme.colors.primary }]}>Move down</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => deleteMilestone(milestone.id)}
                      style={[styles.smallButton, { backgroundColor: alpha(theme.colors.danger, 0.1) }]}
                    >
                      <Text style={[styles.smallButtonLabel, { color: theme.colors.danger }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={addCustomMilestone}
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.linkLabel, { color: theme.colors.textPrimary }]}>+ Add custom milestone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSaveRoadmap}
                disabled={isSaving}
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              >
                {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.primaryButtonLabel}>Start this Roadmap</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
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
  goalTitle: {
    fontSize: 16,
    fontWeight: "600"
  },
  goalMeta: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 12
  },
  progressTrack: {
    height: 8,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20
  },
  progressFill: {
    height: "100%",
    borderRadius: 20
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12
  },
  milestoneWrap: {
    marginBottom: 14
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
  linkLabel: {
    fontSize: 13,
    fontWeight: "500"
  },
  stepOne: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16
  },
  goalInput: {
    minHeight: 220,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    lineHeight: 22
  },
  editorContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16
  },
  editorCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12
  },
  editorTitle: {
    fontSize: 14,
    fontWeight: "600"
  },
  editorDescription: {
    fontSize: 14,
    lineHeight: 22
  },
  estimateInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  editorActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  smallButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  smallButtonLabel: {
    fontSize: 13,
    fontWeight: "500"
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  }
});
