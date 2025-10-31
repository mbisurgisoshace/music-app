import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import _, { set } from "lodash";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
  renderers,
} from "react-native-popup-menu";
import { useState } from "react";
import AudioPlayer from "../../components/AudioPlayer";
import LyricScroll from "../../components/LyricScroll";
import AnimatedNote from "../../components/AnimatedNote";
import { useRef } from "react";
import Animated, { useSharedValue } from "react-native-reanimated";

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

const notation = [
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
  {
    bol: "dha",
    lyric: "",
    notation: "",
  },
];

const { Popover } = renderers;

export default function HomeScreen() {
  const [items, setItems] = useState(notation);
  const [enableScroll, setEnableScroll] = useState(true);

  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        //console.log("gestureState", gestureState);
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        setEnableScroll(true);
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        setEnableScroll(true);
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    })
  ).current;

  const onAddColumnLeft = (currIndex: number) => {
    const newItems = [...items];
    newItems.splice(currIndex, 0, { bol: "left", lyric: "", notation: "" });
    setItems(newItems);
  };

  const onAddColumnRight = (currIndex: number) => {
    const newItems = [...items];
    newItems.splice(currIndex + 1, 0, {
      bol: "right",
      lyric: "",
      notation: "",
    });
    setItems(newItems);
  };

  const generateColumnData = (index: number, note: any): string[] => {
    return [
      (index + 1).toString(),
      ...Object.keys(note).map((key) => note[key]),
    ];
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <MenuProvider>
          <ScrollView
            horizontal={true}
            style={styles.scrollview}
            scrollEnabled={enableScroll}
            {...panResponder.panHandlers}
          >
            {items.map((note, index) => (
              <View key={index} style={styles.column}>
                {generateColumnData(index, note).map((value, i) => (
                  <Menu
                    key={i}
                    renderer={Popover}
                    rendererProps={{ preferredPlacement: "bottom" }}
                  >
                    <MenuTrigger
                      text={value || ""}
                      triggerOnLongPress
                      style={styles.cell}
                      onAlternativeAction={() => {
                        setEnableScroll(false);
                      }}
                    />

                    <MenuOptions>
                      <MenuOption
                        onSelect={() => onAddColumnLeft(index)}
                        text="Add Left"
                      />
                      <MenuOption
                        onSelect={() => onAddColumnRight(index)}
                        text="Add Right"
                      />
                    </MenuOptions>
                  </Menu>
                ))}
              </View>
            ))}
          </ScrollView>
        </MenuProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  cell: {
    height: 25,
    alignItems: "center",
    borderBottomWidth: 1,
    justifyContent: "center",
    borderBottomColor: "black",
  },
  column: {
    width: 35,
    borderRightWidth: 1,
    borderRightColor: "black",
    flexDirection: "column",
    //height: 50,
    // borderWidth: 1,
    // alignItems: "center",
    // borderColor: "black",
    // justifyContent: "center",
  },
  scrollview: {
    margin: 10,
    height: "100%",
    borderWidth: 1,
    borderColor: "black",
    //flexDirection: "column",
  },
});
