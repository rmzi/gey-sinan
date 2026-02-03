'use client';

import { useState } from 'react';
import { playAudio } from '@/lib/audio';

interface AudioButtonProps {
  audioUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AudioButton({ audioUrl, className = '', size = 'md' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      await playAudio(audioUrl);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPlaying}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full
        bg-emerald-100 dark:bg-emerald-900
        text-emerald-700 dark:text-emerald-300
        hover:bg-emerald-200 dark:hover:bg-emerald-800
        disabled:opacity-50
        transition-colors
        ${className}
      `}
      aria-label="Play pronunciation"
    >
      {isPlaying ? (
        <svg className={`${iconSizes[size]} animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
    </button>
  );
}
