'use client';

import Link from 'next/link';
import { Lesson, LessonStatus } from '@/lib/types';
import { useProgress } from '@/stores/useProgress';

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const { getLessonStatus } = useProgress();
  const status = getLessonStatus(lesson.id);

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const statusStyles = {
    locked: 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed',
    available: 'bg-white dark:bg-gray-800 hover:shadow-md cursor-pointer',
    in_progress: 'bg-emerald-50 dark:bg-emerald-900/20 hover:shadow-md cursor-pointer border-l-4 border-emerald-500',
    completed: 'bg-gray-50 dark:bg-gray-800 hover:shadow-md cursor-pointer',
  };

  const content = (
    <div
      className={`
        relative p-4 rounded-xl shadow-sm transition-all
        ${statusStyles[status]}
      `}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {lesson.unit}.{lesson.order}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {lesson.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {lesson.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {lesson.wordIds.length} words
          </p>
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/learn/${lesson.id}`}>
      {content}
    </Link>
  );
}
