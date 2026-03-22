import { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Word, ScriptType } from '@/lib/types';
import { useProgress } from '@/stores/useProgress';
import AudioButton from './AudioButton';

interface FlashcardProps {
  word: Word;
  showEnglishFirst?: boolean;
  onReview?: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

function getWordInScript(word: Word, script: ScriptType): string {
  switch (script) {
    case 'latin':
      return word.harariLatin;
    case 'ethiopic':
      return word.harariEthiopic;
    case 'arabic':
      return word.harariArabic;
    default:
      return word.harariLatin;
  }
}

export default function Flashcard({ word, showEnglishFirst = false, onReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { settings } = useProgress();
  const rotation = useSharedValue(0);

  const frontText = showEnglishFirst ? word.english : getWordInScript(word, settings.script);
  const backText = showEnglishFirst ? getWordInScript(word, settings.script) : word.english;

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const handleFlip = () => {
    const next = isFlipped ? 0 : 1;
    rotation.value = withTiming(next, { duration: 500 });
    setIsFlipped(!isFlipped);
  };

  const handleQualityRating = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (onReview) {
      onReview(quality);
    }
    rotation.value = withTiming(0, { duration: 300 });
    setIsFlipped(false);
  };

  const frontIsHarari = !showEnglishFirst;
  const backIsHarari = showEnglishFirst;

  return (
    <View className="w-full max-w-md mx-auto">
      {/* Card wrapper */}
      <Pressable onPress={handleFlip} style={{ height: 256 }}>
        <View style={{ flex: 1 }}>
          {/* Front face */}
          <Animated.View
            style={[
              frontStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            className="bg-white rounded-2xl shadow-lg p-6 items-center justify-center"
          >
            <Text
              style={
                frontIsHarari && settings.script === 'arabic'
                  ? { fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }
                  : frontIsHarari && settings.script === 'ethiopic'
                  ? { fontFamily: 'NotoSansEthiopic-Regular' }
                  : undefined
              }
              className="text-3xl font-semibold text-center text-gray-900"
            >
              {frontText}
            </Text>
            <Text className="mt-4 text-sm text-gray-500">Tap to reveal</Text>
          </Animated.View>

          {/* Back face */}
          <Animated.View
            style={[
              backStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            className="bg-emerald-50 rounded-2xl shadow-lg p-6 items-center justify-center"
          >
            <Text
              style={
                backIsHarari && settings.script === 'arabic'
                  ? { fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }
                  : backIsHarari && settings.script === 'ethiopic'
                  ? { fontFamily: 'NotoSansEthiopic-Regular' }
                  : undefined
              }
              className="text-3xl font-semibold text-center text-gray-900"
            >
              {backText}
            </Text>
            <View className="mt-4">
              <AudioButton audioUrl={word.audioUrl || null} />
            </View>
          </Animated.View>
        </View>
      </Pressable>

      {/* Rating buttons - shown when flipped and onReview is provided */}
      {isFlipped && onReview && (
        <View className="mt-6 gap-3">
          <Text className="text-center text-sm text-gray-600">
            How well did you remember?
          </Text>
          <View className="flex-row justify-center gap-2">
            <Pressable
              onPress={() => handleQualityRating(0)}
              className="px-4 py-2 bg-red-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-red-700">Again</Text>
            </Pressable>
            <Pressable
              onPress={() => handleQualityRating(3)}
              className="px-4 py-2 bg-amber-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-amber-700">Hard</Text>
            </Pressable>
            <Pressable
              onPress={() => handleQualityRating(4)}
              className="px-4 py-2 bg-emerald-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-emerald-700">Good</Text>
            </Pressable>
            <Pressable
              onPress={() => handleQualityRating(5)}
              className="px-4 py-2 bg-blue-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-blue-700">Easy</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
