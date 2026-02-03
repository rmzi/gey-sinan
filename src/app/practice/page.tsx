'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Flashcard from '@/components/Flashcard';
import ScriptToggle from '@/components/ScriptToggle';
import ProgressBar from '@/components/ProgressBar';
import { useProgress } from '@/stores/useProgress';
import { ReviewQuality, Word } from '@/lib/types';
import wordsData from '@/data/words.json';

const allWords = wordsData as Word[];

export default function PracticePage() {
  const { getWordsDue, reviewWord, updateStreak, wordProgress, initializeWordProgress } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Get words due for review
      let dueWords = getWordsDue();

      // If no words due, get all words that have been learned
      if (dueWords.length === 0) {
        dueWords = Object.keys(wordProgress);
      }

      // If still no words, show new words
      if (dueWords.length === 0) {
        const newWordIds = allWords.slice(0, 10).map(w => w.id);
        initializeWordProgress(newWordIds);
        dueWords = newWordIds;
      }

      // Shuffle the words
      const shuffled = [...dueWords].sort(() => Math.random() - 0.5);
      setSessionWords(shuffled);
    }
  }, [mounted, getWordsDue, wordProgress, initializeWordProgress]);

  const currentWord = useMemo(() => {
    if (sessionWords.length === 0 || currentIndex >= sessionWords.length) return null;
    const wordId = sessionWords[currentIndex];
    return allWords.find(w => w.id === wordId) || null;
  }, [sessionWords, currentIndex]);

  const handleReview = (quality: ReviewQuality) => {
    if (!currentWord) return;

    reviewWord(currentWord.id, quality);
    updateStreak();
    setReviewed(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const isComplete = currentIndex >= sessionWords.length;
  const progress = sessionWords.length > 0 ? (reviewed / sessionWords.length) * 100 : 0;

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Review
            </h1>
            <div className="w-6" />
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{reviewed} reviewed</span>
              <span>{sessionWords.length - currentIndex} remaining</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Script toggle */}
        <div className="flex justify-center mb-6">
          <ScriptToggle />
        </div>

        {isComplete ? (
          /* Session complete */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You reviewed {reviewed} words
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setReviewed(0);
                  const shuffled = [...sessionWords].sort(() => Math.random() - 0.5);
                  setSessionWords(shuffled);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Practice Again
              </button>
            </div>
          </div>
        ) : currentWord ? (
          /* Current card */
          <Flashcard
            word={currentWord}
            onReview={handleReview}
          />
        ) : (
          /* No words to review */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No words to review
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a lesson to learn new words!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Go to Lessons
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
