import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PracticeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Practice</Text>
        <Text className="text-base text-gray-500">Spaced repetition review coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}
