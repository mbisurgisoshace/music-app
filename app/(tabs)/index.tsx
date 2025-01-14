import { StyleSheet, SafeAreaView } from "react-native";
import _ from "lodash";
import { useState } from "react";
import AudioPlayer from "../../components/AudioPlayer";
import LyricScroll from "../../components/LyricScroll";
import AnimatedNote from "../../components/AnimatedNote";
import { useRef } from "react";

type Lyric = {
  time: number;
  text: string;
};

const lyrics = [
  { time: 1, text: "I" },
  { time: 2, text: "want" },
  { time: 3, text: "you to know" },
  { time: 6, text: `that I'm` },
  { time: 7, text: `happy` },
  { time: 8, text: `for you` },
  { time: 10, text: "I" },
  { time: 11, text: "wish" },
  { time: 12, text: "nothing but" },
  { time: 14, text: "the best" },
  { time: 15, text: "for" },
  { time: 17, text: "you both" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <AudioPlayer lyrics={lyrics} />
      {/* <LyricScroll
        lyrics={lyrics}
        duration={duration}
        onSeek={handleTimeUpdate}
        currentTime={currentTime}
      />
      <AnimatedNote currentTime={currentTime} lyrics={lyrics} /> */}
    </SafeAreaView>
  );
}
