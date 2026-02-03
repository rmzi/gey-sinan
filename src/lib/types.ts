// Vocabulary
export interface Word {
  id: string;
  harariLatin: string;      // Latin script
  harariEthiopic: string;   // Ge'ez script
  harariArabic: string;     // Arabic script
  english: string;
  audioUrl: string;
  category: string;
  difficulty: 1 | 2 | 3;
}

// Exercise types
export type ExerciseType = 'multiple_choice' | 'matching' | 'listening';

export interface Exercise {
  type: ExerciseType;
  wordIds: string[];
}

// Lesson
export interface Lesson {
  id: string;
  unit: number;
  order: number;
  title: string;
  description: string;
  wordIds: string[];
  exercises: Exercise[];
}

// Lesson status
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// User Progress (stored locally)
export interface UserProgress {
  lessonProgress: Record<string, LessonStatus>;
  wordProgress: Record<string, WordSRS>;
  streak: { current: number; lastDate: string };
  settings: { script: ScriptType };
}

// Script types
export type ScriptType = 'latin' | 'ethiopic' | 'arabic';

// Spaced Repetition
export interface WordSRS {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO date
  status: 'new' | 'learning' | 'mastered';
}

// Review quality rating (SM-2 algorithm)
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
