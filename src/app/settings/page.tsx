'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScriptToggle from '@/components/ScriptToggle';
import { useProgress } from '@/stores/useProgress';

export default function SettingsPage() {
  const { settings, streak, getStats, getTotalWordsLearned } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = mounted ? getStats() : { new: 0, learning: 0, mastered: 0, dueToday: 0 };
  const totalWords = mounted ? getTotalWordsLearned() : 0;

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('geysinan-progress');
      window.location.reload();
    }
  };

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
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
            <div className="w-6" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Script Selection */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Writing System
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Choose which script to display Harari words in
          </p>
          <ScriptToggle />
        </section>

        {/* Stats */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Your Statistics
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {streak.current} days
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Words Learned</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {totalWords}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">New Words</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {stats.new}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Learning</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {stats.learning}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Mastered</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.mastered}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Due for Review</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {stats.dueToday}
              </span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            About Gey Sinan
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Gey Sinan means "our home" in Harari. This app is designed to help Harari diaspora youth
            reconnect with their ancestral language through interactive lessons and spaced repetition.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Harari is an endangered Semitic language spoken in the ancient walled city of Harar, Ethiopia,
            and by diaspora communities worldwide.
          </p>
        </section>

        {/* Reset */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Data
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Your progress is stored locally on your device.
          </p>
          <button
            onClick={handleResetProgress}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Reset All Progress
          </button>
        </section>
      </main>
    </div>
  );
}
