import { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@/stores/useProgress';
import { Word, Lesson, ScriptType, ExerciseType } from '@/lib/types';
import AudioButton from '@/components/AudioButton';
import ScriptToggle from '@/components/ScriptToggle';
import ProgressBar from '@/components/ProgressBar';
import wordsData from '@/data/words.json';
import lessonsData from '@/data/lessons.json';

const allWords = wordsData as unknown as Word[];
const allLessons = lessonsData as unknown as Lesson[];

type LessonMode = 'learn' | 'practice' | 'complete';

interface PracticeQuestion {
  type: ExerciseType;
  word: Word;
  answers: string[];
  correctAnswer: string;
  prompt: string;
}

function getWordInScript(word: Word, script: ScriptType): string {
  switch (script) {
    case 'latin': return word.harariLatin;
    case 'ethiopic': return word.harariEthiopic;
    case 'arabic': return word.harariArabic;
    default: return word.harariLatin;
  }
}

function generateQuestions(lessonWords: Word[], exercises: Lesson['exercises']): PracticeQuestion[] {
  if (lessonWords.length < 4) return [];

  const questions: PracticeQuestion[] = [];

  for (const exercise of exercises) {
    const exerciseWords = exercise.wordIds
      .map(id => lessonWords.find(w => w.id === id) || allWords.find(w => w.id === id))
      .filter((w): w is Word => w !== undefined);

    if (exerciseWords.length < 2) continue;

    switch (exercise.type) {
      case 'multiple_choice':
      case 'matching': {
        for (const word of exerciseWords) {
          const otherWords = lessonWords.filter(w => w.id !== word.id);
          const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
          const wrong = shuffled.slice(0, 3).map(w => w.english);
          const answers = [word.english, ...wrong].sort(() => Math.random() - 0.5);
          questions.push({
            type: exercise.type,
            word,
            answers,
            correctAnswer: word.english,
            prompt: 'What does this mean?',
          });
        }
        break;
      }

      case 'script_matching': {
        for (const word of exerciseWords) {
          if (!word.harariEthiopic) continue;
          const otherWords = lessonWords.filter(w => w.id !== word.id && w.harariEthiopic);
          const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
          const wrong = shuffled.slice(0, 3).map(w => w.harariEthiopic);
          const answers = [word.harariEthiopic, ...wrong].sort(() => Math.random() - 0.5);
          questions.push({
            type: 'script_matching',
            word,
            answers,
            correctAnswer: word.harariEthiopic,
            prompt: "Match the Ge'ez script",
          });
        }
        break;
      }

      case 'production': {
        for (const word of exerciseWords) {
          questions.push({
            type: 'production',
            word,
            answers: [],
            correctAnswer: word.harariLatin.toLowerCase(),
            prompt: 'Type in Harari (Latin)',
          });
        }
        break;
      }

      default:
        break;
    }
  }

  return questions;
}

export default function LessonPage() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const {
    startLesson,
    completeLesson,
    initializeWordProgress,
    reviewWord,
    updateStreak,
    settings,
  } = useProgress();

  const lesson = useMemo(() => allLessons.find(l => l.id === lessonId), [lessonId]);

  const lessonWords = useMemo(() => {
    if (!lesson) return [];
    return lesson.wordIds
      .map(id => allWords.find(w => w.id === id))
      .filter((w): w is Word => w !== undefined);
  }, [lesson]);

  const practiceQuestions = useMemo(() => {
    if (!lesson || lessonWords.length < 4) return [];
    return generateQuestions(lessonWords, lesson.exercises);
  }, [lesson, lessonWords]);

  const [mode, setMode] = useState<LessonMode>('learn');
  const [learnIndex, setLearnIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Initialize lesson on mount
  useEffect(() => {
    if (lesson) {
      startLesson(lesson.id);
      initializeWordProgress(lesson.wordIds);
    }
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-xl font-semibold text-gray-900">Lesson not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-emerald-600">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentLearnWord = lessonWords[learnIndex];
  const currentQuestion = practiceQuestions[practiceIndex];

  const handleNextLearnWord = () => {
    if (learnIndex < lessonWords.length - 1) {
      setLearnIndex(prev => prev + 1);
    } else {
      setMode('practice');
    }
  };

  const handlePreviousLearnWord = () => {
    if (learnIndex > 0) {
      setLearnIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      reviewWord(currentQuestion.word.id, 4);
    } else {
      reviewWord(currentQuestion.word.id, 1);
    }
    updateStreak();
  };

  const handleProductionSubmit = () => {
    if (showResult || !currentQuestion) return;
    const normalized = typedAnswer.trim().toLowerCase();
    const correct = currentQuestion.correctAnswer.toLowerCase();
    const isCorrect = normalized === correct;
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      reviewWord(currentQuestion.word.id, 4);
    } else {
      reviewWord(currentQuestion.word.id, 1);
    }
    updateStreak();
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setTypedAnswer('');
    setShowResult(false);
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      completeLesson(lesson.id);
      setMode('complete');
    }
  };

  const learnProgress = (learnIndex + 1) / lessonWords.length;
  const practiceProgress = practiceQuestions.length > 0
    ? (practiceIndex + 1) / practiceQuestions.length
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Compact Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-900">{lesson.title}</Text>
            <Text className="text-xs text-gray-500">
              {mode === 'learn' ? 'Learning' : mode === 'practice' ? 'Practice' : 'Complete'}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {mode !== 'complete' && (
          <View className="mt-2">
            <ProgressBar progress={mode === 'learn' ? learnProgress : practiceProgress} />
          </View>
        )}
      </View>

      <View className="flex-1 px-4 pt-3 pb-4 justify-between">
        {/* Learn Mode */}
        {mode === 'learn' && currentLearnWord && (
          <>
            {/* Script toggle */}
            <View className="items-center mb-2">
              <ScriptToggle />
            </View>

            <View className="flex-1 justify-center">
              <View className="bg-white rounded-2xl shadow-lg p-6 items-center">
                <Text
                  style={
                    settings.script === 'arabic'
                      ? { fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }
                      : settings.script === 'ethiopic'
                      ? { fontFamily: 'NotoSansEthiopic-Regular' }
                      : undefined
                  }
                  className="text-4xl font-bold text-gray-900 mb-3 text-center"
                >
                  {getWordInScript(currentLearnWord, settings.script)}
                </Text>
                <Text className="text-2xl text-gray-600 mb-4">
                  {currentLearnWord.english}
                </Text>
                <AudioButton audioUrl={currentLearnWord.audioUrl || null} size={28} />

                <View className="mt-4 pt-4 border-t border-gray-200 w-full flex-row gap-4">
                  <View className="flex-1 items-center">
                    <Text className="text-gray-400 text-xs mb-1">Latin</Text>
                    <Text className="text-gray-700 text-center">{currentLearnWord.harariLatin}</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-gray-400 text-xs mb-1">Ge'ez</Text>
                    <Text
                      style={{ fontFamily: 'NotoSansEthiopic-Regular' }}
                      className="text-gray-700 text-center"
                    >
                      {currentLearnWord.harariEthiopic}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-gray-400 text-xs mb-1">Arabic</Text>
                    <Text
                      style={{ fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }}
                      className="text-gray-700 text-center"
                    >
                      {currentLearnWord.harariArabic}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  onPress={handlePreviousLearnWord}
                  disabled={learnIndex === 0}
                  className={`px-6 py-3 ${learnIndex === 0 ? 'opacity-30' : ''}`}
                >
                  <Text className="text-gray-600">Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextLearnWord}
                  className="px-8 py-3 bg-emerald-600 rounded-xl"
                >
                  <Text className="text-white font-medium">
                    {learnIndex === lessonWords.length - 1 ? 'Start Practice' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-center text-sm text-gray-500 mt-2">
                {learnIndex + 1} of {lessonWords.length}
              </Text>
            </View>
          </>
        )}

        {/* Practice Mode - no questions available */}
        {mode === 'practice' && !currentQuestion && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Not enough words for practice
            </Text>
            <TouchableOpacity
              onPress={() => {
                completeLesson(lesson.id);
                setMode('complete');
              }}
              className="px-6 py-3 bg-emerald-600 rounded-xl"
            >
              <Text className="text-white font-medium">Complete Lesson</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Practice Mode */}
        {mode === 'practice' && currentQuestion && (
          <>
            {/* Script toggle + exercise badge row */}
            <View className="flex-row items-center justify-between mb-2">
              <ScriptToggle />
              <View className="px-3 py-1 bg-blue-100 rounded-full">
                <Text className="text-xs font-medium text-blue-700">
                  {currentQuestion.type === 'multiple_choice' && 'Multiple Choice'}
                  {currentQuestion.type === 'matching' && 'Matching'}
                  {currentQuestion.type === 'script_matching' && 'Script Matching'}
                  {currentQuestion.type === 'production' && 'Type It'}
                </Text>
              </View>
            </View>

            {/* Question card - compact */}
            <View className="bg-white rounded-xl shadow-sm p-4 items-center mb-3">
              <Text className="text-xs text-gray-500 mb-1">{currentQuestion.prompt}</Text>

              {currentQuestion.type === 'production' ? (
                <Text className="text-2xl font-bold text-gray-900">
                  {currentQuestion.word.english}
                </Text>
              ) : currentQuestion.type === 'script_matching' ? (
                <Text className="text-2xl font-bold text-gray-900">
                  {currentQuestion.word.harariLatin}
                </Text>
              ) : (
                <Text
                  style={
                    settings.script === 'arabic'
                      ? { fontFamily: 'Amiri-Regular', writingDirection: 'rtl' }
                      : settings.script === 'ethiopic'
                      ? { fontFamily: 'NotoSansEthiopic-Regular' }
                      : undefined
                  }
                  className="text-2xl font-bold text-gray-900 text-center"
                >
                  {getWordInScript(currentQuestion.word, settings.script)}
                </Text>
              )}
              <AudioButton audioUrl={currentQuestion.word.audioUrl || null} size={20} />
            </View>

            {/* Answers area - flex to fill remaining space */}
            <View className="flex-1 justify-center">
              {/* Production answer input */}
              {currentQuestion.type === 'production' ? (
                <View className="gap-3">
                  <TextInput
                    value={typedAnswer}
                    onChangeText={setTypedAnswer}
                    onSubmitEditing={() => {
                      if (!showResult) handleProductionSubmit();
                      else handleNextQuestion();
                    }}
                    placeholder="Type the Harari word..."
                    editable={!showResult}
                    className={`w-full p-3 text-lg rounded-xl border-2 text-gray-900 ${
                      showResult
                        ? typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  />

                  {showResult && typedAnswer.trim().toLowerCase() !== currentQuestion.correctAnswer && (
                    <Text className="text-center text-emerald-600 font-medium">
                      Correct: {currentQuestion.word.harariLatin}
                    </Text>
                  )}

                  {!showResult && (
                    <TouchableOpacity
                      onPress={handleProductionSubmit}
                      disabled={typedAnswer.trim().length === 0}
                      className={`w-full py-3 bg-emerald-600 rounded-xl items-center ${
                        typedAnswer.trim().length === 0 ? 'opacity-50' : ''
                      }`}
                    >
                      <Text className="text-white font-medium">Check</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                /* Multiple choice answers */
                <View className="gap-2">
                  {currentQuestion.answers.map((answer, index) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrect = answer === currentQuestion.correctAnswer;
                    const isEthiopic = currentQuestion.type === 'script_matching';

                    let bgClass = 'bg-white border-gray-200';
                    if (showResult) {
                      if (isCorrect) bgClass = 'bg-emerald-50 border-emerald-500';
                      else if (isSelected && !isCorrect) bgClass = 'bg-red-50 border-red-500';
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleAnswerSelect(answer)}
                        disabled={showResult}
                        className={`w-full p-3 rounded-xl border-2 ${bgClass}`}
                      >
                        <Text
                          style={isEthiopic ? { fontFamily: 'NotoSansEthiopic-Regular' } : undefined}
                          className={`font-medium text-gray-900 ${isEthiopic ? 'text-lg' : ''}`}
                        >
                          {answer}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Bottom: Continue button + question counter - always at bottom */}
            <View className="mt-2">
              {showResult ? (
                <TouchableOpacity
                  onPress={handleNextQuestion}
                  className="w-full py-3 bg-emerald-600 rounded-xl items-center"
                >
                  <Text className="text-white font-medium">Continue</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ height: 44 }} />
              )}
              <Text className="text-center text-xs text-gray-400 mt-1">
                {practiceIndex + 1} / {practiceQuestions.length}
              </Text>
            </View>
          </>
        )}

        {/* Complete Mode */}
        {mode === 'complete' && (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Ionicons name="checkmark" size={48} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete!</Text>
            <Text className="text-gray-600 mb-2">
              You learned {lessonWords.length} new words
            </Text>
            <Text className="text-lg font-semibold text-emerald-600 mb-8">
              {correctAnswers} of {practiceQuestions.length} correct
            </Text>

            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-full py-3 bg-emerald-600 rounded-xl items-center"
              >
                <Text className="text-white font-medium">Continue Learning</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMode('learn');
                  setLearnIndex(0);
                  setPracticeIndex(0);
                  setCorrectAnswers(0);
                  setSelectedAnswer(null);
                  setTypedAnswer('');
                  setShowResult(false);
                }}
                className="w-full py-3 bg-white rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-gray-700 font-medium">Practice Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
