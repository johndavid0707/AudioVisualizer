import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Waveform,
  type IWaveformRef,
} from '@simform_solutions/react-native-audio-waveform';
import * as DocumentPicker from 'expo-document-picker';

type PlayerState = 'playing' | 'paused' | 'stopped';

// Android native waveform library needs a plain file path, not a file:// URI
const toNativePath = (uri: string) =>
  decodeURIComponent(uri.replace(/^file:\/\//, ''));

export default function Index() {
  const waveformRef = useRef<IWaveformRef>(null);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('stopped');
  const [fileName, setFileName] = useState('');

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAudioPath(toNativePath(asset.uri));
        setFileName(asset.name || 'Selected audio');
        setPlayerState('stopped');
      }
    } catch (err) {
      console.log('Error picking audio file:', err);
    }
  };

  const handlePlayPause = async () => {
    if (!waveformRef.current) return;

    try {
      if (playerState === 'playing') {
        await waveformRef.current.pausePlayer();
      } else if (playerState === 'paused') {
        await waveformRef.current.resumePlayer();
      } else {
        await waveformRef.current.startPlayer({});
      }
    } catch (err) {
      console.log('Playback error:', err);
    }
  };

  const handleStop = async () => {
    if (!waveformRef.current) return;
    try {
      await waveformRef.current.stopPlayer();
      setPlayerState('stopped');
    } catch (err) {
      console.log('Stop error:', err);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Audio Frequency Visualizer</Text>

        <TouchableOpacity style={styles.pickButton} onPress={pickAudio}>
          <Text style={styles.pickButtonText}>
            {audioPath ? 'Change Audio File' : 'Pick Audio File'}
          </Text>
        </TouchableOpacity>

        {fileName ? <Text style={styles.fileName}>{fileName}</Text> : null}

        {audioPath && (
          <>
            <View style={styles.waveformBox}>
              <Waveform
                key={audioPath}
                mode="static"
                ref={waveformRef}
                path={audioPath}
                candleSpace={2}
                candleWidth={4}
                candleHeightScale={4}
                waveColor="#3a4550"
                scrubColor="#4CD964"
                containerStyle={styles.waveform}
                onPlayerStateChange={(state) =>
                  setPlayerState(state as PlayerState)
                }
                onError={(err) => console.log('Waveform error:', err)}
              />
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={handlePlayPause}
              >
                <Text style={styles.controlText}>
                  {playerState === 'playing' ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}
              >
                <Text style={styles.controlText}>Stop</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.stateLabel}>State: {playerState}</Text>
          </>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#101418' },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 24 },
  pickButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pickButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fileName: { color: '#9ca3af', marginTop: 12, fontSize: 13 },
  waveformBox: {
    width: '100%',
    height: 100,
    marginTop: 30,
    backgroundColor: '#1a2027',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  waveform: { flex: 1 },
  controls: { flexDirection: 'row', marginTop: 24, gap: 16 },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  playButton: { backgroundColor: '#16a34a' },
  stopButton: { backgroundColor: '#dc2626' },
  controlText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  stateLabel: { color: '#6b7280', marginTop: 16, fontSize: 12 },
});