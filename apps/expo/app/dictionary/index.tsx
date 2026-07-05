import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadCorpus } from '@/lib/corpus';
import { CorpusWord } from '@/lib/types';

const PAGE_SIZE = 40;

export default function DictionaryScreen() {
  const [words, setWords] = useState<CorpusWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    loadCorpus()
      .then((corpus) => {
        if (!cancelled) setWords(corpus.words);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const w of words) set.add(w.category);
    return Array.from(set).sort();
  }, [words]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (category && w.category !== category) return false;
      if (!q) return true;
      return (
        w.harariLatin.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.harariEthiopic ?? '').includes(q)
      );
    });
  }, [words, query, category]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-xl font-bold text-emerald-700">Harari Dictionary</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {loading ? 'Loading…' : `${filtered.length.toLocaleString()} entries`}
        </Text>

        {/* Search */}
        <View className="flex-row items-center gap-2 mt-3 px-3 py-2 bg-gray-100 rounded-xl">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Harari or English…"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-gray-900"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter */}
        {categories.length > 0 && (
          <FlatList
            data={['all', ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            className="mt-3"
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const isActive = item === 'all' ? category === null : category === item;
              return (
                <TouchableOpacity
                  onPress={() => setCategory(item === 'all' ? null : item)}
                  className={`px-3 py-1.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9ca3af" />
          <Text className="text-gray-600 text-center mt-3">
            Couldn't load the dictionary. Check your connection and try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 8 }}
          onEndReached={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/dictionary/${item.id}` as never)}
              className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-1 min-w-0">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {item.harariLatin}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                  {item.english}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-400 capitalize">{item.category}</Text>
                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-gray-500">No entries match your search.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
