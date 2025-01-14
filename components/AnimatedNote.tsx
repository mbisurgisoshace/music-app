import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";

interface Lyric {
  time: number;
  text: string;
}

interface AnimatedNoteProps {
  currentTime: number;
  lyrics: Lyric[];
}

const AnimatedNote: React.FC<AnimatedNoteProps> = ({ currentTime, lyrics }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const position = interpolate(
      currentTime,
      lyrics.map((line) => line.time),
      lyrics.map((_, index) => index * 200), // Horizontal position
      { extrapolateRight: "clamp" }
    );

    return {
      transform: [{ translateX: position }],
    };
  });

  return (
    <Animated.View style={[styles.note, animatedStyle]}>
      <Text>🎵</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  note: {
    position: "absolute",
    bottom: 20,
    left: 10,
  },
});

export default AnimatedNote;
