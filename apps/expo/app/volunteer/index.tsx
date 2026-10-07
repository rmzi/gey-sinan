import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VolunteerLandingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-8" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <View className="items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
            <Ionicons name="mic" size={32} color="#059669" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Help preserve Harari
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Record your voice speaking Harari words and phrases
          </Text>
        </View>

        {/* What */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">What is this?</Text>
          <Text className="text-gray-600">
            The Gey Sinan recording station lets any Harari speaker contribute a short
            audio clip for each word in the dictionary. Those recordings become the
            pronunciation guides that learners hear throughout the app.
          </Text>
        </View>

        {/* Why */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">Why it matters</Text>
          <Text className="text-gray-600 mb-3">
            Harari is spoken by roughly 25,000 people. Written dictionaries capture
            spelling, but only real speakers can capture how the language actually
            sounds — its rhythm, stress, and dialect variation.
          </Text>
          <Text className="text-gray-600">
            Every recording helps a learner hear authentic Harari, and may one day
            help train speech technology for an underrepresented language.
          </Text>
        </View>

        {/* How */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">How it works</Text>
          <View className="gap-3">
            <Step number={1} text="Tell us a bit about yourself and give consent" />
            <Step number={2} text="Read each word or phrase prompt aloud" />
            <Step number={3} text="Review your recording, then move to the next word" />
          </View>
          <Text className="text-sm text-gray-400 mt-3">
            Takes about 10-15 seconds per word. Stop anytime — your progress is saved.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/volunteer/record' as never)}
          className="py-4 bg-emerald-600 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-base">Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/dictionary' as never)} className="py-2 items-center">
          <Text className="text-emerald-700 text-sm">Browse the dictionary instead</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center flex-shrink-0 mt-0.5">
        <Text className="text-xs font-bold text-emerald-700">{number}</Text>
      </View>
      <Text className="flex-1 text-gray-600">{text}</Text>
    </View>
  );
}
