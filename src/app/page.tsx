'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import LessonCard from '@/components/LessonCard';
import { useProgress } from '@/stores/useProgress';
import { Lesson } from '@/lib/types';
import lessonsData from '@/data/lessons.json';

const allLessons = lessonsData as Lesson[];

// Group lessons by unit
function groupByUnit(lessons: Lesson[]): Record<number, Lesson[]> {
  return lessons.reduce((acc, lesson) => {
    if (!acc[lesson.unit]) {
      acc[lesson.unit] = [];
    }
    acc[lesson.unit].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);
}

const unitTitles: Record<number, string> = {
  1: 'Greetings & Introductions',
  2: 'Family Terms',
  3: 'Numbers & Counting',
  4: 'Colors & Descriptions',
  5: 'Food & Drink',
  6: 'Body Parts',
  7: 'Common Verbs',
  8: 'Home & Places',
  9: 'Time & Days',
  10: 'Common Phrases',
};

export default function Home() {
  const { streak, getStats, getTotalWordsLearned, getWordsDue } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!mounted) return { new: 0, learning: 0, mastered: 0, dueToday: 0 };
    return getStats();
  }, [mounted, getStats]);

  const totalWordsLearned = useMemo(() => {
    if (!mounted) return 0;
    return getTotalWordsLearned();
  }, [mounted, getTotalWordsLearned]);

  const wordsDueCount = useMemo(() => {
    if (!mounted) return 0;
    return getWordsDue().length;
  }, [mounted, getWordsDue]);

  const lessonsByUnit = useMemo(() => groupByUnit(allLessons), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                Gey Sinan
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Learn Harari
              </p>
            </div>
            <Link
              href="/settings"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {streak.current}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Day streak
                </p>
              </div>
            </div>
          </div>

          {/* Words learned */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalWordsLearned}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Words learned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Review button */}
        {wordsDueCount > 0 && (
          <Link
            href="/practice"
            className="block mb-6 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="font-semibold">Review words</p>
                <p className="text-sm text-emerald-100">
                  {wordsDueCount} words due for review
                </p>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Word stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Your Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {stats.new}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">New</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {stats.learning}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Learning</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.mastered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mastered</p>
            </div>
          </div>
        </div>

        {/* Lessons by unit */}
        <div className="space-y-6">
          {Object.entries(lessonsByUnit).map(([unit, lessons]) => (
            <div key={unit}>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Unit {unit}: {unitTitles[Number(unit)]}
              </h2>
              <div className="space-y-3">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick practice button */}
        <div className="fixed bottom-6 right-6">
          <Link
            href="/practice"
            className="flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
