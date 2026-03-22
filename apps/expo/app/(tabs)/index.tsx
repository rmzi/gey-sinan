import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Gey Sinan</Text>
        <Text className="text-lg text-gray-600 mb-6">ጌይ ሲናን — Language of the City</Text>
        <Text className="text-base text-gray-500">Learning experience coming soon...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
