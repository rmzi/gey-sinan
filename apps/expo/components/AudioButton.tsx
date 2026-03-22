import { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface AudioButtonProps {
  audioUrl: string | null;
  size?: number;
}

export default function AudioButton({ audioUrl, size = 24 }: AudioButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');

  const handlePress = async () => {
    if (!audioUrl || status !== 'idle') return;

    setStatus('loading');
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setStatus('playing');
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
          setStatus('idle');
          sound.unloadAsync();
        }
      });
    } catch {
      setStatus('idle');
    }
  };

  const isDisabled = !audioUrl || status !== 'idle';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={`w-12 h-12 rounded-full bg-emerald-100 items-center justify-center ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      <Ionicons
        name={status === 'playing' ? 'volume-high' : 'volume-medium'}
        size={size}
        color="#059669"
      />
    </Pressable>
  );
}
