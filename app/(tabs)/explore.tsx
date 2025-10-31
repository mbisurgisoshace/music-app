import AudioPlayer from "@/components/AudioPlayer";
import { StyleSheet, View } from "react-native";

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

export default function TabTwoScreen() {
  return (
    <View>
      <AudioPlayer lyrics={lyrics} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
