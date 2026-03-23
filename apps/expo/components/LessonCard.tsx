import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '@/lib/types';
import { useProgress } from '@/stores/useProgress';

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const { getLessonStatus } = useProgress();
  const status = getLessonStatus(lesson.id);

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const cardContent = (
    <View
      className={`relative p-4 rounded-xl shadow-sm ${
        isLocked
          ? 'bg-gray-100 opacity-60'
          : isCompleted
          ? 'bg-gray-50'
          : isInProgress
          ? 'bg-emerald-50 border-l-4 border-emerald-500'
          : 'bg-white'
      }`}
    >
      {/* Lock overlay */}
      {isLocked && (
        <View className="absolute inset-0 items-center justify-center z-10 pointer-events-none">
          <Ionicons name="lock-closed" size={32} color="#9ca3af" />
        </View>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <View className="absolute top-2 right-2">
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
      )}

      <View className="flex-row items-start gap-4">
        <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center flex-shrink-0">
          <Text className="text-lg font-bold text-emerald-700">
            {lesson.unit}.{lesson.order}
          </Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
            {lesson.description}
          </Text>
          <Text className="text-xs text-gray-400 mt-2">
            {lesson.wordIds.length} words
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={`/learn/${lesson.id}` as any} asChild>
      <Pressable>{cardContent}</Pressable>
    </Link>
  );
}
