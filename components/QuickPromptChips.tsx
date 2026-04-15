import { memo, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme
} from "react-native";

import { alpha, getTheme } from "@/constants/theme";

type QuickPromptChipsProps = {
  prompts: string[];
  onSelect: (prompt: string) => void;
};

export const QuickPromptChips = memo(({ prompts, onSelect }: QuickPromptChipsProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {prompts.map((prompt) => (
        <TouchableOpacity
          key={prompt}
          activeOpacity={0.75}
          onPress={() => onSelect(prompt)}
          style={[
            styles.chip,
            {
              backgroundColor: alpha(theme.colors.primary, 0.08),
              borderColor: alpha(theme.colors.primary, 0.2)
            }
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.primary }]}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 8
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  label: {
    fontSize: 13,
    fontWeight: "500"
  }
});

export default QuickPromptChips;
