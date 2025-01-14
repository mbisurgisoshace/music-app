import { Audio } from "expo-av";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import Slider from "@react-native-community/slider";
import { StyleSheet, View, Button, Text } from "react-native";
import LyricScroll from "./LyricScroll";

interface Lyric {
  time: number;
  text: string;
}

interface AudioPlayerProps {
  lyrics: Lyric[];
}

const AudioPlayer = ({ lyrics }: AudioPlayerProps) => {
  const sound = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0); // Song duration in seconds
  const [position, setPosition] = useState<number>(0); // Current playback position in seconds
  const [isSeeking, setIsSeeking] = useState<boolean>(false); // Whether the user is dragging the slider

  const loadAudio = async () => {
    const { sound: playbackSound, status } = await Audio.Sound.createAsync(
      require("../assets/test.mp3"), // Replace with your audio file
      { shouldPlay: false }
    );
    sound.current = playbackSound;

    if (status.isLoaded && status.durationMillis) {
      setDuration(status.durationMillis / 1000);
    }
  };

  useEffect(() => {
    loadAudio();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTrackingTime = () => {
    intervalRef.current = setInterval(async () => {
      if (sound.current) {
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          setPosition(status.positionMillis / 1000);
        }
      }
    }, 100);
  };

  const playPause = async () => {
    if (sound.current) {
      const status = await sound.current.getStatusAsync();
      if (status.isPlaying) {
        await sound.current.pauseAsync();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        await sound.current.playAsync();
        startTrackingTime();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (sound.current) {
      setIsSeeking(false); // User finished dragging
      setPosition(value); // Update UI
      await sound.current.setPositionAsync(value * 1000); // Convert to milliseconds
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.controls}>
      <Button title="Play / Pause" onPress={playPause} />
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={(value) => {
          setIsSeeking(true); // User is dragging
          setPosition(value); // Update UI in real-time
        }}
        onSlidingComplete={handleSeek} // Seek the audio
        minimumTrackTintColor="#1DB954" // Spotify green
        maximumTrackTintColor="#ccc"
        thumbTintColor="#1DB954"
      />
      <View style={styles.timeContainer}>
        <Text>{formatTime(position)}</Text>
        <Text>{formatTime(duration)}</Text>
      </View>
      <LyricScroll
        lyrics={lyrics}
        duration={duration}
        currentTime={position}
        onSeek={handleSeek}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    padding: 20,
    alignItems: "center",
  },
  slider: {
    width: "90%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
});

export default AudioPlayer;
