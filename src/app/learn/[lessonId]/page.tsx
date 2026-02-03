'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import AudioButton from '@/components/AudioButton';
import ScriptToggle from '@/components/ScriptToggle';
import ProgressBar from '@/components/ProgressBar';
import { useProgress } from '@/stores/useProgress';
import { Word, Lesson, ScriptType, ReviewQuality } from '@/lib/types';
import wordsData from '@/data/words.json';
import lessonsData from '@/data/lessons.json';

const allWords = wordsData as Word[];
const allLessons = lessonsData as Lesson[];

type LessonMode = 'learn' | 'practice' | 'complete';

function getWordInScript(word: Word, script: ScriptType): string {
  switch (script) {
    case 'latin':
      return word.harariLatin;
    case 'ethiopic':
      return word.harariEthiopic;
    case 'arabic':
      return word.harariArabic;
    default:
      return word.harariLatin;
  }
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const {
    startLesson,
    completeLesson,
    initializeWordProgress,
    reviewWord,
    updateStreak,
    settings,
    isLessonUnlocked,
  } = useProgress();

  const [mode, setMode] = useState<LessonMode>('learn');
  const [learnIndex, setLearnIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lesson = useMemo(() => {
    return allLessons.find(l => l.id === lessonId);
  }, [lessonId]);

  const lessonWords = useMemo(() => {
    if (!lesson) return [];
    return lesson.wordIds
      .map(id => allWords.find(w => w.id === id))
      .filter((w): w is Word => w !== undefined);
  }, [lesson]);

  // Generate practice questions
  const practiceQuestions = useMemo(() => {
    if (lessonWords.length < 4) return [];

    return lessonWords.map(word => {
      // Get 3 wrong answers from other words
      const otherWords = lessonWords.filter(w => w.id !== word.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongAnswers = shuffledOthers.slice(0, 3).map(w => w.english);

      // Combine and shuffle all answers
      const allAnswers = [word.english, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        word,
        answers: allAnswers,
        correctAnswer: word.english,
      };
    });
  }, [lessonWords]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && lesson) {
      startLesson(lesson.id);
      initializeWordProgress(lesson.wordIds);
    }
  }, [mounted, lesson, startLesson, initializeWordProgress]);

  // Check if lesson is unlocked
  useEffect(() => {
    if (mounted && lesson && !isLessonUnlocked(lesson.id)) {
      router.push('/');
    }
  }, [mounted, lesson, isLessonUnlocked, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Lesson not found
          </h1>
          <Link
            href="/"
            className="mt-4 inline-block text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentLearnWord = lessonWords[learnIndex];
  const currentQuestion = practiceQuestions[practiceIndex];

  const handleNextLearnWord = () => {
    if (learnIndex < lessonWords.length - 1) {
      setLearnIndex(prev => prev + 1);
    } else {
      // Move to practice mode
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
      reviewWord(currentQuestion.word.id, 4); // Good rating
    } else {
      reviewWord(currentQuestion.word.id, 1); // Failed
    }
    updateStreak();
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);

    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      // Complete lesson
      completeLesson(lesson.id);
      setMode('complete');
    }
  };

  const learnProgress = ((learnIndex + 1) / lessonWords.length) * 100;
  const practiceProgress = ((practiceIndex + 1) / practiceQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {lesson.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'learn' ? 'Learning' : mode === 'practice' ? 'Practice' : 'Complete'}
              </p>
            </div>
            <div className="w-6" />
          </div>

          {/* Progress */}
          {mode !== 'complete' && (
            <div className="mt-4">
              <ProgressBar
                progress={mode === 'learn' ? learnProgress : practiceProgress}
                color={mode === 'learn' ? 'emerald' : 'blue'}
              />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Script toggle */}
        <div className="flex justify-center mb-6">
          <ScriptToggle />
        </div>

        {/* Learn Mode */}
        {mode === 'learn' && currentLearnWord && (
          <div>
            {/* Word card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <p
                className={`
                  text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4
                  ${settings.script === 'arabic' ? 'font-arabic' : ''}
                  ${settings.script === 'ethiopic' ? 'font-ethiopic' : ''}
                `}
                dir={settings.script === 'arabic' ? 'rtl' : 'ltr'}
              >
                {getWordInScript(currentLearnWord, settings.script)}
              </p>
              <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">
                {currentLearnWord.english}
              </p>
              <AudioButton audioUrl={currentLearnWord.audioUrl} size="lg" />

              {/* Show all scripts */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Latin</p>
                  <p className="text-gray-700 dark:text-gray-300">{currentLearnWord.harariLatin}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Ge'ez</p>
                  <p className="text-gray-700 dark:text-gray-300 font-ethiopic">{currentLearnWord.harariEthiopic}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Arabic</p>
                  <p className="text-gray-700 dark:text-gray-300 font-arabic" dir="rtl">{currentLearnWord.harariArabic}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePreviousLearnWord}
                disabled={learnIndex === 0}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={handleNextLearnWord}
                className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                {learnIndex === lessonWords.length - 1 ? 'Start Practice' : 'Next'}
              </button>
            </div>

            {/* Progress indicator */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {learnIndex + 1} of {lessonWords.length}
            </p>
          </div>
        )}

        {/* Practice Mode */}
        {mode === 'practice' && currentQuestion && (
          <div>
            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                What does this mean?
              </p>
              <p
                className={`
                  text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4
                  ${settings.script === 'arabic' ? 'font-arabic' : ''}
                  ${settings.script === 'ethiopic' ? 'font-ethiopic' : ''}
                `}
                dir={settings.script === 'arabic' ? 'rtl' : 'ltr'}
              >
                {getWordInScript(currentQuestion.word, settings.script)}
              </p>
              <AudioButton audioUrl={currentQuestion.word.audioUrl} size="md" />
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === answer;
                const isCorrect = answer === currentQuestion.correctAnswer;

                let buttonStyle = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-500';
                if (showResult) {
                  if (isCorrect) {
                    buttonStyle = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(answer)}
                    disabled={showResult}
                    className={`
                      w-full p-4 text-left rounded-xl border-2 transition-colors
                      ${buttonStyle}
                    `}
                  >
                    <span className="font-medium">{answer}</span>
                  </button>
                );
              })}
            </div>

            {/* Continue button */}
            {showResult && (
              <button
                onClick={handleNextQuestion}
                className="w-full mt-6 px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Continue
              </button>
            )}

            {/* Progress indicator */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Question {practiceIndex + 1} of {practiceQuestions.length}
            </p>
          </div>
        )}

        {/* Complete Mode */}
        {mode === 'complete' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Lesson Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You learned {lessonWords.length} new words
            </p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-8">
              {correctAnswers} of {practiceQuestions.length} correct
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Continue Learning
              </Link>
              <button
                onClick={() => {
                  setMode('learn');
                  setLearnIndex(0);
                  setPracticeIndex(0);
                  setCorrectAnswers(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Practice Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
