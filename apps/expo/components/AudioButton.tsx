import { useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AudioButtonProps {
  audioUrl: string | null;
  size?: number;
}

export default function AudioButton({ audioUrl, size = 24 }: AudioButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');

  const handlePress = async () => {
    if (!audioUrl || status !== 'idle') return;

    if (Platform.OS === 'web') {
      // Use the browser's built-in Audio API on web
      setStatus('loading');
      try {
        const audio = new window.Audio(audioUrl);
        audio.onended = () => setStatus('idle');
        audio.onerror = () => setStatus('idle');
        await audio.play();
        setStatus('playing');
      } catch {
        setStatus('idle');
      }
      return;
    }

    // Native: use expo-av
    setStatus('loading');
    try {
      const { Audio } = await import('expo-av');
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
    <TouchableOpacity
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
    </TouchableOpacity>
  );
}
