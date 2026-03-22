import { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProgress } from '@/stores/useProgress';
import ScriptToggle from '@/components/ScriptToggle';

export default function SettingsScreen() {
  const { settings, streak, getStats, getTotalWordsLearned } = useProgress();

  const stats = useMemo(() => getStats(), []);
  const totalWords = useMemo(() => getTotalWordsLearned(), []);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // The MMKV store will be re-initialized with defaults on next launch
            // For now, navigate back to home
            router.replace('/' as never);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-lg font-semibold text-gray-900 text-center">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        {/* Script Selection */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-1">Writing System</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Choose which script to display Harari words in
          </Text>
          <ScriptToggle />
        </View>

        {/* Stats */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-3">Your Statistics</Text>
          <View className="gap-0">
            {[
              { label: 'Current Streak', value: `${streak.current} days`, color: 'text-gray-900' },
              { label: 'Words Learned', value: String(totalWords), color: 'text-gray-900' },
              { label: 'New Words', value: String(stats.new), color: 'text-blue-600' },
              { label: 'Learning', value: String(stats.learning), color: 'text-amber-600' },
              { label: 'Mastered', value: String(stats.mastered), color: 'text-emerald-600' },
              { label: 'Due for Review', value: String(stats.dueToday), color: 'text-gray-900' },
            ].map(({ label, value, color }, index, arr) => (
              <View
                key={label}
                className={`flex-row justify-between items-center py-2 ${
                  index < arr.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Text className="text-gray-600">{label}</Text>
                <Text className={`font-semibold ${color}`}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-3">About Gey Sinan</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Gey Sinan means "language of the city" in Harari — the language of Harar.
            This app is designed to help Harari diaspora youth reconnect with their ancestral language
            through interactive lessons and spaced repetition.
          </Text>
          <Pressable onPress={() => router.push('/about' as never)}>
            <Text className="text-sm text-emerald-600 font-medium">
              Learn more about this project
            </Text>
          </Pressable>
        </View>

        {/* Data / Reset */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-3">Data</Text>
          <Text className="text-sm text-gray-500 mb-4">
            Your progress is stored locally on your device.
          </Text>
          <Pressable
            onPress={handleResetProgress}
            className="px-4 py-2 bg-red-50 rounded-lg self-start"
          >
            <Text className="text-sm font-medium text-red-600">Reset All Progress</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
