import { WordSRS, ReviewQuality } from './types';

// SM-2 Spaced Repetition Algorithm
// Quality ratings:
// 0 - Complete blackout, no memory
// 1 - Incorrect response, but remembered upon seeing correct answer
// 2 - Incorrect response, but correct answer seemed easy to recall
// 3 - Correct response with serious difficulty
// 4 - Correct response after hesitation
// 5 - Perfect response with no hesitation

export function getInitialSRS(): WordSRS {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString(),
    status: 'new',
  };
}

export function calculateNextReview(current: WordSRS, quality: ReviewQuality): WordSRS {
  let { easeFactor, interval, repetitions } = current;

  // If quality < 3, reset repetitions (failed recall)
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor should not go below 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  // Determine status
  let status: WordSRS['status'] = 'learning';
  if (repetitions >= 3 && interval >= 21) {
    status = 'mastered';
  }

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextReviewDate.toISOString(),
    status,
  };
}

export function isDueForReview(wordSRS: WordSRS): boolean {
  const now = new Date();
  const nextReview = new Date(wordSRS.nextReview);
  return now >= nextReview;
}

export function getWordsDueForReview(wordProgress: Record<string, WordSRS>): string[] {
  return Object.entries(wordProgress)
    .filter(([, srs]) => isDueForReview(srs))
    .map(([wordId]) => wordId);
}

export function getReviewStats(wordProgress: Record<string, WordSRS>) {
  const stats = {
    new: 0,
    learning: 0,
    mastered: 0,
    dueToday: 0,
  };

  Object.values(wordProgress).forEach((srs) => {
    stats[srs.status]++;
    if (isDueForReview(srs)) {
      stats.dueToday++;
    }
  });

  return stats;
}
