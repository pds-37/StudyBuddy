import { memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";
import type { Milestone } from "@/lib/types";

type MilestoneCardProps = {
  milestone: Milestone;
  isLast?: boolean;
  onStartStudying?: () => void;
};

export const MilestoneCard = memo(({ milestone, isLast = false, onStartStudying }: MilestoneCardProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  const indicatorColor =
    milestone.status === "completed"
      ? theme.colors.primary
      : milestone.status === "in_progress"
        ? alpha(theme.colors.primary, 0.5)
        : "transparent";

  const indicatorBorder =
    milestone.status === "upcoming" ? theme.colors.border : alpha(theme.colors.primary, 0.7);

  const statusLabel =
    milestone.status === "completed"
      ? "Completed"
      : milestone.status === "in_progress"
        ? "In Progress"
        : "Not started";

  return (
    <View style={styles.row}>
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: indicatorColor,
              borderColor: indicatorBorder
            }
          ]}
        />
        {!isLast ? (
          <View style={[styles.line, { backgroundColor: alpha(theme.colors.border, 0.9) }]} />
        ) : null}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }
        ]}
      >
        <Text style={[styles.topic, { color: theme.colors.textPrimary }]}>{milestone.topic}</Text>
        <Text style={[styles.status, { color: theme.colors.textSecondary }]}>{statusLabel}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{milestone.description}</Text>
        <Text style={[styles.notesMeta, { color: theme.colors.textSecondary }]}>
          {milestone.actualNotes} notes saved
        </Text>
        {milestone.status === "upcoming" && onStartStudying ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onStartStudying}
            style={[styles.button, { backgroundColor: alpha(theme.colors.primary, 0.12) }]}
          >
            <Text style={[styles.buttonLabel, { color: theme.colors.primary }]}>Start studying →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12
  },
  timelineColumn: {
    alignItems: "center",
    width: 20
  },
  indicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8
  },
  topic: {
    fontSize: 14,
    fontWeight: "600"
  },
  status: {
    fontSize: 11
  },
  description: {
    fontSize: 14,
    lineHeight: 20
  },
  notesMeta: {
    fontSize: 11
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "500"
  }
});

export default MilestoneCard;
