import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutPage() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">About Gey Sinan</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        {/* Mission */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-emerald-700 mb-3">Why Gey Sinan?</Text>
          <Text className="text-gray-600 mb-4">
            Harari is an endangered Semitic language spoken by approximately 25,000 people,
            primarily in the ancient walled city of Harar, Ethiopia, and by diaspora communities
            across North America, Europe, and the Middle East.
          </Text>
          <Text className="text-gray-600 mb-4">
            "Gey Sinan" means "language of the city" — the language of Harar.
            As younger generations grow up far from Harar, many become receptive bilinguals:
            they can understand Harari when spoken by family, but struggle to produce it themselves.
          </Text>
          <Text className="text-gray-600">
            This app bridges that gap, transforming passive understanding into active speech through
            structured lessons, spaced repetition, and community-recorded pronunciation guides.
          </Text>
        </View>

        {/* Three Scripts */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-3">Three Scripts, One Language</Text>
          <Text className="text-gray-600 mb-4">
            Harari is unique among Ethiopian languages in its historical use of three writing systems:
          </Text>
          <View className="gap-3">
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center flex-shrink-0">
                <Text className="text-sm font-bold text-emerald-700">A</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Latin</Text>
                <Text className="text-sm text-gray-500">Modern transliteration used in digital contexts</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center flex-shrink-0">
                <Text style={{ fontFamily: 'NotoSansEthiopic-Regular' }} className="text-sm font-bold text-emerald-700">
                  ሀ
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Ge'ez (Ethiopic)</Text>
                <Text className="text-sm text-gray-500">The traditional Ethiopian script used in formal contexts</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center flex-shrink-0">
                <Text style={{ fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }} className="text-sm font-bold text-emerald-700">
                  ع
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Arabic</Text>
                <Text className="text-sm text-gray-500">Historical script reflecting Harar's Islamic heritage</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dictionary */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-3">The Dictionary</Text>
          <Text className="text-gray-600 mb-4">
            The app's vocabulary is drawn from Wolf Leslau's Etymological Dictionary of Harari,
            containing 4,629 entries — the most comprehensive Harari lexicon ever compiled.
            Words are curated into learning tiers, starting with survival vocabulary and expanding
            to cultural and conversational fluency.
          </Text>
          <Text className="text-gray-600">
            Historical spellings from Richard Burton's 1894 "First Footsteps in East Africa"
            and modern usage from community sources supplement the dictionary entries.
          </Text>
        </View>

        {/* Community */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-3">Community Voices</Text>
          <Text className="text-gray-600 mb-4">
            At community gatherings, we set up recording stations where native speakers can
            contribute their pronunciations. These recordings become the audio foundation of the app,
            ensuring learners hear authentic Harari from real community members.
          </Text>
          <Text className="text-gray-600">
            Every recording contributes to preserving Harari for future generations and may help
            develop speech recognition technology for an underrepresented language.
          </Text>
        </View>

        {/* Sources */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-3">Sources & Attribution</Text>
          <View className="gap-2">
            <Text className="text-sm text-gray-600">Wolf Leslau — Etymological Dictionary of Harari (4,629 entries)</Text>
            <Text className="text-sm text-gray-600">Richard Burton — First Footsteps in East Africa (1894)</Text>
            <Text className="text-sm text-gray-600">Glosbe — Community-contributed translations</Text>
            <Text className="text-sm text-gray-600">harar.city — Cultural and identity vocabulary</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-4">
          <Text style={{ fontFamily: 'NotoSansEthiopic-Bold' }} className="text-emerald-700 text-lg">
            ጌይ ሲናን
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Preserving the language of Harar for future generations
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
