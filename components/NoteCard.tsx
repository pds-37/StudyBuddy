import { memo, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";
import { formatRelativeDateTime, formatTimeOnly } from "@/lib/date";
import type { Note } from "@/lib/types";

type NoteCardProps = {
  note: Note;
  compact?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export const NoteCard = memo(({ note, compact = false, onPress, onLongPress }: NoteCardProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: "#000000"
        }
      ]}
    >
      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: alpha(theme.colors.primary, 0.16) }]}>
          <Text style={[styles.tagText, { color: theme.colors.primary }]}>{note.subject}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: alpha(theme.colors.textSecondary, 0.12) }]}>
          <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{note.category}</Text>
        </View>
      </View>

      <Text
        numberOfLines={compact ? 1 : 2}
        style={[styles.content, { color: theme.colors.textPrimary }]}
      >
        {note.content}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {formatRelativeDateTime(note.createdAt)} • {formatTimeOnly(note.createdAt)}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>{note.confidence}% match</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 2
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500"
  },
  content: {
    fontSize: 14,
    lineHeight: 22
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  meta: {
    fontSize: 11
  }
});

export default NoteCard;
