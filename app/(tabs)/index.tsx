import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Button,
  Dimensions,
  SafeAreaView,
} from "react-native";
import _ from "lodash";
import { Audio } from "expo-av";
import Animated, {
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import { Svg, Path } from "react-native-svg";
import Slider from "@react-native-community/slider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCROLL_SPEED = SCREEN_WIDTH / 10;

const AudioPlayer = ({ onTimeUpdate, onReady }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined; // Cleanup on unmount
  }, [sound]);

  const loadAndPlayAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { shouldPlay: true }
    );

    onReady(sound);
    setSound(sound);
    setIsPlaying(true);

    // Subscribe to playback status updates
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setCurrentPosition(status.positionMillis / 1000); // Convert to seconds
        setDuration(status.durationMillis / 1000); // Convert to seconds
        const currentTimeInSeconds = status.positionMillis / 1000; // Convert milliseconds to seconds
        onTimeUpdate(currentTimeInSeconds); // Update the parent with the current time
      }

      if (status.didJustFinish) {
        setIsPlaying(false); // Stop playback when the track finishes
      }
    });
  };

  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stop = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const seekTo = async (time) => {
    if (sound) {
      await sound.setPositionAsync(time * 1000); // Convert seconds to milliseconds
      setCurrentPosition(time);
    }
  };

  return (
    <View style={styles.container}>
      {/* Playback Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Load & Play" onPress={loadAndPlayAudio} />
        <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={isPlaying ? pause : play}
        />
        <Button title="Stop" onPress={stop} />
      </View>

      {/* Seek Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration} // Maximum is the duration of the track
          value={currentPosition} // Current playback position
          onValueChange={(value) => seekTo(value)} // Seek to new position
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#D3D3D3"
          thumbTintColor="#1DB954"
        />
      </View>
    </View>
  );
};

const lyrics = [
  { time: 0, text: "This" },
  { time: 1, text: "is" },
  { time: 2, text: "the" },
  { time: 3, text: "song" },
  { time: 4, text: "lyrics" },
];

const getWordPosition = (currentTime) => {
  // Find the closest word based on the current time
  let closestWordIndex = 0;

  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      closestWordIndex = i;
    } else {
      break;
    }
  }

  // Calculate the horizontal position for the note
  const wordWidth = 50; // Approximate width of each word (adjust as needed)
  return closestWordIndex * wordWidth;
};

const LyricScroll = ({ lyrics, currentTime, onSeek }) => {
  const lineHeight = 40;
  const offset = useSharedValue(0);
  const scrollRef = useRef<any | null>(null);

  useEffect(() => {
    offset.value = withTiming(currentTime * SCROLL_SPEED, { duration: 1000 });
  }, [currentTime]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value }],
  }));

  const handleScroll = _.throttle((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const index = Math.round(scrollY / lineHeight); // Calculate lyric index
    const lyric = lyrics[index];

    if (lyric && onSeek) {
      onSeek(lyric.time); // Trigger parent seek with the corresponding time
    }
  }, 200);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollPosition = getScrollPosition(currentTime, lyrics); // Calculate where to scroll
      scrollRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  }, [currentTime]);

  const getScrollPosition = (time, lyrics) => {
    const index = lyrics.findIndex((lyric) => lyric.time >= time);
    return Math.max(0, index * lineHeight);
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <ScrollView
        horizontal
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {lyrics.map((line, index) => (
          <Text
            key={index}
            style={{
              fontSize: 18,
              marginHorizontal: 10,
              color: currentTime >= line.time ? "blue" : "black",
            }}
          >
            {line.text}
          </Text>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const MusicalNote = () => (
  <Svg height="24" width="24" viewBox="0 0 24 24">
    <Path d="M12 3v10.55A4 4 0 1014 17V7h4V3z" fill="blue" />
  </Svg>
);

const AnimatedNote = ({ currentTime }) => {
  const position = useSharedValue(0);

  useEffect(() => {
    position.value = withTiming(getWordPosition(currentTime), {
      duration: 500,
    });
  }, [currentTime]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <MusicalNote />
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);

  const handleTimeUpdate = (time) => {
    setCurrentTime(time); // Update the current playback time
  };

  const handleSeek = async (time) => {
    if (audioPlayer) {
      await audioPlayer.setPositionAsync(time * 1000); // Convert seconds to milliseconds
      setCurrentTime(time); // Update local state
    }
  };

  const handleAudioPlayerReady = (player) => {
    setAudioPlayer(player); // Save the reference to the AudioPlayer
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <LyricScroll
        currentTime={currentTime}
        onSeek={handleSeek}
        lyrics={lyrics}
      />
      <AnimatedNote currentTime={currentTime} />
      <AudioPlayer
        onTimeUpdate={handleTimeUpdate}
        onReady={handleAudioPlayerReady}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderContainer: {
    alignItems: "stretch",
    justifyContent: "center",
  },
});
