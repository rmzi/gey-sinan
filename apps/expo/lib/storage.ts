import { UserProgress, ScriptType, LessonStatus, WordSRS } from './types';

export function getDefaultProgress(): UserProgress {
  return {
    lessonProgress: {
      'lesson-1-1': 'available', // First lesson is unlocked by default
    },
    wordProgress: {},
    streak: { current: 0, lastDate: '' },
    settings: { script: 'latin' },
  };
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const { lastDate, current } = progress.streak;

  if (lastDate === today) {
    // Already practiced today
    return progress;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = current;
  if (lastDate === yesterdayStr) {
    // Consecutive day
    newStreak = current + 1;
  } else if (lastDate !== today) {
    // Streak broken (or first time)
    newStreak = 1;
  }

  return {
    ...progress,
    streak: {
      current: newStreak,
      lastDate: today,
    },
  };
}

export function updateLessonProgress(
  progress: UserProgress,
  lessonId: string,
  status: LessonStatus
): UserProgress {
  return {
    ...progress,
    lessonProgress: {
      ...progress.lessonProgress,
      [lessonId]: status,
    },
  };
}

export function updateWordProgress(
  progress: UserProgress,
  wordId: string,
  wordSRS: WordSRS
): UserProgress {
  return {
    ...progress,
    wordProgress: {
      ...progress.wordProgress,
      [wordId]: wordSRS,
    },
  };
}

export function updateSettings(
  progress: UserProgress,
  script: ScriptType
): UserProgress {
  return {
    ...progress,
    settings: {
      ...progress.settings,
      script,
    },
  };
}
