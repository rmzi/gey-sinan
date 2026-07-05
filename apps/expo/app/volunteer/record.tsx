import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadCorpus } from '@/lib/corpus';
import { config } from '@/lib/config';
import {
  generateSpeakerId,
  saveActiveSpeaker,
  getActiveSpeaker,
  pickRecordingMimeType,
  uploadRecording,
} from '@/lib/volunteer';
import { CorpusWord, Speaker } from '@/lib/types';

type Stage = 'loading' | 'setup' | 'consent' | 'record' | 'done';
type WordStepState = 'ready' | 'recording' | 'review';
type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export default function VolunteerRecordScreen() {
  const [stage, setStage] = useState<Stage>('loading');
  const [words, setWords] = useState<CorpusWord[]>([]);

  // Speaker form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dialectNotes, setDialectNotes] = useState('');
  const [consentApp, setConsentApp] = useState(false);
  const [consentPreservation, setConsentPreservation] = useState(false);
  const [consentML, setConsentML] = useState(false);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);

  // Recording session state
  const [wordIndex, setWordIndex] = useState(0);
  const [step, setStep] = useState<WordStepState>('ready');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({});
  const [sessionCount, setSessionCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Load words needing audio + any existing speaker session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [corpus, existingSpeaker] = await Promise.all([loadCorpus(), getActiveSpeaker()]);
      if (cancelled) return;

      const needsAudio = corpus.words.filter((w) => !w.audioUrl);
      setWords(needsAudio);

      if (existingSpeaker) {
        setSpeaker(existingSpeaker);
        setStage('record');
      } else {
        setStage('setup');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [audioUrl]);

  const currentWord = words[wordIndex];
  const canProceedToConsent = name.trim().length > 0;
  const canSubmitConsent = consentApp && consentPreservation;

  const handleCreateSpeaker = async () => {
    const newSpeaker: Speaker = {
      id: generateSpeakerId(),
      name: name.trim(),
      ageRange: '26-35',
      gender: 'prefer-not-to-say',
      fluencyLevel: 'native',
      dialectNotes: dialectNotes.trim(),
      consent: {
        appUse: consentApp,
        languagePreservation: consentPreservation,
        mlTraining: consentML,
        attribution: 'name',
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    await saveActiveSpeaker(newSpeaker);
    setSpeaker(newSpeaker);
    setStage('record');
  };

  const handleStartRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      const type = pickRecordingMimeType();
      const recorder = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioBlob(blob);
        setMimeType(recorder.mimeType);
        setAudioUrl(URL.createObjectURL(blob));
        setStep('review');
        stream.getTracks().forEach((t) => t.stop());
      };

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStep('recording');
    } catch {
      setError('Could not access the microphone. Check your browser permissions.');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setStep('ready');
  };

  const advanceWord = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setStep('ready');
    if (wordIndex < words.length - 1) {
      setWordIndex((i) => i + 1);
    } else {
      setStage('done');
    }
  }, [audioUrl, wordIndex, words.length]);

  const handleAccept = async () => {
    if (!audioBlob || !speaker || !currentWord) return;

    setUploadStatuses((prev) => ({ ...prev, [currentWord.id]: 'uploading' }));
    setSessionCount((c) => c + 1);

    if (!config.uploadUrl) {
      // No upload endpoint configured — treat as a local-only dry run.
      setUploadStatuses((prev) => ({ ...prev, [currentWord.id]: 'failed' }));
      advanceWord();
      return;
    }

    try {
      await uploadRecording(config.uploadUrl, speaker.id, currentWord.id, audioBlob, mimeType || 'audio/webm');
      setUploadStatuses((prev) => ({ ...prev, [currentWord.id]: 'uploaded' }));
    } catch {
      setUploadStatuses((prev) => ({ ...prev, [currentWord.id]: 'failed' }));
    }
    advanceWord();
  };

  const handleSkip = () => advanceWord();

  const uploadedCount = useMemo(
    () => Object.values(uploadStatuses).filter((s) => s === 'uploaded').length,
    [uploadStatuses]
  );
  const failedCount = useMemo(
    () => Object.values(uploadStatuses).filter((s) => s === 'failed').length,
    [uploadStatuses]
  );

  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-8">
        <Text className="text-gray-600 text-center">
          Recording is currently only available on the web version of Gey Sinan.
        </Text>
      </SafeAreaView>
    );
  }

  if (stage === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Loading…</Text>
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
          <Text className="text-lg font-semibold text-gray-900">Recording Station</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
        {stage === 'setup' && (
          <View className="gap-4">
            <Text className="text-xl font-bold text-gray-900">Tell us about yourself</Text>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900"
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Email (optional)</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900"
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Dialect notes (optional)</Text>
              <TextInput
                value={dialectNotes}
                onChangeText={setDialectNotes}
                placeholder="Region, family background, etc."
                multiline
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900"
              />
            </View>
            <TouchableOpacity
              onPress={() => setStage('consent')}
              disabled={!canProceedToConsent}
              className={`py-3 rounded-xl items-center ${canProceedToConsent ? 'bg-emerald-600' : 'bg-gray-200'}`}
            >
              <Text className={`font-medium ${canProceedToConsent ? 'text-white' : 'text-gray-400'}`}>
                Continue to consent
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'consent' && (
          <View className="gap-4">
            <Text className="text-xl font-bold text-gray-900">Consent</Text>
            <ConsentRow
              title="Use in Gey Sinan app *"
              description="Your recordings will be used as pronunciation examples in the app."
              checked={consentApp}
              onToggle={() => setConsentApp((v) => !v)}
            />
            <ConsentRow
              title="Language preservation *"
              description="Your recordings contribute to preserving Harari for future generations."
              checked={consentPreservation}
              onToggle={() => setConsentPreservation((v) => !v)}
            />
            <ConsentRow
              title="Machine learning (optional)"
              description="Your recordings may be used to train speech models for Harari."
              checked={consentML}
              onToggle={() => setConsentML((v) => !v)}
            />
            <Text className="text-xs text-gray-400">* Required to continue.</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStage('setup')}
                className="flex-1 py-3 bg-gray-200 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-medium">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateSpeaker}
                disabled={!canSubmitConsent}
                className={`flex-1 py-3 rounded-xl items-center ${canSubmitConsent ? 'bg-emerald-600' : 'bg-gray-200'}`}
              >
                <Text className={`font-medium ${canSubmitConsent ? 'text-white' : 'text-gray-400'}`}>
                  Start recording
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {stage === 'record' && currentWord && speaker && (
          <View className="gap-6">
            <View>
              <Text className="text-sm text-gray-500">Recording as {speaker.name}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {wordIndex + 1} of {words.length} · {sessionCount} recorded this session
                {failedCount > 0 ? ` · ${failedCount} failed to upload` : ''}
              </Text>
            </View>

            <View className="bg-white rounded-2xl shadow-sm p-8 items-center">
              <Text className="text-3xl font-bold text-gray-900 text-center">
                {currentWord.harariLatin}
              </Text>
              <Text className="text-lg text-gray-500 mt-2">{currentWord.english}</Text>
              <Text className="text-xs text-gray-400 mt-2 capitalize">{currentWord.category}</Text>
            </View>

            {error && <Text className="text-sm text-red-600 text-center">{error}</Text>}

            <View className="items-center gap-3">
              {step === 'ready' && (
                <TouchableOpacity
                  onPress={handleStartRecording}
                  className="w-20 h-20 rounded-full bg-red-600 items-center justify-center shadow-lg"
                >
                  <Ionicons name="mic" size={32} color="white" />
                </TouchableOpacity>
              )}
              {step === 'ready' && <Text className="text-gray-500 text-sm">Tap to record</Text>}

              {step === 'recording' && (
                <TouchableOpacity
                  onPress={handleStopRecording}
                  className="w-20 h-20 rounded-full bg-red-600 items-center justify-center shadow-lg"
                >
                  <View style={{ width: 24, height: 24, backgroundColor: 'white', borderRadius: 4 }} />
                </TouchableOpacity>
              )}
              {step === 'recording' && <Text className="text-gray-500 text-sm">Tap to stop</Text>}

              {step === 'review' && audioUrl && (
                <View className="w-full gap-3">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio src={audioUrl} controls style={{ width: '100%' }} />
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleReRecord}
                      className="flex-1 py-3 bg-gray-200 rounded-xl items-center"
                    >
                      <Text className="text-gray-700 font-medium">Re-record</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAccept}
                      className="flex-1 py-3 bg-emerald-600 rounded-xl items-center"
                    >
                      <Text className="text-white font-medium">Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={handleSkip} className="items-center">
              <Text className="text-gray-400 text-sm underline">Skip this word</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'record' && !currentWord && (
          <View className="items-center py-16">
            <Text className="text-gray-600 text-center">
              No more words need recordings right now. Thank you!
            </Text>
          </View>
        )}

        {stage === 'done' && (
          <View className="items-center py-16 gap-4">
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center">
              <Ionicons name="checkmark" size={40} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">All done!</Text>
            <Text className="text-gray-600 text-center">
              You recorded {uploadedCount} word{uploadedCount === 1 ? '' : 's'} this session.
              {failedCount > 0 ? ` ${failedCount} couldn't upload — check your connection.` : ''}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/volunteer' as never)}
              className="px-6 py-3 bg-emerald-600 rounded-xl"
            >
              <Text className="text-white font-medium">Back to volunteer home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-start gap-3 p-4 bg-white rounded-xl border border-gray-200"
    >
      <View
        className={`w-5 h-5 rounded mt-0.5 items-center justify-center ${
          checked ? 'bg-emerald-600' : 'border border-gray-300'
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      </View>
    </TouchableOpacity>
  );
}
