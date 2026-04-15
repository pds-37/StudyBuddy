import { memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";
import { formatReminderDateLabel } from "@/lib/date";
import type { Reminder } from "@/lib/types";

type ReminderCardProps = {
  reminder: Reminder;
  highlighted?: boolean;
  onReviewed?: () => void;
  onSnooze?: () => void;
};

export const ReminderCard = memo(
  ({ reminder, highlighted = false, onReviewed, onSnooze }: ReminderCardProps) => {
    const scheme = useColorScheme();
    const theme = useMemo(() => getTheme(scheme), [scheme]);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: highlighted ? theme.colors.primary : theme.colors.border
          }
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.tag, { backgroundColor: alpha(theme.colors.primary, 0.16) }]}>
            <Text style={[styles.tagLabel, { color: theme.colors.primary }]}>
              {reminder.subject ?? "Study"}
            </Text>
          </View>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {formatReminderDateLabel(reminder.scheduledAt)}
          </Text>
        </View>

        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.textPrimary }]}>
          {reminder.noteSummary ?? reminder.title}
        </Text>

        {(onReviewed || onSnooze) && (
          <View style={styles.buttonRow}>
            {onReviewed ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onReviewed}
                style={[styles.button, { backgroundColor: alpha(theme.colors.success, 0.14) }]}
              >
                <Text style={[styles.buttonLabel, { color: theme.colors.success }]}>Reviewed ✓</Text>
              </TouchableOpacity>
            ) : null}
            {onSnooze ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onSnooze}
                style={[styles.button, { backgroundColor: alpha(theme.colors.warning, 0.14) }]}
              >
                <Text style={[styles.buttonLabel, { color: theme.colors.warning }]}>Snooze 1hr</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
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
  meta: {
    fontSize: 11
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "500"
  }
});

export default ReminderCard;
