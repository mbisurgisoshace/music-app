import { useState } from "react";
import Slider from "@react-native-community/slider";
import { Button, View, StyleSheet, Text } from "react-native";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";

type RecordedAudio = {
  file: string;
  sound: Audio.Sound;
  durationInMillis: number;
};

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [recordings, setRecordings] = useState<RecordedAudio[]>([]);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (recording) {
      console.log("Stopping recording..");
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      recordings.push({
        sound,
        file: uri!,
        durationInMillis:
          (status as AVPlaybackStatusSuccess).durationMillis || 0,
      });
      setRecordings([...recordings]);
      console.log("Recording stopped and stored at", uri);
    }
  }

  function formatDuration(durationInMillis: number): string {
    const totalSeconds = Math.floor(durationInMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />

      {recordings.map((recording, index) => {
        return (
          <View key={index} style={styles.sliderContainer}>
            <Slider
              minimumValue={0}
              maximumValue={recording.durationInMillis}
            />
            <Text>{formatDuration(recording.durationInMillis)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  sliderContainer: {},
});
