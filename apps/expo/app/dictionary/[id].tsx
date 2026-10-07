import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadCorpus } from '@/lib/corpus';
import { config } from '@/lib/config';
import { CorpusWord, FixIssueType } from '@/lib/types';
import AudioButton from '@/components/AudioButton';

const issueTypes: { value: FixIssueType; label: string }[] = [
  { value: 'spelling', label: 'Spelling' },
  { value: 'meaning', label: 'Meaning' },
  { value: 'usage', label: 'Usage' },
  { value: 'other', label: 'Other' },
];

export default function DictionaryEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [word, setWord] = useState<CorpusWord | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadCorpus().then((corpus) => {
      if (cancelled) return;
      setWord(corpus.words.find((w) => w.id === id) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (word === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator color="#059669" />
      </SafeAreaView>
    );
  }

  if (word === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-8">
        <Text className="text-xl font-semibold text-gray-900 mb-2">Entry not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-emerald-600">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Entry</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* Word card */}
        <View className="bg-white rounded-2xl shadow-sm p-6 items-center">
          <Text className="text-3xl font-bold text-gray-900 text-center">{word.harariLatin}</Text>
          <Text className="text-lg text-gray-600 mt-2 text-center">{word.english}</Text>
          <View className="mt-4">
            <AudioButton audioUrl={word.audioUrl ?? null} />
          </View>

          <View className="mt-6 pt-4 border-t border-gray-200 w-full flex-row gap-4">
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs mb-1">Latin</Text>
              <Text className="text-gray-700 text-center">{word.harariLatin}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs mb-1">Ge'ez</Text>
              <Text
                style={{ fontFamily: 'NotoSansEthiopic-Regular' }}
                className="text-gray-700 text-center"
              >
                {word.harariEthiopic || '—'}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs mb-1">Arabic</Text>
              <Text
                style={{ fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }}
                className="text-gray-700 text-center"
              >
                {word.harariArabic || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View className="bg-white rounded-xl p-4 shadow-sm gap-3">
          <Row label="Category (part of speech)" value={word.category} />
          {word.source && <Row label="Source" value={word.source} />}
          {word.verified && <Row label="Verification" value={word.verified} />}
          {word.notes && <Row label="Notes" value={word.notes} />}
        </View>

        {/* Suggest a fix */}
        <SuggestFixForm word={word} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-gray-400 uppercase tracking-wide">{label}</Text>
      <Text className="text-gray-800 mt-0.5 capitalize">{value}</Text>
    </View>
  );
}

function SuggestFixForm({ word }: { word: CorpusWord }) {
  const [issueType, setIssueType] = useState<FixIssueType>('spelling');
  const [suggestion, setSuggestion] = useState('');
  const [comment, setComment] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const enabled = Boolean(config.feedbackUrl);
  const canSubmit = enabled && suggestion.trim().length > 0 && status !== 'sending';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');

    const payload = {
      entryId: word.id,
      harariLatin: word.harariLatin,
      english: word.english,
      issueType,
      suggestion: suggestion.trim(),
      comment: comment.trim() || undefined,
      contributorName: contributorName.trim() || undefined,
      contributorEmail: contributorEmail.trim() || undefined,
    };

    try {
      // Google Apps Script web apps respond with a 302 redirect that the
      // fetch spec turns into an opaque response under no-cors. We can't
      // read the body, but a request that doesn't throw is our best signal
      // of success for this fire-and-forget submission.
      await fetch(config.feedbackUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      setStatus('sent');
      setSuggestion('');
      setComment('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <View className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 items-center">
        <Ionicons name="checkmark-circle" size={28} color="#059669" />
        <Text className="text-emerald-800 font-medium mt-2">Thanks for the correction!</Text>
        <Text className="text-emerald-700 text-sm mt-1 text-center">
          A volunteer will review your suggestion.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm gap-3">
      <Text className="font-semibold text-gray-900">Suggest a fix</Text>

      {!enabled ? (
        <Text className="text-sm text-gray-500">
          Fix suggestions aren't accepted yet on this build. Check back soon.
        </Text>
      ) : (
        <>
          <View className="flex-row flex-wrap gap-2">
            {issueTypes.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setIssueType(value)}
                className={`px-3 py-1.5 rounded-full border ${
                  issueType === value
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-sm font-medium ${issueType === value ? 'text-white' : 'text-gray-600'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Suggested correction *</Text>
            <TextInput
              value={suggestion}
              onChangeText={setSuggestion}
              placeholder="What should this be?"
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900"
              multiline
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Comment (optional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Any extra context…"
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900"
              multiline
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">Your name (optional)</Text>
              <TextInput
                value={contributorName}
                onChangeText={setContributorName}
                placeholder="Name"
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">Email (optional)</Text>
              <TextInput
                value={contributorEmail}
                onChangeText={setContributorEmail}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900"
              />
            </View>
          </View>

          {status === 'error' && (
            <Text className="text-sm text-red-600">
              Something went wrong sending your suggestion. Please try again.
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`py-3 rounded-xl items-center ${canSubmit ? 'bg-emerald-600' : 'bg-gray-200'}`}
          >
            <Text className={`font-medium ${canSubmit ? 'text-white' : 'text-gray-400'}`}>
              {status === 'sending' ? 'Sending…' : 'Submit suggestion'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
