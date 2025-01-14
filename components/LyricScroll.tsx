import React, { useEffect, useState, useRef } from "react";
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  StyleSheet,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Lyric {
  time: number;
  text: string;
}

interface LyricScrollProps {
  lyrics: Lyric[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

const LyricScroll: React.FC<LyricScrollProps> = ({
  lyrics,
  onSeek,
  duration,
  currentTime,
}) => {
  const scrollPosition = useSharedValue(0);
  const notePosition = useSharedValue(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const wordWidths = useRef<number[]>([]); // To store widths of each word

  useEffect(() => {
    const scrollWidth = width * lyrics.length; // Total scrollable width
    const targetPosition = (currentTime / duration) * scrollWidth;
    scrollPosition.value = withTiming(targetPosition, { duration: 300 });

    // Find current word and its cumulative width
    const currentIndex = lyrics.findIndex((lyric, index) => {
      const nextLyric = lyrics[index + 1];
      return (
        currentTime >= lyric.time &&
        (nextLyric ? currentTime < nextLyric.time : true)
      );
    });

    // Calculate the position of the note
    let totalWidthBeforeCurrentWord = 0;
    for (let i = 0; i < currentIndex; i++) {
      totalWidthBeforeCurrentWord += wordWidths.current[i] || 0;
    }

    notePosition.value = withTiming(totalWidthBeforeCurrentWord, {
      duration: 300,
    });
  }, [currentTime, duration, lyrics]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollPosition.value }],
  }));

  const animatedNoteStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: notePosition.value }],
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsUserScrolling(true);
    const offsetX = event.nativeEvent.contentOffset.x;
    const totalScrollableWidth = width * lyrics.length;
    const newTime = (offsetX / totalScrollableWidth) * duration;

    if (newTime >= 0 && newTime <= duration) {
      onSeek(newTime);
    }
  };

  const handleScrollEnd = () => {
    setIsUserScrolling(false);
  };

  const handleWordLayout = (index: number, event: any) => {
    const width = event.nativeEvent.layout.width;
    wordWidths.current[index] = width; // Store the width of the word
  };

  return (
    <View style={styles.container}>
      {/* Lyrics */}
      <ScrollView
        horizontal
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        showsHorizontalScrollIndicator={false}
      >
        <Animated.View style={[styles.scrollContainer, animatedStyle]}>
          {lyrics.map((lyric, index) => (
            <Text
              key={index}
              style={[
                styles.word,
                currentTime >= lyric.time ? styles.played : styles.unplayed,
              ]}
              onLayout={(event) => handleWordLayout(index, event)} // Track word layout
            >
              {lyric.text}
            </Text>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Animated Note Icon */}
      <Animated.View style={[styles.note, animatedNoteStyle]}>
        <Text style={styles.noteText}>🎵</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 50,
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  word: {
    fontSize: 18,
    marginRight: 10, // Add spacing between words
  },
  played: {
    color: "#1DB954", // Green color for played words
  },
  unplayed: {
    color: "#ccc", // Gray color for unplayed words
  },
  note: {
    position: "absolute",
    bottom: -20, // Adjust the note position above the lyrics
    zIndex: 10,
  },
  noteText: {
    fontSize: 24,
  },
});

export default LyricScroll;
