import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@/stores/useProgress';
import LessonCard from '@/components/LessonCard';
import { Lesson } from '@/lib/types';
import lessonsData from '@/data/lessons.json';

const allLessons = lessonsData as unknown as Lesson[];

function groupByUnit(lessons: Lesson[]): Record<number, Lesson[]> {
  return lessons.reduce((acc, lesson) => {
    if (!acc[lesson.unit]) {
      acc[lesson.unit] = [];
    }
    acc[lesson.unit].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);
}

const unitTitles: Record<number, string> = {
  1: 'Greetings & Introductions',
  2: 'Family Terms',
  3: 'Numbers & Counting',
  4: 'Colors & Descriptions',
  5: 'Food & Drink',
  6: 'Body Parts',
  7: 'Common Verbs',
  8: 'Home & Places',
  9: 'People & Animals',
  10: 'Pronouns',
  11: 'Daily Actions',
  12: 'Food & Cooking',
  13: 'Around the House',
  14: 'At the Market',
  15: 'Emotions & Descriptions',
};

export default function HomeScreen() {
  const { streak, getStats, getTotalWordsLearned, getWordsDue } = useProgress();

  const stats = useMemo(() => getStats(), []);
  const totalWordsLearned = useMemo(() => getTotalWordsLearned(), []);
  const wordsDueCount = useMemo(() => getWordsDue().length, []);
  const lessonsByUnit = useMemo(() => groupByUnit(allLessons), []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-emerald-700">Gey Sinan</Text>
            <Text className="text-sm text-gray-500">Learn Harari</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/about' as never)}
            className="p-2 rounded-lg"
          >
            <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Stats cards */}
        <View className="flex-row gap-3 mb-6">
          {/* Streak */}
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                <Ionicons name="flame" size={20} color="#d97706" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">{streak.current}</Text>
                <Text className="text-xs text-gray-500">Day streak</Text>
              </View>
            </View>
          </View>

          {/* Words learned */}
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                <Ionicons name="school" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">{totalWordsLearned}</Text>
                <Text className="text-xs text-gray-500">Words learned</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Review button */}
        {wordsDueCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/practice' as never)}
            className="mb-6 p-4 bg-emerald-500 rounded-xl"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-white">Review words</Text>
                <Text className="text-sm text-emerald-100">
                  {wordsDueCount} words due for review
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}

        {/* Word stats */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <Text className="font-semibold text-gray-900 mb-3">Your Progress</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-blue-600">{stats.new}</Text>
              <Text className="text-xs text-gray-500">New</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-amber-600">{stats.learning}</Text>
              <Text className="text-xs text-gray-500">Learning</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-emerald-600">{stats.mastered}</Text>
              <Text className="text-xs text-gray-500">Mastered</Text>
            </View>
          </View>
        </View>

        {/* Lessons by unit */}
        <View className="gap-6">
          {Object.entries(lessonsByUnit).map(([unit, lessons]) => (
            <View key={unit}>
              <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Unit {unit}: {unitTitles[Number(unit)] ?? ''}
              </Text>
              <View className="gap-3">
                {[...lessons]
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
