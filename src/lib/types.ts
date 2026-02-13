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

// Recording Station types
export type FluencyLevel = 'native' | 'fluent' | 'partial' | 'heritage';
export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type RecordingMode = 'word' | 'phrase';

export interface Speaker {
  id: string;
  name: string;
  ageRange: AgeRange;
  gender: Gender;
  fluencyLevel: FluencyLevel;
  dialectNotes: string;
  consent: {
    appUse: boolean;
    languagePreservation: boolean;
    mlTraining: boolean;
    attribution: 'name' | 'anonymous';
    timestamp: string; // ISO date
  };
  createdAt: string;
}

export interface Recording {
  id: string;
  speakerId: string;
  targetId: string; // wordId or phraseId
  mode: RecordingMode;
  blob: Blob;
  mimeType: string;
  sampleRate: number;
  duration: number; // seconds
  quality: {
    peakAmplitude: number;
    clipping: boolean;
    tooQuiet: boolean;
  };
  createdAt: string;
}

export interface Phrase {
  id: string;
  harariLatin: string;
  harariEthiopic: string;
  harariArabic: string;
  english: string;
  category: string;
  wordIds: string[]; // component words for later segmentation
}

export type ExerciseType = 'multiple_choice' | 'matching' | 'listening' | 'script_matching' | 'production';
