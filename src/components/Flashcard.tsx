'use client';

import { useState } from 'react';
import { Word, ScriptType } from '@/lib/types';
import AudioButton from './AudioButton';
import { useProgress } from '@/stores/useProgress';

interface FlashcardProps {
  word: Word;
  showEnglishFirst?: boolean;
  onReview?: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

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

export default function Flashcard({ word, showEnglishFirst = false, onReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { settings } = useProgress();

  const frontText = showEnglishFirst ? word.english : getWordInScript(word, settings.script);
  const backText = showEnglishFirst ? getWordInScript(word, settings.script) : word.english;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleQualityRating = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (onReview) {
      onReview(quality);
    }
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`
            absolute inset-0 w-full h-full transition-transform duration-500
            transform-style-preserve-3d
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <div
            className={`
              absolute inset-0 w-full h-full
              bg-white dark:bg-gray-800
              rounded-2xl shadow-lg
              flex flex-col items-center justify-center
              p-6
              backface-hidden
            `}
          >
            <p
              className={`
                text-3xl font-semibold text-center text-gray-900 dark:text-gray-100
                ${settings.script === 'arabic' ? 'font-arabic' : ''}
                ${settings.script === 'ethiopic' ? 'font-ethiopic' : ''}
              `}
              dir={settings.script === 'arabic' && !showEnglishFirst ? 'rtl' : 'ltr'}
            >
              {frontText}
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Tap to reveal
            </p>
          </div>

          {/* Back */}
          <div
            className={`
              absolute inset-0 w-full h-full
              bg-emerald-50 dark:bg-emerald-900/20
              rounded-2xl shadow-lg
              flex flex-col items-center justify-center
              p-6
              backface-hidden
              rotate-y-180
            `}
          >
            <p
              className={`
                text-3xl font-semibold text-center text-gray-900 dark:text-gray-100
                ${settings.script === 'arabic' && showEnglishFirst ? 'font-arabic' : ''}
                ${settings.script === 'ethiopic' && showEnglishFirst ? 'font-ethiopic' : ''}
              `}
              dir={settings.script === 'arabic' && showEnglishFirst ? 'rtl' : 'ltr'}
            >
              {backText}
            </p>
            <div className="mt-4">
              <AudioButton audioUrl={word.audioUrl} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons - shown when flipped and onReview is provided */}
      {isFlipped && onReview && (
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            How well did you remember?
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleQualityRating(0); }}
              className="px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              Again
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleQualityRating(3); }}
              className="px-4 py-2 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"
            >
              Hard
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleQualityRating(4); }}
              className="px-4 py-2 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
            >
              Good
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleQualityRating(5); }}
              className="px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              Easy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
