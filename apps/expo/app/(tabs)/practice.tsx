import { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@/stores/useProgress';
import Flashcard from '@/components/Flashcard';
import ScriptToggle from '@/components/ScriptToggle';
import ProgressBar from '@/components/ProgressBar';
import { Word, ReviewQuality } from '@/lib/types';
import wordsData from '@/data/words.json';

const allWords = wordsData as unknown as Word[];

export default function PracticeScreen() {
  const { getWordsDue, reviewWord, updateStreak, wordProgress, initializeWordProgress } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    let dueWords = getWordsDue();

    if (dueWords.length === 0) {
      dueWords = Object.keys(wordProgress);
    }

    if (dueWords.length === 0) {
      const newWordIds = allWords.slice(0, 10).map(w => w.id);
      initializeWordProgress(newWordIds);
      dueWords = newWordIds;
    }

    const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
    setSessionWords(shuffled);
  }, [initialized]);

  const currentWord = useMemo(() => {
    if (sessionWords.length === 0 || currentIndex >= sessionWords.length) return null;
    const wordId = sessionWords[currentIndex];
    return allWords.find(w => w.id === wordId) || null;
  }, [sessionWords, currentIndex]);

  const handleReview = (quality: ReviewQuality) => {
    if (!currentWord) return;
    reviewWord(currentWord.id, quality);
    updateStreak();
    setReviewed(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
  };

  const isComplete = currentIndex >= sessionWords.length && sessionWords.length > 0;
  const progress = sessionWords.length > 0 ? reviewed / sessionWords.length : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View style={{ width: 24 }} />
          <Text className="text-lg font-semibold text-gray-900">Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">{reviewed} reviewed</Text>
            <Text className="text-sm text-gray-500">
              {Math.max(0, sessionWords.length - currentIndex)} remaining
            </Text>
          </View>
          <ProgressBar progress={progress} />
        </View>
      </View>

      <View className="flex-1 px-4 py-8">
        {/* Script toggle */}
        <View className="items-center mb-6">
          <ScriptToggle />
        </View>

        {isComplete ? (
          /* Session complete */
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-6">
              <Ionicons name="checkmark" size={40} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</Text>
            <Text className="text-gray-600 mb-6">You reviewed {reviewed} words</Text>
            <View className="w-full gap-3">
              <Pressable
                onPress={() => router.push('/' as never)}
                className="w-full py-3 bg-emerald-600 rounded-xl items-center"
              >
                <Text className="text-white font-medium">Back to Home</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setCurrentIndex(0);
                  setReviewed(0);
                  const shuffled = [...sessionWords].sort(() => Math.random() - 0.5);
                  setSessionWords(shuffled);
                }}
                className="w-full py-3 bg-white rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-gray-700 font-medium">Practice Again</Text>
              </Pressable>
            </View>
          </View>
        ) : currentWord ? (
          /* Current flashcard */
          <Flashcard word={currentWord} onReview={handleReview} />
        ) : (
          /* No words to review */
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
              <Ionicons name="book-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No words to review</Text>
            <Text className="text-gray-600 mb-6 text-center">
              Start a lesson to learn new words!
            </Text>
            <Pressable
              onPress={() => router.push('/' as never)}
              className="px-6 py-3 bg-emerald-600 rounded-xl"
            >
              <Text className="text-white font-medium">Go to Lessons</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
