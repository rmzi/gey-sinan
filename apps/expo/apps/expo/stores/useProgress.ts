import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';
import {
  UserProgress,
  ScriptType,
  LessonStatus,
  WordSRS,
  ReviewQuality
} from '@/lib/types';
import {
  getInitialSRS,
  calculateNextReview,
  getWordsDueForReview,
  getReviewStats
} from '@/lib/srs';
import { getDefaultProgress } from '@/lib/storage';
import lessonsData from '@/data/lessons.json';
import { Lesson } from '@/lib/types';

const lessons = lessonsData as Lesson[];

const mmkvInstance = new MMKV();

const mmkvStorage: StateStorage = {
  setItem: (name, value) => mmkvInstance.set(name, value),
  getItem: (name) => mmkvInstance.getString(name) ?? null,
  removeItem: (name) => mmkvInstance.delete(name),
};

interface ProgressStore extends UserProgress {
  // Actions
  setScript: (script: ScriptType) => void;
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;
  reviewWord: (wordId: string, quality: ReviewQuality) => void;
  initializeWordProgress: (wordIds: string[]) => void;
  updateStreak: () => void;

  // Computed
  getWordsDue: () => string[];
  getStats: () => { new: number; learning: number; mastered: number; dueToday: number };
  getTotalWordsLearned: () => number;
  getLessonStatus: (lessonId: string) => LessonStatus;
  isLessonUnlocked: (lessonId: string) => boolean;
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...getDefaultProgress(),

      // Actions
      setScript: (script) => set((state) => ({
        settings: { ...state.settings, script }
      })),

      startLesson: (lessonId) => set((state) => ({
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: 'in_progress',
        }
      })),

      completeLesson: (lessonId) => set((state) => {
        const newProgress = { ...state.lessonProgress, [lessonId]: 'completed' as LessonStatus };

        // Find the next lesson and unlock it
        const currentLesson = lessons.find(l => l.id === lessonId);
        if (currentLesson) {
          const nextLesson = lessons.find(l =>
            l.unit === currentLesson.unit && l.order === currentLesson.order + 1
          ) || lessons.find(l =>
            l.unit === currentLesson.unit + 1 && l.order === 1
          );

          if (nextLesson && !newProgress[nextLesson.id]) {
            newProgress[nextLesson.id] = 'available';
          }
        }

        return { lessonProgress: newProgress };
      }),

      reviewWord: (wordId, quality) => set((state) => {
        const currentSRS = state.wordProgress[wordId] || getInitialSRS();
        const newSRS = calculateNextReview(currentSRS, quality);

        return {
          wordProgress: {
            ...state.wordProgress,
            [wordId]: newSRS,
          }
        };
      }),

      initializeWordProgress: (wordIds) => set((state) => {
        const newWordProgress = { ...state.wordProgress };
        wordIds.forEach(wordId => {
          if (!newWordProgress[wordId]) {
            newWordProgress[wordId] = getInitialSRS();
          }
        });
        return { wordProgress: newWordProgress };
      }),

      updateStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const { lastDate, current } = state.streak;

        if (lastDate === today) {
          return state;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = current;
        if (lastDate === yesterdayStr) {
          newStreak = current + 1;
        } else {
          newStreak = 1;
        }

        return {
          streak: {
            current: newStreak,
            lastDate: today,
          }
        };
      }),

      // Computed getters
      getWordsDue: () => {
        const { wordProgress } = get();
        return getWordsDueForReview(wordProgress);
      },

      getStats: () => {
        const { wordProgress } = get();
        return getReviewStats(wordProgress);
      },

      getTotalWordsLearned: () => {
        const { wordProgress } = get();
        return Object.values(wordProgress).filter(
          srs => srs.status === 'learning' || srs.status === 'mastered'
        ).length;
      },

      getLessonStatus: (lessonId) => {
        const { lessonProgress } = get();
        return lessonProgress[lessonId] || 'available';  // DEV: all lessons unlocked
      },

      isLessonUnlocked: (_lessonId) => {
        return true;  // DEV: all lessons unlocked
      },
    }),
    {
      name: 'geysinan-progress',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
