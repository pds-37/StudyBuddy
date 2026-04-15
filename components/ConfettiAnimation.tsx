import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  useColorScheme
} from "react-native";

import { getTheme } from "@/constants/theme";

const PIECE_COUNT = 12;
const { width } = Dimensions.get("window");

type ConfettiAnimationProps = {
  visible: boolean;
};

export const ConfettiAnimation = ({ visible }: ConfettiAnimationProps) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const pieces = useRef(
    Array.from({ length: PIECE_COUNT }, () => ({
      translateY: new Animated.Value(-40),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0)
    }))
  ).current;

  useEffect(() => {
    if (!visible) {
      pieces.forEach((piece) => {
        piece.translateY.setValue(-40);
        piece.translateX.setValue(0);
        piece.rotate.setValue(0);
        piece.opacity.setValue(0);
      });
      return;
    }

    const animations = pieces.map((piece, index) =>
      Animated.parallel([
        Animated.timing(piece.translateY, {
          toValue: 190 + index * 6,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(piece.translateX, {
          toValue: (index - PIECE_COUNT / 2) * 11,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(piece.rotate, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.sequence([
          Animated.timing(piece.opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true
          }),
          Animated.timing(piece.opacity, {
            toValue: 0,
            duration: 780,
            useNativeDriver: true
          })
        ])
      ])
    );

    Animated.stagger(30, animations).start();
  }, [pieces, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      {pieces.map((piece, index) => {
        const rotate = piece.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${120 + index * 8}deg`]
        });
        const color = index % 2 === 0 ? theme.colors.primary : theme.colors.success;

        return (
          <Animated.View
            key={`confetti-${index}`}
            style={[
              styles.piece,
              {
                backgroundColor: color,
                left: width / 2,
                opacity: piece.opacity,
                transform: [
                  { translateX: piece.translateX },
                  { translateY: piece.translateY },
                  { rotate }
                ]
              }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30
  },
  piece: {
    position: "absolute",
    top: 60,
    width: 8,
    height: 16,
    borderRadius: 4
  }
});

export default ConfettiAnimation;
