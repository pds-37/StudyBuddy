import { memo, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import { getTheme } from "@/constants/theme";

type SubjectTabsProps = {
  subjects: string[];
  activeSubject: string;
  onChange: (subject: string) => void;
};

export const SubjectTabs = memo(({ subjects, activeSubject, onChange }: SubjectTabsProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {subjects.map((subject) => {
        const active = subject === activeSubject;
        return (
          <TouchableOpacity
            key={subject}
            activeOpacity={0.75}
            onPress={() => onChange(subject)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.colors.textPrimary : theme.colors.textSecondary
                }
              ]}
            >
              {subject}
            </Text>
            <View
              style={[
                styles.underline,
                {
                  backgroundColor: active ? theme.colors.primary : "transparent"
                }
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 12
  },
  tab: {
    paddingBottom: 8
  },
  label: {
    fontSize: 13,
    fontWeight: "500"
  },
  underline: {
    marginTop: 8,
    height: 2,
    borderRadius: 2
  }
});

export default SubjectTabs;
